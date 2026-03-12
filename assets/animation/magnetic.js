/**
 * magnetic.js — Royal Regent Toys
 * GSAP quickTo magnetic button attraction with spring physics
 *
 * CTA buttons attract cursor on approach with elastic snap (CURSOR-02)
 * Strictly desktop-only: no-op on touch devices (CURSOR-03)
 * Dependencies: GSAP 3.14.2 (required), controller.js
 */
(function () {
  'use strict';

  var listeners = [];
  var quickTos = [];
  var isActive = false;

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

  function init() {
    // Touch device gate — complete no-op
    if (isTouchDevice()) return;

    // CDN graceful degradation — requires GSAP for spring physics
    if (typeof gsap === 'undefined') return;

    // Reduced motion gate — skip magnetic pull
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    var targets = document.querySelectorAll('[data-magnetic], .btn, .nav-cta, .magnetic');
    if (!targets.length) return;

    isActive = true;

    targets.forEach(function (el) {
      var strength = parseFloat(el.dataset.magnetic || el.dataset.strength) || 0.35;
      var radius = parseFloat(el.dataset.magneticRadius) || 80;

      // Create quickTo tweens for spring physics
      var xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.3)' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.3)' });
      quickTos.push({ el: el, xTo: xTo, yTo: yTo });

      // Direct mousemove on element — full strength attraction
      var moveHandler = function (e) {
        var rect = el.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        xTo(relX * strength);
        yTo(relY * strength);
      };
      addListener(el, 'mousemove', moveHandler);

      // Mouseleave — snap back to origin
      var leaveHandler = function () {
        xTo(0);
        yTo(0);
      };
      addListener(el, 'mouseleave', leaveHandler);

      // Attraction radius — subtle pull as cursor approaches
      var parent = el.parentElement;
      if (parent) {
        var proximityHandler = function (e) {
          var rect = el.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = e.clientX - cx;
          var dy = e.clientY - cy;
          var dist = Math.sqrt(dx * dx + dy * dy);

          // Only apply when mouse is outside the element but within radius
          var isInsideElement = (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          );

          if (!isInsideElement && dist < radius) {
            var pull = 1 - (dist / radius); // 0 at edge, 1 at center
            xTo(dx * strength * pull * 0.3);
            yTo(dy * strength * pull * 0.3);
          }
        };
        addListener(parent, 'mousemove', proximityHandler);

        // Reset when mouse leaves parent area entirely
        var parentLeaveHandler = function (e) {
          // Check if truly leaving parent (not entering child)
          if (!parent.contains(e.relatedTarget)) {
            xTo(0);
            yTo(0);
          }
        };
        addListener(parent, 'mouseleave', parentLeaveHandler);
      }
    });
  }

  function kill() {
    if (!isActive) return;

    // Remove all event listeners
    listeners.forEach(function (l) {
      l.target.removeEventListener(l.event, l.handler, l.opts);
    });
    listeners = [];

    // Reset all magnetic elements to origin
    if (typeof gsap !== 'undefined') {
      quickTos.forEach(function (qt) {
        gsap.set(qt.el, { x: 0, y: 0 });
      });
    }
    quickTos = [];
    isActive = false;
  }

  function refresh() {
    kill();
    init();
  }

  // Register with RR module system
  if (window.RR && window.RR.register) {
    window.RR.register('magnetic', { init: init, kill: kill, refresh: refresh });
  }

  // Self-initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

}());
