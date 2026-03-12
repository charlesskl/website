# Requirements: Royal Regent Website Animation Overhaul

**Defined:** 2026-03-11
**Core Value:** The website must deliver an immediate WOW factor on first visit while maintaining silky-smooth interactions throughout — no compromise between spectacle and usability.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Animation system uses `window.RR` module registry with `init()` / `kill()` / `refresh()` lifecycle methods for every module
- [x] **FOUND-02**: Lenis 1.3.18 smooth scroll is correctly synchronized with GSAP ScrollTrigger via GSAP ticker bridge (single RAF loop, no drift)
- [x] **FOUND-03**: All ScrollTrigger instances live inside `gsap.matchMedia()` contexts and auto-revert on breakpoint change
- [x] **FOUND-04**: `prefers-reduced-motion` media query gates all animations globally — site is fully usable without motion
- [x] **FOUND-05**: CDN failure graceful degradation — site renders and functions if any CDN library fails to load
- [x] **FOUND-06**: All text animations wrapped in `document.fonts.ready` to prevent broken line calculations from fallback fonts
- [x] **FOUND-07**: All HTML pages (en, cn, id variants) have `data-page` attribute on `<body>` for page-specific animation targeting
- [x] **FOUND-08**: `gsap.set()` initializes above-the-fold element states before page paint to prevent FOUC

### Hero / Opening Sequence

- [ ] **HERO-01**: Brand preloader exits with a coordinated GSAP animation that transitions seamlessly into the hero section
- [ ] **HERO-02**: Hero headline text animates character-by-character or word-by-word using GSAP SplitText with masked stagger reveal
- [ ] **HERO-03**: Hero images/visual elements enter with clip-path wipe or scale reveals as part of the opening master timeline
- [ ] **HERO-04**: Opening sequence is a single coordinated GSAP master timeline (preloader → text reveal → content entrance) under 2.5 seconds
- [ ] **HERO-05**: Opening sequence respects `prefers-reduced-motion` — plays as instant state change without animation

### Text Animation

- [ ] **TEXT-01**: GSAP SplitText replaces Splitting.js as primary text animation engine for character/word/line-level stagger animations
- [ ] **TEXT-02**: All section headlines animate on scroll-trigger using masked word/line reveals (overflow: hidden + Y transform)
- [ ] **TEXT-03**: Text scramble effect on statistics and data numbers (Matrix-style character randomization before resolving)
- [ ] **TEXT-04**: SplitText automatically re-splits on font load and responsive resize to prevent broken line breaks

### Scroll Experience

- [ ] **SCROLL-01**: All existing `data-reveal` generic fade-in animations replaced with directional, staggered, timed ScrollTrigger sequences
- [ ] **SCROLL-02**: Clip-path image wipe reveals — scroll-triggered geometric image reveals (top→down, diagonal) replacing standard fade-in
- [ ] **SCROLL-03**: Parallax depth layers — hero background and section images move at offset scroll speeds creating depth
- [ ] **SCROLL-04**: Scroll velocity skew — elements subtly skew proportional to scroll speed using Lenis `onScroll` + GSAP `quickSetter`
- [ ] **SCROLL-05**: Staggered section entrance choreography — content blocks in each section reveal in coordinated sequence, not independently
- [ ] **SCROLL-06**: Horizontal scroll showcase section for capabilities/products using GSAP ScrollTrigger pin-scrub
- [ ] **SCROLL-07**: Scroll progress indicator accurately reflects page position

### Cursor & Micro-interactions

- [ ] **CURSOR-01**: Custom cursor rewritten with 4 contextual states: default (dot), link (expand), CTA (scale + label), image (crosshair)
- [ ] **CURSOR-02**: Magnetic button effect — all CTA buttons attract cursor with GSAP `quickTo` spring physics via `data-magnetic` attribute
- [ ] **CURSOR-03**: Cursor system is strictly desktop-only, gated behind `pointer: fine` + `hover: hover` media query detection
- [ ] **CURSOR-04**: All buttons and links have distinct hover feedback (underline draw, color shift, or shimmer effect)
- [ ] **CURSOR-05**: Form elements have clear focus and interaction states

### Navigation

- [ ] **NAV-01**: Navbar hides on scroll-down and reveals on scroll-up with GSAP transition (smart scroll behavior)
- [ ] **NAV-02**: Mobile menu open/close uses coordinated GSAP timeline (not instant toggle)
- [ ] **NAV-03**: CSS clip-path overlay page transition — brief animated overlay covers page swap on navigation, hiding hard reload

### WebGL / Visual Effects

- [ ] **WEBGL-01**: Three.js upgraded from r170 to r183 with existing particle system verified for breaking changes
- [ ] **WEBGL-02**: WebGL canvas positioned `fixed` at `z-index: -1` with `pointer-events: none` — isolated from DOM animations
- [ ] **WEBGL-03**: Hero background uses Three.js ShaderMaterial with simplex noise fragment shader for living organic gradient animation
- [ ] **WEBGL-04**: Shader background syncs animation speed to Lenis scroll velocity via uniform
- [ ] **WEBGL-05**: WebGL context loss handler implemented — CSS gradient fallback activates on context loss (mobile Safari)
- [ ] **WEBGL-06**: All Three.js geometry, material, and texture explicitly disposed on page navigation to prevent VRAM leaks

### Product / Card Showcase

- [ ] **CARD-01**: Product/capability cards have clip-path reveal animation on scroll-enter
- [ ] **CARD-02**: Cards have subtle 3D tilt effect on hover using mouse position (desktop-only, `hasHover` gated)
- [ ] **CARD-03**: Card hover states use GPU-compositable transforms only (`transform`, `opacity`) — no `filter: blur()` or layout triggers

### Multi-language & Performance

- [ ] **MLANG-01**: All animation enhancements apply identically to `/en/`, `/cn/`, and `/id/` HTML variants — no language-specific animation code
- [ ] **PERF-01**: All scroll-driven animations achieve 60fps on modern desktop (verified with Chrome DevTools Performance panel)
- [ ] **PERF-02**: All animations use GPU-compositable properties only (`transform`, `opacity`) — no layout-triggering properties during animation
- [ ] **PERF-03**: `will-change: transform` applied only to actively animating elements and removed after animation completes
- [ ] **PERF-04**: Mobile devices receive simplified animation variants — complex parallax and WebGL effects disabled on `pointer: coarse` devices

## v2 Requirements

### Advanced Effects

- **ADV-01**: Image hover distortion using WebGL shader (Three.js PlaneGeometry + displacement map) — one scene per card
- **ADV-02**: Barba.js AJAX page transitions with full ScrollTrigger reinit lifecycle — deferred pending CSS overlay validation
- **ADV-03**: Full scroll-scrubbed cinematic timeline section — frame-perfect scroll-driven storytelling panel

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full-page scroll hijacking | Motion sickness, accessibility failures, Lenis conflict |
| Heavy GLTF hero models | Blocks LCP, fails on mobile, unnecessary complexity |
| Particle system as hero background | GPU-intensive, visual competition with headline, dated feel |
| Preloader > 2 seconds | Abandonment rate above threshold; cap at 2s |
| GSAP animations on every DOM element | Main-thread congestion, mobile jank |
| `filter: blur()` glass effects | Expensive paint operations; use `backdrop-filter` instead |
| HTML structure changes | Constraint: no markup changes |
| Brand color/typography changes | Constraint: identity must remain unchanged |
| New pages or content changes | Constraint: work within existing page set |
| Build system / bundler | Constraint: static vanilla HTML/CSS/JS delivery |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 through FOUND-08 | Phase 1 | Pending |
| HERO-01 through HERO-05 | Phase 2 | Pending |
| TEXT-01 through TEXT-04 | Phase 2 | Pending |
| SCROLL-01 through SCROLL-07 | Phase 3 | Pending |
| CURSOR-01 through CURSOR-05 | Phase 4 | Pending |
| NAV-01 through NAV-03 | Phase 4 | Pending |
| WEBGL-01 through WEBGL-06 | Phase 5 | Pending |
| CARD-01 through CARD-03 | Phase 5 | Pending |
| MLANG-01, PERF-01 through PERF-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after initial definition*
