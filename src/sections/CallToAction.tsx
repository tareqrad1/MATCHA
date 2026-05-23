'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import AnimatedText from '@/components/AnimatedText';
import Reveal from '@/components/Reveal';
import MagneticButton from '@/components/MagneticButton';

const DETAILS = [
  { k: 'Origin', v: 'Uji, Japan' },
  { k: 'Harvest', v: 'First Flush' },
  { k: 'Delivery', v: 'Cold, Daily' },
];

/**
 * "Now Serving" — closing reservation card.
 * The CTA lives inside a bordered glass panel with the bg.png splash echoed
 * faintly behind it, corner ticks, a product detail row and the magnetic
 * primary action. The panel lifts on scroll for a sense of presentation.
 */
export default function CallToAction() {
  const root = useRef<HTMLElement>(null);

  const scrollToShop = () =>
    window.__lenis
      ? window.__lenis.scrollTo('#collection', { offset: 0 })
      : document.querySelector('#collection')?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-card]', {
        opacity: 0,
        y: 70,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-card]', start: 'top 82%', once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink px-6 py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-radial-matcha opacity-40" />

      <div
        data-card
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] px-8 py-16 backdrop-blur-xl md:px-16 md:py-20"
      >
        {/* faint splash echo behind the panel content */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.16]"
          style={{ backgroundImage: 'url(/bg.png)' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink/90" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-matcha/15 blur-[90px]" />

        {/* corner ticks */}
        {[
          'left-5 top-5 border-l border-t',
          'right-5 top-5 border-r border-t',
          'left-5 bottom-5 border-l border-b',
          'right-5 bottom-5 border-r border-b',
        ].map((pos) => (
          <span
            key={pos}
            className={`pointer-events-none absolute h-5 w-5 border-matcha/50 ${pos}`}
          />
        ))}

        <div className="relative z-10 text-center">
          <Reveal className="mb-8 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-matcha/50" />
            <span className="eyebrow">Now Serving</span>
            <span className="h-px w-8 bg-matcha/50" />
          </Reveal>

          <AnimatedText
            as="h2"
            text="Begin your"
            className="display-line text-[13vw] leading-[0.95] md:text-[6.5vw]"
          />
          <AnimatedText
            as="h2"
            text="ritual."
            className="display-line text-[13vw] leading-[0.95] text-matcha glow-text md:text-[6.5vw]"
            delay={0.12}
          />

          <Reveal
            as="p"
            delay={0.2}
            className="mx-auto mt-8 max-w-md text-balance font-sans text-base font-light leading-relaxed text-white/55"
          >
            Order today and we&rsquo;ll have it cold and waiting. Pure matcha,
            poured slow — the calm part of your day, on us.
          </Reveal>

          {/* product detail row */}
          <Reveal delay={0.3} className="mx-auto mt-12 max-w-md">
            <dl className="flex items-stretch justify-center divide-x divide-white/10 text-center">
              {DETAILS.map((d) => (
                <div key={d.k} className="flex-1 px-4">
                  <dt className="font-sans text-[0.65rem] uppercase tracking-widest2 text-white/35">
                    {d.k}
                  </dt>
                  <dd className="mt-2 font-display text-sm font-medium text-cream">
                    {d.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.4} className="mt-14 flex justify-center">
            <MagneticButton onClick={scrollToShop}>Shop Now →</MagneticButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
