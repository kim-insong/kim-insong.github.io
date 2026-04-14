---
title: "Redis 랭킹과 스냅샷 패턴"
description: "Redis sorted set 기반 실시간 랭킹과 복사 없는 스냅샷 구현 패턴"
publishDate: 2026-04-13
updatedDate: 2026-04-13
tags: ["game-dev", "server", "redis", "ranking"]
sources: ["blog:leaderboard-snapshot"]
---

## 실시간 랭킹

Redis sorted set은 점수 기반 자동 정렬 자료구조다. 모든 연산 O(log N).

```
ZADD leaderboard:season1 4200 player:1042         # 점수 갱신
ZREVRANK leaderboard:season1 player:1042          # 현재 순위
ZREVRANGE leaderboard:season1 0 99 WITHSCORES     # 상위 100명
```

점수 갱신 시마다 `ZADD` 호출만으로 실시간 순위 반영이 완료된다.

---

## 스냅샷 랭킹

"시즌 종료 시점의 랭킹"처럼 특정 시점 기준의 고정 랭킹.

### 단순 복사 방식의 문제

- 플레이어 수십만 명이면 복사 시간이 길어짐
- 복사 중 점수 갱신 시 일관성 깨짐
- 복사 완료 전 조회 요청 처리 불가

### 두 개의 sorted set 동시 운영

복사 대신 처음부터 두 set에 동시에 쓰고, 스냅샷 기준 시각에 한쪽 쓰기만 중단.

```
# 평소: 두 곳에 동시에 쓴다
ZADD leaderboard:live 4200 player:1042
ZADD leaderboard:snapshot 4200 player:1042

# 스냅샷 시점 이후: snapshot 쓰기 중단
ZADD leaderboard:live 4800 player:1042  # live만 갱신
```

- `leaderboard:live` — 현재 시즌 점수 계속 누적
- `leaderboard:snapshot` — 스냅샷 시각까지만 누적 후 동결

전체 복사 없음 → 딜레이 없음. 스냅샷 교체는 쓰기 대상에서 제외하는 것뿐.

---

## 스냅샷 교체 (A/B 방식)

snapshot용 sorted set을 두 개 번갈아 사용.

```
leaderboard:snapshot:A   # 현재 활성
leaderboard:snapshot:B   # 다음 시즌 누적 중
```

교체 시:

```
SET leaderboard:active "B"    # 활성 포인터 전환
DEL leaderboard:snapshot:A    # 조회 트래픽 빠진 뒤 초기화
```

- 유저: 교체 순간 빈 화면·딜레이 없음
- 서버: 전체 복사·잠금 없음

---

## 관련 항목

- [[game-server-request-context]]
