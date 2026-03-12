---
phase: 03-scroll-experiences
plan: "01"
status: complete
duration: 5 min
started: 2026-03-12
completed: 2026-03-12
commits: 1
---

# Plan 03-01 Summary: Scroll Experience Modules

## What was built

Four new animation modules that transform passive scrolling into a tactile, premium experience:

1. **scroll-reveals.js** — Clip-path geometric wipe reveals for images
   - Photo panels: top-to-bottom inset wipe with stagger
   - Capability card images: left-to-right polygon wipe
   - History background: diagonal polygon reveal
   - Touch devices: simplified opacity fades (no clip-path jank)

2. **parallax.js** — Scroll-driven parallax depth layers
   - Hero background layers move at 4 different speeds (30/20/15/10 yPercent)
   - History section background: subtle -15 yPercent offset
   - Sub-hero sections: 8 yPercent parallax
   - Coexists with existing mouse-follow parallax in inline JS

3. **scroll-skew.js** — Velocity-based skew effect
   - Reads Lenis scroll velocity via onScroll event
   - Applies proportional skewY (clamped to 4 degrees max)
   - Elastic ease return when scroll slows (satisfying bounce back)
   - will-change applied only during active skew

4. **scroll-progress.js** — Fixed scroll progress indicator
   - 3px green bar at top of viewport
   - GSAP ScrollTrigger-based tracking with native scroll fallback
   - Accessible: role=progressbar with live aria-valuenow
   - NOT gated by reduced motion (informational UI element)

## Key files

### Created
- `assets/animation/scroll-reveals.js` (171 lines)
- `assets/animation/parallax.js` (152 lines)
- `assets/animation/scroll-skew.js` (161 lines)
- `assets/animation/scroll-progress.js` (112 lines)

### Modified
- `assets/shared.css` — Added `.rr-scroll-progress` CSS
- All 27 HTML pages — Added 4 new script tags after scroll-text.js

## Decisions

- Clip-path animations use `polygon()` for diagonal reveals and `inset()` for top-to-bottom reveals
- Touch devices get simplified opacity fades instead of clip-path to avoid GPU jank
- Scroll parallax coexists with existing mouse parallax — different transform properties
- Progress bar not gated by reduced motion since it's informational, not decorative

## Self-Check: PASSED
- All 4 module files exist and register with window.RR
- All 27 pages have all 4 script tags with correct paths
- CSS for progress bar added to shared.css
- Reduced motion, coarse pointer, and CDN graceful degradation gates present

## Issues
None.
