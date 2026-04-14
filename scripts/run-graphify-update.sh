#!/usr/bin/env bash
# Run /graphify --update on wiki + raw content and commit the result.
# Called from post-commit hook when src/content/wiki/ files change.
set -e

PROJECT_ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
export PYTHONPATH="$PROJECT_ROOT/tools"

cd "$PROJECT_ROOT"

echo "[graphify] Running --update on wiki + raw..."
claude --dangerously-skip-permissions -p "/graphify src/content/wiki/ raw/ --update" 2>&1 || {
  echo "[graphify] Warning: graphify update failed, skipping commit"
  exit 0
}

# Check if graphify-out/ changed
if git diff --quiet HEAD -- graphify-out/ 2>/dev/null && \
   [ -z "$(git ls-files --others --exclude-standard graphify-out/)" ]; then
  echo "[graphify] No changes in graphify-out/, skipping commit"
  exit 0
fi

git add graphify-out/
git commit -m "feat: update graphify knowledge graph [graphify-auto]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo "[graphify] graphify-out/ updated and committed"
