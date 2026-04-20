# Graphify Benchmark

> 36 nodes · cohesion 0.07

## Key Concepts

- **serve.py** (10 connections) — `tools/graphify/serve.py`
- **serve()** (6 connections) — `tools/graphify/serve.py`
- **_query_subgraph_tokens()** (5 connections) — `tools/graphify/benchmark.py`
- **benchmark.py** (5 connections) — `tools/graphify/benchmark.py`
- **update()** (5 connections) — `src/components/WikiGraph.tsx`
- **run_benchmark()** (4 connections) — `tools/graphify/benchmark.py`
- **main()** (4 connections) — `scripts/build-wiki-graph.js`
- **sanitize_label()** (4 connections) — `tools/graphify/security.py`
- **_find_node()** (4 connections) — `tools/graphify/serve.py`
- **_subgraph_to_text()** (4 connections) — `tools/graphify/serve.py`
- **print_benchmark()** (3 connections) — `tools/graphify/benchmark.py`
- **to_canvas()** (3 connections) — `tools/graphify/export.py`
- **build-wiki-graph.js** (3 connections) — `scripts/build-wiki-graph.js`
- **_communities_from_graph()** (3 connections) — `tools/graphify/serve.py`
- **_filter_blank_stdin()** (3 connections) — `tools/graphify/serve.py`
- **_score_nodes()** (3 connections) — `tools/graphify/serve.py`
- **_strip_diacritics()** (3 connections) — `tools/graphify/serve.py`
- **_estimate_tokens()** (2 connections) — `tools/graphify/benchmark.py`
- **pageResolver()** (2 connections) — `scripts/build-wiki-graph.js`
- **parseFrontmatter()** (2 connections) — `scripts/build-wiki-graph.js`
- **_bfs()** (2 connections) — `tools/graphify/serve.py`
- **_load_graph()** (2 connections) — `tools/graphify/serve.py`
- **WikiGraph.tsx** (2 connections) — `src/components/WikiGraph.tsx`
- **Token-reduction benchmark - measures how much context graphify saves vs naive fu** (1 connections) — `tools/graphify/benchmark.py`
- **Print a human-readable benchmark report.** (1 connections) — `tools/graphify/benchmark.py`
- *... and 11 more nodes in this community*

## Relationships

- [[Graphify URL Ingest]] (88 shared connections)
- [[Graphify Install Commands]] (5 shared connections)
- [[Graphify Analyze Internals]] (2 shared connections)
- [[Graphify Output Files]] (1 shared connections)
- [[Branch Strategy Antipatterns]] (1 shared connections)

## Source Files

- `scripts/build-wiki-graph.js`
- `src/components/WikiGraph.tsx`
- `tools/graphify/benchmark.py`
- `tools/graphify/export.py`
- `tools/graphify/security.py`
- `tools/graphify/serve.py`

## Audit Trail

- EXTRACTED: 80 (82%)
- INFERRED: 17 (18%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*