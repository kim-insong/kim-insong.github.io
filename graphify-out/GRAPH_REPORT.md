# GRAPH_REPORT — insong.net Wiki Knowledge Graph

Generated: 2026-04-13  
Source: `src/content/wiki/` + `raw/`  
Total nodes: 27 | Total edges: 39 | Communities: 4

---

## High-Degree Nodes (Most Connected)

| Node | Degree | Community |
|------|--------|-----------|
| `game-server-request-context_wiki` | 6 | game-dev |
| `wiki_redis_leaderboard_snapshot` | 6 | game-dev |
| `ios-app-development_wiki` | 6 | ios |
| `claude-skill-feedback-loop_wiki` | 4 | claude-ai |
| `game-server-request-context_request_context` | 4 | game-dev |
| `concept_circular_dependency` | 4 | game-dev |
| `concept_redis_sorted_set` | 4 | game-dev |
| `concept_snapshot_ab_rotation` | 4 | game-dev |
| `concept_dual_sorted_set` | 4 | game-dev |

---

## Communities

### game-dev (15 nodes) — 가장 큰 커뮤니티
주제: 게임 서버 아키텍처, Redis 랭킹, 기획데이터 관리

핵심 노드:
- **게임 서버 요청 컨텍스트 패턴** (`game-server-request-context_wiki`) — C++ RequestContext 설계 패턴
- **게임 기획데이터 관리 원칙** (`wiki_design_data_in_engine`) — 순환 참조 회피, enum 발급 원칙
- **Redis 랭킹과 스냅샷 패턴** (`wiki_redis_leaderboard_snapshot`) — sorted set 기반 실시간 + 스냅샷 랭킹

내부 연결:
- `redis-leaderboard` → `game-server-request-context` (wikilink, EXTRACTED)
- `design-data-in-engine` ↔ `game-server-request-context` (서버 아키텍처 공유, INFERRED 0.75)
- `redis-leaderboard` ↔ `design-data-in-engine` (서버 레이어 공유, INFERRED 0.65)

### ios (6 nodes)
주제: SwiftUI 기반 iOS 앱 개발 스택 (2025)

핵심 노드:
- **SwiftUI** — 선언형 UI, UIKit 없이 실제 앱 개발 가능
- **Swift Concurrency** — async/await 네트워킹
- **SwiftData** — 경량 영속성

### claude-ai (4 nodes)
주제: Claude Code 자동화, 스킬 피드백 루프

핵심 노드:
- **Claude 스킬 자동 피드백 루프** — Stop Hook 기반 안전한 자동화 패턴
- **Stop Hook** vs **user-prompt-submit Hook** — 수정 패턴 감지에는 Stop Hook이 적합

### meta (2 nodes)
주제: 위키 자체 메타 정보, raw/ 소스 워크플로우

---

## Surprising Connections

1. **Redis 랭킹 → 게임 서버 컨텍스트**: 랭킹 업데이트도 `RequestContext` 발급이 필요한 서버 진입점임 (wikilink로 명시)
2. **기획데이터 → 서버 컨텍스트 공유**: 두 문서 모두 서버 아키텍처 레이어에서 데이터 흐름을 다루는데, 기획데이터 순환 참조가 RequestContext 전파와 유사한 소유권 설계 문제를 다룸 (INFERRED)
3. **Stop Hook ↔ Skill File**: Stop Hook이 Skill File을 자동 수정하는 구조는 Git 추적과 묶여야 안전함

---

## Suggested Queries

```
/graphify query "게임 서버에서 요청 추적을 어떻게 하나?"
/graphify query "Redis 랭킹 스냅샷을 복사 없이 구현하는 방법"
/graphify query "Claude 스킬 파일을 자동으로 업데이트할 때 주의할 점"
/graphify query "iOS 앱에서 비동기 처리 방법"
/graphify path "concept_circular_dependency" "concept_schema_export"
/graphify explain "concept_snapshot_ab_rotation"
```

---

## Audit Trail

- EXTRACTED edges: 28 (명시적 링크, 소스 참조)
- INFERRED edges: 9 (맥락적 추론, confidence 0.65–0.9)
- AMBIGUOUS edges: 0
- Corpus: 8 markdown files, ~6,200 words total
