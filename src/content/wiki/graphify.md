---
title: "graphify — 코드/문서 지식 그래프 도구"
description: "코드, 문서, 이미지, 미디어를 쿼리 가능한 지식 그래프로 변환하는 AI 코딩 어시스턴트 스킬"
tags: ["wiki", "knowledge-graph", "tooling", "AI", "Claude"]
publishDate: 2026-04-14
updatedDate: 2026-04-14
sources: ["raw/graphify.md"]
draft: false
---

## 개요

코드, 문서, 논문, 이미지, 미디어 파일을 쿼리 가능한 지식 그래프로 변환하는 도구.
Claude Code, Codex, Cursor, GitHub Copilot CLI 등 AI 플랫폼에서 스킬로 통합 가능.

- GitHub: [safishamsi/graphify](https://github.com/safishamsi/graphify)
- License: MIT
- Requirements: Python 3.10+, Claude Code

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

## 핵심 설계 원칙

- **Privacy-first**: 코드는 AST로 로컬 분석, 문서/이미지만 모델 API 전송
- **Token efficient**: 대형 혼합 코퍼스 대비 71.5x 압축
- **No embeddings**: 그래프 토폴로지 자체가 유사도 신호
- **Relationship tagging**: 엣지를 `EXTRACTED`, `INFERRED` (신뢰도 점수 포함), `AMBIGUOUS`로 태깅
- **Git hook integration**: 커밋 시 그래프 자동 재빌드 (선택)
- **Watch mode**: 개발 중 실시간 그래프 동기화

## 관련

- [[getting-started]] — 이 위키의 소스 관리 방식
- [[llm-wiki-pattern]] — graphify가 구현하는 LLM wiki 패턴
