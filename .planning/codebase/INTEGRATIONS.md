# External Integrations

**Analysis Date:** 2026-03-11

## APIs & External Services

**Form Submission:**
- Formspree - Email form backend
  - Used in: `contact.html`
  - What it's used for: Contact form submission (`FORMSPREE_URL` environment variable referenced in inline scripts)
  - Auth: Environment-based endpoint (likely stored in HTML inline script)

**Animation Libraries (CDN):**
- GSAP via jsdelivr - Scroll animations and parallax
  - SDK: `gsap@3.14.2` with `ScrollTrigger` plugin
  - Delivery: CDN with SRI hashes
- Splitting.js via unpkg/jsdelivr - Text animation
  - SDK: `splitting@1.0.6`
- Three.js via jsdelivr - 3D particle rendering
  - SDK: `three@0.170.0`
- Lenis via unpkg - Smooth scroll
  - SDK: `lenis@1.1.18`

## Data Storage

**Static Data:**
- `jobs.json` - Job listings loaded via `fetch()` in `careers.html` and `admin.html`
- No database backend

**File Storage:**
- Local filesystem only
- Asset directories: `assets/images/`, `assets/models/`, `assets/fonts/`
- Images served as WebP with fallbacks

**Caching:**
- Browser HTTP caching via standard headers
- No dedicated caching service

## Authentication & Identity

**Admin Panel:**
- Type: Password-protected form (`admin.html`)
- Method: Client-side password check (no backend validation)
- GitHub integration optional: Personal access tokens (PAT) for direct repo commits
  - Use case: Bypassing jobs.json manual export
  - Risk: PAT stored in browser (user responsibility)

**Social Integration:**
- LinkedIn company link (footer) - `royalregentgroup.com` company profile

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Browser console logging only
- No centralized logging service

**Analytics:**
- Inline script loads external analytics (deferred in footer of HTML)
- Exact provider not fully visible in grep results (conditional CDN load)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (static)
- Repository: `charlesskl.github.io/website/`
- Domain: `royalregentgroup.com` (CNAME)

**CI Pipeline:**
- Not detected - manual push triggers GitHub Pages rebuild

**Deployment:**
- Git push to `main` branch → automatic GitHub Pages deployment

## Environment Configuration

**Required env vars:**
- `FORMSPREE_URL` - Formspree endpoint for contact form (referenced in `contact.html`)

**Secrets location:**
- Contact form Formspree URL: Inline in `contact.html` (client-side, no sensitive data)
- Admin password: Hard-coded in `admin.html` (client-side validation)
- GitHub PAT (optional): User-input in admin panel (ephemeral, not persisted)

## Webhooks & Callbacks

**Incoming:**
- Contact form via Formspree - Receives form submissions, sends confirmation emails

**Outgoing:**
- None detected

## Regional & Compliance

**Localization:**
- Supported languages: English (en), Simplified Chinese (cn), Indonesian (id)
- Language detection via subdirectory routing (`/cn/`, `/id/`)
- No dynamic translation service - all content translated in static HTML

**SEO & Metadata:**
- Hreflang tags for language alternates
- Open Graph tags for social sharing
- JSON-LD structured data for organization schema
- Canonical tags to prevent duplicate indexing

---

*Integration audit: 2026-03-11*
