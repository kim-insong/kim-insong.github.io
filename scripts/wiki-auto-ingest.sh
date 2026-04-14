#!/bin/bash
# Auto-ingest new or modified raw/ or blog/ files into the wiki.
# Called from .git/hooks/post-commit when .md files are added or modified.

set -e

# Skip if this commit was made by graphify auto-update (prevent infinite loop)
LAST_MSG=$(git -C "$(dirname "$0")/.." log -1 --pretty=%s 2>/dev/null || true)
if [[ "$LAST_MSG" == *"[graphify-auto]"* ]]; then
  exit 0
fi

PROJECT_ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
WIKI_LOG="$PROJECT_ROOT/wiki-log.md"
TODAY=$(date +%Y-%m-%d)

# Detect added (A) and modified (M) .md files in the last commit
CHANGED_FILES=$(git -C "$PROJECT_ROOT" diff-tree --no-commit-id -r --name-status --diff-filter=AM HEAD 2>/dev/null \
  | grep -E '^[AM]\s+(raw/|src/content/blog/).*\.md$' \
  | grep -v README \
  || true)

if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

NEW_SOURCES=""
MODIFIED_SOURCES=""

while IFS=$'\t' read -r STATUS FILE; do
  if [[ "$FILE" == raw/* ]]; then
    SOURCE_ID="$FILE"
  else
    SLUG=$(basename "$FILE" .md)
    SOURCE_ID="blog:$SLUG"
  fi

  if [ "$STATUS" = "A" ]; then
    # New file: add to Unincorporated if not already tracked
    # Check against HEAD~1 (previous commit) to avoid false-skip when wiki-log.md
    # was pre-populated in the same commit as the raw file.
    PREV_WIKI_LOG=$(git show HEAD~1:wiki-log.md 2>/dev/null || echo "")
    if [ -n "$PREV_WIKI_LOG" ] && echo "$PREV_WIKI_LOG" | grep -qF "| $SOURCE_ID |"; then
      continue
    fi

    python3 - "$WIKI_LOG" "$SOURCE_ID" "$TODAY" <<'PYEOF'
import sys, re
log_path, source_id, today = sys.argv[1], sys.argv[2], sys.argv[3]
with open(log_path) as f:
    content = f.read()
pattern = r'(## Unincorporated\n\n\| Source \| Added \| Notes \|\n\|[-| ]+\|\n)'
replacement = rf'\1| {source_id} | {today} | auto-detected |\n'
new_content = re.sub(pattern, replacement, content, count=1)
if new_content == content:
    new_content = content.replace(
        '## Incorporated',
        f'| {source_id} | {today} | auto-detected |\n\n---\n\n## Incorporated'
    )
with open(log_path, 'w') as f:
    f.write(new_content)
print(f"Added to wiki-log.md: {source_id}")
PYEOF

    NEW_SOURCES="$NEW_SOURCES $SOURCE_ID"

  elif [ "$STATUS" = "M" ]; then
    # Modified file: only process if already incorporated (section update needed)
    if grep -qF "| $SOURCE_ID |" "$WIKI_LOG" 2>/dev/null; then
      MODIFIED_SOURCES="$MODIFIED_SOURCES $SOURCE_ID"
    else
      # Not yet incorporated — treat as new
      NEW_SOURCES="$NEW_SOURCES $SOURCE_ID"
    fi
  fi
done <<< "$CHANGED_FILES"

if [ -z "$NEW_SOURCES" ] && [ -z "$MODIFIED_SOURCES" ]; then
  exit 0
fi

cd "$PROJECT_ROOT"

# Process new sources (full ingest)
if [ -n "$NEW_SOURCES" ]; then
  echo ""
  echo "Wiki auto-ingest: new sources —$NEW_SOURCES"
  claude -p "Auto wiki-ingest: the following sources were just committed and added to wiki-log.md as unincorporated:$NEW_SOURCES

For EACH source:
1. Read graphify-out/GRAPH_REPORT.md to identify which community/concepts the source belongs to
2. Read the source file (raw/<file>.md or src/content/blog/<slug>.md)
3. Based on the community identified in step 1, read only the most relevant 1-2 existing wiki pages from that community (do NOT scan all of src/content/wiki/)
4. Decide: MERGE into an existing page if same topic, CREATE new page otherwise
5. Write the wiki page with proper frontmatter (title, description, publishDate: today, updatedDate: today, tags, sources: [\"<source-id>\"])
6. Update wiki-log.md: move source from ## Unincorporated to ## Incorporated, update ## Wiki Pages if new page created

Content rules: no narrative arc, structured reference material only. Use [[wiki-link]] for cross-refs.
Process automatically. No confirmation needed."
fi

# Process modified sources (section update only)
if [ -n "$MODIFIED_SOURCES" ]; then
  echo ""
  echo "Wiki auto-ingest: modified sources —$MODIFIED_SOURCES"
  claude -p "Auto wiki-ingest (section update): the following sources were modified:$MODIFIED_SOURCES

For EACH source:
1. Read graphify-out/GRAPH_REPORT.md to identify which community/concepts this source belongs to
2. Read the updated source file
3. Find the wiki page that references this source (check sources: field in wiki frontmatter — use the community info from step 1 to narrow the search)
4. Identify the sections in the wiki page that were contributed by this source
5. Update ONLY those sections to reflect the changes — do not rewrite unrelated sections
6. Update updatedDate in the wiki page frontmatter to today
7. Do NOT change wiki-log.md (source is already incorporated)

Content rules: no narrative arc, structured reference material only. Use [[wiki-link]] for cross-refs.
Process automatically. No confirmation needed."
fi

# Trigger graphify --update if wiki pages changed in this commit
WIKI_CHANGED=$(git -C "$PROJECT_ROOT" diff-tree --no-commit-id -r --name-status \
  --diff-filter=AMD HEAD 2>/dev/null \
  | grep -E '^[AMD]\s+src/content/wiki/.*\.md$' || true)

if [ -n "$WIKI_CHANGED" ]; then
  echo ""
  echo "[graphify] Wiki pages changed — running graphify update in background..."
  bash "$PROJECT_ROOT/scripts/run-graphify-update.sh" &
fi
