---
phase: 04-cursor-nav
plan: "02"
status: complete
duration: 4 min
started: 2026-03-12
completed: 2026-03-12
commits: 1
---

# Plan 04-02 Summary: Navbar Smart Scroll, Mobile Menu Timeline, and Page Transitions

## What was built

Three navigation animation modules replacing the basic CSS toggle and scroll behaviors:

1. **navbar.js** — Smart scroll hide/show (161 lines)
   - Hides navbar on scroll-down with gsap.to yPercent:-100
   - Reveals navbar on scroll-up with gsap.to yPercent:0
   - Uses Lenis scroll events with window scroll fallback
   - 10px scroll threshold prevents jitter
   - Won't hide during first 2.5s (hero entrance) or when mobile menu is open
   - Preserves existing .scrolled class for frosted glass background

2. **mobile-menu.js** — Coordinated GSAP timeline (248 lines)
   - Open: panel slides from translateX(100%), links stagger in (opacity+x, 0.06s stagger)
   - Close: links fade simultaneously, panel slides out (faster than open)
   - Hamburger spans animate to X shape (rotation + translate)
   - Lenis scroll lock during menu open
   - Clones hamburger button to cleanly remove old shared.js handler
   - Close on outside click, ESC key, nav link click

3. **page-transition.js** — Clip-path overlay (139 lines)
   - Exit: green wipe covers viewport from left (0.45s)
   - Entry: green wipe reveals from right on page load (0.5s)
   - Capture-phase click handler prevents old transition from double-firing
   - 3-second safety timeout prevents stuck green screen
   - Different sessionStorage key ('rr_page_wipe') from old system

## Key files

### Created
- `assets/animation/navbar.js` (161 lines)
- `assets/animation/mobile-menu.js` (248 lines)
- `assets/animation/page-transition.js` (139 lines)

### Modified
- `assets/shared.css` — Added rr-page-transition, rr-nav-hidden, mobile menu GSAP CSS
- All 27 HTML pages — Added 3 new script tags after hover-effects.js

## Decisions

- Hamburger button cloned to cleanly remove old shared.js event listeners
- Capture-phase click handler for page transition prevents double-firing
- Navbar uses Lenis scroll events for consistency with smooth scroll engine
- Mobile menu timeline is asymmetric: staggered open (0.5s), simultaneous close (0.35s)
- Page transition uses different sessionStorage key and DOM element than old system

## Self-Check: PASSED
- navbar.js: RR.register, yPercent, direction detection, Lenis integration
- mobile-menu.js: timeline, stagger, hamburger, aria, translateX
- page-transition.js: clipPath, rr-page-transition, sessionStorage, isTransitioning
- All 27 pages have navbar.js, mobile-menu.js, page-transition.js
- CSS rules present in shared.css

## Issues
None.
