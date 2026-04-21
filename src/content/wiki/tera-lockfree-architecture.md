---
title: "Tera Lock-Free MMO 서버 아키텍처"
description: "Free-targeting MMO 전투의 collision 판정 부하를 lock 없이 처리하기 위해, world를 thread-local에 복제(front-end)하고 creature마다 actor 큐를 두는(back-end) 2단계 lock-free 모델"
tags: ["game-dev", "server", "mmo", "concurrency", "lock-free", "tera"]
publishDate: 2026-04-21
updatedDate: 2026-04-21
sources: ["blog:tera-server-lockfree"]
draft: false
---

## 문제 정의

| 항목 | 전통 MMO | Free-targeting (Tera) |
|------|----------|----------------------|
| 타겟 결정 | 스킬 시전 시 1회 | 스킬 지속 동안 N회 |
| 판정 단위 | 1:1 거리·통계 | collision volume × cylinder 겹침 |
| 서버 부하 | 가벼운 1:1 산수 | 초당 수만 건 공간 탐색 + 판정 |

스킬 XML이 `TargetingSequence` 안에 시간별 `Targeting` 항목을 가지며, 각 시점마다 collision 검사가 돈다. 한 스킬당 보통 2~10여 회.

## Lock 모델의 한계

순진한 구현:

```cpp
enemy->EnterCriticalSection();
enemy->DoDamage(200);
enemy->LeaveCriticalSection();
```

Bluehole 측정: lock 기반 알고리즘이 **3000명 동접에서 CPU 100%**.

병목은 두 영역에 갈린다.

| 영역 | 성격 | 병목 |
|------|------|------|
| Front-end | 공간 탐색 (read-heavy) | world 공유 자료구조 read 경쟁 |
| Back-end | HP/MP/버프 갱신 (write-heavy) | 동일 creature lock contention |

성격이 다르므로 전략도 다르다.

## Front-end — TLS World Replication

Seamless world를 정사각 cluster로 분할. 각 worker thread가 cluster 정보를 **통째로 자기 TLS에 복제**해서 들고 다닌다 (`__declspec(thread)`).

읽기는 lock 없이 자기 TLS만 본다.

### 동기화 절차

1. Creature 이동 발생 시 "cluster 31 → 32" delta를 **global lock-free 원형 큐**에 push
2. 모든 worker thread가 매 loop마다 큐를 읽어 자기 TLS 갱신
3. 각 task에 thread 수만큼 reference count 부여
4. 처리한 thread가 `InterlockedDecrement`로 감소
5. 카운트 0 → 마지막 thread가 큐에서 제거

### 트레이드오프

| 연산 | 비용 |
|------|------|
| 읽기 (공간 탐색) | 공짜 |
| 쓰기 (cluster 이동) | thread 수 N배 |

Free-targeting hot path에서 읽기 >> 쓰기이므로 정당화됨.

## Back-end — Per-Creature Lock-Free Executor

Creature마다 자기 task queue를 보유. 외부에서 오는 모든 쓰기는 직접 호출이 아닌 **task enqueue**로 변환.

```cpp
enemy->LockFreeExecutor.DoTask(&Creature::DoDamage, 200);
```

Creature는 자기 큐에 쌓인 task를 **순서대로 직렬 실행**. 어떤 순간에도 한 thread만 그 creature 상태를 만진다. → [[actor-model]]과 본질이 같다.

### 시그니처 제약

| 항목 | 제약 |
|------|------|
| Return type | void만 (비동기 실행) |
| 반환값 필요 시 | 콜백 task를 역으로 enqueue (Active Object 패턴) |

```cpp
// monster → player 데미지, 결과 HP를 monster가 받고 싶다면
player->Executor.DoTask(&Player::DoDamageAndNotify, {200, monster});
// Player 쪽에서 monster->Executor.DoTask(&Monster::ReceiveHitPoints, hp)
```

## 성능 결과

| 모델 | 동접 | CPU |
|------|------|-----|
| Lock 기반 | 3000명 | 100% |
| 2단계 Lock-Free | 6000명 | 1~6% |

같은 하드웨어 (Intel Xeon E5630), 같은 게임 로직, 구조만 변경. **약 1/20 부하**.

병목 메커니즘:

- Lock contention 비용은 연산이 아니라 **cache line ping-pong + scheduling overhead**
- Read-heavy 영역의 lock-free 전환 → thread 간 대기 제거
- Write-heavy 영역의 enqueue 전환 → 직렬 실행으로 contention 자체 소멸

## 일반 원칙

> Lock 세분화로 풀리지 않는 contention은 **read/write 비율을 보고 한쪽을 공짜로 만든다.**

| 비율 | 전략 |
|------|------|
| Read 압도적 | 데이터 복제 (TLS / per-thread) |
| Write 압도적 | per-object actor (큐 직렬화) |

Tera는 두 영역에 각각 적용한 사례.

## 관련

- 블로그: [[tera-server-lockfree]] 원문 글
- 관련 패턴: [[precomputed-timeline-dispatch]] — 같은 free-targeting 전투의 클라 동기화 축
- 관련 구조: [[observable-range-sync]] — TLS 복제 + delta 전파를 Grid 동기화에 적용한 사례 (프라시아전기)
- 관련 개념: [[game-server-request-context]] — 단일 thread 처리 흐름의 컨텍스트 전파
- 출처: Seungmo Koo, "How TERA Implements Free-Targeting Combat", *Game Developer*, May 2012
