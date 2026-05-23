'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

/** Minimal floating top nav. Condenses + frosts after the hero scrolls past. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { lineCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () =>
    window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0 });

  const links: [string, string][] = [
    ['Ritual', 'story'],
    ['Philosophy', 'philosophy'],
    ['Why Us', 'experience'],
    ['Shop', 'collection'],
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-cinema ${
        scrolled
          ? 'border-b border-white/5 bg-ink/60 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <button
          onClick={toTop}
          className="flex items-center gap-2.5 font-display text-lg font-semibold uppercase tracking-[0.3em] text-cream"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-matcha shadow-[0_0_12px_rgba(138,160,95,0.8)]" />
          MATCHA
        </button>

        <div className="hidden items-center gap-9 md:flex">
          {links.map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className="font-sans text-sm font-light text-white/55 transition-colors duration-300 hover:text-matcha"
            >
              {label}
            </a>
          ))}
        </div>

        {/* cart */}
        <Link
          href="/cart"
          aria-label={`Cart, ${lineCount} item${lineCount === 1 ? '' : 's'}`}
          className="group relative flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2 text-cream transition-colors duration-300 hover:border-matcha/60"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300 group-hover:text-matcha"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="hidden font-sans text-sm font-light sm:block">Bag</span>
          <AnimatePresence>
            {lineCount > 0 && (
              <motion.span
                key={lineCount}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-matcha px-1.5 font-sans text-[0.65rem] font-semibold text-ink"
              >
                {lineCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </nav>
    </motion.header>
  );
}
