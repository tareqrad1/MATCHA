'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { FRAME_COUNT } from '@/lib/frames';
import type { FrameSequence } from '@/lib/preloader';

interface ScrollSequenceProps {
  sequence: FrameSequence | null;
}

/**
 * Cinematic scroll-driven storytelling. A canvas is pinned for several
 * viewport-heights; scroll progress maps to a frame index (1..FRAME_COUNT).
 * Frames stream in via the FrameSequence manager (buffer-ahead + memory cap);
 * the canvas always draws the nearest available frame so there's no blanking.
 *
 * Performance notes:
 *  - We draw on GSAP's ticker (one shared clock with Lenis/ScrollTrigger) only
 *    when the frame index actually changed, not every rAF — no wasted paints.
 *  - Captions animate transform + opacity only (no blur-on-scrub, which forces
 *    a full re-rasterization every scroll tick and was a major jank source).
 */
export default function ScrollSequence({ sequence }: ScrollSequenceProps) {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const frame = useRef(0); // current float frame index from scroll
  const drawn = useRef(-1); // last integer frame actually painted

  // Draw a single frame, cover-fit to the canvas. Reads the nearest decoded
  // frame from the sequence so an in-flight frame never blanks the canvas.
  const draw = (idx: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const img = sequence?.get(idx);
    if (!canvas || !ctx || !img || !img.width) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const ir = img.width / img.height;
    const cr = cw / ch;
    let dw: number, dh: number, dx: number, dy: number;
    if (ir > cr) {
      dh = ch;
      dw = ch * ir;
      dx = (cw - dw) / 2;
      dy = 0;
    } else {
      dw = cw;
      dh = cw / ir;
      dx = 0;
      dy = (ch - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // Size the canvas backing store to DPR (capped at 2 to bound fill cost).
  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    drawn.current = -1; // force a redraw at the new size
    draw(frame.current);
  };

  useEffect(() => {
    if (!sequence) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // alpha:false lets the compositor skip per-pixel blending — cheaper fills.
    ctxRef.current = canvas.getContext('2d', { alpha: false });

    resize();
    window.addEventListener('resize', resize);

    // One ticker callback paints only when the rounded frame changed, and
    // tells the streamer where we are so it buffers the right frames ahead.
    const tick = () => {
      const i = Math.round(frame.current);
      if (i !== drawn.current) {
        drawn.current = i;
        sequence.setPlayhead(i);
        draw(i);
      }
    };
    gsap.ticker.add(tick);

    const ctx = gsap.context(() => {
      // Map scroll progress -> frame index. We mutate a ref (no React state,
      // no re-renders) and let the ticker handle painting.
      const proxy = { i: 0 };
      gsap.to(proxy, {
        i: FRAME_COUNT - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          pin: '[data-seq-stage]',
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          frame.current = proxy.i;
        },
      });

      // Caption phases — transform + opacity ONLY (GPU-composited, no repaint).
      const captions = gsap.utils.toArray<HTMLElement>('[data-seq-caption]');
      captions.forEach((cap) => {
        const [from, to] = (cap.dataset.range ?? '0,0').split(',').map(Number);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: `top+=${from}% top`,
            end: `top+=${to}% top`,
            scrub: true,
          },
        });
        tl.fromTo(
          cap,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
        ).to(cap, { opacity: 0, y: -30, duration: 1, ease: 'power2.in' });
      });
    }, root);

    return () => {
      window.removeEventListener('resize', resize);
      gsap.ticker.remove(tick);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence]);

  return (
    <section id="story" ref={root} className="relative h-[420vh] w-full bg-ink">
      {/* pinned full-viewport stage */}
      <div data-seq-stage className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* grade the footage darker at the edges for cinematic framing */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(130% 100% at 50% 50%, transparent 45%, rgba(12,18,13,0.9) 100%)',
          }}
        />

        {/* caption layers, each tied to a scroll % window of this section */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
          <h2
            data-seq-caption
            data-range="2,30"
            className="display-line absolute text-[10vw] md:text-[7vw]"
          >
            Grown In <span className="text-matcha glow-text">Shade</span>
          </h2>
          <h2
            data-seq-caption
            data-range="34,64"
            className="display-line absolute text-[10vw] md:text-[7vw]"
          >
            Ground By <span className="text-matcha glow-text">Stone</span>
          </h2>
          <h2
            data-seq-caption
            data-range="68,98"
            className="display-line absolute text-[12vw] md:text-[8vw]"
          >
            Poured Slow.
          </h2>
        </div>
      </div>
    </section>
  );
}
