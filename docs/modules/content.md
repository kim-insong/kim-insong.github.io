# Content Collections (Blog & Wiki)

Markdown-based content managed via Astro content collections with Zod schema validation. Two collections are defined: `blog` (long-form posts) and `wiki` (reference entries).

## Key Files

| File | Role |
|------|------|
| src/content/config.ts | Defines the `blog` and `wiki` collection schemas |
| src/content/blog/*.md | Individual blog posts |
| src/content/wiki/*.md | Individual wiki entries |

## Core Concepts

- Both collections share the same schema fields: `title` (required), `description` (optional), `publishDate` (coerced date), `tags` (string[]), `draft` (boolean, default false).
- Add a new post by creating `src/content/blog/<slug>.md` with the required frontmatter — no other config needed.
- Add a new wiki entry by creating `src/content/wiki/<slug>.md` with the same frontmatter shape.
- `draft: true` entries are included in `getCollection()` by default; filter them out in listing pages: `posts.filter(p => !p.data.draft)`.
- Posts are sorted by `publishDate` descending in `blog/index.astro`.

## Frontmatter Template

```markdown
---
title: "Post or Entry Title"
description: "One-line summary"
publishDate: 2026-04-09
tags: ["tag1", "tag2"]
draft: false
---
```

## Collections Summary

| Collection | Directory | Purpose |
|------------|-----------|---------|
| `blog` | src/content/blog/ | Long-form articles and posts |
| `wiki` | src/content/wiki/ | Short reference entries, knowledge-base notes |
