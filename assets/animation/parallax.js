(function () {
  'use strict';

  // ─── SCROLL-DRIVEN PARALLAX DEPTH LAYERS ──────────────────────
  // Creates perceptible depth by moving background layers at offset
  // scroll speeds. Hero backgrounds shift at different rates, and
  // section backgrounds have subtle vertical offsets.
  //
  // This is SCROLL parallax (vertical offset on scroll).
  // The existing heroParallax() inline function is MOUSE parallax
  // (X/Y follow on mousemove). Both coexist without conflict.

  var trackedTriggers = [];
  var trackedTweens = [];

  /**
   * Hero section scroll parallax — each background layer moves at
   * a different speed to create depth illusion.
   */
  function initHeroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var layers = [
      { selector: '.parallax-bg', yPercent: 30 },
      { selector: '.parallax-mid', yPercent: 20 },
      { selector: '.parallax-fg', yPercent: 15 },
      { selector: '.parallax-headline', yPercent: 10 }
    ];

    layers.forEach(function (layer) {
      var el = hero.querySelector(layer.selector);
      if (!el) return;

      var tween = gsap.to(el, {
        yPercent: layer.yPercent,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        }
      });

      trackedTweens.push(tween);
      if (tween.scrollTrigger) trackedTriggers.push(tween.scrollTrigger);
    });
  }

  /**
   * History section background — subtle vertical shift as section scrolls.
   */
  function initHistoryParallax() {
    var historyBgImg = document.querySelector('#historyBg img');
    if (!historyBgImg) return;

    var section = document.getElementById('historySection');
    if (!section) return;

    var tween = gsap.to(historyBgImg, {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5
      }
    });

    trackedTweens.push(tween);
    if (tween.scrollTrigger) trackedTriggers.push(tween.scrollTrigger);
  }

  /**
   * Sub-hero sections on capability pages — subtle parallax on background.
   */
  function initSubHeroParallax() {
    var subHero = document.querySelector('.sub-hero');
    if (!subHero) return;

    var tween = gsap.to(subHero, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: subHero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });

    trackedTweens.push(tween);
    if (tween.scrollTrigger) trackedTriggers.push(tween.scrollTrigger);
  }

  /**
   * About hero section — subtle parallax if background elements exist.
   */
  function initAboutHeroParallax() {
    var aboutHero = document.querySelector('.about-hero');
    if (!aboutHero) return;

    // Apply subtle parallax to the entire about-hero section
    var tween = gsap.to(aboutHero, {
      yPercent: 5,
      ease: 'none',
      scrollTrigger: {
        trigger: aboutHero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    });

    trackedTweens.push(tween);
    if (tween.scrollTrigger) trackedTriggers.push(tween.scrollTrigger);
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // CDN graceful degradation
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    // Reduced motion gate
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    // Coarse pointer gate: parallax causes jank on touch devices
    if (window.RR && window.RR.breakpoints && window.RR.breakpoints.isCoarsePointer) return;

    initHeroParallax();
    initHistoryParallax();
    initSubHeroParallax();
    initAboutHeroParallax();
  }

  function kill() {
    trackedTweens.forEach(function (tween) {
      try { tween.kill(); } catch (e) { /* ignore */ }
    });
    trackedTweens = [];

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
    window.RR.register('parallax', { init: init, kill: kill, refresh: refresh });
  }

}());
