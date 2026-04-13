---
title: "리더보드 스냅샷 패턴"
description: "Redis sorted set 두 개로 복사 딜레이 없이 스냅샷 랭킹을 구현하는 패턴."
tags: ["game-dev", "server", "redis", "ranking"]
publishDate: 2026-04-13
draft: false
---

## 핵심 원칙

복사 없이 스냅샷을 만든다. 처음부터 두 개의 sorted set을 동시에 운영하고, 스냅샷 시점에 한쪽 쓰기만 중단한다.

## Redis 실시간 랭킹 기본

```
ZADD leaderboard:season1 <score> <playerId>   # 점수 갱신 (O log N)
ZREVRANK leaderboard:season1 <playerId>        # 현재 순위
ZREVRANGE leaderboard:season1 0 99 WITHSCORES # 상위 100명
```

모든 연산 O(log N). 갱신 즉시 순위 반영.

## 스냅샷 패턴 — 이중 sorted set

### 운영 구조

| Key | 역할 |
|-----|------|
| `leaderboard:live` | 현재 시즌 점수 계속 누적 |
| `leaderboard:snapshot` | 스냅샷 시점까지만 누적 후 쓰기 중단 |

### 평소 (시즌 진행 중)

```
ZADD leaderboard:live     <score> <playerId>
ZADD leaderboard:snapshot <score> <playerId>
```

### 스냅샷 확정 시점

```
# snapshot으로의 ZADD 중단
# live만 계속 갱신
ZADD leaderboard:live <score> <playerId>
```

유저는 `leaderboard:snapshot`을 조회 → 그 시점 기준 정확한 랭킹.

## 스냅샷 교체 — A/B 순환

snapshot용 sorted set을 두 개 두고 번갈아 사용.

```
leaderboard:snapshot:A   ← 현재 활성
leaderboard:snapshot:B   ← 다음 시즌 누적 중
```

교체 절차:
```
SET leaderboard:active "B"    # 포인터 스왑 (원자적)
# 트래픽이 B로 이동한 뒤
DEL leaderboard:snapshot:A    # A 초기화 → 다음 교체에 재사용
```

교체 순간 유저 조회 중단 없음. 전체 데이터 복사 없음.

## 언제 쓰는가

| 랭킹 유형 | 구현 방법 |
|-----------|-----------|
| 실시간 (항상 최신) | sorted set 1개, ZADD만 |
| 특정 시점 고정 스냅샷 | 이중 sorted set + 쓰기 중단 |
| 스냅샷 주기적 교체 | snapshot A/B 순환 |

## 관련

- 블로그: [[leaderboard-snapshot]] 원문 글
