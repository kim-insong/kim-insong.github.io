---
type: community
cohesion: 0.50
members: 4
---

# Plan Data Schema

**Cohesion:** 0.50 - moderately connected
**Members:** 4 nodes

## Members
- [[게임 기획데이터 관리 원칙]] - document - graphify-out/obsidian/_COMMUNITY_Game Data Architecture.md
- [[기획데이터 아키텍처 (Community)]] - community - graphify-out/obsidian/_COMMUNITY_기획데이터 아키텍처.md
- [[스키마 export 방식 (임시 해결책)]] - document - graphify-out/obsidian/_COMMUNITY_Game Data Architecture.md
- [[클라이언트 원본 시 순환 참조 패턴]] - document - graphify-out/obsidian/_COMMUNITY_Game Data Architecture.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Plan_Data_Schema
SORT file.name ASC
```
