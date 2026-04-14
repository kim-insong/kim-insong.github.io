# Plan: graphify + Wiki 자동 연동 구현

## 연관 스펙
`docs/specs/graphify-wiki-integration.md`

---

## 구현 순서

### Step 1 — graphify 소스를 tools/ 에 내장

`/tmp/graphify_src/graphify/` 를 `tools/graphify/` 로 복사.

```bash
mkdir -p tools/graphify
cp -r /tmp/graphify_src/graphify/. tools/graphify/
```

`tools/requirements.txt` 생성 (graphify Python 의존성):
```
networkx>=3.0
graspologic>=3.0
```

**수정 파일:**
- `tools/graphify/` (신규, 소스 복사)
- `tools/requirements.txt` (신규)
- `requirements.txt` 루트 파일 → `tools/requirements.txt` 참조로 변경

**검증:** `PYTHONPATH=tools python3 -c "import graphify; print('OK')"` → `OK`

---

### Step 2 — graphify 업데이트 스크립트 작성

**파일:** `scripts/run-graphify-update.sh`

```bash
#!/usr/bin/env bash
# Run /graphify --update on wiki + raw content and commit the result.
# Called from post-commit hook when src/content/wiki/ files change.
set -e

PROJECT_ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
export PYTHONPATH="$PROJECT_ROOT/tools"

cd "$PROJECT_ROOT"

echo "[graphify] Running --update on wiki + raw..."
claude --dangerously-skip-permissions -p "/graphify src/content/wiki/ raw/ --update" 2>&1 || {
  echo "[graphify] Warning: graphify update failed, skipping commit"
  exit 0
}

# Check if graphify-out/ changed
if git diff --quiet HEAD -- graphify-out/ 2>/dev/null && \
   [ -z "$(git ls-files --others --exclude-standard graphify-out/)" ]; then
  echo "[graphify] No changes in graphify-out/, skipping commit"
  exit 0
fi

git add graphify-out/
git commit -m "feat: update graphify knowledge graph [graphify-auto]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo "[graphify] graphify-out/ updated and committed"
```

**검증:** `bash scripts/run-graphify-update.sh` → graphify-out/ 갱신 + commit

---

### Step 3 — post-commit hook 확장

**파일:** `scripts/wiki-auto-ingest.sh` 맨 앞에 재귀 방지 조건 추가, 맨 끝에 graphify 트리거 추가.

**맨 앞 (set -e 바로 다음)에 추가:**
```bash
# Skip if this commit was made by graphify auto-update (prevent infinite loop)
LAST_MSG=$(git -C "$(dirname "$0")/.." log -1 --pretty=%s 2>/dev/null || true)
if [[ "$LAST_MSG" == *"[graphify-auto]"* ]]; then
  exit 0
fi
```

**맨 끝 (기존 로직 다음)에 추가:**
```bash
# Trigger graphify --update if wiki pages changed in this commit
WIKI_CHANGED=$(git -C "$PROJECT_ROOT" diff-tree --no-commit-id -r --name-status \
  --diff-filter=AMD HEAD 2>/dev/null \
  | grep -E '^[AMD]\s+src/content/wiki/.*\.md$' || true)

if [ -n "$WIKI_CHANGED" ]; then
  echo ""
  echo "[graphify] Wiki pages changed — running graphify update in background..."
  bash "$PROJECT_ROOT/scripts/run-graphify-update.sh" &
fi
```

**수정 파일:**
- `scripts/wiki-auto-ingest.sh`

**검증:**
1. wiki 파일 수정 + commit → 백그라운드에서 graphify 실행 확인
2. graphify-out/ 만 변경된 commit → hook이 exit 0 하는지 확인

---

### Step 4 — CLAUDE.md 업데이트

**파일:** `CLAUDE.md`

기존 `## Agent Wiki` 섹션 교체:

```markdown
## graphify 지식 그래프

post-commit hook이 `src/content/wiki/` 변경 시 자동으로 `graphify-out/`을 갱신한다.

**AI 에이전트 활용 규칙:**
- wiki 관련 작업 전: `graphify-out/GRAPH_REPORT.md` 읽어서 커뮤니티/핵심 노드 파악
- 구체적인 개념 탐색: `/graphify query "<질문>"` 실행
- 에이전트 진입점: `graphify-out/wiki/index.md`

**출력 구조:**
- `graphify-out/GRAPH_REPORT.md` — 커뮤니티 요약, God Nodes, 추천 쿼리
- `graphify-out/graph.json` — 전체 그래프 데이터
- `graphify-out/graph.html` — 브라우저 시각화
- `graphify-out/obsidian/` — Obsidian vault (File > Open Vault)
- `graphify-out/wiki/` — 에이전트 탐색용 마크다운

**수동 갱신:** `npm run build:agent-wiki`
```

---

### Step 5 — requirements.txt 정리

루트 `requirements.txt`:
```
# Python dependencies for graphify knowledge graph pipeline
# Install: pip3 install -r requirements.txt
networkx>=3.0
graspologic>=3.0
```

`tools/requirements.txt` 는 삭제 (루트에 통합).

---

### Step 6 — PYTHONPATH 설치 스크립트 (선택)

`scripts/install-graphify.sh` 추가 (새 환경 셋업 시 사용):

```bash
#!/usr/bin/env bash
# Install graphify Python dependencies for the knowledge graph pipeline.
set -e
pip3 install -r requirements.txt
echo "graphify dependencies installed"
echo "PYTHONPATH: $(git rev-parse --show-toplevel)/tools"
echo "Test: PYTHONPATH=tools python3 -c \"import graphify; print('OK')\""
```

---

## 수정 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `tools/graphify/` | 신규 | graphify 소스 복사 |
| `tools/requirements.txt` | 신규 (→ 루트에 통합) | Python 의존성 |
| `scripts/run-graphify-update.sh` | 신규 | graphify --update + auto-commit |
| `scripts/wiki-auto-ingest.sh` | 수정 | 재귀 방지 + wiki 변경 시 graphify 트리거 |
| `CLAUDE.md` | 수정 | graphify 활용 규칙 |
| `requirements.txt` | 수정 | graspologic, networkx 명시 |
| `scripts/install-graphify.sh` | 신규 (선택) | 신규 환경 설치 스크립트 |

---

## 엔드투엔드 검증

```bash
# 1. graphify import 확인
PYTHONPATH=tools python3 -c "import graphify; print('OK')"

# 2. wiki 파일 수정 후 commit → 자동 graphify 실행 확인
echo "test" >> src/content/wiki/getting-started.md
git add src/content/wiki/getting-started.md
git commit -m "test: trigger graphify"
# → 백그라운드에서 graphify --update 실행
# → graphify-out/ 변경 후 [graphify-auto] commit 생성

# 3. 무한루프 방지 확인
git log --oneline -5
# → [graphify-auto] commit 1개만 생성, 그 이상 없어야 함

# 4. graphify-out/ 최신화 확인
cat graphify-out/GRAPH_REPORT.md | head -10

# 5. AI 활용 확인
# → Claude에게 wiki 관련 질문 시 GRAPH_REPORT.md를 먼저 읽는지 확인
```

---

## 주의사항

- `run-graphify-update.sh` 의 `claude --dangerously-skip-permissions` 는 CI/unattended 실행 시 필요. 로컬에서는 일반 `claude` 로도 가능.
- graphify --update는 LLM을 사용하므로 토큰 비용 발생. `graphify-out/cache/` 가 이를 최소화.
- `/tmp/graphify_src` 는 임시 위치. `tools/graphify/` 로 이동하면 영구화됨.
- graspologic 설치 시 llvm/numba 컴파일 필요 → 처음 설치는 3-5분 소요.
