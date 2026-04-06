(function() {
  'use strict';

  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  // ─── 4-LAYER MOUSE PARALLAX ────────────────────────────────
  function heroParallax() {
    if (isMobile) return;

    var bg = document.querySelector('.parallax-bg');
    var mid = document.querySelector('.parallax-mid');
    var headline = document.querySelector('.parallax-headline');
    var fg = document.querySelector('.parallax-fg');

    if (!bg) return;

    var cx = 0, cy = 0;
    var tx = 0, ty = 0;

    document.addEventListener('mousemove', function(e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function tick() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;

      if (bg) bg.style.transform = 'translate(' + (cx * -8) + 'px,' + (cy * -8) + 'px)';
      if (mid) mid.style.transform = 'translate(' + (cx * -16) + 'px,' + (cy * -16) + 'px)';
      if (headline) headline.style.transform = 'translate(' + (cx * 4) + 'px,' + (cy * 4) + 'px)';
      if (fg) fg.style.transform = 'translate(' + (cx * -24) + 'px,' + (cy * -24) + 'px)';

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }


  // ─── CAPABILITY CARDS — Mana-style hover reveal ──────────
  function capsReveal() {
    var cards = document.querySelectorAll('.cap-card');
    if (!cards.length) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      cards.forEach(function(card, i) {
        gsap.fromTo(card,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0,
            duration: 0.8, ease: 'power3.out',
            delay: i * 0.1,
            scrollTrigger: { trigger: card, start: 'top 88%', once: true }
          }
        );
      });
    }
  }

  function capsHover() {
    if (isMobile) return;
    var cards = document.querySelectorAll('.cap-card');
    if (!cards.length || typeof gsap === 'undefined') return;

    cards.forEach(function(card) {
      var bg = card.querySelector('.cap-card-bg');
      var bgImg = bg ? bg.querySelector('img') : null;
      var productImg = card.querySelector('.cap-card-img');
      var link = card.querySelector('.cap-card-link');
      var kenBurnsTween = null;

      card.addEventListener('mouseenter', function() {
        if (bg) gsap.to(bg, { opacity: 1, duration: 0.4, ease: 'power2.out' });
        if (bgImg) {
          kenBurnsTween = gsap.to(bgImg, {
            scale: 1.15, x: 8, y: -5,
            duration: 8, ease: 'none', repeat: -1, yoyo: true
          });
        }
        if (productImg) gsap.to(productImg, { scale: 1.05, duration: 0.5, ease: 'power2.out' });
        gsap.to(card, { boxShadow: '0 24px 64px rgba(0,0,0,0.18)', duration: 0.4, ease: 'power2.out' });
        if (link) gsap.to(link, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', delay: 0.1 });
        cards.forEach(function(other) {
          if (other !== card) gsap.to(other, { opacity: 0.6, duration: 0.3, ease: 'power2.out' });
        });
      });

      card.addEventListener('mouseleave', function() {
        if (kenBurnsTween) { kenBurnsTween.kill(); kenBurnsTween = null; }
        if (bg) gsap.to(bg, { opacity: 0, duration: 0.3, ease: 'power2.in' });
        if (bgImg) gsap.to(bgImg, { scale: 1.08, x: 0, y: 0, duration: 0.3 });
        if (productImg) gsap.to(productImg, { scale: 1, duration: 0.3, ease: 'power2.inOut' });
        gsap.to(card, { boxShadow: '0 0px 0px rgba(0,0,0,0)', duration: 0.3, ease: 'power2.in' });
        if (link) gsap.to(link, { opacity: 0, y: 8, duration: 0.25, ease: 'power2.in' });
        cards.forEach(function(other) {
          if (other !== card) gsap.to(other, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        });
      });
    });
  }


  // ─── HISTORY TIMELINE — SCROLL-DRIVEN PINNED ──────────
  function historyTimeline() {
    // Read milestones from data attribute on #historySection
    var section = document.getElementById('historySection');
    if (!section) return;

    var milestones;
    try {
      milestones = JSON.parse(section.getAttribute('data-milestones'));
    } catch (e) {
      return;
    }

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
      gsap.set(watermark, { opacity: 1, scale: 1 });
      gsap.set(milestone, { opacity: 1, y: 0 });
    }

    nodes.forEach(function(node) {
      node.addEventListener('click', function() {
        goTo(parseInt(node.dataset.index));
      });
    });

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

    if (!isMobile && typeof gsap !== 'undefined') {
      gsap.to('#historyBg img', {
        scale: 1.12, x: 15, y: -10,
        duration: 20, ease: 'none', repeat: -1, yoyo: true
      });
    }

    goTo(0);
  }


  // ─── INTRO STATEMENT ENTRANCE ────────────────────────────
  function statementEntrance() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    var line = document.getElementById('stmtLine');
    var rule = document.getElementById('stmtRule');
    var sentences = document.querySelectorAll('.stmt-line');
    if (!line || !sentences.length) return;

    var isMobileLayout = window.matchMedia('(max-width: 768px)').matches;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#introStatement',
        start: 'top 75%',
        once: true
      }
    });

    if (isMobileLayout) {
      gsap.set(line, { scaleX: 0 });
      tl.to(line, { scaleX: 1, duration: 0.5, ease: 'power3.out' });
    } else {
      gsap.set(line, { scaleY: 0 });
      tl.to(line, { scaleY: 1, duration: 0.5, ease: 'power3.out' });
    }

    tl.to(sentences, {
      opacity: 1, y: 0,
      duration: 0.7, ease: 'power3.out',
      stagger: 0.15
    }, '-=0.2');

    if (rule) {
      gsap.set(rule, { scaleX: 0 });
      tl.to(rule, { scaleX: 1, duration: 0.4, ease: 'power3.out' }, '-=0.1');
    }
  }


  // ─── CLIP-PATH SECTION WIPES ──────────────────────────────
  function clipPathWipes() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (isMobile) return;

    document.querySelectorAll('.clip-section').forEach(function(section) {
      gsap.fromTo(section,
        { clipPath: 'inset(8% 4% 8% 4% round 24px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 0.5
          }
        }
      );
    });
  }


  // ─── FOOTER REVEAL (slides from behind) ──────────────────
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
        var shadowOpacity = self.progress * 0.15;
        mainContent.style.boxShadow = '0 -20px 60px rgba(0,0,0,' + shadowOpacity + ')';
      }
    });
  }


  // ─── INIT ALL ─────────────────────────────────────────────
  function init() {
    heroParallax();
    capsReveal();
    capsHover();
    statementEntrance();
    historyTimeline();
    clipPathWipes();
    footerReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    requestAnimationFrame(function() {
      requestAnimationFrame(init);
    });
  }
})();
