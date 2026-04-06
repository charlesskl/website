(function() {
  'use strict';

  // ─── HISTORY TIMELINE — CLICK-DRIVEN ────────
  function historyTimeline() {
    var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    var section = document.getElementById('historySection');
    if (!section) return;

    // Read milestones from data attribute
    var milestonesData = section.getAttribute('data-milestones');
    if (!milestonesData) return;
    var milestones;
    try { milestones = JSON.parse(milestonesData); } catch(e) { return; }

    var nodes = document.querySelectorAll('.timeline-node');
    var watermark = document.getElementById('historyWatermark');
    var milestone = document.getElementById('historyMilestone');
    var scrollFill = document.getElementById('historyScrollFill');
    var scrollHint = document.getElementById('historyScrollHint');
    if (!nodes.length || !watermark || !milestone) return;

    var current = -1;
    var total = milestones.length;

    function goTo(idx) {
      if (idx < 0 || idx >= total || idx === current) return;

      gsap.killTweensOf(watermark);
      gsap.killTweensOf(milestone);

      current = idx;

      nodes.forEach(function(n) { n.classList.remove('active'); });
      nodes[idx].classList.add('active');

      if (scrollFill) {
        scrollFill.style.height = ((idx / (total - 1)) * 100) + '%';
      }

      if (scrollHint && scrollHint.style.opacity !== '0') {
        scrollHint.style.opacity = '0';
        scrollHint.style.display = 'none';
      }

      watermark.textContent = milestones[idx].year;
      milestone.querySelector('p').textContent = milestones[idx].text;
      gsap.set(watermark, { opacity: 0.18, scale: 1 });
      gsap.set(milestone, { opacity: 1, y: 0 });
    }

    // Click navigation (desktop + mobile)
    nodes.forEach(function(node) {
      node.addEventListener('click', function() {
        goTo(parseInt(node.dataset.index));
      });
    });

    // Mobile: swipe left/right
    if (isMobile) {
      var touchStartX = 0;
      section.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      section.addEventListener('touchend', function(e) {
        var diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          goTo(current + (diff > 0 ? 1 : -1));
        }
      }, { passive: true });
    }

    goTo(0);
  }

  // ─── FOOTER REVEAL ─────────────────────────────────────────
  function footerReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    var footer = document.querySelector('footer.footer-reveal');
    var mainContent = document.querySelector('.main-content');
    if (!footer || !mainContent) return;
    ScrollTrigger.create({
      trigger: footer,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      onUpdate: function(self) {
        mainContent.style.boxShadow = '0 -20px 60px rgba(0,0,0,' + (self.progress * 0.15) + ')';
      }
    });
  }

  // ─── PARALLAX ON STATEMENT ─────────────────────────────────
  function scrollParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) return;
    gsap.to('.statement-line', {
      scaleY: 1.5, ease: 'none',
      scrollTrigger: { trigger: '.intro-statement', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  // ─── STATEMENT ENTRANCE ────────────────────────────────────
  function statementEntrance() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    var line = document.getElementById('stmtLine');
    var rule = document.getElementById('stmtRule');
    var sentences = document.querySelectorAll('.stmt-line');
    if (!line || !sentences.length) return;

    var isMobileLayout = window.matchMedia('(max-width: 768px)').matches;
    var tl = gsap.timeline({
      scrollTrigger: { trigger: '#introStatement', start: 'top 75%', once: true }
    });
    if (isMobileLayout) {
      gsap.set(line, { scaleX: 0 });
      tl.to(line, { scaleX: 1, duration: 0.5, ease: 'power3.out' });
    } else {
      gsap.set(line, { scaleY: 0 });
      tl.to(line, { scaleY: 1, duration: 0.5, ease: 'power3.out' });
    }
    tl.to(sentences, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15 }, '-=0.2');
    if (rule) { gsap.set(rule, { scaleX: 0 }); tl.to(rule, { scaleX: 1, duration: 0.4, ease: 'power3.out' }, '-=0.1'); }
    // "1987" accent now handled by text-scramble.js
  }

  // ─── INIT ──────────────────────────────────────────────────
  function init() {
    statementEntrance();
    historyTimeline();
    footerReveal();
    scrollParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    requestAnimationFrame(function() { requestAnimationFrame(init); });
  }
})();
