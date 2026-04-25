---
title: "액션 MMO 서버가 Lock을 버린 이유 — Tera의 선택"
description: "타겟팅 없는 AoE 전투는 collision 판정을 초당 수십 번 돌린다. Lock을 쓰면 3000명에서 CPU 100%가 된다. Tera는 world를 TLS에 복제하고, creature마다 Lock-Free Executor로 갈아탔다."
publishDate: 2026-04-21
tags: ["game-dev", "server", "mmo", "concurrency", "lock-free", "tera"]
draft: false
---

2012년에 Bluehole이 공개한 Tera 서버 아키텍처 글을 다시 읽으니, 지금 봐도 재미있는 포인트들이 있다. 한 줄로 요약하면 이렇다 — **free-targeting 전투는 기존 MMO의 Lock 모델로는 불가능하다. 그래서 world를 전부 thread-local에 복제했다.**

## 기존 MMO는 한 번의 판정으로 끝난다

전통적인 MMO 전투는 타겟팅 기반이다. 스킬을 쓰면 지정된 타겟에 대해 거리·방향 한 번 계산하고, hit/miss·crit·dodge 같은 통계값으로 결과를 뽑는다. 서버가 하는 일은 가벼운 1:1 산수다.

Tera는 타겟이 없다. 대신 스킬마다 **시간에 따라 움직이는 collision volume**이 있고, 그 부피와 상대 cylinder가 겹치는지를 **스킬 지속 시간 동안 여러 번** 판정한다. 스킬 XML이 이렇게 생겼다.

```xml
<Skill id="10101">
  <TargetingSequence>
    <Targeting time="500" collisionVolume="...">
      <SkillEffect damage="200" .../>
    </Targeting>
    <Targeting time="650" collisionVolume="...">
      <SkillEffect damage="150" .../>
    </Targeting>
  </TargetingSequence>
</Skill>
```

500ms, 650ms에 각각 판정을 돌린다. 스킬 하나가 2~10여 개 targeting time을 갖는다. 플레이어 수만 명이 동시에 스킬을 쏘면 서버는 초당 수만 번의 공간 탐색과 collision 검사를 돌려야 한다.

## Lock을 쓰면 게임이 안 된다

순진하게 구현하면 이렇게 된다.

```cpp
enemy->EnterCriticalSection();
enemy->DoDamage(200);
enemy->LeaveCriticalSection();
```

한 enemy를 여러 attacker가 동시에 때리는 상황(레이드 보스) — 수십 개 worker thread가 같은 creature의 lock을 물고 줄을 선다. Bluehole 팀이 실제로 테스트한 결과, lock 기반 알고리즘은 **3000명에서 CPU 100%**에 도달했다고 한다. Free-targeting은 불가능했다.

원인은 두 군데다.

- **Front-end (공간 탐색)** — "내 주위 cell에 누가 있나"를 매 targeting time마다 조회한다. World 상태를 하나의 공유 자료구조로 두면 읽기조차 경쟁이 된다
- **Back-end (효과 적용)** — HP·MP·버프를 고치는 쓰기. 같은 creature를 동시에 여러 thread가 때리면 lock contention이 극심해진다

두 영역의 성격이 다르다. 하나는 읽기 중심, 하나는 쓰기 중심. 각각 다른 전략이 필요하다.

## Front-end: world를 thread마다 통째로 복제한다

Tera는 seamless world를 정사각형 cluster로 쪼갠다. 모든 creature는 자기가 속한 cluster의 container에 포인터로 등록된다. "A 주변 10m 안에 누가 있냐"는 질문은 주변 cluster 몇 개를 훑으면 끝난다.

여기서 재미있는 선택 — **cluster 정보를 worker thread마다 전부 복제**한다. `__declspec(thread)` TLS(thread-local storage)로 각 thread가 자기 사본을 들고 있다. 읽을 때는 lock이 전혀 없다. 자기 TLS만 보면 된다.

문제는 동기화다. Creature가 cluster 31에서 32로 이동하면 모든 thread의 cluster 정보를 똑같이 업데이트해야 한다. 방법은 이렇다.

1. 누군가 "cluster 31에서 32로 이동" delta를 **global lock-free 원형 큐**에 push
2. 모든 worker thread가 매 loop마다 이 큐를 읽어 자기 TLS를 업데이트
3. 각 task에 reference count를 달아둠. Thread 수만큼 세팅. 한 thread가 처리할 때마다 `InterlockedDecrement`로 감소
4. 카운트가 0이 되면 마지막 thread가 task를 큐에서 제거

읽기는 공짜, 쓰기는 N배 비싸다(thread 수만큼 반복). 하지만 free-targeting에서는 **읽기가 쓰기보다 훨씬 많다**. 공간 탐색은 매 공격마다 일어나지만, cluster 이동은 creature가 실제로 cell을 넘나들 때만 난다. 트레이드오프가 맞다.

## Back-end: creature마다 Lock-Free Executor를 붙인다

Back-end는 쓰기다. 한 enemy에 여러 attacker의 데미지가 동시에 꽂힌다. 여기서 Tera는 **creature마다 자기 task queue**를 준다. Lock-Free Executor라고 부른다.

```cpp
enemy->LockFreeExecutor.DoTask(&Creature::DoDamage, 200);
```

직접 `DoDamage(200)`을 호출하지 않고, "200 데미지 받기"라는 task를 enemy의 큐에 등록한다. Enemy는 자기 task를 **순서대로 하나씩** 실행한다. 어떤 순간에도 enemy의 상태는 한 thread만 만진다.

구조를 그림으로 보면 — 각 creature가 actor가 된다. 외부에서 오는 모든 쓰기는 메시지로 enqueue. 실행은 해당 creature가 "자기를 처리하는 thread"에 올라탔을 때 한 번에 flush. Actor model과 본질이 같다.

함수 시그니처에 제약이 있다 — **return type은 void만**. 비동기 실행이니 반환값을 즉시 줄 수 없다. 반환이 필요하면 Active Object 패턴처럼 콜백용 task를 역으로 등록한다.

```cpp
// monster가 player에게 데미지, 반환된 HP를 받고 싶다면
player->Executor.DoTask(&Player::DoDamageAndNotify, {200, monster});
// Player 쪽에서 monster->Executor.DoTask(&Monster::ReceiveHitPoints, hp)로 콜백
```

투박하지만 lock이 없다. 중요한 건 이 점이다.

## 결과: 1/20

Lock 기반에서 3000명 CPU 100%였던 것이, two-stage lock-free 구조에서는 **6000명 동접에 CPU 1~6%**로 떨어졌다(Intel Xeon E5630 기준). 같은 하드웨어, 같은 게임 로직, 구조만 바꿔서 1/20 수준이다.

숫자만 보면 과장 같지만 메커니즘은 명확하다.

- Lock contention이 CPU 사이클을 태우는 건 실제 연산이 아니라 **cache line ping-pong**과 **scheduling overhead**다. Contention이 사라지면 thread가 순수 연산만 한다
- Read-heavy 영역(front-end)에서 lock-free가 되면 thread가 서로를 전혀 기다리지 않는다
- Write-heavy 영역(back-end)에서도 lock 대신 enqueue로 바뀌니, 각 creature는 자기 작업을 그냥 직렬 실행하면 된다

## 왜 이 글을 다시 꺼냈나

요즘은 Go/Erlang/Rust 같은 언어가 actor나 channel을 기본 문법으로 들고 있어서, Tera의 Lock-Free Executor가 특별해 보이지 않을 수 있다. 하지만 2012년에 C++와 Windows IOCP만 가지고 직접 이 구조를 만들어 냈다는 점, 그리고 **문제를 "lock을 얼마나 잘 잡을까"가 아니라 "lock 자체를 없애자"로 프레임한 점**이 지금 봐도 인상적이다.

핵심 판단은 결국 하나다 — free-targeting 전투의 hot path에서 읽기와 쓰기의 비율이 어떻게 되는가. 읽기가 압도적으로 많다. 그러면 읽기를 완전히 공짜로 만들어야 한다. 쓰기는 N배 비싸져도 상관없다. 이 관찰이 "world를 TLS에 복제한다"는, 다른 문맥에선 미친 소리 같은 결정을 정당화한다.

## Takeaway

Lock 기반 설계의 성능 문제는 "lock을 더 세밀하게 쪼개자"로 해결되지 않는 때가 있다. 그럴 땐 read/write 비율을 다시 보고, 한쪽을 완전히 공짜로 만드는 방향을 생각해 본다. Read가 많으면 복제, write가 많으면 per-object actor. Tera는 두 가지를 같이 썼다.

출처: Seungmo Koo, "How TERA Implements Free-Targeting Combat", *Game Developer*, May 2012.
