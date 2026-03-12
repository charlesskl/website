---
phase: 02-hero-text
plan: "02"
subsystem: ui
tags: [gsap, splittext, scroll-trigger, text-animation, text-scramble, masked-reveal, reduced-motion]

# Dependency graph
requires: [02-01]
provides:
  - "Scroll-triggered masked word reveals for all section headings across all 27 pages"
  - "Matrix-style text scramble effect for #stmtAccent and #historyWatermark"
  - "scrollText module registered via window.RR.register with init/kill/refresh lifecycle"
  - "textScramble module registered via window.RR.register with init/kill/refresh lifecycle"
affects: [03-scroll-experiences, 06-polish-parity]

# Tech tracking
tech-stack:
  added: []
  patterns: [scroll-triggered-splittext-reveals, matrix-text-scramble, tabular-nums-layout-stability]

key-files:
  created:
    - assets/animation/scroll-text.js
    - assets/animation/text-scramble.js
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
  - "text-scramble.js owns #stmtAccent element entirely (accent animation removed from inline statementEntrance)"
  - "ScrollTrigger.create() used directly in text-scramble.js instead of timeline scrollTrigger config (standalone triggers)"
  - "Section labels use slightly earlier trigger (top 88%) and faster animation than section headings"
  - "tabular-nums applied during scramble to prevent layout shift from varying character widths"

patterns-established:
  - "scroll-text.js queries all headings (h2.section-title, h2.history-heading, h2.reveal-up, .section-label.reveal-up) excluding hero containers"
  - "Each heading gets SplitText word split with mask:'overflow', words start at yPercent:100, animate to 0 on scroll entry"
  - "text-scramble uses proxy object with progress tween and onUpdate for per-character resolve"
  - "data-scrambled attribute prevents re-triggering scramble when historyTimeline changes watermark text"

requirements-completed: [TEXT-02, TEXT-03]

# Metrics
duration: 4min
completed: 2026-03-12
---

# Phase 2 Plan 02: Scroll Text Reveals & Matrix Scramble

**Scroll-triggered masked word/line reveals for section headings and Matrix-style text scramble for statistics numbers across all 27 pages**

## Performance

- **Duration:** 4 min
- **Tasks:** 2 (both auto)
- **Files modified:** 29 (2 created + 27 modified)

## Accomplishments
- Created scroll-text.js targeting all section headings (h2.section-title, h2.history-heading, h2.reveal-up, .section-label.reveal-up) with SplitText word splitting and masked yPercent reveals on scroll entry
- Created text-scramble.js with Matrix-style character randomization for #stmtAccent (1987 statement) and #historyWatermark, triggered by ScrollTrigger viewport entry
- Wired both modules into all 27 HTML pages after hero.js
- Removed stmtAccent opacity animation from statementEntrance() in all 6 pages that had it (index, about, cn/index, cn/about, id/index, id/about)
- Both modules include reduced motion gate, CDN graceful degradation, and proper cleanup lifecycle

## Files Created/Modified
- `assets/animation/scroll-text.js` - Scroll-triggered masked word reveals for section headings
- `assets/animation/text-scramble.js` - Matrix-style text scramble for statistics/data numbers
- 27 HTML files - text-scramble.js/scroll-text.js script tags added
- 6 HTML files - stmtAccent animation removed from inline statementEntrance()

## Deviations from Plan

None

## Issues Encountered

None

## Phase Completion
This completes Phase 2 (Hero & Text). All success criteria met:
1. Preloader exits and hands off to hero content in coordinated GSAP timeline under 2.5s
2. Hero headline reveals character-by-character with masked stagger
3. All section headings animate on scroll with masked word reveals
4. Statistics numbers display Matrix-style scramble before resolving
5. Reduced motion = instant content visibility

---
*Phase: 02-hero-text*
*Completed: 2026-03-12*
