# Design Data in Engine

> 29 nodes · cohesion 0.08

## Key Concepts

- **게임 서버 요청 컨텍스트 패턴** (5 connections) — `src/content/wiki/game-server-request-context.md`
- **RequestContext 구조체 (C++)** (5 connections) — `src/content/wiki/game-server-request-context.md`
- **Redis 랭킹과 스냅샷 패턴** (5 connections) — `src/content/wiki/redis-leaderboard-snapshot.md`
- **게임 기획데이터 관리 원칙** (4 connections) — `src/content/wiki/design-data-in-engine.md`
- **게임 엔진 안의 기획데이터 문제** (4 connections) — `src/content/blog/design-data-in-engine.md`
- **진입점 분류 (패킷/운영툴/자동이벤트)** (4 connections) — `src/content/wiki/game-server-request-context.md`
- **게임 서버 요청 컨텍스트 전파** (4 connections) — `src/content/blog/game-server-request-context.md`
- **리더보드 스냅샷 패턴** (4 connections) — `src/content/wiki/leaderboard-snapshot.md`
- **두 개의 sorted set 동시 쓰기** (3 connections) — `src/content/blog/leaderboard-snapshot.md`
- **실시간 vs 스냅샷 랭킹** (3 connections) — `src/content/blog/leaderboard-snapshot.md`
- **클라이언트 원본 시 순환 참조 패턴** (2 connections) — `src/content/wiki/design-data-in-engine.md`
- **순환 참조 문제** (2 connections) — `src/content/blog/design-data-in-engine.md`
- **기획데이터를 독립으로 두는 이유** (2 connections) — `src/content/blog/design-data-in-engine.md`
- **스키마 export 방식 (임시 해결책)** (2 connections) — `src/content/wiki/design-data-in-engine.md`
- **언리얼 path를 key로 쓸 수 없음** (2 connections) — `src/content/blog/design-data-in-engine.md`
- **스냅샷 A/B 순환 교체 (leaderboard-snapshot)** (2 connections) — `src/content/wiki/leaderboard-snapshot.md`
- **이중 sorted set 스냅샷 패턴 (leaderboard-snapshot)** (2 connections) — `src/content/wiki/leaderboard-snapshot.md`
- **스냅샷 A/B 교체 패턴** (2 connections) — `src/content/wiki/redis-leaderboard-snapshot.md`
- **이중 sorted set 스냅샷 패턴** (2 connections) — `src/content/wiki/redis-leaderboard-snapshot.md`
- **Blog: design-data-in-engine** (1 connections) — `src/content/wiki/design-data-in-engine.md`
- **enum 발급 주체 구분** (1 connections) — `src/content/blog/design-data-in-engine.md`
- **컨텍스트가 흐르며 쌓이는 이유** (1 connections) — `src/content/blog/game-server-request-context.md`
- **Blog: game-server-request-context** (1 connections) — `src/content/wiki/game-server-request-context.md`
- **초기 설계가 나중 로깅 비용을 줄이는 이유** (1 connections) — `src/content/blog/game-server-request-context.md`
- **A/B snapshot 스왑** (1 connections) — `src/content/blog/leaderboard-snapshot.md`
- *... and 4 more nodes in this community*

## Relationships

- [[Wiki ADR & Code Convention]] (1 shared connections)

## Source Files

- `src/content/blog/design-data-in-engine.md`
- `src/content/blog/game-server-request-context.md`
- `src/content/blog/leaderboard-snapshot.md`
- `src/content/wiki/design-data-in-engine.md`
- `src/content/wiki/game-server-request-context.md`
- `src/content/wiki/leaderboard-snapshot.md`
- `src/content/wiki/redis-leaderboard-snapshot.md`

## Audit Trail

- EXTRACTED: 56 (81%)
- INFERRED: 13 (19%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*