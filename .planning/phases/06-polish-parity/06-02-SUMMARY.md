---
phase: 06-polish-parity
plan: 06-02
title: Horizontal scroll showcase with GSAP pin-scrub and final integration audit
status: complete
started: 2026-03-12
completed: 2026-03-12
duration: 5 min
---

# Summary: 06-02 Horizontal Scroll Showcase & Final Integration Audit

## What Was Built

Created the horizontal scroll showcase module for capabilities cards and performed a full integration audit of all Phase 6 success criteria.

## Task Results

### Task 1: Create horizontal-showcase.js module
**Status:** Complete.
- Created `assets/animation/horizontal-showcase.js` following RR module pattern (IIFE, strict mode, init/kill/refresh, RR.register)
- Pin-scrub: `.caps-section` pins at viewport top, `.caps-grid` slides left through 5 cards
- Desktop: `scrub: 0.5` for polish feel, `anticipatePin: 1` for smooth entry, `invalidateOnRefresh: true` for resize safety
- Mobile gate: exits early on `isCoarsePointer` — vertical grid layout preserved
- Reduced motion gate: exits early — no pin-scrub
- will-change lifecycle: applied via `onToggle` callback only during active pin, removed on unpin
- CSS: Added `.caps-section.is-horizontal` styles with flex layout, mobile override via `@media (pointer: coarse)`

### Task 2: Wire horizontal-showcase.js into all index pages
**Status:** Complete.
- Added script tag to `index.html`, `cn/index.html`, `id/index.html`
- Positioned after `section-choreography.js`, before `cursor.js` (scroll module ordering)
- Module self-registers — no additional wiring needed

### Task 3: Final integration audit
**Status:** All 5 Phase 6 success criteria pass.

**SC1: Multi-language parity**
- All 9 page types x 3 languages = 27 pages have identical animation scripts
- data-page attributes match across all language variants
- No language-specific selectors in any animation module

**SC2: 60fps scroll performance**
- All 23 GSAP animation calls use GPU-compositable properties only (transform, opacity, clipPath)
- No layout-triggering properties animated
- Lenis ticker syncs with GSAP for single RAF loop

**SC3: Mobile simplified variants**
- parallax, scroll-skew, webgl-bg, cursor, magnetic, horizontal-showcase: all gate behind isCoarsePointer
- scroll-reveals: simplified opacity-only mode on coarse pointer
- section-choreography: works on all devices (no gate)

**SC4: will-change absence on idle elements**
- 14 static will-change declarations removed from shared.css
- 7 inline will-change declarations removed from index pages (EN, CN, ID)
- Cursor will-change gated behind @media (pointer: fine)
- JS modules (scroll-skew, card-effects, horizontal-showcase) manage will-change lifecycle dynamically

**SC5: Horizontal scroll showcase**
- horizontal-showcase.js implements pin-scrub with ScrollTrigger
- Smooth scrub, clean unpin, no layout shift
- Mobile: vertical grid fallback

## Key Files

### Created
- `assets/animation/horizontal-showcase.js` — horizontal scroll showcase module

### Modified
- `assets/shared.css` — horizontal showcase CSS, will-change cleanup continuation
- `index.html` — script tag added, inline will-change removed
- `cn/index.html` — script tag added, inline will-change removed
- `id/index.html` — script tag added, inline will-change removed

## Deviations

Additional will-change cleanup was performed in index pages (EN/CN/ID) beyond the original plan scope — found inline will-change declarations that the 06-01 shared.css audit missed because they were in page-specific `<style>` blocks.

## Self-Check: PASSED
- [x] All must_haves verified
- [x] All tasks committed
- [x] All 5 Phase 6 success criteria pass
