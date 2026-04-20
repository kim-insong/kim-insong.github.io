---
title: "서버가 연결되었다고 RPC를 쏠 수 있는 건 아니다"
description: "Coordinator의 연결됨/끊김 상태만으로는 부족하다. Setup 완료 여부를 (ServerIdx, ServerType) Pair 단위로 추적하고, RPC Method에는 방향이 박혀 있어야 한다."
publishDate: 2026-04-21
tags: ["EL", "game-dev", "server", "architecture", "rpc", "coordinator"]
draft: false
---

Coordinator는 서버끼리 연결됐는지 끊겼는지를 알려준다. 그런데 연결됐다는 것과 RPC를 보낼 준비가 됐다는 건 다른 상태다. 양쪽이 핸드셰이크 후 각자의 초기화를 끝내야 비로소 어떤 호출들이 안전해진다. 이 "초기화가 끝났음"을 판단할 방법이 Coordinator 레벨에는 없었다.

ProxyService마다 따로 만들어 쓰는 것보다 공통 기능으로 빼는 편이 깔끔하겠다 싶어 설계를 정리해본다.

## ServerIdx 단위로는 부족하다

A, B1, B2가 각각 ServerIdx이고 A가 B1, B2 둘 다와 연결될 수 있다고 하자. "A가 Setup을 완료했다"는 정보만으로는 A-B1 연결의 Setup인지 A-B2 연결의 Setup인지 구분이 안 된다.

```
A 완료              ← 정보 부족
A — B1 완료         ← 이 정도는 되어야
```

즉, Setup 완료는 ServerIdx **Pair** 단위로 관리되어야 한다.

## (ServerIdx, ServerType) Pair까지 가야 한다

여기서 한 단계 더. ServerType이 끼면 또 모호해진다.

A, B가 ServerIdx이고 X, Y가 ServerType이라 하자. 어떤 ProxyService가 X-Y 사이에서 동작해야 하는데, A와 B 모두 X와 Y를 동시에 담고 있는 경우가 있다 — `A(X,Y) — B(X,Y)`.

이때 "A-B Setup 완료"만으로는 `A(X)-B(Y)` 방향의 Setup인지 `A(Y)-B(X)` 방향의 Setup인지 알 수 없다. 추적 단위가 (ServerIdx, ServerType) Pair까지 내려가야 한다.

## RPC Method 자체에 방향이 박혀야 한다

(ServerIdx, ServerType) Pair까지 갔다고 끝이 아니다. `A(X)-B(Y)`의 Setup이 끝났다고 해도, 이 ProxyService에 들어 있는 RPC Method가 지금 사용 가능한지 단정할 수 없다. 그 Method가 `A(Y)-B(X)` 방향을 위한 것일 수도 있기 때문이다.

결국 Setup 검증이 필요한 RPC Method에는 출발지-도착지 ServerType Pair가 명시돼 있어야 한다. 그래야 호출 시점에 "지금 이 방향의 Setup이 끝났는가?"를 정확히 물을 수 있다.

## 어디까지 자동화할지 — 4가지 후보

위 요구사항을 어디서 짊어질 것인가에 따라 4개 방안이 나왔다.

**1. (ServerIdx, ProxyService, ServerType) 단위 + RPC Method별 방향 명시**
가장 정확하다. Setup 상태가 가장 가는 입자로 관리되고, Method 호출 시점에 "이 방향이 준비됐나?"를 즉시 알 수 있다. 대신 ProxyService 정의에 들어가는 메타정보가 늘어난다.

**2. (ServerIdx, ProxyService) 단위로만 관리**
한 ProxyService가 다루는 모든 ServerType의 Setup이 끝나야 "완료"로 본다. 입자가 거칠어지는 만큼, 한쪽 방향만 준비됐는데 양쪽 다 기다려야 하는 비용이 생긴다.

**3. (ServerIdx) 단위로만 관리**
서버 인스턴스 하나가 가진 모든 ProxyService와 그 안의 모든 ServerType이 다 Setup될 때까지 기다린다. 가장 단순하지만 가장 보수적이다. 어느 한 ProxyService가 늦으면 무관한 호출까지 같이 막힌다.

**4. ProxyService별로 그냥 따로 짜기**
공통화하지 않고 각자 알아서. 일관성을 잃는 대신 ProxyService마다 자기 사정에 맞춰 최적화할 수 있다.

## 어느 쪽을 고를지

1번이 가장 표현력이 좋지만, RPC Method마다 ServerType Pair를 박는 비용이 따라온다. 이건 [지난 글](/blog/service-rpc-topology)에서 다룬 RPC 함수에 방향 타입을 박는 작업과 결국 같은 이야기다. 거기서 통신 토폴로지를 정적으로 검증하기 위해 어차피 필요한 정보였으니, 같은 메타데이터를 Setup 검증에도 재활용할 수 있다.

3번은 단순하지만 한 ProxyService의 Setup 지연이 무관한 호출까지 막는 게 걸린다. 4번은 공통화의 이점을 포기하는 안이다.

현실적으로는 1번을 기본으로 두되, ProxyService가 단순한 경우에는 2번처럼 묶어서 관리할 수 있는 escape hatch를 두는 정도가 적절해 보인다.

## Takeaway

"연결됨"과 "RPC 사용 가능함"은 다른 상태다. 둘 사이에 Setup 단계를 명시적으로 두되, 추적 단위를 (ServerIdx, ServerType) Pair까지 내리지 않으면 모호함이 남는다. RPC Method에 방향을 박는 작업은 통신 토폴로지 검증과 Setup 검증 양쪽에 같은 메타데이터를 재활용할 수 있어, 하나의 메커니즘으로 묶어 설계할 만하다.
