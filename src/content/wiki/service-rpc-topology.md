---
title: "Service 기반 RPC 토폴로지 선언 패턴"
description: "ServerType Pair를 Service에 Attribute로 붙여 Coordinator가 인스턴스 간 Session을 자동 구성하게 하는 패턴"
tags: ["game-dev", "server", "architecture", "rpc"]
publishDate: 2026-04-21
updatedDate: 2026-04-21
sources: ["blog:service-rpc-topology"]
draft: false
---

## 핵심 개념

| 용어 | 정의 |
|------|------|
| ServerType | 서버의 **역할** (Gateway, Game, Match 등). 배포 단위가 아님 |
| Service | 하나의 기능 단위. 여러 ServerType에 걸친 RPC 흐름을 포함할 수 있음 |
| ServerInstance | 실제 프로세스. 하나 이상의 ServerType을 담음 |
| Coordinator | Service의 요구사항과 Instance의 구성을 조합해 Session 집합을 계산하는 주체 |

## 선언 구조

```csharp
public enum ServerType {
    Gateway,
    Game,
    Match,
    Chat,
    Rank,
}

// Service는 필요한 RPC 쌍을 Attribute로 선언
[RpcPair(ServerType.Gateway, ServerType.Match)]
[RpcPair(ServerType.Match, ServerType.Game)]
public class BattleEntryService : Service { }

// Instance는 자기가 담는 ServerType만 선언
[ContainsServerType(ServerType.Gateway)]
[ContainsServerType(ServerType.Chat)]
public class EdgeNode : ServerInstance { }

[ContainsServerType(ServerType.Game)]
[ContainsServerType(ServerType.Match)]
public class CoreNode : ServerInstance { }
```

## Coordinator 도출 규칙

1. 모든 Service의 `[RpcPair(A, B)]`를 수집 → 필요한 ServerType 쌍 집합 구성
2. 각 ServerType에 대해 해당 ServerType을 담고 있는 Instance들 조사
3. 쌍 `(A, B)`에 대해 `A`를 담는 Instance와 `B`를 담는 Instance 사이에 Session 준비
4. 같은 Instance 내부의 ServerType 쌍은 in-process 호출로 처리 (Session 불필요)
5. 어떤 Service에도 등장하지 않는 ServerType에는 Session을 열지 않음

## 설계 원칙

- **Service가 통신 구조의 단일 출처(source of truth)** — 배포 설정이 아님
- **Instance는 역할만 선언** — 누구와 연결되는지 몰라도 됨
- **필요한 쌍만 Session** — 사용하지 않는 연결은 자동으로 열리지 않음
- **배포 토폴로지 독립** — 같은 코드가 monolith 개발 환경과 분산 운영 환경 모두에서 동작

## 얻는 것

| 효과 | 설명 |
|------|------|
| 통신 설계 강제 | Service 작성 시 어떤 ServerType 간 통신이 필요한지 **먼저** 명시하게 됨 |
| 설정 자동화 | Coordinator가 Session 집합을 계산 — 수동 배선 불필요 |
| 설계 문서화 | `[RpcPair]` 목록이 곧 통신 다이어그램 |
| 역추적 가능 | `RpcPair(A, B)` grep으로 해당 연결을 요구하는 Service 전수 확인 |
| 배포 유연성 | 같은 코드가 ServerType 분리/통합 변경에도 재컴파일 없이 대응 |

## 함정: 선언 누락을 배포 구성이 숨긴다

**시나리오**

1. `ServiceA`가 `[RpcPair(X, Y)]` 선언 → X-Y Session 준비됨
2. `ServiceB`도 X-Y 호출이 필요한데 `RpcPair` 선언을 누락
3. 현재 배포에서는 X와 Y가 같은 인스턴스에 있거나 ServiceA의 Session을 공유 → 동작 문제 없음
4. 배포 구성 변경 (X와 Y 분리 / ServiceA 제거) 시 ServiceB 호출이 조용히 실패

**함의**

- 런타임 검증만으로는 누락이 노출되지 않음
- 실제 서버 구성을 바꿔보기 전까지 잠복
- 정적 검증 장치가 없으면 축적되는 종류의 부채

## 정적 검증에 필요한 요구사항

선언과 실제 호출의 일치를 빌드 단계에서 잡으려면 다음이 필요하다.

### 1. RPC 함수에 방향 타입 부여

```csharp
[RpcTarget(ServerType.Match)]
public interface IMatchRpc {
    Task<MatchResult> RequestMatch(PlayerId player);
}

[CallerServerType(ServerType.Gateway)]
public class BattleEntryService : Service {
    async Task Handle(...) {
        var result = await _matchRpc.RequestMatch(player);
        // Gateway → Match 방향이 타입에 박혀 있음
    }
}
```

- 각 RPC 인터페이스는 **대상 ServerType**을 타입에 명시
- Service는 **호출자 ServerType**을 타입에 명시
- 정적 분석기가 실제 호출 그래프에서 필요한 `(Caller, Target)` 쌍 집합을 도출
- Service의 `[RpcPair]` 선언 집합과 비교하여 누락/과잉 탐지

### 2. ServerType 내부 접근 검증

RPC 함수 본문에서 참조하는 함수·변수가 해당 ServerType에 속한 것인지 검증. ServerType 경계를 넘어 다른 ServerType의 내부 상태에 직접 접근하면 안 됨.

## ServerType 분리 전략 비교

| 전략 | 장점 | 단점 |
|------|------|------|
| 한 프로젝트 + 기능 플래그 (`#if`, ServerType enum 분기) | 초기 개발 속도, 빌드 수 적음 | 경계 흐려짐, 타 ServerType 내부 상태 직접 참조가 런타임 전까지 안 드러남, 정적 검증 어려움 |
| ServerType별 프로젝트 분리 | 컴파일러가 경계 강제, 타 ServerType 접근은 RPC 인터페이스로만 가능, 정적 검증 자연스러움 | 초기 모듈 분리 비용, 공통 모듈 설계 필요 |

**권장**: ServerType별 프로젝트 분리. 공통 코드는 별도 모듈로 추출하고 각 ServerType은 자기 모듈 + 공통 모듈만 참조.

## 안티패턴: 인스턴스 쪽 연결 선언

```csharp
// 안티패턴 — Instance가 연결 대상을 직접 나열
class EdgeNode {
    ConnectTo(CoreNode);
    ConnectTo(MatchNode);
    ConnectTo(ChatNode);
}
```

문제점:
- Service가 요구하는 연결 구조가 코드에 드러나지 않음
- Service 추가/삭제 시 여러 Instance 설정을 수정해야 함
- 연결 하나가 어느 Service를 위한 것인지 추적 불가
- 인스턴스 수 N에 대해 연결 선언이 O(N²)로 팽창

## 관련

- 블로그: [[service-rpc-topology]] 원문 글
- 관련 개념: [[game-server-request-context]] — 요청 단위 컨텍스트 전파
