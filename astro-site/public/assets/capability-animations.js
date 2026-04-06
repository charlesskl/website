(function(){
  'use strict';
  var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  function editorialReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Watermark parallax
    var wm = document.querySelector('.editorial-watermark');
    if (wm && !isMobile) {
      gsap.to(wm, {
        y: -80, ease:'none',
        scrollTrigger: { trigger:'.editorial', start:'top bottom', end:'bottom top', scrub:true }
      });
    }

    // Photo hover-parallax on scroll
    if (!isMobile) {
      document.querySelectorAll('.editorial-photo').forEach(function(ph, i) {
        gsap.to(ph, {
          y: -(20 + i * 15), ease:'none',
          scrollTrigger: { trigger:'.editorial', start:'top bottom', end:'bottom top', scrub:true }
        });
      });
    }
  }

  function footerReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    var f = document.querySelector('footer.footer-reveal');
    var m = document.querySelector('.main-content');
    if (!f || !m) return;
    ScrollTrigger.create({
      trigger:f, start:'top bottom', end:'top top', scrub:true,
      onUpdate: function(self) { m.style.boxShadow = '0 -20px 60px rgba(0,0,0,' + (self.progress*0.15) + ')'; }
    });
  }

  function init() {
    editorialReveal();
    footerReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    requestAnimationFrame(function() { requestAnimationFrame(init); });
  }
})();
