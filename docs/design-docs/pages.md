# Pages & Routing

Static Astro pages covering home, about, blog (listing + detail), wiki (listing + detail + graph), and apps (listing + detail).

## Key Files

| File | Role |
|------|------|
| src/pages/index.astro | Homepage — hero section with bio and nav links |
| src/pages/about.astro | About page — 4 sections: Header, Education, Career, Skills |
| src/pages/blog/index.astro | Blog listing — sorted by `publishDate` desc |
| src/pages/blog/[slug].astro | Blog post detail — dynamic route from content collection |
| src/pages/wiki/index.astro | Wiki listing — all reference entries |
| src/pages/wiki/[slug].astro | Wiki entry detail — dynamic route from wiki collection |
| src/pages/wiki/graph.astro | Wiki knowledge graph visualization |
| src/pages/apps/index.astro | Apps listing — all app entries |
| src/pages/apps/[slug].astro | App detail — dynamic route from apps collection |

## Core Concepts

- All pages are statically generated (`output: "static"` default in Astro).
- `blog/[slug].astro` uses `getStaticPaths()` to enumerate posts from the `blog` content collection.
- About page hardcodes all data (education, career, skills) as typed arrays in the component frontmatter — update directly in the file.
- Section rhythm follows the design system: alternating `bg-bg` / `bg-bg-alt`, `border-t border-border` dividers, `py-20 px-6` spacing, `max-w-5xl mx-auto` container.

## About Page Structure (`src/pages/about.astro`)

The about page is divided into 4 sections with hardcoded data arrays:

### 1. Header
Introductory paragraph about the developer's background and focus.

### 2. Education
Array of education items, each with:
```ts
{
  date: string;        // e.g. "2005 – 2010"
  description: string; // role/activity description
  stack?: string[];    // optional tech stack labels rendered as badges
  award?: string;      // optional award badge rendered inline (merged from former Activities section)
}
```

### 3. Career
Array of career entries, each with:
```ts
{
  period: string;   // e.g. "2010 – 2013"
  company: string;  // company name
  projects: {
    name: string;
    stack?: string[];      // optional tech stack labels rendered as badges
    highlights?: string[]; // optional bullet points describing key contributions
  }[];
}
```

### 4. Skills
Array of skill categories, each with:
```ts
{
  category: string; // e.g. "Languages", "Databases"
  items: string[];  // list of skill names
}
```

Current categories: Languages, Game Engines/Frameworks, Collaboration/Version Control, Databases, AI/LLM.

### Tech Stack Badges
Education items and career project entries optionally render a `stack` array as small inline badges. Badges use the design system's tag/chip styles and are rendered inline below the description or project name.

> **Note:** The standalone Activities section was removed in April 2026. Award entries are now inlined into Education items via the `award` field.

## Diagram

```mermaid
graph TD
  A[/] --> B[/about]
  A --> C[/blog]
  C --> D[/blog/:slug]
  A --> E[/wiki]
  E --> F[/wiki/:slug]
  E --> G[/wiki/graph]
  A --> H[/apps]
  H --> I[/apps/:slug]
```
