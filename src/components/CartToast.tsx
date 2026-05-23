'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Easing } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import ProductImage from './ProductImage';

const EASE: Easing = [0.16, 1, 0.3, 1];
const DURATION = 3200; // ms visible before auto-dismiss

/**
 * Global "added to bag" confirmation toast. Listens to the cart's `lastAdded`
 * signal and slides in a premium card with the product thumbnail and a quick
 * link to the bag — so adding never interrupts browsing with a page change.
 *
 * Mount once near the app root (inside CartProvider).
 */
export default function CartToast() {
  const { lastAdded, lineCount } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAdded) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), DURATION);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const product = lastAdded?.product;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex justify-center px-4 sm:inset-x-auto sm:right-6 sm:justify-end">
      <AnimatePresence>
        {visible && product && lastAdded && (
          <motion.div
            key={lastAdded.at}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-4 rounded-2xl border border-white/10 bg-coal/90 p-3 pr-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10">
              <ProductImage
                src={product.image}
                alt={product.name}
                accent={product.accent}
                label={product.name}
                className="h-full w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-matcha text-ink">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="font-sans text-[0.7rem] uppercase tracking-widest2 text-matcha">
                  Added to bag
                </span>
              </div>
              <p className="mt-1 truncate font-display text-sm font-medium text-cream">
                {product.name}
              </p>
            </div>

            <Link
              href="/cart"
              onClick={() => setVisible(false)}
              className="shrink-0 rounded-full border border-white/15 px-4 py-2 font-sans text-xs font-medium text-cream transition-colors duration-300 hover:border-matcha hover:text-matcha"
            >
              View Bag{lineCount ? ` (${lineCount})` : ''}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
