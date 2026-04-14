# Plan: LLM Wiki with Graphify

## Context

현재 위키는 수동 `[[wikilink]]` 기반 그래프(`scripts/build-wiki-graph.js`)와 수동 wiki-ingest 워크플로우로 운영되고 있다. AI 에이전트가 프로젝트 지식베이스를 빠르게 탐색할 수 있도록, graphify를 사용해 `raw/` + `src/content/wiki/` 콘텐츠를 LLM으로 분석한 에이전트 탐색용 위키를 구축한다.

**목표**: `raw/` + `src/content/wiki/`를 입력으로 받아, AI 에이전트가 읽고 탐색할 수 있는 구조화된 지식 그래프 + 위키 마크다운 파일들을 생성한다.

---

## What Graphify Produces

`graphify <dir> --wiki` 실행 결과:
- `graph.json` — 노드/엣지 그래프 데이터 (LLM 추출, EXTRACTED/INFERRED/AMBIGUOUS 태그)
- `graph.html` — vis.js 인터랙티브 시각화 (사람도 볼 수 있음)
- `GRAPH_REPORT.md` — 고연결도 노드, 커뮤니티, 추천 쿼리 요약
- `wiki/index.md` — 에이전트 진입점
- `wiki/communities/*.md` — 커뮤니티별 Wikipedia-style 문서
- `wiki/concepts/*.md` — 주요 개념별 문서

---

## Implementation Steps

### 1. Install Graphify

```bash
pip install graphifyy
```

`requirements.txt` 추가:
```
graphifyy>=0.1.0
```

프로젝트 루트에 `requirements.txt` 생성.

### 2. Build Script

**File**: `scripts/build-agent-wiki.sh`

```bash
#!/usr/bin/env bash
set -e

WIKI_DIR="src/content/wiki"
RAW_DIR="raw"
OUT_DIR="agent-wiki"

echo "[agent-wiki] Running graphify on $WIKI_DIR + $RAW_DIR..."

# graphify 실행 - wiki 콘텐츠와 raw 소스를 함께 처리
graphify "$WIKI_DIR" "$RAW_DIR" --wiki --output "$OUT_DIR" --update

echo "[agent-wiki] Done → $OUT_DIR/"
```

> **Note**: graphify CLI 플래그(`--output`, `--wiki`)는 실제 설치 후 `graphify --help`로 확인하여 조정 필요.

### 3. npm Script 추가

**File**: `package.json`

```json
"scripts": {
  "dev": "node scripts/build-wiki-graph.js && astro dev",
  "build": "node scripts/build-wiki-graph.js && astro build && npx pagefind --site dist",
  "build:agent-wiki": "bash scripts/build-agent-wiki.sh",
  ...
}
```

### 4. Output Directory Structure

```
agent-wiki/
├── index.md          ← AI 에이전트 진입점
├── graph.json        ← LLM 추출 그래프 데이터
├── graph.html        ← vis.js 시각화 (인간용)
├── GRAPH_REPORT.md   ← 커뮤니티 요약 + 추천 쿼리
├── communities/
│   ├── game-dev.md
│   ├── ios.md
│   └── ...
└── concepts/
    ├── redis.md
    ├── swiftui.md
    └── ...
```

`agent-wiki/` 는 커밋에 포함한다 (빌드 결과물이지만, LLM 실행 비용이 있으므로 캐시 역할).

### 5. .gitignore 제외 해제

`agent-wiki/` 를 `.gitignore`에서 제외하지 않음 → 커밋에 포함.

그러나 `graph.html` (바이너리에 가까운 대용량 HTML)은 `.gitignore`에 추가 검토.

### 6. /wiki/llm-graph 페이지 추가 (선택적 인간용 뷰)

**File**: `src/pages/wiki/llm-graph.astro`

graphify가 생성한 `graph.html`을 iframe으로 임베드:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout title="LLM Knowledge Graph" description="AI-extracted concept graph">
  <iframe
    src="/agent-wiki/graph.html"
    class="w-full h-[80vh] border-0"
    title="LLM Knowledge Graph"
  />
</BaseLayout>
```

`agent-wiki/graph.html`을 `public/agent-wiki/graph.html`로 복사하거나 심볼릭 링크 설정 필요. 또는 build 스크립트에서 직접 `public/`에 출력.

> `graph.html`이 크거나 외부 파일을 참조하는 경우 iframe이 동작하지 않을 수 있어, 이 단계는 실행 결과를 보고 결정.

### 7. CLAUDE.md 업데이트

프로젝트 루트 `CLAUDE.md`에 추가:

```markdown
## Agent Wiki

AI 에이전트는 `agent-wiki/index.md`를 진입점으로 사용해 지식 그래프를 탐색할 수 있다.
- 전체 요약: `agent-wiki/GRAPH_REPORT.md`
- 그래프 데이터: `agent-wiki/graph.json`
- 커뮤니티 문서: `agent-wiki/communities/`
- 개념 문서: `agent-wiki/concepts/`

갱신: `npm run build:agent-wiki`
```

---

## Critical Files

| 파일 | 역할 | 상태 |
|------|------|------|
| `requirements.txt` | Python 의존성 | 신규 생성 |
| `scripts/build-agent-wiki.sh` | graphify 실행 스크립트 | 신규 생성 |
| `package.json` | `build:agent-wiki` npm 스크립트 추가 | 수정 |
| `CLAUDE.md` | agent-wiki 진입점 문서화 | 수정 |
| `src/pages/wiki/llm-graph.astro` | 인간용 시각화 페이지 (선택) | 신규 생성 |
| `agent-wiki/` | graphify 출력 (런타임 생성) | 빌드 결과 |

---

## Execution Order

1. `requirements.txt` 생성
2. `scripts/build-agent-wiki.sh` 생성 + 실행 권한 부여
3. `package.json` 수정
4. graphify 설치: `pip install graphifyy`
5. 테스트 실행: `npm run build:agent-wiki`
6. 실제 출력 플래그/경로 확인 후 스크립트 조정
7. `CLAUDE.md` 업데이트
8. 선택적으로 `src/pages/wiki/llm-graph.astro` 추가
9. PR 생성

---

## Verification

```bash
# graphify 설치 확인
graphify --version

# 빌드 실행
npm run build:agent-wiki

# 출력 확인
ls agent-wiki/
cat agent-wiki/index.md
cat agent-wiki/GRAPH_REPORT.md

# (선택) 로컬 서버에서 llm-graph 페이지 확인
npm run dev
# → http://localhost:4321/wiki/llm-graph
```

---

## Open Questions (실행 시 확인)

1. `graphify`의 정확한 `--output` 플래그명 → `graphify --help` 확인
2. `--wiki` 출력 디렉토리 구조 → 실제 실행 결과로 확인
3. `graph.html`이 standalone인지 외부 의존성이 있는지 → iframe 사용 가능 여부 결정
4. graphify가 여러 입력 경로를 지원하는지, 아니면 단일 경로만 받는지 확인
