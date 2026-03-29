/**
 * mobile-menu.js — Royal Regent Toys
 * Coordinated GSAP timeline for mobile menu open/close
 *
 * Replaces instant CSS toggle with animated timeline (NAV-02)
 * Staggered link reveals, hamburger X animation, Lenis scroll lock
 * Dependencies: GSAP 3.14.2 (optional — CSS fallback), controller.js, scroll-engine.js
 */
(function () {
  'use strict';

  var hamburger = null;
  var navLinks = null;
  var openTl = null;
  var closeTl = null;
  var isOpen = false;
  var isActive = false;
  var hasGsap = false;
  var listeners = [];

  function addListener(target, event, handler, opts) {
    target.addEventListener(event, handler, opts || false);
    listeners.push({ target: target, event: event, handler: handler, opts: opts || false });
  }

  function lockScroll() {
    if (window.RR && window.RR.lenis) {
      window.RR.lenis.stop();
    }
    document.body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    if (window.RR && window.RR.lenis) {
      window.RR.lenis.start();
    }
    document.body.style.overflow = '';
  }

  function openMenu() {
    if (isOpen) return;
    isOpen = true;

    // Update state
    if (window.RR && window.RR.state) {
      window.RR.state.menuOpen = true;
    }

    hamburger.setAttribute('aria-expanded', 'true');
    lockScroll();

    if (hasGsap) {
      // Kill any running close timeline
      if (closeTl) closeTl.kill();

      var items = navLinks.querySelectorAll(':scope > li');
      var spans = hamburger.querySelectorAll('span');

      openTl = gsap.timeline();

      // Slide panel in
      openTl.to(navLinks, {
        x: 0,
        duration: 0.5,
        ease: 'power3.inOut'
      });

      // Stagger links in
      openTl.fromTo(items,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          stagger: 0.06,
          ease: 'power2.out'
        },
        '-=0.25' // Overlap with panel slide
      );

      // Hamburger to X
      if (spans.length >= 3) {
        openTl.to(spans[0], {
          rotation: 45,
          y: 6,
          duration: 0.25,
          ease: 'power2.inOut'
        }, 0);
        openTl.to(spans[1], {
          opacity: 0,
          duration: 0.15,
          ease: 'power2.out'
        }, 0);
        openTl.to(spans[2], {
          rotation: -45,
          y: -6,
          duration: 0.25,
          ease: 'power2.inOut'
        }, 0);
      }

      // Add open class for CSS fallback state
      navLinks.classList.add('open');
      navLinks.classList.add('rr-menu-open');
      hamburger.classList.add('open');
      hamburger.classList.add('is-x');
    } else {
      // CSS fallback — instant toggle
      navLinks.classList.add('open');
      navLinks.classList.add('rr-menu-open');
      hamburger.classList.add('open');
      hamburger.classList.add('is-x');
    }
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;

    // Update state
    if (window.RR && window.RR.state) {
      window.RR.state.menuOpen = false;
    }

    hamburger.setAttribute('aria-expanded', 'false');

    if (hasGsap) {
      // Kill any running open timeline
      if (openTl) openTl.kill();

      var items = navLinks.querySelectorAll(':scope > li');
      var spans = hamburger.querySelectorAll('span');

      closeTl = gsap.timeline({
        onComplete: function () {
          navLinks.classList.remove('open');
          navLinks.classList.remove('rr-menu-open');
          hamburger.classList.remove('open');
          hamburger.classList.remove('is-x');
          unlockScroll();
          // Reset inline styles for clean state
          gsap.set(items, { clearProps: 'opacity,x' });
        }
      });

      // Fade links out simultaneously (faster than stagger)
      closeTl.to(items, {
        opacity: 0,
        x: 15,
        duration: 0.2,
        ease: 'power2.in'
      });

      // Slide panel out
      closeTl.to(navLinks, {
        x: '100%',
        duration: 0.35,
        ease: 'power3.inOut'
      }, '-=0.1');

      // Hamburger back to lines
      if (spans.length >= 3) {
        closeTl.to(spans[0], {
          rotation: 0,
          y: 0,
          duration: 0.2,
          ease: 'power2.inOut'
        }, 0);
        closeTl.to(spans[1], {
          opacity: 1,
          duration: 0.15,
          ease: 'power2.out'
        }, 0.1);
        closeTl.to(spans[2], {
          rotation: 0,
          y: 0,
          duration: 0.2,
          ease: 'power2.inOut'
        }, 0);
      }
    } else {
      // CSS fallback
      navLinks.classList.remove('open');
      navLinks.classList.remove('rr-menu-open');
      hamburger.classList.remove('open');
      hamburger.classList.remove('is-x');
      unlockScroll();
    }
  }

  function toggleMenu() {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function handleOutsideClick(e) {
    if (!isOpen) return;
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  }

  function handleEscape(e) {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      hamburger.focus(); // Return focus to toggle
    }
  }

  function handleNavLinkClick(e) {
    // Close menu when a nav link is clicked (navigation)
    var link = e.target.closest('a[href]');
    if (link && isOpen) {
      closeMenu();
    }
  }

  function init() {
    hasGsap = typeof gsap !== 'undefined';

    // Find elements
    var oldBtn = document.getElementById('hamburger');
    navLinks = document.getElementById('navLinks');
    if (!oldBtn || !navLinks) return;

    // Clone hamburger to remove old shared.js event listeners
    hamburger = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(hamburger, oldBtn);

    isActive = true;

    // Set initial panel position for GSAP animation (mobile only)
    if (hasGsap && window.innerWidth <= 768) {
      gsap.set(navLinks, { x: '100%' });
    }

    // Hamburger click toggles menu
    addListener(hamburger, 'click', function (e) {
      e.stopPropagation(); // Prevent outside click handler from firing immediately
      toggleMenu();
    });

    // Close on outside click
    addListener(document, 'click', handleOutsideClick);

    // Close on ESC key
    addListener(document, 'keydown', handleEscape);

    // Close when clicking a nav link (for navigation)
    addListener(navLinks, 'click', handleNavLinkClick);
  }

  function kill() {
    if (!isActive) return;

    // Close menu if open
    if (isOpen) {
      isOpen = false;
      if (window.RR && window.RR.state) {
        window.RR.state.menuOpen = false;
      }
      unlockScroll();
    }

    // Kill timelines
    if (openTl) { openTl.kill(); openTl = null; }
    if (closeTl) { closeTl.kill(); closeTl = null; }

    // Remove all event listeners
    listeners.forEach(function (l) {
      l.target.removeEventListener(l.event, l.handler, l.opts);
    });
    listeners = [];

    // Reset classes and inline styles
    if (navLinks) {
      navLinks.classList.remove('open', 'rr-menu-open');
      if (hasGsap && typeof gsap !== 'undefined') {
        gsap.set(navLinks, { clearProps: 'all' });
      }
    }
    if (hamburger) {
      hamburger.classList.remove('open', 'is-x');
      hamburger.setAttribute('aria-expanded', 'false');
      if (hasGsap && typeof gsap !== 'undefined') {
        var spans = hamburger.querySelectorAll('span');
        gsap.set(spans, { clearProps: 'all' });
      }
    }

    isActive = false;
  }

  function refresh() {
    kill();
    init();
  }

  // Register with RR module system
  if (window.RR && window.RR.register) {
    window.RR.register('mobileMenu', { init: init, kill: kill, refresh: refresh });
  }

  // Self-initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

}());
