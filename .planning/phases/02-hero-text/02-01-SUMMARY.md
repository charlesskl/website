---
phase: 02-hero-text
plan: "01"
subsystem: ui
tags: [gsap, splittext, hero-timeline, preloader-handoff, text-animation, reduced-motion]

# Dependency graph
requires: [01-foundation]
provides:
  - "window.RR.textSystem with split/killAll/resplitAll API wrapping GSAP SplitText"
  - "SplitText mask:'overflow' infrastructure for masked character/word reveals"
  - "Auto-resplit on debounced resize for responsive text reflow"
  - "Hero master timeline module with preloader handoff on homepage"
  - "SplitText char-by-char masked stagger on hero headlines across all 27 pages"
  - "CDN graceful degradation for SplitText (fallback to opacity/y tweens)"
affects: [02-02-scroll-text, 03-scroll-experiences, 06-polish-parity]

# Tech tracking
tech-stack:
  added: [gsap-splittext@3.14.2]
  patterns: [splittext-mask-overflow, fonts-ready-gating, mutation-observer-preloader-handoff, page-specific-selector-map]

key-files:
  created:
    - assets/animation/text-system.js
    - assets/animation/hero.js
  modified:
    - index.html
    - about.html
    - contact.html
    - careers.html
    - capabilities/costume.html
    - capabilities/dolls.html
    - capabilities/plastic-toys.html
    - capabilities/plush.html
    - capabilities/rc-vehicle.html
    - cn/index.html
    - cn/about.html
    - cn/contact.html
    - cn/careers.html
    - cn/capabilities/costume.html
    - cn/capabilities/dolls.html
    - cn/capabilities/plastic-toys.html
    - cn/capabilities/plush.html
    - cn/capabilities/rc-vehicle.html
    - id/index.html
    - id/about.html
    - id/contact.html
    - id/careers.html
    - id/capabilities/costume.html
    - id/capabilities/dolls.html
    - id/capabilities/plastic-toys.html
    - id/capabilities/plush.html
    - id/capabilities/rc-vehicle.html

key-decisions:
  - "SplitText CDN loaded at 3.14.2 version (base GSAP remains at page-specific version for backward compatibility)"
  - "MutationObserver on #brandLoader for preloader handoff (avoids modifying shared.js)"
  - "Page-specific selector map in hero.js handles different hero HTML structures across page types"
  - "Inline heroEntrance() removed from all 27 pages — centralized in hero.js module"

patterns-established:
  - "window.RR.textSystem.split() wraps SplitText.create() with document.fonts.ready gating"
  - "mask:'overflow' on SplitText creates overflow:hidden wrappers for masked reveals"
  - "Hero master timeline: paused → built → play() after preloader exit or immediately on non-homepage"
  - "MutationObserver watches for 'exit-bg' class on #brandLoader for seamless preloader-to-hero handoff"

requirements-completed: [HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, TEXT-01, TEXT-04]

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 2 Plan 01: Hero Master Timeline & SplitText System

**SplitText infrastructure and hero opening sequence master timeline with preloader handoff, masked character reveals, and centralized hero entrance across all 27 pages**

## Performance

- **Duration:** 5 min
- **Tasks:** 2 (both auto)
- **Files modified:** 29 (2 created + 27 modified)

## Accomplishments
- Created text-system.js providing window.RR.textSystem with split/killAll/resplitAll API wrapping GSAP SplitText with mask:'overflow' and document.fonts.ready gating
- Created hero.js with single master timeline for hero entrance: preloader handoff via MutationObserver on homepage, SplitText char-by-char masked stagger on headlines, coordinated tag/subtitle/CTA/scroll-hint entrance under 2.5s
- Added SplitText CDN (3.14.2) to all 27 HTML pages after ScrollTrigger
- Wired text-system.js and hero.js script tags into all 27 pages
- Removed inline heroEntrance() functions from all pages (centralized in hero.js)
- Both modules include reduced motion gate (instant reveal, no animation) and CDN graceful degradation

## Files Created/Modified
- `assets/animation/text-system.js` - SplitText wrapper with fonts.ready gating, auto-resplit on resize, CDN fallback
- `assets/animation/hero.js` - Hero master timeline, preloader handoff, page-specific selector map, reduced motion gate
- 27 HTML files - SplitText CDN, text-system.js/hero.js script tags, heroEntrance removed

## Deviations from Plan

- 11 pages (cn/capabilities/plush, cn/capabilities/rc-vehicle, and all 9 id/ pages) were not wired during initial plan execution and required completion during phase execution

## Issues Encountered

None

## Next Plan Readiness
- window.RR.textSystem.split() available for scroll-text.js to use for section heading reveals
- SplitText CDN loaded on all pages for scroll-triggered text animations

---
*Phase: 02-hero-text*
*Completed: 2026-03-12*
