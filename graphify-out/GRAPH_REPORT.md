# Graph Report - src/content/wiki/ raw/  (2026-04-14)

## Corpus Check
- 12 files · ~5,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 61 nodes · 70 edges · 12 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_graphify Output Layer|graphify Output Layer]]
- [[_COMMUNITY_Claude Skills & Game Server|Claude Skills & Game Server]]
- [[_COMMUNITY_Redis Leaderboard Patterns|Redis Leaderboard Patterns]]
- [[_COMMUNITY_Wiki Operations (IngestQueryLint)|Wiki Operations (Ingest/Query/Lint)]]
- [[_COMMUNITY_graphify Pipeline (AST + Semantic)|graphify Pipeline (AST + Semantic)]]
- [[_COMMUNITY_Knowledge Architecture Layers|Knowledge Architecture Layers]]
- [[_COMMUNITY_iOS App Development|iOS App Development]]
- [[_COMMUNITY_LLM Memory & Knowledge|LLM Memory & Knowledge]]
- [[_COMMUNITY_Game Data Architecture|Game Data Architecture]]
- [[_COMMUNITY_Getting Started|Getting Started]]
- [[_COMMUNITY_graphify Enterprise (Penpax)|graphify Enterprise (Penpax)]]
- [[_COMMUNITY_Obsidian Integration|Obsidian Integration]]

## God Nodes (most connected - your core abstractions)
1. `graphify Tool` - 14 edges
2. `LLM Wiki Pattern` - 13 edges
3. `게임 서버 요청 컨텍스트 패턴` - 5 edges
4. `Redis 랭킹과 스냅샷 패턴` - 5 edges
5. `LLM Wiki Core Idea (Persistent Compounding Knowledge)` - 5 edges
6. `게임 기획데이터 관리 원칙` - 4 edges
7. `리더보드 스냅샷 패턴` - 4 edges
8. `LLM Wiki Three-Layer Architecture` - 4 edges
9. `Claude 스킬 자동 피드백 루프` - 3 edges
10. `진입점 분류 (패킷/운영툴/자동이벤트)` - 3 edges

## Surprising Connections (you probably didn't know these)
- `tree-sitter AST Parser` --semantically_similar_to--> `Deterministic AST Pass (tree-sitter)`  [INFERRED] [semantically similar]
  raw/graphify.md → src/content/wiki/graphify.md
- `Claude/GPT API (semantic extraction)` --semantically_similar_to--> `Claude/GPT Semantic Extraction`  [INFERRED] [semantically similar]
  raw/graphify.md → src/content/wiki/graphify.md
- `LLM Wiki Pattern` --references--> `LLM Wiki Core Idea (Persistent Compounding Knowledge)`  [INFERRED]
  src/content/wiki/llm-wiki-pattern.md → raw/llm-wiki.md
- `graphify Tool` --references--> `graphify (raw source)`  [INFERRED]
  src/content/wiki/graphify.md → raw/graphify.md
- `게임 서버 요청 컨텍스트 패턴` --semantically_similar_to--> `게임 기획데이터 관리 원칙`  [INFERRED] [semantically similar]
  src/content/wiki/game-server-request-context.md → src/content/wiki/design-data-in-engine.md

## Communities

### Community 0 - "graphify Output Layer"
Cohesion: 0.22
Nodes (9): Git Hook Integration, graph.html Interactive Visualization, graph.json Persistent Graph Data, GRAPH_REPORT.md, graphify Tool, Leiden Clustering (Community Detection), Relationship Tagging (EXTRACTED/INFERRED/AMBIGUOUS), SHA256-based Incremental Caching (+1 more)

### Community 1 - "Claude Skills & Game Server"
Cohesion: 0.29
Nodes (8): Claude 스킬 자동 피드백 루프, 자동 감지 + 사람 확인 패턴, Blog: ai-skill-feedback-loop, Hook 타이밍 불일치 (stop hook vs user-prompt-submit), 게임 서버 요청 컨텍스트 패턴, Blog: game-server-request-context, 진입점 분류 (패킷/운영툴/자동이벤트), RequestContext 구조체 (C++)

### Community 2 - "Redis Leaderboard Patterns"
Cohesion: 0.32
Nodes (8): 리더보드 스냅샷 패턴, 스냅샷 A/B 순환 교체 (leaderboard-snapshot), Blog: leaderboard-snapshot, 이중 sorted set 스냅샷 패턴 (leaderboard-snapshot), Redis 랭킹과 스냅샷 패턴, 스냅샷 A/B 교체 패턴, 이중 sorted set 스냅샷 패턴, Redis sorted set 실시간 랭킹

### Community 3 - "Wiki Operations (Ingest/Query/Lint)"
Cohesion: 0.29
Nodes (7): index.md Catalog, Ingest Operation, Lint Operation, log.md Chronological Log, qmd Local Search Engine, Query Operation, LLM Wiki Pattern

### Community 4 - "graphify Pipeline (AST + Semantic)"
Cohesion: 0.4
Nodes (5): Deterministic AST Pass (tree-sitter), Claude/GPT Semantic Extraction, Claude/GPT API (semantic extraction), graphify Processing Pipeline, tree-sitter AST Parser

### Community 5 - "Knowledge Architecture Layers"
Cohesion: 0.4
Nodes (5): Agent-Navigable Wiki Output (wiki/), Raw Sources Layer, Schema Layer (CLAUDE.md / AGENTS.md), Wiki Layer, LLM Wiki Three-Layer Architecture

### Community 6 - "iOS App Development"
Cohesion: 0.5
Nodes (4): iOS 앱 개발 스택 (2025), Blog: on-building-ios-apps, SwiftData (영속성 레이어), SwiftUI (기본 UI 레이어)

### Community 7 - "LLM Memory & Knowledge"
Cohesion: 0.5
Nodes (4): RAG (Retrieval-Augmented Generation), LLM Wiki Core Idea (Persistent Compounding Knowledge), Vannevar Bush Memex (1945), Tolkien Gateway (fan wiki reference)

### Community 8 - "Game Data Architecture"
Cohesion: 0.67
Nodes (4): 게임 기획데이터 관리 원칙, Blog: design-data-in-engine, 클라이언트 원본 시 순환 참조 패턴, 스키마 export 방식 (임시 해결책)

### Community 9 - "Getting Started"
Cohesion: 0.67
Nodes (3): 위키 시작하기, Blog: hello-world, raw/ 폴더 README — 위키 소스 관리 지침

### Community 10 - "graphify Enterprise (Penpax)"
Cohesion: 1.0
Nodes (2): Penpax (Enterprise graphify layer), graphify (raw source)

### Community 11 - "Obsidian Integration"
Cohesion: 1.0
Nodes (2): Obsidian Vault Output, Obsidian (Wiki IDE)

## Knowledge Gaps
- **26 isolated node(s):** `Blog: ai-skill-feedback-loop`, `Hook 타이밍 불일치 (stop hook vs user-prompt-submit)`, `Blog: game-server-request-context`, `Blog: hello-world`, `Blog: design-data-in-engine` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `graphify Enterprise (Penpax)`** (2 nodes): `Penpax (Enterprise graphify layer)`, `graphify (raw source)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Obsidian Integration`** (2 nodes): `Obsidian Vault Output`, `Obsidian (Wiki IDE)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `graphify Tool` connect `graphify Output Layer` to `Wiki Operations (Ingest/Query/Lint)`, `graphify Pipeline (AST + Semantic)`, `Knowledge Architecture Layers`, `graphify Enterprise (Penpax)`, `Obsidian Integration`?**
  _High betweenness centrality (0.208) - this node is a cross-community bridge._
- **Why does `LLM Wiki Pattern` connect `Wiki Operations (Ingest/Query/Lint)` to `graphify Output Layer`, `Obsidian Integration`, `Knowledge Architecture Layers`, `LLM Memory & Knowledge`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **Why does `게임 서버 요청 컨텍스트 패턴` connect `Claude Skills & Game Server` to `Game Data Architecture`, `Redis Leaderboard Patterns`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `graphify Tool` (e.g. with `LLM Wiki Pattern` and `graphify (raw source)`) actually correct?**
  _`graphify Tool` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `LLM Wiki Pattern` (e.g. with `graphify Tool` and `LLM Wiki Core Idea (Persistent Compounding Knowledge)`) actually correct?**
  _`LLM Wiki Pattern` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `LLM Wiki Core Idea (Persistent Compounding Knowledge)` (e.g. with `LLM Wiki Pattern` and `LLM Wiki Three-Layer Architecture`) actually correct?**
  _`LLM Wiki Core Idea (Persistent Compounding Knowledge)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Blog: ai-skill-feedback-loop`, `Hook 타이밍 불일치 (stop hook vs user-prompt-submit)`, `Blog: game-server-request-context` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._