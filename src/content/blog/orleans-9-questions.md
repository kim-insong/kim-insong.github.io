---
title: "Orleans 들여다보면서 막혔던 9가지"
description: "grain 라우팅과 페일오버, RPC 도중 grain 이동, silo 포트, 순서 보장, ValueTask, CancellationToken, response timeout, IAsyncEnumerable, Grain Extension. 게임서버 감각으로 읽었을 때 이상했던 부분만 추렸다."
publishDate: 2026-04-23
tags: ["server", "orleans", "actor-model", "dotnet", "concurrency"]
draft: false
---

Orleans를 처음 보면 actor 모델이라 익숙한 듯 낯설다. RDB 트랜잭션 감각이나 직접 만든 game server 감각으로 읽으면 자꾸 어긋난다. 막혔던 의문 9개를 정리한다.

## 1. grain은 어디로 라우팅되고, 그 결정 주체는 누구인가

라우팅의 핵심은 **Grain Directory** — `(GrainId → activation 위치)` 매핑이다.

기본 구현은 마스터 없는 분산 해시 테이블이다. 각 silo가 GrainId 해시 범위 일부의 directory partition owner가 된다. 호출이 들어오면 GrainId를 해시해 partition owner silo를 찾고, 거기서 activation 위치를 lookup한다. 활성화가 없으면 PlacementStrategy(`RandomPlacement`, `PreferLocalPlacement`, `HashBasedPlacement` 등)로 활성화할 silo를 정하고 directory에 등록한다.

silo 자체의 alive/dead는 별도다. **Membership** 저장소(ADO.NET, Azure Table, Redis, Consul 등)가 silo 목록을 관리하고, membership oracle이 판정한다.

페일오버는 두 단계로 일어난다. silo가 죽으면 membership이 감지하고, 그 silo가 갖고 있던 directory partition은 consistent hash ring에서 인접 노드로 재분배된다. 죽은 silo의 activation들은 directory에서 제거되고, 다음 호출이 들어오면 살아 있는 silo에서 새로 활성화된다. **메모리 state는 날아간다 — persistence를 안 했다면.**

## 2. RPC 도중 grain이 다른 silo로 옮겨가면

Orleans의 핵심 보장은 **single activation per grain**이다(BLR 끄면). 동시에 두 곳에서 활성화되지 않는다.

호출 메시지가 silo A에 도착했는데 grain이 막 deactivate된 경우, A는 directory를 다시 조회하고 새 위치로 forwarding한다. 진행 중인 method 호출은 deactivation 전에 끝까지 실행된다. grain이 idle이거나 `OnDeactivateAsync` 흐름으로 명시적으로 내려가는 경우에만 deactivate되기 때문이다.

caller 입장에서는 보통 transparent하다 — 메시지가 자동 redirect된다. 단, silo가 갑자기 crash 나면 caller는 timeout/exception을 받고 재시도한다. **딱 한 번 실행 보장은 없다. retry 시 중복 실행이 가능하니 idempotent하게 설계해야 한다.**

## 3. silo 간 연결 포트는 1개 고정인가

silo는 endpoint를 두 종류 갖는다.

- **SiloPort** (silo↔silo, 기본 11111) — 클러스터 내부 통신
- **GatewayPort** (external client↔silo, 기본 30000) — 외부 클라이언트가 붙는 포트

silo끼리는 SiloPort 한 개로 TCP 연결을 맺는다. 한 쌍의 silo는 기본 connection 1개를 공유한다. 멀티코어에서 throughput이 부족하면 `ConnectionsPerEndpoint`로 늘릴 수 있다. 그래서 정확히는 "포트는 1개 고정, 연결 수는 설정 가능"이다.

## 4. grain 간 순서 보장이 필요할 때

grain 간 순서는 기본적으로 보장되지 않는다. **단, 같은 (caller→callee) 쌍에 대해서는 FIFO를 보장한다** — sender-side ordering.

순서가 중요한 작업이면 패턴이 몇 가지 있다.

- **Sequencer grain**: 순서가 중요한 작업을 단일 grain으로 직렬화. grain은 turn-based라 자동으로 순서 보장이 된다.
- **Causal token / sequence number**: 메시지에 seq를 박고 callee 쪽에서 정렬.
- **Reentrancy 끄기**: grain이 await 중에 다른 호출을 끼워넣지 못하게 한다. `[Reentrant]` 미사용이 기본이다.
- **외부 큐(Kafka, EventHub)**: 글로벌 전체 순서가 필요하면 이쪽이 정석.

"작업 단위끼리 순서 보장"이 글로벌 전체 순서를 의미한다면 Orleans만으로는 안 된다. 보통 sequencer grain + persistence(이벤트 로그) 조합으로 푼다.

## 5. ValueTask는 Task와 뭐가 다른가

`Task`는 reference type이다. await 시 동기적으로 완료돼도 heap allocation이 발생한다.

`ValueTask<T>`는 struct다. **동기 완료 케이스(예: 캐시 히트)에서 allocation을 회피한다.** 핫패스용이다. 라이브러리에서 "대부분 동기 완료, 가끔 비동기"인 메서드에 유용하다 — `Stream.ReadAsync` 같은.

단점이 있다. **한 번만 await 가능하다.** 두 번 await하거나 `.Result`를 두 번 호출하면 안 된다. 보관/패스싱하려면 `.AsTask()`로 변환해야 한다.

일반 애플리케이션 코드는 그냥 `Task` 써라. 측정 후 hot path에서만 ValueTask를 고려한다.

## 6. CancellationToken은 다 받는 게 규칙인가

"무조건 받는다"는 강제 규칙은 아니다. 다만 .NET 라이브러리 best practice는 **취소 가능한 비동기 메서드는 CT를 받는다**.

- I/O, 긴 작업, 사용자 취소 영향받는 작업 → CT 받는다.
- 짧은 동기 작업이나 취소 의미가 없는 것 → 안 받아도 된다.

Orleans grain method에는 함정이 하나 있다. **일반 `CancellationToken`은 silo 경계를 넘어 전파되지 않는다.** 다른 silo의 grain까지 cancel 신호를 보내려면 `GrainCancellationToken`을 인자로 받아야 한다. 안 그러면 caller에서만 cancel될 뿐 callee는 계속 돈다.

## 7. response timeout이 발생하면 롤백되는가

**롤백 보장은 없다.** timeout exception은 "caller가 더 이상 안 기다리겠다"는 뜻일 뿐이다. callee 쪽 작업 상태는 셋 중 하나일 수 있다.

- 메시지 도달 전에 끊겼을 수도
- callee가 처리 중일 수도
- 처리 끝났는데 응답만 못 돌아왔을 수도

설계 옵션은 몇 가지다.

- **Idempotent 메서드 + retry**: 같은 호출 두 번 들어와도 안전하게.
- **Orleans Transactions**: `[Transaction(TransactionOption.Create)]` 어트리뷰트로 ACID 분산 트랜잭션. 2PC 기반이라 성능 비용이 있다.
- **Saga 패턴**: 각 단계마다 compensation 로직.
- **Event sourcing**: 상태 변화를 로그로 남기고 retry/replay.

게임서버 RDB 트랜잭션 감각으로 "함수 실패하면 자동 롤백"을 기대하면 안 된다. Orleans는 actor 모델 메시지 패싱이고, 메서드 호출은 분산 메시지 1번이며, 각 grain의 state 변경은 grain 본인이 책임진다.

## 8. IAsyncEnumerable은 왜 쓰는가

`IEnumerable<T>`는 동기 스트림 — `MoveNext()`가 동기다. `IAsyncEnumerable<T>`는 비동기 스트림 — `MoveNextAsync()`를 `await foreach`로 소비한다.

쓰는 이유는 분명하다.

- **항목 하나하나 만들 때 비동기 I/O가 필요한 경우** — DB 결과 streaming, 큰 파일 chunked read, 네트워크 페이지 단위 fetch.
- **데이터 전체를 메모리에 올리지 않고 흘려보내고 싶을 때** — backpressure가 자연스럽게 걸린다.
- `Task<List<T>>` 리턴은 "전부 모아서 한 번에 반환"이다 → 큰 데이터에서 메모리/지연이 폭발한다.

Orleans에서는 grain method가 직접 `IAsyncEnumerable<T>`를 리턴할 수 있다(.NET 8 이후 안정적). 또는 Orleans Streams로 pub/sub 패턴을 쓴다.

## 9. Grain Extension vs class 수정 vs C# extension method

세 개가 다 다른 거라 정리한다.

**(a) C# extension method** (`public static T Foo(this Grain g)`)는 컴파일 타임 syntactic sugar다. 클라이언트 쪽에서 호출하는 메서드일 뿐, **grain 안에서 실행되지 않는다.** RPC가 안 일어나니 grain의 single-threaded 모델/state에 접근 불가다. 헬퍼 함수에는 OK, "grain이 새 메서드 노출"엔 부적합.

**(b) Grain class 자체 수정**은 가능하지만 단점이 있다. 모든 인스턴스가 항상 그 인터페이스를 구현해야 하고 — optional하게 추가가 안 된다. 다른 팀/패키지의 grain class면 못 건드릴 수 있다. 횡단 관심사(logging, debugging, profiling)를 코어 class에 박으면 응집도가 망가진다.

**(c) Grain Extension** (`IGrainExtension`)은 **같은 activation에 추가 인터페이스를 동적으로 attach**한다. grain은 자기 본 클래스 + 0개 이상의 extension을 가진다.

Grain Extension의 사용 케이스는 분명하다.

- 선택적/플러그인 기능: 일부 grain 인스턴스에만 켜고 싶은 기능
- 외부 라이브러리 기능 추가: Orleans Streams의 producer extension, Reminders 등 시스템 기능들이 이걸로 구현됨
- 횡단 관심사: 디버깅 인터페이스를 dev 환경에서만 attach
- 소유권 분리: 본 grain 코드 안 건드리고 다른 어셈블리에서 기능 확장

핵심은 **같은 activation의 state/스케줄러 컨텍스트에 접근하면서 RPC 인터페이스로도 노출되는 것**이다. 그냥 메서드 추가면 클래스 수정이 제일 단순하다. 분산 RPC 노출 + 동적 attach + 소유권 분리가 필요할 때 grain extension을 쓴다.

## 정리하면

Orleans를 게임서버 RDB 감각으로 읽으면 어긋나는 지점은 일관된 패턴이다. **분산 메시지 패싱이라 자동 롤백이 없고, single activation은 보장되지만 exactly-once는 아니다.** 그래서 idempotency, sequencer grain, GrainCancellationToken 같은 보조 장치들이 따라붙는다. 결국 Orleans가 해주는 건 위치 투명성과 turn-based 단일 스레드 모델까지고, 그 위의 신뢰성은 설계자가 직접 만들어야 한다.
