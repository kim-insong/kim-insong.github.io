---
type: community
cohesion: 0.27
members: 10
---

# Graph Builder Module

**Cohesion:** 0.27 - loosely connected
**Members:** 10 nodes

## Members
- [[Build a NetworkX graph from an extraction dict.      directed=True produces a Di]] - rationale - tools/graphify/build.py
- [[Merge multiple extraction results into one graph.      directed=True produces a]] - rationale - tools/graphify/build.py
- [[Raise ValueError with all errors if extraction is invalid.]] - rationale - tools/graphify/validate.py
- [[Validate an extraction JSON dict against the graphify schema.     Returns a list]] - rationale - tools/graphify/validate.py
- [[assert_valid()]] - code - tools/graphify/validate.py
- [[build()]] - code - tools/graphify/build.py
- [[build.py]] - code - tools/graphify/build.py
- [[build_from_json()]] - code - tools/graphify/build.py
- [[validate.py]] - code - tools/graphify/validate.py
- [[validate_extraction()]] - code - tools/graphify/validate.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Graph_Builder_Module
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_Graph Analysis & Diagnostics]]
- 1 edge to [[_COMMUNITY_CLI & Skill Installers]]

## Top bridge nodes
- [[build_from_json()]] - degree 6, connects to 2 communities