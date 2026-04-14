---
type: community
cohesion: 0.67
members: 4
---

# 기획데이터 아키텍처

**Cohesion:** 0.67 - moderately connected
**Members:** 4 nodes

## Members
- [[Blog design-data-in-engine]] - document - src/content/wiki/design-data-in-engine.md
- [[게임 기획데이터 관리 원칙]] - document - src/content/wiki/design-data-in-engine.md
- [[스키마 export 방식 (임시 해결책)]] - document - src/content/wiki/design-data-in-engine.md
- [[클라이언트 원본 시 순환 참조 패턴]] - document - src/content/wiki/design-data-in-engine.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/기획데이터_아키텍처
SORT file.name ASC
```

## Connections to other communities
- 1 edge to [[_COMMUNITY_게임 서버 요청 추적]]

## Top bridge nodes
- [[게임 기획데이터 관리 원칙]] - degree 4, connects to 1 community