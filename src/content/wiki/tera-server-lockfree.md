---
title: "Tera 서버의 Lock-Free 전투 처리"
description: "Free-targeting MMO 전투에서 lock contention을 제거하기 위한 TLS 복제 + per-creature actor 패턴"
tags: ["game-dev", "server", "mmo", "concurrency", "lock-free", "tera"]
publishDate: 2026-04-21
updatedDate: 2026-04-21
sources: ["blog:tera-server-lockfree"]
draft: false
---

## 배경: Free-targeting 전투의 부하 특성

| 항목 | 기존 타겟팅 MMO | Free-targeting (Tera) |
|------|----------------|----------------------|
| Hit 판정 | 스킬당 1회 | 스킬당 N회 (2~10+ targeting time) |
| 판정 방법 | 거리·방향 + hit/miss 통계 | collision volume × cylinder 교차 |
| 서버 연산 | 가벼운 1:1 | 공간 탐색 + 다회 collision |
| 실패 시 증상 | — | Lock contention으로 CPU 100% |

## 핵심 데이터 구조

| 용어 | 정의 |
|------|------|
| Cylinder | 모든 creature(PC, 몬스터, 오브젝트)의 collision 표현 |
| Timed Collision Volume | 스킬의 무기 궤적을 시간축에 따라 표현한 3D 부피 |
| Targeting Time | 스킬 내 collision 판정을 돌리는 시각 (ms) |
| Cluster | 월드를 정사각형으로 쪼갠 공간 단위. creature 포인터의 container |
| Cluster Update Queue | Global lock-free 원형 큐. cluster 변경 delta를 담음 |
| Lock-Free Executor (LFE) | Creature별 task queue. Actor model과 동일한 역할 |

## Two-Stage Processing

각 targeting time마다 두 단계로 처리한다.

| Stage | 역할 | 연산 성격 |
|-------|------|----------|
| Front-end | collision volume과 교차하는 target 수집 | 공간 탐색(읽기 중심) |
| Back-end | 수집된 target에 damage/heal/buff 적용 | 속성 변경(쓰기 중심) |

두 stage의 성격이 달라서 lock-free 전략도 각자 다르다.

## Worker Thread 모델 (Symmetric Worker Thread Pattern)

- Thread pool 크기 = CPU core 수
- 모든 worker thread가 모든 종류의 task를 처리 (특정 content/area 전담 없음)
- 한 thread의 loop:
  ```
  while (1) {
      IoCompletionPortTask();  // IOCP 기반 패킷 처리
      TimerTask();             // 예약 작업
      ClusterTask();           // cluster 정보 동기화
  }
  ```
- Thread 간 block 없음 → core 수·속도가 성능에 직접 반영

## Front-end: Cluster 정보를 TLS로 복제

**원리**: cluster 전체 상태를 worker thread마다 TLS(`__declspec(thread)`)에 완전 복제. 읽기는 lock 없이 자기 사본만 조회.

**이동 전파 절차**:

1. Creature가 cluster 이동 시 delta task 생성 (예: "creature 28을 cluster 32 → 33")
2. Global lock-free 원형 큐에 push
3. 모든 worker thread가 매 loop마다 `ClusterTask()`에서 큐를 읽어 자기 TLS 업데이트
4. Task에 reference count = thread 수로 세팅
5. Thread가 처리할 때마다 `InterlockedDecrement`
6. 카운트 0이 된 순간 마지막 thread가 task를 큐에서 제거

**특성**:

| 항목 | 비용 |
|------|------|
| 읽기 | 공짜 (TLS 직접 조회, lock 없음) |
| 쓰기 | N배 (thread 수만큼 반영) |
| 적용 조건 | 읽기 >> 쓰기인 경우에만 이득 |

Free-targeting은 공간 탐색이 creature cluster 이동보다 훨씬 빈번하므로 성립.

## Back-end: Creature마다 Lock-Free Executor

**원리**: 각 creature가 자기 task queue를 소유. 외부의 모든 쓰기는 task로 enqueue. 직렬 실행.

```cpp
enemy->LockFreeExecutor.DoTask(&Creature::DoDamage, 200);
```

**구조**:

- Task = { target creature, member function pointer, argument }
- LFE는 내부에 lock-free task queue 보유 (M. Michael's non-blocking concurrent queue 변형)
- 한 순간 한 thread만 LFE를 점유 (`TLS_CurrentLfeOccupyingThisThread`)
- 점유 thread가 자기 LFE 소진 후, 이 thread에 등록된 다른 LFE들까지 연속 flush

**제약**: 멤버 함수 반환 타입은 `void`만 가능. 비동기 실행이라 즉시 반환값을 받을 수 없음.

**반환값이 필요한 경우**: Active Object 패턴으로 콜백 task 역등록.

```cpp
// 호출 측에서 return값을 받으려면
player->Executor.DoTask(&Player::DoDamageAndNotify, {damage: 200, callbackTo: monster});
// Player 내부에서 결과 계산 후:
monster->Executor.DoTask(&Monster::ReceiveHitPoints, hp);
```

## Lock 방식과의 비교 (Bluehole 실측)

| 구조 | 동접 | CPU 사용률 |
|------|------|-----------|
| Lock 기반 (critical section / spin) | 3000명 미만 | 100% |
| Two-stage lock-free | 1~6000명 | 1~6% (Intel Xeon E5630) |

약 1/20 수준. Contention이 사라지면서 cache line ping-pong과 scheduling overhead가 제거된 결과.

## 일반화 — Read/Write 비율에 따른 동시성 전략

| 패턴 | 조건 | 예시 |
|------|------|------|
| TLS 복제 + delta 전파 | Read >>> Write | 공간 쿼리, 정적 설정값, 시야 판정용 world snapshot |
| Per-object Actor (Task queue) | Write가 많고 per-object state가 독립 | Creature HP/MP 업데이트, 인벤토리 변경 |
| Lock 잘게 쪼개기 | Read·Write 비슷, fine-grained 분할 가능 | 채널/방 단위 상태 |
| Copy-on-write | Read >> Write + 읽기 중 일관성 중요 | 설정 테이블 hot-reload |

## 적용 범위 확장

Lock-Free Executor는 back-end stage 외에도 다음에 쓸 수 있다.

- `IoCompletionPortTask()` 내부에서 다른 creature의 속성을 바꿀 때
- `TimerTask()`에서 예약 작업이 다른 creature에 접근할 때

즉 "어떤 creature의 상태를 바꾸는 모든 호출"을 LFE로 통일하면 creature는 영원히 lock을 볼 일이 없다.

## 일반화된 교훈

- Lock 기반 설계의 CPU 100% 증상은 "lock을 더 세밀하게 쪼개자"로 풀리지 않는 때가 있다. 그럴 땐 **read/write 비율을 먼저 보고, 한쪽을 공짜로 만드는 쪽**을 생각한다.
- TLS 복제는 "world snapshot"처럼 모든 thread가 같은 정보를 자주 읽어야 하는 상황에서 유효. 전파 비용이 커지더라도 읽기가 그보다 훨씬 많으면 이득.
- Per-object Lock-Free Executor는 actor model의 구체적 구현. 언어·런타임 지원 없이도 C++ + 플랫폼 atomic primitives로 구현 가능.
- 반환값을 포기하고 callback task로 바꾸는 설계는 호출부 코드를 복잡하게 만들지만, 그 대가로 lock contention을 완전히 없앨 수 있다.

## 출처

Seungmo Koo (Bluehole Studio). "How TERA Implements Free-Targeting Combat". *Game Developer* magazine, May 2012.

## 관련

- 블로그: [[tera-server-lockfree]] 원문 글
- 관련 주제: [[observable-range-sync]] — 유사한 TLS 복제 + delta 전파 구조 (프라시아전기 Grid 동기화)
