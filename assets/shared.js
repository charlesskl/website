/*
 * ═══════════════════════════════════════════════════════════════════
 * ROYAL REGENT — shared.js
 * Global interaction engine
 * ═══════════════════════════════════════════════════════════════════
 *
 * Modules:
 *  1. Lenis smooth scroll
 *  2. Custom cursor
 *  3. Magnetic buttons
 *  4. Scroll progress bar
 *  5. Aurora background
 *  6. Page transition engine
 *  7. Parallax engine
 *  8. Three.js / WebGL particle system
 *  9. Navbar scroll behaviour
 * 10. Hamburger menu
 * 11. Image blur-up lazy loading
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ─── FEATURE DETECTION ───────────────────────────────────────
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasHover = window.matchMedia('(hover: hover)').matches;


  // ─── 1. LENIS SMOOTH SCROLL ─────────────────────────────────
  let lenis = null;
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    if (prefersReducedMotion) return;
    lenis = window.__lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    // Expose for GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }


  // ─── 2. CUSTOM CURSOR ───────────────────────────────────────
  function initCursor() {
    if (isTouch || !hasHover) return;

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    const label = document.createElement('div');
    label.className = 'cursor-label';
    document.body.appendChild(label);

    let cx = -100, cy = -100;
    let tx = -100, ty = -100;
    let firstMove = true;

    // Hide cursor until first mouse move to prevent jump on page load
    cursor.style.opacity = '0';
    label.style.opacity = '0';

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (firstMove) {
        firstMove = false;
        cx = tx;
        cy = ty;
        cursor.style.opacity = '';
        label.style.opacity = '';
      }
    });

    function tick() {
      cx += (tx - cx) * 0.35;
      cy += (ty - cy) * 0.35;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      label.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Interactive elements
    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest('a, button, .magnetic, [data-cursor]');
      if (!el) return;
      cursor.classList.add('link');
      var cursorText = el.getAttribute('data-cursor');
      if (cursorText) {
        label.textContent = cursorText;
        label.classList.add('visible');
        cursor.classList.remove('link');
        cursor.classList.add('hover');
      }
    });

    document.addEventListener('mouseout', function (e) {
      var el = e.target.closest('a, button, .magnetic, [data-cursor]');
      if (!el) return;
      cursor.classList.remove('link', 'hover');
      label.classList.remove('visible');
    });
  }


  // ─── 3. MAGNETIC BUTTONS ────────────────────────────────────
  function initMagnetic() {
    if (isTouch || !hasHover) return;

    document.querySelectorAll('.magnetic').forEach(function (el) {
      var strength = parseFloat(el.dataset.strength) || 0.3;

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var dx = e.clientX - (rect.left + rect.width / 2);
        var dy = e.clientY - (rect.top + rect.height / 2);
        el.style.transform = 'translate(' + (dx * strength) + 'px,' + (dy * strength) + 'px)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
        el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(function () { el.style.transition = ''; }, 500);
      });
    });
  }


  // ─── 4. SCROLL PROGRESS BAR ─────────────────────────────────
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'scroll-progress';
      document.body.appendChild(bar);
    }

    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }


  // ─── 5. AURORA BACKGROUND ──────────────────────────────────
  function initAurora() {
    var container = document.querySelector('.aurora');
    if (!container) return;
    if (prefersReducedMotion) return;

    var blobs = container.querySelectorAll('.aurora-blob');
    if (!blobs.length) return;

    // Gentle floating animation with GSAP if available
    if (typeof gsap !== 'undefined') {
      blobs.forEach(function (blob, i) {
        gsap.to(blob, {
          x: 'random(-40, 40)',
          y: 'random(-40, 40)',
          scale: 'random(0.9, 1.1)',
          duration: 'random(15, 25)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 2
        });
      });
    }
  }


  // ─── 6. PAGE TRANSITION ENGINE ─────────────────────────────
  function initPageTransitions() {
    if (prefersReducedMotion) return;

    var overlay = document.querySelector('.page-transition');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition';
      document.body.appendChild(overlay);
    }

    // On page load: overlay stays hidden (CSS default translateY(100%)).
    // It only becomes visible when navigating away (fromTo 100 → 0),
    // then the next page loads with it at 0 and we slide it out.
    // Check if we arrived via a page transition (overlay at yPercent 0)
    if (typeof gsap !== 'undefined') {
      // If overlay is covering the screen (navigated here via transition),
      // slide it away. Otherwise leave it hidden.
      var rect = overlay.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < 10) {
        // Overlay is visible — animate it out
        gsap.to(overlay, {
          yPercent: -100,
          duration: 0.7,
          ease: 'power4.inOut',
          delay: 0.05
        });
      }
    }

    // Intercept internal links
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') ||
          href.startsWith('http') || link.hasAttribute('target')) return;

      link.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(overlay,
            { yPercent: 100 },
            {
              yPercent: 0,
              duration: 0.5,
              ease: 'power4.inOut',
              onComplete: function () { window.location.href = href; }
            }
          );
        } else {
          window.location.href = href;
        }
      });
    });
  }


  // ─── 7. PARALLAX ENGINE ────────────────────────────────────
  function initParallax() {
    if (isMobile || prefersReducedMotion) return;

    var elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      elements.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.2;
        var direction = el.dataset.parallaxDir || 'y';
        var distance = parseFloat(el.dataset.parallaxDist) || 100;

        var props = {};
        props[direction] = distance * speed;

        gsap.to(el, {
          ...props,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section') || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    }
  }


  // ─── 8. THREE.JS / WebGL PARTICLE SYSTEM ──────────────────
  function initParticles() {
    if (isMobile) return;

    var canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    if (typeof THREE === 'undefined') return;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle geometry
    var count = 200;
    var positions = new Float32Array(count * 3);
    var velocities = new Float32Array(count * 3);

    for (var i = 0; i < count * 3; i += 3) {
      positions[i]     = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 6;
      velocities[i]     = (Math.random() - 0.5) * 0.003;
      velocities[i + 1] = Math.random() * 0.005 + 0.002;
      velocities[i + 2] = (Math.random() - 0.5) * 0.002;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var material = new THREE.PointsMaterial({
      color: 0x7CB342,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    var particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse interaction
    var mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Check visibility
    var isVisible = true;
    var observer = new IntersectionObserver(function (entries) {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas.parentElement || canvas);

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;

      var pos = geometry.attributes.position.array;
      for (var i = 0; i < count * 3; i += 3) {
        pos[i]     += velocities[i];
        pos[i + 1] += velocities[i + 1];
        pos[i + 2] += velocities[i + 2];

        // Mouse repulsion
        var dx = pos[i] - mouse.x * 4;
        var dy = pos[i + 1] - mouse.y * 3;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) {
          pos[i]     += dx * 0.01;
          pos[i + 1] += dy * 0.01;
        }

        // Reset particles that go too far
        if (pos[i + 1] > 5) {
          pos[i + 1] = -5;
          pos[i] = (Math.random() - 0.5) * 12;
        }
        if (Math.abs(pos[i]) > 7) pos[i] *= -0.9;
      }
      geometry.attributes.position.needsUpdate = true;

      particles.rotation.y += 0.0003;
      renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', function () {
      var w = canvas.offsetWidth || window.innerWidth;
      var h = canvas.offsetHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }


  // ─── 9. NAVBAR SCROLL ──────────────────────────────────────
  function initNavbar() {
    var nav = document.getElementById('navbar');
    if (!nav) return;

    var lastScroll = 0;
    var threshold = 5;

    window.addEventListener('scroll', function () {
      var current = window.pageYOffset;
      nav.classList.toggle('scrolled', current > 60);

      // Hide/show on scroll direction (optional, gentle)
      if (Math.abs(current - lastScroll) < threshold) return;
      // Don't hide navbar - keep it visible
      lastScroll = current;
    }, { passive: true });
  }


  // ─── 10. HAMBURGER MENU ────────────────────────────────────
  function initHamburger() {
    var btn = document.getElementById('hamburger');
    var links = document.getElementById('navLinks');
    if (!btn || !links) return;
    btn.addEventListener('click', function () {
      links.classList.toggle('open');
      btn.classList.toggle('open');
    });
  }


  // ─── 11b. DROPDOWN HOVER WITH DELAY ──────────────────────
  function initDropdowns() {
    var dropdowns = document.querySelectorAll('.has-dropdown');
    if (!dropdowns.length) return;
    // Don't apply hover logic on mobile nav
    var mq = window.matchMedia('(max-width: 768px)');

    dropdowns.forEach(function(dd) {
      var closeTimer = null;
      var menu = dd.querySelector('.dropdown');
      var items = menu ? menu.querySelectorAll('li') : [];

      function openDropdown() {
        if (mq.matches) return;
        clearTimeout(closeTimer);
        dd.classList.add('dd-open');
        // Stagger items
        if (typeof gsap !== 'undefined' && items.length) {
          gsap.fromTo(items,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', stagger: 0.06 }
          );
        }
      }

      function startClose() {
        if (mq.matches) return;
        closeTimer = setTimeout(function() {
          dd.classList.remove('dd-open');
        }, 300);
      }

      dd.addEventListener('mouseenter', openDropdown);
      dd.addEventListener('mouseleave', startClose);
      if (menu) {
        menu.addEventListener('mouseenter', function() { clearTimeout(closeTimer); });
        menu.addEventListener('mouseleave', startClose);
      }
    });
  }


  // ─── 11. IMAGE LAZY LOAD / BLUR-UP ────────────────────────
  function initLazyImages() {
    var images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.onload = function () {
            img.classList.add('loaded');
            var wrapper = img.closest('.img-reveal');
            if (wrapper) wrapper.classList.add('revealed');
          };
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '200px'
    });

    images.forEach(function (img) { observer.observe(img); });
  }


  // ─── 12. REVEAL ON SCROLL ─────────────────────────────────
  function initReveal() {
    var els = document.querySelectorAll('.reveal-up');
    if (!els.length) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      els.forEach(function (el) {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true
            }
          }
        );
      });
    } else {
      // Fallback IntersectionObserver
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        });
      }, { threshold: 0.12 });
      els.forEach(function (el) { observer.observe(el); });
    }
  }


  // ─── INIT ON DOM READY ────────────────────────────────────
  function init() {
    initLenis();
    initCursor();
    initMagnetic();
    initScrollProgress();
    initAurora();
    initNavbar();
    initHamburger();
    initDropdowns();
    initLazyImages();
    initReveal();
    initParallax();
    initParticles();
    // Page transitions last — they intercept clicks
    initPageTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
