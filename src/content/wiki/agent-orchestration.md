---
title: "AI Agent 오케스트레이션 패턴"
description: "Claude Code에서 여러 에이전트를 조율할 때의 모델 선택, 병렬화, 격리, 역할 분담 기준"
publishDate: 2026-04-14
updatedDate: 2026-04-21
tags: ["Claude", "AI", "agent", "workflow", "parallelization"]
draft: false
sources: ["raw/agent-orchestration-patterns.md"]
---

## 모델 선택 기준

| 역할 | 모델 |
|------|------|
| 기획, 아키텍처 설계, 리뷰 | opus |
| 구현, 코드 작성 | sonnet |
| 테스트 실행, 반복 runner | haiku |

- 기본값: **sonnet**
- sonnet이 usage limit에 걸렸을 때만 opus로 폴백 — 일반적인 선호로 바꾸지 않는다

## 병렬화 판단 기준

독립적인 작업 → 단일 메시지에 동시 launch (병렬).
의존적인 작업 → 순차 실행.

```
독립 작업 (병렬):
  - A 모듈 구현 + B 모듈 구현
  - 테스트 A 작성 + 테스트 B 작성
  - 여러 파일의 독립 리팩토링

의존 작업 (순차):
  - 아키텍처 설계 → 구현 (설계 결과가 구현에 필요)
  - 구현 → QA (구현 후에 테스트 작성)
```

같은 파일을 여러 agent가 건드리면 충돌 → 같은 파일은 같은 agent에 할당.

## worktree 격리 사용 조건

- 파일을 쓰는 병렬 agent: 반드시 `isolation: "worktree"` 사용
- 읽기만 하는 agent (Explore, 리뷰): 격리 불필요

## Agent당 범위 제한

- 파일 수: ~3개 (tight scope)
- 범위가 명확한 단일 관심사만
- 관심사가 섞이면 agent를 쪼갠다

## commit/push 규칙

Agent 내부에서 commit/push 금지. 항상 `github` 스킬을 통해 외부에서 실행.

## 표준 파이프라인 (Tier 3)

```
Explore agent     → 코드베이스 이해
Plan agent        → 구현 전략 설계
Architect agent   → 작업 분해, 의존성 분석 (opus)
Developer ×N      → 병렬 구현 (sonnet, worktree)
QA Writer ×N      → 테스트 작성 (sonnet, parallel)
Reviewer ×N       → Critical/Warning/Info 분류 (sonnet)
QA Runner ×N      → 테스트 실행 → 버그 리포트 (haiku)
Build loop        → 빌드 통과할 때까지 최대 3회
github skill      → commit → PR
```

## Agent 타입별 용도

| 타입 | 용도 |
|------|------|
| Explore | 코드베이스 탐색, 패턴 파악 (읽기 전용) |
| Plan | 구현 전략 설계, 트레이드오프 검토 |
| general-purpose | 복잡한 멀티스텝 작업, 코드 수정 |

## Explore agent 사용 기준

- 1개: 작업이 알려진 파일에 한정, 작은 타겟 변경
- 여러 개: 범위 불확실, 여러 코드베이스 영역 연관, 기존 패턴 파악 필요
- 최대 3개 병렬 (품질 > 수량)

## Skill / Agent 파일 작성 언어 규칙

**모든 skill 및 agent 파일은 영어로 작성한다.** 적용 범위:

- frontmatter `description` 필드
- 섹션 제목, instruction, 규칙 텍스트
- 출력 / 성공 / 에러 메시지 (프롬프트 템플릿 내부 포함)
- 주석, 역할 설명

한국어는 skill 파일 내부의 *예시 데이터*에만 허용 (예: 언어별 App Store 카피 문자열).

## 관련

- [[claude-workflow-tiers]] — 작업 규모별 티어 선택 기준
