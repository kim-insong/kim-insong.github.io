---
title: "Orleans 핵심 메커니즘 9가지"
description: "Grain 라우팅, 페일오버, 순서 보장, 취소, 트랜잭션, 스트리밍, 확장 — Orleans actor 모델의 동작과 한계 정리"
tags: ["orleans", "actor-model", "dotnet", "server", "concurrency"]
publishDate: 2026-04-23
updatedDate: 2026-04-23
sources: ["blog:orleans-9-questions"]
draft: false
---

## Grain Directory와 라우팅

| 요소 | 역할 |
|------|------|
| Grain Directory | `(GrainId → activation 위치)` 매핑 |
| 기본 구현 | 마스터 없는 분산 해시 테이블(DHT) |
| Partition Owner | 각 silo가 GrainId 해시 범위 일부 소유 |
| PlacementStrategy | `RandomPlacement`, `PreferLocalPlacement`, `HashBasedPlacement` |

호출 흐름:
1. GrainId 해시 → directory partition owner silo 조회
2. 해당 silo에서 activation 위치 lookup
3. 없으면 PlacementStrategy로 활성화할 silo 선정
4. 활성화 후 directory 등록

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
| 미보장 | 서로 다른 grain 간 글로벌 순서 |

순서 보장 패턴:
- **Sequencer grain**: 단일 grain으로 직렬화 — turn-based 자동 순서
- **Causal token / sequence number**: 메시지에 seq, callee에서 정렬
- **Reentrancy 끄기**: `[Reentrant]` 미사용 (기본값) — await 중 다른 호출 끼어들기 방지
- **외부 큐**: Kafka/EventHub — 글로벌 순서 필요 시 정석

## ValueTask vs Task

| 항목 | Task | ValueTask |
|------|------|-----------|
| 타입 | reference type | struct |
| 동기 완료 시 allocation | 발생 | 회피 |
| await 횟수 | 여러 번 가능 | **1번만** |
| 보관/패스싱 | 자유 | `.AsTask()` 변환 필요 |
| 권장 사용처 | 일반 애플리케이션 코드 | 측정된 hot path |

라이브러리에서 "대부분 동기 완료, 가끔 비동기"인 경우(`Stream.ReadAsync` 등)에 `ValueTask` 사용.

## CancellationToken 규칙

- "무조건 받는다"는 강제 규칙 아님
- 받아야 하는 경우: I/O, 긴 작업, 사용자 취소 영향 작업
- 안 받아도 되는 경우: 짧은 동기 작업, 취소 의미 없는 작업

**Orleans 특화 함정:**
- 일반 `CancellationToken`은 silo 경계를 넘어 전파되지 않음
- 다른 silo의 grain까지 cancel 신호 보내려면 `GrainCancellationToken` 사용

## Response Timeout과 트랜잭션

**롤백 보장 없음.** Timeout exception = "caller가 더 이상 안 기다린다"는 신호일 뿐.

callee 상태 가능성:
- 메시지 도달 전 끊김
- 처리 중
- 처리 끝났는데 응답 미도착

대응 패턴:

| 패턴 | 설명 |
|------|------|
| Idempotent + retry | 같은 호출 중복돼도 안전하게 |
| Orleans Transactions | `[Transaction(TransactionOption.Create)]` — 2PC 기반 ACID, 성능 비용 있음 |
| Saga | 각 단계마다 compensation 로직 |
| Event Sourcing | 상태 변화를 로그로, retry/replay |

RDB 트랜잭션 감각으로 "함수 실패 시 자동 롤백" 기대 금지. Orleans는 actor 모델 메시지 패싱이고 grain state 변경은 grain 본인 책임.

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

- 블로그: [[orleans-9-questions]] 원문 글
