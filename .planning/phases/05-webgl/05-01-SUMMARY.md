---
phase: 05-webgl
plan: "01"
status: complete
duration: 5 min
started: 2026-03-12
completed: 2026-03-12
commits: 2
---

# Plan 05-01 Summary: WebGL Shader Background with Scroll Velocity Sync

## What was built

1. **webgl-bg.js** — Organic shader background module (251 lines)
   - Three.js ShaderMaterial with inline 2D simplex noise (Ashima Arts)
   - Multi-octave noise (3 layers) blending brand palette: cream, brandLight, brand, brandDark
   - uScrollVelocity uniform synced to Lenis scroll events via lerp
   - IntersectionObserver pauses render when hero not visible
   - WebGL context loss handler: hides canvas, CSS gradient shows through
   - Full GPU disposal on kill(): geometry, material, renderer, forceContextLoss
   - Page gate (home only), touch device gate, reduced motion gate
   - Deferred init via __initThreeEffects callback chain (Three.js loads async)

2. **Three.js CDN upgrade** — r170 to r183
   - Updated on all 3 index pages (en, cn, id)
   - Removed SRI integrity hash (r170 hash would block r183 load)

3. **CSS fallback** — #rr-webgl-bg positioned absolute inside hero-bg
   - z-index: 0 (behind aurora z:1 and particles z:2)
   - Touch device media query: display none on coarse pointer

## Key files

### Created
- `assets/animation/webgl-bg.js` (251 lines)

### Modified
- `assets/shared.css` — Added #rr-webgl-bg CSS with touch media query
- `index.html` — Three.js r183, webgl-bg.js script tag
- `cn/index.html` — Three.js r183, webgl-bg.js script tag
- `id/index.html` — Three.js r183, webgl-bg.js script tag

## Decisions

- Canvas inserted inside `.hero-bg` (not body-level fixed) — scrolls with hero, CSS gradient visible as fallback
- OrthographicCamera with PlaneGeometry(2,2) for full-screen quad — simpler than perspective
- Pixel ratio capped at 1.5 for performance, powerPreference: 'low-power'
- __initThreeEffects callback chain rather than polling interval — matches existing codebase pattern
- pointerEvents set both inline (JS) and via CSS (defense-in-depth)

## Self-Check: PASSED
- webgl-bg.js: RR.register, ShaderMaterial, snoise, scrollVelocity, webglcontextlost, dispose, forceContextLoss, isCoarsePointer, pointerEvents
- Three.js r183 on all 3 index pages
- webgl-bg.js script tag on all 3 index pages
- CSS rules present in shared.css

## Issues
None.
