---
title: "한 번에 하나의 task만 머지한다"
description: "git worktree와 staging deploy가 병렬 작업을 가능하게 해주지만, merge 원자 단위는 오히려 더 작아져야 한다."
publishDate: 2026-04-20
tags: ["Claude", "git", "worktree", "workflow", "deploy"]
draft: false
---

메인세션을 티켓 단위로 돌리면 그 안에서 AI 에이전트가 병렬로 작업한다. 브랜치는 자연스럽게 여러 개가 된다. 그걸 언제 합쳐서 TestFlight에 올리고, 언제 main에 merge할지가 다음 문제다.

결론부터: 브랜치를 쌓아두지 말고 **한 task가 완성될 때마다 바로 main에 merge한다**. 병렬은 task 내부에서만 쓰고, task 끼리는 직렬로.

## git worktree: 같은 저장소에 작업 폴더 여러 개

원리는 단순하다. 보통 git 저장소 하나에는 working directory 하나가 붙는다. `git worktree add` 는 거기에 **추가 작업 폴더**를 붙인다.

```bash
git worktree add ../my-repo-featB feat/B
# ../my-repo-featB 가 feat/B 브랜치로 체크아웃된 상태로 생긴다
```

핵심 특성은 세 가지다.

- object DB 하나를 공유한다 — 디스크를 거의 안 먹는다
- 한 폴더에서 `feat/A`, 다른 폴더에서 `feat/B`를 동시에 체크아웃할 수 있다
- 같은 브랜치를 두 worktree에서 동시에 체크아웃하는 건 막혀 있다

stash 없이 여러 브랜치를 병행할 수 있다는 게 전부다. 그런데 이게 AI 에이전트 병렬화와 결합하면 새 쓰임새가 된다.

## Claude가 worktree를 자동으로 쓰는 방법

Claude Code의 Agent tool에는 `isolation: "worktree"` 옵션이 있다. 이걸 켜고 subagent를 돌리면 자동으로 이렇게 동작한다.

1. 임시 worktree를 새 브랜치에 생성
2. 그 폴더 안에서만 파일을 수정 — 메인 폴더는 건드리지 않는다
3. 에이전트 종료 시 — 변경이 없으면 worktree를 삭제, 있으면 경로와 브랜치명을 반환

그래서 developer 에이전트 3개를 병렬로 돌려도 파일 충돌이 나지 않는다. 각 에이전트는 자기만의 worktree와 자기만의 feature 브랜치를 가진다.

## staging deploy: main에 merge하지 않고 통합 빌드만 뽑는다

병렬 작업은 해결됐다. 이제 그 결과를 TestFlight에 올려 팀원에게 보내야 한다. 그런데 각 브랜치는 아직 PR만 올라간 상태이고 main에는 merge되지 않았다.

이걸 위해 `testflight/scripts/staging.sh` 가 있다. 흐름은 이렇다.

```
main (최신)
 │
 └─▶ staging (임시 로컬 브랜치, main 기준)
      │
      ├── merge --no-ff feat/A
      ├── merge --no-ff feat/B
      └── merge --no-ff feat/C
          │
          └─▶ fastlane → TestFlight
```

staging 브랜치는 **push하지 않는다**. 로컬에서 빌드만 뽑고, 리뷰가 끝나면 버린다. 실제 main 히스토리는 각 feature PR을 개별적으로 merge하는 방식으로 유지한다. staging은 통합 테스트용 일회성 스냅샷이다.

## 브랜치 목록은 architect agent가 결정한다

`staging.sh`는 저장소의 모든 브랜치를 뒤지지 않는다. 3가지 중 하나에서 브랜치 목록을 받는다.

| 모드 | 어디서 |
|---|---|
| `--plan <file>` | 파이프라인 파일의 `<!-- staging-branches: ... -->` 태그 |
| `--worktrees` | `git worktree list` 결과 |
| 직접 명시 | 스크립트 인자 |

`--plan`이 권장 모드다. architect agent가 기획서를 분석해 의존성 DAG를 그리고, 독립 클러스터마다 feature 브랜치를 할당한 뒤, 그 목록을 태그로 기록한다. 사람이 "어느 브랜치를 빌드에 포함할지" 판단하지 않는다.

## 여러 task를 섞으면 architect가 모르는 의존성이 생긴다

여기서 실수하기 쉬운 지점이 있다. architect agent는 **한 기획서 안의 의존성만** 분석한다. 기획서 A와 기획서 B의 브랜치를 동시에 staging에 넣으면, A의 변경이 B의 변경과 조용히 충돌할 수 있다.

- **Merge conflict** — 같은 파일을 A와 B가 다른 방향으로 수정한 경우. staging.sh가 감지해서 `merge --abort` 해준다. 이건 안전한 실패다.
- **의미 충돌** — A가 타입 시그니처를 바꿨는데 B는 그 타입의 구버전을 가정하고 있다. 빌드는 통과하는데 런타임에서 깨진다. 이걸 잡아주는 장치는 없다.

조용한 의미 충돌이 진짜 무서운 부분이다. 충돌이 드러날 때쯤에는 이미 TestFlight 유저가 깨진 빌드를 받아서 쓰고 있다.

## 한 번에 하나의 task만 돌린다

그래서 결론이 나온다.

> 하나의 task를 시작한다 → 그 안의 브랜치들을 staging으로 묶어 테스트 → 통과하면 각 PR을 main에 merge → 다음 task를 시작한다.

이렇게 하면 task 간 의존성을 architect가 분석하지 못하는 문제 자체가 사라진다. 다음 task가 시작될 때는 이전 task의 변경이 이미 main에 반영되어 있으니, architect는 "현재 main 상태"만 기준으로 의존성을 보면 된다.

반대로 브랜치를 쌓아두고 여러 task의 staging을 한꺼번에 돌리면, 각 task는 독립적으로 설계된 계획인데 서로가 서로를 모르는 상태로 merge를 시도하게 된다. 이건 운에 맡기는 통합이다.

## 한 task 단위로 머지할 때 따라오는 이점

이 규칙을 지키면 부수적으로 몇 가지가 따라온다.

1. **merge conflict의 범위가 좁다** — 한 task의 브랜치들끼리만 충돌할 수 있고, 그건 architect가 이미 분석한 범위다
2. **테스트 빌드의 해석이 명확하다** — TestFlight에서 문제가 발견되면 원인은 이번 task 안에 있다. 과거 task까지 거슬러 올라갈 필요가 없다
3. **PR 리뷰가 빨라진다** — 오래 묵은 PR이 쌓이지 않는다. PR의 나이는 실제 결함률과 비례한다
4. **main이 항상 배포 가능한 상태에 가깝다** — trunk-based development의 원래 의도

## Takeaway

git worktree와 Claude의 병렬 에이전트, staging deploy는 "많은 작업을 동시에 진행"할 수 있게 해준다. 하지만 동시성이 커질수록 **통합의 원자 단위는 오히려 작게** 잡아야 한다. 그 단위가 task 하나다.

한 task가 끝나면 그 task의 PR들만 묶어 staging 테스트하고, 통과하면 즉시 main에 merge한 뒤 다음 task로 넘어간다. 병렬은 task 안에서, 직렬은 task 사이에서.
