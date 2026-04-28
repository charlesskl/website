# Plan — Sphinx Flow Transformation (narrowed, live)

**Goal:** Make Royal Regent `/` read as one coherent Sphinx-style journey by transforming the **capability** section into a sticky-image-parallax pattern and weaving a **page-wide dotted thread** through all four sections. Palette stays unified dark cinematic.

**Scope confirmed with Charles 2026-04-22:**
- **Hero** — unchanged. Existing video + headline + CTAs stay.
- **Statement** — unchanged. Existing "Built on trust. / Refined over decades. / Ready for what you need next." + `1987` watermark stays.
- **Capability** — REBUILT: sticky-image split panel with parallax (Sphinx "Agent in Action" mechanic).
- **History** — unchanged visually. Wire into the H0 thread so it blends with the rest of the page.
- **Final CTA** — rebuilt as Sphinx-style two-column (pill + statement left, actions right). Stats references stripped.
- **No stats section** — Charles does not use numeric stats on the website. (See `feedback_website_no_stats.md`.)

**Branch:** `redesign/index-video-and-capabilities`. No merge to main.

---

## 1. Work items

### Item A — Capability section rebuild (the big one)

**Current mechanic:** pin-scroll for 5 viewports, cross-fades between 5 categories, everything happens in a single pinned frame.

**New mechanic:** Sphinx "Agent in Action" — natural scroll, 5 text blocks stacked on the left, 1 sticky image frame on the right that swaps + parallaxes in sync with the currently-visible left block.

**Structure:**
```
┌─────────────────────────────────────────────────┐
│  [pill] MANUFACTURING CAPABILITIES              │
│  Five categories. One trusted partner.          │
├─────────────────┬───────────────────────────────┤
│  PLASTIC TOYS   │                               │
│  Injection-     │                               │
│  molded         │                               │
│  precision.     │         ┌─────────────┐       │
│  [body copy]    │         │             │       │
│  → Explore      │         │  sticky     │       │
├─────────────────┤         │  image      │       │
│  PLUSH          │         │  frame      │       │
│  …              │         │  (swaps +   │       │
│  [body copy]    │         │  parallaxes)│       │
├─────────────────┤         │             │       │
│  DOLLS          │         │             │       │
│  …              │         └─────────────┘       │
├─────────────────┤                               │
│  RC VEHICLES    │                               │
│  …              │                               │
├─────────────────┤                               │
│  COSTUMES       │                               │
│  …              │                               │
└─────────────────┴───────────────────────────────┘
```

- Each left block = ~100vh tall, normal document flow
- Right column = `position: sticky; top: nav-height + padding`
- Right image: absolute-positioned stack, opacity cross-fade on block change (0.7s ease)
- Parallax: image has `transform: translateY()` + `scale()` tied to the active block's viewport progress
  - When block enters from bottom → image starts at `translateY(-40px) scale(1.12)`
  - When block centers → image at `translateY(0) scale(1.0)`
  - When block exits top → image at `translateY(40px) scale(1.0)` with opacity fade
  - Gives a subtle Ken Burns + drift effect

**JS:** IntersectionObserver on `.cap-block` with threshold `[0, 0.3, 0.5, 0.7, 1]`. When a block crosses 50% in view, activate its image. Parallax handled via ScrollTrigger `onUpdate` per block.

**Falls back to:** Plain stacked blocks on mobile (<900px) — sticky disabled, images render inline with each block.

**Images:** existing `/assets/images/stock/cap-{id}-{bg,fg}.webp` pairs as placeholders. Swap to SeeDream versions when Charles provides them.

### Item B — H0 page-wide dotted thread

**What it is:** A single brand-green dotted SVG line running vertically down the left edge of the page, spanning from top of hero to bottom of CTA. Plus a small glowing progress marker that slides along the thread as the user scrolls.

**Visual:**
- Thread: `stroke: #A8D66F`, `stroke-width: 1.5`, `stroke-dasharray: 0.1 12`, `opacity: 0.35`
- Positioned at `left: clamp(16px, 3vw, 48px)` — outside main content flow on desktop, tucks behind on mobile
- Full page height (absolute-positioned inside a relative wrapper that contains all sections)
- Progress marker: 8px bright brand-green dot with soft glow, `position: fixed`, Y computed from scroll progress

**Why this works:** A persistent visual guide that ties all 4 sections together visually. Even though each section has its own mechanics (video hero, text statement, sticky-split caps, scroll-scrub history), the thread makes them read as one journey. This is the H0 "connecting layer" Charles specifically asked for.

**Implementation:**
- Single inline SVG at the top of the home page markup, `position: absolute; top: 0; height: 100%`
- `pointer-events: none`, behind content (`z-index: 1`; content at `z-index: 10+`)
- Progress dot is a separate fixed-position `<div>` with `top: calc(navHeight + scrollPct * (viewportH - navH - padding))`, updated on scroll

**Falls back to:** Hidden on mobile if it interferes with layout.

### Item C — Final CTA rebuild

**Current CTA** (in `index.astro`):
```html
<h2>Ready to bring your next product to life?</h2>
<p>39 years of OEM manufacturing expertise, four production sites, one consistent standard.</p>
<a class="btn btn-primary">Start a Conversation</a>
```

**Problem:** centered layout + stats sub-copy (violates no-numbers rule).

**New CTA (Sphinx two-column):**
- Left column: pill eyebrow `LET'S WORK TOGETHER` + large 2-line headline "Ready to bring your next product to life?"
- Right column: action stack
  - Primary: `Start a Conversation →` (to `/contact.html`)
  - Secondary: `See our capabilities →` (to `/capabilities/plastic-toys.html`)
  - Chip: `Response within 24 hours`

Dotted thread terminates here, fades into footer.

### Item D — Integration polish

- Thread transitions at section boundaries (subtle branching at pill eyebrow if present)
- Hero: thread starts aligned with scroll-hint at bottom-center OR begins at the left edge
- Statement: thread passes through on the left, no interaction
- Capability: thread runs past; at pill eyebrow, a small branch touches it
- History: thread continues through; at year markers, subtle dots light up to match
- CTA: thread ends with a "node" terminator

---

## 2. Execution order (one session)

Build all four items in one push. Order chosen so later items can reference primitives from earlier items.

1. **CSS primitives** — pill chip component, thread SVG component (reusable)
2. **Item A — Capability rebuild** — biggest change, most error-prone; do first while attention is fresh
3. **Item B — Thread + progress marker** — insert into BaseLayout or index.astro
4. **Item C — Final CTA** — easy once chip primitive exists
5. **Item D — Integration polish + reduced-motion fallbacks**
6. Screenshot-verify every section at desktop (1440×900) + 1 mobile position
7. `npm run build` clean
8. One commit + push

**Estimated time:** 3–4 hours for a working version. Polish passes can follow.

---

## 3. What Charles will see on localhost after this push

Same hero video and CTAs as today. Same statement with 1987 watermark. Same history scroll-scrubbed video.

**What changed:**
- A thin dotted brand-green thread running down the left side of the whole page, with a small glowing dot sliding down it as you scroll.
- Capabilities section: you scroll naturally through 5 text blocks on the left while the image on the right swaps + drifts with parallax. Feels lighter and more editorial than the current pin-scroll.
- Final CTA: two-column with a pill chip + restructured actions, no number copy.

All falls back cleanly on mobile and reduced-motion.

---

## 4. What we're explicitly NOT doing (per Charles)

- No Three.js / 3D centerpieces in hero, statement, or capability (he doesn't want hero or statement touched; capability uses a sticky-parallax pattern instead)
- No stats/numbers band anywhere on the page
- No palette change — unified dark cinematic from last commit stays
- No nav redesign (can add as a later phase if the thread isn't enough)
