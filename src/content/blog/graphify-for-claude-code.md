---
title: "graphify로 코드베이스를 LLM 친화적으로 만들기"
description: "AST 기반 지식 그래프로 폴더별 CLAUDE.md를 대체하고, 벡터 DB 없이 호출 관계를 완벽히 따라간다."
publishDate: 2026-04-20
tags: ["Claude", "graphify", "knowledge-graph", "workflow"]
draft: false
---

Claude Code에 프로젝트 구조를 알려주려고 폴더마다 CLAUDE.md를 놓는 방식을 써왔다. 각 폴더의 요약을 CLAUDE.md에 미리 적어두면, 해당 폴더에서 작업할 때만 관련 context가 로드되어 토큰을 아낄 수 있다. 괜찮은 방식이지만 유지보수가 문제다. 코드가 바뀔 때마다 요약을 업데이트해야 하고, 안 하면 금방 거짓말이 된다.

graphify를 써보니 이 문제가 거의 사라졌다.

## 설치 명령 두 개는 서로 다르다

이건 먼저 짚고 가자. 헷갈리기 쉽다.

```bash
graphify claude install          # 프로젝트 CLAUDE.md에 graphify 섹션 추가
graphify install --platform claude   # 전역 skill 설치
```

앞엣것은 현재 프로젝트의 `CLAUDE.md`에 "그래프를 먼저 읽어라"는 지침을 주입한다. 뒤엣것은 `/graphify` 슬래시 커맨드 자체를 Claude Code에 등록한다. 하나는 프로젝트 단위, 다른 하나는 시스템 단위. 둘 다 필요하다.

## AST를 쓰니 결정론적이고 토큰이 안 든다

graphify의 코어는 AST 파서다. 코드 파일은 LLM을 거치지 않고 직접 파싱해서 심볼과 호출 관계를 뽑는다.

- import, 함수 호출, 클래스 상속 → 전부 AST에서 그대로 추출
- 결정론적이라 같은 코드 → 같은 그래프. 재현된다.
- 코드 변경분만 재추출. `git post-commit` 훅이 바뀐 파일만 다시 파싱한다.

docs나 paper, image 같은 비코드 파일만 LLM 서브에이전트가 처리한다. 즉 토큰 비용이 드는 건 "의미 추출이 필요한 문서"뿐이고, 코드 관계는 공짜다.

## 벡터 DB와 비교하면 장단점이 갈린다

벡터 DB 기반 RAG가 여전히 기본값이지만, 코드베이스에 대해서는 그래프가 더 맞는 도구다.

**그래프가 이기는 지점**

- 클래스 간 참조, 함수 호출 체인 — AST가 완벽히 따라간다. 벡터 유사도는 "비슷한 이름"은 찾아도 "실제로 호출하는 곳"은 못 찾는다.
- 결정론 — 임베딩 모델이 바뀌어도 그래프는 안 바뀐다.
- 최단 경로 — `AuthModule → Database` 사이 실제 의존 경로를 질문할 수 있다.
- 감사 가능 — 모든 edge에 EXTRACTED / INFERRED / AMBIGUOUS 태그가 붙는다. "이 관계는 실제로 존재하는가 vs 추론인가"가 드러난다.

**벡터 DB가 이기는 지점**

- 자연어 유사도 검색 — "인증 관련 버그"처럼 애매한 질문.
- 스키마 없는 텍스트 덩어리 — 슬랙 로그, 회의록 같은 unstructured blob.
- 신규 청크 삽입이 O(1). 그래프는 재클러스터링이 필요할 수 있다.

내 경험으론 코드베이스 탐색은 그래프 쪽이 압도적으로 유용하다. 특히 "이 함수를 바꾸면 뭐가 깨지는가"는 벡터로는 거의 불가능하고, 그래프에선 edge를 한 번 따라가면 끝난다.

## 카파시가 말한 "컴파일된 위키"의 실체

Karpathy가 4월 초에 올린 LLM wiki 글이 있다. 핵심은 하나다.

> "The wiki is a persistent, compounding artifact. The cross-references are already there. The contradictions have already been flagged."

> "Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase."

즉 매 쿼리마다 원본 문서를 뒤지는 RAG 대신, LLM이 소스를 **컴파일해서** 상호링크된 마크다운 위키를 만든다는 아이디어다. 쿼리 시점이 아니라 쓰기 시점에 정리가 끝나 있다.

graphify는 이 개념의 코드 버전이다. `graphify-out/wiki/`에 커뮤니티별 마크다운 + `index.md`가 생기고, Obsidian vault로도 열 수 있다. 내 `/raw` 폴더에 아무거나 드롭하고 `/graphify` 한 번 돌리면 — 며칠 뒤에 "이 개념이 저 논문과 연결돼 있었구나"를 그래프가 먼저 알려준다.

## 개인 지식 창고로도 살아난다

블로그, 논문, 트윗, 스크린샷을 `/raw`에 그냥 쌓는다. community detection이 나중에 묶어준다. "며칠 뒤 돌아와 보니 이 개념이 저 논문과 연결돼 있었구나"를 그래프가 먼저 알려주는 구조다.

## 하이브리드가 정답이다 — 완전 대체는 위험하다

폴더별 CLAUDE.md를 전부 graphify로 대체하고 싶었지만, 실제로 해보면 위험한 부분이 있다.

**로딩 메커니즘이 다르다.** CLAUDE.md는 cwd 기준 **자동 로드**라 해당 폴더에서 작업하는 동안 항상 보장된다. 반면 `GRAPH_REPORT.md`는 PreToolUse 훅이 Glob/Grep **직전에만** Claude에게 알림을 띄운다. 즉 파일 탐색 도구를 호출하지 않고 바로 답해버리면 그래프를 안 읽을 수 있다. 구조는 최신일지 몰라도 "읽혔다"는 보장이 없다.

**그래프가 못 잡는 게 있다.** AST는 호출과 import는 완벽히 따라가지만, 규칙과 의도는 코드에 안 쓰여 있다:

- "이 폴더 테스트는 mock 금지"
- "사용자 문자열은 L10n 필수"
- "stable ID 원칙 — ID 재사용 금지"
- 도메인 용어집 — "order vs. transaction vs. receipt의 구분"

이런 건 사람이 CLAUDE.md에 써둬야 한다. 그래프엔 "어떻게 연결됐는가"는 있지만 "왜 그렇게 연결해야 하는가"는 없다.

### 실행 레시피

폴더 CLAUDE.md를 **얇게** 유지한다 — 규칙·관습·도메인 용어만. 구조 설명, 파일 목록, 의존 다이어그램은 전부 제거하고, 맨 위에 한 줄 포인터만:

```markdown
<!-- src/payments/CLAUDE.md -->
> 폴더 구조/의존 관계는 `graphify-out/GRAPH_REPORT.md` 참조.

## 규칙
- 결제 금액은 항상 minor unit (원 단위 정수)으로 다룬다.
- 외부 PG 응답은 `PgResponse` 타입으로 래핑 후 저장. 원시 JSON 저장 금지.
- 테스트는 sandbox 키로 실제 PG에 찍는다. mock 금지.

## 도메인 용어
- **Order** — 사용자가 "주문" 버튼을 누른 시점의 의도.
- **Transaction** — PG와의 개별 시도 (주문당 0..N).
- **Receipt** — 성공한 transaction의 사후 기록.
```

10줄이면 된다. 구조는 그래프가, 의도는 CLAUDE.md가 들고 있는다.

## 다음에 할 것

- 현재 프로젝트에 `graphify claude install` + `graphify hook install` (post-commit 자동 갱신)
- `/raw` 폴더 하나 만들고 읽던 글들 dump
- 1주일 뒤 `graphify-out/GRAPH_REPORT.md`의 "Surprising Connections" 섹션 열어보기

유지하는 비용 없이 쌓이는 구조 — 이게 내가 폴더별 CLAUDE.md에서 원했던 것이었고, graphify가 실제로 제공하는 것이다.

---

**Sources**

- [llm-wiki · GitHub Gist — Karpathy](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Beyond RAG: Karpathy's LLM Wiki Pattern — Level Up Coding](https://levelup.gitconnected.com/beyond-rag-how-andrej-karpathys-llm-wiki-pattern-builds-knowledge-that-actually-compounds-31a08528665e)
- [Karpathy's LLM Wiki Codes: Graphify — Medium](https://medium.com/data-science-in-your-pocket/andrej-karparthys-llm-wiki-codes-graphify-b73bec5d87ea)
- [graphify.net](https://graphify.net/)
