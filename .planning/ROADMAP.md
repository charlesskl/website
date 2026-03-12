# Roadmap: Royal Regent Website Animation Overhaul

## Overview

Transform the Royal Regent website from functional-but-generic animations into an Awwwards-level creative experience. The journey begins by establishing a bulletproof scroll and animation architecture, then layers on the hero sequence and text system, followed by scroll-driven experiences, cursor micro-interactions, WebGL shader backgrounds, and finally integration polish with multi-language parity.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Scroll infrastructure, module registry, and animation architecture baseline (completed 2026-03-12)
- [ ] **Phase 2: Hero & Text** - Opening sequence master timeline and SplitText kinetic typography system
- [ ] **Phase 3: Scroll Experiences** - Clip-path reveals, parallax, velocity skew, and staggered choreography
- [ ] **Phase 4: Cursor & Nav** - Custom cursor states, magnetic buttons, nav transitions, and micro-interactions
- [ ] **Phase 5: WebGL** - Three.js shader backgrounds, card showcase, and GPU memory safety
- [ ] **Phase 6: Polish & Parity** - Integration audit, multi-language sync, performance validation, and horizontal scroll

## Phase Details

### Phase 1: Foundation
**Goal**: Every animation module has a stable, synchronized infrastructure to mount onto — Lenis + ScrollTrigger running as one loop, the window.RR registry in place, and all HTML pages tagged for page-specific targeting
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08
**Success Criteria** (what must be TRUE):
  1. Smooth scroll runs without drift — ScrollTrigger positions match visual element positions across all pages
  2. Reducing motion preference disables all animations site-wide — content remains fully accessible
  3. Removing any CDN script tag does not break page rendering or navigation
  4. All HTML pages (en/, cn/, id/) have `data-page` attribute and above-the-fold elements render without FOUC
  5. A new animation module can be registered via `window.RR` with init/kill/refresh lifecycle
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md — Module registry, scroll engine, responsive contexts, and CDN graceful degradation

### Phase 2: Hero & Text
**Goal**: The first 2.5 seconds of every page visit deliver a coordinated, cinema-quality opening — preloader exits cleanly into hero, headline text reveals character-by-character, and every section heading animates on scroll with masked word reveals
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, TEXT-01, TEXT-02, TEXT-03, TEXT-04
**Success Criteria** (what must be TRUE):
  1. Preloader exits and seamlessly hands off to hero content in one unbroken GSAP timeline under 2.5 seconds
  2. Hero headline reveals character-by-character with masked stagger — no raw text visible during load
  3. All section headings across every page animate on scroll with masked word or line reveals
  4. Statistics and data numbers display a Matrix-style scramble before resolving to their final value
  5. With reduced motion enabled, all text and hero content appears instantly without animation
**Plans**: TBD

Plans:
- [ ] 02-01: Preloader exit, hero master timeline, and SplitText system
- [ ] 02-02: Scroll-triggered headline reveals and text scramble on stats

### Phase 3: Scroll Experiences
**Goal**: Scrolling through any section feels premium — images reveal with geometric wipes, backgrounds create depth through parallax, scroll speed creates subtle skew, and sections enter with coordinated choreography rather than independent fades
**Depends on**: Phase 2
**Requirements**: SCROLL-01, SCROLL-02, SCROLL-03, SCROLL-04, SCROLL-05, SCROLL-06, SCROLL-07
**Success Criteria** (what must be TRUE):
  1. No generic fade-in animations remain — all reveals are directional, clipped, or staggered with varied timing
  2. Images reveal with clip-path geometric wipes (top-to-bottom or diagonal) on scroll entry
  3. Hero and section backgrounds visibly move at offset speeds, creating perceptible depth layers
  4. Fast scrolling causes elements to visibly skew proportional to speed; slow scrolling returns them to upright
  5. Content blocks within each section reveal in coordinated sequence, not all at once
  6. A scroll progress indicator accurately reflects position throughout the page
**Plans**: TBD

Plans:
- [ ] 03-01: Clip-path reveals, parallax depth layers, scroll velocity skew, and progress indicator
- [ ] 03-02: Staggered section choreography replacing all data-reveal instances

### Phase 4: Cursor & Nav
**Goal**: Every pointer interaction feels alive — the cursor morphs contextually, CTA buttons magnetically attract on approach, navigation hides intelligently during reading and reveals on upward scroll, and the mobile menu opens with a coordinated transition
**Depends on**: Phase 3
**Requirements**: CURSOR-01, CURSOR-02, CURSOR-03, CURSOR-04, CURSOR-05, NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. Custom cursor displays 4 distinct states (dot / expanded ring / scaled CTA label / crosshair) as pointer moves over different element types
  2. CTA buttons visibly attract the cursor as it approaches, with spring physics snap
  3. Cursor system is completely absent on touch devices — no artifacts, no fallback dot
  4. All buttons and links show distinct hover feedback (underline draw, color shift, or shimmer)
  5. Navbar hides smoothly when scrolling down and reappears when scrolling up
  6. Mobile menu opens and closes with an animated GSAP timeline, not an instant toggle
  7. Navigating between pages shows a brief clip-path overlay transition masking the hard reload
**Plans**: TBD

Plans:
- [ ] 04-01: Cursor system, magnetic buttons, and hover micro-interactions
- [ ] 04-02: Navbar smart scroll, mobile menu timeline, and CSS clip-path page transitions

### Phase 5: WebGL
**Goal**: The hero section has a living, organic shader background that breathes with scroll velocity, and product/capability cards reveal with clip-path animation and 3D tilt on hover — all GPU resources are safely disposed on navigation
**Depends on**: Phase 4
**Requirements**: WEBGL-01, WEBGL-02, WEBGL-03, WEBGL-04, WEBGL-05, WEBGL-06, CARD-01, CARD-02, CARD-03
**Success Criteria** (what must be TRUE):
  1. Hero background shows animated organic gradient that visibly responds to scroll speed changes
  2. WebGL canvas sits behind all page content with no pointer event capture
  3. On mobile Safari context loss, page falls back to a CSS gradient background without error
  4. After navigating away and returning to the hero page, no VRAM accumulation occurs across 5+ visits
  5. Product and capability cards reveal with clip-path animation on scroll entry
  6. Cards tilt in 3D following mouse position on desktop; no tilt effect on touch devices
**Plans**: TBD

Plans:
- [ ] 05-01: Three.js r183 upgrade, WebGL canvas setup, simplex noise shader, and GPU disposal
- [ ] 05-02: Card clip-path reveals and 3D tilt hover system

### Phase 6: Polish & Parity
**Goal**: The full animation system operates as one coherent experience across all three language variants — horizontal scroll showcase works smoothly, all performance targets are met on real mobile devices, and no language version has missing animations
**Depends on**: Phase 5
**Requirements**: MLANG-01, PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (what must be TRUE):
  1. Opening the /cn/ and /id/ versions of any page shows identical animations to the /en/ version
  2. Chrome DevTools Performance panel shows no dropped frames during scroll on desktop
  3. Mobile devices (coarse pointer) receive simplified variants — complex parallax and WebGL are disabled
  4. will-change is absent on elements that are not actively animating
  5. Horizontal scroll showcase section pins correctly and scrubs through content without jank
**Plans**: TBD

Plans:
- [ ] 06-01: Multi-language animation parity audit and mobile performance optimization
- [ ] 06-02: Horizontal scroll showcase with GSAP pin-scrub and final integration audit

## Progress

**Execution Order:** 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete   | 2026-03-12 |
| 2. Hero & Text | 0/2 | Not started | - |
| 3. Scroll Experiences | 0/2 | Not started | - |
| 4. Cursor & Nav | 0/2 | Not started | - |
| 5. WebGL | 0/2 | Not started | - |
| 6. Polish & Parity | 0/2 | Not started | - |
