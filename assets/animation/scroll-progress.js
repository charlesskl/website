(function () {
  'use strict';

  // ─── SCROLL PROGRESS INDICATOR ────────────────────────────────
  // Fixed progress bar at the top of the viewport that accurately
  // reflects page scroll position. Works with or without GSAP —
  // falls back to native scroll listener if CDN fails.
  //
  // NOT gated by reduced-motion — this is an informational UI
  // element, not a decorative animation.

  var progressBar = null;
  var scrollTriggerInstance = null;
  var scrollListener = null;

  /**
   * Creates and injects the progress bar element into the DOM.
   */
  function createProgressBar() {
    var bar = document.createElement('div');
    bar.className = 'rr-scroll-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Page scroll progress');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', '0');
    document.body.appendChild(bar);
    return bar;
  }

  /**
   * Updates the progress bar scale and aria value.
   */
  function updateProgress(progress) {
    if (!progressBar) return;
    progressBar.style.transform = 'scaleX(' + progress + ')';
    progressBar.setAttribute('aria-valuenow', Math.round(progress * 100));
  }

  /**
   * GSAP-based progress tracking using ScrollTrigger.
   */
  function initWithGSAP() {
    scrollTriggerInstance = ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: function (self) {
        updateProgress(self.progress);
      }
    });
  }

  /**
   * Fallback: native scroll listener for progress tracking.
   */
  function initWithNativeScroll() {
    scrollListener = function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;
      updateProgress(progress);
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    // Initial calculation
    scrollListener();
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // Create the progress bar element
    progressBar = createProgressBar();

    // Use GSAP if available, otherwise fallback to native
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      initWithGSAP();
    } else {
      initWithNativeScroll();
    }
  }

  function kill() {
    // Kill ScrollTrigger instance
    if (scrollTriggerInstance) {
      try { scrollTriggerInstance.kill(); } catch (e) { /* ignore */ }
      scrollTriggerInstance = null;
    }

    // Remove native scroll listener
    if (scrollListener) {
      window.removeEventListener('scroll', scrollListener);
      scrollListener = null;
    }

    // Remove progress bar from DOM
    if (progressBar && progressBar.parentNode) {
      progressBar.parentNode.removeChild(progressBar);
      progressBar = null;
    }
  }

  function refresh() {
    kill();
    init();
  }

  // ─── REGISTER MODULE ──────────────────────────────────────────

  window.RR = window.RR || {};

  if (typeof window.RR.register === 'function') {
    window.RR.register('scrollProgress', { init: init, kill: kill, refresh: refresh });
  }

}());
