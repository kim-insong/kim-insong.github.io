# Pages & Routing

Static Astro pages covering home, about, and blog (listing + detail).

## Key Files

| File | Role |
|------|------|
| src/pages/index.astro | Homepage — hero section with bio and nav links |
| src/pages/about.astro | About page — career experience rows + skills grid |
| src/pages/blog/index.astro | Blog listing — sorted by `publishDate` desc |
| src/pages/blog/[slug].astro | Blog post detail — dynamic route from content collection |

## Core Concepts

- All pages are statically generated (`output: "static"` default in Astro).
- `blog/[slug].astro` uses `getStaticPaths()` to enumerate posts from the `blog` content collection.
- About page hardcodes experience/skills arrays in frontmatter — update directly in the file.
- Section rhythm follows the design system: alternating `bg-bg` / `bg-bg-alt`, `border-t border-border` dividers, `py-20 px-6` spacing, `max-w-5xl mx-auto` container.

## Diagram

```mermaid
graph TD
  A[/] --> B[/about]
  A --> C[/blog]
  C --> D[/blog/:slug]
```
