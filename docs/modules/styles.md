# Styles & Design Tokens

Tailwind CSS v4 theme with custom design tokens, reusable component classes, and scroll-reveal animation.

## Key Files

| File | Role |
|------|------|
| src/styles/global.css | `@theme` tokens, base reset, component layer classes |

## Core Concepts

- All color/font tokens are defined in the `@theme {}` block — Tailwind auto-generates utility classes (`text-primary`, `bg-bg-alt`, etc.).
- Component classes in `@layer components`: `.section-label`, `.pillar-card` (hover lift), `.animate-reveal` + `.delay-1..4`.
- Scroll reveal: add `animate-reveal` to any element — the BaseLayout IntersectionObserver adds `.visible` when it enters the viewport.
- No decorative gradients or emojis anywhere on the site.
- For design token reference and all component patterns, use the `/web-insong-net` skill.

## Key Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#4F6DF0` | CTAs, links, section labels |
| `--color-text` | `#18181B` | Headings, primary text |
| `--color-text-sub` | `#71717A` | Body/description text |
| `--color-border` | `#E4E4E7` | Dividers, card borders |
| `--color-bg-alt` | `#FAFAFA` | Alternate section backgrounds |
