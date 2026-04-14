# insong.net Knowledge Graph — Agent Index

> Entry point for AI agents navigating this knowledge base.  
> Generated: 2026-04-13 | Source: `src/content/wiki/` + `raw/`

## How to Navigate

1. **Start here** — this file maps all communities and their key concepts
2. **Go deeper** — read community files for topic-specific knowledge
3. **Cross-reference** — `GRAPH_REPORT.md` shows surprising connections and high-degree nodes
4. **Raw graph** — `../graph.json` has full node/edge data with confidence scores

## Communities

### [game-dev] 게임 서버 / 아키텍처 (15 nodes)
File: `communities/game-dev.md`

Core knowledge:
- **RequestContext pattern** — every server entry point (packet / GM command / scheduled event) issues a `RequestContext` struct with unique ID, player info, timestamps. Passed through entire handling flow for logging and debugging.
- **Design data independence** — game design data (monster types, item grades) must NOT be owned by client or server. Circular deps arise when client is the source of truth. Solution: independent design-data layer + schema-only export as stopgap.
- **Redis leaderboard + snapshot** — real-time ranking via sorted set (ZADD O(log N)), snapshot via dual sorted set A/B rotation. No copy delay; write halt at swap moment.

Key wiki pages:
- `src/content/wiki/game-server-request-context.md`
- `src/content/wiki/design-data-in-engine.md`
- `src/content/wiki/redis-leaderboard-snapshot.md`
- `src/content/wiki/leaderboard-snapshot.md`

---

### [ios] iOS / Apple 개발 (6 nodes)
File: `communities/ios.md`

Core knowledge:
- **2025 stack**: SwiftUI (no UIKit fallback needed), Swift Concurrency (async/await), SwiftData (lightweight persistence), Xcode Cloud (CI/CD)
- **SwiftUI is the default** — UIKit only as last resort for missing APIs

Key wiki pages:
- `src/content/wiki/ios-app-development.md`

---

### [claude-ai] Claude / AI 자동화 (4 nodes)
File: `communities/claude-ai.md`

Core knowledge:
- **Skill feedback loop** — idea: auto-update SKILL.md based on correction requests. Problem: user-prompt-submit hook has no prior response context; Stop hook fires after response is complete.
- **Safe architecture**: Stop hook detects correction pattern → proposes skill update → user approves → git commit. Never auto-write to skill files without review.
- **Skill files** should be git-tracked for rollback.

Key wiki pages:
- `src/content/wiki/claude-skill-feedback-loop.md`

---

### [meta] 위키 메타 / 워크플로우 (2 nodes)
File: `communities/meta.md`

Core knowledge:
- **raw/ directory** — drop unprocessed notes/research here. Run `/wiki-ingest` to convert to structured wiki pages.
- **Internal links** — `[[slug-name]]` syntax in wiki markdown becomes `/wiki/slug-name` URLs.

Key wiki pages:
- `src/content/wiki/getting-started.md`
- `raw/README.md`

---

## Graph Statistics

| Metric | Value |
|--------|-------|
| Total nodes | 27 |
| Total edges | 39 |
| EXTRACTED edges | 28 |
| INFERRED edges | 9 (confidence 0.65–0.9) |
| Communities | 4 |
| Largest community | game-dev (15 nodes) |

## Quick Queries

To answer common questions about this knowledge base:

- "게임 서버 아키텍처가 궁금하다" → read `communities/game-dev.md`
- "iOS 앱 개발 스택" → read `communities/ios.md`
- "Claude 자동화 패턴" → read `communities/claude-ai.md`
- "이 위키에 뭐가 있나?" → read `GRAPH_REPORT.md`
- "특정 노드 간 연결" → query `../graph.json` by node ID
