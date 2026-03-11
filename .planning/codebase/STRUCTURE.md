# Codebase Structure

**Analysis Date:** 2026-03-11

## Directory Layout

```
rr-website/
├── index.html                 # Homepage — brand loader, hero, capabilities grid
├── about.html                 # Company story and values
├── contact.html               # Contact form with validation
├── careers.html               # Job listings page
├── admin.html                 # Admin dashboard for content management
│
├── capabilities/              # Product capability pages
│   ├── plastic-toys.html      # Injection molding, mold development
│   ├── dolls.html             # Doll manufacturing
│   ├── plush.html             # Plush toy production
│   ├── rc-vehicle.html        # Remote control vehicle assembly
│   └── costume.html           # Costume manufacturing
│
├── cn/                        # Chinese (Traditional) language site
│   ├── index.html             # 中文首页
│   ├── about.html
│   ├── contact.html
│   ├── careers.html
│   └── capabilities/          # CN capability pages (mirrors /capabilities/)
│       ├── plastic-toys.html
│       ├── dolls.html
│       ├── plush.html
│       ├── rc-vehicle.html
│       └── costume.html
│
├── id/                        # Indonesian language site
│   ├── index.html             # Halaman Utama (Indonesian)
│   ├── about.html
│   ├── contact.html
│   ├── careers.html
│   └── capabilities/          # ID capability pages (mirrors /capabilities/)
│       ├── plastic-toys.html
│       ├── dolls.html
│       ├── plush.html
│       ├── rc-vehicle.html
│       └── costume.html
│
├── assets/                    # Static files — styles, scripts, media
│   ├── shared.css             # Global design system & component styles (~1.2KB compiled)
│   ├── shared.js              # Global interaction engine — 14 modules (~46KB)
│   ├── animations.js          # Scroll reveal system using IntersectionObserver (~2KB)
│   │
│   ├── fonts/                 # Self-hosted web fonts (WOFF2 format)
│   │   ├── clash-display-400.woff2
│   │   ├── clash-display-500.woff2
│   │   ├── clash-display-600.woff2
│   │   ├── clash-display-700.woff2
│   │   ├── satoshi-300.woff2
│   │   ├── satoshi-400.woff2
│   │   ├── satoshi-500.woff2
│   │   └── satoshi-700.woff2
│   │
│   ├── images/                # Product and content images (WebP format)
│   │   ├── aerobie-frisbee.webp
│   │   ├── bluey-figures.webp
│   │   ├── cash-register-playset.webp
│   │   ├── ... (30+ product images)
│   │   └── og-image.png       # Open Graph image for social sharing
│   │
│   ├── models/                # 3D models for WebGL (GLTF format)
│   │   └── (Three.js WebGL models — loaded on demand)
│   │
│   ├── logo.png               # Company logo
│   ├── costume.webp           # Hero/section images
│   ├── doll.webp
│   ├── fabric-cutting.webp
│   ├── injection-molding.webp
│   ├── quality-inspection.webp
│   └── ... (15+ process/feature images in WebP)
│
├── docs/                      # Documentation
│   └── (Reference docs, architecture notes)
│
├── .planning/                 # GSD planning artifacts
│   └── codebase/              # Codebase analysis documents
│       ├── ARCHITECTURE.md    # Architecture patterns and layers
│       └── STRUCTURE.md       # (this file)
│
├── favicon-32x32.png          # Favicon assets
├── favicon-16x16.png
├── favicon-192x192.png
├── apple-touch-icon.png
│
├── CNAME                      # DNS configuration for royalregentgroup.com
├── robots.txt                 # Search engine directives
├── sitemap.xml                # XML sitemap for SEO
├── jobs.json                  # Job listings data source (JSON array)
├── README.md                  # Project documentation
└── .gitignore                 # Git ignore rules
```

## Directory Purposes

**Root Level:**
- Purpose: Entry point HTML pages and site configuration
- Contains: Homepage, primary pages (about, contact, careers, admin), static config files
- Key files: `index.html` (entry point), `jobs.json` (data source), `CNAME` (DNS), `sitemap.xml` (SEO)

**capabilities/:**
- Purpose: Product category detail pages — one page per manufacturing capability
- Contains: Heroic page layouts with process photos, feature lists, call-to-action sections
- Key files: `plastic-toys.html`, `dolls.html`, `plush.html`, `rc-vehicle.html`, `costume.html`

**cn/ and id/:**
- Purpose: Language-specific site mirrors — internationalization via directory routing
- Contains: Full page replicas in Traditional Chinese and Indonesian, respecting RTL/LTR conventions
- Key files: Mirror structure of root HTML files with localized content

**assets/:**
- Purpose: All static resources — styles, scripts, images, fonts, 3D models
- Contains: Global CSS, interaction JavaScript, self-hosted fonts, optimized images, WebGL models
- Key files: `shared.css` (design system), `shared.js` (interaction engine), `animations.js` (scroll reveal)

**assets/fonts/:**
- Purpose: Web font delivery — reduces external requests and improves performance
- Contains: Clash Display (headlines) and Satoshi (body) in 8 font weight variants
- Key files: All fonts in WOFF2 format (modern compression)

**assets/images/:**
- Purpose: Product showcase images and content graphics
- Contains: WebP format product images, process photos, category illustrations
- Key files: og-image.png (social media preview), costume/doll/rc photos

**assets/models/:**
- Purpose: 3D assets for WebGL particle system
- Contains: GLTF format 3D models loaded by Three.js
- Key files: Generated dynamically or static models

## Key File Locations

**Entry Points:**

- `index.html`: Main homepage — loads shared.css, shared.js, animations.js; initializes brand loader and hero animations
- `capabilities/plastic-toys.html`: Capability detail template — same pattern repeated for all product types
- `cn/index.html`: Chinese homepage — same HTML structure as English but localized text
- `admin.html`: Admin dashboard — consumes jobs.json for CRUD operations

**Configuration:**

- `jobs.json`: Static data source for job listings — array of job objects with title, location, description, apply link
- `sitemap.xml`: XML sitemap for search engines — lists all page URLs and change frequency
- `robots.txt`: Search engine crawl rules (Disallow, Allow directives)
- `CNAME`: DNS configuration file (contains `royalregentgroup.com`)

**Core Logic:**

- `assets/shared.js`: Global interaction engine — 14 independent modules (cursor, animations, forms, navbar, language selector)
- `assets/animations.js`: Scroll reveal system — uses IntersectionObserver to trigger CSS animations on scroll
- `assets/shared.css`: Design system — CSS variables, typography scale, component styles, responsive utilities

**Testing:**

- No dedicated test files found (static site, minimal client-side logic)
- Browser DevTools console used for manual testing
- Accessibility testing via external tools (WAVE, axe)

## Naming Conventions

**Files:**

- HTML pages: kebab-case descriptive names (`plastic-toys.html`, `rc-vehicle.html`)
- CSS: Single global file (`shared.css`) — follows naming pattern established across company projects
- JavaScript: Module-based with suffix indicating function (`animations.js` → animation logic, `shared.js` → shared utilities)
- Images: kebab-case product/feature names (`aerobie-frisbee.webp`, `quality-inspection.webp`)
- Fonts: Foundry name + weight (`clash-display-600.woff2`, `satoshi-400.woff2`)

**Directories:**

- Language folders: ISO 639-1 codes (`cn` for Chinese, `id` for Indonesian) — implicit `/en` for English (root)
- Feature folders: Plural nouns for collections (`capabilities/`, `assets/`, `fonts/`, `images/`, `models/`)

**CSS Classes:**

- Block Element Modifier (BEM)-inspired but loose:
  - Blocks: `.navbar`, `.hero`, `.editorial`, `.modal`, `.cursor-dot`
  - Elements: `.hero-title`, `.navbar-logo`, `.form-field`
  - Modifiers: `.is-active`, `.is-revealed`, `.mobile-menu-open`, `.exit-bg`
- State classes: Prefixed with `.is-` (`.is-revealed`, `.is-active`) or `.has-` (`.has-nav-open`)
- Layout utility classes: Not heavily used (styles inline in style tags per page)

**JavaScript Identifiers:**

- Variables: camelCase (`isTouch`, `prefersReducedMotion`, `isMobile`)
- Functions: camelCase, verb-based (`initCursor()`, `handleScroll()`, `validateForm()`)
- Constants: UPPER_SNAKE_CASE if used (`const MOBILE_BREAKPOINT = 768`)
- Data attributes: kebab-case (`data-reveal`, `data-cursor`, `data-parallax`, `data-reveal-delay`)

## Where to Add New Code

**New Feature:**
- Primary code: Add logic to `assets/shared.js` inside a new `function init<FeatureName>()` block with marker comments
- Styles: Add to `assets/shared.css` under new comment section with descriptive header
- Data: Store in `jobs.json` or create new JSON file in root if large dataset
- Test: Use browser DevTools or external testing tools (no automated test framework)

**New Component/Module:**
- Implementation: Create new function in `assets/shared.js` (example: `initNewComponent()`)
- Initialization: Call function in `DOMContentLoaded` event handler at bottom of shared.js
- HTML Structure: Use semantic tags with data attributes (e.g., `<div data-new-component>`)
- Styles: Add to `assets/shared.css` with BEM-style class naming

**New Page:**
- Create HTML file at root level (e.g., `features.html`) or in appropriate subdirectory
- Include same head metadata structure as existing pages (charset, viewport, favicon, Open Graph, JSON-LD, hreflang)
- Link to `<link rel="stylesheet" href="assets/shared.css">` and `<script src="assets/shared.js"></script>`
- Add to site navigation and sitemap.xml
- Repeat for language variants (`cn/features.html`, `id/features.html`)

**Utilities/Helpers:**
- Shared JavaScript utilities: Add function to `assets/shared.js` (avoid separate files)
- Shared CSS utilities: Add to `assets/shared.css` `:root` variables or utility classes
- Data utilities: Store in JSON files (jobs.json pattern) or JavaScript objects if small

## Special Directories

**assets/fonts/:**
- Purpose: Self-hosted web fonts to eliminate external requests and improve loading performance
- Generated: No — hand-selected foundry files (Clash Display from Clash Foundry, Satoshi from Fonts.com)
- Committed: Yes — critical for brand rendering

**assets/images/:**
- Purpose: Product showcase images and content graphics
- Generated: No — sourced from product photography and designers
- Committed: Yes — all product images committed to repo (WebP format for compression)

**assets/models/:**
- Purpose: 3D models for WebGL particle system
- Generated: Potentially — models can be generated from 3D tools and committed as GLTF/GLB
- Committed: Yes — binary files tracked in git-lfs (if large) or as text GLTF

**cn/ and id/:**
- Purpose: Localized site versions for Chinese and Indonesian markets
- Generated: No — manually created and maintained for each language
- Committed: Yes — all HTML localized content committed to track translations

**.planning/codebase/:**
- Purpose: GSD codebase mapping artifacts — architecture and structure documentation
- Generated: Yes — created by GSD `/gsd:map-codebase` command
- Committed: Yes — serves as reference for `/gsd:plan-phase` and `/gsd:execute-phase`

---

*Structure analysis: 2026-03-11*
