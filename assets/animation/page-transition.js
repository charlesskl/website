/**
 * page-transition.js — Royal Regent Toys
 * Clip-path overlay page transition masking hard reloads
 *
 * Brief green wipe covers page on navigation, hiding hard reload (NAV-03)
 * Uses capture-phase click listener to prevent old shared.js transition from double-firing
 * Dependencies: GSAP 3.14.2 (optional — navigates without animation), controller.js
 */
(function () {
  'use strict';

  var overlay = null;
  var clickHandler = null;
  var isActive = false;
  var hasGsap = false;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'rr-page-transition';
    document.body.appendChild(overlay);
  }

  function isInternalLink(link) {
    var href = link.getAttribute('href');
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (href.indexOf('mailto:') === 0) return false;
    if (href.indexOf('tel:') === 0) return false;
    if (href.indexOf('http') === 0) return false;
    if (href.indexOf('javascript') === 0) return false;
    if (link.hasAttribute('target')) return false;
    return true;
  }

  function handleClick(e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    if (!isInternalLink(link)) return;

    // Prevent double-transition — stop old shared.js handler from firing
    e.preventDefault();
    e.stopPropagation();

    var href = link.getAttribute('href');

    // Prevent double-click
    if (window.RR && window.RR.state && window.RR.state.isTransitioning) return;

    // Reduced motion: navigate immediately
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) {
      window.location.href = href;
      return;
    }

    // No GSAP: navigate immediately
    if (!hasGsap) {
      window.location.href = href;
      return;
    }

    // Set transitioning flag
    if (window.RR && window.RR.state) {
      window.RR.state.isTransitioning = true;
    }

    // Store transition state for entry animation on destination
    sessionStorage.setItem('rr_page_wipe', '1');

    // Safety timeout: if navigation doesn't happen in 3s, force it
    var safetyTimer = setTimeout(function () {
      window.location.href = href;
    }, 3000);

    // Exit transition — green wipe covers from left
    gsap.timeline({
      onComplete: function () {
        clearTimeout(safetyTimer);
        window.location.href = href;
      }
    }).to(overlay, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.45,
      ease: 'power3.inOut'
    });
  }

  function playEntryTransition() {
    // Check if arriving from an internal page transition
    if (sessionStorage.getItem('rr_page_wipe') !== '1') return;
    sessionStorage.removeItem('rr_page_wipe');

    if (!hasGsap || !overlay) return;

    // Reduced motion: skip reveal animation
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    // Set overlay to fully covering
    gsap.set(overlay, { clipPath: 'inset(0 0 0 0)' });

    // Reveal by wiping overlay off to the right
    gsap.to(overlay, {
      clipPath: 'inset(0 0 0 100%)',
      duration: 0.5,
      ease: 'power3.inOut',
      delay: 0.05,
      onComplete: function () {
        // Reset overlay to initial state
        gsap.set(overlay, { clipPath: 'inset(0 100% 0 0)' });

        // Clear transitioning flag
        if (window.RR && window.RR.state) {
          window.RR.state.isTransitioning = false;
        }
      }
    });
  }

  function init() {
    hasGsap = typeof gsap !== 'undefined';
    isActive = true;

    createOverlay();

    // Click handler in capture phase — runs BEFORE shared.js bubble handler
    clickHandler = handleClick;
    document.addEventListener('click', clickHandler, true);

    // Play entry transition if arriving from internal navigation
    playEntryTransition();
  }

  function kill() {
    if (!isActive) return;

    // Remove click listener
    if (clickHandler) {
      document.removeEventListener('click', clickHandler, true);
      clickHandler = null;
    }

    // Remove overlay
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      overlay = null;
    }

    // Clear session storage
    sessionStorage.removeItem('rr_page_wipe');

    // Clear transitioning flag
    if (window.RR && window.RR.state) {
      window.RR.state.isTransitioning = false;
    }

    isActive = false;
  }

  function refresh() {
    // Page transition doesn't need refresh on breakpoint change
  }

  // Register with RR module system
  if (window.RR && window.RR.register) {
    window.RR.register('pageTransition', { init: init, kill: kill, refresh: refresh });
  }

  // Self-initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

}());
