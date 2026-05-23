'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { PRODUCTS } from '@/data/products';
import type { Product } from '@/types';
import ProductImage from '@/components/ProductImage';
import ProductDetail from '@/components/ProductDetail';
import AnimatedText from '@/components/AnimatedText';
import { useIsMobile } from '@/hooks/useMediaQuery';

/**
 * "The Collection" — horizontal-scroll store gallery.
 *
 * The track is pinned for a tall scroll window; vertical scroll is translated
 * into horizontal travel across the product cards (classic GSAP pinned
 * horizontal scroll). A progress rail tracks position. Clicking a card opens
 * a cinematic ProductDetail overlay.
 *
 * On mobile the pin is skipped and cards stack/snap vertically, which is the
 * better touch experience.
 */
export default function StoreGallery() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Product | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return; // native vertical scroll handles mobile
    const el = track.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Travel = how far the track overflows the viewport, plus the side
      // padding so the last card clears the right edge fully.
      const distance = () => el.scrollWidth - window.innerWidth;

      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          // Pin the full-height STAGE (not the whole section, which includes
          // the heading) so cards sit centered in the viewport and show whole.
          trigger: stage.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progress.current)
              gsap.set(progress.current, { scaleX: self.progress });
          },
        },
      });

      gsap.utils.toArray<HTMLElement>('[data-card]').forEach((card) => {
        // Per-card parallax: image drifts within its frame as it crosses screen.
        const img = card.querySelector('[data-card-img]');
        if (img) {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            }
          );
        }

        // Title block reveals as the card scrolls into view (synced to the
        // horizontal travel via containerAnimation), then settles in place.
        const meta = card.querySelector('[data-card-meta]');
        if (meta) {
          gsap.fromTo(
            meta,
            { y: 60, opacity: 0, filter: 'blur(10px)' },
            {
              y: 0,
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left 88%',
                end: 'left 45%',
                scrub: true,
              },
            }
          );
        }
      });
    }, root);

    return () => ctx.revert();
  }, [isMobile]);

  // Mobile (no horizontal pin): reveal each card's title on vertical scroll.
  useEffect(() => {
    if (!isMobile) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-card-meta]').forEach((meta) => {
        gsap.from(meta, {
          y: 50,
          opacity: 0,
          filter: 'blur(10px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: meta.closest('[data-card]'), start: 'top 80%', once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section id="collection" ref={root} className="relative bg-ink">
      {/* heading scrolls normally, above the pinned stage */}
      <div className="px-6 pt-32 md:pt-44 md:pb-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow mb-5 block">The Collection</span>
            <AnimatedText
              as="h2"
              text="Pour the ritual."
              className="display-line text-[11vw] leading-[0.95] md:text-[5.5vw]"
            />
          </div>
          <p className="max-w-sm font-sans text-base font-light leading-relaxed text-white/50">
            A small, considered range — drinks, tools and tins, each made for
            the same quiet ritual.{' '}
            <span className="hidden text-white/30 md:inline">
              Scroll sideways to explore →
            </span>
          </p>
        </div>
      </div>

      {/* PINNED STAGE — exactly one viewport tall on desktop; cards are
          vertically centered inside it so each one shows whole. On mobile this
          is just a normal-flow container and cards stack. */}
      <div
        ref={stage}
        className={`relative flex w-full flex-col ${
          isMobile ? 'py-8' : 'h-[100svh] justify-center overflow-hidden'
        }`}
      >
        {/* horizontal track */}
        <div
          ref={track}
          className={`flex gap-6 px-6 will-change-transform ${
            isMobile ? 'flex-col' : 'flex-nowrap'
          }`}
          style={isMobile ? {} : { width: 'max-content' }}
        >
          {PRODUCTS.map((p, i) => (
            <button
              key={p.id}
              data-card
              onClick={() => setActive(p)}
              className="group relative flex aspect-[3/4] w-full shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left transition-colors duration-500 hover:border-matcha/40 md:h-[74vh] md:w-[clamp(320px,28vw,420px)]"
            >
              {/* full-bleed image */}
              <div data-card-img className="absolute inset-0 scale-110">
                <ProductImage
                  src={p.image}
                  alt={p.name}
                  accent={p.accent}
                  label={p.name}
                  className="h-full w-full"
                />
              </div>

              {/* legibility scrim — strong at the bottom so the title always reads */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/5" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />

              {/* top chips */}
              <span className="absolute left-5 top-5 z-10 rounded-full border border-white/15 bg-ink/50 px-3 py-1 font-sans text-[0.6rem] uppercase tracking-widest2 text-white/80 backdrop-blur">
                {p.kind}
              </span>
              <span className="absolute right-5 top-5 z-10 font-display text-sm text-white/50">
                0{i + 1}
              </span>

              {/* title block — revealed on scroll, anchored to bottom */}
              <div
                data-card-meta
                className="absolute inset-x-0 bottom-0 z-10 p-7"
              >
                <h3 className="font-display text-3xl font-semibold leading-tight text-cream drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)] md:text-4xl">
                  {p.name}
                </h3>
                <p className="mt-2 font-sans text-sm font-light text-white/70">
                  {p.tagline}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4">
                  <span className="font-display text-lg text-cream">
                    ${p.price}
                    <span className="ml-1 font-sans text-xs font-light text-white/55">
                      {p.unit}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest2 text-matcha transition-transform duration-500 group-hover:translate-x-1">
                    View →
                  </span>
                </div>
              </div>

              <span className="pointer-events-none absolute -bottom-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-matcha/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </button>
          ))}
        </div>

        {/* scroll progress rail — pinned inside the stage (desktop only) */}
        {!isMobile && (
          <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 h-px w-40 -translate-x-1/2 overflow-hidden bg-white/10">
            <div
              ref={progress}
              className="h-full origin-left bg-matcha"
              style={{ transform: 'scaleX(0)', boxShadow: '0 0 14px rgba(138,160,95,0.7)' }}
            />
          </div>
        )}
      </div>

      {/* detail overlay */}
      <ProductDetail product={active} onClose={() => setActive(null)} />
    </section>
  );
}
