# Architecture

**Analysis Date:** 2026-03-11

## Pattern Overview

**Overall:** Static multi-language website with progressive enhancement — vanilla HTML/CSS/JS built for performance-first delivery with graceful degradation.

**Key Characteristics:**
- Single-page static HTML architecture (no framework, no build step)
- Progressive enhancement: works without JavaScript; enhanced with interactions via vanilla JS
- Multi-language support through directory-based routing (`/en/`, `/cn/`, `/id/` implicit)
- Accessibility-first: respects `prefers-reduced-motion`, proper semantic HTML, ARIA patterns
- Performance-focused: IntersectionObserver for lazy reveal, WebGL via Three.js for particles, GSAP for animations only when loaded

## Layers

**Presentation Layer (HTML):**
- Purpose: Semantic HTML templates for each page route, metadata (Open Graph, JSON-LD, hreflang)
- Location: Root HTML files (`/index.html`, `/about.html`, `/contact.html`, `/careers.html`, `/admin.html`) and language-specific versions in `/cn/`, `/id/`
- Contains: Page structure, form markup, interactive elements marked with data attributes
- Depends on: Global CSS (`assets/shared.css`), animation systems (`assets/animations.js`, `assets/shared.js`)
- Used by: Browser rendering engine; consumed by search engines via structured data

**Design System Layer (CSS):**
- Purpose: Unified visual language across all pages — typography, color palette, spacing, component styles
- Location: `assets/shared.css` — single global stylesheet
- Contains: CSS variables (brand palette, typography scale, spacing, z-index), reset/base styles, layout utilities, component styles (cursor, buttons, cards, forms)
- Depends on: Self-hosted fonts (`assets/fonts/`) — Clash Display and Satoshi
- Used by: All HTML pages via `<link rel="stylesheet" href="assets/shared.css">`

**Interaction Layer (JavaScript):**
- Purpose: Progressive enhancement through vanilla JS modules — cursor tracking, scroll effects, form validation, animations
- Location: `assets/shared.js` (global engine, ~1200 lines), `assets/animations.js` (scroll reveal system, ~65 lines)
- Contains: 14 independent modules: cursor, magnetic buttons, scroll progress, aurora background, page transitions, parallax, WebGL particles, navbar behavior, hamburger menu, lazy loading, text animations, language selector, hover overlays, typewriter effects
- Depends on: External libraries (GSAP 3.14.2 for animation, Three.js for WebGL, Splitting.js for text splits — all via CDN)
- Used by: Initialized on page load via `DOMContentLoaded` event

**Static Assets:**
- Purpose: Images, fonts, 3D models for progressive rendering
- Location: `assets/` — fonts in `assets/fonts/`, product images in `assets/images/`, WebGL models in `assets/models/`
- Contains: WOFF2 font files (preloaded), WebP images (modern format), GLTF 3D models
- Depends on: Nothing
- Used by: CSS (font-face), HTML (img/picture tags), JavaScript (WebGL loader)

**Data Layer (JSON):**
- Purpose: Static data source for dynamic content (job listings, product catalogs)
- Location: `jobs.json` (job postings array)
- Contains: Structured data in JSON format for server-side rendering or client-side hydration
- Depends on: Nothing
- Used by: Admin page (`admin.html`) or future API endpoints

## Data Flow

**Page Load Sequence:**

1. Browser requests HTML (e.g., `/index.html`)
2. HTML head parses metadata (Open Graph, JSON-LD, hreflang) for SEO
3. CSS loads (`assets/shared.css`) — critical above-the-fold styles inline, rest deferred
4. HTML body renders with `data-*` attributes for JS targeting
5. JavaScript loads (`assets/shared.js` then `assets/animations.js`)
6. `DOMContentLoaded` event fires → modules initialize in sequence:
   - Feature detection (mobile/touch/motion prefs)
   - Cursor system (only on desktop with hover)
   - Scroll progress bar
   - Navbar behavior
   - Button interactions
   - Scroll reveal (IntersectionObserver for elements with `data-reveal`)
   - Language selector
   - Form handlers (contact, apply, etc.)
7. User interactions trigger JavaScript event listeners (mousemove, scroll, click)
8. External libraries (GSAP, Three.js) load asynchronously via CDN
9. WebGL particle system initializes when Three.js available

**State Management:**

- **URL/Navigation:** HTML directory structure (`/capabilities/plastic-toys.html`) — no client-side router
- **UI State:** Stored in DOM classes (`.active`, `.is-revealed`, `.mobile-menu-open`) and JavaScript variables
- **User Preferences:** Language preference in localStorage (set by language selector), animation preference via system `prefers-reduced-motion`
- **Form Data:** Collected on submit, validated client-side, sent via form submission (server handles)

**Asset Loading Strategy:**

- **Critical path:** HTML → CSS (inline critical) → Fonts (preload WOFF2) → HTML rendering
- **Non-critical:** JavaScript deferred, external CDN libraries loaded async
- **Lazy loading:** Images use `data-src` → JavaScript loads via Intersection Observer; WebGL models load on demand
- **Fallback:** All animations degrade gracefully to static layouts if JavaScript fails

## Key Abstractions

**Data Attributes System:**

- Purpose: Declarative targeting for JavaScript without modifying HTML structure
- Examples: `data-reveal` (scroll animations), `data-cursor` (cursor tracking), `data-parallax` (depth movement)
- Pattern: JavaScript queries `[data-*]` and applies event handlers/state classes
- Location: Used throughout HTML pages; consumed by `assets/shared.js`

**CSS Custom Properties (Variables):**

- Purpose: Single source of truth for design system — eliminates repeated color/size values
- Examples: `--brand: #7CB342`, `--text-5xl: clamp(3.5rem, 2rem + 6vw, 8rem)`
- Pattern: Defined in `:root {}`, inherited to all elements, override-able in media queries/pseudo-selectors
- Location: `assets/shared.css` lines 32-102

**Modular JavaScript Functions:**

- Purpose: Encapsulation of feature logic with clear initialization and cleanup
- Examples: `initCursor()`, `initMagneticButtons()`, `initScrollReveal()`
- Pattern: IIFE (Immediately Invoked Function Expression) wrapping all code; strict mode; feature detection before init
- Location: Each function in `assets/shared.js` between marker comments (e.g., `─── 1. ADVANCED TWO-PART CURSOR ────`)

**Intersection Observer Pattern:**

- Purpose: Efficient scroll-triggered animations without layout thrashing
- Examples: Scroll reveal system in `assets/animations.js` uses IntersectionObserver instead of scroll event
- Pattern: Create observer with threshold, observe targets, unobserve after first trigger
- Location: `assets/animations.js` lines 16-57

## Entry Points

**HTML Pages:**

- `index.html`: Home page — brand loader animation, hero section, capabilities grid, contact CTA
- `about.html`: Company story and values
- `contact.html`: Contact form with validation
- `careers.html`: Job listings from `jobs.json`
- `admin.html`: Admin dashboard for content management
- Language variants: `/cn/index.html`, `/id/index.html` (Chinese and Indonesian localized versions)
- Capability pages: `/capabilities/{type}.html` (plastic-toys, dolls, plush, rc-vehicle, costume)

**JavaScript Initialization:**

- `DOMContentLoaded` event (browser) → `assets/shared.js` runs feature detection → modules initialize conditionally
- Example: Cursor only initializes if `!isTouch && hasHover` (desktop with mouse)

**API/Data Sources:**

- `jobs.json`: Read by careers page to display job listings
- External CDNs: Splitting.js (text animation), GSAP (animation timeline), Three.js (WebGL), Locomotive Scroll (scroll behavior)

## Error Handling

**Strategy:** Graceful degradation — site works without JavaScript and external libraries

**Patterns:**

- **Feature Detection First:** Check browser capabilities (`navigator.userAgent`, `matchMedia`, `maxTouchPoints`) before initializing features
- **Try-Catch Wrapping:** Non-critical features wrapped to prevent one broken module from blocking page load (example: if GSAP CDN fails, page still renders)
- **Fallback Styles:** IntersectionObserver scroll reveal uses native CSS transitions; if observer unsupported, elements visible immediately
- **Form Validation:** Client-side validation in JavaScript, but form still works server-side if JS disabled

**Error Logging:** No centralized error reporting; bugs logged to browser console only

## Cross-Cutting Concerns

**Logging:**
- Approach: Browser console (`console.log()`, `console.warn()`) during development; no server-side logging
- Pattern: Each module logs initialization status: `"Cursor system initialized on desktop"` (visible in DevTools)

**Validation:**
- Approach: Client-side form validation in JavaScript (`validateForm()` patterns)
- Pattern: Check field values before submit, show inline error messages, prevent form submission if invalid
- Location: Form handlers in `assets/shared.js`

**Authentication:**
- Approach: None — static site with no user accounts
- Session handling: Not applicable

**Accessibility:**
- Approach: Semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`), ARIA labels, keyboard navigation
- Pattern: Respects `prefers-reduced-motion` (animations skip), color contrast meets WCAG AA standard
- Location: Implemented throughout all HTML; enforced in JavaScript module initialization

**Internationalization:**
- Approach: Directory-based routing (`/cn/` for Chinese, `/id/` for Indonesian)
- Pattern: Separate HTML files per language; shared CSS/JavaScript; language selector in navbar updates localStorage
- Location: `cn/` and `id/` directories mirror structure of English site; `assets/shared.js` has language selector module

**Performance:**
- Approach: Static HTML (no server render time), aggressive caching (images, fonts), CDN delivery
- Pattern: Preload critical fonts, defer non-critical JS, lazy load images, minify CSS
- Location: Cache-Control headers in `.htaccess` or web server config; inline critical CSS in HTML head

---

*Architecture analysis: 2026-03-11*
