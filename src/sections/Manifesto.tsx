'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import AnimatedText from '@/components/AnimatedText';
import Reveal from '@/components/Reveal';
import ProductImage from '@/components/ProductImage';

const CREDENTIALS = [
  { k: 'First Harvest', v: 'Single-origin Uji leaf' },
  { k: 'Zero Dilution', v: 'Slow-frozen crystal ice' },
  { k: 'Stone Milled', v: '40g / hour, by hand' },
];

/**
 * "The Philosophy" — editorial split spread.
 * An oversized ghost numeral + vertical label rail anchor an asymmetric
 * headline; a credential row grounds it with a magazine-grade detail line.
 * Faint matcha bloom + a thin top hairline frame the composition; the ghost
 * numeral parallaxes for depth.
 */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('[data-ghost]', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // photo: clip-path reveal on enter + slow parallax drift within frame
      const img = root.current?.querySelector('[data-phil-img]');
      if (img) {
        gsap.fromTo(
          img,
          { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.25 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1.15,
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: { trigger: img, start: 'top 85%', once: true },
          }
        );
        gsap.to(img, {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="philosophy"
      ref={root}
      className="relative overflow-hidden bg-ink px-6 py-32 md:py-44"
    >
      {/* ambient bloom + framing hairline */}
      <div className="pointer-events-none absolute left-[12%] top-1/2 h-[55vh] w-[55vh] -translate-y-1/2 rounded-full bg-matcha/10 blur-[130px]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      {/* oversized ghost index numeral */}
      <span
        data-ghost
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 top-8 select-none font-display text-[34vw] font-semibold leading-none text-white/[0.03] md:text-[22vw]"
      >
        01
      </span>

      <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-y-14 md:grid-cols-12 md:gap-x-10">
        {/* vertical label rail */}
        <Reveal className="md:col-span-3">
          <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-6">
            <span className="eyebrow whitespace-nowrap">The Philosophy</span>
            <span className="hidden h-24 w-px bg-gradient-to-b from-matcha/60 to-transparent md:block" />
            <span className="font-sans text-xs uppercase tracking-widest2 text-white/30">
              Ch. 01 — Stillness
            </span>
          </div>
        </Reveal>

        {/* photo panel */}
        <div className="md:col-span-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10">
            <div data-phil-img className="absolute inset-0 scale-[1.15]">
              <ProductImage
                src="/sections/philosophy.png"
                alt="The matcha ritual"
                accent="#8aa05f"
                label="Philosophy"
                className="h-full w-full"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 font-sans text-[0.6rem] uppercase tracking-widest2 text-white/60">
              Uji, Japan — First Harvest
            </span>
          </div>
        </div>

        {/* headline column */}
        <div className="md:col-span-6">
          <AnimatedText
            as="h2"
            text="Slow is the"
            className="display-line text-[13vw] leading-[0.92] md:text-[7.5vw]"
          />
          <AnimatedText
            as="h2"
            text="whole point."
            className="display-line mt-1 text-[13vw] leading-[0.92] text-matcha glow-text md:text-[7.5vw]"
            delay={0.12}
          />

          <Reveal
            as="p"
            delay={0.2}
            className="mt-10 max-w-xl text-balance font-sans text-lg font-light leading-relaxed text-white/55"
          >
            One leaf, shade-grown and stone-ground. No syrups, no shortcuts —
            just a few quiet minutes and a cup of clean, calm energy. That is
            the entire philosophy.
          </Reveal>

          {/* credential row */}
          <Reveal delay={0.3} className="mt-16 border-t border-white/8 pt-8">
            <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
              {CREDENTIALS.map((c) => (
                <div key={c.k} className="group">
                  <dt className="font-display text-sm font-medium text-matcha/90">
                    {c.k}
                  </dt>
                  <dd className="mt-1 font-sans text-sm font-light text-white/45">
                    {c.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
