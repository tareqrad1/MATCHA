'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import AnimatedText from '@/components/AnimatedText';
import ProductImage from '@/components/ProductImage';

const PILLARS = [
  {
    n: '01',
    title: 'Single Origin',
    body: 'First-harvest leaf from one region, one season. Traceable to the field — never blended, never bulked.',
    image: '/sections/why-01.png',
    accent: '#8aa05f',
  },
  {
    n: '02',
    title: 'Stone Ground',
    body: 'Milled slow on granite, the old way — a fine, vivid powder that keeps every note the leaf was grown for.',
    image: '/sections/why-02.png',
    accent: '#b9c79a',
  },
  {
    n: '03',
    title: 'Pure & Simple',
    body: 'Nothing added, nothing hidden. Just matcha, milk and ice — clean energy with a calm, even finish.',
    image: '/sections/why-03.png',
    accent: '#5e7242',
  },
];

/**
 * "Why MATCHA" — feature pillars elevated with photography.
 * Each card carries an image that reveals via clip-path on scroll, parallaxes
 * within its frame, and tilts in 3D toward the pointer for depth. Cards drift
 * at alternating rates as the section scrolls past.
 */
export default function Experience() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-pillar]');

      cards.forEach((card, i) => {
        // entrance
        gsap.from(card, {
          opacity: 0,
          y: 80,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        });

        // image clip-path reveal
        const img = card.querySelector('[data-pillar-img]');
        if (img) {
          gsap.fromTo(
            img,
            { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.2 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              scale: 1.1,
              duration: 1.3,
              ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 82%', once: true },
            }
          );
        }

        // depth parallax across the whole section
        gsap.to(card, {
          yPercent: i % 2 === 0 ? -10 : -20,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });

        // pointer 3D tilt (desktop only)
        if (!window.matchMedia('(pointer: coarse)').matches) {
          const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
          const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
          const onMove = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            rotY(px * 10);
            rotX(-py * 10);
          };
          const onLeave = () => {
            rotX(0);
            rotY(0);
          };
          card.addEventListener('pointermove', onMove);
          card.addEventListener('pointerleave', onLeave);
        }
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={root}
      className="relative overflow-hidden bg-coal px-6 py-32 md:py-44"
    >
      <div className="pointer-events-none absolute right-[-10%] top-1/3 h-[50vh] w-[50vh] rounded-full bg-matcha/8 blur-[140px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-20 flex max-w-3xl flex-col gap-6 md:mb-28">
          <span className="eyebrow">Why MATCHA</span>
          <AnimatedText
            as="h2"
            text="Fewer things, done right."
            className="display-line text-[10vw] leading-[0.95] md:text-[5vw]"
          />
          <p className="max-w-xl font-sans text-lg font-light leading-relaxed text-white/50">
            No long menu, no noise. One leaf, sourced and ground with care, so
            every cup tastes exactly as it should — pure, green and calm.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3" style={{ perspective: '1200px' }}>
          {PILLARS.map((p) => (
            <article
              key={p.n}
              data-pillar
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent transition-colors duration-500 hover:border-matcha/40"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* photo */}
              <div className="relative h-52 overflow-hidden">
                <div data-pillar-img className="absolute inset-0 scale-110">
                  <ProductImage
                    src={p.image}
                    alt={p.title}
                    accent={p.accent}
                    label={p.title}
                    className="h-full w-full"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-coal via-coal/10 to-transparent" />
                <span
                  className="absolute right-5 top-4 font-display text-5xl font-semibold opacity-30"
                  style={{ color: p.accent }}
                >
                  {p.n}
                </span>
              </div>

              {/* copy */}
              <div className="flex flex-1 flex-col p-7">
                <h3 className="font-display text-2xl font-medium text-cream">
                  {p.title}
                </h3>
                <p className="mt-3 font-sans text-sm font-light leading-relaxed text-white/50">
                  {p.body}
                </p>
              </div>

              <span className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-matcha/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
