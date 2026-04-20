# Modular Docs Pattern

> 7 nodes · cohesion 0.29

## Key Concepts

- **CLAUDE.md는 목차 역할 (~100줄 이하)** (2 connections) — `src/content/wiki/documentation-policy.md`
- **CLAUDE.md 직접 임베딩 금지 — 규칙 묘지 (rationale)** (2 connections) — `src/content/wiki/documentation-policy.md`
- **메모리에 저장하지 않을 것 (코드/히스토리/디버깅)** (2 connections) — `src/content/wiki/knowledge-capture.md`
- **Feedback 메모리 구조 (규칙 + Why + How to apply)** (2 connections) — `src/content/wiki/knowledge-capture.md`
- **Memory 타입 구분 (user/feedback/project/reference)** (2 connections) — `src/content/wiki/knowledge-capture.md`
- **Modular CLAUDE.md (경로별 계층 로드)** (1 connections) — `src/content/wiki/documentation-policy.md`
- **Why를 알면 엣지케이스 판단 가능 (rationale)** (1 connections) — `src/content/wiki/knowledge-capture.md`

## Relationships

- No strong cross-community connections detected

## Source Files

- `src/content/wiki/documentation-policy.md`
- `src/content/wiki/knowledge-capture.md`

## Audit Trail

- EXTRACTED: 10 (83%)
- INFERRED: 2 (17%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*