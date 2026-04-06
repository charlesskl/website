(function () {
  'use strict';

  // ─── SPLITTEXT INFRASTRUCTURE ─────────────────────────────────
  // Provides reusable SplitText wrapper with font-ready gating,
  // auto-resplit on resize, and CDN graceful degradation.
  // Registered as window.RR.textSystem for hero.js consumption.

  var splits = [];       // Track all active SplitText instances
  var splitMeta = [];    // Track {element, options} for resplit
  var resizeTimer = null;
  var RESIZE_DEBOUNCE = 250;

  // CDN graceful degradation: if SplitText is missing, provide no-op fallback
  var hasSplitText = typeof SplitText !== 'undefined';

  // Default SplitText options with masked overflow for char reveals
  var DEFAULTS = {
    type: 'chars,words,lines',
    linesClass: 'rr-line',
    wordsClass: 'rr-word',
    charsClass: 'rr-char',
    mask: 'overflow'
  };

  /**
   * split(element, options) — wraps SplitText.create() with document.fonts.ready gating.
   * Returns a Promise that resolves with the SplitText instance.
   * @param {HTMLElement|string} element - DOM element or CSS selector
   * @param {Object} [options] - SplitText options (merged with defaults)
   * @returns {Promise} Resolves with SplitText instance (or null if CDN missing)
   */
  function split(element, options) {
    if (!hasSplitText) {
      // CDN missing: return resolved promise with null — caller handles gracefully
      return Promise.resolve(null);
    }

    var mergedOpts = {};
    var key;
    for (key in DEFAULTS) {
      if (DEFAULTS.hasOwnProperty(key)) mergedOpts[key] = DEFAULTS[key];
    }
    if (options) {
      for (key in options) {
        if (options.hasOwnProperty(key)) mergedOpts[key] = options[key];
      }
    }

    return new Promise(function (resolve) {
      // Gate on fonts.ready via controller.js helper
      if (window.RR && typeof window.RR.onFontsReady === 'function') {
        window.RR.onFontsReady(function () {
          var instance = SplitText.create(element, mergedOpts);
          splits.push(instance);
          splitMeta.push({ element: element, options: mergedOpts });
          resolve(instance);
        });
      } else {
        // Fallback: no font gating available
        var instance = SplitText.create(element, mergedOpts);
        splits.push(instance);
        splitMeta.push({ element: element, options: mergedOpts });
        resolve(instance);
      }
    });
  }

  /**
   * killAll() — reverts all tracked SplitText instances.
   * Restores DOM to original state before any splits.
   */
  function killAll() {
    splits.forEach(function (instance) {
      try {
        if (instance && typeof instance.revert === 'function') {
          instance.revert();
        }
      } catch (e) {
        console.warn('[RR:textSystem] Failed to revert split:', e);
      }
    });
    splits = [];
  }

  /**
   * resplitAll() — kills all existing splits, then re-creates them.
   * Called on resize to handle layout changes (responsive text reflow).
   */
  function resplitAll() {
    var savedMeta = splitMeta.slice(); // Copy before kill clears them

    // Kill existing splits
    killAll();

    // Clear meta since killAll only clears splits array
    splitMeta = [];

    // Re-create each split with its original element and options
    savedMeta.forEach(function (meta) {
      try {
        var instance = SplitText.create(meta.element, meta.options);
        splits.push(instance);
        splitMeta.push(meta);
      } catch (e) {
        console.warn('[RR:textSystem] Failed to resplit:', e);
      }
    });

    // Refresh ScrollTrigger positions after text reflow
    if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
      ScrollTrigger.refresh();
    }
  }

  /**
   * Auto-resplit on resize — debounced 250ms.
   * Handles responsive breakpoint changes where text reflows.
   */
  function handleResize() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (splits.length > 0) {
        resplitAll();
      }
    }, RESIZE_DEBOUNCE);
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // Reduced motion: do not initialize text splitting — text stays static
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) {
      return;
    }

    // Attach resize listener for auto-resplit
    window.addEventListener('resize', handleResize);
  }

  function kill() {
    window.removeEventListener('resize', handleResize);
    if (resizeTimer) clearTimeout(resizeTimer);
    killAll();
    splitMeta = [];
  }

  function refresh() {
    if (splits.length > 0) {
      resplitAll();
    }
  }

  // ─── EXPOSE PUBLIC API ────────────────────────────────────────

  window.RR = window.RR || {};
  window.RR.textSystem = {
    split: split,
    killAll: killAll,
    resplitAll: resplitAll
  };

  // Register with module system for lifecycle management
  if (typeof window.RR.register === 'function') {
    window.RR.register('textSystem', { init: init, kill: kill, refresh: refresh });
  }

}());
