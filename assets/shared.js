/*
 * ═══════════════════════════════════════════════════════════════════
 * ROYAL REGENT — shared.js
 * Global interaction engine
 * ═══════════════════════════════════════════════════════════════════
 *
 * Modules:
 *  1. Locomotive Scroll (smooth scroll)
 *  2. Advanced two-part cursor (dot + ring)
 *  3. Magnetic buttons (GSAP elastic)
 *  4. Scroll progress bar
 *  5. Aurora background
 *  6. Cinematic page transitions (clip-path wipe)
 *  7. Parallax engine
 *  8. Three.js / WebGL particle system
 *  9. Navbar scroll behaviour
 * 10. Hamburger menu
 * 11. Image blur-up lazy loading
 * 12. Splitting.js hero headline animation
 * 13. Language selector
 * 14. Floating hover image on capability cards
 * 15. WebGL hero distortion
 * 16. Typewriter hero subtext
 * 17. Scroll morph SVG
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ─── FEATURE DETECTION ───────────────────────────────────────
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasHover = window.matchMedia('(hover: hover)').matches;


  // ─── 1. LOCOMOTIVE SCROLL (replaces Lenis) ──────────────────
  let locoScroll = null;
  function initLocomotiveScroll() {
    if (typeof LocomotiveScroll === 'undefined') return;
    if (prefersReducedMotion) return;

    var scrollContainer = document.querySelector('[data-scroll-container]');
    if (!scrollContainer) return;

    try {
      locoScroll = window.__locoScroll = new LocomotiveScroll({
        el: scrollContainer,
        smooth: false,
        smartphone: { smooth: false },
        tablet: { smooth: false }
      });

      // With smooth:false, LocomotiveScroll uses native scroll so
      // ScrollTrigger works normally without a scroller proxy.
      // The data-scroll attributes still trigger class-based reveals.
      if (typeof ScrollTrigger !== 'undefined') {
        locoScroll.on('scroll', ScrollTrigger.update);
        ScrollTrigger.addEventListener('refresh', function() { locoScroll.update(); });
        ScrollTrigger.refresh();
      }
    } catch (e) {
      console.warn('Locomotive Scroll init failed, using native scroll:', e);
    }
  }


  // ─── 2. ADVANCED TWO-PART CURSOR ────────────────────────────
  function initCursor() {
    if (isTouch || !hasHover) return;

    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);

    var label = document.createElement('div');
    label.className = 'cursor-label';
    document.body.appendChild(label);

    var mouseX = -100, mouseY = -100;
    var ringX = -100, ringY = -100;
    var firstMove = true;

    // Hide until first mouse move
    dot.style.opacity = '0';
    ring.style.opacity = '0';

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly via direct transform (no GSAP overhead)
      dot.style.transform = 'translate3d(' + mouseX + 'px,' + mouseY + 'px,0)';
      if (firstMove) {
        firstMove = false;
        ringX = mouseX;
        ringY = mouseY;
        ring.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0)';
        dot.style.opacity = '';
        ring.style.opacity = '';
      }
    });

    // Ring follows with lerp lag — direct transforms, no GSAP per frame
    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0)';
      label.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // State: links/buttons — ring expands, dot hides
    document.addEventListener('mouseover', function (e) {
      var link = e.target.closest('a, button, .magnetic, [data-cursor]');
      var img = e.target.closest('img, .img-reveal, .photo-panel, .cap-card-bg');
      var text = e.target.closest('p, .body-lg, .contact-detail p, .cap-feature p');

      if (link) {
        ring.classList.add('link');
        dot.classList.add('hide');
        var cursorText = link.getAttribute('data-cursor');
        if (cursorText) {
          label.textContent = cursorText;
          label.classList.add('visible');
          ring.classList.remove('link');
          ring.classList.add('view');
        }
      } else if (img) {
        ring.classList.add('view');
        dot.classList.add('hide');
        label.textContent = 'VIEW';
        label.classList.add('visible');
      } else if (text) {
        ring.classList.add('text');
      }
    });

    document.addEventListener('mouseout', function (e) {
      var el = e.target.closest('a, button, .magnetic, [data-cursor], img, .img-reveal, .photo-panel, .cap-card-bg, p, .body-lg, .contact-detail p, .cap-feature p');
      if (!el) return;
      ring.classList.remove('link', 'view', 'text');
      dot.classList.remove('hide');
      label.classList.remove('visible');
    });
  }


  // ─── 3. MAGNETIC BUTTONS ────────────────────────────────────
  function initMagnetic() {
    if (isTouch || !hasHover) return;
    if (typeof gsap === 'undefined') return;

    document.querySelectorAll('button, .nav-links a, .nav-cta, .btn, .magnetic').forEach(function (el) {
      var strength = parseFloat(el.dataset.strength) || 0.35;

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power2.out' });
      });

      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
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


  // ─── 6. PAGE TRANSITIONS (cinematic green wipe) ─────────────
  function initPageTransitions() {
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined') return;

    var overlay = document.querySelector('.page-transition');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition';
      document.body.appendChild(overlay);
    }

    // Reveal on load — only if arriving from an internal wipe transition
    if (sessionStorage.getItem('page_wipe') === '1') {
      sessionStorage.removeItem('page_wipe');
      gsap.set(overlay, { clipPath: 'inset(0 0 0 0)' });
      gsap.to(overlay, {
        clipPath: 'inset(0 0 0 100%)',
        duration: 0.6,
        ease: 'power3.inOut',
        delay: 0.1,
        onComplete: function() { gsap.set(overlay, { clipPath: 'inset(0 100% 0 0)' }); }
      });
    }

    // Intercept internal link clicks for cinematic exit transition
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href) return;
      // Skip non-navigational links
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') ||
          href.startsWith('http') || link.hasAttribute('target') || href.startsWith('javascript')) return;

      e.preventDefault();
      sessionStorage.setItem('page_wipe', '1');
      gsap.timeline()
        .to(overlay, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.5,
          ease: 'power3.inOut',
          onComplete: function() { window.location.href = href; }
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


  // ─── MOBILE ANIMATIONS ──────────────────────────────────
  function initMobileAnimations() {
    var mq = window.matchMedia('(max-width: 768px)');
    if (!mq.matches) return;
    if (prefersReducedMotion) return;

    // Cards staggered fade-up
    var cardGroups = document.querySelectorAll('.values-grid, .editorial-features, .job-grid, .positions-grid');
    cardGroups.forEach(function(group) {
      var cards = group.querySelectorAll('.value-card, .editorial-feat, .job-card, .position-card');
      cards.forEach(function(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(24px)';
        card.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
      });
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var items = entry.target.querySelectorAll('.value-card, .editorial-feat, .job-card, .position-card');
            items.forEach(function(item, i) {
              setTimeout(function() {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
              }, i * 80);
            });
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      obs.observe(group);
    });

    // Green left border scaleY draw
    var introLines = document.querySelectorAll('.editorial-intro-line');
    introLines.forEach(function(line) {
      line.style.transform = 'scaleY(0)';
      line.style.transformOrigin = 'top center';
      line.style.transition = 'transform 500ms ease-out';
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.style.transform = 'scaleY(1)';
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      obs.observe(line);
    });

    // Photo panel tap reveal
    var panels = document.querySelectorAll('.photo-panel');
    panels.forEach(function(panel) {
      panel.addEventListener('click', function() {
        panels.forEach(function(p) { p.classList.remove('tap-active'); });
        panel.classList.add('tap-active');
        setTimeout(function() {
          panel.classList.remove('tap-active');
        }, 2000);
      });
    });

    // Photo panels staggered scroll entry
    var panelContainers = document.querySelectorAll('.photo-panels');
    panelContainers.forEach(function(container) {
      var items = container.querySelectorAll('.photo-panel');
      items.forEach(function(item) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
      });
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var pnls = entry.target.querySelectorAll('.photo-panel');
            pnls.forEach(function(p, i) {
              setTimeout(function() {
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
              }, i * 100);
            });
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05 });
      obs.observe(container);
    });
  }


  // ─── LANGUAGE SELECTOR ───────────────────────────────────
  function initLanguageSelector() {
    var path = window.location.pathname;
    var currentLang = 'en';
    if (path.indexOf('/cn/') !== -1) currentLang = 'cn';
    else if (path.indexOf('/id/') !== -1) currentLang = 'id';

    // Mark active language in dropdown
    var langLinks = document.querySelectorAll('.lang-dropdown a');
    langLinks.forEach(function(link) {
      if (link.getAttribute('data-lang') === currentLang) {
        link.classList.add('active');
      }
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var lang = this.getAttribute('data-lang');
        if (lang === currentLang) return;
        localStorage.setItem('preferred_lang', lang);
        navigateToLang(lang, currentLang);
      });
    });

    // Update selector display text
    var selectorLabel = document.querySelector('.lang-selector > a');
    if (selectorLabel) {
      var labels = { en: 'EN', cn: '中文', id: 'ID' };
      selectorLabel.innerHTML = labels[currentLang] + ' <span class="arrow">&#8964;</span>';
    }

    // Check for language mismatch banner
    var preferred = localStorage.getItem('preferred_lang');
    if (preferred && preferred !== currentLang) {
      showLangBanner(preferred, currentLang);
    }
  }

  function navigateToLang(targetLang, currentLang) {
    var path = window.location.pathname;
    var basePath = path;

    if (currentLang === 'en') {
      // Going from /page.html → /cn/page.html
      var lastSlash = basePath.lastIndexOf('/');
      var dir = basePath.substring(0, lastSlash + 1);
      var file = basePath.substring(lastSlash + 1);
      window.location.href = dir + targetLang + '/' + file;
    } else {
      // Going from /cn/page.html → strip /cn/ then optionally add /id/
      basePath = basePath.replace('/' + currentLang + '/', '/');
      if (targetLang !== 'en') {
        var lastSlash2 = basePath.lastIndexOf('/');
        var dir2 = basePath.substring(0, lastSlash2 + 1);
        var file2 = basePath.substring(lastSlash2 + 1);
        basePath = dir2 + targetLang + '/' + file2;
      }
      window.location.href = basePath;
    }
  }

  function showLangBanner(preferred, current) {
    var names = { en: 'English', cn: '繁體中文', id: 'Bahasa Indonesia' };
    var banner = document.createElement('div');
    banner.className = 'lang-banner';
    banner.innerHTML =
      '<span>This page is available in ' + names[preferred] + '</span>' +
      '<a href="#" id="langBannerSwitch">Switch</a>' +
      '<button id="langBannerDismiss">\u2715</button>';
    document.body.appendChild(banner);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { banner.classList.add('visible'); });
    });
    document.getElementById('langBannerSwitch').addEventListener('click', function(e) {
      e.preventDefault();
      navigateToLang(preferred, current);
    });
    document.getElementById('langBannerDismiss').addEventListener('click', function() {
      localStorage.removeItem('preferred_lang');
      banner.classList.remove('visible');
      setTimeout(function() { banner.remove(); }, 400);
    });
  }



  // ─── FLOATING HOVER IMAGE (cap cards) ─────────────────
  function initCapHoverImage() {
    if (isTouch || !hasHover) return;
    if (typeof gsap === 'undefined') return;

    var grid = document.getElementById('capsGrid');
    if (!grid) return;

    // Image map per capability
    var capImages = {
      plastic: 'https://images.pexels.com/photos/3806754/pexels-photo-3806754.jpeg?auto=compress&cs=tinysrgb&w=400',
      plush: 'https://images.pexels.com/photos/754178/pexels-photo-754178.jpeg?auto=compress&cs=tinysrgb&w=400',
      dolls: 'https://images.pexels.com/photos/1376771/pexels-photo-1376771.jpeg?auto=compress&cs=tinysrgb&w=400',
      rc: 'https://images.pexels.com/photos/97353/pexels-photo-97353.jpeg?auto=compress&cs=tinysrgb&w=400',
      costumes: 'https://images.pexels.com/photos/8421978/pexels-photo-8421978.jpeg?auto=compress&cs=tinysrgb&w=400'
    };

    // Create container
    var hoverEl = document.createElement('div');
    hoverEl.className = 'cap-hover-img';
    var hoverImg = document.createElement('img');
    hoverImg.alt = '';
    hoverEl.appendChild(hoverImg);
    document.body.appendChild(hoverEl);

    var mouseX = 0, mouseY = 0;
    var elX = 0, elY = 0;
    var active = false;
    var rafId = null;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      if (!active) { rafId = null; return; }
      elX = lerp(elX, mouseX, 0.08);
      elY = lerp(elY, mouseY, 0.08);
      var rotation = (mouseX - elX) * 0.08;
      rotation = Math.max(-15, Math.min(15, rotation));
      hoverEl.style.transform = 'translate(' + (elX + 20) + 'px,' + (elY - 90) + 'px) rotate(' + rotation.toFixed(2) + 'deg)';
      rafId = requestAnimationFrame(animate);
    }

    var cards = grid.querySelectorAll('.cap-card');
    cards.forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        var cap = card.getAttribute('data-cap');
        if (!capImages[cap]) return;
        hoverImg.src = capImages[cap];
        active = true;
        gsap.to(hoverEl, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        if (!rafId) rafId = requestAnimationFrame(animate);
      });

      card.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      card.addEventListener('mouseleave', function() {
        active = false;
        gsap.to(hoverEl, { opacity: 0, duration: 0.25, ease: 'power2.in' });
      });
    });
  }


  // ─── SPLITTING.JS HEADLINE ANIMATION ────────────────────
  function initSplitting() {
    if (typeof Splitting === 'undefined') return;
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined') return;

    try {
      // Target h1 inside .page-hero (inner pages) — skip index hero
      // which has its own entrance animation via heroEntrance()
      var targets = document.querySelectorAll('.page-hero h1');
      if (!targets.length) return;

      var splitBy = isMobile ? 'words' : 'chars';
      var results = Splitting({ target: targets, by: splitBy });

      results.forEach(function(result) {
        var items = result[splitBy === 'chars' ? 'chars' : 'words'];
        if (!items || !items.length) return;

        // Set initial state
        gsap.set(items, { opacity: 0, y: 30, rotation: splitBy === 'chars' ? 6 : 0 });

        // Animate in when scrolled into view
        if (typeof ScrollTrigger !== 'undefined') {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 0.5,
            ease: 'power3.out',
            stagger: splitBy === 'chars' ? 0.02 : 0.05,
            scrollTrigger: {
              trigger: result.el,
              start: 'top 80%',
              once: true
            }
          });
        } else {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 0.5,
            ease: 'power3.out',
            stagger: splitBy === 'chars' ? 0.02 : 0.05,
            delay: 0.3
          });
        }
      });
    } catch (e) {
      console.warn('Splitting.js init failed:', e);
    }
  }


  // ─── WEBGL HERO DISTORTION ─────────────────────────────
  function initHeroDistortion() {
    if (isMobile) return;
    if (prefersReducedMotion) return;

    // Find hero section — works on index, about, and sub-pages
    var hero = document.querySelector('.hero, .about-hero, .sub-hero');
    if (!hero) return;

    // Check WebGL support
    var testCanvas = document.createElement('canvas');
    var gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) return;

    // Use Three.js if available, otherwise raw WebGL
    if (typeof THREE === 'undefined') return;

    try {
      var container = document.createElement('div');
      container.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
      hero.style.position = hero.style.position || 'relative';
      hero.insertBefore(container, hero.firstChild);

      var scene = new THREE.Scene();
      var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
      renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;';

      var uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uDistortion: { value: 0.004 },
        uResolution: { value: new THREE.Vector2(1, 1) }
      };

      var vertexShader = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
      var fragmentShader = [
        'uniform float uTime;',
        'uniform vec2 uMouse;',
        'uniform float uDistortion;',
        'uniform vec2 uResolution;',
        'varying vec2 vUv;',
        'void main(){',
        '  vec2 uv=vUv;',
        '  float aspect=uResolution.x/uResolution.y;',
        '  vec2 scaled=vec2(uv.x*aspect,uv.y);',
        '  vec2 mScaled=vec2(uMouse.x*aspect,uMouse.y);',
        '  float dist=distance(scaled,mScaled);',
        '  float ambient=sin(uv.x*8.0+uTime*0.5)*sin(uv.y*6.0+uTime*0.7)*0.003;',
        '  float ripple=sin(dist*40.0-uTime*3.0)*uDistortion*(1.0-smoothstep(0.0,0.4,dist));',
        '  vec2 offset=normalize(uv-uMouse+0.001)*ripple+ambient;',
        '  float r=0.38+0.04*sin(uTime*0.3+uv.x*10.0);',
        '  float g=0.55+0.04*sin(uTime*0.4+uv.y*10.0);',
        '  float b=0.2+0.02*sin(uTime*0.5);',
        '  float wave=sin(uv.x*20.0+offset.x*60.0+uTime)+sin(uv.y*20.0+offset.y*60.0+uTime*1.3);',
        '  float alpha=smoothstep(0.3,1.0,abs(wave))*0.06+length(offset)*2.0;',
        '  gl_FragColor=vec4(r,g,b,alpha*0.35);',
        '}'
      ].join('\n');

      var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        depthTest: false
      });

      var geometry = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geometry, material));

      function resize() {
        var w = container.clientWidth;
        var h = container.clientHeight;
        renderer.setSize(w, h);
        uniforms.uResolution.value.set(w, h);
      }
      resize();
      window.addEventListener('resize', resize);

      var targetDistortion = 0.004;
      hero.addEventListener('mousemove', function(e) {
        var rect = hero.getBoundingClientRect();
        uniforms.uMouse.value.set(
          (e.clientX - rect.left) / rect.width,
          1.0 - (e.clientY - rect.top) / rect.height
        );
        targetDistortion = 0.012;
      });
      hero.addEventListener('mouseleave', function() {
        targetDistortion = 0.004;
      });

      var isVisible = true;
      var observer = new IntersectionObserver(function(entries) {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0 });
      observer.observe(hero);

      var startTime = performance.now();
      function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
        uniforms.uTime.value = (performance.now() - startTime) * 0.001;
        uniforms.uDistortion.value += (targetDistortion - uniforms.uDistortion.value) * 0.05;
        renderer.render(scene, camera);
      }
      animate();
    } catch (e) {
      console.warn('WebGL hero distortion failed:', e);
    }
  }


  // ─── TYPEWRITER HERO SUBTEXT ──────────────────────────
  function initTypewriter() {
    if (isMobile) return;
    if (prefersReducedMotion) return;

    var el = document.getElementById('heroSub');
    if (!el) return;
    // Only on index page (check for hero section, not about-hero or sub-hero)
    if (!document.querySelector('.hero#hero')) return;

    var messages = [
      el.textContent.trim(), // keep original as first message
      "From a single workshop in Sha Tau Kok to manufacturing sites spanning China and Indonesia.",
      "38 years of precision manufacturing for the world's leading toy brands.",
      "From first sample to final carton — everything under one roof.",
      "Your vision. Our craftsmanship. Built to last."
    ];

    // Create cursor element
    var cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.textContent = '|';
    el.parentNode.insertBefore(cursor, el.nextSibling);

    var msgIndex = 0;
    var charIndex = messages[0].length; // start fully typed
    var isDeleting = false;
    var pauseTimer = null;

    // Show first message fully, then start cycling after a pause
    el.textContent = messages[0];

    function type() {
      var current = messages[msgIndex];
      var speed = isDeleting ? 10 : 25;

      if (isDeleting) {
        charIndex--;
        el.textContent = current.substring(0, charIndex);
      } else {
        charIndex++;
        el.textContent = current.substring(0, charIndex);
      }

      if (!isDeleting && charIndex === current.length) {
        pauseTimer = setTimeout(function() {
          isDeleting = true;
          type();
        }, 2500);
        return;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        msgIndex = (msgIndex + 1) % messages.length;
        pauseTimer = setTimeout(function() { type(); }, 400);
        return;
      }

      setTimeout(type, speed);
    }

    // Start cycling after initial pause — original message stays longer
    setTimeout(function() {
      isDeleting = true;
      type();
    }, 6000);
  }


  // ─── SCROLL MORPH SVG ────────────────────────────────
  function initScrollMorph() {
    if (isMobile) return;
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Create the fixed SVG container
    var wrapper = document.createElement('div');
    wrapper.className = 'scroll-morph';
    wrapper.innerHTML = '<svg viewBox="0 0 100 100"><path class="morph-path" fill="none" stroke="currentColor" stroke-width="2"/></svg><span class="morph-pct"></span>';
    document.body.appendChild(wrapper);

    var path = wrapper.querySelector('.morph-path');
    var pctLabel = wrapper.querySelector('.morph-pct');

    // Shape definitions
    var shapes = [
      'M50,10 C71.5,10 90,28.5 90,50 C90,71.5 71.5,90 50,90 C28.5,90 10,71.5 10,50 C10,28.5 28.5,10 50,10 Z', // circle
      'M20,15 Q50,5 80,15 Q95,50 80,85 Q50,95 20,85 Q5,50 20,15 Z',  // rounded square
      'M50,10 Q55,10 85,80 Q85,92 50,92 Q15,92 15,80 Q45,10 50,10 Z', // triangle-ish
      'M50,5 Q95,50 50,95 Q5,50 50,5 Z',  // diamond
      'M50,5 L61,35 L95,35 L68,57 L79,91 L50,70 L21,91 L32,57 L5,35 L39,35 Z' // star
    ];

    // Interpolate between two SVG path strings (simple point interpolation)
    function interpolatePaths(pathA, pathB, t) {
      var numsA = pathA.match(/-?[\d.]+/g).map(Number);
      var numsB = pathB.match(/-?[\d.]+/g).map(Number);
      var len = Math.min(numsA.length, numsB.length);
      var charsA = pathA.split(/-?[\d.]+/g);
      var result = '';
      for (var i = 0; i < len; i++) {
        result += charsA[i] + (numsA[i] + (numsB[i] - numsA[i]) * t).toFixed(1);
      }
      if (charsA.length > len) result += charsA[len];
      return result;
    }

    // Since paths have different point counts, use discrete shape transitions
    function getShapeAtProgress(progress) {
      var segments = shapes.length - 1;
      var segment = Math.min(Math.floor(progress * segments), segments - 1);
      var localT = (progress * segments) - segment;
      localT = Math.max(0, Math.min(1, localT));

      // For shapes with same point count we interpolate; otherwise blend via opacity
      return shapes[Math.min(Math.round(progress * segments), segments)];
    }

    var currentRotation = 0;

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function(self) {
        var p = self.progress;
        path.setAttribute('d', getShapeAtProgress(p));
        currentRotation = p * 360;
        wrapper.querySelector('svg').style.transform = 'rotate(' + currentRotation.toFixed(1) + 'deg)';
        pctLabel.textContent = Math.round(p * 100) + '%';
      }
    });

    // Hover: show percentage and fill
    wrapper.addEventListener('mouseenter', function() {
      wrapper.classList.add('active');
    });
    wrapper.addEventListener('mouseleave', function() {
      wrapper.classList.remove('active');
    });

    // Set initial state
    path.setAttribute('d', shapes[0]);
  }


  // ─── INIT ON DOM READY ────────────────────────────────────
  function init() {
    initLocomotiveScroll();
    initCursor();
    initMagnetic();
    initScrollProgress();
    initAurora();
    initNavbar();
    initHamburger();
    initDropdowns();
    initLazyImages();
    initReveal();
    initMobileAnimations();
    initLanguageSelector();
    initSplitting();
    initParallax();
    initParticles();
    initCapHoverImage();
    initHeroDistortion();
    initTypewriter();
    initScrollMorph();
    // Page transitions last — they intercept clicks
    initPageTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
