---
title: "Claude Code 개발 워크플로우 티어"
description: "작업 규모에 따라 Tier 0–3 중 적절한 워크플로우를 선택하는 기준"
publishDate: 2026-04-14
updatedDate: 2026-04-21
tags: ["Claude", "AI", "workflow", "agent"]
draft: false
sources: ["raw/claude-workflow-tiers.md"]
---

## 핵심 원칙

필요한 것보다 무거운 티어를 쓰지 않는다. 낮은 티어로 시작, 복잡도가 드러나면 올린다.

## 티어 정의

| 티어 | 이름 | 조건 | 액션 |
|------|------|------|------|
| 0 | Direct | 단일 파일, 10줄 미만, 명확한 수정 | 파일 직접 편집 → `github` 스킬 |
| 1 | Plan + Implement | 1–3개 파일, 명확한 범위, 병렬 불필요 | Plan 모드 → 구현 → `github` 스킬 |
| 2 | Plan + Parallel Agents | 3–10개 파일 또는 독립적 관심사 여럿 | Plan 모드 → 1–3 병렬 에이전트 (worktree) → `github` 스킬 |
| 3 | Full Workflow | 10개 이상 파일, 아키텍처 영향, 횡단 관심사 | `/workflow` 스킬 전체 실행 |

## 라우팅 시그널

| 시그널 | 티어 |
|--------|------|
| 오타, 변수명 변경, 버전 번프, config 수정 | 0 |
| 버그 수정 (원인 이미 파악됨) | 0–1 |
| 소규모 신기능, 단일 관심사 | 1–2 |
| 여러 파일에 걸친 리팩토링 | 2–3 |
| 대규모 신기능, 여러 서브시스템 | 3 |
| "워크플로우 실행" 명시적 요청 | 3 |

## Tier 3 전체 파이프라인

```
[0] 플랜 doc 작성
[1] 기획 (opus 모델)
[2] 아키텍트 에이전트
[3] 개발자 에이전트 ×N (병렬)
[4] QA 작성자 ×N (병렬)
[5] 리뷰어 ×N
[6] QA 실행자 ×N
[7] 빌드 & 테스트 (실패 시 최대 3회 반복)
[8] docs/specs 업데이트
[9] 커밋 → PR
```

- 빌드 커맨드는 에이전트 내부에서 실행하지 않는다 — 항상 외부에서
- [7] 실패 = 미완료 작업 (통과할 때까지 루프)

## 에스컬레이션 원칙

구현 중 숨겨진 복잡도가 드러나면 올린다. 처음 예상보다 간단하면 내린다.
의심스러우면 낮은 티어로 시작 — 과소 설계 후 에스컬레이션이 과대 설계보다 낫다.

## Completion 명령 (wrap up / commit / finalize)

"마무리", "커밋", "wrap up" 요청 시 순서:

1. `docs/exec-plans/active/` → `completed/`로 완료된 플랜 이동
2. 설계 결정이 바뀌었으면 `docs/design-docs/` 업데이트
3. 일반화할 수 있는 지식 캡처 (memory 또는 skill 파일에 기록)
4. `github` 스킬로 커밋 — 영어 메시지 + Co-Authored-By
5. PR 생성

→ [[documentation-policy]] Completion 체크리스트와 동일한 규칙.

## 관련

- [[agent-orchestration]] — 병렬 에이전트 모델 선택 및 격리 기준
- [[claude-skill-feedback-loop]] — 스킬 자동 피드백 루프
- [[documentation-policy]] — 플랜 이동 및 문서 작성 시점
