---
phase: 03-scroll-experiences
plan: "02"
status: complete
duration: 4 min
started: 2026-03-12
completed: 2026-03-12
commits: 1
---

# Plan 03-02 Summary: Section Choreography

## What was built

A comprehensive section choreography module that replaces ALL remaining generic `data-reveal` fade-in animations with coordinated, section-level GSAP ScrollTrigger sequences.

### Section-specific choreographies

1. **Contact section** — label slides up first, then heading, paragraph, contact details stagger in 0.08s apart
2. **Editorial sections** (capability pages) — label enters, then intro block with green line drawing in, then features stagger from right (x:30)
3. **CTA sections** — heading → paragraph → button reveal sequentially with overlapping timing
4. **Value cards** (careers page) — cards stagger with slide-up + subtle scale (0.97→1)
5. **Generic fallback** — any remaining reveal-up/data-reveal elements get directional reveals

### Conflict avoidance

The module carefully checks each element before taking ownership:
- Elements with `.rr-word`/`.rr-line`/`.rr-char` children → owned by scroll-text.js → SKIP
- `#stmtAccent`, `#historyWatermark` → owned by text-scramble.js → SKIP
- Elements inside `.cap-card` → owned by capsReveal/scroll-reveals.js → SKIP
- `.stmt-line`, `#stmtLine`, `#stmtRule` → owned by statementEntrance → SKIP
- Elements inside hero containers → owned by hero.js → SKIP

### Old system neutralization

- animations.js `initScrollReveal()` now checks for GSAP availability and defers to section-choreography.js
- Original IntersectionObserver code preserved as CDN-failure fallback (FOUND-05)
- 3-second safety net force-reveals any element not yet handled
- `.rr-choreographed` CSS class disables CSS transitions on GSAP-managed elements

## Key files

### Created
- `assets/animation/section-choreography.js` (390 lines)

### Modified
- `assets/animations.js` — Added GSAP availability check, 3s safety net
- `assets/shared.css` — Added `.rr-choreographed` transition-disable rule
- All 27 HTML pages — Added section-choreography.js script tag

## Decisions

- Keep old IO system as fallback rather than removing it — ensures CDN failure graceful degradation
- 3-second safety net prevents any element from staying permanently hidden
- Check for SplitText child elements (.rr-word) rather than class names to detect scroll-text.js ownership

## Self-Check: PASSED
- section-choreography.js exists (390 lines, well above 100 min)
- Registers as 'sectionChoreography' with window.RR
- Uses scrollTrigger for all reveals
- Respects hasReducedMotion gate
- Handles reveal-up elements with stagger
- Present on all 27 HTML pages
- animations.js and shared.css properly modified

## Issues
None.
