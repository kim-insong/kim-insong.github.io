# Content Collections (Blog)

Markdown-based blog posts managed via Astro content collections with Zod schema validation.

## Key Files

| File | Role |
|------|------|
| src/content/config.ts | Defines the `blog` collection schema |
| src/content/blog/*.md | Individual blog posts (add new posts here) |

## Core Concepts

- Schema fields: `title` (required), `description` (optional), `publishDate` (coerced date), `tags` (string[]), `draft` (boolean, default false).
- Add a new post by creating `src/content/blog/<slug>.md` with the required frontmatter — no other config needed.
- `draft: true` posts are included in `getCollection()` by default; filter them out in the listing page if needed: `posts.filter(p => !p.data.draft)`.
- Posts are sorted by `publishDate` descending in `blog/index.astro`.

## Frontmatter Template

```markdown
---
title: "Post Title"
description: "One-line summary"
publishDate: 2026-04-09
tags: ["tag1", "tag2"]
draft: false
---
```
