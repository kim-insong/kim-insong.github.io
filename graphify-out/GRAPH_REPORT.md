# Graph Report - src/content/wiki/ + raw/  (2026-04-14)

## Corpus Check
- Corpus is ~1,658 words - fits in a single context window. You may not need a graph.

## Summary
- 27 nodes · 28 edges · 6 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Redis 랭킹 & 스냅샷|Redis 랭킹 & 스냅샷]]
- [[_COMMUNITY_기획데이터 아키텍처|기획데이터 아키텍처]]
- [[_COMMUNITY_게임 서버 요청 추적|게임 서버 요청 추적]]
- [[_COMMUNITY_Claude 스킬 자동화|Claude 스킬 자동화]]
- [[_COMMUNITY_iOS 앱 개발|iOS 앱 개발]]
- [[_COMMUNITY_위키 워크플로우|위키 워크플로우]]

## God Nodes (most connected - your core abstractions)
1. `게임 서버 요청 컨텍스트 패턴` - 5 edges
2. `Redis 랭킹과 스냅샷 패턴` - 5 edges
3. `게임 기획데이터 관리 원칙` - 4 edges
4. `리더보드 스냅샷 패턴` - 4 edges
5. `Claude 스킬 자동 피드백 루프` - 3 edges
6. `진입점 분류 (패킷/운영툴/자동이벤트)` - 3 edges
7. `iOS 앱 개발 스택 (2025)` - 3 edges
8. `자동 감지 + 사람 확인 패턴` - 2 edges
9. `RequestContext 구조체 (C++)` - 2 edges
10. `위키 시작하기` - 2 edges

## Surprising Connections (you probably didn't know these)
- `자동 감지 + 사람 확인 패턴` --semantically_similar_to--> `진입점 분류 (패킷/운영툴/자동이벤트)`  [INFERRED] [semantically similar]
  src/content/wiki/claude-skill-feedback-loop.md → src/content/wiki/game-server-request-context.md
- `게임 서버 요청 컨텍스트 패턴` --semantically_similar_to--> `게임 기획데이터 관리 원칙`  [INFERRED] [semantically similar]
  src/content/wiki/game-server-request-context.md → src/content/wiki/design-data-in-engine.md
- `raw/ 폴더 README — 위키 소스 관리 지침` --references--> `위키 시작하기`  [INFERRED]
  raw/README.md → src/content/wiki/getting-started.md
- `Redis 랭킹과 스냅샷 패턴` --semantically_similar_to--> `리더보드 스냅샷 패턴`  [INFERRED] [semantically similar]
  src/content/wiki/redis-leaderboard-snapshot.md → src/content/wiki/leaderboard-snapshot.md
- `이중 sorted set 스냅샷 패턴` --semantically_similar_to--> `이중 sorted set 스냅샷 패턴 (leaderboard-snapshot)`  [INFERRED] [semantically similar]
  src/content/wiki/redis-leaderboard-snapshot.md → src/content/wiki/leaderboard-snapshot.md

## Hyperedges (group relationships)
- **Redis 스냅샷 랭킹 구현 패턴** — redis_leaderboard_snapshot_sorted_set, redis_leaderboard_snapshot_dual_set, redis_leaderboard_snapshot_ab [EXTRACTED 0.95]
- **게임 서버 진입점 → RequestContext 흐름** — game_server_request_context_entry_points, game_server_request_context_struct, game_server_request_context [EXTRACTED 0.95]
- **기획데이터 독립 관리 패턴** — design_data_in_engine, design_data_in_engine_circular_dep, design_data_in_engine_schema_export [EXTRACTED 0.90]

## Communities

### Community 0 - "Redis 랭킹 & 스냅샷"
Cohesion: 0.32
Nodes (8): 리더보드 스냅샷 패턴, 스냅샷 A/B 순환 교체 (leaderboard-snapshot), Blog: leaderboard-snapshot, 이중 sorted set 스냅샷 패턴 (leaderboard-snapshot), Redis 랭킹과 스냅샷 패턴, 스냅샷 A/B 교체 패턴, 이중 sorted set 스냅샷 패턴, Redis sorted set 실시간 랭킹

### Community 1 - "기획데이터 아키텍처"
Cohesion: 0.67
Nodes (4): 게임 기획데이터 관리 원칙, Blog: design-data-in-engine, 클라이언트 원본 시 순환 참조 패턴, 스키마 export 방식 (임시 해결책)

### Community 2 - "게임 서버 요청 추적"
Cohesion: 0.67
Nodes (4): 게임 서버 요청 컨텍스트 패턴, Blog: game-server-request-context, 진입점 분류 (패킷/운영툴/자동이벤트), RequestContext 구조체 (C++)

### Community 3 - "Claude 스킬 자동화"
Cohesion: 0.5
Nodes (4): Claude 스킬 자동 피드백 루프, 자동 감지 + 사람 확인 패턴, Blog: ai-skill-feedback-loop, Hook 타이밍 불일치 (stop hook vs user-prompt-submit)

### Community 4 - "iOS 앱 개발"
Cohesion: 0.5
Nodes (4): iOS 앱 개발 스택 (2025), Blog: on-building-ios-apps, SwiftData (영속성 레이어), SwiftUI (기본 UI 레이어)

### Community 5 - "위키 워크플로우"
Cohesion: 0.67
Nodes (3): 위키 시작하기, Blog: hello-world, raw/ 폴더 README — 위키 소스 관리 지침

## Knowledge Gaps
- **11 isolated node(s):** `Blog: ai-skill-feedback-loop`, `Hook 타이밍 불일치 (stop hook vs user-prompt-submit)`, `Blog: game-server-request-context`, `Blog: hello-world`, `Blog: design-data-in-engine` (+6 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `게임 서버 요청 컨텍스트 패턴` connect `게임 서버 요청 추적` to `Redis 랭킹 & 스냅샷`, `기획데이터 아키텍처`?**
  _High betweenness centrality (0.375) - this node is a cross-community bridge._
- **Why does `Redis 랭킹과 스냅샷 패턴` connect `Redis 랭킹 & 스냅샷` to `게임 서버 요청 추적`?**
  _High betweenness centrality (0.290) - this node is a cross-community bridge._
- **Why does `진입점 분류 (패킷/운영툴/자동이벤트)` connect `게임 서버 요청 추적` to `Claude 스킬 자동화`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **What connects `Blog: ai-skill-feedback-loop`, `Hook 타이밍 불일치 (stop hook vs user-prompt-submit)`, `Blog: game-server-request-context` to the rest of the system?**
  _11 weakly-connected nodes found - possible documentation gaps or missing edges._