---
type: community
cohesion: 0.10
members: 31
---

# File Detection & Conversion

**Cohesion:** 0.10 - loosely connected
**Members:** 31 nodes

## Members
- [[Convert a .docx file to markdown text using python-docx.]] - rationale - tools/graphify/detect.py
- [[Convert a .docx or .xlsx to a markdown sidecar in out_dir.      Returns the path]] - rationale - tools/graphify/detect.py
- [[Convert an .xlsx file to markdown text using openpyxl.]] - rationale - tools/graphify/detect.py
- [[Enum]] - code
- [[Extract plain text from a PDF file using pypdf.]] - rationale - tools/graphify/detect.py
- [[FileType]] - code - tools/graphify/detect.py
- [[Heuristic does this text file read like an academic paper]] - rationale - tools/graphify/detect.py
- [[Like detect(), but returns only new or modified files since the last run.      C]] - rationale - tools/graphify/detect.py
- [[Load the file modification time manifest from a previous run.]] - rationale - tools/graphify/detect.py
- [[Read .graphifyignore from root and ancestor directories.      Returns a list]] - rationale - tools/graphify/detect.py
- [[Return True if path matches any .graphifyignore pattern.]] - rationale - tools/graphify/detect.py
- [[Return True if this directory name looks like a venv, cache, or dep dir.]] - rationale - tools/graphify/detect.py
- [[Return True if this file likely contains secrets and should be skipped.]] - rationale - tools/graphify/detect.py
- [[Save current file mtimes so the next --update run can diff against them.]] - rationale - tools/graphify/detect.py
- [[_is_ignored()]] - code - tools/graphify/detect.py
- [[_is_noise_dir()]] - code - tools/graphify/detect.py
- [[_is_sensitive()]] - code - tools/graphify/detect.py
- [[_load_graphifyignore()]] - code - tools/graphify/detect.py
- [[_looks_like_paper()]] - code - tools/graphify/detect.py
- [[classify_file()]] - code - tools/graphify/detect.py
- [[collect_files()]] - code - tools/graphify/extract.py
- [[convert_office_file()]] - code - tools/graphify/detect.py
- [[count_words()]] - code - tools/graphify/detect.py
- [[detect()]] - code - tools/graphify/detect.py
- [[detect.py]] - code - tools/graphify/detect.py
- [[detect_incremental()]] - code - tools/graphify/detect.py
- [[docx_to_markdown()]] - code - tools/graphify/detect.py
- [[extract_pdf_text()]] - code - tools/graphify/detect.py
- [[load_manifest()]] - code - tools/graphify/detect.py
- [[save_manifest()]] - code - tools/graphify/detect.py
- [[xlsx_to_markdown()]] - code - tools/graphify/detect.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/File_Detection_&_Conversion
SORT file.name ASC
```

## Connections to other communities
- 9 edges to [[_COMMUNITY_AST Language Extractors]]
- 1 edge to [[_COMMUNITY_Graph Analysis & Diagnostics]]

## Top bridge nodes
- [[detect()]] - degree 11, connects to 2 communities
- [[convert_office_file()]] - degree 6, connects to 1 community
- [[docx_to_markdown()]] - degree 5, connects to 1 community
- [[xlsx_to_markdown()]] - degree 5, connects to 1 community
- [[extract_pdf_text()]] - degree 4, connects to 1 community