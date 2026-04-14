---
title: "Git 워크플로우 패턴"
description: "Claude Code 프로젝트에서 사용하는 브랜치 전략, 커밋 포맷, PR 관리 패턴"
publishDate: 2026-04-14
updatedDate: 2026-04-14
tags: ["git", "workflow", "Claude", "PR"]
draft: false
sources: ["raw/git-workflow-patterns.md"]
---

## 브랜치 전략

- 항상 feature 브랜치에서 작업 — main에 직접 작업 금지
- 브랜치 네이밍: `feat/`, `fix/`, `improve/`, `refactor/` + 짧은 설명
- 예시: `feat/user-auth`, `fix/crash-on-load`

## 커밋 메시지 포맷

```
<type>: <English title>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

타입: `feat` `fix` `improve` `refactor` `docs` `remove`

- 제목은 영어, 50자 미만
- 한 커밋 = 하나의 논리적 단위 (독립적으로 revert 가능해야 함)

## 커밋 단위 판단 기준

| 기준 | 설명 |
|------|------|
| 레이어별 | 데이터 모델 / UI / 테스트 분리 |
| 타입별 | feat / refactor / docs 혼합 금지 |
| 독립성 | 이 커밋만 revert해도 나머지 정상 동작 |

## Pre-push PR 상태 체크 (매번 필수)

```bash
export PATH="/opt/homebrew/bin:$PATH"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
gh pr view "$BRANCH" --json state -q .state 2>/dev/null
```

| 상태 | 액션 |
|------|------|
| (비어있음) | PR 없음 — 자유롭게 push |
| `OPEN` | PR 열려있음 — 추가 커밋 push |
| `MERGED` | **중지.** main → 새 브랜치 → cherry-pick → 새 PR |
| `CLOSED` | 새 브랜치 생성 |

MERGED 브랜치에 계속 push하면 작업이 유실된다.

## Push 규칙

- `git push` 단독 실행 금지 — 항상 PR 생성 flow의 일부로만
- force push to main/master 절대 금지
- `--no-verify` 금지 (hook bypass)

## PR 포맷

- 제목: 50자 미만
- 본문: Changes + Testing 체크리스트
- `gh pr create` 사용 — 사용자가 리뷰 후 머지
- Claude가 직접 머지하지 않는다
