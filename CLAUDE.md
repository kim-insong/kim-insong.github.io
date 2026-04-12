# CLAUDE.md

## Project
insong.net — personal portfolio site for insong.
Stack: Astro v4 + Tailwind CSS v4 + Pretendard Variable.
Use the `/web-insong-net` skill for design system reference.

## Feature → Doc Index

| Feature | Module Doc | Spec |
|---------|------------|------|
| Layout & Components | docs/modules/layout.md | — |
| Pages & Routing | docs/modules/pages.md | — |
| Content Collections | docs/modules/content.md | — |
| Styles & Design Tokens | docs/modules/styles.md | — |
| Deployment (GitHub Pages) | docs/modules/deploy.md | — |

## Wiki Auto-Ingest

If a PostToolUse hook outputs `[WIKI_AUTO_INGEST: <path>]`, immediately process that file into the wiki **without asking for confirmation**.

First, convert path to source ID:
- `/raw/file.md` → `raw/file.md`
- `/src/content/blog/slug.md` → `blog:slug`

Then check `wiki-log.md` to determine the mode:

**신규 소스** (wiki-log.md에 없음):
1. wiki-log.md `## Unincorporated`에 추가
2. 소스 파일 읽기
3. 기존 wiki 페이지 확인 (`## Wiki Pages`)
4. MERGE or CREATE 결정
5. wiki 페이지 작성 (content rules: no narrative, structured reference only, `[[links]]` for cross-refs)
6. wiki-log.md 업데이트: `## Incorporated`로 이동, `## Wiki Pages` 업데이트

**수정된 소스** (wiki-log.md `## Incorporated`에 이미 존재):
1. 소스 파일 읽기 (변경된 내용 파악)
2. 해당 소스를 참조하는 wiki 페이지 찾기 (wiki frontmatter의 `sources:` 필드)
3. 그 소스가 기여한 섹션만 업데이트 — 다른 소스에서 온 섹션은 건드리지 않음
4. wiki frontmatter의 `updatedDate` 갱신
5. wiki-log.md는 변경하지 않음

## Git Workflow

- 작업마다 별도의 feature branch를 생성한다.
- 파일 수정이 포함된 작업은 반드시 PR 생성까지 완료한다.
- 작업 완료 후 PR을 생성하는 것까지만 수행한다.
- PR의 merge 및 close 여부는 사용자가 직접 결정한다. Claude가 merge하거나 close하지 않는다.
