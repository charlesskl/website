(function () {
  'use strict';

  // ─── SECTION CHOREOGRAPHY ─────────────────────────────────────
  // Coordinated section-level ScrollTrigger sequences replacing
  // generic data-reveal fade-in animations. Groups reveal-up
  // elements by parent section and creates choreographed timelines
  // where elements enter in designed sequence, not independently.
  //
  // Carefully avoids double-animating elements already owned by:
  //   - scroll-text.js (headings with .rr-word/.rr-line children)
  //   - text-scramble.js (#stmtAccent, #historyWatermark)
  //   - capsReveal() inline (elements inside .cap-card)
  //   - statementEntrance() inline (.stmt-line, #stmtLine, #stmtRule)

  var trackedTimelines = [];
  var trackedTriggers = [];
  var ownedElements = [];

  /**
   * Checks if an element is already owned by another animation module.
   * Returns true if the element should be SKIPPED.
   */
  function isOwnedByOtherModule(el) {
    // Owned by scroll-text.js (SplitText has processed it)
    if (el.querySelector('.rr-word, .rr-line, .rr-char')) return true;

    // Owned by text-scramble.js
    if (el.id === 'stmtAccent' || el.id === 'historyWatermark') return true;

    // Owned by capsReveal() inline or scroll-reveals.js
    if (el.closest('.cap-card')) return true;

    // Owned by statementEntrance() inline
    if (el.classList.contains('stmt-line')) return true;
    if (el.id === 'stmtLine' || el.id === 'stmtRule') return true;

    // Inside hero sections (owned by hero.js)
    if (el.closest('.hero-content, .about-hero-content, .sub-hero-content')) return true;

    return false;
  }

  /**
   * Takes ownership of an element — overrides CSS reveal styles
   * and marks it to prevent CSS transition conflicts.
   */
  function takeOwnership(el, initialState) {
    el.classList.add('rr-choreographed');
    gsap.set(el, Object.assign({ clearProps: 'transition' }, initialState));
    ownedElements.push(el);
  }

  /**
   * Collects reveal-up elements within a section that are NOT
   * already owned by other modules.
   */
  function getAvailableReveals(section) {
    var elements = section.querySelectorAll('.reveal-up, [data-reveal]');
    var available = [];

    for (var i = 0; i < elements.length; i++) {
      if (!isOwnedByOtherModule(elements[i])) {
        available.push(elements[i]);
      }
    }

    return available;
  }

  // ─── SECTION-SPECIFIC CHOREOGRAPHY ─────────────────────────────

  /**
   * Contact section choreography:
   * label → heading → paragraph → contact details (staggered)
   */
  function choreographContact() {
    var section = document.querySelector('.contact-section');
    if (!section) return;

    var label = section.querySelector('.section-label.reveal-up');
    var heading = section.querySelector('h2.reveal-up');
    var paragraphs = section.querySelectorAll('p.reveal-up');
    var details = section.querySelectorAll('.contact-detail.reveal-up');
    var form = section.querySelector('.reveal-up:not(.section-label):not(h2):not(p):not(.contact-detail)');

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true
      }
    });

    if (label && !isOwnedByOtherModule(label)) {
      takeOwnership(label, { opacity: 0, y: 20 });
      tl.to(label, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }

    if (heading && !isOwnedByOtherModule(heading)) {
      takeOwnership(heading, { opacity: 0, y: 30 });
      tl.to(heading, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
    }

    if (paragraphs.length) {
      paragraphs.forEach(function (p) {
        if (!isOwnedByOtherModule(p)) {
          takeOwnership(p, { opacity: 0, y: 20 });
        }
      });
      var availableP = Array.from(paragraphs).filter(function (p) { return !isOwnedByOtherModule(p); });
      if (availableP.length) {
        tl.to(availableP, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 }, '-=0.3');
      }
    }

    if (details.length) {
      details.forEach(function (d) {
        if (!isOwnedByOtherModule(d)) {
          takeOwnership(d, { opacity: 0, y: 25 });
        }
      });
      var availableD = Array.from(details).filter(function (d) { return !isOwnedByOtherModule(d); });
      if (availableD.length) {
        tl.to(availableD, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08 }, '-=0.2');
      }
    }

    if (form && !isOwnedByOtherModule(form)) {
      takeOwnership(form, { opacity: 0, y: 20 });
      tl.to(form, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');
    }

    trackedTimelines.push(tl);
    if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
  }

  /**
   * Editorial section choreography (capability pages):
   * label → intro block → features stagger from right
   */
  function choreographEditorial() {
    var sections = document.querySelectorAll('.editorial');

    sections.forEach(function (section) {
      var label = section.querySelector('.section-label.reveal-up');
      var intro = section.querySelector('.editorial-intro.reveal-up');
      var introLine = section.querySelector('.editorial-intro-line');
      var features = section.querySelectorAll('.editorial-feat.reveal-up');

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true
        }
      });

      if (label && !isOwnedByOtherModule(label)) {
        takeOwnership(label, { opacity: 0, y: 15 });
        tl.to(label, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
      }

      if (intro && !isOwnedByOtherModule(intro)) {
        takeOwnership(intro, { opacity: 0, y: 25 });
        tl.to(intro, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.25');

        // Animate the intro line drawing in
        if (introLine) {
          gsap.set(introLine, { scaleY: 0 });
          tl.to(introLine, { scaleY: 1, duration: 0.5, ease: 'power3.out' }, '<');
        }
      }

      if (features.length) {
        features.forEach(function (feat) {
          if (!isOwnedByOtherModule(feat)) {
            takeOwnership(feat, { opacity: 0, x: 30, y: 15 });
          }
        });
        var availableFeats = Array.from(features).filter(function (f) { return !isOwnedByOtherModule(f); });
        if (availableFeats.length) {
          tl.to(availableFeats, {
            opacity: 1, x: 0, y: 0,
            duration: 0.5, ease: 'power3.out',
            stagger: 0.12
          }, '-=0.2');
        }
      }

      trackedTimelines.push(tl);
      if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
    });
  }

  /**
   * CTA section choreography:
   * heading → paragraph → button in sequence
   */
  function choreographCTA() {
    var sections = document.querySelectorAll('.cta-section');

    sections.forEach(function (section) {
      var container = section.querySelector('.container.reveal-up') || section.querySelector('.container');
      if (!container) return;

      // If the container itself has reveal-up, override it
      if (container.classList.contains('reveal-up') && !isOwnedByOtherModule(container)) {
        takeOwnership(container, { opacity: 1, y: 0 });
      }

      var heading = container.querySelector('h2');
      var paragraph = container.querySelector('p');
      var button = container.querySelector('.btn');

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          once: true
        }
      });

      if (heading) {
        gsap.set(heading, { opacity: 0, y: 25 });
        tl.to(heading, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      }

      if (paragraph) {
        gsap.set(paragraph, { opacity: 0, y: 20 });
        tl.to(paragraph, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.4');
      }

      if (button) {
        gsap.set(button, { opacity: 0, y: 15 });
        tl.to(button, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.3');
      }

      trackedTimelines.push(tl);
      if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
    });
  }

  /**
   * Value cards choreography (careers page):
   * Cards stagger in with slide-up + subtle scale
   */
  function choreographValueCards() {
    var cards = document.querySelectorAll('.value-card.reveal-up');
    if (!cards.length) return;

    var parent = cards[0].parentElement;
    if (!parent) return;

    cards.forEach(function (card) {
      if (!isOwnedByOtherModule(card)) {
        takeOwnership(card, { opacity: 0, y: 40, scale: 0.97 });
      }
    });

    var availableCards = Array.from(cards).filter(function (c) { return !isOwnedByOtherModule(c); });
    if (!availableCards.length) return;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: parent,
        start: 'top 80%',
        once: true
      }
    });

    tl.to(availableCards, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.6, ease: 'power3.out',
      stagger: 0.1
    });

    trackedTimelines.push(tl);
    if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
  }

  /**
   * Generic fallback for any reveal-up or data-reveal element
   * not handled by a section-specific choreography above.
   * Applies directional reveal based on viewport position.
   */
  function choreographGenericFallback() {
    var allReveals = document.querySelectorAll('.reveal-up, [data-reveal]');

    allReveals.forEach(function (el) {
      // Skip if already owned by another module or choreography
      if (isOwnedByOtherModule(el)) return;
      if (el.classList.contains('rr-choreographed')) return;

      // Determine direction based on data-reveal attribute or position
      var revealType = el.getAttribute('data-reveal');
      var initialState = { opacity: 0 };

      if (revealType === 'left') {
        initialState.x = -30;
      } else if (revealType === 'right') {
        initialState.x = 30;
      } else if (revealType === 'fade') {
        // Just opacity, no transform
      } else {
        // Default: slide up
        initialState.y = 25;
      }

      takeOwnership(el, initialState);

      var toState = { opacity: 1, y: 0, x: 0, duration: 0.6, ease: 'power3.out' };

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });

      tl.to(el, toState);

      trackedTimelines.push(tl);
      if (tl.scrollTrigger) trackedTriggers.push(tl.scrollTrigger);
    });
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // CDN graceful degradation — let CSS/IO fallback handle reveals
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    // Reduced motion gate: make everything visible immediately
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) {
      var allReveals = document.querySelectorAll('.reveal-up, [data-reveal]');
      allReveals.forEach(function (el) {
        gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1, clearProps: 'transform' });
        el.classList.add('is-revealed');
      });
      return;
    }

    // Run section-specific choreographies first
    choreographContact();
    choreographEditorial();
    choreographCTA();
    choreographValueCards();

    // Then catch any remaining unhandled reveals
    choreographGenericFallback();
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

    // Reset all owned elements to visible
    ownedElements.forEach(function (el) {
      try {
        gsap.set(el, { clearProps: 'all' });
        el.classList.remove('rr-choreographed');
      } catch (e) { /* ignore */ }
    });
    ownedElements = [];
  }

  function refresh() {
    kill();
    init();
  }

  // ─── REGISTER MODULE ──────────────────────────────────────────

  window.RR = window.RR || {};

  if (typeof window.RR.register === 'function') {
    window.RR.register('sectionChoreography', { init: init, kill: kill, refresh: refresh });
  }

}());
