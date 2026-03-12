(function () {
  'use strict';

  // ─── SCROLL-TRIGGERED TEXT REVEALS ─────────────────────────────
  // Masked word/line reveals for all section headings on scroll entry.
  // Uses SplitText via window.RR.textSystem for font-safe splitting.
  // Replaces generic opacity fade reveals with premium masked stagger.

  var trackedTimelines = [];
  var trackedTriggers = [];

  // Selectors for headings to animate (excludes hero elements)
  var HEADING_SELECTORS = [
    'h2.section-title',
    'h2.history-heading',
    'h2.reveal-up:not(.hero-content h2):not(.about-hero-content h2):not(.sub-hero-content h2)',
    '.section-label.reveal-up'
  ];

  // Hero containers to exclude from selection
  var HERO_CONTAINERS = [
    '.hero-content',
    '.about-hero-content',
    '.sub-hero-content'
  ];

  /**
   * Checks if an element is inside a hero container.
   */
  function isInsideHero(el) {
    for (var i = 0; i < HERO_CONTAINERS.length; i++) {
      if (el.closest(HERO_CONTAINERS[i])) return true;
    }
    return false;
  }

  /**
   * Collects all heading elements that should receive scroll-triggered reveals.
   */
  function getHeadingElements() {
    var elements = [];
    var seen = new Set();

    HEADING_SELECTORS.forEach(function (selector) {
      var nodes = document.querySelectorAll(selector);
      nodes.forEach(function (el) {
        // Deduplicate and exclude hero elements
        if (!seen.has(el) && !isInsideHero(el)) {
          seen.add(el);
          elements.push({
            element: el,
            isLabel: el.classList.contains('section-label')
          });
        }
      });
    });

    return elements;
  }

  /**
   * Creates a scroll-triggered masked word reveal for a single heading element.
   */
  function createReveal(entry) {
    var el = entry.element;
    var isLabel = entry.isLabel;

    // Use SplitText via textSystem for word/line splitting with masked overflow
    return window.RR.textSystem.split(el, {
      type: 'words,lines',
      linesClass: 'rr-line',
      wordsClass: 'rr-word',
      mask: 'overflow'
    }).then(function (splitInstance) {
      if (!splitInstance || !splitInstance.words || splitInstance.words.length === 0) return;

      // Override reveal-up CSS: parent element must be visible
      // so that word-level masking controls visibility instead
      gsap.set(el, { opacity: 1, y: 0, clearProps: 'transform' });

      // Set initial state: words hidden below their overflow masks
      gsap.set(splitInstance.words, { yPercent: 100 });

      // Create scroll-triggered timeline
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: isLabel ? 'top 88%' : 'top 85%',
          once: true
        }
      });

      // Animate words sliding up into view
      tl.to(splitInstance.words, {
        yPercent: 0,
        duration: isLabel ? 0.5 : 0.7,
        ease: 'power3.out',
        stagger: isLabel ? 0.03 : 0.04
      });

      trackedTimelines.push(tl);
      if (tl.scrollTrigger) {
        trackedTriggers.push(tl.scrollTrigger);
      }
    });
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // CDN graceful degradation
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;
    if (typeof SplitText === 'undefined') return;

    // Reduced motion gate: headings stay visible as-is
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    // Text system required for SplitText integration
    if (!window.RR || !window.RR.textSystem || typeof window.RR.textSystem.split !== 'function') {
      console.warn('[RR:scrollText] textSystem not available — skipping scroll text reveals');
      return;
    }

    // Wrap in onFontsReady for correct line-break calculation
    if (window.RR && typeof window.RR.onFontsReady === 'function') {
      window.RR.onFontsReady(function () {
        var headings = getHeadingElements();
        headings.forEach(function (entry) {
          createReveal(entry);
        });
      });
    }
  }

  function kill() {
    // Kill all tracked timelines
    trackedTimelines.forEach(function (tl) {
      try { tl.kill(); } catch (e) { /* ignore */ }
    });
    trackedTimelines = [];

    // Kill all tracked ScrollTrigger instances
    trackedTriggers.forEach(function (st) {
      try { st.kill(); } catch (e) { /* ignore */ }
    });
    trackedTriggers = [];
  }

  function refresh() {
    kill();
    init();
  }

  // ─── REGISTER MODULE ──────────────────────────────────────────

  window.RR = window.RR || {};

  if (typeof window.RR.register === 'function') {
    window.RR.register('scrollText', { init: init, kill: kill, refresh: refresh });
  }

}());
