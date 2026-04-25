---
source_file: "src/content/wiki/service-rpc-topology.md"
type: "document"
community: "Game Server RPC Topology"
location: "L32-L33"
tags:
  - graphify/document
  - graphify/EXTRACTED
  - community/Game_Server_RPC_Topology
---

# RpcPair Attribute

## Connections
- [[BattleEntryService]] - `uses` [EXTRACTED]
- [[Coordinator 도출 규칙]] - `consumes` [EXTRACTED]
- [[ServerType]] - `references_pair_of` [EXTRACTED]
- [[Service]] - `declares` [EXTRACTED]
- [[안티패턴 인스턴스 쪽 연결 선언]] - `contrasts_with` [EXTRACTED]
- [[정적 검증 요구사항]] - `validates` [EXTRACTED]
- [[함정 선언 누락을 배포 구성이 숨긴다]] - `rationale_for` [EXTRACTED]

#graphify/document #graphify/EXTRACTED #community/Game_Server_RPC_Topology