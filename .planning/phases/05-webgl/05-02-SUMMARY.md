---
phase: 05-webgl
plan: "02"
status: complete
duration: 4 min
started: 2026-03-12
completed: 2026-03-12
commits: 2
---

# Plan 05-02 Summary: Card Clip-Path Reveals and 3D Tilt Hover System

## What was built

1. **card-effects.js** — Card reveal + tilt module (212 lines)
   - Clip-path scroll reveal: cards enter with inset(100% 0 0 0) to inset(0% 0 0 0) staggered left-to-right (0.12s each)
   - ScrollTrigger on .caps-grid at top 85% (once: true)
   - 3D tilt: rotateX/rotateY following mouse position, max ±8 degrees
   - transformPerspective: 800 applied per card via GSAP
   - Inner .cap-card-img shifts opposite (x/y * -10px) for parallax depth
   - Elastic ease (elastic.out(1, 0.5)) spring-back on mouse leave
   - Touch device gate: no tilt on coarse pointer / no hover
   - will-change: transform added during interaction, removed on settle

2. **Card 3D CSS** added to shared.css
   - preserve-3d on .cap-card
   - translateZ(20px) on .cap-card-info for depth during tilt
   - Desktop hover: enhanced box-shadow (25px 60px)
   - Touch devices: transform-style: flat (no 3D)

## Key files

### Created
- `assets/animation/card-effects.js` (212 lines)

### Modified
- `assets/shared.css` — Card 3D CSS, touch device overrides
- `index.html` — card-effects.js script tag
- `cn/index.html` — card-effects.js script tag
- `id/index.html` — card-effects.js script tag

## Decisions

- Card-level clip-path reveal at `top 85%` fires slightly before scroll-reveals.js cap-card-img wipe at `top 80%` — creates layered reveal
- Only GPU-compositable properties: rotateX, rotateY, opacity, x, y — no filter:blur or layout triggers
- Card effects only loaded on 3 index pages (not all 27) since cap-cards only exist there
- Elastic ease on leave (not power3) for satisfying physical spring-back
- overwrite: 'auto' prevents GSAP tween stacking during rapid mousemove

## Self-Check: PASSED
- card-effects.js: RR.register, clipPath, rotateX/rotateY, transformPerspective, isCoarsePointer, mousemove, ScrollTrigger, clearProps
- card-effects.js on all 3 index pages
- CSS: preserve-3d, translateZ present in shared.css

## Issues
None.
