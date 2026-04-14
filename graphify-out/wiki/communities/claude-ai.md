# Community: Claude / AI 자동화

Community ID: `claude-ai` | Nodes: 4 | Source: `src/content/wiki/claude-skill-feedback-loop.md`

## Overview

Claude Code 스킬 파일을 자동으로 업데이트하는 피드백 루프 아이디어와 그 한계, 안전한 대안 패턴.

---

## 스킬 자동 피드백 루프

### 아이디어

사용자가 "이렇게 바꿔줘"라고 피드백하면, Claude가 자동으로 SKILL.md를 수정.

### 문제점

| Hook | 문제 |
|------|------|
| `user-prompt-submit` | 응답 전에 실행 → 이전 응답 맥락 없음 → 수정 요청인지 판단 불가 |
| `stop` (응답 완료 후) | 맥락은 있지만 훅 실행 시점에 스킬 수정하면 → 어느 스킬을 수정했는지 attribution 불명확 |

추가 문제:
- **오탐**: 일반 대화를 수정 요청으로 잘못 인식
- **자동 commit**: 사용자 검토 없이 스킬 파일이 바뀌는 위험

### 안전한 아키텍처

```
응답 완료 (Stop hook 트리거)
  → 패턴 감지: "이번 수정이 스킬에 반영할 만한가?"
  → Yes → "SKILL.md에 이렇게 추가할까요?" 제안
  → 사용자 승인
  → git commit (명시적 추적)
```

핵심 원칙:
- 스킬 파일은 Claude가 자동으로 쓰지 않음
- 항상 사용자 승인 후 commit
- git으로 추적 → 롤백 가능

---

## Hook 타입 비교

| Hook | 실행 시점 | 맥락 | 적합한 용도 |
|------|----------|------|------------|
| `user-prompt-submit` | 응답 전 | 없음 | 입력 전처리, 검증 |
| `stop` | 응답 완료 후 | 전체 응답 있음 | 패턴 감지, 사후 처리 |

---

## Source

- Blog: `src/content/blog/ai-skill-feedback-loop.md`
- Wiki: `src/content/wiki/claude-skill-feedback-loop.md`
