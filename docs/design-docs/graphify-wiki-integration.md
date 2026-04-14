# Spec: graphify + Wiki 자동 연동

## 문제 / 동기

현재 위키 시스템은 두 가지 독립적인 흐름으로 작동한다:

1. **사람이 읽는 위키** — `raw/` + `blog/` → wiki-ingest → `src/content/wiki/*.md`  
   구조화된 레퍼런스 페이지. 사람도 읽고 AI도 읽는다.

2. **AI 탐색 그래프** — graphify → `graphify-out/`  
   LLM이 개념 연결을 빠르게 파악하기 위한 지식 그래프.

문제: 현재 이 두 흐름은 연결되지 않는다. wiki 페이지가 업데이트돼도 graphify-out/은 수동으로 재생성해야 한다. AI가 오래된 그래프를 참조할 수 있다.

---

## 목표

- 기존 wiki-ingest 워크플로우는 **그대로 유지**: raw/blog → 사람이 읽는 wiki 페이지 생성
- wiki 페이지가 커밋될 때마다 graphify-out/ **자동 갱신**
- Claude(AI)는 wiki 관련 작업 시 graphify-out/을 **자동 참조**

---

## 전체 흐름

```
[1] raw/ 또는 blog/ 에 파일 추가/수정
        ↓ (commit)
[2] post-commit hook: wiki-auto-ingest.sh
        → Claude가 src/content/wiki/*.md 생성/수정
        → Claude가 wiki 변경사항 commit
        ↓ (commit — wiki 파일 포함)
[3] post-commit hook: 다시 트리거
        → src/content/wiki/ 변경 감지
        → graphify --update 실행 (PYTHONPATH=tools/)
        → graphify-out/ 갱신
        → Claude or script 가 graphify-out/ commit
        ↓ (commit — graphify-out/ 만 포함)
[4] post-commit hook: 다시 트리거
        → wiki/ 변경 없음 → 즉시 exit (무한루프 없음)
```

---

## 범위

### In scope

| 항목 | 설명 |
|------|------|
| graphify 트리거 | src/content/wiki/ 변경 커밋 시 자동 실행 |
| graphify 소스 내장 | `tools/graphify/` 에 소스 포함 (PYTHONPATH 안정성) |
| graphify-out/ 자동 커밋 | 갱신 후 별도 commit으로 저장 |
| CLAUDE.md 업데이트 | wiki 작업 전 graphify-out/ 참조 규칙 명시 |
| 무한루프 방지 | graphify-out/만 변경된 commit은 트리거 skip |

### Out of scope

- graphify Python 패키지 PyPI 게시 (외부 프로젝트)
- wiki 페이지 자동 생성 (기존 wiki-ingest가 담당)
- Obsidian 앱 연동 (사용자 로컬 설정)
- CI/CD 파이프라인 통합

---

## 컴포넌트 설계

### 1. graphify 소스 내장 (`tools/graphify/`)

graphify Python 패키지가 아직 PyPI에 없어서 PYTHONPATH로 직접 소스를 참조한다.

```
tools/
  graphify/          ← github.com/safishamsi/graphify의 graphify/ 디렉토리 복사
    __init__.py
    detect.py
    extract.py
    build.py
    cluster.py
    ...
  requirements.txt   ← graphify Python 의존성 (networkx, graspologic 등)
```

### 2. graphify 업데이트 스크립트 (`scripts/run-graphify-update.sh`)

wiki 변경이 감지됐을 때 호출되는 스크립트:

```bash
# 핵심 동작:
PYTHONPATH=$(git rev-parse --show-toplevel)/tools \
  python3 -c "import graphify" 2>/dev/null
  
# graphify --update 실행 (claude CLI 통해 /graphify skill 호출)
# graphify-out/ 변경사항 git add + commit
```

graphify는 Claude Code skill이므로 `claude -p "/graphify src/content/wiki/ raw/ --update"` 형태로 호출.

### 3. post-commit hook 확장 (`scripts/wiki-auto-ingest.sh`)

기존 raw/blog 감지 로직 뒤에 wiki 변경 감지 블록 추가:

```bash
# 기존: raw/ + blog/ 변경 감지 → wiki-ingest
# 추가: wiki/ 변경 감지 → graphify --update

WIKI_CHANGED=$(git diff-tree --no-commit-id -r --name-status --diff-filter=AM HEAD \
  | grep -E '^[AM]\s+src/content/wiki/.*\.md$' || true)

if [ -n "$WIKI_CHANGED" ]; then
  bash "$PROJECT_ROOT/scripts/run-graphify-update.sh"
fi
```

무한루프 방지: `run-graphify-update.sh`의 graphify-out/ commit 메시지에 `[graphify-auto]` 마커를 포함하고, hook 첫줄에서 체크:

```bash
LAST_MSG=$(git log -1 --pretty=%s)
if [[ "$LAST_MSG" == *"[graphify-auto]"* ]]; then exit 0; fi
```

### 4. CLAUDE.md 규칙 추가

```markdown
## graphify 활용 규칙

wiki 관련 작업(wiki-ingest, 위키 내용 참조, 연관 개념 파악) 전:
1. `graphify-out/GRAPH_REPORT.md` 읽기 — 커뮤니티 구조와 핵심 노드 파악
2. `graphify-out/wiki/index.md` 읽기 — 에이전트 탐색 진입점

graphify-out/은 wiki 커밋마다 post-commit hook이 자동 갱신한다.
직접 `/graphify query "..."` 로 쿼리도 가능.
```

---

## 트레이드오프

| 항목 | 결정 | 이유 |
|------|------|------|
| graphify 소스 위치 | tools/ 내장 | 안정적인 PYTHONPATH, clone 즉시 사용 가능 |
| 트리거 방식 | post-commit hook | 커밋 기준 최신화, CI 불필요 |
| graphify-out/ git 포함 | Yes | clone에 항상 최신 그래프 포함, 재생성 불필요 |
| hook 재귀 방지 | 커밋 메시지 마커 | 단순, 명확, 추가 상태 파일 불필요 |
| graphify 실행 | claude CLI (/graphify skill) | Python 패키지 없어도 skill이 semantic extraction 담당 |
