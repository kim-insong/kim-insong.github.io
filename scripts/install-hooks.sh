#!/bin/bash
# Install git hooks for this repo.
# Run once after cloning: bash scripts/install-hooks.sh

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

cat > "$HOOKS_DIR/post-commit" <<'EOF'
#!/bin/bash
# Auto-ingest new raw/ or blog/ markdown files into the wiki.
REPO_ROOT="$(git rev-parse --show-toplevel)"
bash "$REPO_ROOT/scripts/wiki-auto-ingest.sh"
EOF

chmod +x "$HOOKS_DIR/post-commit"
echo "Installed: .git/hooks/post-commit"
echo "New raw/ and blog/ .md files will be auto-ingested into the wiki on commit."
