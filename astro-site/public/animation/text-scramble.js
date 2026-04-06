(function () {
  'use strict';

  // ─── MATRIX-STYLE TEXT SCRAMBLE ─────────────────────────────────
  // Scrambles text characters randomly before resolving to final value.
  // Targets: #stmtAccent (1987 statement), #historyWatermark (1987 background).
  // Uses ScrollTrigger.create() with scrollTrigger-style viewport gating.

  var SCRAMBLE_CHARS = '0123456789ABCDEF!@#$%';
  var trackedTweens = [];
  var trackedTriggers = [];

  /**
   * Scrambles text content of an element with Matrix-style randomization.
   * Characters resolve left-to-right as progress advances.
   *
   * @param {HTMLElement} element - Target DOM element
   * @param {string} finalText - The text to resolve to
   * @param {Object} [options] - Configuration
   * @param {string} [options.chars] - Character set for randomization
   * @param {number} [options.duration] - Total duration in seconds
   * @param {number} [options.revealDelay] - Per-character resolve stagger
   */
  function scrambleText(element, finalText, options) {
    var chars = (options && options.chars) || SCRAMBLE_CHARS;
    var duration = (options && options.duration) || 1.2;
    var revealDelay = (options && options.revealDelay) || 0.08;
    var totalChars = finalText.length;

    // Apply tabular-nums to prevent layout shift during scramble
    var originalFontVariant = element.style.fontVariantNumeric;
    element.style.fontVariantNumeric = 'tabular-nums';

    var proxy = { progress: 0 };

    var tween = gsap.to(proxy, {
      progress: 1,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: function () {
        var result = '';
        for (var i = 0; i < totalChars; i++) {
          // Each character resolves when progress exceeds its threshold
          var threshold = (i / totalChars) + (revealDelay * i / duration);
          if (threshold > 1) threshold = 1;

          if (proxy.progress > threshold) {
            result += finalText[i];
          } else {
            result += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        element.textContent = result;
      },
      onComplete: function () {
        // Ensure final text is exact
        element.textContent = finalText;
        // Restore original font-variant
        element.style.fontVariantNumeric = originalFontVariant || '';
      }
    });

    trackedTweens.push(tween);
    return tween;
  }

  /**
   * Sets up ScrollTrigger-gated scramble for #stmtAccent.
   * This element is the decorative "1987" in the intro statement section.
   * text-scramble.js owns this element — replaces statementEntrance() accent animation.
   */
  function initStmtAccent() {
    var accent = document.getElementById('stmtAccent');
    if (!accent) return;

    var finalText = accent.textContent.trim();

    // Set initial hidden state (replacing what statementEntrance used to do)
    gsap.set(accent, { opacity: 0 });
    // Clear any existing text to prepare for scramble
    accent.textContent = '';

    // Find the trigger section
    var triggerEl = document.getElementById('introStatement') || accent.closest('section') || accent.parentElement;

    var st = ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top 75%',
      once: true,
      onEnter: function () {
        // Fade in and scramble simultaneously
        gsap.to(accent, { opacity: 0.06, duration: 0.4, ease: 'power2.out' });
        scrambleText(accent, finalText, { duration: 1.2, revealDelay: 0.08 });
      }
    });

    trackedTriggers.push(st);
  }

  /**
   * Sets up ScrollTrigger-gated scramble for #historyWatermark.
   * This is the background year number in history sections.
   * One-time entrance effect — will not replay when historyTimeline changes text.
   */
  function initHistoryWatermark() {
    var watermark = document.getElementById('historyWatermark');
    if (!watermark) return;

    // Skip if already scrambled (e.g., re-init after matchMedia revert)
    if (watermark.getAttribute('data-scrambled') === 'true') return;

    var finalText = watermark.textContent.trim();

    // Find the trigger section
    var triggerEl = document.getElementById('historySection') || watermark.closest('section') || watermark.parentElement;

    var st = ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top 75%',
      once: true,
      onEnter: function () {
        scrambleText(watermark, finalText, {
          duration: 1.0,
          revealDelay: 0.08,
          chars: '0123456789'
        });
        // Mark as scrambled so historyTimeline goTo() won't re-trigger
        watermark.setAttribute('data-scrambled', 'true');
      }
    });

    trackedTriggers.push(st);
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    // CDN graceful degradation
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger === 'undefined') return;

    // Reduced motion gate: numbers appear instantly, no scramble
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    // Wrap in onFontsReady for consistent timing
    if (window.RR && typeof window.RR.onFontsReady === 'function') {
      window.RR.onFontsReady(function () {
        initStmtAccent();
        initHistoryWatermark();
      });
    } else {
      initStmtAccent();
      initHistoryWatermark();
    }
  }

  function kill() {
    // Kill all tracked tweens
    trackedTweens.forEach(function (tween) {
      try { tween.kill(); } catch (e) { /* ignore */ }
    });
    trackedTweens = [];

    // Kill all tracked ScrollTrigger instances
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
    window.RR.register('textScramble', { init: init, kill: kill, refresh: refresh });
  }

}());
