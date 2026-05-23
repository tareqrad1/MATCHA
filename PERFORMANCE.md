# Performance Optimization Pass

A full audit + optimization of the cinematic MATCHA landing page. The work was
driven by a real diagnosis, not guesswork — one root cause dominated everything.

## TL;DR — measured before vs after

| Metric | Before | After | Change |
| --- | --- | --- | --- |
| **Splash-critical payload** (what gates first interaction) | **131 MB** (all 208 frames) | **~1.4 MB** (24-frame batch) | **−99%** |
| Frame sequence total | 131 MB PNG | 11 MB WebP | **−92%** |
| Content images (products/sections/bg) | ~8.4 MB PNG | ~1.3 MB WebP (AVIF smaller) | **−84%** |
| One product card image, 640px | 700 KB PNG | 19 KB AVIF | **−97%** |
| `public/` deployed size | 141 MB | 21 MB | **−85%** |
| First Load JS | included Three.js (~600 KB+ of deps) | **88.6 KB** | Three.js fully removed |
| Decoded frame RAM (peak) | ~760 MB (208 × 1280×720 RGBA) | capped (~90 frames) | bounded |

> Lighthouse field metrics (LCP / CLS / TBT) and on-device FPS depend on the
> deploy target and network; see **How to verify** below to capture them. The
> structural changes that move those metrics are listed under each section.

---

## 1. The diagnosis (root cause)

**90% of the problem was the image sequence.** `src/lib/frames.ts` defined 208
PNG frames at 1280×720, ~570 KB each = **131 MB**. The old loader
(`preloadImages`) fired all 208 requests at once on mount, and the splash
screen's curtain only lifted once **every single one** had finished
downloading (`ready = images != null`, set after `Promise.all` of all 208).

That single fact explained almost every reported symptom:

- **Splash stays too long** → it literally waited for 131 MB.
- **Images load slowly** → 208 simultaneous requests saturated the browser's
  connection pool; fonts and `bg.png` queued behind them.
- **Site feels heavy / memory pressure** → 208 decoded bitmaps ≈ 760 MB RAM.
- **Sequence stutters/cuts** → first scroll often hit frames not yet decoded.

Secondary issues found:

- All images were **PNG** (wrong format for photos); raw `<img>` with no
  responsive sizing or width/height (→ layout shift). `bg.png` was a CSS
  background, never optimized, never preloaded (it's the LCP element).
- **GSAP jank**: captions animated `filter: blur()` **on scroll-scrub** — a
  per-frame re-rasterization, one of the most expensive compositor ops.
  `HeroBackdrop` scrubbed `filter: brightness()` too, and ran a `requestAnimationFrame`
  parallax loop **forever** (even off-screen, even with a still mouse). A
  permanent `will-change` (`.will-blur`) pinned idle compositor layers.
- **Three.js dead weight**: `three` + `@react-three/fiber` + `@react-three/drei`
  shipped as dependencies, but the 3D scene was already removed from the Hero —
  `src/three/*` was imported by nothing.
- Two **render-blocking external font stylesheets** in `<head>`.

---

## 2. Image optimization

- **`scripts/optimize-images.mjs`** (sharp) batch-converts everything:
  - 208 frames → WebP q80 (`/public/frames-webp`): **131 MB → 11 MB (−92%)**.
  - products/sections/bg → **WebP + AVIF** siblings + a base64 blur LQIP map
    (`src/data/blur.json`).
- **`next/image` everywhere** via the rewritten `ProductImage`: `fill` +
  responsive `sizes`, lazy by default, **AVIF/WebP negotiated** by Next, **blur
  placeholder** from the generated LQIP map → no layout shift, instant-feel.
- `next.config.mjs`: `formats: ['image/avif','image/webp']`, large `deviceSizes`,
  1-year `minimumCacheTTL`.
- `bg.webp` is **preloaded** with `fetchPriority="high"` (it's the hero LCP).
- The 131 MB of source PNGs were **moved out of `/public`** (to `/frames-src`)
  so they never deploy; re-run the script to regenerate WebP after swapping
  footage.

### Cinematic sequence — smart streaming (`src/lib/preloader.ts`)

Rewrote the all-at-once loader into a `FrameSequence` manager:

- **Progressive load**: a small `INITIAL_FRAME_BATCH` (24 frames, ~1.4 MB)
  loads first and is the only thing gating the splash.
- **Buffer-ahead**: as you scroll, `setPlayhead(i)` reprioritizes loading toward
  the frames just ahead of the playhead (`BUFFER_AHEAD = 30`).
- **Bounded concurrency** (`MAX_CONCURRENT = 6`) — keeps the pipe full without
  flooding it.
- **Memory cap** (`MEMORY_BUDGET = 90`): frames farthest from the playhead are
  evicted, so RAM stays flat instead of climbing to ~760 MB.
- **No cutting/flashing**: `get(i)` returns the nearest already-decoded frame,
  so the canvas always has something to draw while a frame is in flight.

---

## 3. GSAP + scroll performance

- **Removed blur-on-scrub**: sequence captions now animate **transform + opacity
  only** (GPU-composited, zero repaint). This was the single biggest scroll-jank
  source.
- **Removed `filter: brightness()` scrub** in `HeroBackdrop` → replaced with a
  black overlay whose **opacity** is tweened (compositor-friendly).
- **Idle RAF loop fixed**: the hero pointer-parallax loop now runs *only* while
  the hero is on screen (IntersectionObserver) and **stops itself** once the
  eased position settles; a pointer move restarts it. No more per-frame work for
  the whole session.
- **Canvas draw on GSAP's shared ticker**, painting **only when the rounded
  frame index changes** — no wasted paints, one clock shared with Lenis +
  ScrollTrigger.
- `getContext('2d', { alpha: false })` and DPR capped at 2 → cheaper fills.
- **Removed permanent `will-change`**: GSAP now promotes/demotes layers
  per-tween; `AnimatedText` sets `willChange` during its reveal and clears it
  `onComplete`. No idle pinned layers.
- All ScrollTriggers are still scoped in `gsap.context(...)` and `revert()`ed on
  unmount (kills triggers, no leaks); `invalidateOnRefresh` added where measured
  distances matter.

---

## 4. Splash screen

- Curtain now lifts after the **24-frame batch (~1.4 MB)**, not 131 MB. On a
  typical connection that's the difference between ~1s and tens of seconds.
- The filmic word-reel already played on its own cadence; it now simply holds on
  the last word until the *small* batch is ready — perceived-instant on fast
  links, a short dwell on slow ones, never a stalled wait.

---

## 5 & 7. Next.js / bundle

- **Removed Three.js entirely**: deleted dead `src/three/*`, dropped `three`,
  `@react-three/fiber`, `@react-three/drei`, `@types/three`, and the now-unneeded
  `transpilePackages`. First Load JS is **88.6 KB**.
- `experimental.optimizePackageImports` for `gsap`, `lenis`, `framer-motion`.
- Page stays client-rendered (`ssr:false`) because it's animation/canvas-driven,
  but the JS surface is now small and image delivery is static + edge-cacheable.

## 6. Loading experience

- **Blur-up placeholders** on every `next/image` (LQIP map) → progressive reveal,
  never a blank box.
- `ProductImage` keeps its premium tinted-orb fallback if a file is missing.

## 8. Fonts (LCP/CLS)

- **Inter self-hosted via `next/font/google`** (CSS variable, `display: swap`) —
  no render-blocking request, no layout shift.
- Fontshare display fonts (not on Google Fonts) load **non-render-blocking**
  after mount via `app/FontshareDisplay.tsx`, with body text visible immediately.

---

## How to verify

```bash
npm run build          # type-checks + builds; prints First Load JS
npm run start          # serve the production build (use PORT=3100 if 3000 busy)
```

Then in Chrome DevTools:

- **Network**: confirm only ~24 small WebP frames load before the splash lifts;
  product/section images arrive as AVIF/WebP via `/_next/image`.
- **Performance** (record a scroll through `#story`): check for 60fps green
  frames and the absence of long purple "Recalculate Style/Paint" bars that the
  old blur-on-scrub produced.
- **Lighthouse** (mobile, throttled): capture LCP / CLS / TBT against your
  deploy. The structural fixes above are what move them.

### Regenerating frames after swapping footage

```bash
# drop new PNGs into frames-src/frames-png/, then:
node scripts/optimize-images.mjs
# update FRAME_COUNT in src/lib/frames.ts if the count changed
```
