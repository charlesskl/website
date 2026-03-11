# Testing Patterns

**Analysis Date:** 2026-03-11

## Test Framework

**Runner:**
- Not applicable — no automated testing framework detected
- No test runner (Jest, Vitest, Mocha, etc.)
- No test configuration files (jest.config.js, vitest.config.ts, etc.)

**Assertion Library:**
- Not used — no assertions library present

**Current Approach:**
- Manual testing via browser inspection
- Visual verification of animations and interactions
- QA testing in development browser

**Running Tests:**
- No automated test scripts available
- Manual testing workflow required

## Test File Organization

**Location:**
- No test files found in codebase
- Search results: 0 `.test.*` or `.spec.*` files detected

**Naming Convention:**
- Not applicable — no test files exist

**Structure:**
- Not applicable — no testing framework in place

## Test Structure

**Pattern:**
- Not applicable — no automated tests

## Mocking

**Framework:**
- Not applicable — no testing framework, no mocking needed

**What to Mock:**
- Not applicable

**What NOT to Mock:**
- Not applicable

## Fixtures and Factories

**Test Data:**
- No test fixtures present
- HTML attributes serve as configuration: `data-reveal`, `data-reveal-delay`, `data-reveal-duration`
- Manual test data set in HTML files for browser testing

**Location:**
- Not applicable — no fixtures used

## Coverage

**Requirements:**
- None enforced — no testing framework

**View Coverage:**
- Not applicable

## Test Types

**Unit Tests:**
- Not implemented — no JavaScript unit test framework

**Integration Tests:**
- Not implemented — no automated testing

**E2E Tests:**
- Not implemented — no E2E testing framework (Playwright, Cypress, Puppeteer)

**Manual Testing:**
- Browser-based QA testing
- Visual inspection of animations: scroll-reveals, cursor effects, transitions
- Interaction testing: button hovers, hamburger menu, image lazy loading
- Accessibility testing: reduced motion preferences, touch device behavior

## Manual Testing Patterns

**Browser-Based Validation:**

**Scroll-Reveal Testing:**
- Open page in browser
- Scroll to elements with `[data-reveal]` attribute
- Verify fade-in animation at 15% visibility threshold
- Test with `prefers-reduced-motion: reduce` — should reveal immediately without animation

**Cursor Testing:**
- Test on desktop with hover support
- Verify two-part cursor: dot (center) + ring (outer) follow mouse
- Test on touch devices: cursor should not render
- Test on devices without hover support: cursor should not render

**Animation Testing:**
- Verify GSAP animations work when CDN loads
- Verify fallback behavior when GSAP fails to load
- Test parallax scrolling on content sections
- Test page transitions with clip-path wipe effects

**Mobile Testing:**
- Test hamburger menu interaction
- Verify no cursor on touch devices
- Test reduced animation on mobile
- Verify lazy loading of images

**Accessibility Testing:**
- Enable "Reduce Motion" in system preferences
- Verify all animations disabled immediately (no transitions)
- Test keyboard navigation
- Verify semantic HTML structure for screen readers

## Feature Detection Patterns

**Observed in Code:**

From `shared.js`:
```javascript
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const hasHover = window.matchMedia('(hover: hover)').matches;
```

**Testing Approach:**
- Feature detection gates entire feature modules
- Guards placed at initialization: `if (isTouch || !hasHover) return;`
- Same pattern in `animations.js` for accessibility

## Debugging Patterns

**Issue Tracking:**
- Issues referenced inline with `(FOUND-XX)` markers
- Example: `/* Fire once only — do not replay on scroll-back (FOUND-02) */`
- Example: `/* Immediately reveal all — no animation (FOUND-03) */`

**Investigation Method:**
- Browser DevTools inspection
- Network tab for asset loading
- Console for runtime errors
- Lighthouse for performance audits

## Recommended Testing Strategy

**For Future Implementation:**
1. **Unit Testing:** Vitest or Jest with DOM testing library
   - Test animation initialization logic
   - Test feature detection functions
   - Test attribute parsing and defaults

2. **E2E Testing:** Playwright
   - Test scroll-reveal triggering
   - Test cursor behavior on different devices
   - Test accessibility (reduced motion, keyboard nav)
   - Test button magnetic effects
   - Test page transitions

3. **Visual Regression:** Percy or Chromatic
   - Verify animations render consistently
   - Track CSS/animation changes across releases

4. **Accessibility Testing:** axe-core or Pa11y
   - Automated WCAG 2.1 compliance
   - Test screen reader output
   - Test keyboard navigation

---

*Testing analysis: 2026-03-11*
