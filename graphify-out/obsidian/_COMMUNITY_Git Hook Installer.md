---
type: community
cohesion: 0.22
members: 13
---

# Git Hook Installer

**Cohesion:** 0.22 - loosely connected
**Members:** 13 nodes

## Members
- [[Check if graphify hooks are installed.]] - rationale - tools/graphify/hooks.py
- [[Install a single git hook, appending if an existing hook is present.]] - rationale - tools/graphify/hooks.py
- [[Install graphify post-commit and post-checkout hooks in the nearest git repo.]] - rationale - tools/graphify/hooks.py
- [[Remove graphify post-commit and post-checkout hooks.]] - rationale - tools/graphify/hooks.py
- [[Remove graphify section from a git hook using startend markers.]] - rationale - tools/graphify/hooks.py
- [[Walk up to find .git directory.]] - rationale - tools/graphify/hooks.py
- [[_git_root()]] - code - tools/graphify/hooks.py
- [[_install_hook()]] - code - tools/graphify/hooks.py
- [[_uninstall_hook()]] - code - tools/graphify/hooks.py
- [[hooks.py]] - code - tools/graphify/hooks.py
- [[install()]] - code - tools/graphify/hooks.py
- [[status()]] - code - tools/graphify/hooks.py
- [[uninstall()]] - code - tools/graphify/hooks.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Git_Hook_Installer
SORT file.name ASC
```
