# Royal Regent Toys — Website

Live site: [royalregentgroup.com](https://royalregentgroup.com)

## Stack

**Languages**
- TypeScript — React islands + Astro components
- JavaScript — animation modules
- HTML — page templates (`.astro`)
- CSS — design system + per-page styles

**Framework & libraries**
- [Astro 4.x](https://astro.build/) — static site generator with islands architecture
- [React 19](https://react.dev/) — hydrated only where interactivity is needed
- [GSAP 3.14](https://gsap.com/) + ScrollTrigger + SplitText — timeline animations
- [Three.js r183](https://threejs.org/) — WebGL background (capabilities + misc)
- [Lenis 1.3](https://github.com/darkroomengineering/lenis) — smooth scroll engine
- Self-hosted fonts: Clash Display + Satoshi (WOFF2)

**Deploy:** GitHub Actions → GitHub Pages (`astro-site/dist/`)

---

## Effects & Animations

### Hero
- Full-bleed autoplay video (`Video/Hero.mp4`, loops, muted)
- Gradient overlay for text readability
- IntersectionObserver pauses playback when scrolled off-screen
- `prefers-reduced-motion` → falls back to brand gradient
- Text reveal on load (tag → title → sub → actions), staggered

### Marquee
- Continuous horizontal ticker of 18 product categories
- Pauses on hover
- Drag-to-scrub cursor hint

### Intro Statement
- 3-line manifesto with SplitText character-by-character reveal
- Vertical brand-green bar animates in from top
- Giant "1987" watermark (right column)

### Capabilities — Scrollytelling
- Left column: 5 text blocks scroll through
- Right column: sticky image stack, cross-fades between 5 layered images
- Active block changes:
  - Eyebrow color → brand green
  - Headline color → grey to solid black
  - Body opacity → 55 % to 100 %
  - "Explore capability →" link reveals
- GSAP ScrollTrigger drives active state (IntersectionObserver fallback)
- Mobile (<900 px) stacks vertically with per-block inline image

### History
- Full-bleed autoplay video (`Video/History.mp4`) with dark overlay
- 6-node timeline (1987 → 2025) with animated progress bar
- Active year scales up, turns brand green, with active dot shadow
- Giant year watermark synchronized with active milestone
- Click/scroll to switch milestone

### CTA Banner
- Magnetic button with cursor attraction
- Clip-path section reveal on scroll

### Navigation
- Smart hide-on-scroll-down / reveal-on-scroll-up
- Dropdown for capability sub-pages (with SVG category icons)
- Language switcher (EN / 繁中 / ID) as React island
- Keyboard shortcut indicator (React island)
- Mobile hamburger with animated panel

### Global
- Brand loader (SVG ring + % counter + per-letter tagline reveal)
- Smooth scroll via Lenis (synchronized with ScrollTrigger)
- Scroll progress bar at top of viewport
- Page transition clip-path wipe between routes
- Custom cursor with magnetic button attraction
- 21 modular IIFE animation scripts registered via `window.RR.register()`

### Accessibility
- `prefers-reduced-motion` respected across all motion
- Skip-to-content link
- All interactive elements keyboard reachable
- Images have explicit `width`/`height` (prevents CLS)
- Focus-visible styles preserved on all controls
