# Coding Conventions

**Analysis Date:** 2026-03-11

## Naming Patterns

**Files:**
- HTML pages: kebab-case (`index.html`, `about.html`, `careers.html`, `contact.html`)
- JavaScript modules: kebab-case (`animations.js`, `shared.js`)
- CSS files: kebab-case (`shared.css`)
- Image assets: kebab-case with descriptive names (`aerobie-frisbee.webp`, `john-deere-tractor.webp`)
- Localized directories: language codes (`cn/`, `id/`)

**Functions:**
- camelCase for all function names (e.g., `initScrollReveal`, `initCursor`, `getScrollProgress`)
- Prefixed with descriptive verb: `init*`, `handle*`, `create*`, `update*`, `get*`
- Example from `animations.js`: `initScrollReveal()`, `initScrollTrigger()`
- Example from `shared.js`: `initCursor()`, `handleScroll()`, `updateParallax()`

**Variables:**
- camelCase for all variable declarations (e.g., `prefersReducedMotion`, `isMobile`, `hasHover`)
- Constant-like module-level features use camelCase: `const isMobile = ...`, `const prefersReducedMotion = ...`
- DOM element references: descriptive names (e.g., `dot`, `ring`, `targets`, `observer`)
- Loop variables: single letter acceptable (`el`, `entry`)

**Types/Attributes:**
- HTML attributes: kebab-case (`data-reveal`, `data-reveal-delay`, `data-reveal-duration`)
- CSS classes: kebab-case (e.g., `cursor-dot`, `cursor-ring`, `is-revealed`)
- Data attributes: kebab-case with logical grouping (e.g., `data-reveal-*`, `data-parallax-*`)

## Code Style

**Formatting:**
- Indentation: 2 spaces (observed in both `.js` files)
- Line length: Flexible, some lines exceed 80 characters for readability
- No formatting tool configured (no `.prettierrc`, `eslint.config.js`, or `biome.json`)
- Manual code style enforcement through code review

**Linting:**
- No linter configured (no `.eslintrc` or similar)
- Code style is maintained through manual review and conventions
- Strict mode enabled: `'use strict';` declaration at module top in `animations.js` and `shared.js`

**Strict Mode:**
- All JavaScript modules wrapped in IIFE with `'use strict';`
- Pattern: `(function () { 'use strict'; ... }());`
- Enforces ES5 best practices

## Import Organization

**Module System:**
- No module system (no `import`/`export`, no CommonJS `require()`)
- All scripts loaded via `<script>` tags in HTML
- Load order critical and documented: "Load order (must match HTML): gsap.min.js → ScrollTrigger.min.js → animations.js"
- Dependencies declared in code comments, not tooling

**External Dependencies:**
- GSAP 3.14.2 loaded via CDN
- Three.js loaded via CDN
- Splitting.js loaded via CDN
- ScrollTrigger (GSAP plugin) loaded via CDN

**File Dependencies:**
- `animations.js` depends on: GSAP, ScrollTrigger, IntersectionObserver
- `shared.js` depends on: GSAP, Three.js, Splitting.js, IntersectionObserver
- Graceful degradation: animations work without GSAP via IntersectionObserver fallback

## Error Handling

**Patterns:**
- Early return guards: `if (!targets.length) return;`
- Feature detection before use: `if (isTouch || !hasHover) return;`
- Null-coalescing with defaults: `parseInt(el.getAttribute('data-reveal-delay') || '0', 10)`
- No explicit error objects; silent failures acceptable for missing elements
- No try/catch observed; assumes DOM exists

**Accessibility Guards:**
- Reduced motion check before animations: `if (prefersReducedMotion) { /* immediate reveal */ }`
- Pattern: `var prefersReducedMotion = window.matchMedia('(prefers-reduce-motion: reduce)').matches;`
- Touch detection: `if (isTouch || !hasHover) return;`

## Logging

**Framework:** Console methods only (no logging library)

**Patterns:**
- No `console.log()` observed in current code
- Code comments used for explanation instead of runtime logging
- Debug information embedded in inline comments marked with `(FOUND-XX)` references

## Comments

**When to Comment:**
- Algorithm explanation: "Uses native IO so reveals work even if GSAP CDN fails to load"
- User decision rationale: "15% of element must be visible to trigger (user decision)"
- Bug or issue reference: "(FOUND-03)", "(FOUND-02)" indicate tracked items
- Module header block: Required for each `.js` file
- Section dividers: Three-character separator lines (`/* ── Section Name ─────────── */`)

**JSDoc/TSDoc:**
- Not used (no TypeScript or JSDoc patterns observed)
- Comments are informal with emphasis on clarity over formal documentation

**Module Header Format:**
```javascript
/**
 * [filename] — Royal Regent Toys
 * [Purpose description]
 *
 * [Key details or dependencies]
 */
```

Example from `animations.js`:
```javascript
/**
 * animations.js — Royal Regent Toys
 * Animation infrastructure: scroll-reveal system + GSAP stub for Phase 2
 *
 * Load order (must match HTML): gsap.min.js → ScrollTrigger.min.js → animations.js
 * Dependencies: GSAP 3.14.2 (CDN), IntersectionObserver (native)
 */
```

## Function Design

**Size:**
- Small, focused functions: Most functions 10-30 lines
- `initScrollReveal()` in `animations.js`: ~40 lines (largest in file)
- Typical function: 5-20 lines

**Parameters:**
- Minimal parameters, typically 0
- Functions operate on DOM state directly via `querySelectorAll()`, `getAttribute()`
- No function parameters for configuration; instead use HTML attributes (`data-*`)

**Return Values:**
- Most functions return nothing (void); side effects via DOM manipulation
- Early returns used to guard against null states
- Pattern: `if (!targets.length) return;`

**Scope & Closure:**
- Functions scoped within module IIFE
- Closure over module-level constants: `prefersReducedMotion`, `isMobile`, `isTouch`, `hasHover`
- No global function definitions; all encapsulated

## Module Design

**Exports:**
- No explicit exports (no `export` keyword)
- Modules self-initialize on `DOMContentLoaded`
- Side effects: Direct DOM manipulation on page load

**Self-Initialization Pattern:**
```javascript
document.addEventListener('DOMContentLoaded', function () {
  initScrollReveal();
});
```

**IIFE Wrapping:**
- Standard pattern: `(function () { 'use strict'; ... }());`
- Prevents global namespace pollution
- All module internals private by default

---

*Convention analysis: 2026-03-11*
