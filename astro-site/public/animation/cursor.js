/**
 * cursor.js — Royal Regent Toys
 * Four-state custom cursor system with contextual morphing
 *
 * States: default (dot), link (expand), CTA (scale + label), crosshair
 * Strictly desktop-only: completely absent on touch devices (CURSOR-03)
 * Dependencies: GSAP 3.14.2 (optional — CSS fallback), controller.js
 */
(function () {
  'use strict';

  var dot, ring, label;
  var mouseX = -100, mouseY = -100;
  var ringX = -100, ringY = -100;
  var rafId = null;
  var hasGsap = false;
  var ringXTo, ringYTo;
  var firstMove = true;
  var currentState = 'default';
  var listeners = [];
  var isActive = false;

  function isTouchDevice() {
    // Primary check: responsive.js breakpoints
    if (window.RR && window.RR.breakpoints && window.RR.breakpoints.isCoarsePointer) return true;
    // Fallback: direct media query check
    if (window.matchMedia('(pointer: coarse)').matches) return true;
    if (window.matchMedia('(hover: none)').matches) return true;
    return false;
  }

  function addListener(target, event, handler, opts) {
    target.addEventListener(event, handler, opts || false);
    listeners.push({ target: target, event: event, handler: handler, opts: opts || false });
  }

  function createElements() {
    dot = document.createElement('div');
    dot.className = 'rr-cursor-dot';
    document.body.appendChild(dot);

    ring = document.createElement('div');
    ring.className = 'rr-cursor-ring';
    document.body.appendChild(ring);

    label = document.createElement('div');
    label.className = 'rr-cursor-label';
    document.body.appendChild(label);

    // Hide until first mouse move to prevent flash at 0,0
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  }

  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot follows instantly — direct transform, no GSAP overhead
    dot.style.transform = 'translate3d(' + mouseX + 'px,' + mouseY + 'px,0)';

    if (firstMove) {
      firstMove = false;
      ringX = mouseX;
      ringY = mouseY;
      ring.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0)';
      label.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0) translate(-50%,-50%)';
      dot.style.opacity = '';
      ring.style.opacity = '';
    }

    // Ring follows via GSAP quickTo if available
    if (hasGsap && ringXTo && ringYTo) {
      ringXTo(mouseX);
      ringYTo(mouseY);
    }
  }

  function animateRingFallback() {
    // Manual lerp for ring when GSAP not available
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0)';
    label.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0) translate(-50%,-50%)';
    rafId = requestAnimationFrame(animateRingFallback);
  }

  function updateLabelPosition() {
    // When using GSAP quickTo, ring position is managed by GSAP
    // We need to track ring position for label via onUpdate
    // Label follows ring with centered offset
    var rect = ring.getBoundingClientRect();
    var rx = rect.left + rect.width / 2;
    var ry = rect.top + rect.height / 2;
    label.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
  }

  function setState(state, el) {
    if (state === currentState) return;
    currentState = state;

    // Reset all state classes
    ring.className = 'rr-cursor-ring';
    dot.className = 'rr-cursor-dot';
    label.className = 'rr-cursor-label';

    if (state === 'link') {
      ring.classList.add('is-link');
      dot.classList.add('is-small');
    } else if (state === 'cta') {
      ring.classList.add('is-cta');
      dot.classList.add('is-hidden');
      var text = (el && el.getAttribute('data-cursor')) || 'VIEW';
      label.textContent = text;
      label.classList.add('is-visible');
    } else if (state === 'crosshair') {
      ring.classList.add('is-crosshair');
      dot.classList.add('is-crosshair');
    }
    // 'default' — no extra classes needed
  }

  function handleMouseOver(e) {
    var target = e.target;

    // Check in priority order: CTA > link > image > default
    var cta = target.closest('[data-cursor], .cap-card, .photo-panel');
    if (cta) {
      setState('cta', cta);
      return;
    }

    var link = target.closest('a, button, .magnetic, [role="button"]');
    if (link) {
      setState('link');
      return;
    }

    var img = target.closest('img, .img-reveal');
    if (img) {
      // Skip logo and loader images
      if (img.closest('.nav-logo, .loader-logo, .nav-container')) return;
      setState('crosshair');
      return;
    }
  }

  function handleMouseOut(e) {
    var target = e.target;
    var relatedTarget = e.relatedTarget;

    // Only reset if leaving a state-triggering element
    var triggerEl = target.closest('[data-cursor], .cap-card, .photo-panel, a, button, .magnetic, [role="button"], img, .img-reveal');
    if (!triggerEl) return;

    // Don't reset if moving to a child of the same trigger
    if (relatedTarget && triggerEl.contains(relatedTarget)) return;

    setState('default');
  }

  function init() {
    // CURSOR-03: Complete no-op on touch devices
    if (isTouchDevice()) return;

    hasGsap = typeof gsap !== 'undefined';

    createElements();

    // Hide native cursor
    document.body.classList.add('rr-cursor-active');
    isActive = true;

    // Mouse tracking
    addListener(document, 'mousemove', handleMouseMove);

    // Ring follow — GSAP quickTo or manual lerp
    if (hasGsap) {
      // GSAP quickTo for smooth ring follow
      ringXTo = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
      ringYTo = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

      // Update label position via GSAP ticker
      gsap.ticker.add(updateLabelPosition);
    } else {
      // Fallback: manual lerp RAF loop
      rafId = requestAnimationFrame(animateRingFallback);
    }

    // State detection via event delegation
    addListener(document, 'mouseover', handleMouseOver);
    addListener(document, 'mouseout', handleMouseOut);
  }

  function kill() {
    if (!isActive) return;

    // Remove all event listeners
    listeners.forEach(function (l) {
      l.target.removeEventListener(l.event, l.handler, l.opts);
    });
    listeners = [];

    // Cancel RAF
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Remove GSAP ticker
    if (hasGsap && typeof gsap !== 'undefined') {
      gsap.ticker.remove(updateLabelPosition);
    }

    // Remove DOM elements
    if (dot && dot.parentNode) dot.parentNode.removeChild(dot);
    if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
    if (label && label.parentNode) label.parentNode.removeChild(label);

    dot = null;
    ring = null;
    label = null;
    ringXTo = null;
    ringYTo = null;

    // Restore native cursor
    document.body.classList.remove('rr-cursor-active');
    isActive = false;
    firstMove = true;
    currentState = 'default';
  }

  function refresh() {
    kill();
    init();
  }

  // Register with RR module system
  if (window.RR && window.RR.register) {
    window.RR.register('cursor', { init: init, kill: kill, refresh: refresh });
  }

  // Self-initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

}());
