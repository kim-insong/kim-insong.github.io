---
type: community
cohesion: 0.07
members: 38
---

# Token Budget & Query Subgraph

**Cohesion:** 0.07 - loosely connected
**Members:** 38 nodes

## Members
- [[Check semantic extraction cache for a list of absolute file paths.      Returns]] - rationale - tools/graphify/cache.py
- [[Delete all graphify-outcache.json files.]] - rationale - tools/graphify/cache.py
- [[Export graph as an Obsidian Canvas file - communities as groups, nodes as cards.]] - rationale - tools/graphify/export.py
- [[Extract AST nodes and edges from a list of code files.      Two-pass process]] - rationale - tools/graphify/extract.py
- [[Measure token reduction corpus tokens vs graphify query tokens.      Args]] - rationale - tools/graphify/benchmark.py
- [[Print a human-readable benchmark report.]] - rationale - tools/graphify/benchmark.py
- [[Raise a clear error if tree-sitter is too old for the new Language API.]] - rationale - tools/graphify/extract.py
- [[Return cached extraction for this file if hash matches, else None.      Cache ke]] - rationale - tools/graphify/cache.py
- [[Return set of file paths that have a valid cache entry (hash still matches).]] - rationale - tools/graphify/cache.py
- [[Returns graphify-outcache - creates it if needed.]] - rationale - tools/graphify/cache.py
- [[Run BFS from best-matching nodes and return estimated tokens in the subgraph con]] - rationale - tools/graphify/benchmark.py
- [[SHA256 of file contents + path relative to root.      Using a relative path (not]] - rationale - tools/graphify/cache.py
- [[Save extraction result for this file.      Stores as graphify-outcache{hash}.j]] - rationale - tools/graphify/cache.py
- [[Save semantic extraction results to cache, keyed by source_file.      Groups nod]] - rationale - tools/graphify/cache.py
- [[Strip YAML frontmatter from Markdown content, returning only the body.]] - rationale - tools/graphify/cache.py
- [[Token-reduction benchmark - measures how much context graphify saves vs naive fu]] - rationale - tools/graphify/benchmark.py
- [[WikiGraph.tsx]] - code - src/components/WikiGraph.tsx
- [[_bfs()]] - code - tools/graphify/serve.py
- [[_body_content()]] - code - tools/graphify/cache.py
- [[_check_tree_sitter_version()]] - code - tools/graphify/extract.py
- [[_estimate_tokens()]] - code - tools/graphify/benchmark.py
- [[_query_subgraph_tokens()]] - code - tools/graphify/benchmark.py
- [[benchmark.py]] - code - tools/graphify/benchmark.py
- [[cache.py]] - code - tools/graphify/cache.py
- [[cache_dir()]] - code - tools/graphify/cache.py
- [[cached_files()]] - code - tools/graphify/cache.py
- [[check_semantic_cache()]] - code - tools/graphify/cache.py
- [[clear_cache()]] - code - tools/graphify/cache.py
- [[drawNode()]] - code - src/components/WikiGraph.tsx
- [[extract()]] - code - tools/graphify/extract.py
- [[file_hash()]] - code - tools/graphify/cache.py
- [[load_cached()]] - code - tools/graphify/cache.py
- [[print_benchmark()]] - code - tools/graphify/benchmark.py
- [[run_benchmark()]] - code - tools/graphify/benchmark.py
- [[save_cached()]] - code - tools/graphify/cache.py
- [[save_semantic_cache()]] - code - tools/graphify/cache.py
- [[to_canvas()]] - code - tools/graphify/export.py
- [[update()]] - code - src/components/WikiGraph.tsx

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Token_Budget_&_Query_Subgraph
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_AST Language Extractors]]
- 3 edges to [[_COMMUNITY_CLI & Skill Installers]]
- 2 edges to [[_COMMUNITY_Graph Analysis & Diagnostics]]

## Top bridge nodes
- [[extract()]] - degree 7, connects to 2 communities
- [[cache.py]] - degree 10, connects to 1 community
- [[file_hash()]] - degree 7, connects to 1 community
- [[run_benchmark()]] - degree 4, connects to 1 community
- [[print_benchmark()]] - degree 3, connects to 1 community