---
title: "graphify — 코드/문서 지식 그래프 도구"
description: "코드, 문서, 이미지, 미디어를 쿼리 가능한 지식 그래프로 변환하는 AI 코딩 어시스턴트 스킬"
tags: ["wiki", "knowledge-graph", "tooling", "AI", "Claude"]
publishDate: 2026-04-14
updatedDate: 2026-04-20
sources: ["raw/graphify.md", "blog:graphify-for-claude-code"]
draft: false
---

## 개요

코드, 문서, 논문, 이미지, 미디어 파일을 쿼리 가능한 지식 그래프로 변환하는 도구.
Claude Code, Codex, Cursor, GitHub Copilot CLI 등 AI 플랫폼에서 스킬로 통합 가능.

- GitHub: [safishamsi/graphify](https://github.com/safishamsi/graphify)
- License: MIT
- Requirements: Python 3.10+, Claude Code

## 설치 명령 구분

두 명령은 이름이 비슷해도 범위가 다르다 — 둘 다 필요하다.

| 명령 | 범위 | 효과 |
|------|------|------|
| `graphify install --platform claude` | 시스템 전역 | Claude Code에 `/graphify` slash command 등록 |
| `graphify claude install` | 현재 프로젝트 | 프로젝트 `CLAUDE.md`에 "그래프를 먼저 읽어라" 지침 주입 |

## 설치 및 기본 사용

```bash
pip install graphifyy && graphify install
```

```
/graphify .                   # 현재 폴더
/graphify ./src               # 특정 폴더
/graphify . --deep            # 딥 분석 모드
/graphify . --update          # 기존 그래프 업데이트
/graphify . --export svg      # SVG 내보내기
/graphify . --export graphml  # GraphML 내보내기
/graphify . --export neo4j    # Neo4j 내보내기
```

## 처리 파이프라인

1. **Deterministic AST pass** — tree-sitter로 코드 구조 추출 (로컬, LLM 없음)
2. **Local Whisper transcription** — 오디오/비디오 파일 (도메인 인식 프롬프트)
3. **Claude/GPT semantic extraction** — 문서, 이미지, PDF
4. **Leiden clustering** — 결과 그래프에서 커뮤니티 탐지

## 지원 파일 형식

| 분류 | 형식 |
|------|------|
| 코드 (23개 언어) | Python, TypeScript, JS, Go, Rust, Java, C/C++, Ruby, C#, Kotlin, Scala, PHP 등 |
| 문서 | Markdown, plain text, reStructuredText |
| 논문 | PDF (citation mining 포함) |
| 이미지 | PNG, JPG, WebP, GIF (Claude vision) |
| 미디어 | 오디오/비디오 (local Whisper) |

## 출력 형식

| 파일 | 설명 |
|------|------|
| `graph.html` | 검색·필터 가능한 인터랙티브 HTML 시각화 |
| `GRAPH_REPORT.md` | God nodes, 놀라운 연결, 추천 쿼리 |
| `graph.json` | 멀티세션 쿼리용 영속 그래프 데이터 |
| `obsidian/` | Obsidian vault (File > Open Vault) |
| `wiki/` | 에이전트 탐색용 Wikipedia 스타일 마크다운 |

SHA256 기반 캐싱으로 증분 업데이트 — 변경된 파일만 재처리.

## 쿼리 및 탐색

```
/graphify query "how does auth work?"   # 연결 탐색
/graphify path EntityA EntityB          # 두 엔티티 간 경로 탐색
```

- `wiki/index.md`를 진입점으로 에이전트 탐색 가능

## 벡터 DB vs. 그래프 (코드베이스 관점)

| 기준 | 그래프 (graphify) | 벡터 DB |
|------|-------------------|---------|
| 함수 호출 / 클래스 참조 추적 | 완벽 (AST 기반) | 불가능 — 이름 유사도만 |
| 결정론 | 같은 코드 → 같은 그래프 | 임베딩 모델 바뀌면 결과도 바뀜 |
| 최단 경로 질의 (A → B) | 지원 | 불가능 |
| edge 감사 (EXTRACTED/INFERRED/AMBIGUOUS) | 모든 엣지에 태그 | 없음 — 유사도 숫자만 |
| 자연어 유사도 검색 | 약함 | 강함 |
| unstructured blob (로그, 회의록) | 약함 | 강함 |
| 증분 삽입 | 재클러스터링 필요 가능 | O(1) |

**원칙**: 코드베이스 탐색과 "이 함수를 바꾸면 뭐가 깨지는가" 같은 구조 질문은 그래프. 애매한 자연어 검색이나 대량 unstructured text는 벡터.

## 핵심 설계 원칙

- **Privacy-first**: 코드는 AST로 로컬 분석, 문서/이미지만 모델 API 전송
- **Token efficient**: 대형 혼합 코퍼스 대비 71.5x 압축
- **No embeddings**: 그래프 토폴로지 자체가 유사도 신호
- **Relationship tagging**: 엣지를 `EXTRACTED`, `INFERRED` (신뢰도 점수 포함), `AMBIGUOUS`로 태깅
- **Git hook integration**: 커밋 시 그래프 자동 재빌드 (선택)
- **Watch mode**: 개발 중 실시간 그래프 동기화

## 사용 시나리오

| 시나리오 | 기존 방식 | graphify 대체 |
|----------|-----------|----------------|
| 프로젝트 LLM 컨텍스트 | 폴더마다 `CLAUDE.md` 수동 유지 | 그래프가 구조 보관, `/graphify query`로 서브그래프만 로드 |
| 개인 지식 창고 | 태그 수동 관리, 수동 교차참조 | `/raw`에 dump → community detection이 묶음 |
| 비정형 작성자 의도 | 폴더 CLAUDE.md의 자유 텍스트 | 폴더 CLAUDE.md 유지 (그래프가 대신 못 함) |

**원칙**: "이 폴더에 뭐가 있고 어디서 호출되는가" 같은 구조 정보는 그래프, "왜 이렇게 설계했는가" 같은 작성자 의도는 사람이 쓴 CLAUDE.md.

## CLAUDE.md 완전 대체가 위험한 이유

**로딩 보장 차이:**
- `CLAUDE.md` — cwd 기준 자동 로드, 해당 폴더 작업 내내 항상 컨텍스트에 있음
- `GRAPH_REPORT.md` — PreToolUse 훅이 Glob/Grep 직전에만 Claude에게 알림. 파일 탐색 없이 바로 답하면 안 읽힘

**AST가 못 잡는 것:**
- "이 폴더 테스트는 mock 금지" 같은 규칙
- "사용자 문자열은 L10n 필수" 같은 관습
- "stable ID 재사용 금지" 같은 원칙
- 도메인 용어집 (order vs. transaction vs. receipt)

**하이브리드 레시피** — 폴더 CLAUDE.md는 규칙·관습·용어집만 10줄 이내로, 맨 위에 한 줄 포인터:
```markdown
> 폴더 구조/의존은 graphify-out/GRAPH_REPORT.md 참조.
```
구조는 그래프가, 의도는 CLAUDE.md가 들고 있는다.

## 관련

- [[getting-started]] — 이 위키의 소스 관리 방식
- [[llm-wiki-pattern]] — graphify가 구현하는 LLM wiki 패턴
- 블로그: [[graphify-for-claude-code]] 원문 글
