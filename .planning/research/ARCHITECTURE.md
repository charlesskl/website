# Architecture Research

**Domain:** Awwwards-level creative web animation system — vanilla JS static multi-page site
**Researched:** 2026-03-11
**Confidence:** HIGH (verified via GSAP official docs, Codrops, Lenis GitHub)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER RENDERING                             │
│   HTML Pages (index.html, about.html, capabilities/*.html etc.)      │
├─────────────────────────────────────────────────────────────────────┤
│                      ANIMATION CONTROLLER LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Preloader   │  │   Router /   │  │  gsap.matchMedia()       │   │
│  │  Controller  │  │  Page Trans  │  │  Responsive Context      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘   │
│         │                 │                      │                   │
├─────────┴─────────────────┴──────────────────────┴───────────────────┤
│                        SCROLL ENGINE LAYER                           │
│  ┌──────────────────────┐    ┌────────────────────────────────────┐  │
│  │   Lenis (raf loop)   │◄──►│   GSAP ScrollTrigger              │  │
│  │   smooth scroll      │    │   pin / parallax / scrub / reveal  │  │
│  └──────────────────────┘    └────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                        ANIMATION MODULES LAYER                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Cursor  │ │  Text    │ │  Hero    │ │  Cards   │ │  WebGL   │  │
│  │  System  │ │  Split   │ │  Reveal  │ │  Hover   │ │  Shader  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                         GPU / COMPOSITOR LAYER                       │
│   CSS transform / opacity only  ·  will-change managed  ·  RAF      │
│   Three.js canvas (position: fixed, pointer-events: none)            │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Preloader Controller | Block first paint, sequence entrance animation, emit "ready" event | GSAP Timeline, CSS overlay, document.fonts.ready |
| Animation Controller (namespace) | Central registry — init/kill/refresh all modules per page | Global `window.RR` namespace object, IIFE |
| Page Transition Router | Async fetch next page HTML, crossfade, cleanup old ScrollTriggers | Vanilla fetch + GSAP clip-path or translate timeline |
| Lenis RAF Loop | Single requestAnimationFrame driving both scroll smoothing and GSAP ticker | `gsap.ticker.add(time => lenis.raf(time * 1000))` |
| GSAP ScrollTrigger | Scroll-linked pins, parallax scrubs, trigger reveals | Registered inside `gsap.matchMedia()` blocks |
| gsap.matchMedia() | Desktop vs mobile animation variants — auto-revert on breakpoint change | `mm.add("(min-width: 768px)", ctx => {...})` |
| Cursor System | Magnetic, morphing, contextual cursor tracking | mousemove RAF loop, GSAP quickTo for lerp |
| Text Split System | Splitting.js chars/words/lines, staggered reveals | `Splitting()` called once, GSAP stagger timelines |
| WebGL / Three.js Canvas | Background shaders, particle fields, distortion effects | Fixed canvas behind DOM, synchronized via Lenis scroll value |
| Scroll Reveal | Intersection-triggered entrance animations | IntersectionObserver fallback OR ScrollTrigger |
| Micro-interactions | Button hover, link hover, form focus states | GSAP quickTo, CSS custom properties |

---

## Recommended Project Structure

```
assets/
├── shared.css                  # Design system, CSS custom properties, GPU layer hints
├── shared.js                   # Boot file: init order, global namespace, feature detection
├── animations.js               # Scroll reveal (IntersectionObserver — lightweight pages)
│
├── animation/                  # New: modular animation system
│   ├── controller.js           # window.RR namespace, module registry, init/kill/refresh
│   ├── preloader.js            # Preloader sequence (blocks paint → entrance → emit ready)
│   ├── page-transitions.js     # Async fetch router, crossfade timelines, cleanup cycle
│   ├── scroll-engine.js        # Lenis init, GSAP ticker bridge, ScrollTrigger config
│   ├── cursor.js               # Magnetic cursor, morphing states, contextual variants
│   ├── text-animations.js      # Splitting.js integration, stagger reveal presets
│   ├── hero.js                 # Page-specific hero sequences (called per namespace)
│   ├── cards.js                # Product card hover, reveal, parallax effects
│   ├── webgl.js                # Three.js canvas, shader backgrounds, distortion
│   └── responsive.js           # gsap.matchMedia() contexts for all breakpoints
│
└── shaders/                    # New: GLSL shader files (inline or external .glsl)
    ├── distortion.glsl
    └── noise.glsl
```

### Structure Rationale

- **`animation/controller.js`:** Single entry point — all pages include this, it reads `data-page` attribute on `<body>` and calls the right init functions. No per-page script tags needed.
- **`animation/scroll-engine.js`:** Lenis + ScrollTrigger must be initialized before any animation module — extracted to enforce boot order.
- **`animation/responsive.js`:** All `gsap.matchMedia()` contexts live here. Centralizes breakpoint logic. Modules call into responsive.js rather than defining their own matchMedia.
- **`shaders/`:** Inline GLSL as template literals in `webgl.js` is acceptable for small projects; a separate folder prevents the 800-line file ceiling from being hit.
- **Existing `shared.js` and `animations.js`:** Refactored in place rather than deleted — the new `controller.js` calls init functions defined in them to maintain backward compatibility during migration.

---

## Architectural Patterns

### Pattern 1: Global Namespace + Module Registry

**What:** A single global object (`window.RR`) acts as a namespace and module registry. All animation modules register themselves by pushing into an array. The controller iterates and calls `init()` / `kill()` on each.

**When to use:** When there is no module bundler. IIFE wrapping prevents global scope pollution while still allowing cross-module communication.

**Trade-offs:** Simple, zero-dependency, debuggable in DevTools console. Downside: no tree-shaking, all code loads on every page even if unused.

```javascript
// controller.js
(function () {
  'use strict';
  window.RR = window.RR || {
    modules: [],
    register(name, mod) { this.modules.push({ name, ...mod }); },
    initAll() { this.modules.forEach(m => m.init && m.init()); },
    killAll() { this.modules.forEach(m => m.kill && m.kill()); },
    refreshAll() { this.modules.forEach(m => m.refresh && m.refresh()); }
  };
})();
```

### Pattern 2: Page Namespace via `data-page` Attribute

**What:** Each HTML page has `<body data-page="home">` (or "about", "capabilities-plastic-toys" etc.). The controller reads this and conditionally initializes page-specific modules. Multi-language pages share the same namespace because `cn/index.html` also carries `data-page="home"`.

**When to use:** Static multi-page site where the same shared JS must behave differently per page without a router.

**Trade-offs:** Zero overhead, works with full-page navigations. Requires consistent `data-page` values across all language variants.

```javascript
// controller.js — page-specific init
const page = document.body.dataset.page;
if (page === 'home') {
  RR.hero.initHero();
  RR.webgl.initParticleField();
}
if (page?.startsWith('capabilities')) {
  RR.cards.initCapabilityReveal();
}
```

### Pattern 3: Lenis → GSAP Ticker Bridge (Single RAF Loop)

**What:** Lenis drives smooth scrolling via its own `raf()` method. Instead of creating a separate `requestAnimationFrame` loop, plug Lenis into GSAP's existing ticker. Both libraries share one loop, preventing double-RAF overhead and ensuring ScrollTrigger and Lenis scroll values update in the same frame.

**When to use:** Always, when using Lenis + GSAP together. Critical for avoiding drift between scroll position and ScrollTrigger pin calculations.

**Trade-offs:** Tight coupling between Lenis and GSAP — if one is removed, the loop must be refactored. The payoff is guaranteed frame synchronization.

```javascript
// scroll-engine.js
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

### Pattern 4: gsap.matchMedia() for All Responsive Animations

**What:** Every ScrollTrigger, pinning animation, and responsive variant is created inside `gsap.matchMedia()` handlers. When viewport crosses the breakpoint, GSAP automatically reverts all animations and styles — no manual cleanup needed.

**When to use:** Any animation that behaves differently on mobile vs desktop (parallax depth, horizontal scroll, complex pinning). Mobile typically disables pinning and complex 3D transforms.

**Trade-offs:** Slightly more verbose setup. The payoff is that resize events never cause stale ScrollTrigger calculations or zombie animations.

```javascript
// responsive.js
const mm = gsap.matchMedia();
mm.add({
  isDesktop: '(min-width: 768px)',
  isMobile: '(max-width: 767px)',
  reducedMotion: '(prefers-reduced-motion: reduce)'
}, (context) => {
  const { isDesktop, reducedMotion } = context.conditions;
  if (reducedMotion) return; // skip all complex animations
  if (isDesktop) {
    // complex pinning, horizontal scroll, parallax depth
  } else {
    // simpler fade-in reveals only
  }
});
```

### Pattern 5: Page Transition Cleanup Cycle

**What:** Before navigating to a new page, kill all active ScrollTriggers and revert Splitting.js splits. After the new page DOM is injected, re-run `RR.initAll()`. Without this, stale ScrollTrigger instances reference DOM nodes that no longer exist, causing ghost scroll behaviors and memory leaks.

**When to use:** Any time page transitions are implemented without a full browser navigation (i.e., async fetch + DOM swap approach).

**Trade-offs:** If doing full browser navigation (standard `<a href>` links), cleanup is automatic and this pattern is unnecessary. This site currently uses full navigations — adopt cleanup only if page transitions are added.

```javascript
// page-transitions.js
async function navigate(url) {
  RR.killAll();               // kill all ScrollTriggers, tweens
  ScrollTrigger.killAll();    // belt-and-suspenders
  lenis.scrollTo(0, { immediate: true }); // reset scroll position
  await transitionOut();      // animate exit
  const html = await fetch(url).then(r => r.text());
  injectPage(html);           // swap DOM
  await transitionIn();       // animate entrance
  ScrollTrigger.refresh();    // recalculate positions
  RR.initAll();               // re-init all modules
}
```

### Pattern 6: WebGL Canvas Isolation

**What:** Three.js renders to a `<canvas>` with `position: fixed; top: 0; left: 0; pointer-events: none; z-index: -1`. This isolates WebGL from the DOM stacking context. The canvas never participates in layout, preventing it from causing reflows when DOM animations run. Scroll position is passed in via the Lenis scroll event — the WebGL module reads `lenis.scroll` to drive parallax in the shader.

**When to use:** Any ambient background effect (particle fields, noise shaders, liquid distortions). Not appropriate for foreground elements that need click/touch interactions.

**Trade-offs:** Clean isolation, zero DOM impact. Downside: cannot render text on the WebGL canvas and have it be selectable. Use a DOM overlay for copy.

```javascript
// webgl.js — canvas setup
const canvas = document.createElement('canvas');
canvas.style.cssText = `
  position: fixed; inset: 0;
  pointer-events: none; z-index: -1;
`;
document.body.prepend(canvas);
lenis.on('scroll', ({ scroll }) => {
  uniforms.uScrollY.value = scroll;
});
```

---

## Data Flow

### Animation Boot Sequence (First Page Load)

```
DOMContentLoaded
    ↓
scroll-engine.js   → Lenis init → GSAP ticker bridge
    ↓
preloader.js       → Block page, preload fonts + hero image → GSAP preloader timeline
    ↓
controller.js      → Read data-page → conditionally call module init functions
    ↓
responsive.js      → gsap.matchMedia() contexts registered
    ↓
[page modules]     → hero.js / text-animations.js / webgl.js / cursor.js
    ↓
preloader exit     → Reveal page → ScrollTrigger.refresh()
    ↓
User scrolls       → Lenis.raf() → ScrollTrigger.update() → animation callbacks fire
```

### State Management

```
[DOM data-* attributes]   → Module reads, never writes back to HTML
[CSS class toggles]       → .is-active, .is-revealed, .is-transitioning (UI state)
[window.RR.state]         → Shared animation state object (current page, isTransitioning flag)
[localStorage]            → Language preference (en/cn/id), hasVisited flag for preloader skip
[GSAP internal]           → Tween state, ScrollTrigger positions, matchMedia contexts
```

### Key Data Flows

1. **Scroll flow:** `window scroll event` → `Lenis.raf()` → `ScrollTrigger.update()` → individual `onUpdate` callbacks → GSAP tween progress updates → GPU composite
2. **Page transition flow:** `click <a>` → intercept → `RR.killAll()` → `transitionOut()` → `fetch(url)` → DOM swap → `ScrollTrigger.refresh()` → `RR.initAll()` → `transitionIn()`
3. **Responsive flow:** viewport resize → `gsap.matchMedia()` detects breakpoint change → auto-revert old animations → re-run new breakpoint handler → `ScrollTrigger.refresh()`
4. **WebGL sync flow:** `Lenis scroll event` → `uniforms.uScrollY.value = scroll` → shader reads uniform next frame → visual update

---

## Multi-Language Architecture

The three language variants (`/`, `/cn/`, `/id/`) share identical `data-page` attribute values and identical HTML structure — only copy differs. This means:

- All animation modules work identically across all three languages
- No per-language animation code needed
- `controller.js` reads `data-page="home"` on `cn/index.html` identically to root `index.html`
- Shared CSS and JS assets via relative path (`../assets/` from `/cn/` subdirectory)

**Critical constraint:** Language pages use `../assets/shared.js` (relative) — any new animation files added to `/assets/animation/` must be included in all HTML files with the same relative path pattern.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (15 HTML pages) | Single global namespace, all modules in shared.js split into files, CDN libraries |
| 30–50 pages | Same approach works. Consider lazy-loading page-specific modules via dynamic `<script>` injection |
| 100+ pages or build system added | Migrate to ES modules (import/export), tree-shaking becomes valuable, switch CDN to npm packages |

### Scaling Priorities

1. **First bottleneck:** Too many simultaneous ScrollTrigger instances on pages with many sections — use `refreshPriority` ordering and kill/recreate on navigate
2. **Second bottleneck:** WebGL GPU memory on devices with multiple pages loaded — `dispose()` geometries/materials/textures before page transition

---

## Anti-Patterns

### Anti-Pattern 1: Scroll Listeners Instead of ScrollTrigger

**What people do:** Attach `window.addEventListener('scroll', handler)` for scroll animations.
**Why it's wrong:** Fires on every pixel of scroll, not debounced, not synchronized with GSAP's render loop. Causes layout thrashing if reading DOM dimensions inside handler.
**Do this instead:** Use `ScrollTrigger.create()` with `onUpdate` — GSAP batches all updates to the next animation frame. For simple reveals, IntersectionObserver is lighter than ScrollTrigger.

### Anti-Pattern 2: Animating Layout-Triggering CSS Properties

**What people do:** Animate `width`, `height`, `top`, `left`, `margin`, `padding` with GSAP or CSS transitions.
**Why it's wrong:** Triggers browser layout recalculation on every frame. On 60fps animation, this means 60 layout passes per second — catastrophic for performance.
**Do this instead:** Animate only `transform` (translate, scale, rotate) and `opacity`. For apparent position changes, use `transform: translateX/Y`. For size changes, use `transform: scaleX/Y`.

### Anti-Pattern 3: Creating ScrollTriggers Outside of gsap.matchMedia()

**What people do:** Call `ScrollTrigger.create()` at module level without a matchMedia wrapper.
**Why it's wrong:** On resize from desktop to mobile, the ScrollTrigger persists with desktop measurements. The mobile layout breaks because pins and calculations are based on wrong scroll distances.
**Do this instead:** Wrap all ScrollTrigger creation in `gsap.matchMedia()`. GSAP automatically reverts and re-creates on breakpoint change.

### Anti-Pattern 4: Not Calling ScrollTrigger.refresh() After DOM Changes

**What people do:** Inject new content (via fetch or DOM manipulation) without refreshing ScrollTrigger.
**Why it's wrong:** ScrollTrigger caches element positions at initialization. After DOM changes, cached positions are stale — triggers fire at wrong scroll positions.
**Do this instead:** Call `ScrollTrigger.refresh()` after any layout-affecting DOM mutation. Always call it after page transitions complete.

### Anti-Pattern 5: Attaching ScrollTrigger to Tweens Inside a Timeline

**What people do:** Nest tweens with `scrollTrigger: {}` config inside a parent `gsap.timeline()`.
**Why it's wrong:** The parent timeline's playhead conflicts with the scroll-position-based control. The animation plays out of sync.
**Do this instead:** Create the Timeline first, then attach a single ScrollTrigger to it via `ScrollTrigger.create({ animation: tl })`. Never nest ScrollTrigger inside timeline children.

### Anti-Pattern 6: `will-change` on Everything

**What people do:** Apply `will-change: transform` to every animated element at page load.
**Why it's wrong:** Each `will-change` element is promoted to its own GPU layer. With many elements, this exhausts GPU memory — especially on mobile. Causes slowdowns instead of speedups.
**Do this instead:** Add `will-change` only immediately before an animation starts (`gsap.set(el, { willChange: 'transform' })`), remove it after (`gsap.set(el, { willChange: 'auto' })`). Or trust GSAP — it manages GPU layers automatically for `transform` and `opacity` animations.

### Anti-Pattern 7: Splitting Text Twice / Multiple Splitting.js Calls

**What people do:** Call `Splitting()` on page load, then call it again after a page transition, without reverting first.
**Why it's wrong:** Splitting.js wraps characters in `<span>` elements. Calling it twice double-wraps, creating deeply nested spans that break text layout and line heights.
**Do this instead:** Store the result of `Splitting()` calls. Before re-initializing on page transition, call the revert method or target only newly injected content containers.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GSAP 3.14.2 (CDN) | Global `gsap`, `ScrollTrigger`, `SplitText` — registered via `gsap.registerPlugin()` | Load before any animation module |
| Three.js 0.170.0 (CDN) | Global `THREE` — canvas isolated at z-index -1 | Sync scroll via Lenis event |
| Lenis 1.1.18 (CDN) | Global `Lenis` — instance attached to `window.RR.lenis` for cross-module access | Init before ScrollTrigger |
| Splitting.js (CDN) | Global `Splitting` — call once per page, store results | Revert before page transitions |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `scroll-engine.js` ↔ all other modules | `window.RR.lenis` reference + `ScrollTrigger` global | scroll-engine must init first |
| `controller.js` ↔ all modules | `RR.register(name, { init, kill, refresh })` | modules self-register, controller orchestrates |
| `webgl.js` ↔ `scroll-engine.js` | `lenis.on('scroll', handler)` event | WebGL reads scroll value, never writes |
| `page-transitions.js` ↔ `controller.js` | `RR.killAll()` before transition, `RR.initAll()` after | strict ordering required |
| `responsive.js` ↔ animation modules | modules receive `context.conditions` object | all breakpoint decisions centralized |
| Multi-language pages ↔ `controller.js` | `data-page` attribute on `<body>` | same attribute value used across en/cn/id |

---

## Build Order for Implementation

Dependencies determine this sequence — do not reorder:

1. **`scroll-engine.js`** — Lenis + GSAP ticker bridge. All other modules depend on scroll being initialized.
2. **`controller.js`** — Global namespace, module registry, page detection. All modules need this to self-register.
3. **`responsive.js`** — matchMedia contexts. Must exist before modules create ScrollTriggers.
4. **`preloader.js`** — Runs immediately on load, blocks other animations until complete.
5. **`cursor.js`** — Independent, no scroll dependencies. Can be early in init sequence.
6. **`text-animations.js`** — Splitting.js splits must happen before ScrollTrigger measures element heights.
7. **`hero.js`** — Page-specific, called conditionally by controller after text splits.
8. **`webgl.js`** — Requires Lenis instance and Three.js loaded. Initialize after scroll-engine.
9. **`cards.js`** — Requires ScrollTrigger and DOM stability. Initialize last in page-specific sequence.
10. **`page-transitions.js`** — Wraps all other modules. Intercepts navigation, calls RR.killAll/initAll.

---

## How to Retrofit onto Existing vanilla JS Architecture

The current `assets/shared.js` is a 1200-line IIFE with 14 modules. The retrofit strategy:

1. **Do not delete `shared.js`** — extract modules from it one at a time into `assets/animation/*.js` files
2. **Add `window.RR` namespace** at the top of `shared.js` as a shim that the new files attach to
3. **Replace `DOMContentLoaded` init calls** progressively — each new file's `init()` function replaces the call in `shared.js`'s DOMContentLoaded handler
4. **Load new files via `<script>` tags** in each HTML page, in dependency order (scroll-engine first, controller second)
5. **Keep `animations.js` as-is** for IntersectionObserver-based simple reveals — only upgrade to ScrollTrigger-based versions for complex sequences
6. **Add `data-page` attribute** to every `<body>` tag across all HTML files (en + cn + id) as the first step

---

## Sources

- [GSAP ScrollTrigger Tips & Mistakes](https://gsap.com/resources/st-mistakes/) — official docs on cleanup and init order
- [gsap.matchMedia() Docs](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/) — responsive animation patterns
- [Lenis GitHub (darkroomengineering)](https://github.com/darkroomengineering/lenis) — GSAP ticker integration
- [Building Async Page Transitions in Vanilla JavaScript — Codrops](https://tympanus.net/codrops/2026/02/26/building-async-page-transitions-in-vanilla-javascript/) — async fetch router pattern
- [Building a Scroll-Revealed WebGL Gallery with GSAP, Three.js — Codrops](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/) — WebGL + ScrollTrigger integration
- [CSS GPU Animation — Smashing Magazine](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) — transform/opacity performance fundamentals
- [MDN: CSS and JavaScript animation performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance) — compositor-level animation guidance

---

*Architecture research for: Awwwards-level animation system, vanilla JS static multi-page site*
*Researched: 2026-03-11*
