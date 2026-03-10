/**
 * animations.js — Royal Regent Toys
 * Animation infrastructure: scroll-reveal system + GSAP stub for Phase 2
 *
 * Load order (must match HTML): gsap.min.js → ScrollTrigger.min.js → animations.js
 * Dependencies: GSAP 3.14.2 (CDN), IntersectionObserver (native)
 */
(function () {
  'use strict';

  /* ── Accessibility guard (mirrors shared.js pattern) ─────────────────── */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── GSAP initialization stub (Phase 2 timelines will be added here) ─── */
  function initGSAP() {
    if (typeof gsap === 'undefined') return; // guard: CDN failed to load
    if (prefersReducedMotion) return;        // guard: accessibility (FOUND-03)
    gsap.registerPlugin(ScrollTrigger);
    // Phase 2 animations will be registered here
  }

  /* ── data-reveal scroll system (IntersectionObserver, not GSAP) ───────── */
  /* Uses native IO so reveals work even if GSAP CDN fails to load          */
  function initScrollReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (prefersReducedMotion) {
      /* Immediately reveal all — no animation (FOUND-03) */
      targets.forEach(function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el       = entry.target;
        var delay    = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
        var duration = el.getAttribute('data-reveal-duration') || '600';

        /* Apply custom duration if provided */
        el.style.transitionDuration = duration + 'ms';

        /* Apply delay or reveal immediately */
        if (delay > 0) {
          setTimeout(function () {
            el.classList.add('is-revealed');
          }, delay);
        } else {
          el.classList.add('is-revealed');
        }

        /* Fire once only — do not replay on scroll-back (FOUND-02) */
        observer.unobserve(el);
      });
    }, {
      threshold: 0.15 /* 15% of element must be visible to trigger (user decision) */
    });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Init on DOM ready ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initGSAP();
  });

}());
