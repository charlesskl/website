# Royal Regent Toys — Corporate Website

Astro 4.x site with React Islands for [royalregentgroup.com](https://royalregentgroup.com).

## Stack

- **Framework:** Astro 4.x (static output, zero JS by default)
- **Interactive components:** React 19 islands (`client:load`)
- **Animations:** 21 GSAP modules + Three.js r183 + Lenis (vanilla JS, loaded externally)
- **Fonts:** Self-hosted WOFF2 (Clash Display + Satoshi)
- **Hosting:** GitHub Pages via Actions

## Development

```sh
cd astro-site
npm install
npm run dev        # http://localhost:4321
npm run build      # Static output to ./dist/
npm run preview    # Preview production build
```

## Project Structure

```
astro-site/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro        # Shared layout (meta, fonts, animation loader)
│   ├── components/
│   │   ├── Nav.astro               # Navigation (static Astro)
│   │   ├── Footer.astro            # Footer (static Astro)
│   │   ├── Loader.astro            # Brand loader (static Astro)
│   │   ├── ContactForm.tsx         # Contact form (React island)
│   │   ├── CareersJobBoard.tsx     # Job board + apply modal (React island)
│   │   └── LanguageSwitcher.tsx    # Language dropdown (React island)
│   ├── pages/
│   │   ├── index.astro             # EN homepage
│   │   ├── about.astro             # EN about
│   │   ├── contact.astro           # EN contact
│   │   ├── careers.astro           # EN careers
│   │   ├── capabilities/           # EN capability pages (5)
│   │   ├── cn/                     # Traditional Chinese (9 pages)
│   │   └── id/                     # Indonesian (9 pages)
│   └── styles/                     # Page-specific CSS
├── public/
│   ├── animation/                  # 21 GSAP animation modules (vanilla JS)
│   ├── assets/                     # Images, logo, OG image
│   ├── fonts/                      # WOFF2 font files
│   ├── CNAME                       # royalregentgroup.com
│   ├── robots.txt
│   └── sitemap.xml
└── .github/workflows/deploy.yml    # GitHub Actions → Pages
```

## i18n

File-based routing with 3 locales:
- `/` — English (default, no prefix)
- `/cn/` — Traditional Chinese
- `/id/` — Indonesian

Each page is a separate `.astro` file with inline content per language. React components contain their own i18n dictionaries.

## Animation System

All 21 GSAP modules live in `public/animation/` as vanilla JS IIFEs. They register with `window.RR.register(name, { init, kill, refresh })` and are loaded via `<script is:inline>` in BaseLayout.astro. Do not wrap these in React — the IIFE pattern is intentional and framework-agnostic.

## Deployment

Push to `main` triggers GitHub Actions → builds Astro → deploys to GitHub Pages. Never push directly to main — use feature branches and PRs.
