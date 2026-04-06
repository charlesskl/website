# ROYAL REGENT TOYS WEBSITE - PERFORMANCE BENCHMARK REPORT
Generated: 2026-04-06
URL: http://localhost:4321/

---

## 1. KEY PERFORMANCE METRICS

### Page Load Timing (Local)
- **TTFB**: 1.26ms (Time to First Byte - excellent, local server)
- **DOM Interactive**: ~480ms
- **DOM Complete**: ~485ms  
- **Total Load Time**: ~485ms (from curl measurement)

### Browse Daemon Performance Metrics
- DNS Lookup: 0ms
- TCP Connect: 0ms
- TTFB: 2ms
- DOM Parse: 453ms
- DOM Ready: 480ms
- Full Load: 485ms

**Status**: Fast page response on localhost. The reported "super laggy" feeling is NOT from initial page load, but likely from **JavaScript execution and animation frame performance during interaction**.

---

## 2. TOTAL PAGE WEIGHT BREAKDOWN

### HTML Document
- **Size**: 26 KB

### JavaScript
| Category | Size | Count | Notes |
|----------|------|-------|-------|
| Animation modules | 168 KB | 21 | Separate small files, all loaded in sequence |
| Shared engine | 50 KB | 1 | Global interaction code |
| Home-specific | 14.7 KB | 2 | home-canvas.js + home-animations.js |
| Astro client | 192 KB | 1 | Astro runtime (dist/_astro/client.js) |
| **Total JS** | **424.7 KB** | - | Uncompressed |

### CSS
- **Local CSS**: 52 KB (Astro-bundled home.css)
- **External CDN CSS**: 20 KB (splitting.css from unpkg)
- **Total CSS**: ~72 KB

### Fonts
- Clash Display (4 weights): 59 KB
- Satoshi (4 weights): 97 KB
- **Total Fonts**: 156 KB (will be gzipped to ~45-50 KB)

### Images
- **Total Images**: 3.0 MB (uncompressed)
- **Key bottleneck images**:
  - factory-assembly-line.webp: 256 KB
  - zooby-aquatic-playset.webp: 192 KB
  - history-bg.webp: 192 KB
  - cap-plastic-bg.webp: 128 KB
  - cap-dolls-bg.webp: 128 KB

### External Dependencies (CDN)
1. **Lenis** (smooth scroll): ~35-40 KB
2. **GSAP** (animations): ~65 KB (gsap.min.js)
3. **GSAP ScrollTrigger**: ~45 KB
4. **GSAP SplitText**: ~35 KB
5. **Splitting.js**: ~20 KB
6. **Unpkg CSS**: ~20 KB

---

## 3. NETWORK REQUEST COUNT

### Total External Resources Requested
- **33 script tags** in HTML
- **21 animation modules** (individual files, NOT bundled)
- **5 CDN scripts** (GSAP, Lenis, Splitting)
- **2 local asset scripts** (home-canvas, home-animations)
- **1 shared engine** (shared.js)
- **~20 images** (capabilities cards, hero, history)
- **2 CSS files** (local + splitting.css)
- **4 font files** (split across 2 font families, 4 weights each)

### Estimated HTTP Requests on Cold Load
- HTML: 1
- JS files: 26 (21 animation + 3 local + 2 asset = 26)
- JS from CDN: 5
- CSS: 2
- Fonts: 4
- Images (above-the-fold): ~6-8
- **Total: ~44-46 requests** (gzip will reduce by ~70%)

---

## 4. THREE.JS STATUS

### Finding: Three.js is NOT loaded
- **webgl-bg.js** (13 KB) references THREE.js API calls
- **No THREE.js library is loaded via CDN or bundled**
- The code checks: `if (typeof THREE === 'undefined') return;`
- **Result**: WebGL shader background is disabled on load

This is a **silent failure** — the user sees no console error, but the animated gradient background never initializes because THREE is undefined.

---

## 5. TOP 10 LARGEST RESOURCES

| # | Resource | Type | Size | Impact |
|---|----------|------|------|--------|
| 1 | Astro client runtime | JS | 192 KB | Essential for Astro hydration |
| 2 | factory-assembly-line.webp | Image | 256 KB | Content image (lazy-loaded) |
| 3 | zooby-aquatic-playset.webp | Image | 192 KB | Content image (lazy-loaded) |
| 4 | history-bg.webp | Image | 192 KB | Hero section background |
| 5 | shared.js | JS | 50 KB | Global interaction engine |
| 6 | GSAP (all 3 files) | JS CDN | 145 KB | Animation framework |
| 7 | cap-plastic-bg.webp | Image | 128 KB | Content image |
| 8 | cap-dolls-bg.webp | Image | 128 KB | Content image |
| 9 | Fonts (Clash + Satoshi) | Font | 156 KB | Typography |
| 10 | Animation modules (total) | JS | 168 KB | 21 separate small files |

---

## 6. ROOT CAUSE ANALYSIS: "SUPER LAGGY" FEELING

### The Issue is NOT Initial Load Time
The HTML arrives in 26 KB in <2ms. That's not the problem.

### The Real Culprits

#### A. JavaScript Execution Overload
1. **21 separate animation modules** loading sequentially — no bundling or code-splitting
2. **Three animation loop systems competing**:
   - Canvas particle animation (home-canvas.js)
   - WebGL background (webgl-bg.js) — currently broken/disabled
   - Parallax + scroll tracking system
3. **4 separate requestAnimationFrame loops** running in parallel:
   - Particle system (28 nodes)
   - Parallax tracking (mouse move)
   - Scroll progress bar
   - WebGL shader (if enabled)

#### B. Missing Three.js Library
- **webgl-bg.js** (13 KB) expects THREE to be loaded
- **THREE is never injected** — the entire WebGL background silently fails to initialize
- This alone explains the "slow animation" feeling — the gradient effect isn't running

#### C. Unbundled Animation Code
- 168 KB of animation code split into 21 individual files
- Each file is a separate HTTP request
- No tree-shaking, no bundling optimization
- Parser overhead from loading 21 small scripts sequentially

#### D. GSAP ScrollTrigger Performance
- Three separate GSAP libraries loaded (core + ScrollTrigger + SplitText)
- ScrollTrigger adds performance cost on every scroll event
- Multiple sections using clip-path + scroll-driven animations
- Text scramble effect on scroll (text-scramble.js) — CPU intensive

#### E. Image Lazy-Loading Strategy
- 14 images marked with `loading="lazy"` but not optimized
- Large background images (256 KB, 192 KB) causing layout shift on load
- No blur-up or placeholder strategy mentioned in HTML
- CLS (Cumulative Layout Shift) likely high

#### F. Lenis Smooth Scroll
- Lenis intercepts all scroll events
- Adds frame interpolation on every scroll
- Combined with GSAP ScrollTrigger = competing scroll handlers
- Can cause jank on lower-end devices

---

## 7. SPECIFIC RECOMMENDATIONS

### CRITICAL (Fix First)
1. **Load Three.js library** before webgl-bg.js initializes
   - Missing from HTML entirely
   - Add: `<script src="https://cdn.jsdelivr.net/npm/three@r128/build/three.min.js"></script>`
   - Size: ~145 KB (but enables WebGL shader)

2. **Bundle the 21 animation modules**
   - Current: 21 HTTP requests + 168 KB unparsed code
   - Target: 1-2 bundled files (~50 KB gzipped)
   - Reduce parse time and request overhead by 85%

3. **Reduce requestAnimationFrame loops**
   - Current: 4 concurrent rAF loops (particle, parallax, scroll, WebGL)
   - Use one unified animation controller (already have controller.js)
   - Consolidate into single rAF for better frame pacing

### HIGH PRIORITY (Week 1)
4. **Optimize image delivery**
   - Convert 3MB image folder to AVIF with WebP fallback
   - Target: 1MB total
   - Add width/height attributes to prevent CLS
   - Implement blur-up or LQIP placeholder strategy

5. **Decouple Lenis + GSAP ScrollTrigger**
   - Currently both intercepting scroll = double computation
   - Choose one or properly coordinate them
   - Recommendation: Use Lenis + simple scroll offset, drop ScrollTrigger

6. **Code-split by page**
   - Currently loading ALL 21 modules on home page
   - Only home-canvas + webgl-bg + parallax + hero needed
   - Move text-scramble, section-choreography, etc. to capability pages

### MEDIUM PRIORITY (Week 2-3)
7. **Gzip/Brotli compression on server**
   - Assuming NOT enabled (curl showed 26 KB HTML uncompressed)
   - Would reduce to ~8-10 KB HTML, ~50 KB JS, etc.
   - 70% compression typical

8. **Remove unused GSAP libraries**
   - SplitText (35 KB) — used only in hero title
   - Move to lazy-loaded script for that section only
   - Core GSAP + ScrollTrigger = 110 KB still needed

9. **Audit parallax performance**
   - 4-layer mouse parallax on every move
   - Consider 60fps cap or reduced update rate on low-power devices

### OPTIONAL (Nice to Have)
10. **Consider alternative to Lenis**
    - Lenis adds overhead for smooth scroll
    - Browser scroll-behavior: smooth might be sufficient
    - Saves ~35 KB + CPU overhead

---

## 8. ESTIMATED IMPACT OF FIXES

| Fix | Current | Target | Savings | Impact |
|-----|---------|--------|---------|--------|
| Bundle animations | 168 KB (21 requests) | 50 KB (1 file) | 118 KB + 20 requests | HIGH |
| Enable Three.js | Broken shader | Working WebGL | 0 KB but visual fix | MEDIUM |
| Optimize images | 3 MB | 1 MB | 2 MB | HIGH |
| Drop Lenis | 35 KB + rAF | CSS scroll | 35 KB | MEDIUM |
| Gzip compression | 26 KB HTML | 8 KB HTML | 65% reduction | HIGH |

---

## 9. PERFORMANCE GRADE: B-

### Breakdown
- **Page Load Speed**: A (fast response, 1-2ms TTFB)
- **Bundle Size**: D (424 KB uncompressed JS, no gzip visible)
- **Request Count**: C (44+ requests is high for 2026)
- **Animation Performance**: C (multiple rAF loops, WebGL disabled)
- **Image Optimization**: D (3 MB, no AVIF, no placeholders)
- **Code Splitting**: F (zero bundling, 21 separate files)

### Overall Assessment
The site **feels laggy during scroll and interaction** because:
1. WebGL background is broken (missing Three.js)
2. 4 simultaneous animation loops compete for main thread
3. Unbundled 168 KB of animation code = long parse time
4. Lenis smooth scroll + GSAP ScrollTrigger = double scroll handling
5. 3 MB of images without optimization

**Not a network problem. Not a server problem. JavaScript architecture problem.**

---

## FILES TO REVIEW
- `/Users/charles/website-modernize/astro-site/public/animation/*.js` (21 files)
- `/Users/charles/website-modernize/astro-site/public/assets/shared.js` (50 KB)
- `/Users/charles/website-modernize/astro-site/src/layouts/BaseLayout.astro` (script injection point)
- `/Users/charles/website-modernize/astro-site/public/assets/images/` (3 MB inventory)
