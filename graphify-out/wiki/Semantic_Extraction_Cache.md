# Semantic Extraction Cache

> 23 nodes · cohesion 0.13

## Key Concepts

- **cache.py** (10 connections) — `tools/graphify/cache.py`
- **file_hash()** (7 connections) — `tools/graphify/cache.py`
- **extract()** (7 connections) — `tools/graphify/extract.py`
- **cache_dir()** (6 connections) — `tools/graphify/cache.py`
- **load_cached()** (6 connections) — `tools/graphify/cache.py`
- **save_cached()** (6 connections) — `tools/graphify/cache.py`
- **_body_content()** (3 connections) — `tools/graphify/cache.py`
- **cached_files()** (3 connections) — `tools/graphify/cache.py`
- **check_semantic_cache()** (3 connections) — `tools/graphify/cache.py`
- **clear_cache()** (3 connections) — `tools/graphify/cache.py`
- **save_semantic_cache()** (3 connections) — `tools/graphify/cache.py`
- **_check_tree_sitter_version()** (3 connections) — `tools/graphify/extract.py`
- **Check semantic extraction cache for a list of absolute file paths.      Returns** (1 connections) — `tools/graphify/cache.py`
- **Strip YAML frontmatter from Markdown content, returning only the body.** (1 connections) — `tools/graphify/cache.py`
- **Save semantic extraction results to cache, keyed by source_file.      Groups nod** (1 connections) — `tools/graphify/cache.py`
- **SHA256 of file contents + path relative to root.      Using a relative path (not** (1 connections) — `tools/graphify/cache.py`
- **Returns graphify-out/cache/ - creates it if needed.** (1 connections) — `tools/graphify/cache.py`
- **Return cached extraction for this file if hash matches, else None.      Cache ke** (1 connections) — `tools/graphify/cache.py`
- **Save extraction result for this file.      Stores as graphify-out/cache/{hash}.j** (1 connections) — `tools/graphify/cache.py`
- **Return set of file paths that have a valid cache entry (hash still matches).** (1 connections) — `tools/graphify/cache.py`
- **Delete all graphify-out/cache/*.json files.** (1 connections) — `tools/graphify/cache.py`
- **Raise a clear error if tree-sitter is too old for the new Language API.** (1 connections) — `tools/graphify/extract.py`
- **Extract AST nodes and edges from a list of code files.      Two-pass process:** (1 connections) — `tools/graphify/extract.py`

## Relationships

- [[AST Extractors (per-language)]] (5 shared connections)
- [[Build-Wiki-Graph Script]] (1 shared connections)
- [[Graph Analysis Internals]] (1 shared connections)

## Source Files

- `tools/graphify/cache.py`
- `tools/graphify/extract.py`

## Audit Trail

- EXTRACTED: 64 (90%)
- INFERRED: 7 (10%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*