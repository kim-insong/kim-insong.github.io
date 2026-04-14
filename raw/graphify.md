# graphify

Source: https://github.com/safishamsi/graphify

An AI coding assistant skill that transforms folders of code, documentation, papers, images, and multimedia into queryable knowledge graphs. Integrates with Claude Code, Codex, Cursor, GitHub Copilot CLI, Aider, and other AI platforms.

## Repository Structure

```
graphify/
├── .github/              GitHub workflows and configuration
├── graphify/             Main package source code
├── tests/                Test suite
├── worked/               Example outputs and case studies
├── ARCHITECTURE.md       Technical design documentation
├── CHANGELOG.md          Version history
├── LICENSE               MIT license
├── README.md             Documentation (multiple language versions: EN, ZH, JA, KO)
├── SECURITY.md           Security policy
└── pyproject.toml        Python package configuration
```

## Installation & Usage

**Requirements:** Python 3.10+, Claude Code

```bash
pip install graphifyy && graphify install
```

**Basic usage:**
```
/graphify .                   # current folder
/graphify ./src               # specific folder
/graphify . --deep            # deep analysis mode
/graphify . --update          # update existing graph
/graphify . --export svg      # export as SVG
/graphify . --export graphml  # export as GraphML
/graphify . --export neo4j    # export for Neo4j
```

## Processing Pipeline

1. **Deterministic AST pass** — code structure extraction via tree-sitter (local, no LLM)
2. **Local Whisper transcription** — audio/video files with domain-aware prompts
3. **Claude/GPT semantic extraction** — docs, images, PDFs
4. **Leiden clustering** — community detection on the resulting graph

## Supported File Types

**Code (23 languages via tree-sitter AST):**
Python, TypeScript, JavaScript, Go, Rust, Java, C/C++, Ruby, C#, Kotlin, Scala, PHP, and more.

**Documentation:** Markdown, plain text, reStructuredText

**Academic:** PDF papers with citation mining

**Visual:** PNG, JPG, WebP, GIF (via Claude vision)

**Media:** Audio and video (via local Whisper transcription)

## Output Formats

| Output | Description |
|--------|-------------|
| `graph.html` | Interactive HTML visualization with search and filtering |
| `GRAPH_REPORT.md` | God nodes, surprising connections, recommended queries |
| `graph.json` | Persistent graph data for multi-session queries |
| `obsidian/` | Obsidian vault (File > Open Vault) |
| `wiki/` | Agent-navigable Wikipedia-style markdown articles |

SHA256-based caching enables incremental updates — only changed files are reprocessed.

## Key Design Principles

- **Privacy-first:** Code analyzed locally via AST; only docs/images sent to model APIs
- **Token efficient:** 71.5x compression on large mixed corpora vs. reading raw files
- **No embeddings:** Graph topology itself provides similarity signal
- **Relationship tagging:** Edges labeled as `EXTRACTED`, `INFERRED` (with confidence score), or `AMBIGUOUS`
- **Git hook integration:** Optional automatic graph rebuild on commits
- **Watch mode:** Real-time graph synchronization during development

## Query & Navigation

```
/graphify query "how does auth work?"     # search connections
/graphify path EntityA EntityB            # find path between entities
```

- Query system for searching connections between concepts
- Path-finding between any two entities in the graph
- Agent-navigable wiki generation mode (`wiki/index.md` as entry point)

## Related Project

**Penpax** — Enterprise layer building on Graphify for a continuous, always-on knowledge graph of entire work life: browser history, meetings, emails, code.
