'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import MagneticButton from '@/components/MagneticButton';
import HeroBackdrop from '@/components/HeroBackdrop';

interface HeroProps {
  intro: boolean;
}

/**
 * Fullscreen cinematic hero. The bg.png photographic plate sits behind layered
 * UI. On mount (after the loader reveals) the headline, eyebrow and CTAs
 * stagger in; on scroll the whole stack parallax-fades upward.
 */
export default function Hero({ intro }: HeroProps) {
  const root = useRef<HTMLElement>(null);

  // Intro choreography — fires once the loader hands off `intro`.
  useEffect(() => {
    if (!intro) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('[data-hero-eyebrow]', { opacity: 0, y: 20, duration: 0.9 }, 0.1)
        .from(
          '[data-hero-line]',
          {
            opacity: 0,
            yPercent: 120,
            filter: reduce ? 'blur(0px)' : 'blur(14px)',
            duration: 1.2,
            stagger: 0.12,
          },
          0.2
        )
        .from('[data-hero-sub]', { opacity: 0, y: 24, duration: 1 }, 0.7)
        .from('[data-hero-cta]', { opacity: 0, y: 24, stagger: 0.1, duration: 0.9 }, 0.85)
        .from('[data-hero-scroll]', { opacity: 0, duration: 1 }, 1.1);
    }, root);
    return () => ctx.revert();
  }, [intro]);

  // Scroll parallax: hero content drifts up & fades on scroll. (The bg.png
  // plate handles its own depth/fade inside HeroBackdrop.)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('[data-hero-content]', {
        yPercent: -28,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const scrollTo = (sel: string) =>
    window.__lenis
      ? window.__lenis.scrollTo(sel, { offset: 0 })
      : document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' });
  const scrollToStory = () => scrollTo('#story');
  const scrollToShop = () => scrollTo('#collection');

  return (
    <section
      ref={root}
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      {/* photographic studio plate (public/bg.png) — base layer */}
      <HeroBackdrop triggerRef={root} />
      {/* (3D anti-gravity scene removed — bg.png plate carries the hero) */}

      {/* atmospheric vignette + matcha bloom */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-radial-matcha opacity-50" />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(12,18,13,0.85) 100%)',
        }}
      />

      {/* UI content */}
      <div
        data-hero-content
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <span data-hero-eyebrow className="eyebrow mb-7">
          Ceremonial-Grade · Served Cold
        </span>

        <h1 className="display-line text-[14vw] sm:text-[12vw] md:text-[9.5vw]">
          <span data-hero-line className="block overflow-hidden">
            <span className="block">Pure</span>
          </span>
          <span data-hero-line className="block overflow-hidden">
            <span className="block text-matcha glow-text">Matcha</span>
          </span>
        </h1>

        <p
          data-hero-sub
          className="mt-7 max-w-md text-balance font-sans text-base font-light leading-relaxed text-white/55 md:text-lg"
        >
          A single leaf, stone-ground and poured slow. Calm energy, clean taste,
          nothing to hide — the quietest luxury you&rsquo;ll drink all day.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <span data-hero-cta>
            <MagneticButton onClick={scrollToShop}>Shop Now</MagneticButton>
          </span>
          <span data-hero-cta>
            <MagneticButton variant="ghost" onClick={scrollToStory}>
              Explore Ritual
            </MagneticButton>
          </span>
        </div>
      </div>

      {/* scroll cue */}
      <div
        data-hero-scroll
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="font-sans text-[0.65rem] uppercase tracking-widest2 text-white/40">
          Scroll
        </span>
        <span className="relative block h-12 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-matcha" />
        </span>
      </div>

      <style>{`
        @keyframes scrollcue {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
}
