# Obsidian Export & Traversal

> 27 nodes · cohesion 0.09

## Key Concepts

- **serve.py** (10 connections) — `tools/graphify/serve.py`
- **serve()** (6 connections) — `tools/graphify/serve.py`
- **update()** (5 connections) — `src/components/WikiGraph.tsx`
- **main()** (4 connections) — `scripts/build-wiki-graph.js`
- **sanitize_label()** (4 connections) — `tools/graphify/security.py`
- **_find_node()** (4 connections) — `tools/graphify/serve.py`
- **_subgraph_to_text()** (4 connections) — `tools/graphify/serve.py`
- **to_canvas()** (3 connections) — `tools/graphify/export.py`
- **build-wiki-graph.js** (3 connections) — `scripts/build-wiki-graph.js`
- **_communities_from_graph()** (3 connections) — `tools/graphify/serve.py`
- **_filter_blank_stdin()** (3 connections) — `tools/graphify/serve.py`
- **_score_nodes()** (3 connections) — `tools/graphify/serve.py`
- **_strip_diacritics()** (3 connections) — `tools/graphify/serve.py`
- **pageResolver()** (2 connections) — `scripts/build-wiki-graph.js`
- **parseFrontmatter()** (2 connections) — `scripts/build-wiki-graph.js`
- **_bfs()** (2 connections) — `tools/graphify/serve.py`
- **_load_graph()** (2 connections) — `tools/graphify/serve.py`
- **WikiGraph.tsx** (2 connections) — `src/components/WikiGraph.tsx`
- **Export graph as an Obsidian Canvas file - communities as groups, nodes as cards.** (1 connections) — `tools/graphify/export.py`
- **Strip control characters and cap length.      Safe for embedding in JSON data (i** (1 connections) — `tools/graphify/security.py`
- **_dfs()** (1 connections) — `tools/graphify/serve.py`
- **Return node IDs whose label or ID matches the search term (diacritic-insensitive** (1 connections) — `tools/graphify/serve.py`
- **Filter blank lines from stdin before MCP reads it.      Some MCP clients (Claude** (1 connections) — `tools/graphify/serve.py`
- **Start the MCP server. Requires pip install mcp.** (1 connections) — `tools/graphify/serve.py`
- **Reconstruct community dict from community property stored on nodes.** (1 connections) — `tools/graphify/serve.py`
- *... and 2 more nodes in this community*

## Relationships

- [[Game Design Data Architecture]] (66 shared connections)
- [[Benchmark & Installers]] (4 shared connections)
- [[Graph Analysis Functions]] (2 shared connections)
- [[URL Ingest Fetchers]] (1 shared connections)
- [[AI Skill Feedback Loops]] (1 shared connections)

## Source Files

- `scripts/build-wiki-graph.js`
- `src/components/WikiGraph.tsx`
- `tools/graphify/export.py`
- `tools/graphify/security.py`
- `tools/graphify/serve.py`

## Audit Trail

- EXTRACTED: 60 (81%)
- INFERRED: 14 (19%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*