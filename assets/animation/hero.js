(function () {
  'use strict';

  // ─── HERO OPENING SEQUENCE ────────────────────────────────────
  // Master timeline for hero entrance: preloader handoff (homepage),
  // SplitText char-by-char masked stagger on headlines (all pages),
  // coordinated tag/subtitle/CTA/scroll-hint entrance.
  // Total sequence under 2.5 seconds.

  var masterTL = null;
  var heroSplitInstance = null;
  var observer = null;

  // ─── PAGE-SPECIFIC SELECTOR MAP ─────────────────────────────

  var SELECTORS = {
    home: {
      title: '#heroTitle',
      tag: '#heroTag',
      sub: '#heroSub',
      actions: '#heroActions',
      scroll: '#heroScroll'
    },
    about: {
      title: '#aboutTitle',
      tag: '#aboutTag',
      sub: '#aboutSub',
      actions: null,
      scroll: '#aboutScroll'
    },
    // All other pages (capabilities, contact, careers) use standard selectors
    _default: {
      title: '#heroTitle',
      tag: '#heroTag',
      sub: '#heroSub',
      actions: null,
      scroll: '#heroScroll'
    }
  };

  function getSelectors() {
    var page = (window.RR && window.RR.page) ? window.RR.page : '';
    if (SELECTORS[page]) return SELECTORS[page];
    return SELECTORS._default;
  }

  // ─── BUILD HERO MASTER TIMELINE ───────────────────────────────

  function buildTimeline(callback) {
    var sel = getSelectors();
    var titleEl = document.querySelector(sel.title);
    var tagEl = sel.tag ? document.querySelector(sel.tag) : null;
    var subEl = sel.sub ? document.querySelector(sel.sub) : null;
    var actionsEl = sel.actions ? document.querySelector(sel.actions) : null;
    var scrollEl = sel.scroll ? document.querySelector(sel.scroll) : null;

    if (!titleEl) {
      // No hero title on this page -- nothing to animate
      if (callback) callback(null);
      return;
    }

    var hasSplitText = typeof SplitText !== 'undefined';
    var hasTextSystem = window.RR && window.RR.textSystem && typeof window.RR.textSystem.split === 'function';

    if (hasSplitText && hasTextSystem) {
      // Use SplitText for character-level masked reveal
      window.RR.textSystem.split(titleEl, {
        type: 'chars,words,lines',
        linesClass: 'rr-line',
        wordsClass: 'rr-word',
        charsClass: 'rr-char',
        mask: 'overflow'
      }).then(function (splitInstance) {
        heroSplitInstance = splitInstance;
        var tl = createTimelineWithChars(splitInstance, titleEl, tagEl, subEl, actionsEl, scrollEl);
        if (callback) callback(tl);
      });
    } else {
      // Fallback: simple opacity/y tweens (no SplitText CDN)
      var tl = createFallbackTimeline(titleEl, tagEl, subEl, actionsEl, scrollEl);
      if (callback) callback(tl);
    }
  }

  /**
   * Creates the master timeline using SplitText character animation.
   * Chars slide up from below their overflow:hidden masks (yPercent: 100 -> 0).
   */
  function createTimelineWithChars(splitInstance, titleEl, tagEl, subEl, actionsEl, scrollEl) {
    masterTL = gsap.timeline({ paused: true });

    // a) Clear FOUC prevention on title — make parent visible so chars show within masks
    masterTL.set(titleEl, { opacity: 1, y: 0 });

    // b) Animate tag first (above headline)
    if (tagEl) {
      masterTL.fromTo(tagEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
        0
      );
    }

    // c) SplitText chars masked stagger — the hero moment
    if (splitInstance && splitInstance.chars && splitInstance.chars.length > 0) {
      masterTL.fromTo(splitInstance.chars,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.8, stagger: 0.02, ease: 'power3.out' },
        0.15
      );
    }

    // d) Subtitle fade in
    if (subEl) {
      masterTL.fromTo(subEl,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        0.6
      );
    }

    // e) CTA buttons (homepage only)
    if (actionsEl) {
      masterTL.fromTo(actionsEl,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
        0.8
      );
    }

    // f) Scroll hint
    if (scrollEl) {
      masterTL.fromTo(scrollEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' },
        1.0
      );
    }

    return masterTL;
  }

  /**
   * Fallback timeline when SplitText CDN is unavailable.
   * Simple opacity + y tweens matching the old heroEntrance pattern.
   */
  function createFallbackTimeline(titleEl, tagEl, subEl, actionsEl, scrollEl) {
    masterTL = gsap.timeline({ paused: true });

    if (tagEl) {
      masterTL.fromTo(tagEl,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        0
      );
    }

    masterTL.fromTo(titleEl,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
      0.15
    );

    if (subEl) {
      masterTL.fromTo(subEl,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        0.5
      );
    }

    if (actionsEl) {
      masterTL.fromTo(actionsEl,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        0.7
      );
    }

    if (scrollEl) {
      masterTL.fromTo(scrollEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        0.9
      );
    }

    return masterTL;
  }

  // ─── PRELOADER HANDOFF (HOMEPAGE) ─────────────────────────────

  /**
   * On homepage: observe #brandLoader for the 'exit-bg' class addition.
   * When detected, the loader background is fading — begin hero timeline
   * immediately for seamless overlap/handoff.
   */
  function waitForPreloaderExit(tl) {
    var loader = document.getElementById('brandLoader');

    if (!loader) {
      // No preloader element — play immediately
      tl.play();
      return;
    }

    // If preloader already dismissed (e.g., cached page, fast reload)
    if (loader.classList.contains('dismissed') || loader.classList.contains('exit-bg')) {
      tl.play();
      return;
    }

    // Watch for exit-bg class addition via MutationObserver
    observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].type === 'attributes' && mutations[i].attributeName === 'class') {
          if (loader.classList.contains('exit-bg')) {
            // Preloader background starting to fade — begin hero entrance
            tl.play();
            observer.disconnect();
            observer = null;
            return;
          }
        }
      }
    });

    observer.observe(loader, { attributes: true, attributeFilter: ['class'] });

    // Safety timeout: if preloader never fires exit-bg within 5 seconds, play anyway
    setTimeout(function () {
      if (observer) {
        observer.disconnect();
        observer = null;
        tl.play();
      }
    }, 5000);
  }

  // ─── REDUCED MOTION INSTANT REVEAL ────────────────────────────

  function instantReveal() {
    var sel = getSelectors();
    var titleEl = sel.title ? document.querySelector(sel.title) : null;
    var tagEl = sel.tag ? document.querySelector(sel.tag) : null;
    var subEl = sel.sub ? document.querySelector(sel.sub) : null;
    var actionsEl = sel.actions ? document.querySelector(sel.actions) : null;
    var scrollEl = sel.scroll ? document.querySelector(sel.scroll) : null;

    var elements = [titleEl, tagEl, subEl, actionsEl, scrollEl].filter(Boolean);
    if (elements.length > 0 && typeof gsap !== 'undefined') {
      gsap.set(elements, { clearProps: 'all' });
    }
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // CDN graceful degradation: show hero elements immediately if GSAP unavailable
    if (typeof gsap === 'undefined') {
      var sel = getSelectors();
      var titleEl = sel.title ? document.querySelector(sel.title) : null;
      var tagEl = sel.tag ? document.querySelector(sel.tag) : null;
      var subEl = sel.sub ? document.querySelector(sel.sub) : null;
      var actionsEl = sel.actions ? document.querySelector(sel.actions) : null;
      [titleEl, tagEl, subEl, actionsEl].filter(Boolean).forEach(function(el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Reduced motion gate (HERO-05): instant reveal, no animation
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) {
      instantReveal();
      return;
    }

    var isHomepage = window.RR && window.RR.page === 'home';

    // Safety: force-reveal hero elements if animation hasn't started within 1.2s
    // Covers slow CDN font loading that delays textSystem.split() resolution
    if (!isHomepage) {
      var sel = getSelectors();
      var safetyTimer = setTimeout(function() {
        var els = [sel.title, sel.tag, sel.sub, sel.actions].filter(Boolean)
          .map(function(s) { return document.querySelector(s); }).filter(Boolean);
        els.forEach(function(el) {
          if (parseFloat(window.getComputedStyle(el).opacity) < 0.05) {
            el.style.opacity = '1';
            el.style.transform = 'none';
          }
        });
      }, 1200);

      buildTimeline(function (tl) {
        clearTimeout(safetyTimer);
        if (!tl) return;
        tl.play();
      });
    } else {
      buildTimeline(function (tl) {
        if (!tl) return;
        waitForPreloaderExit(tl);
      });
    }
  }

  function kill() {
    // Kill master timeline
    if (masterTL) {
      masterTL.kill();
      masterTL = null;
    }

    // Disconnect observer if active
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // Revert SplitText instance created by this module
    // Note: textSystem.killAll() handles global cleanup,
    // but we track our own instance for targeted revert
    heroSplitInstance = null;
  }

  function refresh() {
    // Re-build timeline after breakpoint change / text re-split
    kill();
    init();
  }

  // ─── REGISTER MODULE ──────────────────────────────────────────

  window.RR = window.RR || {};

  if (typeof window.RR.register === 'function') {
    window.RR.register('hero', { init: init, kill: kill, refresh: refresh });
  }

  // Self-initialize on DOMContentLoaded (module system may not call initAll)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    requestAnimationFrame(init);
  }

}());
