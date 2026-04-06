(function() {
  'use strict';

  // ─── FLOATING LABEL MANAGEMENT ─────────────────────────────
  function initFloatingLabels() {
    var fields = document.querySelectorAll('[data-field]');
    fields.forEach(function(field) {
      // Check initial value
      if (field.value) field.classList.add('has-value');

      field.addEventListener('input', function() {
        field.classList.toggle('has-value', !!field.value);
        updateProgress();
        // Clear error when user starts typing
        if (field.hasAttribute('required') && field.value.trim()) {
          field.setAttribute('aria-invalid', 'false');
          var errorId = field.id + 'Error';
          var errorEl = document.getElementById(errorId);
          if (errorEl) {
            errorEl.textContent = '';
          }
        }
      });
      field.addEventListener('change', function() {
        field.classList.toggle('has-value', !!field.value);
        updateProgress();
      });

      // Spring animation on focus
      field.addEventListener('focus', function() {
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(field, { scale: 1 }, { scale: 1.005, duration: 0.3, ease: 'elastic.out(1, 0.5)' });
        }
      });
      field.addEventListener('blur', function() {
        if (typeof gsap !== 'undefined') {
          gsap.to(field, { scale: 1, duration: 0.2, ease: 'power2.out' });
        }
      });
    });
  }


  // ─── FORM PROGRESS INDICATOR ───────────────────────────────
  function updateProgress() {
    var fields = document.querySelectorAll('[data-field]');
    var filled = 0;
    fields.forEach(function(f) { if (f.value.trim()) filled++; });
    var pct = (filled / fields.length) * 100;
    var fill = document.getElementById('progressFill');
    if (fill) fill.style.width = pct + '%';
  }


  // ─── FORM SUBMISSION ───────────────────────────────────────
  function initFormSubmit() {
    var form = document.getElementById('contactForm');
    var btn = document.getElementById('submitBtn');
    if (!form || !btn) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Clear previous errors
      form.querySelectorAll('[required]').forEach(function(f) {
        f.setAttribute('aria-invalid', 'false');
      });
      form.querySelectorAll('.error-message').forEach(function(em) {
        em.textContent = '';
      });

      // Basic validation
      var required = form.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function(f) {
        if (!f.value.trim()) {
          valid = false;
          f.setAttribute('aria-invalid', 'true');
          var errorId = f.id + 'Error';
          var errorEl = document.getElementById(errorId);
          if (errorEl) {
            errorEl.textContent = 'This field is required';
          }
        }
      });
      if (!valid) {
        if (typeof gsap !== 'undefined') {
          gsap.to(btn, { x: -8, duration: 0.08, repeat: 5, yoyo: true, ease: 'power2.inOut',
            onComplete: function() { gsap.set(btn, { x: 0 }); }
          });
        }
        return;
      }

      var name = (form.firstName.value + ' ' + form.lastName.value).trim();
      var subject = encodeURIComponent('[Website] ' + (form.subject.value || 'Enquiry') + ' — ' + name);
      var body = encodeURIComponent(
        'Name: ' + name +
        '\nEmail: ' + form.email.value +
        (form.company.value ? '\nCompany: ' + form.company.value : '') +
        '\nSubject: ' + (form.subject.value || 'N/A') +
        '\n\n' + form.message.value
      );
      window.location.href = 'mailto:info@royalregenthk.com?subject=' + subject + '&body=' + body;

      btn.classList.add('sent');
      setTimeout(function() {
        btn.classList.remove('sent');
        form.reset();
        document.querySelectorAll('[data-field]').forEach(function(f) {
          f.classList.remove('has-value');
        });
        updateProgress();
      }, 3000);
    });
  }


  // ─── INIT ──────────────────────────────────────────────────
  function init() {
    initFloatingLabels();
    updateProgress();
    initFormSubmit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    requestAnimationFrame(function() { requestAnimationFrame(init); });
  }
})();
