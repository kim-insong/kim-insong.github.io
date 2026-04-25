---
type: community
cohesion: 0.29
members: 7
---

# Wiki Auto-Ingest Hook

**Cohesion:** 0.29 - loosely connected
**Members:** 7 nodes

## Members
- [[Incorporated sources table]] - document - wiki-log.md
- [[Modified source ingest flow (section-scoped update)]] - document - CLAUDE.md
- [[New source ingest flow (Unincorporated - MERGECREATE)]] - document - CLAUDE.md
- [[Source ID path convention]] - document - CLAUDE.md
- [[Unincorporated sources table]] - document - wiki-log.md
- [[Wiki Auto-Ingest hook rule]] - document - CLAUDE.md
- [[WIKI_AUTO_INGEST path PostToolUse marker]] - document - CLAUDE.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Wiki_Auto-Ingest_Hook
SORT file.name ASC
```
