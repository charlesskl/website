(function() {
  'use strict';

  function initHeroCanvas() {
    var container = document.getElementById('hero3dContainer');
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    container.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var mouseX = -9999, mouseY = -9999;
    var isVisible = true;
    var raf = null;
    var t = 0;

    var NODE_COUNT = 28;
    var nodes = [];
    var BRAND   = { r: 124, g: 179, b: 66 };
    var CONNECT_DIST = 180;

    function resize() {
      W = container.offsetWidth  || 500;
      H = container.offsetHeight || 400;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initNodes() {
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++) {
        var layer = i < 14 ? 0 : 1;
        var angle = (i % 14) * (Math.PI * 2 / 14) + (layer * 0.4);
        var radiusFrac = layer === 0 ? 0.22 + Math.random() * 0.14 : 0.38 + Math.random() * 0.18;
        nodes.push({
          ax: 0.5 + Math.cos(angle) * radiusFrac,
          ay: 0.5 + Math.sin(angle) * radiusFrac,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.4,
          drift: 18 + Math.random() * 18,
          r: layer === 0 ? 3.5 : 2.5,
          alpha: layer === 0 ? 0.9 : 0.65
        });
      }
    }

    function getNodePos(n, time) {
      var px = n.ax * W + Math.cos(n.phase + time * n.speed * 0.7) * n.drift;
      var py = n.ay * H + Math.sin(n.phase + time * n.speed * 0.9) * n.drift;
      var dx = mouseX - px;
      var dy = mouseY - py;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 220 && dist > 0) {
        var pull = (1 - dist / 220) * 18;
        px += (dx / dist) * pull;
        py += (dy / dist) * pull;
      }
      return { x: px, y: py };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;

      var positions = nodes.map(function(n) { return getNodePos(n, t); });

      for (var i = 0; i < NODE_COUNT; i++) {
        for (var j = i + 1; j < NODE_COUNT; j++) {
          var dx = positions[i].x - positions[j].x;
          var dy = positions[i].y - positions[j].y;
          var d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            var alpha = (1 - d / CONNECT_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[j].x, positions[j].y);
            ctx.strokeStyle = 'rgba(' + BRAND.r + ',' + BRAND.g + ',' + BRAND.b + ',' + alpha + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < NODE_COUNT; k++) {
        var p = positions[k];
        var n = nodes[k];
        var pulse = 0.75 + 0.25 * Math.sin(t * n.speed + n.phase);

        var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, n.r * 3.5);
        grd.addColorStop(0, 'rgba(' + BRAND.r + ',' + BRAND.g + ',' + BRAND.b + ',' + (n.alpha * pulse * 0.5) + ')');
        grd.addColorStop(1, 'rgba(' + BRAND.r + ',' + BRAND.g + ',' + BRAND.b + ',0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, n.r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + BRAND.r + ',' + BRAND.g + ',' + BRAND.b + ',' + (n.alpha * pulse) + ')';
        ctx.fill();
      }

      var cx = W * 0.5, cy = H * 0.5;
      var ringR = Math.min(W, H) * 0.28;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.08);
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + BRAND.r + ',' + BRAND.g + ',' + BRAND.b + ',0.07)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 18]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.05);
      ctx.beginPath();
      ctx.arc(0, 0, ringR * 0.62, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + BRAND.r + ',' + BRAND.g + ',' + BRAND.b + ',0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 24]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    function loop() {
      if (!isVisible) { raf = null; return; }
      raf = requestAnimationFrame(loop);
      draw();
    }

    var obs = new IntersectionObserver(function(entries) {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !raf) { raf = requestAnimationFrame(loop); }
    }, { threshold: 0 });
    obs.observe(container);

    document.addEventListener('mousemove', function(e) {
      var rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    document.addEventListener('mouseleave', function() {
      mouseX = mouseY = -9999;
    });

    window.addEventListener('resize', function() {
      resize();
      initNodes();
    });

    resize();
    initNodes();
    raf = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCanvas);
  } else {
    initHeroCanvas();
  }
})();
