# CLAUDE.md — Astro Site

## Project

Royal Regent Toys corporate website built with Astro 4.x + React Islands.
Deployed to GitHub Pages at royalregentgroup.com.

## Dev Commands

```sh
cd astro-site
npm run dev        # localhost:4321
npm run build      # Static output to ./dist/ (27 pages)
npm run preview    # Preview production build
```

## Architecture

- **27 pages** = 9 pages x 3 languages (EN `/`, CN `/cn/`, ID `/id/`)
- **BaseLayout.astro** — shared layout with meta tags, hreflang, font preloads, animation script loader
- **React Islands** — ContactForm.tsx, CareersJobBoard.tsx, LanguageSwitcher.tsx (hydrated with `client:load`)
- **Animation modules** — 21 vanilla JS IIFEs in `public/animation/`, registered via `window.RR.register()`. Do NOT wrap in React or useEffect.
- **Page-specific CSS** — extracted to `src/styles/` (about.css, contact.css, careers.css, capability.css)
- **Page-specific JS** — extracted to `public/assets/` (about-animations.js, home-animations.js, etc.)

## i18n Pattern

Content is inline per `.astro` file (not JSON). React components embed their own i18n dictionaries. When changing content, update all 3 language versions.

## Key Rules

- Animation changes must apply across all 3 language versions
- Never push directly to main — use feature branches + PRs
- `npm run build` must produce 27 pages with zero errors before committing
- Keep animation modules as vanilla JS IIFEs — they are framework-agnostic by design
