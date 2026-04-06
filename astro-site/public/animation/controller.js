(function () {
  'use strict';

  // Establish global namespace -- idempotent if called multiple times
  window.RR = window.RR || {};

  // Module registry with init/kill/refresh lifecycle
  window.RR.modules = window.RR.modules || [];

  window.RR.register = function (name, mod) {
    // Prevent duplicate registration
    var exists = window.RR.modules.some(function (m) { return m.name === name; });
    if (!exists) {
      window.RR.modules.push({ name: name, init: mod.init, kill: mod.kill, refresh: mod.refresh });
    }
  };

  window.RR.initAll = function () {
    window.RR.modules.forEach(function (m) {
      try {
        if (typeof m.init === 'function') m.init();
      } catch (e) {
        console.warn('[RR] Module init failed:', m.name, e);
      }
    });
  };

  window.RR.killAll = function () {
    window.RR.modules.forEach(function (m) {
      try {
        if (typeof m.kill === 'function') m.kill();
      } catch (e) {
        console.warn('[RR] Module kill failed:', m.name, e);
      }
    });
  };

  window.RR.refreshAll = function () {
    window.RR.modules.forEach(function (m) {
      try {
        if (typeof m.refresh === 'function') m.refresh();
      } catch (e) {
        console.warn('[RR] Module refresh failed:', m.name, e);
      }
    });
  };

  // Page detection -- read data-page from body for conditional module init
  window.RR.page = document.body.dataset.page || '';

  // Shared state object for cross-module communication
  window.RR.state = window.RR.state || {
    isTransitioning: false,
    scrollY: 0,
    hasReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  // FOUC prevention: gsap.set() initial states for above-the-fold elements (FOUND-08)
  // Run before DOMContentLoaded so states are applied before paint
  // Only run if GSAP is available (CDN graceful degradation)
  function applyInitialStates() {
    if (typeof gsap === 'undefined') return; // CDN failed -- no FOUC prevention needed (elements already visible)

    if (window.RR.state.hasReducedMotion) return; // Skip -- show content immediately

    // Hero content elements (hide before animation takes over in Phase 2)
    // Set opacity:0 on elements that Phase 2 hero.js will animate in
    // Using data attributes so Phase 2 can target without guessing selectors
    var heroTitle = document.querySelector('.hero-title');
    var heroSub   = document.querySelector('.hero-sub');
    var heroActions = document.querySelector('.hero-actions');
    var heroTag   = document.querySelector('.hero-tag');

    if (heroTitle)   gsap.set(heroTitle,   { opacity: 0, y: 30 });
    if (heroSub)     gsap.set(heroSub,     { opacity: 0, y: 20 });
    if (heroActions) gsap.set(heroActions, { opacity: 0, y: 15 });
    if (heroTag)     gsap.set(heroTag,     { opacity: 0, y: 10 });
  }

  // document.fonts.ready wrapper -- gates text animation readiness (FOUND-06)
  // Attach to RR so text-animations.js (Phase 2) can use it
  window.RR.onFontsReady = function (callback) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(callback).catch(function () {
        // fonts.ready rejected (rare) -- proceed without font guarantee
        callback();
      });
    } else {
      // Older browsers without fonts.ready -- fire immediately
      callback();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    try {
      applyInitialStates();
    } catch (e) {
      // Never block page render for animation failures
      console.warn('[RR] Initial state failed:', e);
    }
  });

}());
