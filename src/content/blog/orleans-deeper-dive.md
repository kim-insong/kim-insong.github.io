---
title: "Orleans 더 파보기 — Directory, 글로벌 순서, ValueTask, Timeout"
description: "지난 9가지에서 4개 주제만 더 깊게: Grain Directory가 마스터 없이 동작하는 메커니즘, 글로벌 순서를 Orleans만으로 못 푸는 이유, ValueTask가 한 번만 await인 이유, timeout 시 retry+idempotent가 정석인 까닭."
publishDate: 2026-04-26
tags: ["server", "orleans", "distributed-systems", "dotnet", "concurrency"]
draft: false
---

[지난 글](/blog/orleans-9-questions)에서 9개 의문을 정리했지만 표면에서 멈춘 게 4개 있다. Grain Directory의 동작 흐름, 진짜 글로벌 순서 보장, ValueTask의 풀링 매커니즘, timeout 후 일관성 회복 패턴. 한 번 더 판다.

## Grain Directory는 마스터 없는 분산 해시 테이블이다

silo 4개짜리 클러스터를 두고 보자. GrainId 해시 공간을 4구간으로 쪼개서 각 silo가 자기 구간의 directory partition owner가 된다.

```
Silo A: hash [0, 1/4)
Silo B: hash [1/4, 2/4)
Silo C: hash [2/4, 3/4)
Silo D: hash [3/4, 1)
```

각 owner는 자기 구간 grain들에 대해 `Map<GrainId, ActivationAddress>`를 메모리에 들고 있다. **위치 정보만 가진다 — 실제 grain instance는 다른 silo에 있을 수 있다.**

호출 흐름은 단순하다. Silo C가 GrainId X에 메시지를 보내고 싶을 때.

1. `hash(X)` 계산 → 구간 owner는 Silo A
2. C가 A에 "X 어디 있어?" 조회
3. A가 자기 dict 조회 → "Silo D에 있어" 응답
4. C가 D로 메시지 forward, D의 grain이 처리
5. C는 결과를 로컬 캐시에 저장 → 다음번엔 A 안 거치고 D로 직접

캐시가 stale이면 forward가 실패하고, C는 캐시를 invalidate한 뒤 다시 owner에 조회한다.

활성화가 아예 없으면 owner가 lookup miss → PlacementStrategy(`RandomPlacement`, `PreferLocalPlacement`, `HashBasedPlacement`, `ActivationCountBasedPlacement`)로 활성화할 silo를 정하고, 거기 활성화 요청을 보낸 다음 owner에 등록한다.

페일오버는 이렇다. Silo B가 죽으면 membership oracle이 감지하고 클러스터 view를 갱신한다. B의 hash 구간은 consistent hash ring에서 인접 silo(C)가 흡수한다. B가 갖고 있던 directory entry는 메모리였으니 사라진다 — 다음 호출 시 C가 lookup miss → 새로 활성화 → 등록한다. B에 살아있던 grain activation들도 같이 날아가고, persistence 안 했으면 state는 손실이다.

게임 서버 매칭에 비유하면, "이 매치 룸이 어느 게임 서버에 있나" 룩업 디렉터리인데 master 없이 모든 서버가 GrainId 구간을 나눠 책임진다. owner가 죽어도 인접 노드가 흡수.

Orleans 7+에는 Azure Table/Redis 같은 외부 storage를 directory로 쓰는 옵션도 있다. redundancy는 강해지고 lookup은 약간 느려진다. 트레이드오프.

## 글로벌 순서는 Orleans만으로 못 푼다

지난 글에서 "(caller→callee) 쌍 FIFO"만 적었는데, 이건 같은 caller→같은 callee 한 쌍에서만 의미 있다. 다른 caller끼리 글로벌 순서는 본질적으로 합의 문제(Raft/Paxos 영역)다. 케이스를 분리해서 본다.

**(A) 같은 caller가 A→B→C 순서로 보내고 싶다.** Orleans가 (caller, callee) 쌍 FIFO를 보장하니 그냥 `await` 체이닝하면 자동으로 해결된다. caller 코드에 seq 박을 일도 거의 없다.

**(B) 원인→결과 순서.** A가 응답을 받고 그 결과로 B를 호출. caller가 `await A; await B;` 만 하면 자연스럽게 끝난다. A의 부수효과가 B 시작 전에 완전히 끝난다.

**(C) 진짜 글로벌 순서.** 경매 입찰처럼 100명이 동시에 던지는 걸 도착 순서로 처리해야 한다. Orleans 단독으론 안 되고, 셋 중 하나를 쓴다.

- **Sequencer grain**: 모든 caller가 단일 grain에 던진다. 그 grain이 turn-based라 자동 직렬화되고, seq number를 발급해 후속 grain에 dispatch한다. 병목이지만 단순.
- **외부 큐**(Kafka, EventHub, Pulsar): partition 단위로 순서 보장. 같은 partition key면 순서 유지. consumer 1개가 grain으로 dispatch.
- **분산 합의 알고리즘**: 직접 짤 일은 거의 없다.

외부 큐를 많이 쓰는지는 도메인에 따라 다르다.

- 이벤트 기반 / CQRS / audit log 중요한 시스템: 거의 항상 외부 큐. 순서 + persistence + replay 다 잡으려고.
- 실시간 게임 서버 같은 짧은 호출: 외부 큐 안 끼우는 경우 많다. sequencer grain이나 비즈니스 로직 자체로 처리. 큐 끼우면 latency가 한 hop 늘어난다.
- 결제 / 인벤토리 같은 critical path: Orleans Transactions나 saga 패턴.

게임에 비유하면 같은 클라 패킷 순서는 클라가 seq 박고 서버가 정렬(case A/B), 경매장 글로벌 입찰 순서는 경매 룸 서버 단일 노드로 모아서 직렬화(sequencer grain) 또는 Kafka로 줄세우기(외부 큐).

## ValueTask가 한 번만 await인 이유는 풀링이다

`ValueTask<T>`는 struct인데 내부에 셋 중 하나를 들고 있다.

1. 동기 완료 결과 `T` (allocation 0)
2. `Task<T>` 한 개 (이미 비동기로 완료된 케이스)
3. `IValueTaskSource<T>` (재사용 가능한 풀링 source)

핵심은 3번이다. 고성능 라이브러리(예: `Socket.ReceiveAsync`, `PipeReader`)는 `IValueTaskSource`를 풀에서 빌려 쓴다. 한 번 await(`GetResult` 호출)하면 source는 풀에 반납되고, 그 자리에 다른 요청이 들어온다. 두 번째로 await하면? 그 source는 이미 다른 작업 상태를 들고 있다 → 엉뚱한 결과나 예외.

그래서 규약이 명확하다.

- `await` 1회만
- `.AsTask()` / `.Result` / `.GetAwaiter().GetResult()` 1회만
- 변수에 보관해서 패싱 금지 (`Task`로 변환해서 패싱)

사실 case 1, 2는 여러 번 해도 우연히 동작하지만, 어느 case인지 호출자는 모르니까 무조건 1회 규칙이 안전하다.

Orleans grain method는 거의 다 `Task` / `Task<T>`를 리턴한다. 어차피 RPC라 직렬화/네트워크/스케줄러를 거치니 비동기 완료가 거의 확정되고, ValueTask의 동기 완료 이득이 거의 없다. `Task` 한 개 allocation은 RPC 비용에 비하면 무시 가능하다.

ValueTask는 hot path에서 대부분 동기 완료하는 함수에서 의미가 있다 — 캐시 히트 90%+ accessor, in-memory lookup 같은. Orleans 내부 일부 hot path에 ValueTask가 쓰이지만 그건 프레임워크 디테일이고, 사용자 코드는 그냥 `Task` 쓰면 된다. 측정해서 allocation이 진짜 문제 될 때만 ValueTask를 고려한다.

## Timeout = retry + idempotent가 분산의 정석

게임서버 RDB 트랜잭션 감각으로 분산 시스템을 보면 가장 어긋나는 지점이다. 기본 마인드셋부터 다르다.

- timeout = "기다리기 포기"일 뿐, 작업이 안 됐다는 뜻이 아니다.
- "어디까지 됐나"는 절대 모른다 — 안 갔거나, 처리 중이거나, 끝났는데 응답만 못 돌아왔거나.
- 그래서 재시도해도 안전(idempotent)하게 짜는 게 1순위다.

패턴 4개를 정리한다.

**(a) Idempotent 설계** — 가장 쉬운 방법. 비-idempotent는 "골드 100 추가" — 재시도 시 200이 된다. Idempotent는 "골드를 1000으로 set" — 재시도해도 같다. 가능하면 set 기반 / version 기반 / 절대값으로 짠다.

**(b) Request ID + Dedup** — caller가 요청마다 unique ID(GUID 같은)를 발급한다. callee grain이 처리 완료된 ID를 일정 기간 기억(grain state나 별도 dedup grain). 같은 ID가 또 오면 재처리 안 하고 이전 결과를 그대로 리턴. 결제/거래 시스템의 transaction ID 패턴과 같다.

**(c) Saga** — 여러 단계의 긴 흐름. 단계마다 compensation(취소 액션)을 정의한다. 골드 차감 → 아이템 지급 실패 → 차감된 골드 환불. 정확한 ACID가 아니라 eventually consistent.

**(d) Orleans Transactions** — 진짜 ACID가 필요할 때. 2PC 비스무리. 비싸다. 모든 참여 grain이 `[Transaction]` 인터페이스 + transactional state를 써야 한다. 게임 핫패스에선 잘 안 쓰고, 결제/인벤토리 같은 critical 경로에 선택적으로.

실전에서는 보통 (a) + (b) 조합이 1순위다. 비즈니스 로직 자체를 retry-safe하게 짜고, saga/transaction은 진짜 필요한 데만 박는다.

Retry 자체도 주의가 필요하다.

- **exponential backoff + jitter** (무한 retry는 cascade 장애를 유발한다)
- **max attempts** 정해두기
- **circuit breaker** (계속 실패하는 callee는 잠깐 차단 — Polly 같은 라이브러리 자주 씀)

게임서버 비유로 정리하면, "RDB 트랜잭션으로 한 번에 처리"가 분산에선 너무 비싸기 때문에 비즈니스 로직 단에서 "두 번 들어와도 한 번 효과"를 보장하는 식으로 옮겨가는 게 핵심 패러다임 변화다.

## 다음에 만져볼 것

이 4개는 Orleans 위에서 실제 시스템을 짤 때 가장 자주 부딪치는 자리다. 다음번엔 sequencer grain을 실제로 코드로 짜보고 throughput 한계를 측정해보고, dedup grain 구현을 grain state 기반과 외부 Redis 기반으로 둘 다 만들어 비교해볼 생각이다. 패턴을 알아도 한계 수치는 직접 재봐야 감이 잡힌다.
