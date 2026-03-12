(function () {
  'use strict';

  function initScrollEngine() {
    // Graceful degradation: if Lenis or GSAP is missing, fall back to native scroll (FOUND-05)
    if (typeof Lenis === 'undefined') {
      console.warn('[RR:scroll-engine] Lenis not loaded -- using native scroll');
      return;
    }
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[RR:scroll-engine] GSAP/ScrollTrigger not loaded -- Lenis running standalone');
      // Initialize Lenis without GSAP sync (still get smooth scroll)
      var lenisFallback = new Lenis({ lerp: 0.08, smoothWheel: true });
      window.RR.lenis = lenisFallback;
      function rafFallback(time) { lenisFallback.raf(time); requestAnimationFrame(rafFallback); }
      requestAnimationFrame(rafFallback);
      return;
    }

    try {
      // Register ScrollTrigger plugin
      gsap.registerPlugin(ScrollTrigger);

      // Initialize Lenis with project settings
      var lenis = new Lenis({
        lerp: 0.08,           // Smoothing factor (0 = instant, 1 = never arrives)
        smoothWheel: true,    // Smooth mouse wheel
        syncTouch: false      // Native touch on mobile -- no interference
      });

      // THE 3-LINE SYNC (do not reorder):
      // 1. Tell ScrollTrigger to update positions when Lenis fires its scroll event
      lenis.on('scroll', ScrollTrigger.update);

      // 2. Plug Lenis RAF into GSAP ticker -- single shared RAF loop, no drift
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000); // GSAP time is in seconds; Lenis expects ms
      });

      // 3. Disable GSAP lag smoothing -- prevents jitter during fast scroll
      gsap.ticker.lagSmoothing(0);

      // Expose lenis instance for cross-module access (webgl.js, cursor.js etc.)
      window.RR.lenis = lenis;

      // Keep scroll state in sync for velocity-based effects (Phase 3)
      lenis.on('scroll', function (e) {
        if (window.RR.state) window.RR.state.scrollY = e.scroll;
      });

      console.log('[RR:scroll-engine] Lenis + ScrollTrigger sync initialized');
    } catch (e) {
      console.warn('[RR:scroll-engine] Scroll engine init failed:', e);
      // Do NOT re-throw -- page must still render and function
    }
  }

  document.addEventListener('DOMContentLoaded', initScrollEngine);

}());
