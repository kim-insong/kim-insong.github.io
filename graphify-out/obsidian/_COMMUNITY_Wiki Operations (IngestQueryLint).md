---
type: community
cohesion: 0.29
members: 7
---

# Wiki Operations (Ingest/Query/Lint)

**Cohesion:** 0.29 - loosely connected
**Members:** 7 nodes

## Members
- [[Ingest Operation]] - document - src/content/wiki/llm-wiki-pattern.md
- [[LLM Wiki Pattern]] - document - src/content/wiki/llm-wiki-pattern.md
- [[Lint Operation]] - document - src/content/wiki/llm-wiki-pattern.md
- [[Query Operation]] - document - src/content/wiki/llm-wiki-pattern.md
- [[index.md Catalog]] - document - src/content/wiki/llm-wiki-pattern.md
- [[log.md Chronological Log]] - document - src/content/wiki/llm-wiki-pattern.md
- [[qmd Local Search Engine]] - document - src/content/wiki/llm-wiki-pattern.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Wiki_Operations_(Ingest/Query/Lint)
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_Knowledge Architecture Layers]]
- 2 edges to [[_COMMUNITY_LLM Memory & Knowledge]]
- 2 edges to [[_COMMUNITY_graphify Output Layer]]
- 1 edge to [[_COMMUNITY_Obsidian Integration]]

## Top bridge nodes
- [[LLM Wiki Pattern]] - degree 13, connects to 4 communities
- [[Lint Operation]] - degree 2, connects to 1 community