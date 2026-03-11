# Project Research Summary

**Project:** Royal Regent Website — Awwwards-level Creative Animation System
**Domain:** Vanilla HTML/CSS/JS static multi-page site animation enhancement
**Researched:** 2026-03-11
**Confidence:** HIGH

## Executive Summary

This project enhances an existing vanilla JS multi-page static site (Royal Regent) with Awwwards-level creative animation. The site already has GSAP, Three.js, Lenis, and Splitting.js in the stack — the research confirms this is the correct foundation. Industry leaders (Active Theory, Resn, Lusion) build on this same stack. The recommended approach is to retrofit the existing codebase incrementally: extract the monolithic `shared.js` into a modular `assets/animation/` architecture, then layer animation features in dependency order (scroll infrastructure first, then text and reveals, then WebGL, then cursor and polish).

The highest-impact work is the Hero Opening Sequence and SplitText kinetic typography — these two features determine 80% of the perceived quality upgrade. Both are buildable without new CDN dependencies. The most common failure mode for sites at this quality level is not technical complexity but integration order: Lenis + ScrollTrigger must be synchronized correctly before any scroll-driven animation is built, and SplitText must run after `document.fonts.ready` or all line animations will be wrong in production.

The primary risk is scope creep toward high-complexity features (Barba.js page transitions, full WebGL image distortion) before the scroll infrastructure is proven stable. Research strongly recommends building the simple CSS clip-path overlay for page transitions instead — it achieves 90% of the effect at 10% of the complexity. Three.js GPU memory disposal is a critical risk on mobile that must be addressed from day one, not retrofitted.

---

## Key Findings

### Recommended Stack

The existing stack is correct. Required upgrades: Lenis 1.1.18 → 1.3.18, Three.js r170 → r183 (WebGPU-ready renderer, TSL shaders, 13 release cycles of fixes). GSAP is already at 3.14.2 which includes all premium plugins (SplitText, Flip, DrawSVG, MorphSVG) now free since the Webflow acquisition. No new libraries are needed for P1 features. OGL (24KB) is the recommended addition only for DOM-coupled image hover shaders in v1.x+ — not at launch.

**Core technologies:**
- **GSAP 3.14.2** + ScrollTrigger + SplitText + Flip + Observer — animation engine, scroll engine, text splitting, layout transitions; already in stack, all plugins now free
- **Lenis 1.3.18** — smooth scroll; zero DOM changes required; feeds ScrollTrigger via GSAP ticker integration; upgrade from current 1.1.18
- **Three.js r183** — WebGL backgrounds and shader effects; upgrade from current r170 for WebGPU-ready renderer and bug fixes
- **OGL 0.0.103** — lightweight (24KB) WebGL for DOM-coupled image hover shaders; add in v1.x, not at launch
- **Splitting.js 1.0.6** — already in stack; use alongside SplitText (CSS `--char-index` tricks); do not replace

**CDN loading order is critical:** Lenis → GSAP core → GSAP plugins → Three.js (async) → local scripts (defer).

### Expected Features

**Must have (table stakes — site feels unfinished without these):**
- Smooth scroll with Lenis inertia (partially done — needs Lenis + ScrollTrigger sync)
- Scroll-triggered reveal animations (exists but generic fade; needs directional clips, stagger, timing variety)
- Custom cursor with morphing states (exists but basic dot; needs 4 states: default/link/cta/image)
- Text split animations on hero headlines (Splitting.js loaded; needs GSAP timeline coordination)
- Hover states on interactive elements (partially done; needs magnetic pull, underline draw effects)
- Mobile-responsive animation degradation (prefers-reduced-motion exists; needs touch feature detection gates)

**Should have (competitive differentiators — create WOW factor):**
- Hero Opening Sequence — coordinated GSAP master timeline (preloader → type reveal → content entrance); defines first 3 seconds
- SplitText Kinetic Typography — character/word-level stagger reveals across all sections; most visible quality signal
- Clip-Path Image Wipe Reveals — editorial geometric wipes replacing generic fade-in
- Magnetic Button Effect — CTAs with spring physics cursor attraction
- Parallax Depth Layers — hero and sections at offset scroll speeds
- Staggered Section Entrance Choreography — coordinated section reveals replacing generic `data-reveal`
- Scroll Velocity Skew — image skew proportional to scroll speed (subtle but premium)

**Defer (v1.x — after core is stable):**
- Horizontal Scroll Showcase Section — GSAP pin-scrub carousel
- WebGL Shader Background — animated noise gradient behind hero
- Text Scramble on Stats — Matrix-style number reveals

**Defer (v2+ — complex, niche return):**
- Image Hover Distortion (WebGL) — Three.js scene per image card
- Barba.js Page Transitions — high complexity, state management risk; use CSS clip-path overlay instead
- Full Scroll-Scrubbed Cinematic Timeline

**Anti-features to avoid:** full-page scroll hijacking, infinite looping main sections, heavy GLTF hero models, particle systems as hero background, preloader > 2 seconds, GSAP on every DOM element.

### Architecture Approach

The architecture is a layered modular system retrofitted onto the existing vanilla JS structure. A `window.RR` global namespace acts as module registry — all animation modules register `init()` / `kill()` / `refresh()` methods. The controller reads `data-page` attribute on `<body>` to conditionally run page-specific animations. This zero-bundler approach works at the current 15-page scale and scales to 50 pages without change.

**Major components (build in this order):**
1. **scroll-engine.js** — Lenis init + GSAP ticker bridge; single RAF loop; foundational dependency for all other modules
2. **controller.js** — `window.RR` namespace, module registry, page detection via `data-page`
3. **responsive.js** — all `gsap.matchMedia()` contexts centralized; auto-revert on breakpoint change
4. **preloader.js** — blocks first paint; sequences entrance; emits "ready" event
5. **cursor.js** — independent; magnetic tracking via GSAP `quickTo`; 4 contextual states
6. **text-animations.js** — Splitting.js + SplitText; wrapped in `document.fonts.ready`
7. **hero.js** — page-specific, called conditionally by controller after text splits
8. **webgl.js** — Three.js canvas isolated at `z-index: -1`; scroll fed via Lenis event
9. **cards.js** — card hover, reveal, parallax; initialized last
10. **page-transitions.js** — wraps all modules; CSS clip-path overlay (not Barba.js)

**Key patterns:** Lenis→GSAP ticker bridge (single RAF), `gsap.matchMedia()` for all responsive animations, `data-page` for page namespacing, WebGL canvas isolation at z-index -1.

**Multi-language constraint:** All 3 language variants (`/`, `/cn/`, `/id/`) share identical `data-page` values. Every animation addition must be replicated to all HTML variants.

### Critical Pitfalls

1. **Lenis + ScrollTrigger sync failure** — Without `lenis.on('scroll', ScrollTrigger.update)` AND merging Lenis RAF into GSAP ticker (`gsap.ticker.add(time => lenis.raf(time * 1000))`), triggers fire 100-200px off position. Fix foundation before any scroll animations.

2. **SplitText before fonts load** — Running SplitText on `DOMContentLoaded` uses fallback font metrics; custom font reflow breaks all line animations in production. Always wrap in `document.fonts.ready.then(...)`.

3. **Three.js GPU memory leaks** — JS garbage collection cannot reclaim GPU resources. Without explicit `geometry.dispose()` / `material.dispose()` / `renderer.dispose()` before navigation, VRAM exhausts progressively. Mobile browsers crash after 3-5 page visits. Implement disposal from day one.

4. **FOUC from gsap.from() without pre-set states** — Elements render at full opacity/position for 1-2 frames before GSAP initializes. Use `gsap.set()` for initial states on page load; never use `gsap.from()` for above-the-fold elements without pre-setting CSS.

5. **Nested ScrollTrigger inside GSAP Timeline** — Applying `scrollTrigger: {}` to tweens inside a parent timeline creates dual-control conflict. Apply ScrollTrigger to the timeline itself only, never to child tweens.

---

## Implications for Roadmap

Based on combined research, the dependency graph and feature priorities strongly suggest a 6-phase structure:

### Phase 1: Foundation — Scroll Infrastructure & Animation Architecture
**Rationale:** Every other animation feature depends on Lenis + ScrollTrigger being correctly synchronized. This is the root dependency. Build the `window.RR` namespace and module registry so all future phases have a clean mount point. Fix the monolithic `shared.js` problem now before adding more code to it.
**Delivers:** Correct Lenis + ScrollTrigger integration; `window.RR` module registry; `data-page` attribute on all HTML pages (en + cn + id); `scroll-engine.js` + `controller.js` + `responsive.js`; prefers-reduced-motion global gate
**Addresses features:** Smooth scroll (upgrade Lenis to 1.3.18), scroll infrastructure, responsive animation baseline
**Avoids pitfalls:** Lenis/ScrollTrigger sync failure, ScrollTrigger refresh timing, will-change overuse convention, CDN failure fallback
**Research flag:** Standard patterns — skip research-phase

### Phase 2: Hero Opening Sequence & Text Animation System
**Rationale:** The Hero Opening Sequence is the single highest-impact deliverable — it defines the first 3 seconds and determines perceived quality. SplitText is a dependency of the hero sequence, so build text animations before the hero timeline. Both are P1 features with Medium implementation complexity and use existing stack only.
**Delivers:** `text-animations.js` with `document.fonts.ready` wrapping; SplitText character/word/line stagger system; hero master GSAP timeline (preloader exit → type reveal → image entrance); `preloader.js`
**Addresses features:** Hero Opening Sequence (P1), SplitText Kinetic Typography (P1), scroll-triggered text reveals across all sections
**Avoids pitfalls:** SplitText before fonts load, FOUC from `gsap.from()`, text scramble timing issues
**Research flag:** Standard patterns — GSAP SplitText docs are authoritative

### Phase 3: Scroll-Driven Experiences
**Rationale:** With foundation stable and hero sequence proven, add the scroll-driven layer. Parallax, clip-path reveals, and scroll velocity skew are independent of each other but all depend on Phase 1 scroll infrastructure. Staggered section choreography replaces the existing generic `data-reveal` system.
**Delivers:** Clip-path image wipe reveals (ScrollTrigger scrub); parallax depth layers (hero + section backgrounds); scroll velocity skew (Lenis `onScroll` callback + GSAP quickSetter); staggered section entrance choreography replacing `data-reveal`
**Addresses features:** Clip-Path Image Wipe Reveals (P1), Parallax Depth Layers (P1), Scroll Velocity Skew (P1), Staggered Section Entrance (P1)
**Avoids pitfalls:** Nested ScrollTrigger in timeline, layout thrashing in scroll handlers, ScrollTrigger positions with images (add explicit width/height to all img tags)
**Research flag:** Standard patterns — well-documented GSAP ScrollTrigger techniques

### Phase 4: Cursor System & Micro-interactions
**Rationale:** The cursor system is foundational to micro-interactions — magnetic buttons and contextual morphing are layers on top. Build in dependency order: base cursor → magnetic effect → contextual states. This is desktop-only (touch gate required). Cursor system is independent of scroll system, so can be built in parallel with Phase 3 if resources allow.
**Delivers:** `cursor.js` with 4 states (default/link/cta/image); magnetic button effect with GSAP `quickTo` spring physics; `data-magnetic` attribute system for all CTAs; touch/hover device detection gate; button/link hover states with underline draw effects
**Addresses features:** Custom Cursor with Contextual States (P1), Magnetic Button Effect (P1), hover states on interactive elements (table stakes)
**Avoids pitfalls:** Custom cursor on touch devices (pointer:coarse gate), cursor stuck on touch screens
**Research flag:** Standard patterns — GSAP quickTo cursor technique well-documented

### Phase 5: WebGL Shader Backgrounds
**Rationale:** WebGL adds the highest perceived quality uplift but is the highest-complexity phase. Place after all scroll and cursor systems are stable so GPU load is understood. Three.js upgrade to r183 happens in this phase. Implement disposal pattern from day one — no retrofitting.
**Delivers:** Three.js r183 upgrade; `webgl.js` with fixed canvas at z-index -1; ShaderMaterial fragment shader with simplex noise for hero background; Lenis scroll-to-uniform sync; context loss handler + CSS gradient fallback for mobile Safari; `renderer.info.memory` monitoring; full geometry/material/texture disposal on navigation
**Addresses features:** WebGL Shader Background (P2), gradient mesh animation
**Avoids pitfalls:** Three.js GPU memory leaks, WebGL context loss on mobile Safari, Three.js at device pixel ratio > 1.5, particle systems at full resolution on mobile
**Research flag:** Needs deeper research-phase — Three.js r170 → r183 migration guide required; shader patterns for this site's specific use case benefit from Codrops reference implementations

### Phase 6: Polish, Integration & Horizontal Showcase
**Rationale:** After all individual systems are stable, integrate them into a cohesive experience. Horizontal scroll is the most complex single feature (requires Lenis + ScrollTrigger + Observer plugin coordination) and is placed last because it needs all foundation systems proven first. Page transitions (CSS clip-path overlay) complete the experience.
**Delivers:** Horizontal scroll showcase section with GSAP pin-scrub (P2); CSS clip-path page transition overlay (NOT Barba.js); text scramble on stats/data points (P2); cross-page integration audit; multi-language (cn/id) animation parity verification; prefers-reduced-motion final audit; performance baseline on real mobile devices
**Addresses features:** Horizontal Scroll Showcase (P2), Page Transitions (CSS overlay), Text Scramble (P2)
**Avoids pitfalls:** Horizontal scroll without visual affordance, ScrollTrigger + Lenis Observer pin conflicts, over-animation cognitive overload, multi-language animation sync
**Research flag:** Horizontal scroll pinning with Lenis needs validation — `ScrollTrigger.normalizeScroll(true)` interaction with Lenis requires testing

### Phase Ordering Rationale

- **Foundation before everything:** Lenis + ScrollTrigger sync is the root dependency for 8 of 9 P1 features. Attempting to build hero animations or scroll reveals before this integration is proven will require rework.
- **Text before hero:** SplitText is a hard dependency of the Hero Opening Sequence. The hero timeline cannot be built until the text split system exists.
- **Scroll-driven experiences before WebGL:** GSAP scroll performance must be validated before adding Three.js GPU load. A janky scroll system + WebGL background = unusable on mobile.
- **Cursor after scroll:** Cursor system is independent but lower priority than scroll-driven experiences. Can overlap with Phase 3 if parallel work is possible.
- **WebGL last before polish:** Highest complexity, highest mobile risk. Needs all other systems stable before adding GPU load.
- **CSS clip-path transitions, not Barba.js:** Barba.js requires reinitializing all ScrollTriggers and Lenis on every navigation — this is a known complexity tax that delivers marginal perceived improvement. The CSS overlay approach achieves 90% of the effect.

### Research Flags

Phases needing deeper research-phase during planning:
- **Phase 5 (WebGL):** Three.js r170 → r183 migration guide required; shader GLSL noise patterns for organic backgrounds benefit from Codrops reference implementations; mobile GPU budget needs device testing data
- **Phase 6 (Horizontal Scroll):** GSAP ScrollTrigger pinning + Lenis + Observer plugin interaction has known edge cases; requires prototype testing before full implementation

Phases with well-documented standard patterns (skip research-phase):
- **Phase 1 (Foundation):** GSAP + Lenis integration pattern is officially documented by both libraries; standard boilerplate
- **Phase 2 (Text + Hero):** SplitText patterns are well-documented in GSAP official docs and Codrops
- **Phase 3 (Scroll-Driven):** ScrollTrigger clip-path, parallax, and scrub patterns are extensively documented
- **Phase 4 (Cursor):** GSAP quickTo magnetic cursor is an established community pattern

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | GSAP 3.14.2, Lenis 1.3.18, Three.js r183 verified via official GitHub releases; all CDN URLs confirmed via jsDelivr |
| Features | HIGH | Verified via Awwwards gallery, GSAP official docs, Codrops 2025, NN/g UX research |
| Architecture | HIGH | Patterns verified via GSAP official docs, Lenis GitHub, Codrops architecture articles |
| Pitfalls | HIGH | All critical pitfalls verified with official docs (GSAP, MDN, Three.js) and community sources |

**Overall confidence:** HIGH

### Gaps to Address

- **Three.js r170 → r183 migration specifics:** Breaking changes between r170 and r183 were flagged (specifically r177+ changes). Requires reviewing the Three.js migration guide before Phase 5 begins.
- **OGL ESM module loading:** OGL requires `type="module"` — must verify current HTML pages support module scripts and that `animations.js` can act as module wrapper or that a separate entry point is needed.
- **Lenis ScrollTrigger pin edge cases:** The exact behavior of `ScrollTrigger.normalizeScroll(true)` with Lenis in v1.3.18 for horizontal scroll pinning needs prototype validation — community reports edge cases in some configurations.
- **Mobile GPU budget baseline:** No device testing has been done. The WebGL phase decisions (pixel ratio cap, particle count) need validation against actual mobile hardware before committing to specific values.
- **CDN SRI hashes:** All CDN dependencies currently lack Subresource Integrity (SRI) hashes. Acceptable for development; required for production (PITFALLS.md flags this as a never-acceptable shortcut for production).

---

## Sources

### Primary (HIGH confidence)
- GSAP GitHub Releases (3.14.2 confirmed) + GSAP ScrollTrigger Docs + GSAP Common Mistakes — stack, architecture, pitfall verification
- Lenis GitHub (darkroomengineering) — v1.3.18 confirmed; GSAP ticker integration pattern
- Three.js GitHub Releases r183 — version, WebGPU/TSL readiness confirmed
- MDN: CSS and JavaScript animation performance; Animation from Interactions (WCAG) — performance fundamentals, accessibility
- Awwwards WebGL Collection + Awwwards Animation Gallery — feature landscape, competitor analysis

### Secondary (MEDIUM confidence)
- Codrops 2024-2025 (OGL gallery, clip-path product grid, GSAP tips, page transitions, WebGL shaders) — feature patterns, OGL usage confirmation
- Webflow Blog: SplitText Rewrite — SplitText responsive auto-resplit, free plugin confirmation
- Nielsen Norman Group: Animation Duration + Scrolljacking 101 — UX timing guidelines, scroll hijacking harm
- Born Digital: Smooth Scroll Comparison — ScrollSmoother vs Lenis tradeoffs

### Tertiary (MEDIUM-LOW confidence)
- Web Design Trends 2026 (Really Good Designs) — trend validation only
- Three.js r171 WebGPU Production Ready (TSL blog) — TSL readiness assessment

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
