---
type: community
cohesion: 0.20
members: 11
---

# Game Plan Data Architecture

**Cohesion:** 0.20 - loosely connected
**Members:** 11 nodes

## Members
- [[AB snapshot 스왑]] - document - src/content/blog/leaderboard-snapshot.md
- [[Redis sorted set]] - document - src/content/blog/leaderboard-snapshot.md
- [[enum 발급 주체 구분]] - document - src/content/blog/design-data-in-engine.md
- [[게임 서버 요청 컨텍스트 전파]] - document - src/content/blog/game-server-request-context.md
- [[게임 엔진 안의 기획데이터 문제]] - document - src/content/blog/design-data-in-engine.md
- [[기획데이터를 독립으로 두는 이유]] - document - src/content/blog/design-data-in-engine.md
- [[두 개의 sorted set 동시 쓰기]] - document - src/content/blog/leaderboard-snapshot.md
- [[순환 참조 문제]] - document - src/content/blog/design-data-in-engine.md
- [[실시간 vs 스냅샷 랭킹]] - document - src/content/blog/leaderboard-snapshot.md
- [[언리얼 path를 key로 쓸 수 없음]] - document - src/content/blog/design-data-in-engine.md
- [[전체 복사 대신 두 곳에 쓰는 이유]] - document - src/content/blog/leaderboard-snapshot.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Game_Plan_Data_Architecture
SORT file.name ASC
```
