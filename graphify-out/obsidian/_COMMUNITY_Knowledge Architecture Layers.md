---
type: community
cohesion: 0.40
members: 5
---

# Knowledge Architecture Layers

**Cohesion:** 0.40 - moderately connected
**Members:** 5 nodes

## Members
- [[Agent-Navigable Wiki Output (wiki)]] - document - src/content/wiki/graphify.md
- [[LLM Wiki Three-Layer Architecture]] - document - raw/llm-wiki.md
- [[Raw Sources Layer]] - document - src/content/wiki/llm-wiki-pattern.md
- [[Schema Layer (CLAUDE.md  AGENTS.md)]] - document - src/content/wiki/llm-wiki-pattern.md
- [[Wiki Layer]] - document - src/content/wiki/llm-wiki-pattern.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Knowledge_Architecture_Layers
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Wiki Operations (IngestQueryLint)]]
- 1 edge to [[_COMMUNITY_graphify Output Layer]]
- 1 edge to [[_COMMUNITY_LLM Memory & Knowledge]]

## Top bridge nodes
- [[LLM Wiki Three-Layer Architecture]] - degree 4, connects to 1 community
- [[Wiki Layer]] - degree 3, connects to 1 community
- [[Agent-Navigable Wiki Output (wiki)]] - degree 2, connects to 1 community
- [[Raw Sources Layer]] - degree 2, connects to 1 community
- [[Schema Layer (CLAUDE.md  AGENTS.md)]] - degree 2, connects to 1 community