/**
 * navbar.js — Royal Regent Toys
 * Smart scroll hide/show navbar with GSAP transition
 *
 * Navbar hides on scroll-down and reveals on scroll-up (NAV-01)
 * Uses Lenis scroll events for consistency with smooth scroll
 * Dependencies: GSAP 3.14.2 (optional — CSS fallback), controller.js, scroll-engine.js
 */
(function () {
  'use strict';

  var navbar = null;
  var lastScrollY = 0;
  var isHidden = false;
  var canHide = false;
  var scrollThreshold = 10; // Min scroll distance to trigger hide/show
  var topThreshold = 80; // Always show navbar when near top
  var scrollListener = null;
  var windowListener = null;
  var hideTimer = null;
  var isActive = false;
  var hasGsap = false;

  function show() {
    if (!isHidden) return;
    isHidden = false;

    if (window.RR && window.RR.state) {
      window.RR.state.navHidden = false;
    }

    if (hasGsap) {
      if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) {
        gsap.set(navbar, { yPercent: 0 });
      } else {
        gsap.to(navbar, { yPercent: 0, duration: 0.35, ease: 'power3.out', overwrite: true });
      }
    } else {
      navbar.classList.remove('rr-nav-hidden');
    }
  }

  function hide() {
    if (isHidden) return;
    if (!canHide) return;

    // Don't hide if mobile menu is open
    if (window.RR && window.RR.state && window.RR.state.menuOpen) return;

    isHidden = true;

    if (window.RR && window.RR.state) {
      window.RR.state.navHidden = true;
    }

    if (hasGsap) {
      if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) {
        gsap.set(navbar, { yPercent: -100 });
      } else {
        gsap.to(navbar, { yPercent: -100, duration: 0.4, ease: 'power3.inOut', overwrite: true });
      }
    } else {
      navbar.classList.add('rr-nav-hidden');
    }
  }

  function handleScroll(scrollY, direction) {
    // Scroll-linked morph: 0 → 1 over the first 160px of scroll.
    // smoothstep easing so the buttons ease into the middle instead of snapping.
    var raw = scrollY / 160;
    if (raw < 0) raw = 0;
    else if (raw > 1) raw = 1;
    var progress = raw * raw * (3 - 2 * raw);
    navbar.style.setProperty('--nav-progress', progress);
    navbar.classList.toggle('scrolled', progress > 0.01);
  }

  function onLenisScroll(e) {
    handleScroll(e.scroll, e.direction);
  }

  function onWindowScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var direction = scrollY > lastScrollY ? 1 : -1;
    handleScroll(scrollY, direction);
  }

  function init() {
    navbar = document.getElementById('navbar');
    if (!navbar) return;

    hasGsap = typeof gsap !== 'undefined';
    isActive = true;
    isHidden = false;
    lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    // Initialize state
    if (window.RR && window.RR.state) {
      window.RR.state.navHidden = false;
    }

    // Prevent hide during hero entrance (first 2.5s)
    canHide = false;
    hideTimer = setTimeout(function () {
      canHide = true;
    }, 2500);

    // Use Lenis scroll if available, window scroll as fallback
    if (window.RR && window.RR.lenis) {
      scrollListener = onLenisScroll;
      window.RR.lenis.on('scroll', scrollListener);
    } else {
      windowListener = onWindowScroll;
      window.addEventListener('scroll', windowListener, { passive: true });
    }
  }

  function kill() {
    if (!isActive) return;

    // Remove scroll listener
    if (scrollListener && window.RR && window.RR.lenis) {
      window.RR.lenis.off('scroll', scrollListener);
      scrollListener = null;
    }
    if (windowListener) {
      window.removeEventListener('scroll', windowListener);
      windowListener = null;
    }

    // Clear timer
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    // Reset navbar position
    if (navbar) {
      if (hasGsap && typeof gsap !== 'undefined') {
        gsap.set(navbar, { clearProps: 'transform' });
      }
      navbar.classList.remove('rr-nav-hidden');
      navbar.classList.remove('scrolled');
      navbar.style.removeProperty('--nav-progress');
    }

    isActive = false;
    isHidden = false;
    canHide = false;
  }

  function refresh() {
    kill();
    init();
  }

  // Register with RR module system
  if (window.RR && window.RR.register) {
    window.RR.register('navbar', { init: init, kill: kill, refresh: refresh });
  }

  // Self-initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

}());
