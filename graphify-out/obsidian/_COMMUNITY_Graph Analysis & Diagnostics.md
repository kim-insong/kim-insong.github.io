---
type: community
cohesion: 0.04
members: 73
---

# Graph Analysis & Diagnostics

**Cohesion:** 0.04 - loosely connected
**Members:** 73 nodes

## Members
- [[Community detection on NetworkX graphs. Uses Leiden (graspologic) if available,]] - rationale - tools/graphify/cluster.py
- [[Compare two graph snapshots and return what changed.      Returns         {]] - rationale - tools/graphify/analyze.py
- [[Context manager to suppress stdoutstderr during library calls.      graspologic]] - rationale - tools/graphify/cluster.py
- [[Cross-file edges between real codedoc entities, ranked by a composite     surpr]] - rationale - tools/graphify/analyze.py
- [[Escape a string for safe embedding in a Cypher single-quoted literal.]] - rationale - tools/graphify/export.py
- [[Export graph as GraphML - opens in Gephi, yEd, and any GraphML-compatible tool.]] - rationale - tools/graphify/export.py
- [[Export graph as an Obsidian vault - one .md file per node with wikilinks,]] - rationale - tools/graphify/export.py
- [[Export graph as an SVG file using matplotlib + spring layout.      Lightweight a]] - rationale - tools/graphify/export.py
- [[Find connections that are genuinely surprising - not obvious from file structure]] - rationale - tools/graphify/analyze.py
- [[For single-source corpora find edges that bridge different communities.     The]] - rationale - tools/graphify/analyze.py
- [[Generate an interactive vis.js HTML visualization of the graph.      Features n]] - rationale - tools/graphify/export.py
- [[Generate questions the graph is uniquely positioned to answer.     Based on AMB]] - rationale - tools/graphify/analyze.py
- [[Graph analysis god nodes (most connected), surprising connections (cross-commun]] - rationale - tools/graphify/analyze.py
- [[Invert communities dict node_id - community_id.]] - rationale - tools/graphify/analyze.py
- [[Mirrors export.safe_name so community hub filenames and report wikilinks always]] - rationale - tools/graphify/report.py
- [[Push graph directly to a running Neo4j instance via the Python driver.      Requ]] - rationale - tools/graphify/export.py
- [[Ratio of actual intra-community edges to maximum possible.]] - rationale - tools/graphify/cluster.py
- [[Re-run AST extraction + build + cluster + report for code files. No LLM needed.]] - rationale - tools/graphify/watch.py
- [[Remove edges whose source or target node is not in the node set.      Returns th]] - rationale - tools/graphify/export.py
- [[Return True if this node is a file-level hub node (e.g. 'client', 'models')]] - rationale - tools/graphify/analyze.py
- [[Return True if this node is a manually-injected semantic concept node     rather]] - rationale - tools/graphify/analyze.py
- [[Return the first path component - used to detect cross-repo edges.]] - rationale - tools/graphify/analyze.py
- [[Return the top_n most-connected real entities - the core abstractions.      File]] - rationale - tools/graphify/analyze.py
- [[Run Leiden community detection. Returns {community_id node_ids}.      Communi]] - rationale - tools/graphify/cluster.py
- [[Run a second Leiden pass on a community subgraph to split it further.]] - rationale - tools/graphify/cluster.py
- [[Run community detection. Returns {node_id community_id}.      Tries Leiden (gra]] - rationale - tools/graphify/cluster.py
- [[Score how surprising a cross-file edge is. Returns (score, reasons).]] - rationale - tools/graphify/analyze.py
- [[Store hyperedges in the graph's metadata dict.]] - rationale - tools/graphify/export.py
- [[Watch watch_path for new or modified files and auto-update the graph.      For c]] - rationale - tools/graphify/watch.py
- [[Write a flag file and print a notification (fallback for non-code-only corpora).]] - rationale - tools/graphify/watch.py
- [[_cross_community_surprises()]] - code - tools/graphify/analyze.py
- [[_cross_file_surprises()]] - code - tools/graphify/analyze.py
- [[_cypher_escape()]] - code - tools/graphify/export.py
- [[_file_category()]] - code - tools/graphify/analyze.py
- [[_has_non_code()]] - code - tools/graphify/watch.py
- [[_html_script()]] - code - tools/graphify/export.py
- [[_html_styles()]] - code - tools/graphify/export.py
- [[_hyperedge_script()]] - code - tools/graphify/export.py
- [[_is_concept_node()]] - code - tools/graphify/analyze.py
- [[_is_file_node()]] - code - tools/graphify/analyze.py
- [[_node_community_map()]] - code - tools/graphify/analyze.py
- [[_notify_only()]] - code - tools/graphify/watch.py
- [[_partition()]] - code - tools/graphify/cluster.py
- [[_rebuild_code()]] - code - tools/graphify/watch.py
- [[_safe_community_name()]] - code - tools/graphify/report.py
- [[_split_community()]] - code - tools/graphify/cluster.py
- [[_strip_diacritics()_1]] - code - tools/graphify/export.py
- [[_suppress_output()]] - code - tools/graphify/cluster.py
- [[_surprise_score()]] - code - tools/graphify/analyze.py
- [[_top_level_dir()]] - code - tools/graphify/analyze.py
- [[analyze.py]] - code - tools/graphify/analyze.py
- [[attach_hyperedges()]] - code - tools/graphify/export.py
- [[cluster()]] - code - tools/graphify/cluster.py
- [[cluster.py]] - code - tools/graphify/cluster.py
- [[cohesion_score()]] - code - tools/graphify/cluster.py
- [[export.py]] - code - tools/graphify/export.py
- [[generate()]] - code - tools/graphify/report.py
- [[god_nodes()]] - code - tools/graphify/analyze.py
- [[graph_diff()]] - code - tools/graphify/analyze.py
- [[prune_dangling_edges()]] - code - tools/graphify/export.py
- [[push_to_neo4j()]] - code - tools/graphify/export.py
- [[report.py]] - code - tools/graphify/report.py
- [[score_all()]] - code - tools/graphify/cluster.py
- [[suggest_questions()]] - code - tools/graphify/analyze.py
- [[surprising_connections()]] - code - tools/graphify/analyze.py
- [[to_cypher()]] - code - tools/graphify/export.py
- [[to_graphml()]] - code - tools/graphify/export.py
- [[to_html()]] - code - tools/graphify/export.py
- [[to_json()]] - code - tools/graphify/export.py
- [[to_obsidian()]] - code - tools/graphify/export.py
- [[to_svg()]] - code - tools/graphify/export.py
- [[watch()]] - code - tools/graphify/watch.py
- [[watch.py]] - code - tools/graphify/watch.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Graph_Analysis_&_Diagnostics
SORT file.name ASC
```

## Connections to other communities
- 8 edges to [[_COMMUNITY_CLI & Skill Installers]]
- 3 edges to [[_COMMUNITY_AST Language Extractors]]
- 2 edges to [[_COMMUNITY_Token Budget & Query Subgraph]]
- 1 edge to [[_COMMUNITY_Graph Builder Module]]
- 1 edge to [[_COMMUNITY_URL Ingest Pipeline]]
- 1 edge to [[_COMMUNITY_File Detection & Conversion]]

## Top bridge nodes
- [[_rebuild_code()]] - degree 15, connects to 5 communities
- [[to_html()]] - degree 8, connects to 2 communities
- [[export.py]] - degree 15, connects to 1 community
- [[suggest_questions()]] - degree 8, connects to 1 community
- [[god_nodes()]] - degree 6, connects to 1 community