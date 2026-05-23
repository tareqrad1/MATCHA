'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from '@/lib/gsap';
import { useMousePosition } from '@/hooks/useMousePosition';

interface HeroBackdropProps {
  triggerRef: RefObject<HTMLElement>;
}

/**
 * Cinematic photographic backdrop (public/bg.png) for the hero.
 * Sits behind the live 3D scene as the base "studio plate":
 *  - a slow Ken-Burns scale gives the still photo subtle life
 *  - the pointer drives a gentle parallax shift (depth illusion)
 *  - scroll pushes it deeper + darker so the 3D + UI lead on enter
 *  - heavy edge/bottom grading fuses it into the pure-black page
 */
export default function HeroBackdrop({ triggerRef }: HeroBackdropProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();

  // Pointer parallax — eased toward the cursor, but the rAF loop runs ONLY
  // while the hero is on screen and stops itself once the eased position has
  // settled, so it isn't burning a frame callback for the whole session.
  useEffect(() => {
    const el = img.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const xTo = gsap.quickTo(el, '--px', { duration: 0.9, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, '--py', { duration: 0.9, ease: 'power3.out' });

    let raf = 0;
    let running = false;
    let lastX = 0;
    let lastY = 0;

    const loop = () => {
      const tx = mouse.current.x * 18;
      const ty = -mouse.current.y * 18;
      xTo(tx);
      yTo(ty);
      // Stop the loop once the target has stopped moving; a fresh pointer
      // event restarts it. No idle per-frame work.
      if (Math.abs(tx - lastX) < 0.01 && Math.abs(ty - lastY) < 0.01) {
        running = false;
        return;
      }
      lastX = tx;
      lastY = ty;
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    // Only animate while the hero is actually visible.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener('pointermove', kick);
          kick();
        } else {
          window.removeEventListener('pointermove', kick);
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );
    if (wrap.current) io.observe(wrap.current);

    return () => {
      io.disconnect();
      window.removeEventListener('pointermove', kick);
      cancelAnimationFrame(raf);
    };
  }, [mouse]);

  // Idle Ken-Burns drift + scroll-driven depth/fade.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.to(img.current, {
          scale: 1.12,
          duration: 14,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }
      // Depth via transform only (GPU-composited). The "darken on scroll" is
      // done by fading a black overlay's opacity instead of animating
      // filter:brightness on scrub, which forced a full repaint every tick.
      gsap.to(wrap.current, {
        yPercent: 18,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: triggerRef?.current ?? undefined,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      gsap.to(shade.current, {
        opacity: 0.6,
        ease: 'none',
        scrollTrigger: {
          trigger: triggerRef?.current ?? undefined,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [triggerRef]);

  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden">
      {/* the plate — translate driven by CSS vars set above */}
      <div
        ref={img}
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: 'url(/bg.webp)',
          transform:
            'translate3d(var(--px,0px), var(--py,0px), 0) scale(1.05)',
        }}
      />

      {/* scroll-driven darkening overlay (opacity tween, not filter:brightness) */}
      <div
        ref={shade}
        className="pointer-events-none absolute inset-0 bg-ink"
        style={{ opacity: 0 }}
      />

      {/* matcha bloom lifting off the splash */}
      <div className="pointer-events-none absolute inset-0 bg-radial-matcha opacity-40 mix-blend-screen" />

      {/* cinematic grade: darken edges + heavy bottom for type legibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(125% 95% at 50% 42%, transparent 38%, rgba(12,18,13,0.55) 72%, rgba(12,18,13,0.95) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background: 'linear-gradient(to top, #0c120d 8%, transparent 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
        style={{
          background: 'linear-gradient(to bottom, rgba(12,18,13,0.85), transparent)',
        }}
      />

      {/* faint film grain to marry photo + CSS so it reads as one frame */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
