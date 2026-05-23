'use client';

import { motion } from 'framer-motion';
import ProductImage from './ProductImage';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';

interface FeaturedGridProps {
  excludeIds?: string[];
}

/**
 * Curated "Featured" highlight grid for the cart page. Shows a hand-picked
 * set of products with imagery + price and a quiet add action, so the bag
 * always feels considered — never empty or transactional.
 *
 * `excludeIds` hides items already in the bag to keep suggestions relevant.
 */
const FEATURED_IDS = ['matcha-tin', 'ceremonial-whisk', 'signature-cup', 'gift-set'];

export default function FeaturedGrid({ excludeIds = [] }: FeaturedGridProps) {
  const { add } = useCart();
  const items = PRODUCTS.filter(
    (p) => FEATURED_IDS.includes(p.id) && !excludeIds.includes(p.id)
  ).slice(0, 4);

  if (!items.length) return null;

  return (
    <section className="mt-28">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <span className="eyebrow mb-3 block">Complete the Ritual</span>
          <h2 className="font-display text-3xl font-semibold text-cream md:text-4xl">
            Featured
          </h2>
        </div>
        <span className="hidden font-sans text-sm font-light text-white/35 sm:block">
          Hand-picked to pair with your bag
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {items.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-colors duration-500 hover:border-matcha/40"
          >
            <div className="relative aspect-square overflow-hidden">
              <ProductImage
                src={p.image}
                alt={p.name}
                accent={p.accent}
                label={p.name}
                className="h-full w-full transition-transform duration-700 ease-cinema group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-ink/40 px-2.5 py-1 font-sans text-[0.55rem] uppercase tracking-widest2 text-white/70 backdrop-blur">
                {p.kind}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-lg font-medium text-cream">{p.name}</h3>
              <p className="mt-1 font-sans text-xs font-light text-white/45">
                {p.tagline}
              </p>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-display text-base text-cream">
                  ${p.price}
                </span>
                <button
                  onClick={() => add(p, 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream transition-all duration-300 hover:border-matcha hover:bg-matcha hover:text-ink"
                  aria-label={`Add ${p.name} to bag`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
