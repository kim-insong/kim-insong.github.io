# Wiki Graph Build Script

> 21 nodes · cohesion 0.13

## Key Concepts

- **serve.py** (10 connections) — `tools/graphify/serve.py`
- **serve()** (6 connections) — `tools/graphify/serve.py`
- **main()** (4 connections) — `scripts/build-wiki-graph.js`
- **sanitize_label()** (4 connections) — `tools/graphify/security.py`
- **_find_node()** (4 connections) — `tools/graphify/serve.py`
- **_subgraph_to_text()** (4 connections) — `tools/graphify/serve.py`
- **build-wiki-graph.js** (3 connections) — `scripts/build-wiki-graph.js`
- **_communities_from_graph()** (3 connections) — `tools/graphify/serve.py`
- **_filter_blank_stdin()** (3 connections) — `tools/graphify/serve.py`
- **_score_nodes()** (3 connections) — `tools/graphify/serve.py`
- **_strip_diacritics()** (3 connections) — `tools/graphify/serve.py`
- **pageResolver()** (2 connections) — `scripts/build-wiki-graph.js`
- **parseFrontmatter()** (2 connections) — `scripts/build-wiki-graph.js`
- **_load_graph()** (2 connections) — `tools/graphify/serve.py`
- **Strip control characters and cap length.      Safe for embedding in JSON data (i** (1 connections) — `tools/graphify/security.py`
- **_dfs()** (1 connections) — `tools/graphify/serve.py`
- **Return node IDs whose label or ID matches the search term (diacritic-insensitive** (1 connections) — `tools/graphify/serve.py`
- **Filter blank lines from stdin before MCP reads it.      Some MCP clients (Claude** (1 connections) — `tools/graphify/serve.py`
- **Start the MCP server. Requires pip install mcp.** (1 connections) — `tools/graphify/serve.py`
- **Reconstruct community dict from community property stored on nodes.** (1 connections) — `tools/graphify/serve.py`
- **Render subgraph as text, cutting at token_budget (approx 3 chars/token).** (1 connections) — `tools/graphify/serve.py`

## Relationships

- [[Graphify Audit Trail Design]] (55 shared connections)
- [[insong.net Site & Profile]] (3 shared connections)
- [[Precomputed Timeline Dispatch]] (1 shared connections)
- [[Graphify AST Extractors]] (1 shared connections)

## Source Files

- `scripts/build-wiki-graph.js`
- `tools/graphify/security.py`
- `tools/graphify/serve.py`

## Audit Trail

- EXTRACTED: 52 (87%)
- INFERRED: 8 (13%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*