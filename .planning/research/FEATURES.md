# Feature Research

**Domain:** Awwwards-level creative studio website animation system
**Researched:** 2026-03-11
**Confidence:** HIGH (verified via multiple sources: GSAP docs, Codrops, Awwwards gallery, UX research)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that Awwwards-level visitors assume exist. Missing these = site feels generic and unfinished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Smooth scroll (Lenis/Locomotive) | Default browser scroll feels choppy; luxury sites all use inertia scroll | LOW | Already in stack (Lenis 1.1.18). Replace any IntersectionObserver scroll with Lenis RAF loop |
| Scroll-triggered reveal animations | Static pages feel dead; elements revealing as you scroll is baseline expectation | LOW | Already exists (`data-reveal` system) but current implementation is generic fade — needs directional clips, stagger, and timing variety |
| Custom cursor (desktop) | Default arrow cursor breaks luxury immersion immediately | MEDIUM | Already exists but current version is basic dot — needs morphing states: default → hover → link → drag |
| Smooth page transitions | Hard page reloads feel broken on creative sites | HIGH | Currently absent — Barba.js + GSAP overlay transition needed; major architectural addition |
| Sticky/smart navbar behavior | Navbar should react to scroll (hide on down, reveal on up, glassmorphism on scroll) | LOW | Partially exists. Add hide-on-scroll-down behavior |
| Text split animations on hero | Hero headlines must animate — character/word-level reveals are the floor | MEDIUM | Splitting.js already loaded; needs GSAP timeline coordination with page load sequence |
| Hover states on all interactive elements | Buttons, links, and cards must have distinct hover feedback | LOW | Partially exists. Needs magnetic pull, color shift, underline draw effects |
| Mobile-responsive animations | All effects must degrade gracefully on touch; no broken layouts | MEDIUM | prefers-reduced-motion exists; add touch feature detection gates |
| Scroll progress indicator | Long pages need progress signal | LOW | Already exists. Verify it works correctly |
| Image lazy loading with reveal | Images should load and reveal as they enter viewport | LOW | Already exists via `data-src` pattern |

---

### Differentiators (Competitive Advantage)

Features that create WOW factor and set the site apart from typical corporate web.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Hero opening sequence (choreographed) | First 3 seconds determines perceived quality of entire site | HIGH | Preloader → counter/logo reveal → hero type animation → image/element entrance; coordinated GSAP master timeline; currently brand loader exists but needs full choreography |
| Clip-path image wipe reveals | Images revealing via geometric wipes (top→down, left→right, diagonal) feel editorial and premium | MEDIUM | GSAP + CSS clip-path; highly composable; works with ScrollTrigger scrub; Codrops 2025 documented technique |
| Magnetic button effect | Buttons that magnetically attract cursor feel tactile and premium | MEDIUM | Track mousemove, compute delta from element center, apply GSAP quickSetter for performance; needs `data-magnetic` attribute system |
| Contextual cursor morphing | Cursor changes personality by context (text: beam, video: play, drag: grab, CTA: expand with label) | HIGH | Requires cursor state machine: default → hover-link → hover-cta (scales up with label) → hover-image (crosshair) → hover-video (play icon) |
| Horizontal scroll showcase section | Products/capabilities showcased in pin-scrub horizontal carousel breaks page rhythm | HIGH | GSAP ScrollTrigger `pin: true` + `scrub: 1` + `xPercent` translation; works within Lenis via `ScrollTrigger.normalizeScroll(true)` |
| SplitText kinetic typography | Headlines that animate word-by-word or character-by-character with easing, stagger, and masks | MEDIUM | GSAP SplitText (free since Webflow acquisition 2024); wrap chars in overflow:hidden mask; animate Y from 100% to 0 |
| Parallax depth layers | Images/elements move at different speeds creating depth and dimension | MEDIUM | GSAP ScrollTrigger `scrub` on multiple elements with different `y` values; performance: use `will-change: transform` only during animation |
| WebGL/shader background effects | Animated gradient or noise mesh behind hero creates living, organic feel | HIGH | Three.js already in stack; ShaderMaterial with time uniform + noise function; Perlin/simplex noise for organic movement; GPU-accelerated |
| Staggered section entrance choreography | Content blocks reveal in coordinated sequence rather than independently | MEDIUM | GSAP Timeline with `stagger` and `from:"edges"` or `from:"center"` patterns; batch reveals using ScrollTrigger batch |
| Scroll-scrubbed timeline effects | Animations tied 1:1 to scroll position (not triggered, but directly driven) | HIGH | ScrollTrigger `scrub: true` + master timeline; creates cinematic feel where user "controls" the animation |
| Image hover distortion effect | Images subtly warp/bulge on hover using WebGL shader | HIGH | Three.js PlaneGeometry + displacement map shader; mouse position drives uniform; creates luxury product showcase feel |
| Text scramble/typewriter on reveal | Text briefly scrambles (Matrix-style) before resolving to final string | LOW | Pure JS; CSS `font-variant-numeric: tabular-nums`; GSAP for timing; elegant for data labels and stats |
| Gradient mesh background animation | Living color gradient background that slowly morphs | MEDIUM | Three.js ShaderMaterial OR CSS `@property` with Houdini animation; 3-4 color stops morphing with Perlin noise |
| Scroll velocity effects | Animation speed adapts to scroll velocity (skew images, speed up stagger) | MEDIUM | Track scroll velocity via Lenis `onScroll` callback; apply `skewY` via GSAP quickSetter; Stripe-style effect |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that look impressive in demos but damage UX, performance, or accessibility in production.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full-page scroll hijacking | Feels cinematic like Apple product pages | Breaks native scroll expectations; causes motion sickness; destroys accessibility; scroll restoration on back/forward fails | Use parallax + scroll-scrubbed animations instead — user retains control of scroll speed |
| Infinite scroll / loop sections | Looks impressive and energetic | Disorienting; users lose sense of position; content never "arrives"; breaks anchor links | Use looping only for non-content carousels (logo strips, testimonials marquee) with clear loop indicators |
| Heavy 3D model loading (GLTF) in hero | Makes hero feel premium and 3D | GLTF models for hero are 500KB–5MB; block LCP; cause CLS; fail on low-end mobile | Use CSS 3D transforms + perspective for pseudo-3D depth, or low-poly WebGL geometry instead of model files |
| Complex Barba.js transitions with heavy animations | Smooth page transitions feel app-like | AJAX transitions require reinitializing all GSAP ScrollTriggers and Lenis on each new page; complex state management; scroll position restoration bugs; double-init risks | Simple CSS clip-path overlay transition (300ms) that hides page swap; much simpler, same perceived quality |
| Particle systems as hero background | Looks dynamic and tech-forward | Three.js particle systems with 10K+ points are CPU-intensive; compete visually with headline content; often feel "2018" | Use WebGL shader gradient (no geometry, just a plane with GLSL noise) — more modern, better performance |
| Overly complex preloader (>3 seconds) | Showcases technical skill | 47% of users expect < 2s load; preloaders over 3s = abandonment; feels like a penalty for fast connections | Cap preloader at 2s maximum; use `Promise.all` for real asset tracking; animate concurrently with asset loading |
| GSAP animations on every DOM element | Creates lush visual richness throughout | Too many simultaneous GSAP tweens cause main-thread congestion; scrolling becomes janky; especially bad on mobile | Animate only above-the-fold and near-viewport elements; use `ScrollTrigger.batch()` for efficient viewport-based activation |
| CSS filter: blur() for glass effects | Glass morphism looks premium | `filter: blur()` triggers expensive paint operations; causes frame drops during scroll; cannot be GPU-composited | Use `backdrop-filter: blur()` (GPU-accelerated) or pre-baked glass effect in CSS without live blur |
| Mouse-follow parallax on mobile | Touch devices emulate hover via tap | Touch/tap events don't emit continuous mousemove; the effect fires once and freezes; looks broken | Gate all mouse-parallax effects behind `hasHover` and `!isTouch` feature detection (already in architecture) |
| Scroll snapping on main scroll | Forces content into distinct "slides" for cinematic feel | Fights against Lenis smooth scroll; creates inconsistent UX; users can't scroll to arbitrary positions | Use snap only for horizontal scroll sections with explicit snap targets; never on the main vertical scroll |

---

## Feature Dependencies

```
[Smooth Scroll (Lenis)]
    └──required by──> [Horizontal Scroll Showcase]
    └──required by──> [Scroll Velocity Effects]
    └──required by──> [Parallax Depth Layers]
    └──required by──> [Scroll-Scrubbed Timeline Effects]

[Hero Opening Sequence]
    └──requires──> [SplitText Kinetic Typography]
    └──requires──> [Clip-Path Image Wipe Reveals]
    └──optional──> [WebGL/Shader Background Effects]

[Custom Cursor System]
    └──enhances──> [Magnetic Button Effect]
    └──enhances──> [Contextual Cursor Morphing]
    └──required by──> [Image Hover Distortion Effect]  ← cursor provides hover state signal

[SplitText Kinetic Typography]
    └──required by──> [Hero Opening Sequence]
    └──enhances──> [Staggered Section Entrance Choreography]

[GSAP ScrollTrigger]
    └──required by──> [Horizontal Scroll Showcase]
    └──required by──> [Clip-Path Image Wipe Reveals]
    └──required by──> [Parallax Depth Layers]
    └──required by──> [Scroll-Scrubbed Timeline Effects]
    └──required by──> [Staggered Section Entrance Choreography]

[WebGL/Shader Background]
    └──conflicts with──> [Heavy 3D Model Hero]  ← competing GPU load
    └──conflicts with──> [Image Hover Distortion]  ← if both on same page section

[Page Transitions (Barba.js)]
    └──conflicts with──> [All ScrollTrigger initializations]  ← must reinit on each transition
    └──optional──> [Hero Opening Sequence]  ← should replay on each page
```

### Dependency Notes

- **Lenis required before ScrollTrigger scroll effects:** Lenis overrides native scroll; ScrollTrigger must be told to use Lenis's scroll values via `ScrollTrigger.scrollerProxy()` or Lenis's native ScrollTrigger integration
- **Hero Opening Sequence requires SplitText:** The hero headline animation is the centerpiece of the opening; SplitText enables character/word-level stagger which is the defining quality signal
- **Cursor system is foundational:** Magnetic buttons and contextual morphing are layers on top of the base cursor system; build cursor first, then enhance
- **Barba.js conflicts with ScrollTrigger:** Every GSAP ScrollTrigger must be killed and recreated on each Barba page transition; this is a known complexity tax — weigh against simple CSS overlay transition
- **WebGL shader vs geometry:** Running both shader backgrounds AND image distortion WebGL on the same section doubles draw calls; keep them in separate page sections

---

## MVP Definition

### Launch With (v1) — Maximum Impact, Manageable Complexity

The 20% of features that deliver 80% of perceived quality improvement.

- [ ] **Hero Opening Sequence** — coordinated GSAP master timeline (preloader → type reveal → content entrance); first impression defines everything
- [ ] **SplitText Kinetic Typography** — character/word-level headline reveals across all sections; most visible quality signal
- [ ] **Clip-Path Image Wipe Reveals** — scroll-triggered image reveals replacing generic fade-in; editorial feel throughout
- [ ] **Custom Cursor with Contextual States** — rewrite existing basic cursor with magnetic pull + 4 states; desk-only, touch-gated
- [ ] **Magnetic Button Effect** — all CTAs attract cursor with spring physics; premium tactile feel
- [ ] **Parallax Depth Layers** — hero and section backgrounds move at offset speeds; adds dimension
- [ ] **Lenis + ScrollTrigger Integration** — proper setup ensuring Lenis and GSAP ScrollTrigger work in harmony; foundational for all scroll effects
- [ ] **Staggered Section Entrance Choreography** — replace generic `data-reveal` with coordinated timelines per section
- [ ] **Scroll Velocity Skew** — image skew proportional to scroll speed (Lenis `onScroll` callback); subtle but premium

### Add After Core (v1.x) — High Wow, Higher Complexity

- [ ] **Horizontal Scroll Showcase Section** — capabilities/products in pinned horizontal track; add when core scroll system proven stable
- [ ] **WebGL Shader Background (Hero)** — animated noise gradient behind hero; add when JS perf baseline confirmed on mobile
- [ ] **Text Scramble on Data Reveals** — for stat numbers and data points; quick win after SplitText system is built

### Future Consideration (v2+) — Complex, Niche Return

- [ ] **Image Hover Distortion (WebGL)** — requires Three.js scene per image card; significant complexity; add only if showcase pages feel flat after v1
- [ ] **Barba.js Page Transitions** — high complexity, high state management risk; defer until all page-level animation systems are stable
- [ ] **Full Scroll-Scrubbed Cinematic Timeline** — frame-perfect scroll-driven storytelling; build as a dedicated landing page section only

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero Opening Sequence | HIGH | HIGH | P1 |
| SplitText Kinetic Typography | HIGH | MEDIUM | P1 |
| Clip-Path Image Wipe Reveals | HIGH | MEDIUM | P1 |
| Magnetic Button Effect | HIGH | MEDIUM | P1 |
| Custom Cursor (full states) | HIGH | MEDIUM | P1 |
| Lenis + ScrollTrigger Integration | HIGH | LOW | P1 — foundational |
| Parallax Depth Layers | MEDIUM | MEDIUM | P1 |
| Staggered Section Entrance | HIGH | MEDIUM | P1 |
| Scroll Velocity Skew | MEDIUM | LOW | P1 |
| Horizontal Scroll Showcase | HIGH | HIGH | P2 |
| WebGL Shader Background | HIGH | HIGH | P2 |
| Text Scramble on Stats | MEDIUM | LOW | P2 |
| Image Hover Distortion (WebGL) | MEDIUM | HIGH | P3 |
| Barba.js Page Transitions | MEDIUM | HIGH | P3 |
| Full Scroll-Scrubbed Timeline | HIGH | HIGH | P3 |
| Gradient Mesh Background | MEDIUM | MEDIUM | P2 |

**Priority key:**
- P1: Core animation overhaul — must have for Awwwards-level quality
- P2: Strong differentiators — add when foundation is stable
- P3: Experiential luxury — for dedicated showcase sections or v2

---

## Competitor Feature Analysis

| Feature | Active Theory | Resn | Lusion | Our Approach |
|---------|--------------|------|--------|--------------|
| Cursor system | Custom shape morphing with hover labels | Circle that scales/changes color | Magnetic dot with context states | Magnetic dot + 4 states (default/link/cta/image) |
| Hero animation | Full WebGL immersive 3D | Cinematic text + image sequence | Particle field + type reveal | Type reveal + clip-path image + subtle WebGL gradient |
| Scroll effects | Horizontal sections + parallax | Scroll-scrubbed story panels | Velocity skew + parallax | Parallax + clip-path + velocity skew |
| Text animation | SplitText with kinetic bounce | Masked word reveals | Character stagger with blur | Masked character/word reveals via SplitText |
| Background | Full WebGL environment | CSS gradient + noise texture | Three.js particle system | Shader gradient (hero) + CSS noise (sections) |
| Page transitions | Full WebGL transition | Overlay wipe | Crossfade + content morph | CSS overlay wipe (clip-path) — simpler, same quality |
| Card hover | 3D tilt + image zoom | Clip-path image reveal | Image distortion shader | Clip-path reveal + subtle tilt transform |

---

## Sources

- [Awwwards Animation Websites Gallery](https://www.awwwards.com/websites/animation/) — HIGH confidence (authoritative award collection)
- [GSAP ScrollTrigger Documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — HIGH confidence (official docs)
- [GSAP Scroll Examples & Techniques](https://gsap.com/scroll/) — HIGH confidence (official)
- [7 Must-Know GSAP Animation Tips — Codrops 2025](https://tympanus.net/codrops/2025/09/03/7-must-know-gsap-animation-tips-for-creative-developers/) — HIGH confidence (Codrops is authoritative creative dev source)
- [WebGL Shader Techniques for Image Transitions — Codrops 2025](https://tympanus.net/codrops/2025/01/22/webgl-shader-techniques-for-dynamic-image-transitions/) — HIGH confidence
- [Animated Product Grid Preview with GSAP & Clip-Path — Codrops 2025](https://tympanus.net/codrops/2025/05/27/animated-product-grid-preview-with-gsap-clip-path/) — HIGH confidence
- [Awwwards Creating Portfolio with WebGL and Barba.js (Academy)](https://www.awwwards.com/academy/course/creating-a-simple-portfolio-website-with-webgl-and-barba-js) — HIGH confidence (Awwwards official course)
- [Top Creative Studios 2025 — Elias Studio](https://www.elias.studio/en/blog/post/top-30-des-meilleurs-sites-internet-dagences-en-2025) — MEDIUM confidence
- [Web Design Trends 2026 — Really Good Designs](https://reallygooddesigns.com/web-design-trends-2026/) — MEDIUM confidence
- [Web Animation Performance Guide 2025](https://www.vawebseo.com/web-animation-in-modern-design-complete-2025-guide/) — MEDIUM confidence
- [60FPS Performant Web Animations — Algolia Blog](https://www.algolia.com/blog/engineering/60-fps-performant-web-animations-for-optimal-ux) — HIGH confidence
- [Animation Duration Best Practices — Nielsen Norman Group](https://www.nngroup.com/articles/animation-duration/) — HIGH confidence (authoritative UX research)
- [Magnetic Cursor Effect — GSAP Community](https://gsap.com/community/forums/topic/25319-magnetic-hover-interaction-with-cursor/) — HIGH confidence (official GSAP forum)
- [Horizontal Scroll with ScrollTrigger — Envato Tuts+](https://webdesign.tutsplus.com/create-horizontal-scroll-animations-with-gsap-scrolltrigger--cms-108881t) — MEDIUM confidence
- [Lenis SOTD Winner — Awwwards](https://www.awwwards.com/sites/lenis-2) — HIGH confidence (confirms Lenis as award-acknowledged tool)

---

## Key Architectural Notes for Implementation

### Existing Stack Leverage
The site already has GSAP 3.14.2, Three.js 0.170.0, Splitting.js, and Lenis 1.1.18. All P1 features are achievable within the existing stack:
- **SplitText**: Use GSAP's built-in SplitText (now free) — replace Splitting.js for type animations
- **ScrollTrigger**: Already available; needs Lenis integration via `lenis.on('scroll', ScrollTrigger.update)`
- **WebGL shaders**: Three.js already loaded; add ShaderMaterial plane to existing scene

### Vanilla JS Constraint
No Barba.js AJAX transitions unless the team accepts the ScrollTrigger reinit complexity. The simpler alternative — CSS `clip-path` overlay that briefly covers navigation — achieves 90% of the perceived effect at 10% of the complexity. Recommended for this architecture.

### Multi-Language Sync
All animation enhancements use CSS classes and `data-*` attributes that apply equally to `en/`, `cn/`, and `id/` pages. No language-specific animation code should be written. The `prefers-reduced-motion` gate must remain in all animation init functions.

---

*Feature research for: Awwwards-level creative web animation system*
*Researched: 2026-03-11*
