(function () {
  'use strict';

  // ─── HORIZONTAL SCROLL SHOWCASE ─────────────────────────────
  // Transforms the capabilities grid into a pinned horizontal
  // scroll section using GSAP ScrollTrigger pin-scrub. The
  // section pins as the user scrolls and cards slide left.
  //
  // Mobile (coarse pointer): disabled, cards stay in vertical grid.
  // Reduced motion: disabled, normal grid layout.
  // will-change: applied only during active pin, removed on unpin.

  var scrollTween = null;
  var scrollTriggerInstance = null;
  var capsSection = null;
  var grid = null;

  function init() {
    // CDN graceful degradation
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    // Reduced motion gate
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    // Coarse pointer gate: horizontal pin-scrub causes jank on touch devices
    if (window.RR && window.RR.breakpoints && window.RR.breakpoints.isCoarsePointer) return;

    // Only run on pages with caps-section
    capsSection = document.querySelector('.caps-section');
    if (!capsSection) return;

    grid = capsSection.querySelector('.caps-grid');
    if (!grid) return;

    // Require at least 3 cards to justify horizontal scroll
    var cards = grid.querySelectorAll('.cap-card');
    if (cards.length < 3) return;

    // Activate horizontal layout via CSS class
    capsSection.classList.add('is-horizontal');

    // Wait one frame so the CSS flex layout takes effect before measuring
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        setupPinScrub();
      });
    });
  }

  function setupPinScrub() {
    if (!grid || !capsSection) return;

    // Calculate horizontal scroll distance
    var containerWidth = grid.parentElement.offsetWidth;
    var scrollWidth = grid.scrollWidth;
    var scrollDistance = scrollWidth - containerWidth;

    // If content fits within viewport, no horizontal scroll needed
    if (scrollDistance <= 0) {
      capsSection.classList.remove('is-horizontal');
      return;
    }

    scrollTween = gsap.to(grid, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: capsSection,
        start: 'top top',
        end: '+=' + scrollDistance,
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onToggle: function (self) {
          // Manage will-change lifecycle (PERF-03)
          if (grid) {
            grid.style.willChange = self.isActive ? 'transform' : 'auto';
          }
        }
      }
    });

    if (scrollTween && scrollTween.scrollTrigger) {
      scrollTriggerInstance = scrollTween.scrollTrigger;
    }
  }

  function kill() {
    // Kill ScrollTrigger and tween
    if (scrollTriggerInstance) {
      try { scrollTriggerInstance.kill(); } catch (e) { /* ignore */ }
      scrollTriggerInstance = null;
    }
    if (scrollTween) {
      try { scrollTween.kill(); } catch (e) { /* ignore */ }
      scrollTween = null;
    }

    // Remove horizontal layout class
    if (capsSection) {
      capsSection.classList.remove('is-horizontal');
    }

    // Clear will-change and reset transform on grid
    if (grid) {
      grid.style.willChange = 'auto';
      try { gsap.set(grid, { clearProps: 'x' }); } catch (e) { /* ignore */ }
    }

    capsSection = null;
    grid = null;
  }

  function refresh() {
    kill();
    init();
  }

  // ─── REGISTER MODULE ──────────────────────────────────────────

  window.RR = window.RR || {};

  if (typeof window.RR.register === 'function') {
    window.RR.register('horizontalShowcase', { init: init, kill: kill, refresh: refresh });
  }

}());
