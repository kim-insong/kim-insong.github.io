---
type: community
cohesion: 0.09
members: 37
---

# URL Ingest Pipeline

**Cohesion:** 0.09 - loosely connected
**Members:** 37 nodes

## Members
- [[.redirect_request()]] - code - tools/graphify/security.py
- [[Classify the URL for targeted extraction.]] - rationale - tools/graphify/ingest.py
- [[Convert HTML to clean markdown. Uses html2text if available, else basic strip.]] - rationale - tools/graphify/ingest.py
- [[Download a binary file (PDF, image) directly.]] - rationale - tools/graphify/ingest.py
- [[Escape a string for embedding in a YAML double-quoted scalar.]] - rationale - tools/graphify/ingest.py
- [[Fetch url and return decoded text (UTF-8, replacing bad bytes).      Wraps saf]] - rationale - tools/graphify/security.py
- [[Fetch url and return raw bytes.      Protections applied     - URL scheme val]] - rationale - tools/graphify/security.py
- [[Fetch a URL and save it into target_dir as a graphify-ready file.      Returns t]] - rationale - tools/graphify/ingest.py
- [[Fetch a generic webpage and convert to markdown.]] - rationale - tools/graphify/ingest.py
- [[Fetch a tweet URL. Returns (content, filename).]] - rationale - tools/graphify/ingest.py
- [[Fetch arXiv abstract page.]] - rationale - tools/graphify/ingest.py
- [[Raise ValueError if url is not http or https, or targets a privateinternal IP]] - rationale - tools/graphify/security.py
- [[Redirect handler that re-validates every redirect target.      Prevents open-red]] - rationale - tools/graphify/security.py
- [[Resolve path and verify it stays inside base.      base defaults to the `g]] - rationale - tools/graphify/security.py
- [[Save a Q&A result as markdown so it gets extracted into the graph on next --upda]] - rationale - tools/graphify/ingest.py
- [[Strip control characters and cap length.      Safe for embedding in JSON data (i]] - rationale - tools/graphify/security.py
- [[Turn a URL into a safe filename.]] - rationale - tools/graphify/ingest.py
- [[_NoFileRedirectHandler]] - code - tools/graphify/security.py
- [[_build_opener()]] - code - tools/graphify/security.py
- [[_detect_url_type()]] - code - tools/graphify/ingest.py
- [[_download_binary()]] - code - tools/graphify/ingest.py
- [[_fetch_arxiv()]] - code - tools/graphify/ingest.py
- [[_fetch_html()]] - code - tools/graphify/ingest.py
- [[_fetch_tweet()]] - code - tools/graphify/ingest.py
- [[_fetch_webpage()]] - code - tools/graphify/ingest.py
- [[_html_to_markdown()]] - code - tools/graphify/ingest.py
- [[_safe_filename()]] - code - tools/graphify/ingest.py
- [[_yaml_str()]] - code - tools/graphify/ingest.py
- [[ingest()]] - code - tools/graphify/ingest.py
- [[ingest.py]] - code - tools/graphify/ingest.py
- [[safe_fetch()]] - code - tools/graphify/security.py
- [[safe_fetch_text()]] - code - tools/graphify/security.py
- [[sanitize_label()]] - code - tools/graphify/security.py
- [[save_query_result()]] - code - tools/graphify/ingest.py
- [[security.py]] - code - tools/graphify/security.py
- [[validate_graph_path()]] - code - tools/graphify/security.py
- [[validate_url()]] - code - tools/graphify/security.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/URL_Ingest_Pipeline
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_Whisper Transcription]]
- 1 edge to [[_COMMUNITY_CLI & Skill Installers]]
- 1 edge to [[_COMMUNITY_Graph Analysis & Diagnostics]]

## Top bridge nodes
- [[sanitize_label()]] - degree 4, connects to 2 communities
- [[ingest()]] - degree 9, connects to 1 community