---
type: community
cohesion: 0.21
members: 14
---

# Whisper Transcription

**Cohesion:** 0.21 - loosely connected
**Members:** 14 nodes

## Members
- [[Build a domain hint for Whisper from god nodes extracted from the corpus.      F]] - rationale - tools/graphify/transcribe.py
- [[Download audio-only stream from a URL using yt-dlp.      Returns the path to the]] - rationale - tools/graphify/transcribe.py
- [[Return True if the string looks like a URL rather than a file path.]] - rationale - tools/graphify/transcribe.py
- [[Transcribe a list of videoaudio files or URLs, return paths to transcript .txt]] - rationale - tools/graphify/transcribe.py
- [[Transcribe a videoaudio file or URL to a .txt transcript.      If video_path is]] - rationale - tools/graphify/transcribe.py
- [[_get_whisper()]] - code - tools/graphify/transcribe.py
- [[_get_yt_dlp()]] - code - tools/graphify/transcribe.py
- [[_model_name()]] - code - tools/graphify/transcribe.py
- [[build_whisper_prompt()]] - code - tools/graphify/transcribe.py
- [[download_audio()]] - code - tools/graphify/transcribe.py
- [[is_url()]] - code - tools/graphify/transcribe.py
- [[transcribe()]] - code - tools/graphify/transcribe.py
- [[transcribe.py]] - code - tools/graphify/transcribe.py
- [[transcribe_all()]] - code - tools/graphify/transcribe.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Whisper_Transcription
SORT file.name ASC
```

## Connections to other communities
- 3 edges to [[_COMMUNITY_AST Language Extractors]]
- 1 edge to [[_COMMUNITY_URL Ingest Pipeline]]

## Top bridge nodes
- [[download_audio()]] - degree 6, connects to 2 communities
- [[transcribe()]] - degree 8, connects to 1 community
- [[transcribe_all()]] - degree 4, connects to 1 community