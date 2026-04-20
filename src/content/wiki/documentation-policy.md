---
title: "프로젝트 문서 정책"
description: "언제, 어디에, 어떤 문서를 작성하는가 — OpenAI Harness Engineering 패턴 기반"
publishDate: 2026-04-14
updatedDate: 2026-04-21
tags: ["documentation", "workflow", "Claude", "architecture"]
draft: false
sources: ["raw/documentation-policy.md"]
---

## 폴더 구조

| 폴더 | 목적 | 작성 시점 |
|------|------|---------|
| `docs/design-docs/` | 설계 결정, 아키텍처 근거 — 무엇을, 왜 | 새 기능/아키텍처 작업 시작 전 |
| `docs/product-specs/` | 사용자 facing 기능 스펙, UX 범위, 수락 기준 | 사용자 가시 기능 시작 전 |
| `docs/exec-plans/active/` | 진행 중 구현 플랜, 작업 분해, agent 할당 | 코딩 전 (Tier 1–3); 단순 변경만 skip |
| `docs/exec-plans/completed/` | 아카이브된 플랜 — 구현 완료 후 이동 | 플랜 완료 후 |
| `docs/references/` | 외부 문서, LLM-optimized 레퍼런스, API 스펙 | 필요할 때 |
| `docs/generated/` | 자동 생성 문서 (스키마, 다이어그램) | CI / 툴링 |

## 파일 네이밍

- 전체 lifecycle 동안 `<feature-slug>.md` 유지
- 플랜: `active/`에서 시작 → 완료 후 `completed/`로 이동
- Completion 실행 전 `active/`가 현재 상태인지 확인

## CLAUDE.md 역할

CLAUDE.md는 **목차 역할**만 한다 (~100줄 이하).
- 상세 내용은 `docs/`에 포인터로 연결
- CLAUDE.md에 직접 상세 내용 임베딩 금지 (규칙 묘지가 됨)

## Modular CLAUDE.md (대형 프로젝트)

Claude는 파일 편집 시 해당 경로의 CLAUDE.md를 계층적으로 로드:
```
CLAUDE.md (root)
Sources/CLAUDE.md
Sources/Features/CLAUDE.md
Sources/Features/Auth/CLAUDE.md
```

목표 크기: root 60줄 이하, 폴더별 80줄 이하

섹션 카테고리: identity, build, branch, source-conventions, ui, tests, deployment, docs-rules, data/models

## 문서 작성 판단 기준

### 설계 문서 (docs/design-docs/)

- 새 기능의 아키텍처를 결정할 때
- 여러 접근법 중 하나를 선택한 이유
- 외부 시스템 통합 설계
- 성능/보안 트레이드오프 결정

### 스펙 (docs/product-specs/)

- 사용자가 보게 될 UI/UX 정의
- 수락 기준 (이걸 충족하면 완료)
- 엣지 케이스, 오류 처리 방식

### 플랜 (docs/exec-plans/)

- Tier 1 이상 작업 (3개 이상 파일)
- 병렬 agent를 쓸 때 작업 분해가 필요할 때
- 복잡한 의존성이 있을 때

### 플랜을 건너뛸 때

- 단일 파일, 10줄 미만 (Tier 0)
- 수정이 자명하고 범위가 완전히 명확할 때

## Plan Mode와 exec-plans 동기화

Plan Mode 시스템은 `~/.claude/plans/<random>.md`에 임시 파일을 저장한다.
프로젝트 작업 중 Plan Mode를 사용할 때는 **반드시** 같은 내용을
`docs/exec-plans/active/<feature-slug>.md`에도 작성해야 한다.

| 위치 | 역할 | 수명 |
|------|------|------|
| `~/.claude/plans/` | Plan Mode 시스템 전용 | 임시 |
| `docs/exec-plans/` | 프로젝트 아카이브 | 영구 |

## Completion 체크리스트

"wrap up", "commit", "마무리" 요청 시:

1. `docs/exec-plans/active/` → `completed/`로 완료된 플랜 이동
2. 설계 결정이 바뀌었으면 `docs/design-docs/` 업데이트
3. 일반화할 수 있는 지식 캡처 (memory 또는 skill 파일)
4. `github` 스킬로 커밋 → PR

## 관련

- [[claude-workflow-tiers]] — 문서 작성 시점과 연동되는 티어 판단
