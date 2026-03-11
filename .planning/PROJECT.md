# Royal Regent Website Animation Overhaul

## What This Is

A comprehensive animation overhaul for the Royal Regent Group website — a static multi-language corporate site for a toy/product manufacturing company. The goal is to transform the current functional animations into Awwwards-level creative studio quality, delivering a high-end luxury feel with experimental, avant-garde interactions across every page section.

## Core Value

The website must deliver an immediate WOW factor on first visit while maintaining silky-smooth interactions throughout the entire browsing experience — no compromise between spectacle and usability.

## Requirements

### Validated

- ✓ Multi-language support (en/cn/id) — existing
- ✓ Static HTML/CSS/JS architecture — existing
- ✓ GSAP + Three.js + Lenis animation stack — existing
- ✓ Responsive design — existing
- ✓ Accessibility (prefers-reduced-motion) — existing
- ✓ Brand identity (Clash Display + Satoshi fonts, verdant color palette) — existing

### Active

- [ ] Awwwards-level hero/opening animation with WOW factor
- [ ] Advanced scroll-driven experiences (parallax, pinning, horizontal scroll, reveal sequences)
- [ ] Refined navigation interactions (menu transitions, hover effects, page transitions)
- [ ] Premium product showcase animations (card effects, image reveals, hover states)
- [ ] Rewritten cursor system (magnetic, morphing, contextual states)
- [ ] WebGL/shader-enhanced backgrounds and visual effects
- [ ] Unified motion design language across all pages
- [ ] Smooth page transitions between routes
- [ ] Text animation system (split text, staggered reveals, kinetic typography)
- [ ] Micro-interactions on all interactive elements (buttons, links, forms)
- [ ] All animations synced across en/cn/id language versions
- [ ] Performance optimization (60fps target, lazy initialization, GPU acceleration)

### Out of Scope

- HTML structure changes — keep existing semantic markup
- Brand identity changes — colors, fonts, logo remain unchanged
- Content changes — text, images, product data stay the same
- Build system migration — remain vanilla HTML/CSS/JS, no framework
- Backend/server changes — static site architecture preserved
- New pages — work within existing page set

## Context

- **Current state**: Site has functional animations (cursor, scroll reveal, particle system, parallax) but they feel generic and disconnected — no unified motion language
- **Tech foundation**: GSAP 3.14.2, Three.js 0.170.0, Splitting.js, Lenis 1.1.18 already loaded via CDN — can leverage and extend
- **Approach**: Research best-in-class creative studio websites, identify adaptable animation patterns, then rewrite all existing animations with higher-quality versions and add new effects
- **Execution model**: Fully automatic overnight job — research → plan → execute without manual intervention
- **Reference style**: Awwwards-winning creative studios — avant-garde animations, experimental interactions, editorial luxury feel

## Constraints

- **Brand consistency**: Must preserve existing color palette (verdant #7CB342 brand color), Clash Display + Satoshi typography
- **Multi-language sync**: All animation changes must apply equally to en/, cn/, id/ versions
- **No build system**: All code delivered as vanilla HTML/CSS/JS via CDN — no bundlers or transpilers
- **Performance**: 60fps animations, no jank on scroll, lazy load non-critical effects
- **Accessibility**: Respect prefers-reduced-motion, maintain keyboard navigation
- **Hosting**: GitHub Pages static hosting — no server-side capabilities

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rewrite all animations rather than enhance | Ensures unified motion language instead of patchwork | — Pending |
| Keep vanilla JS architecture | No build system means simpler deployment, existing pattern works | — Pending |
| Research-driven approach | Find proven Awwwards-level patterns rather than inventing from scratch | — Pending |
| GSAP + Three.js + WebGL shaders | Already in stack, industry standard for high-end web animation | — Pending |

---
*Last updated: 2026-03-11 after initialization*
