# Community: 위키 메타 / 워크플로우

Community ID: `meta` | Nodes: 2 | Sources: `src/content/wiki/getting-started.md`, `raw/README.md`

## Overview

insong.net 위키 자체의 동작 방식과 raw/ 소스 파일 워크플로우.

---

## 위키 구조

- **wiki 페이지**: `src/content/wiki/*.md` — 구조화된 레퍼런스 (서사 없이, 테이블/코드 위주)
- **blog 포스트**: `src/content/blog/*.md` — 서사형 글 (wiki의 소스가 됨)
- **raw/ 파일**: 처리되지 않은 노트, 리서치 덤프

## wiki-ingest 워크플로우

```
raw/ 에 .md 파일 추가
  → wiki-log.md Unincorporated 섹션에 등록
  → /wiki-ingest 실행
  → Claude가 src/content/wiki/ 에 구조화된 페이지 생성
  → wiki-log.md Incorporated 섹션으로 이동
```

## 내부 링크

위키 페이지 내에서 `[[slug-name]]` 을 쓰면 `/wiki/slug-name` 링크로 변환됨.  
예: `[[game-server-request-context]]` → `/wiki/game-server-request-context`

## 자동화

- **post-commit hook**: `scripts/wiki-auto-ingest.sh` — 새 raw/ 파일 감지 시 자동으로 wiki-log.md에 추가
- **wiki-graph 빌드**: `scripts/build-wiki-graph.js` — wikilink 파싱 → `public/wiki-graph.json` 생성 → `/wiki/graph` 시각화

---

## Source

- Wiki: `src/content/wiki/getting-started.md`
- raw/: `raw/README.md`
