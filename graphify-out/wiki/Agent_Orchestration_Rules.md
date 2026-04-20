# Agent Orchestration Rules

> 26 nodes · cohesion 0.09

## Key Concepts

- **표준 파이프라인 (Explore→Plan→Architect→Dev→QA→Review→Build→PR)** (5 connections) — `src/content/wiki/agent-orchestration.md`
- **라우팅 시그널 (티어 선택 지표)** (4 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **Tier 3 전체 파이프라인 (10단계)** (4 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **일반화 가능한 교훈은 세션 종료 전 즉시 기록** (4 connections) — `src/content/wiki/knowledge-capture.md`
- **병렬화 판단 기준 (독립↔의존)** (3 connections) — `src/content/wiki/agent-orchestration.md`
- **Tier 2: Plan + Parallel Agents (3-10 파일)** (3 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **Tier 3: Full Workflow (10개 이상 파일)** (3 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **이상 탐지 규칙 (ERROR/FAIL/WARN 발견 시 중단)** (3 connections) — `src/content/wiki/logging-standards.md`
- **로그 읽기 규율 (exit code만 신뢰 금지)** (3 connections) — `src/content/wiki/logging-standards.md`
- **모델 선택 기준 (opus/sonnet/haiku 역할 매핑)** (2 connections) — `src/content/wiki/agent-orchestration.md`
- **Agent당 범위 제한 (~3개 파일, tight scope)** (2 connections) — `src/content/wiki/agent-orchestration.md`
- **worktree 격리 조건 (쓰기 병렬 agent는 필수)** (2 connections) — `src/content/wiki/agent-orchestration.md`
- **Completion 명령 (wrap up / commit / finalize)** (2 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **티어 선택 핵심 원칙 (낮은 티어로 시작)** (2 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **에스컬레이션 원칙 (과소설계 후 상향)** (2 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **빌드 커맨드는 에이전트 외부에서 실행** (2 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **Tier 0: Direct (단일 파일, 10줄 미만)** (2 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **Tier 1: Plan + Implement (1-3 파일)** (2 connections) — `src/content/wiki/claude-workflow-tiers.md`
- **Completion 체크리스트 (wrap up 4단계)** (2 connections) — `src/content/wiki/documentation-policy.md`
- **exec-plans 작성 기준 (Tier 1 이상)** (2 connections) — `src/content/wiki/documentation-policy.md`
- **같은 파일은 같은 agent에 할당 (충돌 방지)** (1 connections) — `src/content/wiki/agent-orchestration.md`
- **Agent 내부 commit/push 금지 — github 스킬 사용** (1 connections) — `src/content/wiki/agent-orchestration.md`
- **기본값 sonnet, usage limit 시에만 opus 폴백** (1 connections) — `src/content/wiki/agent-orchestration.md`
- **Plan Mode와 exec-plans 동기화 규칙** (1 connections) — `src/content/wiki/documentation-policy.md`
- **출처별 캡처 대상 매트릭스** (1 connections) — `src/content/wiki/knowledge-capture.md`
- *... and 1 more nodes in this community*

## Relationships

- [[Wiki Cross-references]] (60 shared connections)

## Source Files

- `src/content/wiki/agent-orchestration.md`
- `src/content/wiki/claude-workflow-tiers.md`
- `src/content/wiki/documentation-policy.md`
- `src/content/wiki/knowledge-capture.md`
- `src/content/wiki/logging-standards.md`

## Audit Trail

- EXTRACTED: 48 (80%)
- INFERRED: 12 (20%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*