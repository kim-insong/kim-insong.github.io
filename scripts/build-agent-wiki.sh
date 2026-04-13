#!/usr/bin/env bash
# Build the agent-navigable knowledge graph wiki from wiki + raw content.
# Invokes the /graphify skill via Claude Code — requires graphify skill to be installed.
#
# Usage:
#   npm run build:agent-wiki
#
# What it produces (graphify-out/):
#   graph.json              — LLM-extracted knowledge graph (nodes/edges with confidence scores)
#   GRAPH_REPORT.md         — Community summary, high-degree nodes, suggested queries
#   wiki/index.md           — Agent entry point
#   wiki/communities/*.md   — Per-community Wikipedia-style articles
#
# Requirements:
#   - graphify skill installed: ~/.claude/skills/graphify/SKILL.md
#   - To install: mkdir -p ~/.claude/skills/graphify && \
#       curl -fsSL https://raw.githubusercontent.com/safishamsi/graphify/main/skills/graphify/skill.md \
#       > ~/.claude/skills/graphify/SKILL.md
#
# Note: Run /graphify src/content/wiki/ raw/ inside a Claude Code session to regenerate.
# The graphify skill uses Claude subagents for LLM-based concept extraction.
# This script is a placeholder that documents the process.

set -e

SKILL_PATH="$HOME/.claude/skills/graphify/SKILL.md"

if [ ! -f "$SKILL_PATH" ]; then
  echo "[agent-wiki] graphify skill not found. Installing..."
  mkdir -p "$HOME/.claude/skills/graphify"
  curl -fsSL "https://raw.githubusercontent.com/safishamsi/graphify/main/skills/graphify/skill.md" \
    > "$SKILL_PATH"
  echo "[agent-wiki] Installed graphify skill → $SKILL_PATH"
fi

echo "[agent-wiki] graphify skill is installed."
echo ""
echo "To regenerate graphify-out/, run inside a Claude Code session:"
echo "  /graphify src/content/wiki/ raw/"
echo ""
echo "Or use the Claude Code CLI:"
echo "  claude '/graphify src/content/wiki/ raw/ --update'"
echo ""
echo "Current graphify-out/ contents:"
ls -la graphify-out/ 2>/dev/null || echo "  (not yet generated)"
