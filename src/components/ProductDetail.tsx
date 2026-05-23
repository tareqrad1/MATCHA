'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, type Easing } from 'framer-motion';
import ProductImage from './ProductImage';
import MagneticButton from './MagneticButton';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

const EASE: Easing = [0.16, 1, 0.3, 1];

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
}

/**
 * Cinematic product detail overlay. Slides up from black with a split layout:
 * full-bleed image left, copy/notes/price/CTA right. Locks Lenis + body
 * scroll while open and closes on backdrop click or Escape.
 */
export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { add } = useCart();

  // Add to cart and close the overlay, staying on the page so the user can
  // keep browsing. A global toast confirms the add (no navigation).
  const addToBag = () => {
    if (!product) return;
    add(product, 1);
    onClose();
  };

  // Lock scroll + wire Escape while the overlay is mounted.
  useEffect(() => {
    if (!product) return;
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.__lenis?.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-coal md:max-h-[80vh] md:flex-row md:rounded-3xl"
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {/* image side */}
            <div className="relative h-56 w-full overflow-hidden md:h-auto md:w-1/2">
              <ProductImage
                src={product.image}
                alt={product.name}
                accent={product.accent}
                label={product.name}
                className="h-full w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-coal/60 to-transparent md:bg-gradient-to-r" />
              <span className="absolute left-6 top-6 rounded-full border border-white/15 bg-ink/40 px-3 py-1 font-sans text-[0.6rem] uppercase tracking-widest2 text-white/70 backdrop-blur">
                {product.kind}
              </span>
            </div>

            {/* copy side */}
            <div className="flex flex-1 flex-col overflow-y-auto p-7 md:p-10" data-lenis-prevent>
              <span
                className="font-sans text-xs uppercase tracking-widest2"
                style={{ color: product.accent }}
              >
                {product.tagline}
              </span>
              <h3 className="mt-3 font-display text-4xl font-semibold text-cream md:text-5xl">
                {product.name}
              </h3>

              <p className="mt-5 font-sans text-[0.95rem] font-light leading-relaxed text-white/60">
                {product.description}
              </p>

              {/* notes */}
              <ul className="mt-7 space-y-2.5">
                {product.notes.map((n) => (
                  <li
                    key={n}
                    className="flex items-center gap-3 font-sans text-sm font-light text-white/55"
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: product.accent }}
                    />
                    {n}
                  </li>
                ))}
              </ul>

              {/* price + cta */}
              <div className="mt-auto flex items-center justify-between gap-4 pt-9">
                <span className="font-display text-3xl text-cream">
                  ${product.price}
                  <span className="ml-1.5 font-sans text-xs font-light text-white/40">
                    {product.unit}
                  </span>
                </span>
                <MagneticButton onClick={addToBag}>Add to Bag →</MagneticButton>
              </div>
            </div>

            {/* close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-ink/50 text-white/70 backdrop-blur transition-colors duration-300 hover:border-matcha/50 hover:text-matcha"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
