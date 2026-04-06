(function () {
  'use strict';

  // ─── WEBGL SHADER BACKGROUND ─────────────────────────────────
  // Living organic gradient for the hero section using Three.js
  // ShaderMaterial with simplex noise. Responds to scroll velocity
  // via Lenis integration. Handles WebGL context loss gracefully
  // and explicitly disposes all GPU resources on kill().

  var canvas = null;
  var renderer = null;
  var scene = null;
  var camera = null;
  var geometry = null;
  var material = null;
  var mesh = null;
  var uniforms = null;
  var observer = null;
  var rafHandle = null;
  var scrollListener = null;
  var resizeHandler = null;
  var contextLostHandler = null;
  var contextRestoredHandler = null;
  var scrollVelocity = 0;
  var startTime = 0;
  var isVisible = true;
  var initialized = false;

  // ─── GLSL SHADERS ─────────────────────────────────────────────

  var vertexShader = [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = vec4(position, 1.0);',
    '}'
  ].join('\n');

  var fragmentShader = [
    'precision mediump float;',
    '',
    'uniform float uTime;',
    'uniform float uScrollVelocity;',
    'uniform vec2 uResolution;',
    '',
    'varying vec2 vUv;',
    '',
    '// Simplex noise 2D — Ashima Arts (compact inline)',
    'vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
    'vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }',
    'vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }',
    '',
    'float snoise(vec2 v) {',
    '  const vec4 C = vec4(0.211324865405187, 0.366025403784439,',
    '                       -0.577350269189626, 0.024390243902439);',
    '  vec2 i  = floor(v + dot(v, C.yy));',
    '  vec2 x0 = v - i + dot(i, C.xx);',
    '  vec2 i1;',
    '  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
    '  vec4 x12 = x0.xyxy + C.xxzz;',
    '  x12.xy -= i1;',
    '  i = mod289(i);',
    '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))',
    '                            + i.x + vec3(0.0, i1.x, 1.0));',
    '  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),',
    '                            dot(x12.zw, x12.zw)), 0.0);',
    '  m = m * m;',
    '  m = m * m;',
    '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
    '  vec3 h = abs(x) - 0.5;',
    '  vec3 ox = floor(x + 0.5);',
    '  vec3 a0 = x - ox;',
    '  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);',
    '  vec3 g;',
    '  g.x = a0.x * x0.x + h.x * x0.y;',
    '  g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
    '  return 130.0 * dot(m, g);',
    '}',
    '',
    'void main() {',
    '  vec2 uv = vUv;',
    '  float aspect = uResolution.x / uResolution.y;',
    '  uv.x *= aspect;',
    '',
    '  // Base time speed + scroll velocity boost',
    '  float speed = 0.15 + abs(uScrollVelocity) * 0.08;',
    '  float t = uTime * speed;',
    '',
    '  // Multi-octave noise for organic feel',
    '  float n1 = snoise(uv * 1.5 + t * 0.3);',
    '  float n2 = snoise(uv * 3.0 - t * 0.2 + 10.0);',
    '  float n3 = snoise(uv * 0.8 + t * 0.15 + vec2(5.0, 3.0));',
    '',
    '  float noise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;',
    '',
    '  // Brand color palette',
    '  vec3 cream      = vec3(0.961, 0.973, 0.941);',
    '  vec3 brandLight = vec3(0.612, 0.800, 0.400);',
    '  vec3 brand      = vec3(0.486, 0.702, 0.259);',
    '  vec3 brandDark  = vec3(0.333, 0.545, 0.184);',
    '',
    '  // Gradient blend using noise',
    '  vec3 color = cream;',
    '  color = mix(color, brandLight, smoothstep(-0.2, 0.4, noise) * 0.25);',
    '  color = mix(color, brand, smoothstep(0.1, 0.6, noise) * 0.15);',
    '  color = mix(color, brandDark, smoothstep(0.3, 0.8, noise) * 0.08);',
    '',
    '  // Subtle directional gradient overlay (top-left to bottom-right)',
    '  float gradient = dot(vUv, vec2(0.3, 0.7));',
    '  color = mix(color, cream, gradient * 0.3);',
    '',
    '  // Scroll velocity intensifies color saturation',
    '  float velocityBoost = min(abs(uScrollVelocity) * 0.15, 0.3);',
    '  color = mix(color, brand, velocityBoost * 0.2);',
    '',
    '  // Mostly opaque with subtle noise variation',
    '  float alpha = 0.85 + noise * 0.1;',
    '',
    '  gl_FragColor = vec4(color, alpha);',
    '}'
  ].join('\n');

  // ─── RENDER LOOP ──────────────────────────────────────────────

  function render() {
    if (!isVisible || !renderer || !uniforms) { rafHandle = null; return; }
    rafHandle = requestAnimationFrame(render);

    var elapsed = (performance.now() - startTime) * 0.001;
    uniforms.uTime.value = elapsed;

    // Lerp scroll velocity for smooth transitions
    uniforms.uScrollVelocity.value += (scrollVelocity - uniforms.uScrollVelocity.value) * 0.1;

    renderer.render(scene, camera);
  }

  // ─── MODULE LIFECYCLE ─────────────────────────────────────────

  function init() {
    if (initialized) return;

    // Page gate: only run on home page
    if (window.RR && window.RR.page !== 'home') return;

    // CDN graceful degradation: THREE must be loaded
    if (typeof THREE === 'undefined') return;

    // Touch device gate (PERF-04): complete no-op on coarse pointer
    var isTouch = (window.RR && window.RR.breakpoints && window.RR.breakpoints.isCoarsePointer) ||
                  window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    // Reduced motion gate: CSS gradient is sufficient
    if (window.RR && window.RR.state && window.RR.state.hasReducedMotion) return;

    // Find hero background container
    var heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    // ─── Canvas creation (WEBGL-02) ─────────────────────────────
    canvas = document.createElement('canvas');
    canvas.id = 'rr-webgl-bg';
    canvas.style.pointerEvents = 'none';
    heroBg.insertBefore(canvas, heroBg.firstChild);

    // ─── Renderer setup (WEBGL-01) ──────────────────────────────
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power'
      });
    } catch (e) {
      console.warn('[RR:webglBg] WebGL renderer creation failed:', e);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      canvas = null;
      return;
    }

    var w = heroBg.offsetWidth || window.innerWidth;
    var h = heroBg.offsetHeight || window.innerHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // ─── Scene + camera ─────────────────────────────────────────
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // ─── Geometry + Material (WEBGL-03) ─────────────────────────
    geometry = new THREE.PlaneGeometry(2, 2);
    uniforms = {
      uTime: { value: 0 },
      uScrollVelocity: { value: 0 },
      uResolution: { value: new THREE.Vector2(w, h) }
    };

    material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      transparent: true,
      depthWrite: false
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ─── Scroll velocity sync (WEBGL-04) ────────────────────────
    scrollVelocity = 0;
    scrollListener = function (e) {
      scrollVelocity = e.velocity || 0;
    };
    if (window.RR && window.RR.lenis) {
      window.RR.lenis.on('scroll', scrollListener);
    }

    // ─── Visibility optimization ────────────────────────────────
    var heroEl = document.getElementById('hero');
    if (heroEl && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !rafHandle) rafHandle = requestAnimationFrame(render);
      }, { threshold: 0 });
      observer.observe(heroEl);
    }

    // ─── Resize handler ─────────────────────────────────────────
    resizeHandler = function () {
      if (!renderer || !uniforms) return;
      var nw = heroBg.offsetWidth || window.innerWidth;
      var nh = heroBg.offsetHeight || window.innerHeight;
      renderer.setSize(nw, nh);
      uniforms.uResolution.value.set(nw, nh);
    };
    window.addEventListener('resize', resizeHandler);

    // ─── Context loss handler (WEBGL-05) ────────────────────────
    contextLostHandler = function (e) {
      e.preventDefault();
      if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = null; }
      if (canvas) canvas.style.display = 'none';
      console.warn('[RR:webglBg] WebGL context lost — CSS gradient fallback active');
    };
    contextRestoredHandler = function () {
      if (canvas) canvas.style.display = '';
      if (isVisible) rafHandle = requestAnimationFrame(render);
      console.log('[RR:webglBg] WebGL context restored');
    };
    canvas.addEventListener('webglcontextlost', contextLostHandler);
    canvas.addEventListener('webglcontextrestored', contextRestoredHandler);

    // ─── Start render loop ──────────────────────────────────────
    startTime = performance.now();
    initialized = true;
    rafHandle = requestAnimationFrame(render);

    console.log('[RR:webglBg] Shader background initialized');
  }

  function kill() {
    if (!initialized) return;

    // Cancel render loop
    if (rafHandle) { cancelAnimationFrame(rafHandle); rafHandle = null; }

    // Remove Lenis listener
    if (window.RR && window.RR.lenis && scrollListener) {
      window.RR.lenis.off('scroll', scrollListener);
    }
    scrollListener = null;

    // Remove resize listener
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }

    // Remove context loss listeners
    if (canvas) {
      canvas.removeEventListener('webglcontextlost', contextLostHandler);
      canvas.removeEventListener('webglcontextrestored', contextRestoredHandler);
    }
    contextLostHandler = null;
    contextRestoredHandler = null;

    // Disconnect intersection observer
    if (observer) { observer.disconnect(); observer = null; }

    // *** EXPLICIT GPU DISPOSAL (WEBGL-06) ***
    if (mesh && scene) {
      scene.remove(mesh);
    }
    mesh = null;

    if (geometry) { geometry.dispose(); geometry = null; }
    if (material) { material.dispose(); material = null; }
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer = null;
    }

    // Remove canvas from DOM
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
      canvas = null;
    }

    // Clear references
    scene = null;
    camera = null;
    uniforms = null;
    scrollVelocity = 0;
    initialized = false;
  }

  function refresh() {
    kill();
    init();
  }

  // ─── REGISTER MODULE ──────────────────────────────────────────

  window.RR = window.RR || {};

  if (typeof window.RR.register === 'function') {
    window.RR.register('webglBg', { init: init, kill: kill, refresh: refresh });
  }

  // ─── DEFERRED INIT (Three.js loads async) ─────────────────────
  // Three.js is loaded asynchronously in index.html. This script runs
  // before THREE is available. Chain onto __initThreeEffects callback.
  if (typeof THREE !== 'undefined') {
    // THREE already loaded (unlikely but handle it)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { init(); });
    } else {
      init();
    }
  } else {
    // THREE loads async — chain onto existing callback pattern
    var origCallback = window.__initThreeEffects;
    window.__initThreeEffects = function () {
      if (typeof origCallback === 'function') origCallback();
      init();
    };
  }

}());
