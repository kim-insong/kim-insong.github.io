---
type: community
cohesion: 0.05
members: 40
---

# Graphify Build Orchestration

**Cohesion:** 0.05 - loosely connected
**Members:** 40 nodes

## Members
- [[Context manual wikilink graph + ingest]] - document - docs/exec-plans/completed/llm-wiki-graphify.md
- [[EXTRACTEDINFERREDAMBIGUOUS 감사 추적]] - document - tools/graphify/skill.md
- [[End-to-end hook flow (wiki-ingest - graphify - commit)]] - document - docs/design-docs/graphify-wiki-integration.md
- [[Goals auto-refresh graphify-out on wiki commit]] - document - docs/design-docs/graphify-wiki-integration.md
- [[Karpathy raw folder 워크플로우]] - document - tools/graphify/skill.md
- [[Note graphify-outcache minimizes LLM token cost]] - document - docs/exec-plans/completed/graphify-wiki-integration.md
- [[Note graspologic install requires llvmnumba compile (3-5 min)]] - document - docs/exec-plans/completed/graphify-wiki-integration.md
- [[Problem wiki + graphify disconnected]] - document - docs/design-docs/graphify-wiki-integration.md
- [[Rationale commit agent-wiki because LLM cost makes it a cache]] - document - docs/exec-plans/completed/llm-wiki-graphify.md
- [[Step 1 embed graphify source in tools]] - document - docs/exec-plans/completed/graphify-wiki-integration.md
- [[Step 2 run-graphify-update.sh script]] - document - docs/exec-plans/completed/graphify-wiki-integration.md
- [[Step 3 expand post-commit hook with recursion guard]] - document - docs/exec-plans/completed/graphify-wiki-integration.md
- [[Step 5 consolidate root requirements.txt]] - document - docs/exec-plans/completed/graphify-wiki-integration.md
- [[Trade-off commit-message marker for recursion guard]] - document - docs/design-docs/graphify-wiki-integration.md
- [[Trade-off post-commit hook (no CI)]] - document - docs/design-docs/graphify-wiki-integration.md
- [[Trade-off run graphify via claude CLI skill]] - document - docs/design-docs/graphify-wiki-integration.md
- [[Trade-off tools-embedded source for PYTHONPATH stability]] - document - docs/design-docs/graphify-wiki-integration.md
- [[graphify-auto commit marker (infinite-loop guard)]] - document - docs/design-docs/graphify-wiki-integration.md
- [[confidence_score 요구사항]] - document - tools/graphify/skill.md
- [[graphify 9-step pipeline]] - document - tools/graphify/skill.md
- [[graphify knowledge graph pipeline]] - code - requirements.txt
- [[graphify outputs (graph.jsonhtml, GRAPH_REPORT, wiki)]] - document - docs/exec-plans/completed/llm-wiki-graphify.md
- [[graphify skill (Claude Code)]] - document - tools/graphify/skill.md
- [[graphify-aider (sequential)]] - document - tools/graphify/skill-aider.md
- [[graphify-codex (spawn_agent)]] - document - tools/graphify/skill-codex.md
- [[graphify-copilot (OpenClaw sequential)]] - document - tools/graphify/skill-copilot.md
- [[graphify-kiro]] - document - tools/graphify/skill-kiro.md
- [[graphify-opencode (@mention)]] - document - tools/graphify/skill-opencode.md
- [[graphify-trae (Task tool)]] - document - tools/graphify/skill-trae.md
- [[graphify-windows (PowerShell)]] - document - tools/graphify/skill-windows.md
- [[graspologic=3.0]] - code - requirements.txt
- [[networkx=3.0]] - code - requirements.txt
- [[npm run buildagent-wiki]] - document - CLAUDE.md
- [[npm script buildagent-wiki]] - document - docs/exec-plans/completed/llm-wiki-graphify.md
- [[scriptsbuild-agent-wiki.sh]] - document - docs/exec-plans/completed/llm-wiki-graphify.md
- [[scriptsrun-graphify-update.sh]] - document - docs/design-docs/graphify-wiki-integration.md
- [[scriptswiki-auto-ingest.sh]] - document - docs/design-docs/graphify-wiki-integration.md
- [[toolsgraphify embedded source]] - document - docs/design-docs/graphify-wiki-integration.md
- [[병렬 subagent로 5-10배 속도 향상]] - document - tools/graphify/skill.md
- [[하이퍼엣지 (3+ 노드 그룹)]] - document - tools/graphify/skill.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Graphify_Build_Orchestration
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_insong.net Site Architecture]]
- 1 edge to [[_COMMUNITY_Wiki Automation & Hooks]]

## Top bridge nodes
- [[End-to-end hook flow (wiki-ingest - graphify - commit)]] - degree 6, connects to 1 community
- [[npm run buildagent-wiki]] - degree 2, connects to 1 community