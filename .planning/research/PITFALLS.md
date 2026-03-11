# Pitfalls Research

**Domain:** Awwwards-level creative web animation (GSAP + Three.js + Lenis, vanilla JS, multi-page static site)
**Researched:** 2026-03-11
**Confidence:** HIGH (verified with GSAP official docs, MDN, Three.js forums, multiple community sources)

---

## Critical Pitfalls

### Pitfall 1: Layout Thrashing — Reading DOM Dimensions Inside Animation Loops

**What goes wrong:**
Calling `getBoundingClientRect()`, `offsetWidth`, `scrollTop`, or any layout-query API *inside* a `requestAnimationFrame` loop, followed immediately by a style write, forces the browser to synchronously recalculate layout every single frame. At 60fps, this is 60 forced reflows per second — the single most common cause of animation jank on complex sites.

**Why it happens:**
Developers check element sizes to calculate animation targets (e.g., pin offsets, parallax distances) and immediately apply transforms in the same callback. This read-then-write pattern inside a loop breaks the browser's ability to batch layout work.

**How to avoid:**
- Batch all DOM reads at the start of a frame, writes at the end
- Pre-calculate dimensions at init time and cache them; recalculate only on `resize`
- GSAP handles this internally for its own properties — only becomes a problem when mixing with raw DOM reads
- Use `ScrollTrigger.refresh()` for recalculation on resize events, not inside scroll handlers

**Warning signs:**
- Chrome DevTools Performance panel shows "Recalculate Style" and "Layout" blocks dominating frame time
- FPS drops when scrolling past animated sections even on desktop
- "Forced reflow while executing JavaScript" warnings in DevTools

**Phase to address:** Foundation/Architecture phase — establish the read-then-write pattern rule before any animation code is written

---

### Pitfall 2: ScrollTrigger Refresh Timing — Triggers Fire at Wrong Positions After Page Load

**What goes wrong:**
ScrollTrigger calculates `start`/`end` positions when the trigger is created. If images lack explicit dimensions, fonts haven't loaded, or dynamic content is injected after creation, the page height changes post-calculation. Result: triggers fire too early or too late, pinned sections misalign, and parallax effects jump.

**Why it happens:**
The page layout isn't stable when ScrollTrigger initializes. Images without `width`/`height` attributes collapse to 0px on load, then expand when loaded — shifting everything below them. Custom fonts render with fallback metrics until loaded, changing text block heights.

**How to avoid:**
- Always set explicit `width` and `height` on `<img>` elements to prevent layout shift
- Wrap all ScrollTrigger initialization inside `document.fonts.ready.then(...)` to wait for font layout stability
- Call `ScrollTrigger.refresh()` after any lazy-loaded content resolves
- Use `ScrollTrigger.addEventListener("refresh", callback)` for post-refresh adjustments
- Debounce resize handlers that call `ScrollTrigger.refresh()`

**Warning signs:**
- Animations that work on first load but break on soft reload
- Pinned sections that pin 100-200px too early or late
- Inconsistent trigger positions on pages with images vs. text-only pages

**Phase to address:** Every phase that creates ScrollTrigger instances — validate with images present and custom fonts loaded

---

### Pitfall 3: Nested ScrollTrigger Inside Timeline — The "Dual Control" Conflict

**What goes wrong:**
Adding `scrollTrigger: {...}` directly to tweens that are children of a GSAP timeline creates a logical conflict: the parent timeline's playhead controls child animations, but ScrollTrigger also tries to control the same tween via scroll position. Behavior becomes unpredictable — animations may replay, skip, or stick.

**Why it happens:**
It's visually intuitive to group related animations in a timeline and add scroll control to individual tweens. But GSAP's architecture means a tween can only have one master — the timeline OR the scroll trigger.

**How to avoid:**
- Apply `scrollTrigger` to the **timeline itself**, never to child tweens within that timeline
- For complex sequences needing scroll-driven reveal, use a single ScrollTrigger on the parent timeline
- Use separate timelines per scroll section rather than one mega-timeline with multiple scroll triggers inside

**Warning signs:**
- Animations that appear to reverse unexpectedly on scroll
- Specific tweens within a timeline that seem to ignore scroll trigger positioning
- `onEnter`/`onLeave` callbacks firing at inconsistent times

**Phase to address:** Hero animation phase, scroll-driven experience phase — establish this rule before building any scroll timeline

---

### Pitfall 4: Three.js Resource Disposal — GPU Memory Leaks on Navigation

**What goes wrong:**
Three.js scenes accumulate GPU memory because JavaScript garbage collection cannot reclaim GPU-allocated resources (geometries, textures, materials, render targets). Every `new THREE.BufferGeometry()`, `new THREE.Texture()`, and `new THREE.Material()` allocates GPU memory that persists until explicitly `.dispose()`d. On a multi-page site with page transitions, re-initializing Three.js on each "navigation" without cleanup causes progressive memory exhaustion — especially severe on mobile devices with limited VRAM.

**Why it happens:**
Developers treat Three.js objects like normal JavaScript objects and assume garbage collection handles cleanup. GPU resources live outside the JS heap and have no automatic lifecycle management.

**How to avoid:**
```javascript
// Required disposal pattern before navigation or scene teardown
function disposeScene(scene, renderer) {
  scene.traverse(object => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(m => {
          m.map?.dispose();
          m.dispose();
        });
      } else {
        object.material.map?.dispose();
        object.material.dispose();
      }
    }
  });
  renderer.dispose();
  renderer.forceContextLoss();
}
```
- Monitor GPU memory with `renderer.info.memory` during development
- Cancel animation loops with `cancelAnimationFrame(rafId)` before disposal
- Remove all event listeners before disposing

**Warning signs:**
- `renderer.info.memory.geometries` or `.textures` count growing over multiple page visits
- Browser tab memory (not JS heap, but total process memory) increasing over time in DevTools
- Mobile browser crashing after extended browsing session
- `WebGL: context lost` errors appearing in console

**Phase to address:** WebGL/Three.js phase — implement disposal pattern from day one, not as a retrofit

---

### Pitfall 5: WebGL Context Loss on Mobile Safari

**What goes wrong:**
iOS Safari aggressively reclaims WebGL contexts when the user backgrounds the app, locks the device, or when too many WebGL contexts exist simultaneously (Safari limits to ~8 contexts). When context is lost, the Three.js canvas goes black/blank. iOS 17+ and Safari 18.x have known context loss bugs that affect all WebGL content.

**Why it happens:**
Mobile GPUs have limited memory budgets. iOS enforces hard limits on WebGL contexts as a power/memory management strategy. The context loss event fires, but most implementations don't listen for it or attempt recovery.

**How to avoid:**
```javascript
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault(); // Signal intent to recover
  cancelAnimationFrame(rafId);
}, false);

canvas.addEventListener('webglcontextrestored', () => {
  initScene(); // Rebuild all GPU resources
}, false);
```
- Implement non-WebGL fallback (CSS gradient or video) that activates when WebGL is unavailable
- Use `renderer.domElement.getContext('webgl')?.isContextLost()` to check state
- Do not create more than one `WebGLRenderer` per page
- Lazy-initialize WebGL only when canvas enters viewport

**Warning signs:**
- Black canvas after switching apps on iPhone
- "WebGL: context lost" errors in iOS Safari console
- Works on desktop but blank canvas on mobile

**Phase to address:** WebGL initialization phase — implement context loss handling and fallback before any scene complexity is added

---

### Pitfall 6: Lenis + GSAP ScrollTrigger Integration Failure Points

**What goes wrong:**
Lenis intercepts native scroll events and emits its own virtual scroll position. GSAP ScrollTrigger, by default, reads from `window.scrollY`. Without explicit synchronization, ScrollTrigger reads stale/incorrect scroll values — triggers fire at wrong positions, pinning breaks, and scrub animations stutter.

Additionally, Lenis's RAF (requestAnimationFrame) loop and GSAP's ticker are two separate animation loops. Running both simultaneously causes double-frame processing — each frame runs Lenis physics AND GSAP updates, often misaligned.

**Why it happens:**
Both libraries own the "scroll → animation" pipeline. Without explicit proxy setup, they fight for control.

**How to avoid:**
```javascript
// Required Lenis + ScrollTrigger sync pattern
const lenis = new Lenis();

// Sync ScrollTrigger to Lenis scroll events
lenis.on('scroll', ScrollTrigger.update);

// Merge Lenis RAF into GSAP ticker (eliminates double loop)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0); // Prevent GSAP lag compensation from fighting Lenis easing
```
- NEVER use `requestAnimationFrame` directly alongside this setup — use GSAP's ticker as the single RAF source
- Call `ScrollTrigger.refresh()` AFTER Lenis initializes

**Warning signs:**
- Scroll-triggered animations that fire ~100-200px off from their intended trigger position
- Pinned sections that unpin too early or create gaps
- Jittery scrub animations that don't track scroll velocity smoothly
- `lagSmoothing` fighting Lenis momentum easing

**Phase to address:** Foundation phase — get the Lenis + ScrollTrigger sync working correctly before building any scroll-driven animations on top

---

### Pitfall 7: will-change Overuse — Memory Waste and Compositing Explosions

**What goes wrong:**
Adding `will-change: transform` or `will-change: opacity` to every animated element forces the browser to promote each one to its own compositing layer and pre-allocate GPU memory. On complex pages with dozens of animated elements, this can allocate hundreds of megabytes of GPU memory, causing layer promotion costs that exceed the animation performance gains. Mobile devices with limited VRAM become extremely sluggish or crash.

**Why it happens:**
Developers read "will-change promotes to GPU layer = fast" and apply it broadly. The nuance — that layer promotion has a memory cost and should only be active during animation — is often missed.

**How to avoid:**
- Apply `will-change` only immediately before animation starts, remove it after completion:
```javascript
element.style.willChange = 'transform';
gsap.to(element, {
  x: 100,
  onComplete: () => { element.style.willChange = 'auto'; }
});
```
- Prefer GSAP's `force3D: true` (applied per-animation) over persistent `will-change` in CSS
- Never apply `will-change` in global stylesheets to class selectors that match many elements
- Audit compositing layer count with Chrome DevTools Layers panel

**Warning signs:**
- Chrome DevTools Layers panel shows 50+ composited layers on a single page
- Device memory increases on every scroll without releasing
- Mobile GPU usage stays high even when no animations are playing
- Yellow warning squares in Chrome's "Paint Flashing" overlay

**Phase to address:** Every animation phase — establish will-change usage rules as a team convention

---

### Pitfall 8: Flash of Unstyled Content (FOUC) from `gsap.from()` Animations

**What goes wrong:**
Using `gsap.from({ opacity: 0 })` means the element renders at full opacity for one or two frames before GSAP's JavaScript initializes and sets opacity to 0 to begin the animation. Users see a flash of the fully-visible element before it fades/slides in. This is particularly jarring for hero text and page-load animations.

**Why it happens:**
HTML renders synchronously; GSAP initializes asynchronously after script parsing. There's always a gap between "element visible in DOM" and "GSAP sets initial state."

**How to avoid:**
- Use `gsap.set()` to apply initial states immediately when the script loads — before any timelines run
- Use `gsap.fromTo()` instead of `gsap.from()` so both start AND end states are explicit
- Apply CSS `visibility: hidden` or `opacity: 0` to animated elements, then let GSAP reveal them
- For critical hero elements, inline the initial opacity/transform in the HTML `style` attribute

**Warning signs:**
- Brief flash of content on page load before animations start
- Elements that "jump" to their animated position before sliding in
- Different behavior on fast vs. slow devices (more visible on fast machines that parse JS quickly)

**Phase to address:** Hero/loading animation phase — establish the initial-state convention before writing any from() animations

---

### Pitfall 9: SplitText Applied Before Fonts Load — Wrong Character Splitting

**What goes wrong:**
Running `SplitText.create()` (or Splitting.js) before custom fonts load causes the library to calculate character/word/line positions using the fallback system font metrics. When the custom font loads and reflows the text, the split positions are wrong — lines break in unexpected places, and animated text appears misaligned or wraps incorrectly.

**Why it happens:**
Custom fonts load asynchronously. DOM is ready before fonts are ready. Most text animation code runs on `DOMContentLoaded`, which fires before fonts load.

**How to avoid:**
```javascript
document.fonts.ready.then(() => {
  const split = SplitText.create('.headline', { type: 'lines,words,chars' });
  // animations using split.lines, split.words, split.chars
});
```
- Use GSAP SplitText's `autoSplit: true` with `onSplit` callback pattern for responsive re-splitting
- Test specifically with network throttling to simulate slow font loads
- Add CSS `font-display: block` for animation-critical fonts to prevent FOUT during split

**Warning signs:**
- Text animations that look correct in development but break in production (CDN fonts load slower)
- Line-based animations where lines don't align with visible text lines
- Different split results on page refresh vs. first load

**Phase to address:** Text animation system phase — implement `document.fonts.ready` wrapping as the standard pattern for all text animations

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| One giant `shared.js` for all animations | Simple deployment | Impossible to debug, entire file loads on every page, one error breaks everything | Never — this project already has this problem, must be addressed |
| Hard-coded `start: "top 80%"` values | Quick to write | Breaks on different viewport sizes, requires manual updates everywhere | Never for viewport-relative values — always use function syntax |
| CSS `@keyframes` + GSAP on same property | Combines tools | Specificity wars, unpredictable behavior, CSS wins at wrong times | Never — use one system per property |
| `ScrollTrigger.refresh()` on every resize event | Simple fix | Causes layout thrashing at 60fps during resize | Never — debounce to 250ms minimum |
| `will-change: transform` in global CSS | Easy to add | GPU memory exhausted on pages with many elements | Only for single-element cases during active animation |
| No Three.js disposal | Less code | Progressive VRAM leak, mobile crashes, context loss | Never on multi-page sites |
| `gsap.from()` without pre-set initial state | Fewer lines | FOUC on page load — professional sites cannot have this | Never for above-the-fold elements |
| CDN dependencies without SRI hashes | Zero effort | CDN compromise injects malicious scripts | Acceptable for dev/staging, never for production |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Lenis + ScrollTrigger | Running both in separate `requestAnimationFrame` loops | Merge Lenis RAF into GSAP ticker; set `lagSmoothing(0)` |
| Lenis + ScrollTrigger | Not calling `ScrollTrigger.update` on Lenis scroll events | `lenis.on('scroll', ScrollTrigger.update)` required |
| GSAP + CSS transitions | Animating the same property (e.g., `transform`) in both | Use GSAP exclusively for transform/opacity; use CSS only for properties GSAP doesn't touch |
| Three.js + page transitions | Destroying WebGLRenderer without disposing scene resources first | Traverse scene and dispose all geometries, materials, textures before `renderer.dispose()` |
| SplitText + custom fonts | Initializing before `document.fonts.ready` resolves | Always wrap in `document.fonts.ready.then(...)` |
| ScrollTrigger + Lenis pinning | Pinning conflicts when Observer plugin is combined with Lenis | Test all pin scenarios explicitly; consider using native scroll for pinned sections |
| Multiple ScrollTrigger pins | Creation order misalignment | Create pinned ScrollTriggers in page-top-to-bottom order; use `refreshPriority` when forced out of order |
| GSAP timelines + ScrollTrigger | Applying scrollTrigger to child tweens inside a parent timeline | Apply `scrollTrigger` only to the parent timeline, never to its children |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Layout thrashing in scroll handlers | FPS drops to 30fps+ during scroll on desktop | Batch DOM reads before writes; never read layout properties in scroll callbacks | Immediately — any page with multiple animated elements |
| Animating non-compositable properties (width, height, margin, top, left) | Chrome paint flashing shows green overlay on animated elements; jank visible at 30fps | Only animate `transform` and `opacity`; never animate layout properties for motion effects | Any device; most severe on mobile |
| Particle system running at full resolution on mobile | Mobile battery drain, thermal throttling after 30s, GPU crash | Detect device capability (pixel ratio, memory); reduce particle count by 70% on mobile | Mid-range Android devices immediately |
| Three.js rendering at device pixel ratio > 1.5 | Memory spike, render time > 16ms per frame | Cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))` | Retina iPhones with complex scenes |
| ScrollTrigger refresh on every window resize event | Jank during window resize; excessive CPU during dev tools responsive testing | Debounce resize handler to 250ms; use `matchMedia` for breakpoint-specific changes | During development mostly — but users on tablet in rotation |
| Unremoved event listeners after Three.js scene teardown | Memory grows each page visit; orphaned callbacks affect performance of new scenes | Track all listeners with array; remove on scene teardown | After 3-5 page navigations on mobile |
| `IntersectionObserver` at 15% threshold with complex animations | Animations trigger before element is meaningfully visible; appears glitchy | Use 25-50% threshold; add rootMargin to give elements time to enter viewport before animating | Pages with fast-scrolling users |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Scroll jacking — overriding native scroll speed/direction | 35%+ of users find it disorienting; extreme accessibility problem for vestibular disorder sufferers; NN/g rates it as "usability nightmare" | Use Lenis for *easing* not speed-changing; never alter scroll direction; keep effective scroll velocity within 20% of native speed |
| Animation durations > 400ms for UI feedback | Feels sluggish; users perceive interaction as "broken" | Keep micro-interactions (hover, click) under 200ms; scroll-driven reveals under 400ms; opening sequences under 700ms |
| Every element animates on scroll | Cognitive overload; users can't find CTAs; content feels unstable | Animate 20-30% of elements; key hierarchy items only; static elements provide visual anchor |
| Parallax on every section | Motion sickness; particularly problematic for 35%+ of adults with vestibular issues | Use parallax sparingly (1-2 hero sections max); keep parallax multiplier subtle (0.1-0.3 range) |
| No `prefers-reduced-motion` support | Excludes users with vestibular disorders, ADHD, or epilepsy; potential WCAG 2.1 Level AAA violation | Implement globally: `@media (prefers-reduced-motion: reduce)` and GSAP `matchMedia` pattern; test with system setting enabled |
| Cursor replacement that breaks touch devices | Invisible cursor or cursor stuck on touch screens; confusing UX on hybrid devices | Always check `window.matchMedia('(pointer: coarse)')` before initializing custom cursor; disable entirely on touch |
| Text animations that obstruct reading | Users cannot read content while animation is playing; returns users may wait through animations they've seen | Respect `prefers-reduced-motion`; consider "skip intro" pattern; ensure text is readable within 500ms of entering viewport |
| Horizontal scroll sections without visual affordance | Users don't discover horizontal content; confusing with browser back-gesture conflict on mobile | Provide clear visual indicators (arrows, progress bar); test extensively on mobile Safari where horizontal scroll conflicts with navigation gestures |

---

## "Looks Done But Isn't" Checklist

- [ ] **Lenis + ScrollTrigger sync:** Both are running but triggers fire at wrong positions — verify `lenis.on('scroll', ScrollTrigger.update)` AND `gsap.ticker.add` RAF merge are implemented
- [ ] **prefers-reduced-motion:** Animations work on developer machine but accessibility feature never tested — enable in OS settings and verify all animations pause/simplify
- [ ] **Mobile GPU memory:** Three.js scene looks fine on desktop but never tested for context loss — must test on actual iPhone with backgrounding + restore cycle
- [ ] **Font loading timing:** SplitText animations look correct in dev (fonts cached) but break in production (fonts load async) — test with DevTools network throttling and cache disabled
- [ ] **ScrollTrigger positions with images:** Trigger positions verified without images loaded; actual positions will shift — test with cold cache and verify with Chrome Performance panel
- [ ] **Multi-language sync:** Animation works on `en/index.html` but changes not replicated to `cn/index.html` and `id/index.html` — this project has 3x all pages
- [ ] **Three.js disposal:** Scene initializes correctly but memory never tested across multiple page transitions — use `renderer.info.memory` to verify counts drop after navigation
- [ ] **CDN failure fallback:** All animations rely on external CDN; no fallback tested — disable network for CDN domains and verify graceful degradation
- [ ] **Touch device interactions:** Custom cursor and magnetic buttons tested on laptop; never tested on iPhone/Android touchscreen — test on real devices
- [ ] **Keyboard navigation:** All focus states still work after GSAP/CSS animations complete — verify tab order and focus visibility are unaffected by transforms

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Layout thrashing discovered late | MEDIUM | Audit all scroll/resize handlers with Chrome Performance panel; extract all `getBoundingClientRect` calls to init-time caches |
| ScrollTrigger positions all wrong post-launch | LOW | Add `ScrollTrigger.refresh()` call after `window.onload`; add `width`/`height` to all `<img>` tags; verify fonts.ready wrapper |
| Three.js VRAM leak causing mobile crashes | HIGH | Requires systematic scene teardown audit; must add disposal to every navigation path; may require refactoring scene ownership architecture |
| Lenis + ScrollTrigger fighting each other | MEDIUM | Add the standard sync boilerplate (3 lines); verify with `console.log` that `ScrollTrigger.update` fires on every Lenis scroll event |
| FOUC visible in hero on slow connections | LOW | Add `gsap.set()` calls for all initial states immediately after script loads; move critical initial states to inline `style` attributes |
| SplitText wrong on production fonts | LOW | Wrap entire text animation init in `document.fonts.ready.then()`; single change, affects all text animations |
| will-change memory exhaustion on mobile | MEDIUM | Grep codebase for `will-change` in CSS; audit all usages; convert to GSAP-managed `will-change` that applies/removes per animation |
| No prefers-reduced-motion support | LOW | Add single GSAP `matchMedia` block and CSS `@media (prefers-reduced-motion: reduce)` rule; implement once in shared foundation |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Lenis + ScrollTrigger sync failure | Phase 1: Foundation & Scroll Infrastructure | Verify with console.log that ScrollTrigger.update fires on Lenis scroll; test 3 different scroll-triggered animations |
| ScrollTrigger refresh timing (images/fonts) | Phase 1: Foundation & Scroll Infrastructure | Test with DevTools cache disabled; verify trigger positions match visual expectations |
| FOUC from gsap.from() | Phase 1: Foundation & Scroll Infrastructure | Test on Chrome with CPU throttling 4x; no flash visible before animations start |
| will-change overuse | Phase 1 convention + all phases | Layers panel shows < 20 compositing layers per page during idle |
| Layout thrashing in scroll handlers | Phase 1 + Phase 2: Scroll-Driven Experiences | Chrome Performance panel: no "Forced reflow" warnings during scroll |
| Three.js resource disposal | Phase 3: WebGL/Shader Backgrounds | `renderer.info.memory.geometries` drops to 0 after navigation away from Three.js page |
| WebGL context loss on mobile | Phase 3: WebGL/Shader Backgrounds | Test on iPhone: background app, return, scene still renders (or fallback shows) |
| Nested ScrollTrigger in timeline | Phase 2: Scroll-Driven Experiences | No unexpected animation reversals or skips during scroll testing |
| SplitText font timing | Phase 4: Text Animation System | Test production URL with DevTools network throttling; lines split correctly |
| prefers-reduced-motion missing | Phase 1 convention + verified every phase | Enable "Reduce Motion" in macOS/iOS settings; all animations pause or simplify gracefully |
| Multi-language animation sync | Every phase — enforced at commit time | After every animation addition, verify en/cn/id versions are identical |
| Over-animation cognitive overload | Phase 5: Polish & Integration | User test — content is scannable and CTAs are immediately visible without waiting for animations |
| Parallax-induced motion sickness | Phase 2: Scroll-Driven Experiences | Parallax multiplier never exceeds 0.3; vestibular-safe test with reduced-motion enabled |
| CDN dependency failure | Phase 1: Foundation & Scroll Infrastructure | Block CDN domains in DevTools; verify page degrades gracefully (not blank) |
| Custom cursor on touch devices | Phase 6: Cursor System | Test on real iPhone and Android; no invisible cursor, no stuck magnetic states |

---

## Sources

- [GSAP ScrollTrigger Common Mistakes — Official Docs](https://gsap.com/resources/st-mistakes/)
- [Performant Web Animations — Awwwards](https://www.awwwards.com/inspiration/performant-web-animations-and-interactions-achieving-60-fps)
- [Web Animation Performance Tier List — Motion Dev Magazine](https://motion.dev/magazine/web-animation-performance-tier-list)
- [Animation Performance and Frame Rate — MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)
- [Three.js Memory Leaks — MindfulChase](https://www.mindfulchase.com/explore/troubleshooting-tips/frameworks-and-libraries/fixing-performance-drops-and-memory-leaks-in-three-js-applications.html)
- [Why Your Three.js App Eats GPU Memory — Medium](https://ritik-chopra28.medium.com/why-your-three-js-app-is-secretly-eating-gpu-memory-and-how-to-stop-it-fe8ca6b2f72d)
- [WebGL Context Loss: Apple Developer Forums](https://developer.apple.com/forums/thread/737042)
- [Non-Intrusive WebGL — Matt DesLauriers](https://medium.com/@mattdesl/non-intrusive-webgl-cebd176c281d)
- [Lenis + GSAP ScrollTrigger Performance Issue on Mobile](https://github.com/darkroomengineering/lenis/discussions/431)
- [GSAP In Practice: Avoid The Pitfalls — Marmelab](https://marmelab.com/blog/2024/05/30/gsap-in-practice-avoid-the-pitfalls.html)
- [SplitText Font Loading Issues — GSAP Docs](https://gsap.com/docs/v3/Plugins/SplitText/)
- [Understanding WCAG 2.3.3 — Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [Designing Safer Web Animation for Motion Sensitivity — A List Apart](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/)
- [Scrolljacking 101 — Nielsen Norman Group](https://www.nngroup.com/articles/scrolljacking-101/)
- [Preventing Layout Thrashing — Wilson Page](https://wilsonpage.uk/preventing-layout-thrashing/)
- [Forced Reflow Guide — Red Surge Technology (2025)](https://redsurgetechnology.com/blog/2025/july/forced-reflow-guide)
- [7 Must-Know GSAP Animation Tips — Codrops (2025)](https://tympanus.net/codrops/2025/09/03/7-must-know-gsap-animation-tips-for-creative-developers/)
- [How Too Many Animations Ruin UX — Medium](https://medium.com/@sikirus81/how-too-many-animations-ruin-user-experience-a2eb7040c1a8)
- [will-change and Memory — WebGL Best Practices — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)

---
*Pitfalls research for: Awwwards-level creative web animation (GSAP + Three.js + Lenis + vanilla JS multi-page static site)*
*Researched: 2026-03-11*
