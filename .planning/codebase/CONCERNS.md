# Codebase Concerns

**Analysis Date:** 2026-03-11

## Tech Debt

**Hardcoded Formspree Form ID:**
- Issue: Contact form references placeholder ID `YOUR_FORM_ID` instead of actual integration
- Files: `contact.html` (line 519)
- Impact: Contact form submissions fail silently or go nowhere; users cannot submit inquiries
- Fix approach: Replace TODO with real Formspree endpoint from environment or secure configuration

**Massive shared.js File:**
- Issue: Single 1,300+ line JavaScript file containing 14 distinct modules (cursor, buttons, transitions, parallax, Three.js, navbar, menu, lazy loading, animations, typewriter, language selector, floating images)
- Files: `assets/shared.js`
- Impact: Difficult to maintain, test, or modify individual features; bundle size penalty; no code reuse across pages; hard to debug which module causes issues
- Fix approach: Decompose into separate feature modules (`cursor.js`, `magnetic-buttons.js`, `navbar.js`, etc.) with clear dependencies; use modern module system (ES6 imports) instead of IIFE pattern

**Inline HTML + CSS + JavaScript Coupling:**
- Issue: All pages duplicate large HTML structures with inline <style> blocks and inline script tags; CSS and JS tightly coupled to HTML
- Files: All `.html` files (index, about, contact, careers, capabilities pages)
- Impact: Changes to shared styles require manual updates across 20+ files; no separation of concerns; high duplication makes maintenance error-prone
- Fix approach: Extract shared HTML components, use CSS pre-processor with variables, separate JS into external modules with proper dependency injection

**Language Version Duplication:**
- Issue: EN, CN, and ID versions of all pages maintained separately (27 HTML files total); any content or structural change must be replicated 3 times
- Files: `index.html`, `cn/index.html`, `id/index.html` and all capability pages
- Impact: Maintenance burden grows 3x; easy to introduce inconsistencies or miss updates in one language; scaling to additional languages is unsustainable
- Fix approach: Implement template system (Liquid, Nunjucks, or static site generator) with i18n support; separate content (JSON) from layout

**Manual Image Asset Management:**
- Issue: 31+ product images deleted from git (status shows deleted .webp files) but referenced in multiple HTML files
- Files: `assets/images/` directory missing files; referenced in capabilities pages
- Impact: Product showcase pages may have broken image references; visual inconsistency across locales
- Fix approach: Establish asset pipeline with fallback images; use CDN or image hosting service; validate image references on build

**No Build Process:**
- Issue: Vanilla HTML/CSS/JS with CDN dependencies (GSAP, Three.js, Splitting.js); no bundling, minification, or asset optimization
- Files: All files reference external CDN URLs directly in HTML
- Impact: No tree-shaking; unused GSAP/Three.js code loads on every page; no module resolution; manual dependency management; no type safety
- Fix approach: Implement build pipeline (Vite, Webpack, or Parcel) with minification, tree-shaking, and asset optimization

## Known Bugs

**Formspree Integration Incomplete:**
- Symptoms: Contact form has no functional endpoint
- Files: `contact.html` (line 519)
- Trigger: User submits contact form
- Workaround: Currently form likely fails silently or redirects to error page

**Scroll Reveal Animation Fires Only Once:**
- Symptoms: Elements with `data-reveal` attribute animate only on first scroll into view; no replay on scroll-back (intentional per code comment FOUND-02)
- Files: `assets/animations.js` (line 47-48)
- Trigger: Scroll away from element, then scroll back into view
- Workaround: Intended behavior (per comment), but limits interactive re-engagement

**Three.js Particle System Dependency Risk:**
- Symptoms: Complex WebGL particle system depends on CDN-loaded Three.js; no fallback if CDN fails
- Files: `assets/shared.js` (Three.js module)
- Trigger: CDN timeout or network failure
- Workaround: Graceful degradation not implemented; background may fail to load silently

## Security Considerations

**Missing Content Security Policy (CSP):**
- Risk: Multiple external CDN dependencies (GSAP, Three.js, Splitting.js) without CSP headers; vulnerable to script injection or CDN compromise
- Files: All `.html` files reference external scripts without `<meta http-equiv="Content-Security-Policy">`
- Current mitigation: None detected
- Recommendations: Add strict CSP header; whitelist only trusted CDN domains (cdn.jsdelivr.net, cdnjs.cloudflare.com); implement SRI (Subresource Integrity) for all external scripts

**No Input Validation on Contact Form:**
- Risk: Contact form likely lacks server-side validation; vulnerable to injection attacks or spam
- Files: `contact.html` (contact form section)
- Current mitigation: None detected (Formspree endpoint not configured)
- Recommendations: Implement Formspree account with email verification; add client-side validation; consider CAPTCHA for spam prevention

**Hardcoded URLs in JavaScript:**
- Risk: API endpoints, form IDs, and service URLs scattered throughout `shared.js`
- Files: `assets/shared.js`
- Current mitigation: None
- Recommendations: Externalize configuration to `.env` or `config.js` (not committed); load at runtime based on environment

**Public Repositories with Potential Secrets:**
- Risk: `.DS_Store` and `.git` folder present; need to verify no secrets in commit history
- Files: `.git/` directory, `.DS_Store`
- Current mitigation: `.gitignore` present but minimal
- Recommendations: Add `.env.local`, `secrets/` to `.gitignore`; use git-secrets or similar tool to prevent accidental commits

## Performance Bottlenecks

**Multiple Heavy CDN Libraries Loaded Synchronously:**
- Problem: GSAP, Three.js, Splitting.js loaded in <head> or early <body> causing render-blocking
- Files: All `.html` files (script tag ordering)
- Cause: Vanilla HTML approach loads all libraries for all pages; no lazy loading or code splitting
- Improvement path: Move non-critical scripts (Three.js particles, Splitting.js) to bottom of body or load asynchronously; defer GSAP until needed

**1,697-line index.html File:**
- Problem: Massive index.html with inline styles, scripts, and full DOM for hero section, navbar, capabilities grid, testimonials, footer
- Files: `index.html`
- Cause: No component system; all content inlined
- Improvement path: Extract hero, navbar, grid, footer into separate files or components; use template includes

**No Image Optimization:**
- Problem: 20+ product images loaded without responsive sizing, compression, or WebP conversion (despite .webp extension)
- Files: `capabilities/` pages
- Cause: Direct HTML img tags without srcset or picture elements
- Improvement path: Implement responsive images with srcset; use modern formats (WebP with JPEG fallback); lazy load below-the-fold images

**IntersectionObserver Threshold at 15% May Cause Early Triggering:**
- Problem: Scroll reveal animations trigger when element is only 15% visible, potentially firing before user expects
- Files: `assets/animations.js` (line 51)
- Cause: Aggressive threshold setting
- Improvement path: Consider increasing to 25-50% or making configurable per element via `data-reveal-threshold`

## Fragile Areas

**Cursor and Interactive Effects on Touch Devices:**
- Files: `assets/shared.js` (cursor, magnetic buttons modules)
- Why fragile: Cursor module disables on touch but magnetic button hover effects may still trigger unexpectedly; no touch-specific alternative interaction
- Safe modification: Test all cursor-dependent features on iPhone/Android; ensure mobile UX doesn't rely on hover states
- Test coverage: No automated tests detected for touch interactions

**GSAP CDN Failure Silent Fallback:**
- Files: All pages depend on `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.14.2/gsap.min.js`
- Why fragile: If CDN is down, animations fail silently but page structure is intact; user sees non-animated version without warning
- Safe modification: Add script error handler to log or alert; test page functionality without GSAP before deploying changes
- Test coverage: No error handling detected for CDN failures

**Three.js Particle System Initialization:**
- Files: `assets/shared.js` (Three.js module ~300 lines)
- Why fragile: Complex WebGL code creating scene, camera, renderer, lights, and particles; no bounds checking or memory limits
- Safe modification: Wrap Three.js initialization in try-catch; add canvas size limit to prevent memory exhaustion
- Test coverage: No tests for WebGL failures or unsupported browsers

**Language Switcher State Management:**
- Files: `assets/shared.js` (language selector module)
- Why fragile: Assumes localStorage available; no session/cookie fallback; state not synced across windows
- Safe modification: Add localStorage feature detection; implement sessionStorage fallback; test in private browsing
- Test coverage: No tests for localStorage failures

## Scaling Limits

**Static File Duplication (3 Languages × 20+ Pages):**
- Current capacity: 27 HTML files manageable, but adding languages becomes O(n*m) maintenance
- Limit: 5+ languages becomes unsustainable; 50+ total HTML files unmaintainable manually
- Scaling path: Migrate to static site generator (Hugo, Jekyll, 11ty) with i18n support or implement server-side template rendering (Express + EJS, Next.js, etc.)

**Asset Pipeline Bottleneck:**
- Current capacity: 20-30 images; manual management works
- Limit: 100+ product images require CDN and automated optimization
- Scaling path: Implement image CDN (Cloudinary, Imgix, or AWS CloudFront); integrate build-time image optimization

**JavaScript Bundle Size:**
- Current capacity: ~50KB shared.js + external libs (GSAP ~30KB, Three.js ~150KB minified); acceptable on broadband
- Limit: Mobile users on 3G/4G may experience slow page load (>5s)
- Scaling path: Code split by page; lazy load Three.js particles only on hero; tree-shake unused GSAP easing functions

## Dependencies at Risk

**GSAP 3.14.2 CDN Dependency:**
- Risk: Version pinning in script src; if CDN removes version or Cloudflare changes domain, site breaks
- Impact: Animations (scroll reveal, button effects, transitions) fail; site becomes static
- Migration plan: Use version range or SRI hash; implement local fallback copy; consider open-source alternative (Anime.js, Motion, Framer Motion)

**Three.js CDN Dependency:**
- Risk: Large library (~150KB) loaded for background particles only; no way to disable for users who don't need it
- Impact: Wasted bandwidth; slower mobile load times
- Migration plan: Lazy load Three.js only on hero section; implement non-WebGL fallback (CSS gradient animation); consider simpler particle library (PixiJS ~40KB)

**Splitting.js for Hero Text Animation:**
- Risk: Small niche library; may be abandoned or replaced
- Impact: Hero headline animation fails if library unavailable
- Migration plan: Replace with vanilla JavaScript text splitting or use GSAP's built-in text animation

**No Package Manager:**
- Risk: CDN URLs hardcoded; no dependency lock file or version control
- Impact: Silent version bumps on CDN; impossible to reproduce exact build state
- Migration plan: Adopt npm/yarn; manage dependencies in package.json with lockfile; use bundler (Vite, Webpack)

## Missing Critical Features

**No Environment-Specific Configuration:**
- Problem: Hardcoded URLs, form IDs, analytics codes; no way to change for dev/staging/production
- Blocks: Multi-environment deployment; environment-specific secrets management
- Fix: Create `.env` template with instructions; implement config loader

**No Form Data Persistence:**
- Problem: Contact form has no backend; submissions likely lost or sent via Formspree only
- Blocks: Customer inquiry tracking; follow-up automation
- Fix: Set up Formspree account with email notifications or implement backend form handler

**No Analytics/Tracking:**
- Problem: No Google Analytics, Hotjar, or similar; cannot measure page performance or user behavior
- Blocks: Data-driven optimization; understanding user journey
- Fix: Add Google Tag Manager or similar

**No Error Boundary or 404 Handling:**
- Problem: No 404.html or error page; broken links lead to server 404 without graceful fallback
- Blocks: Professional user experience; debugging broken links
- Fix: Create 404.html with navigation fallback

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: Individual modules in `shared.js` (cursor, buttons, parallax, etc.) have no tests
- Files: `assets/shared.js`, `assets/animations.js`
- Risk: Changes to one module may break another silently; bugs go undetected until production
- Priority: High

**No Integration Tests:**
- What's not tested: Interaction between modules (cursor + buttons, navbar + transitions, language selector + page reload)
- Files: `assets/shared.js`
- Risk: Combined behavior may fail even if individual modules work
- Priority: High

**No E2E Tests:**
- What's not tested: User flows (navigate between languages, scroll page, submit form, click buttons)
- Files: All `.html` files
- Risk: Critical user paths break without detection
- Priority: High

**No Mobile/Touch Tests:**
- What's not tested: Interaction on mobile devices; touch events, viewport sizing, hamburger menu
- Files: `assets/shared.js` (mobile detection logic)
- Risk: Mobile users experience broken interactions (cursor on touch, menu doesn't work)
- Priority: High

**No Performance Tests:**
- What's not tested: Page load time, Core Web Vitals (LCP, FID, CLS), script execution time
- Files: All pages
- Risk: Performance degradation goes unnoticed; users experience slow load times
- Priority: Medium

---

*Concerns audit: 2026-03-11*
