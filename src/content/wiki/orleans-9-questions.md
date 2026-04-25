---
title: "Orleans 핵심 메커니즘 9가지"
description: "Grain 라우팅, 페일오버, 순서 보장, 취소, 트랜잭션, 스트리밍, 확장 — Orleans actor 모델의 동작과 한계 정리"
tags: ["orleans", "actor-model", "dotnet", "server", "concurrency"]
publishDate: 2026-04-23
updatedDate: 2026-04-26
sources: ["blog:orleans-9-questions", "blog:orleans-deeper-dive"]
draft: false
---

## Grain Directory와 라우팅

| 요소 | 역할 |
|------|------|
| Grain Directory | `(GrainId → activation 위치)` 매핑 |
| 기본 구현 | 마스터 없는 분산 해시 테이블(DHT) |
| Partition Owner | 각 silo가 GrainId 해시 범위 일부 소유 |
| PlacementStrategy | `RandomPlacement`, `PreferLocalPlacement`, `HashBasedPlacement` |

호출 흐름 (Silo C가 GrainId X에 메시지 보내는 경우):
1. `hash(X)` 계산 → 구간 owner는 Silo A
2. C가 A에 위치 조회
3. A가 자기 dict 조회 → "Silo D에 있음" 응답
4. C가 D로 메시지 forward, D의 grain이 처리
5. C는 결과를 로컬 캐시에 저장 → 다음번엔 A 안 거치고 D로 직접

캐시 stale 처리: forward 실패 → 캐시 invalidate → 다시 owner에 조회.

Activation이 없을 때:
1. owner가 lookup miss
2. PlacementStrategy(`RandomPlacement`, `PreferLocalPlacement`, `HashBasedPlacement`, `ActivationCountBasedPlacement`)로 활성화할 silo 선정
3. 해당 silo에 활성화 요청
4. 활성화 성공 시 owner에 등록

**Orleans 7+ 옵션**: Azure Table / Redis 같은 외부 storage를 directory로 사용. redundancy 강함, lookup 약간 느림.

## Membership과 페일오버

- **Membership**: 별도 저장소(ADO.NET, Azure Table, Redis, Consul) — silo alive/dead 판정
- silo 사망 시:
  1. membership이 감지
  2. 죽은 silo의 directory partition은 consistent hash ring에서 인접 노드로 재분배
  3. 해당 silo의 activation은 directory에서 제거
  4. 다음 호출 시 살아 있는 silo에서 신규 활성화
- **메모리 state는 소실** (persistence를 안 했다면)

## Single Activation 보장과 한계

- **Single activation per grain**: 동시에 두 곳에서 활성화되지 않음 (BLR 옵션 끄면)
- 메시지가 도착했는데 grain이 막 deactivate된 경우 → silo가 directory 재조회 후 forwarding
- 진행 중 method 호출은 deactivation 전 끝까지 실행
- silo crash 시 caller는 timeout/exception → 재시도
- **exactly-once 보장 없음** → 메서드는 idempotent하게 설계

## Silo 포트 구조

| 포트 | 기본값 | 용도 |
|------|--------|------|
| SiloPort | 11111 | silo↔silo 클러스터 내부 통신 |
| GatewayPort | 30000 | external client↔silo |

- silo 쌍당 기본 TCP connection 1개
- `ConnectionsPerEndpoint`로 N개로 늘려 멀티코어 throughput 확보 가능

## 순서 보장

| 보장 | 범위 |
|------|------|
| 기본값 | 같은 (caller→callee) 쌍은 FIFO (sender-side ordering) |
| 미보장 | 서로 다른 caller 간 글로벌 순서 — 본질적으로 합의(Raft/Paxos) 영역 |

케이스 분리:

| 케이스 | 해결 방법 |
|--------|-----------|
| (A) 같은 caller가 A→B→C 순서 | `await` 체이닝만으로 자동 (FIFO 보장) |
| (B) 인과 순서 (A 결과로 B 호출) | `await A; await B;` |
| (C) 진짜 글로벌 순서 (다중 caller) | sequencer grain / 외부 큐 / 분산 합의 |

(C) 패턴 상세:
- **Sequencer grain**: 모든 caller가 단일 grain에 던짐 → turn-based 자동 직렬화 → seq 발급해 후속 grain dispatch. 병목이지만 단순.
- **외부 큐**(Kafka/EventHub/Pulsar): partition 단위 순서 보장. 같은 partition key면 순서 유지. consumer 1개가 grain dispatch.
- **분산 합의 알고리즘**: 직접 짤 일 거의 없음.
- **Reentrancy 끄기**: `[Reentrant]` 미사용 (기본값) — await 중 다른 호출 끼어들기 방지.

도메인별 선택:
- 이벤트 기반 / CQRS / audit log: 외부 큐 (순서 + persistence + replay)
- 실시간 게임 서버: sequencer grain 또는 비즈니스 로직으로 처리 (큐는 latency hop 추가)
- 결제 / 인벤토리 critical path: Orleans Transactions 또는 saga

## ValueTask vs Task

| 항목 | Task | ValueTask |
|------|------|-----------|
| 타입 | reference type | struct |
| 동기 완료 시 allocation | 발생 | 회피 |
| await 횟수 | 여러 번 가능 | **1번만** |
| 보관/패스싱 | 자유 | `.AsTask()` 변환 필요 |
| 권장 사용처 | 일반 애플리케이션 코드 | 측정된 hot path |

`ValueTask<T>` 내부 상태 (셋 중 하나):
1. 동기 완료 결과 `T` (allocation 0)
2. `Task<T>` 한 개 (이미 비동기 완료)
3. `IValueTaskSource<T>` (재사용 가능한 풀링 source)

**1회 await 규칙의 이유**: case 3에서 `IValueTaskSource`는 풀에서 빌려 쓴다. `GetResult` 호출 시 풀에 반납 → 다른 요청이 그 source를 재사용. 두 번째 await는 다른 작업 상태를 들고 있는 source를 읽게 됨 → 엉뚱한 결과/예외.

규약:
- `await` 1회만
- `.AsTask()` / `.Result` / `.GetAwaiter().GetResult()` 1회만
- 변수에 보관/패싱 금지 (`Task`로 변환 후 패싱)

case 1, 2는 여러 번 해도 우연히 동작하지만, 호출자는 어느 case인지 모르므로 무조건 1회 규칙이 안전.

**Orleans grain method는 거의 다 `Task` 리턴**: RPC라 동기 완료 거의 없음 → ValueTask 이득 없음. Task 한 개 allocation은 RPC 비용 대비 무시 가능. 사용자 코드는 `Task` 기본, 측정 후 hot path만 ValueTask 고려.

## CancellationToken 규칙

- "무조건 받는다"는 강제 규칙 아님
- 받아야 하는 경우: I/O, 긴 작업, 사용자 취소 영향 작업
- 안 받아도 되는 경우: 짧은 동기 작업, 취소 의미 없는 작업

**Orleans 특화 함정:**
- 일반 `CancellationToken`은 silo 경계를 넘어 전파되지 않음
- 다른 silo의 grain까지 cancel 신호 보내려면 `GrainCancellationToken` 사용

## Response Timeout과 트랜잭션

**롤백 보장 없음.** Timeout exception = "caller가 더 이상 안 기다린다"는 신호일 뿐.

기본 마인드셋:
- timeout = "기다리기 포기"일 뿐, 작업이 실패했다는 의미 아님
- "어디까지 됐나"는 절대 모름 (안 갔거나 / 처리 중이거나 / 끝났는데 응답만 못 돌아왔거나)
- 재시도해도 안전(idempotent)하게 짜는 게 1순위

대응 패턴:

| 패턴 | 설명 | 사용처 |
|------|------|--------|
| (a) Idempotent 설계 | "골드 100 추가" 대신 "골드를 1000으로 set" — set/version/절대값 기반 | 1순위, 가장 단순 |
| (b) Request ID + Dedup | caller가 unique ID 발급, callee가 처리 ID 기억 → 재요청 시 이전 결과 리턴 | 결제/거래 transaction ID 패턴 |
| (c) Saga | 단계별 compensation(취소 액션) 정의 — eventually consistent | 여러 단계 긴 흐름 |
| (d) Orleans Transactions | `[Transaction(TransactionOption.Create)]` — 2PC 기반 ACID | 결제/인벤토리 critical 경로 (비싸므로 선택적) |
| Event Sourcing | 상태 변화를 로그로, retry/replay | audit log 중요 시스템 |

실전: **(a) + (b) 조합이 1순위**. 비즈니스 로직 자체를 retry-safe하게. saga/transaction은 진짜 필요한 데만.

Retry 자체 주의:
- **exponential backoff + jitter** (무한 retry는 cascade 장애 유발)
- **max attempts** 정해두기
- **circuit breaker** (계속 실패하는 callee는 잠깐 차단 — Polly 등)

**패러다임 차이**: 게임서버 RDB 감각의 "트랜잭션 한 번에 처리"가 분산에선 너무 비쌈 → 비즈니스 로직 단에서 "두 번 들어와도 한 번 효과" 보장으로 옮겨감. Orleans는 actor 모델 메시지 패싱이고 grain state 변경은 grain 본인 책임.

## IAsyncEnumerable vs IEnumerable

| 항목 | IEnumerable | IAsyncEnumerable |
|------|-------------|------------------|
| 스트림 | 동기 | 비동기 |
| 메서드 | `MoveNext()` | `MoveNextAsync()` |
| 소비 | `foreach` | `await foreach` |

사용 케이스:
- 항목 생성에 비동기 I/O 필요 (DB streaming, 파일 chunked read, 네트워크 페이지 fetch)
- 메모리 미적재 흐름 — backpressure 자연스러움
- `Task<List<T>>`는 전체 모아서 반환 → 큰 데이터에서 메모리/지연 폭발

Orleans에서는 grain method가 직접 `IAsyncEnumerable<T>` 리턴 가능 (.NET 8+) 또는 Orleans Streams로 pub/sub.

## Grain Extension vs Class 수정 vs Extension Method

| 방식 | 동작 위치 | RPC 노출 | 동적 attach | 권장 사용처 |
|------|-----------|----------|-------------|-------------|
| C# extension method | 클라이언트 쪽 컴파일 타임 | 안 됨 | — | 헬퍼 함수 |
| Grain class 수정 | grain 본체 | 됨 | 안 됨 (모든 인스턴스 항상 구현) | 핵심 기능 추가 |
| Grain Extension | 같은 activation | 됨 | **됨** | 선택적 기능, 횡단 관심사, 외부 어셈블리 확장 |

Grain Extension(`IGrainExtension`) 사용 케이스:
- 선택적/플러그인 기능
- 외부 라이브러리 기능 추가 (Orleans Streams producer extension, Reminders 등이 이걸로 구현됨)
- 횡단 관심사 (디버깅 인터페이스를 dev 환경에서만 attach)
- 소유권 분리 (본 grain 코드 안 건드리고 다른 어셈블리에서 확장)

핵심: **같은 activation의 state/스케줄러 컨텍스트에 접근하면서 RPC 인터페이스로도 노출**되는 점.

## 멘탈 모델

Orleans가 직접 제공:
- 위치 투명성(location transparency)
- Turn-based 단일 스레드 grain 실행
- Single activation 보장

Orleans가 제공하지 않는 것 (설계자 책임):
- Exactly-once 실행
- 자동 롤백
- 글로벌 순서 보장
- 메모리 state 영속성 (persistence 명시 필요)

→ idempotency, sequencer grain, `GrainCancellationToken`, Transactions/Saga, Event Sourcing 같은 보조 장치를 직접 조립해야 함.

## 관련

- 블로그: [[orleans-9-questions]] 원문 글 (9가지 의문 정리)
- 블로그: [[orleans-deeper-dive]] 심화 — Directory 흐름, 글로벌 순서, ValueTask 풀링, Timeout 패턴
