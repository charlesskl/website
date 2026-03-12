(function () {
  'use strict';

  // ─── CLIP-PATH GEOMETRIC WIPE REVEALS ─────────────────────────
  // Scroll-triggered clip-path reveals for images.
  // Replaces generic opacity fades with geometric wipes:
  //   - Photo panels: top-to-bottom inset wipe
  //   - Capability card images: left-to-right polygon wipe
  //   - History background: diagonal polygon reveal

  var trackedTimelines = [];
  var trackedTriggers = [];
  var affectedElements = [];

  /**
   * Creates staggered top-to-bottom clip-path reveals for photo panels.
   */
  function revealPhotoPanels() {
    var panelContainers = document.querySelectorAll('.photo-panels');

    panelContainers.forEach(function (container) {
      var panels = container.querySelectorAll('.photo-panel');
      if (!panels.length) return;

      // Set initial state: fully clipped from bottom
      panels.forEach(function (panel) {
        gsap.set(panel, { clipPath: 'inset(0 0 100% 0)' });
        affectedElements.push(panel);
      });

      // Create timeline with scrollTrigger on the container
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          once: true
        }
      });

      // Stagger panels revealing top-to-bottom
      tl.to(panels, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.0,
        ease: 'power3.inOut',
        stagger: 0.15
      });

      trackedTimelines.push(tl);
      if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
    });
  }

  /**
   * Creates left-to-right polygon wipe reveals for capability card images.
   */
  function revealCapCardImages() {
    var cardImages = document.querySelectorAll('.cap-card-img');

    cardImages.forEach(function (img) {
      var card = img.closest('.cap-card');
      if (!card) return;

      // Set initial state: clipped from left (invisible)
      gsap.set(img, { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' });
      affectedElements.push(img);

      // Animate to full reveal
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          once: true
        }
      });

      tl.to(img, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 0.8,
        ease: 'power2.out'
      });

      trackedTimelines.push(tl);
      if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
    });
  }

  /**
   * Creates diagonal polygon reveal for history background.
   */
  function revealHistoryBg() {
    var bg = document.getElementById('historyBg');
    if (!bg) return;

    var section = document.getElementById('historySection') || bg.parentElement;

    // Set initial state: invisible polygon
    gsap.set(bg, { clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)' });
    affectedElements.push(bg);

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        once: true
      }
    });

    tl.to(bg, {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      duration: 1.2,
      ease: 'power3.inOut'
    });

    trackedTimelines.push(tl);
    if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
  }

  /**
   * Simplified reveals for coarse pointer (touch) devices.
   * Uses opacity fade instead of clip-path to avoid mobile GPU jank.
   */
  function revealSimplified() {
    var targets = [].concat(
      Array.from(document.querySelectorAll('.photo-panel')),
      Array.from(document.querySelectorAll('.cap-card-img')),
      document.getElementById('historyBg') ? [document.getElementById('historyBg')] : []
    );

    targets.forEach(function (el) {
      gsap.set(el, { opacity: 0 });
      affectedElements.push(el);

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true
        }
      });

      tl.to(el, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      });

      trackedTimelines.push(tl);
      if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
    });
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // CDN graceful degradation
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    // Reduced motion gate: images remain fully visible
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    // Coarse pointer: simplified opacity reveals instead of clip-path
    if (window.RR && window.RR.breakpoints && window.RR.breakpoints.isCoarsePointer) {
      revealSimplified();
      return;
    }

    revealPhotoPanels();
    revealCapCardImages();
    revealHistoryBg();
  }

  function kill() {
    trackedTimelines.forEach(function (tl) {
      try { tl.kill(); } catch (e) { /* ignore */ }
    });
    trackedTimelines = [];

    trackedTriggers.forEach(function (st) {
      try { st.kill(); } catch (e) { /* ignore */ }
    });
    trackedTriggers = [];

    // Reset clip-path on all affected elements
    affectedElements.forEach(function (el) {
      try { gsap.set(el, { clearProps: 'clipPath,opacity' }); } catch (e) { /* ignore */ }
    });
    affectedElements = [];
  }

  function refresh() {
    kill();
    init();
  }

  // ─── REGISTER MODULE ──────────────────────────────────────────

  window.RR = window.RR || {};

  if (typeof window.RR.register === 'function') {
    window.RR.register('scrollReveals', { init: init, kill: kill, refresh: refresh });
  }

}());
