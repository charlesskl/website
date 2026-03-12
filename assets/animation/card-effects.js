(function () {
  'use strict';

  // ─── CARD EFFECTS ────────────────────────────────────────────
  // Clip-path scroll reveals and 3D mouse-tilt hover for cap-cards.
  // Cards enter with a staggered geometric wipe on scroll. On desktop,
  // hovering tilts the card in 3D following mouse position with
  // inner content parallax for depth. Touch devices: no tilt.
  //
  // Only GPU-compositable properties animated (CARD-03):
  // transform (rotateX, rotateY, translateZ) and opacity.

  var cleanupFns = [];
  var trackedTimelines = [];
  var trackedTriggers = [];

  // ─── CARD SCROLL REVEAL (CARD-01) ────────────────────────────

  function initCardReveals() {
    var cards = document.querySelectorAll('.cap-card');
    if (!cards.length) return;

    var grid = document.querySelector('.caps-grid');
    if (!grid) return;

    // Set initial state: cards clipped from bottom (invisible)
    cards.forEach(function (card) {
      gsap.set(card, {
        clipPath: 'inset(100% 0 0 0)',
        opacity: 0
      });
    });

    // Staggered reveal timeline
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: grid,
        start: 'top 85%',
        once: true
      }
    });

    tl.to(cards, {
      clipPath: 'inset(0% 0 0 0)',
      opacity: 1,
      duration: 0.8,
      ease: 'power3.inOut',
      stagger: {
        each: 0.12,
        from: 'start'
      }
    });

    trackedTimelines.push(tl);
    if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
  }

  // ─── 3D TILT HOVER (CARD-02) ─────────────────────────────────

  function initCardTilt() {
    // Touch device gate (CARD-02)
    var isTouch = (window.RR && window.RR.breakpoints && window.RR.breakpoints.isCoarsePointer) ||
                  window.matchMedia('(pointer: coarse)').matches ||
                  window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    var cards = document.querySelectorAll('.cap-card');

    cards.forEach(function (card) {
      // Add perspective context for 3D
      card.style.transformStyle = 'preserve-3d';

      var cardImg = card.querySelector('.cap-card-img');

      var mouseEnter = function () {
        // Add will-change during interaction (PERF-03)
        card.style.willChange = 'transform';
      };

      var mouseMove = function (e) {
        var rect = card.getBoundingClientRect();
        // Mouse position relative to card center (-0.5 to 0.5)
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;

        // Tilt angles (max ±8 degrees)
        var tiltX = y * -16;
        var tiltY = x * 16;

        // Apply tilt with GSAP for smooth interpolation (CARD-03)
        gsap.to(card, {
          rotateX: tiltX,
          rotateY: tiltY,
          transformPerspective: 800,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        // Inner content parallax — shifts opposite for depth
        if (cardImg) {
          gsap.to(cardImg, {
            x: x * -10,
            y: y * -10,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      };

      var mouseLeave = function () {
        // Spring back to flat (CARD-03 — GPU-compositable only)
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto',
          onComplete: function () {
            // Remove will-change after settle (PERF-03)
            card.style.willChange = 'auto';
          }
        });

        // Reset inner image position
        if (cardImg) {
          gsap.to(cardImg, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
            overwrite: 'auto'
          });
        }
      };

      card.addEventListener('mouseenter', mouseEnter);
      card.addEventListener('mousemove', mouseMove);
      card.addEventListener('mouseleave', mouseLeave);

      // Track for cleanup
      cleanupFns.push(function () {
        card.removeEventListener('mouseenter', mouseEnter);
        card.removeEventListener('mousemove', mouseMove);
        card.removeEventListener('mouseleave', mouseLeave);
        card.style.willChange = 'auto';
        card.style.transformStyle = '';
        gsap.set(card, { clearProps: 'rotateX,rotateY,transformPerspective' });
        if (cardImg) {
          gsap.set(cardImg, { clearProps: 'x,y' });
        }
      });
    });
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // CDN graceful degradation
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    // Reduced motion gate: ensure cards visible, skip animation
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) {
      document.querySelectorAll('.cap-card').forEach(function (card) {
        gsap.set(card, { clearProps: 'clipPath,opacity' });
      });
      return;
    }

    // Only run on pages with cap-cards
    if (!document.querySelectorAll('.cap-card').length) return;

    initCardReveals();
    initCardTilt();
  }

  function kill() {
    // Run all cleanup functions (removes event listeners, resets styles)
    cleanupFns.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
    cleanupFns = [];

    // Kill ScrollTrigger timelines
    trackedTimelines.forEach(function (tl) { try { tl.kill(); } catch (e) { /* ignore */ } });
    trackedTimelines = [];

    trackedTriggers.forEach(function (st) { try { st.kill(); } catch (e) { /* ignore */ } });
    trackedTriggers = [];

    // Reset clip-path and tilt on all cards
    document.querySelectorAll('.cap-card').forEach(function (card) {
      try {
        gsap.set(card, { clearProps: 'clipPath,opacity,rotateX,rotateY,transformPerspective' });
      } catch (e) { /* ignore */ }
    });
  }

  function refresh() {
    kill();
    init();
  }

  // ─── REGISTER MODULE ──────────────────────────────────────────

  window.RR = window.RR || {};

  if (typeof window.RR.register === 'function') {
    window.RR.register('cardEffects', { init: init, kill: kill, refresh: refresh });
  }

}());
