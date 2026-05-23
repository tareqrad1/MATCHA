'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { FRAME_COUNT } from '@/lib/frames';

interface ScrollSequenceProps {
  images: HTMLImageElement[] | null;
}

/**
 * Cinematic scroll-driven storytelling. A canvas is pinned for several
 * viewport-heights; scroll progress maps to a frame index (1..FRAME_COUNT) and
 * the matching preloaded image is drawn cover-fit. Caption layers fade/blur in
 * and out over phases of the sequence.
 *
 * `images` is the decoded HTMLImageElement[] from the preloader.
 */
export default function ScrollSequence({ images }: ScrollSequenceProps) {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef({ i: 0 });

  // Draw a single frame, cover-fit to the canvas (handles DPR + resize).
  const render = (idx: number) => {
    const canvas = canvasRef.current;
    const img =
      images?.[Math.min(images.length - 1, Math.max(0, Math.round(idx)))];
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // Size the canvas backing store to the device pixel ratio.
  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    render(frame.current.i);
  };

  useEffect(() => {
    if (!images?.length) return;
    resize();
    window.addEventListener('resize', resize);

    const ctx = gsap.context(() => {
      // Drive the frame index from scroll. We tween a plain object and redraw
      // on each update so playback is buttery and tied to Lenis-smoothed scroll.
      gsap.to(frame.current, {
        i: FRAME_COUNT - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          pin: '[data-seq-stage]',
          anticipatePin: 1,
        },
        onUpdate: () => render(frame.current.i),
      });

      // Caption phases — each fades/blurs in then out across a scroll window.
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
          { opacity: 0, filter: 'blur(16px)', y: 30 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, ease: 'power2.out' }
        ).to(cap, {
          opacity: 0,
          filter: 'blur(16px)',
          y: -30,
          duration: 1,
          ease: 'power2.in',
        });
      });
    }, root);

    return () => {
      window.removeEventListener('resize', resize);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

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
            className="display-line absolute text-[10vw] md:text-[7vw] will-blur"
          >
            Grown In <span className="text-matcha glow-text">Shade</span>
          </h2>
          <h2
            data-seq-caption
            data-range="34,64"
            className="display-line absolute text-[10vw] md:text-[7vw] will-blur"
          >
            Ground By <span className="text-matcha glow-text">Stone</span>
          </h2>
          <h2
            data-seq-caption
            data-range="68,98"
            className="display-line absolute text-[12vw] md:text-[8vw] will-blur"
          >
            Poured Slow.
          </h2>
        </div>
      </div>
    </section>
  );
}
