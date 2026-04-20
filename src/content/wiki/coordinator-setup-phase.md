---
title: "Coordinator Setup Phase 추적 패턴"
description: "연결됨 ≠ RPC 호출 가능. Setup 완료 상태를 (ServerIdx, ServerType) Pair 단위로 추적하고, RPC Method에 방향을 박아 호출 시점 검증을 가능하게 하는 설계"
tags: ["game-dev", "server", "architecture", "rpc", "coordinator"]
publishDate: 2026-04-21
updatedDate: 2026-04-21
sources: ["blog:coordinator-setup-phase"]
draft: false
---

## 핵심 개념

| 용어 | 정의 |
|------|------|
| Connected | Coordinator가 관찰하는 인스턴스 간 TCP/전송 레벨 연결 상태 |
| Setup Complete | 핸드셰이크 이후 양쪽 각자의 초기화가 끝나 특정 RPC 호출이 안전해진 상태 |
| ServerIdx | 특정 서버 인스턴스 식별자 |
| ServerType | 서버의 역할 ([[service-rpc-topology]] 참조) |
| ProxyService | 두 ServerType 사이에서 동작하는 Service 단위 |

## 원칙

- **Connected와 Setup Complete는 다른 상태다** — 연결이 맺어졌어도 RPC를 쏠 준비가 됐다는 보장은 없다
- **Setup 추적 단위는 Pair** — 한쪽 ServerIdx만으로는 어느 연결의 Setup인지 구분 불가
- **ServerType까지 내려가야 한다** — 한 인스턴스가 여러 ServerType을 담으면 Pair도 모호해짐
- **RPC Method에 방향 메타데이터** — Method 자체에 출발-도착 ServerType Pair가 박혀야 호출 시점 검증이 가능

## 추적 단위 에스컬레이션

| 단위 | 예시 | 문제 |
|------|------|------|
| ServerIdx | `A 완료` | A-B1 완료인지 A-B2 완료인지 구분 불가 |
| ServerIdx Pair | `A — B1 완료` | `A(X,Y)-B(X,Y)` 구성에서 어느 방향인지 모호 |
| (ServerIdx, ServerType) Pair | `A(X) — B(Y) 완료` | 실사용 호출 검증 가능 최소 단위 |
| + RPC Method 방향 | `A(X)→B(Y)`의 Method만 허용 | 반대 방향 Method 호출 시점 차단 |

한 인스턴스가 여러 ServerType을 담는 경우 (`A(X,Y)`), Pair만으로는 `A(X)-B(Y)` Setup인지 `A(Y)-B(X)` Setup인지 알 수 없음. 이를 해소하려면 ServerType도 추적 키에 포함.

## 네 가지 관리 입자 옵션

| 안 | 추적 단위 | 장점 | 단점 |
|----|-----------|------|------|
| 1 | (ServerIdx, ProxyService, ServerType) + Method별 방향 | 가장 정확, Method 단위 호출 검증 가능 | Method마다 ServerType Pair 메타데이터 필요 |
| 2 | (ServerIdx, ProxyService) | ProxyService 단위 완료 판단 — 구현 단순 | 한 방향만 준비돼도 양쪽 다 기다림 |
| 3 | ServerIdx | 가장 단순 | 무관한 ProxyService 지연이 전체 호출 차단 |
| 4 | ProxyService별 수제 구현 | ProxyService별 최적화 자유 | 공통화 이점 상실, 일관성 없음 |

## 권장 조합

- **기본값**: 1번 (최대 해상도). Method 방향 메타데이터는 [[service-rpc-topology]]의 정적 검증과 동일한 정보이므로 재활용 가능
- **Escape hatch**: ProxyService가 단순하면 2번으로 묶어 관리 허용
- **지양**: 3번/4번 — 3은 과도한 blocking, 4는 공통화 포기

## 메타데이터 재활용

RPC Method에 `(CallerServerType, TargetServerType)` Pair를 박는 작업은 두 가지 목적에 동시에 쓰임:

1. **[[service-rpc-topology]] 정적 검증** — 실제 호출 그래프에서 필요한 Pair 집합을 도출해 `[RpcPair]` 선언 누락 탐지
2. **Coordinator Setup 검증** — 호출 시점에 "이 방향의 Setup이 완료됐는가?"를 런타임에 질의

같은 메타데이터가 빌드 타임 검증과 런타임 게이트 양쪽을 지원하므로, 하나의 선언 메커니즘으로 묶어 설계하는 것이 경제적.

## 관련

- 블로그: [[coordinator-setup-phase]] 원문 글
- 상위 패턴: [[service-rpc-topology]] — RPC Pair 선언과 정적 검증
- 관련 개념: [[game-server-request-context]] — 요청 단위 컨텍스트 전파
