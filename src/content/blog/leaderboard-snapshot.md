---
title: "실시간 랭킹이 스냅샷 랭킹보다 구현이 쉽다"
description: "Redis sorted set으로 실시간 랭킹은 그냥 되는데, 스냅샷은 왜 이렇게 복잡한가."
publishDate: 2026-04-13
tags: ["game-dev", "server", "redis", "ranking"]
draft: false
---

실시간 랭킹 구현 얘기가 나오면 어렵겠다는 반응이 먼저 나온다. 근데 실제로는 반대다. Redis sorted set 하나면 실시간 랭킹은 그냥 된다. 복잡한 건 스냅샷이다.

## 실시간 랭킹은 Redis 한 줄이다

Redis의 sorted set은 점수 기반 자동 정렬 자료구조다. 점수를 업데이트하면 순위가 즉시 반영된다.

```
ZADD leaderboard:season1 4200 player:1042
ZREVRANK leaderboard:season1 player:1042   # 현재 순위 반환
ZREVRANGE leaderboard:season1 0 99 WITHSCORES  # 상위 100명
```

점수 갱신, 순위 조회, 상위 N명 조회 전부 O(log N)이다. 서버에서 할 일은 점수가 바뀔 때마다 `ZADD`를 호출하는 것뿐이다. 실시간 랭킹은 여기서 끝난다.

## 스냅샷이 어려운 이유

문제는 "시즌 종료 시점의 랭킹"처럼 특정 시점을 기준으로 고정된 랭킹을 보여줘야 할 때다.

가장 단순한 방법은 그 시점에 sorted set 전체를 복사하는 것이다. 플레이어가 수십만 명이면 복사 자체에 시간이 걸린다. 복사가 끝나기 전에 유저가 랭킹을 조회하면 이전 시즌 데이터가 섞이거나, 조회를 막아야 한다. 복사 중에 점수가 갱신되면 일관성도 깨진다.

전체 사본을 만드는 방식은 규모가 커질수록 점점 쓰기 어렵다.

## 두 개의 sorted set으로 복사 없이 스냅샷 만들기

복사 대신, 처음부터 두 개의 sorted set을 동시에 운영한다.

- `leaderboard:live` — 현재 시즌 점수를 계속 누적
- `leaderboard:snapshot` — 스냅샷 시점까지만 누적하다 멈춤

시즌이 진행되는 동안은 두 곳에 모두 `ZADD`한다. 스냅샷 기준 시각이 되면 `leaderboard:snapshot`으로의 쓰기만 중단한다. `leaderboard:live`는 다음 시즌 점수를 계속 받는다.

```
# 평소: 두 곳에 동시에 쓴다
ZADD leaderboard:live 4200 player:1042
ZADD leaderboard:snapshot 4200 player:1042

# 스냅샷 시점 이후: snapshot 쓰기 중단
ZADD leaderboard:live 4800 player:1042  # live만 갱신
# snapshot은 더 이상 건드리지 않는다
```

전체 복사가 없으니 딜레이가 없다. 스냅샷 시각에 쓰기 대상을 하나 빼는 것뿐이다. 유저는 `leaderboard:snapshot`을 조회하면 그 시점 기준의 정확한 랭킹을 본다.

## 스냅샷 교체도 두 개를 번갈아 쓴다

다음 스냅샷으로 교체할 때도 같은 방식이다. snapshot용 sorted set을 두 개 두고 번갈아 사용한다.

```
leaderboard:snapshot:A
leaderboard:snapshot:B
```

현재 A가 활성 스냅샷이면, 다음 시즌 동안 B를 새로 누적한다. 교체 시점에 활성 포인터만 B로 바꾼다. A는 유저 조회가 완전히 빠진 뒤 초기화해서 그다음 시즌에 재사용한다.

```
# 현재 활성: A
# B에 다음 시즌 데이터 누적 중
SET leaderboard:active "B"   # 스왑
DEL leaderboard:snapshot:A   # A 초기화 (조회 트래픽 빠진 뒤)
```

유저 입장에서 랭킹 교체 순간에 빈 화면이나 딜레이가 없다. 서버 입장에서는 전체 데이터를 복사하거나 잠그는 작업이 없다.

실시간 랭킹은 Redis가 원래 잘 하는 일이라 어렵지 않다. 복잡한 건 "이 시점의 랭킹"을 빠르게 보여주는 것이고, 그 해법은 복사가 아니라 처음부터 두 곳에 쓰는 것이다.
