---
title: "ObservableRange 이벤트 동기화 패턴"
description: "멀티스레드 Grid에서 Entity 이동 시 Enter/Leave 이벤트가 중복·누락되는 원인과 두 가지 해결 구조"
tags: ["game-dev", "server", "mmo", "concurrency"]
publishDate: 2026-04-21
updatedDate: 2026-04-21
sources: ["blog:observable-range-sync"]
draft: false
---

## 핵심 개념

| 용어 | 정의 |
|------|------|
| Region | 큰 공간 단위. 내부에 Grid를 포함 |
| Grid | Region을 격자로 나눈 구조. Cell들의 집합 |
| Cell | 공간 최소 단위. 각 Entity가 어느 Cell에 속하는지 기록 |
| Entity / Player | 공간에 존재하는 객체. Player는 클라이언트가 붙은 Entity |
| ObservableRange | Entity 주변 몇 Cell 범위. 이 안의 Player에게만 상태 동기화 |
| SynchronizeAction | Cell 이동 등 Grid 상태 변경을 나타내는 단위. `EntityPushAction`, `EntityMigrateAction`, `EntityPopAction` 포함 |
| DataDepot | SynchronizeAction을 쌓는 큐. Thread가 Sync 시 참조 |

## 이벤트 발생 주체 규칙

이동한 쪽이 양쪽 이벤트를 모두 책임진다 (가만히 있는 Entity는 주변 변화를 폴링 없이 알 수 없기 때문).

| 이동 주체 | 대상 | 이벤트 |
|----------|------|--------|
| Entity (Player 포함) | 자기 자신 | 내 ObservableRange에서 제거/추가된 Cell의 Player에 대해 `OnLeave/OnEnterObservableRange` |
| Player | 상대 | 상대의 ObservableRange에서 내가 제거/추가되었음을 `entity.OnLeave/OnEnterObservableRange(me)` |

## Grid 동기화 구조 (기본)

- Grid는 **Thread-Local** 복제본으로 각 Thread가 보유
- Cell 이동 등 변경은 `SynchronizeAction`으로 만들어 DataDepot에 propagate
- 각 Thread는 `ConcurrentTaskScheduler`에서 Task 실행 **직전에 Sync**
- Task가 없으면 Sync + 1ms Sleep으로 DataDepot 큐를 비움

장점: Lock 없이 병렬 처리.
단점: 동시 이동 시점에 Thread들이 서로 다른 시점의 Grid를 본다.

## Entity 위치 갱신과 Cell 이동 처리의 순서

`Region.TryRelocate` 안에서:

```
character.UpdateLocation(newLocation_cm);       // 좌표 먼저
gridManager.CheckAndMigrate(character, newLocation_cm);  // 그 다음 Cell 이동 판정/전파
```

## 문제 패턴 1 — 이벤트 중복 발생

**조건**: Entity A와 Player B가 **동시에 반대 방향**으로 이동(= Cell 간격 변화). 각자 다른 Thread, 둘 다 Task 시작 직전에 Sync 완료.

**진행**:
- Thread 1 (A): 내 ObservableRange에 추가된 Cell의 B를 처리 → 나 자신에게 `OnEnterObservableRange(B)`
- Thread 2 (B, Player): 내 ObservableRange에 추가된 Cell의 A를 처리 → 상대 A에게 `OnEnterObservableRange(B)`

**결과**: A 기준으로 Enter 이벤트가 2회 발생.

## 문제 패턴 2 — 이벤트 유령 발생

**조건**: Entity A와 Player B가 **동시에 같은 방향**으로 이동(= Cell 간격 유지).

**진행**:
- Thread 1 (A): 본인 기준 Cell 간격 변화 없음 → 이벤트 없음
- Thread 2 (B, Player): A가 아직 예전 Cell에 있다고 보여 상대 A에게 `OnEnterObservableRange(B)`

**결과**: Enter 이벤트는 발생했으나, Sync 완료 후 A와 B는 서로의 ObservableRange 밖. Leave 없는 유령 상태.

## 공통 근본 원인

> 이벤트 발생을 판단하는 순간의 Grid 스냅샷이 Thread마다 뒤처져 있다.

`cachedObservablePlayers` 같은 Thread별 캐시가 원인이 아니라, **Sync 타이밍과 이벤트 판단 타이밍 사이의 gap** 자체가 원인.

## 해결 A — 원천 직렬화 (Sync-before)

### A-1. Region마다 SerialTaskExecutor

- `Enter` / `Leave` / `TryRelocate`를 Task 반환으로 바꿈
- Region의 `SerialTaskExecutor`에 post + await
- Cell 이동 처리 Task가 Region 단위로 직렬 실행

**단점**: 모든 Cell 이동이 비동기화됨. 기존 동기 호출 경로 전체 수정 필요.

### A-2. 공유 DataDepot + Index 예약

- DataDepot **1개만** 둠 (SynchronizeAction 순서가 모든 Thread에 동일해야 하므로)
- Grid는 Thread-Local 유지
- `SynchronizeAction`에 Thread 수 Count 세팅 → Sync할 때마다 감소, 0이면 DataDepot에서 제거
- 각 Thread는 `SyncIndex` (ThreadLocal)에 어디까지 Sync했는지 기록

**Cell 이동 처리 절차 (해당 Thread)**:

1. DataDepot에서 다음 `PropagateIndex` 예약
2. `SyncIndex` ~ `PropagateIndex - 1` 구간을 내 Grid에 반영 (동기적, 미세팅 Index는 짧게 Spin)
3. 완전히 최신이 된 Grid 위에서 `OnEnterRegion` / `OnLeaveRegion` / `OnMigrate` 발생
4. 내 이동을 `PropagateIndex`에 써서 다른 Thread에 전파

**핵심 불변식**: 이벤트가 발생하는 순간의 Grid는 언제나 "그 시점까지의 전 SynchronizeAction이 반영된 상태".

**단점**: Spin 구간, DataDepot 핫스팟.

## 해결 B — 사후 캐시 검증 (Verify-after)

Entity에 `cachedObservablePlayers` 집합 유지.

```
OnEnterObservableRange(player):
    if player in cachedObservablePlayers: return  // 문제 1 방지
    cachedObservablePlayers.add(player)
    <실제 로직>

OnLeaveObservableRange(player):
    if player not in cachedObservablePlayers: return  // 문제 1 방지
    cachedObservablePlayers.remove(player)
    <실제 로직>
```

- 문제 1 (중복 Enter): 두 번째 Enter가 멱등성으로 무시됨
- 문제 2 (유령 Enter): 이 장치만으로는 못 잡음 → **주기 스캔** 필요

**주기 스캔**: `cachedObservablePlayers`를 돌면서 실제 내 ObservableRange 안에 없는 Player에 대해 `OnLeaveObservableRange(player)` 강제 호출.

**단점**: 보정 전까지의 짧은 유령 상태 존재.

## 두 해결책 비교

| 기준 | A-2 (공유 DataDepot) | B (사후 캐시 검증) |
|------|------------------|-------------------|
| 이벤트 정합성 | 발생 시점에 항상 맞음 | 순간적으로 틀릴 수 있음, 스캔으로 보정 |
| 구현 비용 | Grid/DataDepot 구조 전면 수정 | 기존 구조 유지, 집합·스캔 추가 |
| 부작용 | Spin, DataDepot 핫스팟 | 보정 전까지 짧은 유령 상태 |
| 이동 호출 | 동기 유지 | 동기 유지 |
| 적합 시스템 | 발사체 판정, 시야 공유 등 순간 정합성 중요 | 시각용 스폰/디스폰, 수백 ms 보정으로 충분 |

## 혼합 전략

전투·판정 이벤트에는 A-2, 시각용 표시 이벤트에는 B를 동시에 적용할 수 있다. 이벤트 종류별로 필요한 정합성 수준이 다르면 이게 가장 실용적.

## 일반화된 교훈

- **ThreadLocal 캐시 + 지연 Sync** 구조는 동시 발생 이벤트의 기준 상태를 어긋나게 만든다
- 병렬 처리에서 이벤트를 생성할 때는, 그 이벤트가 관측한 상태 스냅샷이 **누구에게도 허용되는 최신성**을 만족하는지가 핵심
- 구조를 못 바꾸면 이벤트 수신 쪽에 **멱등성 + 자가 보정**을 얹는 것이 차선책
- 어느 쪽이든 "이벤트 1회 = 상태 전이 1회"라는 불변식을 어떻게 보장할 것인지가 설계 포인트

## 관련

- 블로그: [[observable-range-sync]] 원문 글
