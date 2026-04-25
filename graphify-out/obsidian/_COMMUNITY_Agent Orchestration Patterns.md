---
type: community
cohesion: 0.09
members: 26
---

# Agent Orchestration Patterns

**Cohesion:** 0.09 - loosely connected
**Members:** 26 nodes

## Members
- [[Agent 내부 commitpush 금지 — github 스킬 사용]] - document - src/content/wiki/agent-orchestration.md
- [[Agent당 범위 제한 (~3개 파일, tight scope)]] - document - src/content/wiki/agent-orchestration.md
- [[Completion 명령 (wrap up  commit  finalize)]] - document - src/content/wiki/claude-workflow-tiers.md
- [[Completion 체크리스트 (wrap up 4단계)]] - document - src/content/wiki/documentation-policy.md
- [[Plan Mode와 exec-plans 동기화 규칙]] - document - src/content/wiki/documentation-policy.md
- [[Tier 0 Direct (단일 파일, 10줄 미만)]] - document - src/content/wiki/claude-workflow-tiers.md
- [[Tier 1 Plan + Implement (1-3 파일)]] - document - src/content/wiki/claude-workflow-tiers.md
- [[Tier 2 Plan + Parallel Agents (3-10 파일)]] - document - src/content/wiki/claude-workflow-tiers.md
- [[Tier 3 전체 파이프라인 (10단계)]] - document - src/content/wiki/claude-workflow-tiers.md
- [[Tier 3 Full Workflow (10개 이상 파일)]] - document - src/content/wiki/claude-workflow-tiers.md
- [[exec-plans 작성 기준 (Tier 1 이상)]] - document - src/content/wiki/documentation-policy.md
- [[worktree 격리 조건 (쓰기 병렬 agent는 필수)]] - document - src/content/wiki/agent-orchestration.md
- [[같은 파일은 같은 agent에 할당 (충돌 방지)]] - document - src/content/wiki/agent-orchestration.md
- [[기본값 sonnet, usage limit 시에만 opus 폴백]] - document - src/content/wiki/agent-orchestration.md
- [[라우팅 시그널 (티어 선택 지표)]] - document - src/content/wiki/claude-workflow-tiers.md
- [[로그 읽기 규율 (exit code만 신뢰 금지)]] - document - src/content/wiki/logging-standards.md
- [[로그 저장 위치 (tmpclaude-task-date.log 등)]] - document - src/content/wiki/logging-standards.md
- [[모델 선택 기준 (opussonnethaiku 역할 매핑)]] - document - src/content/wiki/agent-orchestration.md
- [[병렬화 판단 기준 (독립↔의존)]] - document - src/content/wiki/agent-orchestration.md
- [[빌드 커맨드는 에이전트 외부에서 실행]] - document - src/content/wiki/claude-workflow-tiers.md
- [[에스컬레이션 원칙 (과소설계 후 상향)]] - document - src/content/wiki/claude-workflow-tiers.md
- [[이상 탐지 규칙 (ERRORFAILWARN 발견 시 중단)]] - document - src/content/wiki/logging-standards.md
- [[일반화 가능한 교훈은 세션 종료 전 즉시 기록]] - document - src/content/wiki/knowledge-capture.md
- [[출처별 캡처 대상 매트릭스]] - document - src/content/wiki/knowledge-capture.md
- [[티어 선택 핵심 원칙 (낮은 티어로 시작)]] - document - src/content/wiki/claude-workflow-tiers.md
- [[표준 파이프라인 (Explore→Plan→Architect→Dev→QA→Review→Build→PR)]] - document - src/content/wiki/agent-orchestration.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Agent_Orchestration_Patterns
SORT file.name ASC
```
