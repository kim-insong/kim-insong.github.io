---
title: "Task 단위 머지 원칙"
description: "Claude의 병렬 에이전트 + git worktree + staging deploy 조합에서 통합의 원자 단위를 task 하나로 유지하는 이유와 방법"
tags: ["git", "worktree", "Claude", "workflow", "deploy", "staging"]
publishDate: 2026-04-20
draft: false
sources: ["blog:merge-per-task"]
---

## 핵심 원칙

> 하나의 task를 시작한다 → 그 안의 브랜치들을 staging으로 묶어 테스트 → 통과하면 각 PR을 main에 merge → 다음 task를 시작한다.

병렬은 task 내부에서만 쓰고, task 사이는 직렬이다.

## git worktree 기본

| 특성 | 설명 |
|---|---|
| 공유 | `.git` object DB 하나를 여러 working directory가 공유 (디스크 거의 안 먹음) |
| 동시 체크아웃 | 서로 다른 브랜치를 각 폴더에서 동시에 체크아웃 가능 |
| 중복 차단 | 같은 브랜치를 두 worktree에서 동시에 체크아웃하는 건 git이 막는다 |

명령:

```bash
git worktree add <path> <branch>   # 추가
git worktree list                   # 현황
git worktree remove <path>          # 정리
```

## Claude의 worktree 자동 사용

Agent tool의 `isolation: "worktree"` 옵션. 켜고 subagent를 돌리면:

1. 임시 worktree + 새 브랜치 자동 생성
2. 그 폴더 내에서만 파일 수정 — 메인 폴더는 안 건드림
3. 에이전트 종료 시 — 변경 없으면 자동 삭제, 있으면 경로/브랜치 반환

효과: developer 에이전트 N개를 병렬로 돌려도 파일 충돌 없음. 각자 자기 worktree + 자기 feature 브랜치.

## staging deploy 메커니즘

`testflight/scripts/staging.sh`가 하는 일:

```
main (pull)
 │
 └─▶ staging (임시 로컬 브랜치, push 안 함)
      │
      ├── merge --no-ff feat/A
      ├── merge --no-ff feat/B
      └── merge --no-ff feat/C
          │
          └─▶ fastlane → TestFlight
```

- staging은 **로컬 일회성 브랜치** — push 금지, main에 merge 금지
- 실제 main 히스토리는 각 feature PR의 개별 merge로 유지
- 머지 충돌 시 `merge --abort` 후 main으로 자동 복귀

## 브랜치 목록 결정 3가지 모드

| 모드 | 어디서 브랜치 목록 가져오는지 | 권장도 |
|---|---|---|
| `--plan <file>` | 파이프라인 파일의 `<!-- staging-branches: ... -->` 태그 | 권장 |
| `--worktrees` | `git worktree list` 결과 (main 제외) | fallback |
| 직접 명시 | 스크립트 인자 `staging.sh feat/A feat/B` | 수동 |

`--plan`이 기본 — architect agent가 기획서의 의존성 DAG를 분석해 작성한 태그를 따른다.

## architect agent의 범위 한계

- architect는 **한 기획서 안의 의존성만** 분석한다
- 기획서 A와 기획서 B의 브랜치를 동시에 staging에 넣으면 task 간 의존성은 미분석 상태
- 결과:
  - **Merge conflict**: staging.sh가 감지 → 안전한 실패
  - **의미 충돌**: 타입 시그니처 변경이 구버전 사용자와 조우 → 빌드는 통과, 런타임 깨짐 → 감지 장치 없음

## Task 단위 머지가 주는 이점

| 이점 | 설명 |
|---|---|
| conflict 범위 협소 | 한 task 내부 브랜치끼리만 충돌 가능 — architect 분석 범위와 일치 |
| 테스트 빌드 해석 명확 | TestFlight 문제의 원인은 이번 task에 국한 |
| 리뷰 지연 없음 | PR 나이 ≈ 결함률, 오래 묵은 PR 제거 |
| main이 배포 가능 상태 유지 | trunk-based development 원형 |

## 안티패턴

- **여러 task 브랜치를 쌓아두기** — architect가 task 간 의존성 미분석 → 조용한 의미 충돌 위험
- **staging 브랜치를 push** — 일회성 스냅샷이라는 계약 위반, 다른 사람이 merge 시도할 여지
- **staging을 main에 merge** — feature별 개별 merge 원칙 깨짐, reverts 복잡해짐

## 관련

- 블로그: [[merge-per-task]] 원문 글
- [[main-session-per-ticket]] — 메인세션을 티켓 단위로 유지하는 원칙 (task = 메인세션 단위)
- [[git-workflow-patterns]] — 브랜치 네이밍, 커밋 포맷, PR 관리
