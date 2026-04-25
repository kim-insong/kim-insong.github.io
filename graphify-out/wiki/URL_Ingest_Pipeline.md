# URL Ingest Pipeline

> 37 nodes · cohesion 0.09

## Key Concepts

- **ingest.py** (11 connections) — `tools/graphify/ingest.py`
- **ingest()** (9 connections) — `tools/graphify/ingest.py`
- **_fetch_webpage()** (8 connections) — `tools/graphify/ingest.py`
- **_fetch_arxiv()** (7 connections) — `tools/graphify/ingest.py`
- **security.py** (7 connections) — `tools/graphify/security.py`
- **_fetch_tweet()** (6 connections) — `tools/graphify/ingest.py`
- **_safe_filename()** (6 connections) — `tools/graphify/ingest.py`
- **_yaml_str()** (6 connections) — `tools/graphify/ingest.py`
- **safe_fetch()** (6 connections) — `tools/graphify/security.py`
- **_download_binary()** (5 connections) — `tools/graphify/ingest.py`
- **safe_fetch_text()** (5 connections) — `tools/graphify/security.py`
- **validate_url()** (5 connections) — `tools/graphify/security.py`
- **_fetch_html()** (4 connections) — `tools/graphify/ingest.py`
- **sanitize_label()** (4 connections) — `tools/graphify/security.py`
- **_detect_url_type()** (3 connections) — `tools/graphify/ingest.py`
- **_html_to_markdown()** (3 connections) — `tools/graphify/ingest.py`
- **save_query_result()** (3 connections) — `tools/graphify/ingest.py`
- **_NoFileRedirectHandler** (3 connections) — `tools/graphify/security.py`
- **_build_opener()** (2 connections) — `tools/graphify/security.py`
- **.redirect_request()** (2 connections) — `tools/graphify/security.py`
- **validate_graph_path()** (2 connections) — `tools/graphify/security.py`
- **Fetch a generic webpage and convert to markdown.** (1 connections) — `tools/graphify/ingest.py`
- **Fetch arXiv abstract page.** (1 connections) — `tools/graphify/ingest.py`
- **Escape a string for embedding in a YAML double-quoted scalar.** (1 connections) — `tools/graphify/ingest.py`
- **Download a binary file (PDF, image) directly.** (1 connections) — `tools/graphify/ingest.py`
- *... and 12 more nodes in this community*

## Relationships

- [[Branch & Merge Workflow]] (4 shared connections)
- [[Whisper Transcription]] (1 shared connections)
- [[Graphify Build Orchestration]] (1 shared connections)

## Source Files

- `tools/graphify/ingest.py`
- `tools/graphify/security.py`

## Audit Trail

- EXTRACTED: 112 (91%)
- INFERRED: 11 (9%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*