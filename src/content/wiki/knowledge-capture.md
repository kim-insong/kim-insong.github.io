---
title: "지식 캡처 규율"
description: "작업 중 얻은 일반화 가능한 인사이트를 즉시 올바른 위치에 기록하는 규칙"
publishDate: 2026-04-21
updatedDate: 2026-04-21
tags: ["Claude", "workflow", "memory", "skill", "knowledge-management"]
draft: false
sources: ["raw/knowledge-capture.md"]
---

## 출처별 캡처 대상

| 출처 | 캡처 대상 | 저장 위치 |
|------|---------|---------|
| 사용자 피드백 / 수정 | 결정 근거, 선호 | memory (feedback 타입) |
| 디자인 샘플 / 이미지 | 재사용 패턴, 컨벤션 | 관련 skill 또는 agent |
| 참조 사이트 / 문서 | 패턴, API, 컨벤션 | 관련 skill, agent, 또는 CLAUDE.md |
| 워크플로우 결정 | 프로세스 규칙 | `/workflow` skill 또는 global CLAUDE.md |

**규칙:** 이 대화를 넘어 일반화할 수 있는 교훈이면 세션이 끝나기 전에 기록한다. 요청을 기다리지 않는다.

## Knowledge Capture Hook

Stop 훅이 `[KNOWLEDGE CAPTURE]` 메시지를 주입하면 확인 없이 즉시 실행:

1. 메시지에 명시된 skill 파일 경로 읽기
2. 해당 섹션 제목을 찾거나, 없으면 새 섹션 추가
3. skill 파일의 기존 markdown 포맷에 맞춰 항목 append
4. `github` 스킬로 커밋:
   - 브랜치: `improve/knowledge-<skill>-<YYYY-MM-DD>`
   - 커밋 타입: `improve`
   - 대상 repo: `claude-skills` (프로젝트 repo가 아님)

## Memory 타입 구분

| 타입 | 내용 |
|------|------|
| `user` | 사용자 역할, 목표, 지식 수준 |
| `feedback` | 접근 방식에 대한 지도 — 피해야 할 것, 유지해야 할 것 |
| `project` | 진행 중 작업, 목표, 이슈 (날짜 포함) |
| `reference` | 외부 시스템 내 정보 위치 포인터 |

## 메모리에 저장하지 않을 것

- 코드 패턴, 컨벤션, 아키텍처, 파일 경로 — 코드에서 직접 읽을 수 있음
- git 히스토리, 최근 변경사항 — `git log`가 권위적
- 디버깅 해결책 — 커밋 메시지에 context가 있음
- CLAUDE.md에 이미 문서화된 내용
- 임시 작업 상세, 현재 대화 context

## Feedback 메모리 구조

```
[규칙 그 자체]

**Why:** 사용자가 제시한 이유 — 보통 과거 사건이나 강한 선호
**How to apply:** 언제/어디서 이 지침이 적용되는지
```

Why를 알면 엣지 케이스를 판단할 수 있다 — 규칙을 맹목적으로 따르는 것보다 낫다.

## 관련

- [[claude-skill-feedback-loop]] — 자동 감지 + 사람 확인 구조로 스킬 업데이트
- [[documentation-policy]] — Completion 체크리스트의 "지식 캡처" 단계
- [[code-quality]] — 요청 범위를 넘지 않는 원칙과 짝
