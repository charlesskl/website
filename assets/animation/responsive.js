(function () {
  'use strict';

  function initResponsive() {
    // Graceful degradation: gsap.matchMedia requires GSAP 3.11+
    if (typeof gsap === 'undefined' || typeof gsap.matchMedia !== 'function') {
      console.warn('[RR:responsive] gsap.matchMedia not available -- responsive contexts skipped');
      return;
    }

    try {
      var mm = gsap.matchMedia();

      // Store mm context on RR for modules to add their own conditions
      window.RR.mm = mm;

      // Central breakpoint + motion preference contexts
      // ALL ScrollTrigger instances in Phase 2+ must be created inside one of these contexts
      mm.add({
        isDesktop:      '(min-width: 768px)',
        isMobile:       '(max-width: 767px)',
        isCoarsePointer:'(pointer: coarse)',           // touch devices -- disable complex effects
        reducedMotion:  '(prefers-reduced-motion: reduce)' // accessibility gate (FOUND-04)
      }, function (context) {
        var conditions = context.conditions;

        // Update shared state so other modules can read motion preference
        if (window.RR.state) {
          window.RR.state.hasReducedMotion = conditions.reducedMotion;
        }

        // REDUCED MOTION GATE (FOUND-04):
        // If user prefers reduced motion, immediately reveal all animated elements
        // and skip all animation setup. Content remains fully accessible.
        if (conditions.reducedMotion) {
          document.querySelectorAll('[data-reveal]').forEach(function (el) {
            el.classList.add('is-revealed');
          });
          // Reset any gsap.set() initial states applied by controller.js
          // so above-fold content is immediately visible
          var immediateTargets = document.querySelectorAll('.hero-title, .hero-sub, .hero-actions, .hero-tag');
          if (typeof gsap !== 'undefined' && immediateTargets.length) {
            gsap.set(immediateTargets, { clearProps: 'all' });
          }
          return; // Skip all animation registration
        }

        // Expose conditions for other modules via window.RR.breakpoints
        window.RR.breakpoints = {
          isDesktop:       conditions.isDesktop,
          isMobile:        conditions.isMobile,
          isCoarsePointer: conditions.isCoarsePointer,
          reducedMotion:   conditions.reducedMotion
        };

        // GSAP matchMedia auto-reverts all animations created inside this callback
        // on breakpoint change -- no manual cleanup needed in modules.
        // Phase 2+ modules should call window.RR.mm.add() to register their own contexts.

        // Cleanup function -- returned from matchMedia callback
        // Called automatically by GSAP when context reverts
        return function () {
          window.RR.breakpoints = null;
        };
      });

      console.log('[RR:responsive] gsap.matchMedia contexts registered');
    } catch (e) {
      console.warn('[RR:responsive] Responsive init failed:', e);
    }
  }

  document.addEventListener('DOMContentLoaded', initResponsive);

}());
