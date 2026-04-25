---
type: community
cohesion: 0.05
members: 63
---

# CLI & Skill Installers

**Cohesion:** 0.05 - loosely connected
**Members:** 63 nodes

## Members
- [[Add graphify PreToolUse hook to .claudesettings.json.]] - rationale - tools/graphify/__main__.py
- [[Add graphify PreToolUse hook to .codexhooks.json.]] - rationale - tools/graphify/__main__.py
- [[Copy skill file to ~.geminiskillsgraphify, write GEMINI.md section, and inst]] - rationale - tools/graphify/__main__.py
- [[Filter blank lines from stdin before MCP reads it.      Some MCP clients (Claude]] - rationale - tools/graphify/serve.py
- [[Install graphify for Google Antigravity skill + .agentrules + .agentworkflows]] - rationale - tools/graphify/__main__.py
- [[Reconstruct community dict from community property stored on nodes.]] - rationale - tools/graphify/serve.py
- [[Remove .cursorrulesgraphify.mdc.]] - rationale - tools/graphify/__main__.py
- [[Remove graphify Antigravity rules, workflow, and skill files.]] - rationale - tools/graphify/__main__.py
- [[Remove graphify PreToolUse hook from .claudesettings.json.]] - rationale - tools/graphify/__main__.py
- [[Remove graphify PreToolUse hook from .codexhooks.json.]] - rationale - tools/graphify/__main__.py
- [[Remove graphify skill + steering file for Kiro.]] - rationale - tools/graphify/__main__.py
- [[Remove graphify.js plugin and deregister from opencode.json.]] - rationale - tools/graphify/__main__.py
- [[Remove the graphify section from GEMINI.md, uninstall hook, and remove skill fil]] - rationale - tools/graphify/__main__.py
- [[Remove the graphify section from the local AGENTS.md.]] - rationale - tools/graphify/__main__.py
- [[Remove the graphify section from the local CLAUDE.md.]] - rationale - tools/graphify/__main__.py
- [[Render subgraph as text, cutting at token_budget (approx 3 charstoken).]] - rationale - tools/graphify/serve.py
- [[Return node IDs whose label or ID matches the search term (diacritic-insensitive]] - rationale - tools/graphify/serve.py
- [[Start the MCP server. Requires pip install mcp.]] - rationale - tools/graphify/serve.py
- [[Warn if the installed skill is from an older graphify version.]] - rationale - tools/graphify/__main__.py
- [[Write .cursorrulesgraphify.mdc with alwaysApply true.]] - rationale - tools/graphify/__main__.py
- [[Write graphify skill + steering file for Kiro IDECLI.]] - rationale - tools/graphify/__main__.py
- [[Write graphify.js plugin and register it in opencode.json.]] - rationale - tools/graphify/__main__.py
- [[Write the graphify section to the local AGENTS.md (CodexOpenCodeOpenClaw).]] - rationale - tools/graphify/__main__.py
- [[Write the graphify section to the local CLAUDE.md.]] - rationale - tools/graphify/__main__.py
- [[__main__.py]] - code - tools/graphify/__main__.py
- [[_agents_install()]] - code - tools/graphify/__main__.py
- [[_agents_uninstall()]] - code - tools/graphify/__main__.py
- [[_antigravity_install()]] - code - tools/graphify/__main__.py
- [[_antigravity_uninstall()]] - code - tools/graphify/__main__.py
- [[_check_skill_version()]] - code - tools/graphify/__main__.py
- [[_communities_from_graph()]] - code - tools/graphify/serve.py
- [[_cursor_install()]] - code - tools/graphify/__main__.py
- [[_cursor_uninstall()]] - code - tools/graphify/__main__.py
- [[_dfs()]] - code - tools/graphify/serve.py
- [[_filter_blank_stdin()]] - code - tools/graphify/serve.py
- [[_find_node()]] - code - tools/graphify/serve.py
- [[_install_claude_hook()]] - code - tools/graphify/__main__.py
- [[_install_codex_hook()]] - code - tools/graphify/__main__.py
- [[_install_gemini_hook()]] - code - tools/graphify/__main__.py
- [[_install_opencode_plugin()]] - code - tools/graphify/__main__.py
- [[_kiro_install()]] - code - tools/graphify/__main__.py
- [[_kiro_uninstall()]] - code - tools/graphify/__main__.py
- [[_load_graph()]] - code - tools/graphify/serve.py
- [[_score_nodes()]] - code - tools/graphify/serve.py
- [[_strip_diacritics()]] - code - tools/graphify/serve.py
- [[_subgraph_to_text()]] - code - tools/graphify/serve.py
- [[_uninstall_claude_hook()]] - code - tools/graphify/__main__.py
- [[_uninstall_codex_hook()]] - code - tools/graphify/__main__.py
- [[_uninstall_gemini_hook()]] - code - tools/graphify/__main__.py
- [[_uninstall_opencode_plugin()]] - code - tools/graphify/__main__.py
- [[build-wiki-graph.js]] - code - scripts/build-wiki-graph.js
- [[claude_install()]] - code - tools/graphify/__main__.py
- [[claude_uninstall()]] - code - tools/graphify/__main__.py
- [[gemini_install()]] - code - tools/graphify/__main__.py
- [[gemini_uninstall()]] - code - tools/graphify/__main__.py
- [[graphify CLI - `graphify install` sets up the Claude Code skill.]] - rationale - tools/graphify/__main__.py
- [[install()_1]] - code - tools/graphify/__main__.py
- [[main()_1]] - code - scripts/build-wiki-graph.js
- [[main()]] - code - tools/graphify/__main__.py
- [[pageResolver()]] - code - scripts/build-wiki-graph.js
- [[parseFrontmatter()]] - code - scripts/build-wiki-graph.js
- [[serve()]] - code - tools/graphify/serve.py
- [[serve.py]] - code - tools/graphify/serve.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/CLI_&_Skill_Installers
SORT file.name ASC
```

## Connections to other communities
- 10 edges to [[_COMMUNITY_AST Language Extractors]]
- 8 edges to [[_COMMUNITY_Graph Analysis & Diagnostics]]
- 3 edges to [[_COMMUNITY_Token Budget & Query Subgraph]]
- 1 edge to [[_COMMUNITY_Graph Builder Module]]
- 1 edge to [[_COMMUNITY_URL Ingest Pipeline]]

## Top bridge nodes
- [[main()]] - degree 31, connects to 4 communities
- [[serve.py]] - degree 10, connects to 1 community
- [[_install_claude_hook()]] - degree 4, connects to 1 community
- [[_install_codex_hook()]] - degree 4, connects to 1 community
- [[_install_opencode_plugin()]] - degree 4, connects to 1 community