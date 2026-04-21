---
title: "엔티티가 두 번 보이거나 사라진 것처럼 동작하던 이유"
description: "Grid를 멀티스레드로 돌릴 때 Enter/Leave 이벤트가 두 번 나거나 누락되는 문제. 원천을 직렬화하는 방향과 사후 검증으로 보정하는 방향을 비교한다."
publishDate: 2026-04-21
tags: ["game-dev", "server", "mmo", "concurrency", "프라시아전기"]
draft: false
---

MMO 서버에서 Grid 간 엔티티 이동을 구현하다 보면, 이동 직후에 엔티티가 두 번 등장하거나 분명히 옆에 있던 플레이어가 사라져버리는 증상을 만난다. 클라이언트 버그처럼 보이지만 원인은 서버의 Enter/Leave 이벤트가 실제 공간 상태와 어긋나는 데 있다.

원인을 추적한 과정을 정리한다.

## 배경: Cell, ObservableRange, 이벤트

Region은 큰 공간이고, 그 안을 격자(Grid)로 쪼갠 단위가 Cell이다. 모든 Entity는 어떤 Cell에 속해 있다. 각 Entity에는 자기 주변 몇 Cell을 묶은 **ObservableRange**가 있는데, 여기에 들어있는 Player들에게만 자신의 변화를 동기화하면 된다. 맵 전체를 brute-force로 돌리지 않기 위한 기본 장치다.

Entity가 Cell을 옮기면 두 가지 이벤트가 난다.

- `OnEnterObservableRange(other)` — "상대가 내 관심 범위로 들어왔다"
- `OnLeaveObservableRange(other)` — "상대가 내 관심 범위에서 빠졌다"

누가 발생시킬까. 가만히 있는 Entity는 주변 변화를 알 방법이 없다(폴링 말고는). 그래서 **이동한 쪽이 양쪽 이벤트를 다 책임진다**. 내가 이동했으면 나 자신에게도, 그리고 내가 Player라면 상대에게도 Enter/Leave를 알려줘야 한다.

## Grid는 Thread마다 따로 들고, 가끔 Sync한다

서버는 Task 단위로 여러 Thread에서 돌아간다. Grid 상태를 하나의 공유 자료구조로 두고 Lock으로 보호하면 병목이 된다. 그래서 다음 구조를 썼다.

- Grid는 **Thread-Local**로 각자 들고 있다
- Cell 이동 같은 변경은 `SynchronizeAction`이라는 단위로 만들어 **DataDepot**이라는 큐에 쌓는다
- 각 Thread는 Task 실행 직전에 DataDepot을 읽어 자기 Grid를 최신으로 당긴다

이 덕분에 Lock 없이 병렬 처리가 된다. 단, "거의 동시에 두 Entity가 이동"하는 순간에는 Thread들이 서로 다른 시점의 Grid를 보게 된다. 문제의 뿌리가 여기다.

## 문제 1: 이벤트가 두 번 발생하는 경우

Entity A와 Player B가 **같은 순간에 반대 방향**으로 움직였다고 하자. 각자 다른 Thread에서 돌고, 둘 다 Task 시작 직전에 Sync를 했다. 그래서 두 Thread 모두 상대가 "아직 예전 Cell에 있는" 상태의 Grid를 본다.

- Thread 1 (A 담당) — "내 새 위치 주변 Cell에 B가 있네 → 나에게 `OnEnterObservableRange(B)` 호출"
- Thread 2 (B 담당) — "내 새 위치 주변 Cell에 A가 있네 → 상대 A에게 `OnEnterObservableRange(B)` 호출"

양쪽이 각자 정당하게 Enter를 발생시켰다. 결과적으로 A에 대해 Enter 이벤트가 두 번 들어온다. 클라이언트 입장에서는 B가 두 번 나타난다.

## 문제 2: 이벤트가 발생했는데 실제로는 없는 경우

이번엔 A와 B가 **같은 방향으로 동시에** 움직여서, 서로의 거리는 그대로라고 하자.

- Thread 1 (A 담당) — 본인 기준 Cell 간격이 안 바뀌므로 이벤트 없음
- Thread 2 (B 담당) — A는 아직 예전 Cell에 있다고 보이고, 내 새 위치 기준으로 A가 ObservableRange에 들어온 것처럼 계산됨 → 상대 A에게 `OnEnterObservableRange(B)` 호출

A에는 Enter 이벤트가 들어왔는데, 정작 Sync가 끝나고 보면 A와 B는 서로의 ObservableRange 밖에 있는 상태다. 클라이언트에는 B가 한 번 나타났다가 아무 Leave도 없이 조용히 실제 상태와 어긋난 채로 남는다.

공통 원인은 하나다. **이벤트 발생을 판단하는 순간의 Grid가 이미 뒤처져 있다.**

## 해결 방향 A — 이벤트 발생을 애초에 직렬화한다

이벤트가 꼬이지 않으려면 Cell 이동을 병렬로 판단하지 않으면 된다. 두 가지 구현안이 있었다.

### A-1. Region마다 SerialTaskExecutor 하나

`Enter`, `Leave`, `TryRelocate` 같은 Cell 이동 API를 전부 Task를 반환하도록 바꾸고, Region의 `SerialTaskExecutor`에 post한 뒤 await한다. 즉 같은 Region 안에서는 이동 처리 Task가 한 번에 하나씩 순서대로 돈다.

구현은 단순하지만 모든 Cell 이동이 비동기가 된다. 호출 경로가 길어지고, 동기 호출 전제가 박혀 있던 기존 코드 전부를 바꿔야 한다.

### A-2. 공유 DataDepot 하나 + Index 예약

DataDepot을 Thread별로 두지 않고 **하나만** 둔다. Grid는 여전히 Thread-Local.

Cell 이동이 발생하면 해당 Thread가 하는 일은 다음과 같다.

1. DataDepot에서 다음 `PropagateIndex`를 예약한다 (내 이동이 들어갈 자리)
2. 이전에 내가 Sync한 `SyncIndex`부터 `PropagateIndex - 1`까지의 `SynchronizeAction`을 내 Grid에 반영한다 — 여기까지가 **동기적**이다. 아직 세팅되지 않은 Index가 있으면 짧게 Spin
3. 완전히 최신이 된 내 Grid 위에서 `OnEnterRegion` / `OnLeaveRegion` / `OnMigrate`를 발생시킨다
4. 내 이동을 `PropagateIndex`에 써서 다른 Thread에 전파한다

각 `SynchronizeAction`에는 Thread 수만큼의 Count를 붙여두고, 각 Thread가 Sync할 때마다 Count를 깎는다. 0이 되면 DataDepot에서 제거한다.

핵심은 **이벤트가 발생하는 순간의 Grid가 언제나 그 시점의 최신 상태**라는 것이다. 문제 1, 2의 원인이었던 "뒤처진 Grid 기준으로 Enter/Leave를 판단" 자체가 없어진다. 이동 API는 여전히 동기적이다.

단점은 Spin 구간이 있다는 것, 그리고 DataDepot 하나에 전 Region의 이동이 몰려서 핫스팟이 될 수 있다는 것이다.

## 해결 방향 B — 사후에 캐시 상태로 보정한다

원천을 바꾸는 대신, 이벤트를 받는 쪽에서 필터링한다. Entity에 `cachedObservablePlayers`라는 집합을 둔다.

- `OnEnterObservableRange(player)` — 이미 집합에 있으면 무시. 없을 때만 추가하고 실제 로직 실행
- `OnLeaveObservableRange(player)` — 집합에 없으면 무시. 있을 때만 제거하고 로직 실행

이걸로 **문제 1 (중복 Enter)** 은 막힌다. 두 번째로 들어오는 Enter는 이미 집합에 있으니 무시된다.

**문제 2 (유령 Enter)** 는 이 장치만으로는 못 잡는다. Enter가 먼저 들어왔는데 실제로는 Leave가 와야 할 상태다. 그래서 주기적으로 `cachedObservablePlayers`를 돌면서, 실제 내 ObservableRange 안에 없는 Player가 있으면 그 자리에서 `OnLeaveObservableRange(player)`를 강제로 부른다. 즉 눈에 띌 정도로 오래 남기 전에 자가 보정.

구현이 가볍다는 게 장점이다. 기존 동기 호출 구조를 그대로 두고 집합과 주기 스캔만 얹으면 된다. 대신 잠깐의 유령 상태를 허용하는 방식이므로, 이벤트 순간에 강한 정합성이 필요한 시스템에는 맞지 않는다.

## 어느 쪽을 고르나

두 방향은 성격이 완전히 다르다.

| 기준 | A-2 (공유 DataDepot) | B (사후 캐시 검증) |
|------|------------------|-------------------|
| 이벤트 정합성 | 발생 시점에 항상 맞음 | 순간적으로 틀릴 수 있음, 주기 스캔으로 보정 |
| 구현 비용 | Grid/DataDepot 구조 전면 수정 | 기존 구조 유지, 캐시·스캔 추가 |
| 부작용 | Spin, 공유 DataDepot 핫스팟 | 보정 전까지의 짧은 유령 상태 |
| 이동 호출 | 동기 유지 | 동기 유지 |

발사체 판정이나 시야 공유처럼 "지금 이 순간의 보임 여부"가 전투 결과를 바꾸는 로직이 있다면 A-2 쪽이 맞다. 표시용 스폰/디스폰 수준이고 수백 ms 내 보정으로 충분하면 B가 훨씬 싸게 먹힌다. 실제로는 두 방향을 섞어서 — 정합성이 중요한 이벤트는 직렬화, 시각용 이벤트는 캐시 검증 — 적용하는 것이 실용적이었다.

## Takeaway

ThreadLocal Grid + 느슨한 Sync 구조는 동시 이동 순간에 **이벤트 발생 판단의 기준 상태** 자체가 Thread마다 어긋난다. Enter가 두 번 나거나 Leave 없이 유령이 남는 증상은 전부 이 한 줄의 결과다. 고치는 길은 두 갈래다 — 이벤트 발생을 최신 상태 위로 올려버리거나(A-2), 이벤트 수신 쪽에 멱등성과 자가 보정을 얹거나(B). 요구하는 정합성 수준에 맞춰 고르자.
