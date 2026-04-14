# Layout & Components

Shared shell (head, nav, footer) that wraps every page via a single BaseLayout slot.

## Key Files

| File | Role |
|------|------|
| src/layouts/BaseLayout.astro | HTML shell — meta tags, font load, Header/Footer, scroll-reveal script |
| src/components/Header.astro | Sticky top nav with active-path detection |
| src/components/Footer.astro | Copyright + GitHub link |
| src/lib/utils.ts | `cn()` helper (clsx + tailwind-merge) for `.tsx` islands |

## Core Concepts

- All pages pass `title` and optional `description` props to BaseLayout.
- Pretendard Variable font is loaded via jsDelivr CDN in BaseLayout `<head>`.
- The IntersectionObserver scroll-reveal script lives in BaseLayout `<body>` — it activates `.animate-reveal` elements automatically for every page.
- Header detects the active route via `Astro.url.pathname.startsWith(item.href)`.
- `cn()` is only needed inside `.tsx` React island components — plain `.astro` files write classes directly.
