---
phase: 06-polish-parity
plan: 06-01
title: Multi-language animation parity audit and mobile performance optimization
status: complete
started: 2026-03-12
completed: 2026-03-12
duration: 5 min
---

# Summary: 06-01 Multi-language Animation Parity Audit & Mobile Performance Optimization

## What Was Built

Audited and optimized the animation system across all 27 HTML pages (EN/CN/ID) for parity, performance, and mobile correctness.

## Task Results

### Task 1: Script tag parity audit
**Status:** Verified — no changes needed.
All 27 HTML pages already have identical animation script tags with correct relative paths (`../` for cn/, id/ pages; `../../` for cn/capabilities/, id/capabilities/ pages). The index pages correctly include `webgl-bg.js` and `card-effects.js` while non-index pages correctly omit them. No language-specific selectors found in any animation module.

### Task 2: will-change CSS cleanup
**Status:** Complete — 14 static will-change declarations removed.
- Removed `will-change` from: scroll-progress bar (old), cursor-dot, cursor-ring, cursor-label, rr-cursor-dot, rr-cursor-ring, rr-cursor-label, page-transition (x2), .btn, .magnetic, .img-reveal img, .aurora-blob, h1 .char/.word, .cap-hover-img
- Added `@media (pointer: fine) and (hover: hover)` block for cursor element GPU promotion
- Kept `will-change` on: .marquee-track (continuously animated), .rr-scroll-progress (continuously updated), mobile reset blocks (safety nets)
- Went from ~20 static declarations down to 5 intentional ones

### Task 3: GPU-compositable property audit
**Status:** Verified — no violations found.
All GSAP animation modules use only `transform` (x, y, scale, rotate, skew, yPercent), `opacity`, and `clipPath`. No layout-triggering properties (width, height, top, left, margin, padding) in any animation call.

### Task 4: Mobile/coarse-pointer guard verification
**Status:** Verified — all guards already in place.
- parallax.js: isCoarsePointer guard, returns early
- scroll-skew.js: isCoarsePointer guard, returns early
- webgl-bg.js: isCoarsePointer + pointer:coarse guard, returns early
- cursor.js: isCoarsePointer + pointer:coarse + hover:none guard
- magnetic.js: isCoarsePointer + pointer:coarse + hover:none guard
- card-effects.js: tilt gated behind touch detection; scroll reveals still work
- hover-effects.js: isCoarsePointer + pointer:coarse + hover:none guard
- scroll-reveals.js: simplified opacity reveals on coarse pointer (not disabled)
- section-choreography.js: no coarse-pointer gate (works on all devices as intended)

## Key Files

### Modified
- `assets/shared.css` — will-change cleanup, cursor GPU promotion gated behind pointer:fine

### Verified (no changes needed)
- All 27 HTML pages — script tag parity confirmed
- All 20 animation modules in `assets/animation/` — GPU-compositable properties only, proper mobile guards

## Deviations

None. All existing code already met parity and guard requirements. Only CSS will-change cleanup was needed.

## Self-Check: PASSED
- [x] All must_haves verified
- [x] Committed changes
- [x] No regressions introduced
