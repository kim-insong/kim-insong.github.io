---
type: community
cohesion: 0.36
members: 9
---

# Wiki Output Module

**Cohesion:** 0.36 - loosely connected
**Members:** 9 nodes

## Members
- [[Generate a Wikipedia-style wiki from the graph.      Writes       - index]] - rationale - tools/graphify/wiki.py
- [[Return (community_label, edge_count) pairs for cross-community connections, sort]] - rationale - tools/graphify/wiki.py
- [[_community_article()]] - code - tools/graphify/wiki.py
- [[_cross_community_links()]] - code - tools/graphify/wiki.py
- [[_god_node_article()]] - code - tools/graphify/wiki.py
- [[_index_md()]] - code - tools/graphify/wiki.py
- [[_safe_filename()_1]] - code - tools/graphify/wiki.py
- [[to_wiki()]] - code - tools/graphify/wiki.py
- [[wiki.py]] - code - tools/graphify/wiki.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Wiki_Output_Module
SORT file.name ASC
```
