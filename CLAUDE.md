# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication

Always respond in 简体中文 (Simplified Chinese). Code, commands, and file paths remain in English.

## Project Overview

Royal Regent Group 企业官网 — Awwwards 级动画大改造进行中。

- **Stack**: Vanilla HTML/CSS/JavaScript, no framework, no build system
- **Animation**: GSAP 3.14.2 (ScrollTrigger, SplitText) + Three.js r183 + Lenis 1.3.18
- **Fonts**: Self-hosted WOFF2 (Clash Display + Satoshi)
- **Hosting**: GitHub Pages at royalregentgroup.com
- **Dev**: `python3 -m http.server 8000` then open http://localhost:8000

## Architecture

### Multi-language (3 versions, mirrored)
- `index.html` (EN), `cn/` (繁體中文), `id/` (Indonesian)
- 9 pages each: index, about, careers, contact, admin + 5 capability sub-pages (plastic-toys, plush, dolls, rc-vehicle, costume)
- **Animation changes must apply equally across all 3 language versions**

### Animation Module System (`assets/animation/`)

`controller.js` manages a global registry via `window.RR`:

```javascript
window.RR.register('moduleName', {
  init: function() { /* start animations */ },
  kill: function() { /* cleanup GSAP timelines */ },
  refresh: function() { /* recalc on resize */ }
});
```

Key modules:
- `hero.js` — Hero section master timeline (preloader → reveal, <2.5s)
- `scroll-engine.js` — Lenis + ScrollTrigger bridge
- `text-system.js` / `text-scramble.js` — SplitText reveals + Matrix-style number scramble
- `scroll-reveals.js` / `scroll-text.js` — Scroll-triggered element/text animations
- `parallax.js` — Depth layer parallax
- `section-choreography.js` — Coordinated entrance sequences
- `cursor.js` / `magnetic.js` — Custom cursor + magnetic button attraction
- `navbar.js` / `mobile-menu.js` — Smart scroll nav + animated mobile menu
- `page-transition.js` — CSS clip-path page transitions
- `webgl-bg.js` — Three.js shader background
- `responsive.js` — Breakpoint handling

### CSS Design System (`assets/shared.css`)

```css
--brand: #7CB342       /* lime-green from logo */
--font-display: 'Clash Display'
--font-body: 'Satoshi'
--max-w: 1400px
--nav-h: 80px
```

### Planning Docs (`.planning/`)

- `PROJECT.md` — Core requirements & scope
- `STATE.md` — Current phase & progress tracking
- `ROADMAP.md` — 6-phase execution plan with success criteria
- `phases/` — Per-phase detailed plans

## Constraints (Non-Negotiable)

- No HTML structure changes — animations work within existing markup
- Brand identity fixed: #7CB342, Clash Display + Satoshi fonts
- No build system — vanilla HTML/CSS/JS, all libs via CDN
- `prefers-reduced-motion` respected via `window.RR.state.hasReducedMotion`
- 60fps target, GPU-compositable transforms only (`transform`, `opacity`, `clip-path`)
- IIFE pattern with `'use strict'` for all animation modules (no bundler)
- Insert animation scripts before `</body>` for correct load order

## Animation Overhaul Status

Phase 2 of 6 complete (~33%). Next: Phase 3 (Scroll Experiences).

| Phase | Status | Key Deliverables |
|-------|--------|-----------------|
| 1. Foundation | ✅ Complete | Lenis + ScrollTrigger bridge, RR module registry |
| 2. Hero & Text | ✅ Complete | Hero master timeline, SplitText, text scramble |
| 3. Scroll Experiences | ⏳ Next | Clip-path reveals, parallax, velocity skew |
| 4. Cursor & Nav | ✅ Complete | Custom cursor, magnetic buttons, smart nav |
| 5. WebGL | Pending | Three.js r183 shader backgrounds, 3D card tilt |
| 6. Polish & Parity | Pending | Multi-language sync, performance validation |

See `.planning/STATE.md` for detailed progress.

## Key Decisions

- SplitText CDN at 3.14.2 while base GSAP stays at page-specific version
- MutationObserver on `#brandLoader` for preloader handoff (avoids modifying shared.js)
- `text-scramble.js` owns `#stmtAccent` entirely (removed from inline statementEntrance)
- CSS clip-path for page transitions instead of Barba.js (90% effect at 10% complexity)
- Three.js r183 upgrade required — r170 → r183 has breaking changes; review migration guide before Phase 5

## Blockers

- Phase 5: Three.js r170 → r183 migration guide review required before starting WebGL
- Phase 6: Lenis + ScrollTrigger `normalizeScroll(true)` + horizontal pin edge cases — needs prototype

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
