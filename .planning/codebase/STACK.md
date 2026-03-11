# Technology Stack

**Analysis Date:** 2026-03-11

## Languages

**Primary:**
- HTML5 - All page markup (`index.html`, `about.html`, `careers.html`, `contact.html`, `/capabilities/*.html`)
- CSS3 - Styling via `assets/shared.css`
- JavaScript (Vanilla) - Interaction engine via `assets/shared.js` and `assets/animations.js`

**Secondary:**
- JSON - Static data (`jobs.json`)

## Runtime

**Environment:**
- Browser runtime (modern browsers with ES6+ support)
- No server-side runtime required

**Package Manager:**
- None - no build system or package manager (static site)

## Frameworks

**Core:**
- GSAP 3.14.2 (GreenSock Animation Platform) - Scroll-triggered animations and parallax effects
- Splitting.js 1.0.6 - Text animation and character-level DOM manipulation
- Lenis 1.1.18 - Smooth scroll library
- Three.js 0.170.0 - 3D particle system and WebGL rendering

**Styling:**
- Vanilla CSS3 (no preprocessor)
- Design tokens via CSS custom properties in `assets/shared.css`

## Key Dependencies

**Critical:**
- GSAP 3.14.2 - Scroll-triggered animations; loaded via CDN (jsdelivr)
  - Module: ScrollTrigger (required for scroll-based triggers)
- Splitting.js 1.0.6 - Character-level animation setup
- Three.js 0.170.0 - 3D particle backgrounds on homepage

**Animation & Interaction:**
- Lenis 1.1.18 - Smooth scroll UX

**No Build Tools:**
- No bundler (Webpack, Vite, Parcel)
- No transpilation layer
- No minification pipeline
- All scripts delivered raw or via CDN

## Configuration

**Environment:**
- Static file hosting (GitHub Pages at charlesskl.github.io)
- No environment variables required
- No secrets management

**Build:**
- No build step
- Direct HTML/CSS/JS delivery

**CDN Services:**
- jsdelivr.net - GSAP, Splitting, Three.js delivery
- unpkg.com - Fallback for library versions

## Platform Requirements

**Development:**
- Text editor or IDE
- Local HTTP server for testing (e.g., `python -m http.server 8000`)
- Modern browser with:
  - ES6+ support
  - CSS custom properties
  - IntersectionObserver API
  - Fetch API
  - Touch/pointer event support

**Production:**
- GitHub Pages (static hosting)
- DNS via CNAME pointing to `charlesskl.github.io`
- Domain: `royalregentgroup.com`

## Delivery

**Asset Pipeline:**
- Custom fonts preloaded: `assets/fonts/clash-display-600.woff2`, `assets/fonts/satoshi-400.woff2`
- Images served as WebP with `loading="lazy"`
- Inline critical CSS for brand loader (inline `<style>` in `<head>`)
- External CSS linked via `<link>`

**Script Loading:**
- All external libraries loaded via `<script src>` tags
- SRI (Subresource Integrity) hashes present on CDN scripts
- Inline JavaScript for initialization and analytics fallback

---

*Stack analysis: 2026-03-11*
