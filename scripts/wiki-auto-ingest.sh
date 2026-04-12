#!/bin/bash
# Auto-ingest new raw/ or blog/ files into the wiki.
# Called from .git/hooks/post-commit when new .md files are committed.

set -e

PROJECT_ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
WIKI_LOG="$PROJECT_ROOT/wiki-log.md"
TODAY=$(date +%Y-%m-%d)

# Detect new .md files added in the last commit
NEW_FILES=$(git -C "$PROJECT_ROOT" diff-tree --no-commit-id -r --name-only --diff-filter=A HEAD 2>/dev/null \
  | grep -E '^(raw/|src/content/blog/).*\.md$' \
  | grep -v README \
  || true)

if [ -z "$NEW_FILES" ]; then
  exit 0
fi

SOURCES_TO_PROCESS=""

for FILE in $NEW_FILES; do
  # Convert file path to source ID
  if [[ "$FILE" == raw/* ]]; then
    SOURCE_ID="$FILE"
  else
    SLUG=$(basename "$FILE" .md)
    SOURCE_ID="blog:$SLUG"
  fi

  # Skip if already tracked in wiki-log.md
  if grep -qF "| $SOURCE_ID |" "$WIKI_LOG" 2>/dev/null; then
    continue
  fi

  # Insert into ## Unincorporated table (after the header separator row)
  python3 - "$WIKI_LOG" "$SOURCE_ID" "$TODAY" <<'PYEOF'
import sys, re

log_path, source_id, today = sys.argv[1], sys.argv[2], sys.argv[3]

with open(log_path) as f:
    content = f.read()

# Find the ## Unincorporated section and insert after the separator row
pattern = r'(## Unincorporated\n\n\| Source \| Added \| Notes \|\n\|[-| ]+\|\n)'
replacement = rf'\1| {source_id} | {today} | auto-detected |\n'
new_content = re.sub(pattern, replacement, content, count=1)

if new_content == content:
    # Fallback: append before ## Incorporated
    new_content = content.replace(
        '## Incorporated',
        f'| {source_id} | {today} | auto-detected |\n\n---\n\n## Incorporated'
    )

with open(log_path, 'w') as f:
    f.write(new_content)

print(f"Added to wiki-log.md: {source_id}")
PYEOF

  SOURCES_TO_PROCESS="$SOURCES_TO_PROCESS $SOURCE_ID"
done

if [ -z "$SOURCES_TO_PROCESS" ]; then
  exit 0
fi

echo ""
echo "Wiki auto-ingest: new sources detected —$SOURCES_TO_PROCESS"
echo "Running Claude to process..."
echo ""

# Run Claude in non-interactive mode to process each source
cd "$PROJECT_ROOT"
claude -p "Auto wiki-ingest: the following sources were just committed and added to wiki-log.md as unincorporated:$SOURCES_TO_PROCESS

For EACH source:
1. Read the source file (raw/<file>.md or src/content/blog/<slug>.md)
2. Check existing wiki pages in src/content/wiki/ and ## Wiki Pages in wiki-log.md
3. Decide: MERGE into existing page if same topic, CREATE new page otherwise
4. Write the wiki page with proper frontmatter (title, description, publishDate: today, updatedDate: today, tags, sources: [\"<source-id>\"])
5. Update wiki-log.md: move source from ## Unincorporated to ## Incorporated, update ## Wiki Pages if new page created

Content rules: no narrative arc, structured reference material only (patterns, rules, code, decisions). Use [[wiki-link]] syntax for cross-references.

Process all sources automatically. No confirmation needed."
