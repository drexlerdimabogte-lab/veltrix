# VELTRIX — AI Creative Studio

An art-directed, editorial single-page site for an independent AI creative studio.

**Stack:** Next.js 16 (App Router) · TypeScript · GSAP + ScrollTrigger · Lenis · Three.js via React Three Fiber · next/font (Syne / Manrope / JetBrains Mono). No external images: every visual is generated with SVG, CSS, canvas or WebGL.

## Setup
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build with type checking
npm run start    # serve the production build
npm run lint     # ESLint 9 flat config (eslint.config.mjs, eslint-config-next core-web-vitals + typescript)
```
Requires Node 20.9 or newer.

## Structure (V3)
```
app/
  layout.tsx        fonts, metadata
  page.tsx          section composition
  globals.css       editorial design system: 12-col grid, motion tokens, all sections, responsive and reduced-motion rules
config/site.ts      contact email, location and socials (empty values are hidden)
data/projects.ts    Selected Work content and optional image paths
public/work/        drop-in project images (see README inside)
components/
  Loader.tsx        first-load curtain (once per session, skipped with reduced motion)
  SmoothScroll.tsx  Lenis linked to the GSAP ticker and ScrollTrigger
  Reveals.tsx       [data-mask] line reveals, [data-reveal], [data-clipreveal], [data-parallax], [data-bg] section colour shifts
  Cursor.tsx        custom cursor with contextual labels (fine pointers only)
  Magnetic.tsx      magnetic CTA, sharp-edged with a fill wipe
  Nav.tsx           fixed nav: transparent at the top, translucent blurred bar after 24px of scroll (Lenis-aware)
  Hero.tsx          left-weighted, column-breaking headline (char mask reveal), margin annotations, cropped 3D figure
  NeuralCanvas.tsx  R3F neural object (lazy, ssr:false, DPR clamp, offscreen pause, lighter on mobile, static under reduced motion)
  Capabilities.tsx  editorial index: huge numerals, cursor-following preview plates, tap-to-expand accordion
  Work.tsx          chapters: sticky project text, alternating asymmetric image panels with varied ratios, clip reveal, parallax
  ProjectArt.tsx    generated fallback artwork per project
  Process.tsx       pinned, scrubbed narrative with giant step words, a vertical progress hairline and a counter (stacked list on mobile)
  Lab.tsx           lab notebook: specimen index and one specimen sheet at a time, every specimen labelled DEMO, CONCEPT, SIMULATED or VISUAL PREVIEW
  Contact.tsx       sparing marquee, typographic finale, magnetic CTA, footer
lib/motion.ts       GSAP registration, reduced-motion helper, motion tokens (EASE, DUR, STAGGER)
lib/useClientSnapshot.ts  hydration-safe read of browser-only values
```

## Performance and accessibility
- The 3D canvas loads lazily, caps DPR at 1.6, stops rendering when offscreen and uses fewer nodes on mobile.
- Lab waveform canvases pause when offscreen.
- With `prefers-reduced-motion`, Lenis, intro and scroll animations and the pinned timeline are turned off, 3D rotation slows down and CSS animations are disabled.
- The custom cursor is hidden on touch devices.


## Contact config
Edit `config/site.ts`:
```ts
email: "studio@yourdomain.com",   // enables the mailto CTA and shows the address
location: "City, Country",        // shown in the hero eyebrow and the contact block
socials: [{ label: "Instagram", href: "https://instagram.com/yourhandle" }],
```
Anything left as `""` is hidden. With no email set, "Start a Project" links to `#contact`.

## Replacing project images
1. Add `public/work/<slug>.webp` (1600×1000 recommended). Slugs: `tripyou`, `icope`, `bagsak`, `golden-train`.
2. In `data/projects.ts`, set `image: "/work/<slug>.webp"` and `imageAlt`.
3. The card renders it with `next/image`. Without `image`, it shows the generated SVG art.
See `public/work/README.md` for details.

## Customising
Colours live in `:root` in `app/globals.css` (`--red`, `--gold`, etc.). Project copy lives in `data/projects.ts`.

## V2 changelog
- **Content honesty:** removed every invented metric, client result, establishment year, location, placeholder email, social link and availability claim. Lab panels are now labelled DEMO, SIMULATED, CONCEPT or VISUAL PREVIEW.
- **Config:** new `config/site.ts`. Email, location and socials render only when set.
- **Projects:** new `data/projects.ts` with factual descriptions and optional `image` (via next/image). Golden Train is now "Interactive 3D Portfolio".
- **Hero 3D:** depth fog, additive red volumetric halos, depth-attenuated shader nodes with hot pulses, a faint gold outer shell, damped mouse follow with camera parallax, and lighter mobile settings (fewer nodes, no AA, lower DPR).
- **Typography:** the hero reveals character by character with 3D rotation; section headings use masked line reveals with skew and better easing.
- **Transitions:** first-load curtain (red and black panels), section hairlines that draw in, and wiping section labels.
- **Project cards:** pointer tilt, layered zoom, light and sheen, discipline tag, title nudge and smoother info reveal. Info is always visible on touch and mobile.
- **Mobile:** single-column work grid (fixes horizontal overflow), tighter spacing and type scale, a headline that no longer breaks, and a footer wordmark that no longer clips.

## V2.1 changelog
- **Nav:** transparent over the hero. After 24px of scroll (tracked through Lenis's scroll event, with a native fallback) it fades to `rgba(7,7,7,.6)` with a 14px backdrop blur (`-webkit-` prefixed) and a 1px `rgba(255,255,255,.07)` bottom border. The logo is always solid white, with no blend modes. "Start a project" now stays visible on mobile.
- **Touch targets:** every link and button is at least 44px (nav, footer, contact, CTAs).
- **Mobile and tablet:** refined hero type and spacing. Tablet project cards are single-column with info always visible. Added a press state on touch cards.
- **Overflow:** fixed root causes (110vw contact glow, offset hero glow, oversized grain layer) and added `overflow-x: clip` on html and body as a safety net.
- **Viewport units:** hero and pinned process use `100svh` with a `100vh` fallback.
- **Reduced motion:** the hero 3D renders one static frame (on-demand frameloop). The desktop process timeline wraps instead of pinning. The nav transition is disabled. Char and line reveals are forced visible. The curtain, Lenis and tilt were already skipped.

## V2.2 changelog
- **Project copy:** factual descriptions and tags for TripYou (AI-assisted travel agency experience), BAGSÁK! (Godot-built block battle game), ICOPE and Golden Train, in `data/projects.ts`.
- **Lint:** added `npm run lint` (`eslint .`) with ESLint 9 and an `eslint-config-next` 16.4 flat config.
- **Lint fixes:** browser-only values (reduced motion, viewport, intro-played flag) now come from `useSyncExternalStore` via `lib/useClientSnapshot.ts` instead of setState inside effects. Replaced a ternary used as a statement.
- **README:** updated for the current nav, lint command and file locations.

## V3 changelog (composition redesign)
- **System:** new editorial system with a 12-column asymmetric grid, sharp edges and hairlines instead of rounded cards, far fewer gradients, consistent motion tokens (expo and quart out, `EASE`, `DUR` and `STAGGER` in `lib/motion.ts`), and section background shifts between ink and warm charcoal.
- **Hero:** oversized headline breaking across columns, margin annotations and index, the 3D object cropped off the right edge with a figure label, and a hairline rule above the lede, CTA and scroll cue.
- **Capabilities:** index list with huge outline numerals. On hover, a red rule draws in and a cursor-following preview plate appears. On touch, rows open as an accessible accordion.
- **Work:** four chapters with sticky project text and alternating image panels at 16:10, 4:5, 21:10 and 1:1, some bleeding to the edge. Scroll clip reveals and parallax, hover desaturate-to-colour with a title slide. On mobile, images are full-bleed with captions.
- **Process:** pinned, snap-scrubbed narrative of giant step words with a vertical progress hairline and a counter. Static list on mobile and with reduced motion.
- **AI Lab:** a "lab notebook" with a specimen index and one specimen sheet on a hairline grid, with mono annotations. Everything stays labelled as demo or concept.
- **Contact:** one slow marquee, a staggered typographic finale and a red magnetic CTA.
- **Unchanged:** factual copy, contact config, image swap, nav behaviour, lint setup, reduced motion, 44px targets and svh units.

## V3.1 changelog (polish)
- **Mobile hero:** the 3D figure is shorter (44svh, starting under the nav) and the headline starts at about 31svh, slightly overlapping the bottom of the figure. At 390×844, the headline bottom moved from 657px to 455px and the CTA bottom from 824px to 623px. Tablet and desktop are unchanged.
- **How We Build:** removed the forced snap. Each stage now has a hold section in the scrubbed timeline (hold 0.7, move 1.0, power2.inOut) with `scrub: 1` smoothing, so scrolling settles on readable steps without pulling against trackpads.
- **How We Build fix:** pinned step words were scaled down slightly (5.8vw) so "AUTOMATE" no longer clips at the right edge.

## Deployment (production handoff)

Requirements: Node.js 20.9 or newer.

```bash
npm ci            # install exact locked dependencies
npm run lint      # must pass
npm run build     # production build
npm run start     # serves on port 3000 (use `-- -p <port>` to change)
```

Before going live:

1. Fill in `config/site.ts` (email, location, socials). Empty fields stay hidden.
2. Add real project screenshots to `public/work/<slug>.webp` (1600×1000 suggested) and set the `image` field for each project in `data/projects.ts`. See `public/work/README.md`.
3. Set the final domain in your hosting provider's settings.

Hosting options:

- **Vercel:** import the repo (framework preset: Next.js), no extra config needed.
- **Netlify / Cloudflare Pages:** use their Next.js adapter/runtime, build command `npm run build`.
- **Own server / VPS:** `npm ci && npm run build && npm run start` behind a reverse proxy (e.g. Nginx) with HTTPS.

No environment variables are required for the current build.

## V3.2 changelog (real details from Richard's portfolio)
- **`config/site.ts`:** email `rrichardromero2323@gmail.com`, location "Pembo, Taguig City, Philippines" and a Behance social link, all taken from the portfolio. With these set, the contact block shows email and location, the footer shows Behance, and "Start a Project" opens an email.
- **`data/projects.ts`:**
  - Added an optional `url` field; cards show a "View live site ↗" link when it's set.
  - TripYou: kept the approved description; tags now include the portfolio roles; link to trip-you.com.
  - Golden Train: description and tags now follow the portfolio ("Interactive 3D Train Portfolio"); link added.
  - ICOPE and BAGSÁK!: unchanged, because the portfolio doesn't list them.
- No images added: the portfolio has no screenshots for these four projects.

### V3.2 update: links
- **Project cards:** optional `links[]` for extra links alongside the primary `url`.
  - ICOPE: primary is icope-enrollment, plus "Registration forms" and "Earlier build". The admin page is intentionally not linked.
  - TripYou and Golden Train each link to their live site. BAGSÁK! has no link.
- **Contact:** Résumé, Portfolio and Behance links, configurable in `config/site.ts` (`resume`, `portfolio`, `socials`) and hidden when empty.
- **More work:** a new hairline index list after Selected Work (`components/MoreWork.tsx`), driven by `data/moreWork.ts`. All links open in a new tab with `rel="noopener noreferrer"`.

## Deploy to GitHub Pages (static export)
1. Push this folder to a GitHub repo on the `main` branch.
2. In the repo, open **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Every push to `main` (or a manual run from the Actions tab) runs `.github/workflows/deploy.yml`, which does `npm ci`, `npm run lint`, then a static build into `out/` and publishes it.
4. The base path is set automatically: `/<repo-name>` for project pages, or empty for a `<user>.github.io` repo. To test locally: `NEXT_PUBLIC_BASE_PATH=/veltrix npm run build`, then serve `out/` under `/veltrix/`.

Notes: `next.config.ts` uses `output: "export"`, `trailingSlash: true` and unoptimized images. Internal asset paths (such as `data/projects.ts` images) go through `withBase()` in `lib/withBase.ts`. `public/.nojekyll` stops Jekyll from hiding the `_next/` folder. `npm run start` doesn't work with a static export; use `npm run dev` locally or serve `out/`.

### V3.2 update: GitHub Pages
- Static export config, `withBase` helper, `.nojekyll`, Pages workflow and `.gitignore`.
