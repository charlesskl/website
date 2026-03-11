# Stack Research

**Domain:** Awwwards-level creative web animation — vanilla HTML/CSS/JS static site enhancement
**Researched:** 2026-03-11
**Confidence:** HIGH (GSAP/Lenis/Three.js verified via official GitHub releases; shader/emerging libs MEDIUM via Codrops/WebSearch)

---

## Recommended Stack

### Core Animation Engine

| Technology | Version | CDN URL | Why Recommended |
|------------|---------|---------|-----------------|
| GSAP | 3.14.2 | `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js` | Industry standard for Awwwards-winning sites. Sub-millisecond timing, hardware-acceleration by default, integrates with every other library in this stack. All premium plugins now free (Webflow acquisition, 2024). |
| Lenis | 1.3.18 | `https://cdn.jsdelivr.net/npm/lenis@1.3.18/dist/lenis.min.js` | Superior scroll feel vs native. Fires scroll events that ScrollTrigger can consume. Non-destructive — keeps native DOM structure intact (unlike ScrollSmoother which requires wrapper divs). Already in the existing stack. |
| Three.js | 0.183.0 | `https://cdn.jsdelivr.net/npm/three@0.183.0/build/three.min.js` | Dominant WebGL library. Awwwards-winning sites almost universally use Three.js for shader backgrounds, particle systems, and interactive 3D. Already in existing stack at r170 — upgrade to r183 for latest TSL and WebGPU-ready renderer. |

### GSAP Plugin Suite (All Free as of 2024)

All plugins load from the same `gsap@3.14.2` package. Register after loading core.

| Plugin | CDN URL | Purpose | When to Use |
|--------|---------|---------|-------------|
| ScrollTrigger | `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollTrigger.min.js` | Scroll-driven animation engine | Every scroll-triggered effect: reveals, parallax, pin, scrub |
| ScrollSmoother | `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollSmoother.min.js` | GSAP-native smooth scroll | NOT recommended here — use Lenis instead (see Alternatives) |
| SplitText | `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/SplitText.min.js` | Splits text into chars/words/lines for animation | Every kinetic typography, staggered reveal, and text entrance |
| Flip | `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/Flip.min.js` | FLIP animation technique (First/Last/Invert/Play) | Layout transitions, menu morphs, card rearrangements |
| DrawSVG | `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/DrawSVGPlugin.min.js` | Animates SVG stroke-dashoffset | Logo reveals, path drawing, SVG icon animations |
| MorphSVG | `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/MorphSVGPlugin.min.js` | Morphs between SVG path shapes | Icon state transitions, cursor shape morphing |
| Observer | `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/Observer.min.js` | Unified input detection (scroll/touch/wheel/pointer) | Custom scroll hijacking, horizontal scroll sections, gesture-driven interactions |
| MotionPath | `https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/MotionPathPlugin.min.js` | Animates elements along SVG paths | Curved hover trails, floating element paths |

### WebGL Shader Layer

| Technology | Version | CDN / Import | Purpose | Why |
|------------|---------|-------------|---------|-----|
| Three.js ShaderMaterial | (bundled) | via Three.js core | Custom GLSL fragment/vertex shaders | For plasma backgrounds, noise distortions, displacement effects. Higher control than any abstraction layer. |
| OGL | 0.0.103 | `https://cdn.jsdelivr.net/npm/ogl@0.0.103/src/index.js` (ESM) | Lightweight WebGL for DOM-coupled shader effects | 24kb vs Three.js 600kb+. Use for per-image hover shaders (displacement, ripple, blur) where Three.js overhead is too heavy. Codrops tutorials use OGL extensively for image hover effects. |

**GLSL Noise (Inline in Shaders — no library needed):**
Include Patricio Gonzalez Vivo's noise GLSL snippets directly in shader strings. Standard practice — no CDN required. Sources: [glsl-noise gist](https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83).

### Supporting Libraries

| Library | Version | CDN URL | Purpose | When to Use |
|---------|---------|---------|---------|-------------|
| Splitting.js | 1.0.6 | `https://cdn.jsdelivr.net/npm/splitting@1.0.6/dist/splitting.min.js` | CSS-class-based text splitting | Already in stack. Use alongside GSAP SplitText: Splitting.js for CSS variable `--char-index` stagger tricks; SplitText for JS-controlled line wrapping |
| PixiJS | 8.13.0 | `https://cdn.jsdelivr.net/npm/pixi.js@8.13.0/dist/pixi.min.js` | 2D WebGL renderer for filter effects | OPTIONAL. Use only if adding displacement map hover effects on product images. Large (350KB min). Skip if Three.js/OGL cover the use case. |

---

## CDN Loading Order

Scripts must load in this exact order. All external before local:

```html
<!-- 1. Smooth Scroll (first — scroll events feed everything else) -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.18/dist/lenis.min.js"></script>

<!-- 2. GSAP Core -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>

<!-- 3. GSAP Plugins (load after core, before registration) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/Flip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/Observer.min.js"></script>
<!-- Load these only on pages that need them: -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/DrawSVGPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/MorphSVGPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/MotionPathPlugin.min.js"></script>

<!-- 4. Three.js (async on pages that use WebGL backgrounds) -->
<script src="https://cdn.jsdelivr.net/npm/three@0.183.0/build/three.min.js" async></script>

<!-- 5. Local animation code (deferred) -->
<script src="/assets/animations.js" defer></script>
```

**Registration (in animations.js):**
```javascript
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin);

// Lenis + ScrollTrigger integration
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
```

---

## Alternatives Considered

| Recommended | Alternative | Why Alternative Was Rejected |
|-------------|-------------|-------------------------------|
| Lenis 1.3.18 | GSAP ScrollSmoother | ScrollSmoother requires wrapping entire page in `#smooth-wrapper > #smooth-content` divs, breaking the existing HTML. The no-HTML-changes constraint rules it out. Lenis requires zero DOM changes. |
| GSAP SplitText | Splitting.js alone | Splitting.js has no built-in responsive re-split on resize. SplitText auto-resplits when fonts load or container resizes, preventing broken line animations. Both can coexist: Splitting.js for CSS tricks, SplitText for JS-controlled animation. |
| Three.js r183 | Three.js r170 (current) | r170 is already in stack but missing WebGPU-ready renderer, TSL shaders, and 13 release cycles of bug fixes. Upgrade to 0.183.0 for production-ready WebGPU fallback. |
| OGL (for DOM hover shaders) | curtains.js | curtains.js last published 2 years ago (not maintained). OGL is actively developed, 24kb, ES-module native, Codrops uses it for tutorials. |
| OGL (for DOM hover shaders) | Three.js for all shaders | Three.js (600KB+) is overkill for simple DOM-coupled image effects. OGL (24KB) is purpose-built for this pattern and used by leading creative studios. |
| Three.js ShaderMaterial | PixiJS for backgrounds | PixiJS is 2D renderer; better suited for DOM-synced displacement filters. For fullscreen WebGL backgrounds (the site's use case), Three.js is the correct choice. |
| Vanilla GLSL snippets | glsl-noise npm package | No bundler available — inline GLSL strings are the correct CDN-compatible approach. The noise functions are small enough to inline. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Locomotive Scroll | Abandoned in favor of Lenis (same team, darkroom.engineering). Last meaningful update 2022. | Lenis 1.3.18 |
| GSAP ScrollSmoother | Requires HTML wrapper structure changes — violates the no-HTML-changes constraint | Lenis + ScrollTrigger |
| Framer Motion | React-only. Zero value on a vanilla JS site. | GSAP |
| Anime.js | Performance degrades vs GSAP on complex multi-element scenes. Smaller ecosystem. No scroll integration. | GSAP (already in stack, now fully free) |
| WebGPU-first rendering | Chrome/Edge only as of 2026-03. Still needs WebGL2 fallback. Three.js r183 handles this automatically via WebGPURenderer — don't manually manage it. | Three.js r183 WebGPURenderer (auto-fallback) |
| CSS-only scroll animations (scroll-timeline) | Browser support still incomplete for complex sequences. GSAP ScrollTrigger offers far more control and cross-browser reliability. | GSAP ScrollTrigger |
| tsParticles / particles.js | Generic particle systems — recognizable as commodity effects. Awwwards judges penalize obvious off-the-shelf components. | Three.js custom particle systems with custom shaders |

---

## Stack Patterns for This Site

**For fullscreen WebGL backgrounds (homepage hero):**
- Three.js r183 + custom ShaderMaterial
- Fragment shader with simplex noise for organic movement
- Render to canvas behind HTML content

**For DOM-coupled image hover effects (product cards):**
- OGL (ESM) + custom displacement shader
- WebGL canvas overlaid on DOM element, synced via CSS positioning
- Pattern popularized by: [Codrops OGL gallery tutorial](https://tympanus.net/codrops/2024/12/03/how-to-create-a-webgl-rotating-image-gallery-using-ogl-and-glsl-shaders/)

**For text animations:**
- GSAP SplitText (primary) for JS-driven stagger
- Splitting.js (supplementary) for CSS variable `--char-index` tricks
- ScrollTrigger scrub for reading-pace reveals

**For smooth scroll:**
- Lenis (global) feeding ScrollTrigger
- Never use both Lenis AND ScrollSmoother simultaneously

**For SVG animations (logo/icons):**
- DrawSVG for stroke reveal
- MorphSVG for shape transitions between states
- Flip for layout-to-layout transitions

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| GSAP | 3.14.2 | Lenis 1.3.18 | Requires `gsap.ticker.lagSmoothing(0)` when used together |
| GSAP | 3.14.2 | Three.js 0.183.0 | No conflicts — different rendering contexts |
| Lenis | 1.3.18 | Three.js 0.183.0 | Lenis fires native scroll events Three.js requestAnimationFrame can read |
| SplitText | 3.14.2 | Splitting.js 1.0.6 | Can run both on same element — call Splitting first, then SplitText |
| Three.js | 0.183.0 | r170 (current) | Breaking changes between r170 → r183: check [migration guide](https://github.com/mrdoob/three.js/releases/tag/r177) for r177+ changes |
| OGL | 0.0.103 | ESM only | Must load as `type="module"` — ensure animations.js is also a module or use a wrapper |

---

## Performance Budget

| Library | Minified Size | Load Strategy |
|---------|--------------|---------------|
| GSAP core | 71 KB | Sync (blocking — must be available before animations) |
| ScrollTrigger | 43 KB | Sync (required on all pages) |
| SplitText | 7.6 KB | Sync (required on all pages for text) |
| Flip | 25 KB | Sync (required on pages with layout transitions) |
| Observer | 9.8 KB | Sync |
| DrawSVG | 4.3 KB | Defer — only pages with SVG animations |
| MorphSVG | 20.7 KB | Defer — only pages with morphing |
| Lenis | ~8 KB | Sync (before GSAP) |
| Three.js | ~580 KB | `async` — non-blocking, init after DOM |
| OGL | ~24 KB | `type="module"` — only on pages with hover shaders |

**Total sync blocking budget (core): ~163 KB** — acceptable for a high-end creative studio site where visual quality is the primary product.

---

## Sources

- [GSAP GitHub Releases](https://github.com/greensock/GSAP/releases) — version 3.14.2 confirmed as latest
- [jsDelivr GSAP CDN page](https://www.jsdelivr.com/gsap) — all plugin CDN URLs confirmed
- [Lenis GitHub Releases](https://github.com/darkroomengineering/lenis/releases) — v1.3.18 confirmed (March 4, 2025)
- [Three.js GitHub Releases r183](https://github.com/mrdoob/three.js/releases/tag/r183) — r183/0.183.x confirmed latest (Feb 20, 2025)
- [Codrops: OGL WebGL Rotating Gallery](https://tympanus.net/codrops/2024/12/03/how-to-create-a-webgl-rotating-image-gallery-using-ogl-and-glsl-shaders/) — OGL pattern for DOM image effects
- [Codrops: VFX-JS WebGL Effects](https://tympanus.net/codrops/2025/01/20/vfx-js-webgl-effects-made-easy/) — emerging WebGL effect library
- [Codrops: GSAP + WebGL Shaders](https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/) — GSAP + Three.js shader integration pattern
- [Webflow Blog: SplitText Rewrite](https://webflow.com/blog/gsap-splittext-rewrite) — SplitText responsive auto-resplit confirmed
- [Awwwards WebGL Collection](https://www.awwwards.com/websites/webgl/) — Three.js dominance in winning sites confirmed
- [Born Digital: Smooth Scroll Comparison](https://www.borndigital.be/blog/our-smooth-scrolling-libraries) — ScrollSmoother vs Lenis tradeoffs
- [Three.js r171: WebGPU Production Ready](https://threejsroadmap.com/blog/tsl-a-better-way-to-write-shaders-in-threejs) — TSL and WebGPU readiness from r171+
- [curtainsjs npm](https://www.jsdelivr.com/package/npm/curtainsjs) — last published 2 years ago, confirming abandonment
- [OGL GitHub](https://github.com/oframe/ogl) — actively maintained, 24KB, ES module

---

*Stack research for: Awwwards-level creative animation overlay on vanilla HTML/CSS/JS static site*
*Researched: 2026-03-11*
