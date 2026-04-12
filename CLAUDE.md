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

If a PostToolUse hook outputs `[WIKI_AUTO_INGEST: <path>]`, immediately process that file into the wiki **without asking for confirmation**:

1. Convert path to source ID:
   - `/raw/file.md` → `raw/file.md`
   - `/src/content/blog/slug.md` → `blog:slug`
2. Read `wiki-log.md` — add source to `## Unincorporated` if not already there (today's date)
3. Read the source file content
4. Check existing pages in `src/content/wiki/` (reference `## Wiki Pages` in wiki-log.md)
5. Decide MERGE or CREATE based on topic overlap
6. Write the wiki page (content rules: no narrative, structured reference only, `[[links]]` for cross-refs)
7. Update `wiki-log.md`: move source to `## Incorporated`, update `## Wiki Pages`

## Git Workflow

- 작업마다 별도의 feature branch를 생성한다.
- 파일 수정이 포함된 작업은 반드시 PR 생성까지 완료한다.
- 작업 완료 후 PR을 생성하는 것까지만 수행한다.
- PR의 merge 및 close 여부는 사용자가 직접 결정한다. Claude가 merge하거나 close하지 않는다.
