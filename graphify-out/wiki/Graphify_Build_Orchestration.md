# Graphify Build Orchestration

> 40 nodes · cohesion 0.05

## Key Concepts

- **graphify skill (Claude Code)** (14 connections) — `tools/graphify/skill.md`
- **scripts/run-graphify-update.sh** (6 connections) — `docs/design-docs/graphify-wiki-integration.md`
- **End-to-end hook flow (wiki-ingest -> graphify -> commit)** (6 connections) — `docs/design-docs/graphify-wiki-integration.md`
- **tools/graphify/ embedded source** (5 connections) — `docs/design-docs/graphify-wiki-integration.md`
- **scripts/wiki-auto-ingest.sh** (4 connections) — `docs/design-docs/graphify-wiki-integration.md`
- **graphify knowledge graph pipeline** (4 connections) — `requirements.txt`
- **graphify outputs (graph.json/html, GRAPH_REPORT, wiki/)** (3 connections) — `docs/exec-plans/completed/llm-wiki-graphify.md`
- **graspologic>=3.0** (3 connections) — `requirements.txt`
- **npm run build:agent-wiki** (2 connections) — `CLAUDE.md`
- **graphify 9-step pipeline** (2 connections) — `tools/graphify/skill.md`
- **[graphify-auto] commit marker (infinite-loop guard)** (2 connections) — `docs/design-docs/graphify-wiki-integration.md`
- **Goals: auto-refresh graphify-out on wiki commit** (2 connections) — `docs/design-docs/graphify-wiki-integration.md`
- **Problem: wiki + graphify disconnected** (2 connections) — `docs/design-docs/graphify-wiki-integration.md`
- **scripts/build-agent-wiki.sh** (2 connections) — `docs/exec-plans/completed/llm-wiki-graphify.md`
- **Context: manual wikilink graph + ingest** (2 connections) — `docs/exec-plans/completed/llm-wiki-graphify.md`
- **npm script build:agent-wiki** (2 connections) — `docs/exec-plans/completed/llm-wiki-graphify.md`
- **networkx>=3.0** (2 connections) — `requirements.txt`
- **EXTRACTED/INFERRED/AMBIGUOUS 감사 추적** (1 connections) — `tools/graphify/skill.md`
- **confidence_score 요구사항** (1 connections) — `tools/graphify/skill.md`
- **하이퍼엣지 (3+ 노드 그룹)** (1 connections) — `tools/graphify/skill.md`
- **Karpathy /raw folder 워크플로우** (1 connections) — `tools/graphify/skill.md`
- **병렬 subagent로 5-10배 속도 향상** (1 connections) — `tools/graphify/skill.md`
- **graphify-aider (sequential)** (1 connections) — `tools/graphify/skill-aider.md`
- **graphify-codex (spawn_agent)** (1 connections) — `tools/graphify/skill-codex.md`
- **graphify-copilot (OpenClaw sequential)** (1 connections) — `tools/graphify/skill-copilot.md`
- *... and 15 more nodes in this community*

## Relationships

- [[insong.net Site Architecture]] (84 shared connections)
- [[Graphify Core Pipeline]] (1 shared connections)
- [[CLI & Skill Installers]] (1 shared connections)

## Source Files

- `CLAUDE.md`
- `docs/design-docs/graphify-wiki-integration.md`
- `docs/exec-plans/completed/graphify-wiki-integration.md`
- `docs/exec-plans/completed/llm-wiki-graphify.md`
- `requirements.txt`
- `tools/graphify/skill-aider.md`
- `tools/graphify/skill-codex.md`
- `tools/graphify/skill-copilot.md`
- `tools/graphify/skill-kiro.md`
- `tools/graphify/skill-opencode.md`
- `tools/graphify/skill-trae.md`
- `tools/graphify/skill-windows.md`
- `tools/graphify/skill.md`

## Audit Trail

- EXTRACTED: 64 (74%)
- INFERRED: 22 (26%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*