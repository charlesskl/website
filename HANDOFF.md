# Handoff — Royal Regent Website Redesign

**Last session:** 2026-04-21. Charles is clearing context and resuming later.
**Branch:** `redesign/index-video-and-capabilities` — all redesign work lives here.
**Rule:** Work on this branch only. **Do NOT merge to `main` until Charles explicitly says so.** Live site (royalregentgroup.com) must stay untouched.
**No PRs.** Commit and push directly to the redesign branch.
**Localhost:** `cd astro-site && npm run dev` → http://localhost:4321

---

## What's on the redesign branch (not yet on main)

### `/` home page

**Hero — Variant C applied** (`cinematic`)
- Full-bleed `/assets/videos/hero.mp4`
- Brand-green `mix-blend-mode: multiply` tint overlay
- Bottom-aligned text: tag → single-line title (with green accent word) → sub → CTA buttons
- Dark/cinematic treatment; `prefers-reduced-motion` → brand gradient
- CSS: `home.css` `.hero-cinematic*`

**Capabilities — cinematic pin-scroll**
Interaction mechanic is locked in (Charles confirmed it's correct):
1. User scrolls to section → it pins to viewport
2. Continued scrolling = scroll progress advances through 5 categories one at a time
3. Left text + right visual cross-fade together
4. After 5/5 → unpins and continues to history

Visual design (cinematic polish added):
- Dark charcoal background + 2 radial brand-green glows + faint 80px grid texture
- Giant ghost numerals `01` → `05` behind left text (half-transparent green stroke)
- Eyebrow: accent bar + split "01 / PLASTIC" composition
- CTA: framed link, `line extends on hover`
- Right visual: black frame + 4 corner brackets (industrial) + category badge top-left + cinematic gradient overlay
- Footer strip: all 5 category names + active underline + progress bar 01/05

Images: the **original stock** pair per category (`cap-{id}-bg.webp` + `cap-{id}-fg.webp` from `/assets/images/stock/`). Not the process photos.

**History — still the original**
The `/` page still uses the Video/History.mp4 + timeline-nodes version. Charles has NOT picked a parallax variant yet — that's the main pending decision.

### `/preview/*` routes (not linked from nav)

| Route | Content |
|---|---|
| `/preview/hero` | 3 Hero variants (Charles picked C; this page is only for reference now) |
| `/preview/capabilities` | 3 Caps variants: A pin-scroll, B horizontal carousel, C accordion (Charles picked A; kept for reference) |
| `/preview/history` | **3 parallax variants — CHARLES NEEDS TO PICK ONE** |

---

## Pending decisions from Charles

### 1. History parallax variant choice — **primary blocker**

- **Variant A — Scroll-scrubbed video** (recommended to him as most impactful). Video.currentTime is tied directly to scroll progress; year + milestone text sync frame-by-frame.
- **Variant B — Layered speed parallax**. 6 milestone slides alternating dark/light. Background, giant year, and card move at different rates.
- **Variant C — Horizontal pinned parallax**. Section pins, vertical scroll → horizontal motion; 3 layers at different speeds.

When Charles picks one: port that variant into `/` replacing the current history section.

### 2. Capability images — SeeDream prompts pending

Charles will generate new images via SeeDream (ByteDance image gen). Prompts were delivered in prior conversation. When he has them:
- Drop them into `astro-site/public/assets/images/stock/` (or equivalent)
- Update `cap.bgImage` / `cap.fgImage` paths in `index.astro` and `preview/capabilities.astro`
- Existing 10 webp files (cap-{id}-{bg|fg}.webp) can be replaced in-place to avoid code changes

### 3. Caps visual redesign feedback

Charles hasn't confirmed the new cinematic treatment yet (deep charcoal bg, ghost numerals, corner brackets, etc.). He may want tweaks — wait for his review.

---

## Important technical context

### Deploy pipeline
- GitHub Pages is set to `build_type: workflow` (NOT legacy). Set via:
  `gh api -X PUT repos/charlesskl/website/pages -f cname=royalregentgroup.com -f build_type=workflow`
- The legacy setting broke the site once (404 after cleanup PR). If Pages ever reverts to legacy, re-run that API call.
- Deploy workflow: `.github/workflows/deploy.yml` at repo root (not inside `astro-site/`). Builds astro-site/dist/, uploads artifact, deploys to Pages. Triggered on push to `main`.
- `astro-site/public/CNAME` contains `royalregentgroup.com` — gets copied to dist/ on build.

### Fixes applied this session (worth remembering)
1. **Pin-scroll wasn't firing.** Root cause: inline `<script>` in `Fragment slot="page-scripts"` runs BEFORE GSAP CDN scripts load (slot is above `<script src="gsap">` in BaseLayout.astro). `typeof gsap === 'undefined'` at run time, so ScrollTrigger.create never ran. Fix: wrap setup in `DOMContentLoaded` — fires after blocking scripts execute.
2. **Nav white box** between Careers and EN. Cause: `astro-island` wrapper + browser default button background leaking. Fix: `astro-island { display: contents }` global rule + aggressive reset on `.lang-selector button`.
3. **Footer logo squished.** Cause: `width="200" height="40"` HTML attributes forced 5:1 on a 2.06:1 logo (962×467). Fix: `.footer-brand img.footer-logo { width: auto; max-width: 200px; object-fit: contain; }`.
4. **Live site 404 after cleanup PR.** Cause: Pages was in legacy mode, serving from main root — cleanup deleted the root HTML. Fix: switched Pages to `build_type: workflow` via API call + triggered a workflow_dispatch to push the artifact.

### Branches
- Alive:
  - `main` — production
  - `redesign/index-video-and-capabilities` — ← work here
  - `claude/redesign-index-page-cYzL3` — old video-first scaffold (keep for reference; never merged)
- Deleted: `backup/agent-work-2026-03-29`, `design/cha-23-design-improvements`, `feature/phase2-astro-migration`, `feature/phase3-react-islands`, `image-testing`, `redesign/hero-video`, `seo/cha-24-seo-improvements`

### File locations (key)
- Videos: `astro-site/public/assets/videos/hero.mp4`, `history.mp4`
- Stock cap images: `astro-site/public/assets/images/stock/cap-*-{bg,fg}.webp`
- Home page: `astro-site/src/pages/index.astro`
- Home styles: `astro-site/src/styles/home.css`
- Preview pages: `astro-site/src/pages/preview/{hero,capabilities,history}.astro`
- Preview styles: `astro-site/src/styles/preview.css`
- Nav / Footer components: `astro-site/src/components/{Nav,Footer}.astro`
- BaseLayout: `astro-site/src/layouts/BaseLayout.astro` — GSAP CDN is loaded at lines 162-164, AFTER `<slot name="page-scripts">` at line 156. Any new inline scripts that depend on gsap MUST use `DOMContentLoaded`.

### Dev server
- `cd astro-site && npm run dev`
- Astro 6.1, React 19 islands (`client:load` / `client:visible`)
- Hot reloads on file changes
- If a previous server is still running on 4321: `lsof -ti:4321 | xargs kill`

---

## Suggested next actions (after Charles reviews)

1. Check localhost for the caps cinematic redesign — confirm or request tweaks
2. Charles picks history variant A / B / C → port selected one into `/`
3. Charles drops SeeDream-generated images → swap filenames in stock/ folder
4. When Charles says "merge" → merge `redesign/index-video-and-capabilities` → `main` to push everything live in one shot

## Recent commit graph (redesign branch ahead of main)

```
ece86e4  feat(home): Hero C applied + cinematic caps redesign + parallax history variants
dd6c6a9  fix: pin-scroll timing + nav button bg + add preview variants
219d3a3  feat(home): swap caps images to stock + pin-scroll + nav/footer fixes
5166cdc  feat(home): video hero + video history + capabilities scrollytelling
─── main ──────────────────────────────────────────────────────────────────
a6ebe04  Add files via upload (Video/Hero.mp4 + Video/History.mp4)
b08f9e7  chore: remove old root HTML (#14)
f22f5eb  Phase 6: GitHub Actions deploy & documentation (#13)
```
