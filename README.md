# Tareq&rsquo;s — Anti-Gravity Iced Matcha

A premium cinematic landing page. Luxury-futuristic beverage commercial meets
Apple-style scroll storytelling: a 3D anti-gravity matcha scene, a scroll-driven
240-frame image sequence, and big motion-design typography.

## Stack

React + Vite · Three.js / React Three Fiber / drei · GSAP + ScrollTrigger ·
Framer Motion · Lenis smooth scroll · Tailwind CSS.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # preview the build
```

## How it&rsquo;s wired

- **Loading** — [`src/lib/preloader.js`](src/lib/preloader.js) decodes all 240
  frames; [`Loader`](src/components/Loader.jsx) shows a smoothed % counter and a
  matcha progress bar, then lifts a curtain that hands off to the hero intro.
- **Smooth scroll** — [`useLenis`](src/hooks/useLenis.js) drives Lenis from
  GSAP&rsquo;s ticker so ScrollTrigger and Lenis share one clock. Scroll is held
  until the intro begins.
- **3D scene** — [`src/three/`](src/three/): a procedural floating
  [`MatchaCup`](src/three/MatchaCup.jsx), orbiting glass [`IceCube`](src/three/IceCube.jsx)s,
  levitating [`Droplets`](src/three/Droplets.jsx), a [`Particles`](src/three/Particles.jsx)
  haze, depth fog, and mouse-reactive [`Lighting`](src/three/Lighting.jsx) under a
  slow cinematic camera rig.
- **Scroll sequence** — [`ScrollSequence`](src/sections/ScrollSequence.jsx) pins a
  canvas and maps scroll progress to a frame index (1&ndash;240), drawing the
  preloaded image cover-fit, with blur-to-sharp caption phases.
- **Typography** — [`AnimatedText`](src/components/AnimatedText.jsx) splits lines
  into letters and reveals them with blur/stagger on scroll.
- **Interaction** — [`MagneticButton`](src/components/MagneticButton.jsx) +
  [`useMagnetic`](src/hooks/useMagnetic.js), parallax depth in
  [`Experience`](src/sections/Experience.jsx).

## Performance & accessibility

- Scene DPR, particle/ice/droplet counts scale down on mobile via
  [`useMediaQuery`](src/hooks/useMediaQuery.js); drei `AdaptiveDpr`/`AdaptiveEvents`.
- Frame index is tweened (not per-scroll-event redraw) and tied to scrub.
- `prefers-reduced-motion` collapses the heavy cinematics (Lenis disabled,
  text reveals resolved instantly).
- Three.js is isolated into its own bundle chunk.

## Frames

`/public/frames/ezgif-frame-001.jpg … 240.jpg`. To swap the footage, replace the
files and update `FRAME_COUNT` in [`src/lib/frames.js`](src/lib/frames.js).
