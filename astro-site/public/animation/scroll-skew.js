(function () {
  'use strict';

  // ─── SCROLL VELOCITY SKEW ─────────────────────────────────────
  // Elements subtly skew proportional to scroll speed using Lenis
  // onScroll velocity + GSAP quickSetter. Fast scrolling creates
  // a visible lean; slow scrolling returns elements to upright
  // with an elastic bounce.

  var scrollListener = null;
  var skewTargets = [];
  var skewSetters = [];
  var skewTween = null;
  var proxy = { skew: 0 };
  var currentSkew = 0;

  // Selectors for elements that should skew on scroll
  var SKEW_SELECTORS = [
    '.clip-section',
    '.editorial',
    '.cta-section'
  ];

  // Selectors to EXCLUDE from skew (hero, footer)
  var SKEW_EXCLUDE = [
    '.hero',
    '.page-hero',
    '.sub-hero',
    '.about-hero',
    'footer'
  ];

  /**
   * Checks if an element matches any exclusion selector.
   */
  function isExcluded(el) {
    for (var i = 0; i < SKEW_EXCLUDE.length; i++) {
      if (el.matches(SKEW_EXCLUDE[i]) || el.closest(SKEW_EXCLUDE[i])) return true;
    }
    return false;
  }

  /**
   * Collects all valid skew target elements.
   */
  function collectTargets() {
    var elements = [];
    var seen = new Set();

    SKEW_SELECTORS.forEach(function (selector) {
      var nodes = document.querySelectorAll(selector);
      nodes.forEach(function (el) {
        if (!seen.has(el) && !isExcluded(el)) {
          seen.add(el);
          elements.push(el);
        }
      });
    });

    return elements;
  }

  /**
   * Handles Lenis scroll event — reads velocity and updates skew.
   */
  function onScroll(e) {
    var velocity = e.velocity || 0;

    // Clamp skew to max 4 degrees
    var targetSkew = Math.min(Math.max(velocity * 0.3, -4), 4);

    // Kill any existing tween to avoid stacking
    if (skewTween) skewTween.kill();

    // Check if velocity is near zero — return to upright
    if (Math.abs(velocity) < 0.1) {
      skewTween = gsap.to(proxy, {
        skew: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
        onUpdate: applySkew,
        onComplete: function () {
          // Remove will-change when skew returns to 0
          skewTargets.forEach(function (el) {
            el.style.willChange = 'auto';
          });
        }
      });
    } else {
      // Apply will-change during active skew
      skewTargets.forEach(function (el) {
        el.style.willChange = 'transform';
      });

      skewTween = gsap.to(proxy, {
        skew: targetSkew,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: applySkew
      });
    }
  }

  /**
   * Applies the current proxy skew value to all targets.
   */
  function applySkew() {
    var val = proxy.skew;
    for (var i = 0; i < skewSetters.length; i++) {
      skewSetters[i](val);
    }
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // CDN graceful degradation
    if (typeof gsap === 'undefined') return;

    // Reduced motion gate
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    // Coarse pointer gate: skew feels wrong on touch scroll with inertia
    if (window.RR && window.RR.breakpoints && window.RR.breakpoints.isCoarsePointer) return;

    // Lenis required for velocity reading
    if (!window.RR || !window.RR.lenis) return;

    skewTargets = collectTargets();
    if (!skewTargets.length) return;

    // Create quickSetters for each target
    skewSetters = skewTargets.map(function (el) {
      return gsap.quickSetter(el, 'skewY', 'deg');
    });

    // Listen to Lenis scroll events for velocity
    scrollListener = onScroll;
    window.RR.lenis.on('scroll', scrollListener);
  }

  function kill() {
    // Remove Lenis scroll listener
    if (scrollListener && window.RR && window.RR.lenis) {
      window.RR.lenis.off('scroll', scrollListener);
    }
    scrollListener = null;

    // Kill any running skew tween
    if (skewTween) {
      skewTween.kill();
      skewTween = null;
    }

    // Clear skew transforms and will-change on all targets
    skewTargets.forEach(function (el) {
      try {
        el.style.willChange = 'auto';
        gsap.set(el, { skewY: 0 });
      } catch (e) { /* ignore */ }
    });

    skewTargets = [];
    skewSetters = [];
    proxy.skew = 0;
  }

  function refresh() {
    kill();
    init();
  }

  // ─── REGISTER MODULE ──────────────────────────────────────────

  window.RR = window.RR || {};

  if (typeof window.RR.register === 'function') {
    window.RR.register('scrollSkew', { init: init, kill: kill, refresh: refresh });
  }

}());
