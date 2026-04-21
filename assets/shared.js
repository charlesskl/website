/*
 * ═══════════════════════════════════════════════════════════════════
 * ROYAL REGENT — shared.js
 * Global interaction engine
 * ═══════════════════════════════════════════════════════════════════
 *
 * Modules:
 *  1. Advanced two-part cursor (dot + ring)
 *  2. Magnetic buttons (GSAP elastic)
 *  3. Scroll progress bar
 *  4. Aurora background
 *  5. Cinematic page transitions (clip-path wipe)
 *  6. Parallax engine
 *  7. Three.js / WebGL particle system
 *  8. Navbar scroll behaviour
 *  9. Hamburger menu
 * 10. Image blur-up lazy loading
 * 11. Splitting.js hero headline animation
 * 12. Language selector
 * 13. Floating hover image on capability cards
 * 14. Typewriter hero subtext
 * ═══════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ─── FEATURE DETECTION ───────────────────────────────────────
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasHover = window.matchMedia('(hover: hover)').matches;


  // ─── 1. ADVANCED TWO-PART CURSOR (deprecated — replaced by Phase 4 cursor.js) ────
  function initCursor() {
    return; // disabled: Phase 4 cursor.js handles all cursor behaviour
    if (isTouch || !hasHover) return; // eslint-disable-line no-unreachable

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
      ringX += (mouseX - ringX) * 0.5;
      ringY += (mouseY - ringY) * 0.5;
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

    function openMenu() {
      links.classList.add('open');
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', function () {
      if (links.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on outside tap
    document.addEventListener('click', function (e) {
      if (links.classList.contains('open') && !links.contains(e.target) && !btn.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        closeMenu();
      }
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
      var toggle = dd.querySelector(':scope > a, :scope > button');
      var items = menu ? menu.querySelectorAll('li') : [];
      var menuLinks = menu ? menu.querySelectorAll('a') : [];

      function openDropdown() {
        clearTimeout(closeTimer);
        dd.classList.add('dd-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        // Stagger items (desktop only)
        if (!mq.matches && typeof gsap !== 'undefined' && items.length) {
          gsap.fromTo(items,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out', stagger: 0.06 }
          );
        }
      }

      function closeDropdown() {
        dd.classList.remove('dd-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }

      function startClose() {
        if (mq.matches) return;
        closeTimer = setTimeout(closeDropdown, 300);
      }

      // Set ARIA attributes on toggle
      if (toggle) {
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('aria-haspopup', 'true');
        toggle.setAttribute('aria-expanded', 'false');
      }
      if (menu) {
        menu.setAttribute('role', 'menu');
      }
      menuLinks.forEach(function(link) {
        link.setAttribute('role', 'menuitem');
      });

      // Desktop: hover
      dd.addEventListener('mouseenter', function() {
        if (mq.matches) return;
        openDropdown();
      });
      dd.addEventListener('mouseleave', startClose);
      if (menu) {
        menu.addEventListener('mouseenter', function() { clearTimeout(closeTimer); });
        menu.addEventListener('mouseleave', startClose);
      }

      // Keyboard: open on Enter/Space, navigate with arrows
      if (toggle) {
        toggle.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            openDropdown();
            if (menuLinks.length) menuLinks[0].focus();
          }
        });
      }

      // Arrow key navigation within menu
      menuLinks.forEach(function(link, idx) {
        link.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (idx < menuLinks.length - 1) menuLinks[idx + 1].focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (idx > 0) menuLinks[idx - 1].focus();
            else if (toggle) toggle.focus();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            closeDropdown();
            if (toggle) toggle.focus();
          } else if (e.key === 'Tab') {
            // Close dropdown when tabbing out of last item
            if (!e.shiftKey && idx === menuLinks.length - 1) {
              closeDropdown();
            } else if (e.shiftKey && idx === 0) {
              closeDropdown();
            }
          }
        });
      });

      // Close on focus leaving the dropdown entirely
      dd.addEventListener('focusout', function(e) {
        requestAnimationFrame(function() {
          if (!dd.contains(document.activeElement)) {
            closeDropdown();
          }
        });
      });

      // Mobile: tap to toggle (skip lang-selector — always visible)
      if (!dd.classList.contains('lang-selector')) {
        if (toggle) {
          toggle.addEventListener('click', function(e) {
            if (!mq.matches) return;
            e.preventDefault();
            if (dd.classList.contains('dd-open')) {
              closeDropdown();
            } else {
              openDropdown();
            }
          });
        }
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

      // Safety: force-reveal any elements still hidden after 1.5s
      // (covers edge cases where ScrollTrigger fails on mobile or initial viewport)
      setTimeout(function() {
        els.forEach(function(el) {
          var style = window.getComputedStyle(el);
          if (parseFloat(style.opacity) < 0.1) {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
          }
        });
      }, 1500);
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

    // Mark active language in dropdown and set real hrefs for SEO / no-JS fallback
    var langLinks = document.querySelectorAll('.lang-dropdown a');
    langLinks.forEach(function(link) {
      var lang = link.getAttribute('data-lang');
      if (lang === currentLang) {
        link.classList.add('active');
      }
      // Set real href so crawlers and no-JS users get a working link
      link.setAttribute('href', getLangHref(lang, currentLang));
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var lang = this.getAttribute('data-lang');
        if (lang === currentLang) return;
        localStorage.setItem('preferred_lang', lang);
        navigateToLang(lang, currentLang);
      });
    });

    // Update selector display text
    var selectorLabel = document.querySelector('.lang-selector > a, .lang-selector > button');
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

  function getLangHref(targetLang, currentLang) {
    var path = window.location.pathname;
    var cleanPath = path;
    if (currentLang !== 'en') {
      cleanPath = cleanPath.replace('/' + currentLang + '/', '/');
    }
    if (targetLang === 'en') return cleanPath;
    var parts = cleanPath.split('/');
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].indexOf('.html') !== -1 || parts[i] === 'capabilities') {
        parts.splice(i, 0, targetLang);
        return parts.join('/');
      }
    }
    var base = cleanPath.endsWith('/') ? cleanPath : cleanPath + '/';
    return base + targetLang + '/';
  }

  function navigateToLang(targetLang, currentLang) {
    var path = window.location.pathname;

    // Detect base path for GitHub Pages (e.g. /website/)
    // by finding the first segment that isn't a lang code
    var segments = path.split('/').filter(Boolean);
    var langCodes = ['cn', 'id'];
    var basePath = '';

    // Strip current lang from path to get the "english" version
    var cleanPath = path;
    if (currentLang !== 'en') {
      // Replace first occurrence of /cn/ or /id/ with /
      cleanPath = cleanPath.replace('/' + currentLang + '/', '/');
    }

    if (targetLang === 'en') {
      window.location.href = cleanPath;
    } else {
      // Insert target lang after the base path but before the rest
      // Find the position after the base directory (GitHub Pages or root)
      // For paths like /website/capabilities/plastic-toys.html
      // we need /website/cn/capabilities/plastic-toys.html
      // For paths like /capabilities/plastic-toys.html
      // we need /cn/capabilities/plastic-toys.html
      // For paths like /index.html → /cn/index.html

      // Dynamic detection: find the lang insertion point by looking for
      // the first path segment that is a known page file or subdirectory.
      // This avoids hardcoding page names and works with any new pages.
      var parts = cleanPath.split('/');
      var insertIdx = -1;
      for (var i = 0; i < parts.length; i++) {
        // A segment ending in .html or a known subdirectory containing pages
        if (parts[i].indexOf('.html') !== -1 || parts[i] === 'capabilities') {
          insertIdx = i;
          break;
        }
      }

      if (insertIdx !== -1) {
        parts.splice(insertIdx, 0, targetLang);
        window.location.href = parts.join('/');
      } else {
        // Fallback: append lang + index
        var base = cleanPath.endsWith('/') ? cleanPath : cleanPath + '/';
        window.location.href = base + targetLang + '/';
      }
    }
  }

  function showLangBanner(preferred, current) {
    var names = { en: 'English', cn: '繁體中文', id: 'Bahasa Indonesia' };
    var bannerTexts = {
      en: { msg: 'This page is available in ', btn: 'Switch' },
      cn: { msg: '此頁面提供以下語言版本：', btn: '切換' },
      id: { msg: 'Halaman ini tersedia dalam ', btn: 'Ganti' }
    };
    var t = bannerTexts[current] || bannerTexts.en;
    var banner = document.createElement('div');
    banner.className = 'lang-banner';
    banner.innerHTML =
      '<span>' + t.msg + names[preferred] + '</span>' +
      '<a href="#" id="langBannerSwitch">' + t.btn + '</a>' +
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
      plastic: '/assets/images/stock/cap-plastic-fg.webp',
      plush: '/assets/images/stock/cap-plush-fg.webp',
      dolls: '/assets/images/stock/cap-dolls-fg.webp',
      rc: '/assets/images/stock/cap-rc-fg.webp',
      costumes: '/assets/images/stock/cap-costumes-fg.webp'
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

        // text-gradient spans use background-clip:text + transparent text-fill.
        // Per-char opacity animation on these elements can fail in some browsers
        // (the background doesn't repaint correctly during opacity transitions).
        // Fix: animate the .text-gradient span as a whole unit instead.
        var gradientSpan = result.el.querySelector('.text-gradient');
        var regularItems = items;

        if (gradientSpan) {
          regularItems = Array.prototype.filter.call(items, function(item) {
            return !gradientSpan.contains(item);
          });
          // Hide gradient span as whole; leave its children at default opacity
          gsap.set(gradientSpan, { opacity: 0, y: 30 });
        }

        // Set initial state for regular (non-gradient) chars
        if (regularItems.length) {
          gsap.set(regularItems, { opacity: 0, y: 30, rotation: splitBy === 'chars' ? 6 : 0 });
        }

        // Check if element is already in viewport (hero at top of page)
        var rect = result.el.getBoundingClientRect();
        var inView = rect.top < window.innerHeight * 0.9;
        var staggerVal = splitBy === 'chars' ? 0.02 : 0.05;
        var gradientDelay = regularItems.length ? 0.3 + regularItems.length * staggerVal : 0.3;

        if (inView) {
          // Already visible — animate immediately with a short delay
          if (regularItems.length) {
            gsap.to(regularItems, {
              opacity: 1, y: 0, rotation: 0,
              duration: 0.5, ease: 'power3.out',
              stagger: staggerVal, delay: 0.3
            });
          }
          if (gradientSpan) {
            gsap.to(gradientSpan, {
              opacity: 1, y: 0, duration: 0.6,
              ease: 'power3.out', delay: gradientDelay
            });
          }
        } else if (typeof ScrollTrigger !== 'undefined') {
          if (regularItems.length) {
            gsap.to(regularItems, {
              opacity: 1, y: 0, rotation: 0,
              duration: 0.5, ease: 'power3.out',
              stagger: staggerVal,
              scrollTrigger: { trigger: result.el, start: 'top 85%', once: true }
            });
          }
          if (gradientSpan) {
            gsap.to(gradientSpan, {
              opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
              scrollTrigger: { trigger: result.el, start: 'top 85%', once: true }
            });
          }
        } else {
          if (regularItems.length) {
            gsap.to(regularItems, {
              opacity: 1, y: 0, rotation: 0,
              duration: 0.5, ease: 'power3.out',
              stagger: staggerVal, delay: 0.3
            });
          }
          if (gradientSpan) {
            gsap.to(gradientSpan, {
              opacity: 1, y: 0, duration: 0.6,
              ease: 'power3.out', delay: gradientDelay
            });
          }
        }
      });
    } catch (e) {
      console.warn('Splitting.js init failed:', e);
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

    var lang = document.documentElement.lang || 'en';
    var extraMessages = {
      en: [
        "From a single workshop in Sha Tau Kok to manufacturing sites spanning China and Indonesia.",
        "39 years of precision manufacturing for the world's leading toy brands.",
        "From first sample to final carton — everything under one roof.",
        "Your vision. Our craftsmanship. Built to last."
      ],
      zh: [
        "從沙頭角的一間小工廠，發展至遍佈中國與印尼的製造基地。",
        "39年精密製造，服務全球頂尖玩具品牌。",
        "從首件樣品到最終裝箱——所有環節均在廠內完成。",
        "您的願景，我們的工藝，經久不衰。"
      ],
      id: [
        "Dari satu bengkel di Sha Tau Kok hingga fasilitas manufaktur di Tiongkok dan Indonesia.",
        "39 tahun manufaktur presisi untuk merek mainan terkemuka dunia.",
        "Dari sampel pertama hingga karton terakhir — semuanya dalam satu atap.",
        "Visi Anda. Keahlian kami. Dibuat untuk bertahan."
      ]
    };
    var key = lang === 'zh-Hant' || lang === 'zh' ? 'zh' : lang;
    var messages = [el.textContent.trim()].concat(extraMessages[key] || extraMessages.en);

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


  // ─── LENIS SMOOTH SCROLL (P1) ────────────────────────────
  function initLenis() {
    if (prefersReducedMotion) return;
    if (typeof Lenis === 'undefined') return;

    var lenis = new Lenis({
      duration: 1.2,
      easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2
    });

    // Sync with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    window.__lenis = lenis;
  }


  // ─── MOUSE FOLLOW ENHANCEMENT (P2) ─────────────────────
  function initMouseFollow() {
    if (isMobile || isTouch || !hasHover) return;
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined') return;

    // Hero parallax tilt
    var hero = document.querySelector('.hero, .about-hero, .sub-hero, .page-hero');
    if (hero) {
      var heroEls = hero.querySelectorAll('.hero-tag, .hero-title, .hero-sub, .hero-actions, .about-hero-tag, .about-hero-title, .about-hero-sub, .sub-hero-tag, .sub-hero-title, .sub-hero-sub, .page-hero-tag, h1, p');
      if (heroEls.length) {
        var qx = gsap.quickTo(heroEls, 'x', { duration: 0.6, ease: 'power3' });
        var qy = gsap.quickTo(heroEls, 'y', { duration: 0.6, ease: 'power3' });
        hero.addEventListener('mousemove', function(e) {
          var rect = hero.getBoundingClientRect();
          var nx = (e.clientX - rect.left) / rect.width - 0.5;
          var ny = (e.clientY - rect.top) / rect.height - 0.5;
          qx(nx * 12);
          qy(ny * 8);
        });
        hero.addEventListener('mouseleave', function() {
          qx(0);
          qy(0);
        });
      }
    }

    // Capability cards 3D tilt
    var capCards = document.querySelectorAll('.cap-card, .glass-card, .value-card, .job-card');
    capCards.forEach(function(card) {
      card.style.transformStyle = 'preserve-3d';
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var nx = (e.clientX - rect.left) / rect.width - 0.5;
        var ny = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateY: nx * 8,
          rotateX: ny * -8,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800
        });
      });
      card.addEventListener('mouseleave', function() {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }


  // ─── MOBILE NAV STAGGER (P2) ───────────────────────────
  function initMobileNavStagger() {
    var btn = document.getElementById('hamburger');
    var links = document.getElementById('navLinks');
    if (!btn || !links) return;

    var mq = window.matchMedia('(max-width: 768px)');
    if (!mq.matches) return;

    // Observe class changes on navLinks for stagger timing
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.attributeName !== 'class') return;
        if (links.classList.contains('open')) {
          var items = links.querySelectorAll(':scope > li');
          items.forEach(function(item, i) {
            item.style.transitionDelay = (i * 50) + 'ms';
          });
        } else {
          var items = links.querySelectorAll(':scope > li');
          items.forEach(function(item) {
            item.style.transitionDelay = '0ms';
          });
        }
      });
    });
    observer.observe(links, { attributes: true });
  }


  // ─── BRAND LOADER (P0) — Lusion-inspired ────────────────
  function initLoader() {
    var loader = document.getElementById('brandLoader');
    if (!loader) return;
    document.body.style.overflow = 'hidden';

    var logoEl = loader.querySelector('.loader-logo');
    var percentEl = loader.querySelector('.loader-percent');
    var ringEl = loader.querySelector('.loader-ring');
    var ringFill = loader.querySelector('.loader-ring-fill');
    var taglineSpans = loader.querySelectorAll('.loader-tagline span');
    var startTime = Date.now();
    var DURATION = 1600;
    var dismissed = false;
    var current = 0;
    var target = 0;
    var raf;
    var taglineRevealed = false;

    // Compute SVG ring circumference
    var ringCircumference = ringFill ? parseFloat(ringFill.getAttribute('r')) * 2 * Math.PI : 0;

    // Entrance — fade in logo, counter, ring
    requestAnimationFrame(function() {
      if (logoEl) logoEl.classList.add('visible');
      if (percentEl) percentEl.classList.add('visible');
      if (ringEl) ringEl.classList.add('visible');
    });

    // Loading steps — fast start, slow finish (feels organic)
    var steps = [
      { at: 150,  val: 20 },
      { at: 350,  val: 38 },
      { at: 600,  val: 55 },
      { at: 900,  val: 68 },
      { at: 1200, val: 78 },
      { at: 1500, val: 86 },
      { at: 1800, val: 92 },
      { at: 2000, val: 96 },
    ];

    steps.forEach(function(s) {
      setTimeout(function() { target = s.val; }, s.at);
    });

    function updateDisplay(val) {
      var rounded = Math.round(val);
      if (percentEl) percentEl.textContent = rounded + '%';
      // Update SVG ring
      if (ringFill && ringCircumference) {
        var filled = (val / 100) * ringCircumference;
        ringFill.setAttribute('stroke-dasharray', filled + ',' + ringCircumference);
      }
      // Reveal tagline at 40%
      if (!taglineRevealed && rounded >= 40 && taglineSpans.length) {
        taglineRevealed = true;
        taglineSpans.forEach(function(span, i) {
          setTimeout(function() {
            span.classList.add('visible');
          }, i * 30);
        });
      }
    }

    // Smooth lerp tick
    function tick() {
      var diff = target - current;
      current += diff * 0.08;

      if (Math.abs(diff) < 0.5 && target === 100) {
        current = 100;
      }

      updateDisplay(current);

      if (current < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        // Hold at 100% briefly, then exit
        setTimeout(exitLoader, 350);
      }
    }

    raf = requestAnimationFrame(tick);

    function exitLoader() {
      if (dismissed) return;
      dismissed = true;

      // Step 1: fade out counter + progress line
      loader.classList.add('exit-counter');

      // Step 2: fade out logo (overlap with counter fade)
      setTimeout(function() {
        loader.classList.add('exit-logo');
      }, 150);

      // Step 3: fade out loader background → reveal page
      setTimeout(function() {
        loader.classList.add('exit-bg');
        document.body.style.overflow = '';

        // Step 4: stagger reveal page content
        var reveals = document.querySelectorAll('.page-reveal');
        reveals.forEach(function(el, i) {
          setTimeout(function() {
            el.classList.add('revealed');
          }, i * 120);
        });
      }, 400);

      // Clean up
      setTimeout(function() {
        loader.classList.add('dismissed');
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }, 1300);
    }

    // Push to 100% after DURATION or when fonts ready (whichever is later)
    var fontsLoaded = false;
    var timerDone = false;

    function checkComplete() {
      if (fontsLoaded && timerDone) {
        target = 100;
      }
    }

    setTimeout(function() {
      timerDone = true;
      checkComplete();
    }, DURATION);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() {
        fontsLoaded = true;
        checkComplete();
      }).catch(function() {
        fontsLoaded = true;
        checkComplete();
      });
    } else {
      fontsLoaded = true;
    }

    // Absolute fallback — never stay stuck longer than 3s
    setTimeout(function() {
      if (!dismissed) {
        target = 100;
      }
    }, 3000);
  }


  // ─── BACK-TO-TOP BUTTON ──────────────────────────────────
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    var visible = false;
    function check() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 400 && !visible) {
        visible = true;
        btn.classList.add('visible');
      } else if (scrollY <= 400 && visible) {
        visible = false;
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', check, { passive: true });
    check();

    btn.addEventListener('click', function() {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }


  // ─── INIT ON DOM READY ────────────────────────────────────
  function init() {
    initLoader();
    initCursor();
    initMagnetic();
    initScrollProgress();
    initAurora();
    initNavbar();
    initHamburger();
    initMobileNavStagger();
    initDropdowns();
    initLazyImages();
    initReveal();
    initMobileAnimations();
    initLanguageSelector();
    initSplitting();
    initParallax();
    initLenis();
    initMouseFollow();
    // Three.js effects — init now if already loaded, otherwise defer
    if (typeof THREE !== 'undefined') {
      initParticles();
    }
    window.__initThreeEffects = function() {
      initParticles();
    };
    initCapHoverImage();
    initTypewriter();
    initBackToTop();
    // Page transitions last — they intercept clicks
    initPageTransitions();

    // Ensure ScrollTrigger recalculates after all inits
    if (typeof ScrollTrigger !== 'undefined') {
      requestAnimationFrame(function() { ScrollTrigger.refresh(); });
    }

    // Dynamic copyright year
    var yearEls = document.querySelectorAll('.footer-year, #footerYear');
    var currentYear = new Date().getFullYear().toString();
    yearEls.forEach(function(el) { el.textContent = currentYear; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
