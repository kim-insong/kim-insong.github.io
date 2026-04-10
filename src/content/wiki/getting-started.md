---
title: "위키 시작하기"
description: "insong.net 위키의 첫 번째 노트입니다."
tags: ["meta", "위키"]
publishDate: 2026-04-10
draft: false
---

개발 경험에서 얻은 인사이트와 지식을 기록하는 공간입니다.

## 이 위키의 목적

- 개발하면서 배운 것을 정리
- 나중에 검색해서 찾아보기 위한 기록
- 문서 간 [[getting-started]] 같은 내부 링크로 연결

## 작성 방법

VS Code에서 `src/content/wiki/` 폴더에 마크다운 파일을 추가하면 됩니다.

```md
---
title: "노트 제목"
tags: ["태그1", "태그2"]
publishDate: 2026-04-10
---

내용 작성...
```

`[[다른 노트 파일명]]` 형식으로 다른 노트를 참조할 수 있습니다.
