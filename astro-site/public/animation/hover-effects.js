/**
 * hover-effects.js — Royal Regent Toys
 * Hover micro-interactions: underline draw, color shift, shimmer, focus states
 *
 * Distinct hover feedback for all interactive elements (CURSOR-04)
 * Form focus states with visible brand ring (CURSOR-05)
 * Desktop-only for animated effects; focus states work everywhere
 * Dependencies: GSAP 3.14.2 (optional — CSS fallback), controller.js
 */
(function () {
  'use strict';

  var listeners = [];
  var taggedElements = [];
  var activeTweens = [];
  var isActive = false;
  var hasGsap = false;

  function isTouchDevice() {
    if (window.RR && window.RR.breakpoints && window.RR.breakpoints.isCoarsePointer) return true;
    if (window.matchMedia('(pointer: coarse)').matches) return true;
    if (window.matchMedia('(hover: none)').matches) return true;
    return false;
  }

  function addListener(target, event, handler, opts) {
    target.addEventListener(event, handler, opts || false);
    listeners.push({ target: target, event: event, handler: handler, opts: opts || false });
  }

  function addClass(el, cls) {
    el.classList.add(cls);
    taggedElements.push({ el: el, cls: cls });
  }

  /* ── Underline draw effect for nav links (CURSOR-04) ── */
  function initUnderlines() {
    var navLinks = document.querySelectorAll('.nav-links > li > a:not(.nav-cta)');
    navLinks.forEach(function (link) {
      // Skip dropdown toggles and lang selector
      if (link.closest('.has-dropdown')) return;

      addClass(link, 'rr-underline');

      if (hasGsap) {
        addListener(link, 'mouseenter', function () {
          var after = link;
          gsap.to(after, {
            '--rr-underline-scale': 1,
            '--rr-underline-origin': '0% 50%',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
          });
        });
        addListener(link, 'mouseleave', function () {
          gsap.to(link, {
            '--rr-underline-scale': 0,
            '--rr-underline-origin': '100% 50%',
            duration: 0.25,
            ease: 'power2.in',
            overwrite: true
          });
        });
      }
      // Without GSAP, CSS handles the transition via :hover
    });
  }

  /* ── Shimmer effect for primary CTAs (CURSOR-04) ── */
  function initShimmer() {
    var ctas = document.querySelectorAll('.btn-primary, .nav-cta');
    ctas.forEach(function (btn) {
      addClass(btn, 'rr-shimmer');

      addListener(btn, 'mouseenter', function () {
        if (hasGsap) {
          // Animate the shimmer sweep via CSS custom property
          gsap.fromTo(btn, {
            '--rr-shimmer-x': '-100%'
          }, {
            '--rr-shimmer-x': '200%',
            duration: 0.6,
            ease: 'power2.inOut',
            overwrite: true
          });
        }
      });
    });
  }

  /* ── Button scale pulse on hover (CURSOR-04) ── */
  function initButtonPulse() {
    if (!hasGsap) return;

    var buttons = document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta');
    buttons.forEach(function (btn) {
      addListener(btn, 'mouseenter', function () {
        var tween = gsap.to(btn, {
          scale: 1.02,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: true
        });
        activeTweens.push(tween);
      });
      addListener(btn, 'mouseleave', function () {
        var tween = gsap.to(btn, {
          scale: 1,
          duration: 0.4,
          ease: 'elastic.out(1, 0.5)',
          overwrite: true
        });
        activeTweens.push(tween);
      });
    });
  }

  /* ── Footer and dropdown link nudge (CURSOR-04) ── */
  function initLinkNudge() {
    if (!hasGsap) return;

    var links = document.querySelectorAll('.footer-col a, .dropdown a');
    links.forEach(function (link) {
      addListener(link, 'mouseenter', function () {
        var tween = gsap.to(link, {
          x: 3,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: true
        });
        activeTweens.push(tween);
      });
      addListener(link, 'mouseleave', function () {
        var tween = gsap.to(link, {
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true
        });
        activeTweens.push(tween);
      });
    });
  }

  /* ── Form focus states (CURSOR-05) ── */
  function initFormFocus() {
    // Focus states work on all devices (not touch-gated)
    var fields = document.querySelectorAll('input, textarea, select');
    fields.forEach(function (field) {
      addListener(field, 'focus', function () {
        field.classList.add('rr-focused');
      });
      addListener(field, 'blur', function () {
        field.classList.remove('rr-focused');
      });
    });
  }

  function init() {
    hasGsap = typeof gsap !== 'undefined';

    // Form focus states always initialize (not touch-gated)
    initFormFocus();

    // Animated hover effects — touch device and reduced motion gate
    if (isTouchDevice()) return;
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    isActive = true;

    initUnderlines();
    initShimmer();
    initButtonPulse();
    initLinkNudge();
  }

  function kill() {
    // Remove all event listeners
    listeners.forEach(function (l) {
      l.target.removeEventListener(l.event, l.handler, l.opts);
    });
    listeners = [];

    // Remove added CSS classes
    taggedElements.forEach(function (item) {
      item.el.classList.remove(item.cls);
    });
    taggedElements = [];

    // Kill running tweens
    if (hasGsap && typeof gsap !== 'undefined') {
      activeTweens.forEach(function (t) {
        if (t && t.kill) t.kill();
      });
    }
    activeTweens = [];
    isActive = false;
  }

  function refresh() {
    kill();
    init();
  }

  // Register with RR module system
  if (window.RR && window.RR.register) {
    window.RR.register('hoverEffects', { init: init, kill: kill, refresh: refresh });
  }

  // Self-initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

}());
