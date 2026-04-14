---
type: community
cohesion: 0.32
members: 8
---

# Redis 랭킹 & 스냅샷

**Cohesion:** 0.32 - loosely connected
**Members:** 8 nodes

## Members
- [[Blog leaderboard-snapshot]] - document - src/content/wiki/leaderboard-snapshot.md
- [[Redis sorted set 실시간 랭킹]] - document - src/content/wiki/redis-leaderboard-snapshot.md
- [[Redis 랭킹과 스냅샷 패턴]] - document - src/content/wiki/redis-leaderboard-snapshot.md
- [[리더보드 스냅샷 패턴]] - document - src/content/wiki/leaderboard-snapshot.md
- [[스냅샷 AB 교체 패턴]] - document - src/content/wiki/redis-leaderboard-snapshot.md
- [[스냅샷 AB 순환 교체 (leaderboard-snapshot)]] - document - src/content/wiki/leaderboard-snapshot.md
- [[이중 sorted set 스냅샷 패턴]] - document - src/content/wiki/redis-leaderboard-snapshot.md
- [[이중 sorted set 스냅샷 패턴 (leaderboard-snapshot)]] - document - src/content/wiki/leaderboard-snapshot.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Redis_랭킹_&_스냅샷
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_게임 서버 요청 추적]]

## Top bridge nodes
- [[Redis 랭킹과 스냅샷 패턴]] - degree 5, connects to 1 community