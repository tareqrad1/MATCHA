'use client';

import Link from 'next/link';
import { motion, AnimatePresence, type Easing } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import ProductImage from '@/components/ProductImage';
import MagneticButton from '@/components/MagneticButton';
import FeaturedGrid from '@/components/FeaturedGrid';
import Footer from '@/components/Footer';

const EASE: Easing = [0.16, 1, 0.3, 1];
const money = (n: number): string => `$${n.toFixed(2)}`;

/* Slim header for the cart route (the landing Navbar depends on Lenis). */
function CartHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-lg font-semibold uppercase tracking-[0.3em] text-cream"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-matcha shadow-[0_0_12px_rgba(138,160,95,0.8)]" />
          MATCHA
        </Link>
        <Link
          href="/"
          className="font-sans text-sm font-light text-white/55 transition-colors duration-300 hover:text-matcha"
        >
          ← Continue shopping
        </Link>
      </nav>
    </header>
  );
}

interface QtyStepperProps {
  qty: number;
  onChange: (qty: number) => void;
}

/* Quantity stepper. */
function QtyStepper({ qty, onChange }: QtyStepperProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/15">
      <button
        onClick={() => onChange(qty - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-matcha disabled:opacity-30"
        disabled={qty <= 1}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-6 text-center font-sans text-sm tabular-nums text-cream">
        {qty}
      </span>
      <button
        onClick={() => onChange(qty + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-matcha"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="flex flex-col items-center justify-center rounded-3xl border border-white/8 bg-white/[0.02] py-24 text-center"
    >
      <div className="relative mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/10">
        <div className="absolute h-10 w-10 rounded-full bg-matcha/20 blur-xl" />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-matcha" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>
      <h2 className="font-display text-3xl font-semibold text-cream">
        Your bag is quiet.
      </h2>
      <p className="mt-3 max-w-sm font-sans text-sm font-light leading-relaxed text-white/45">
        Nothing here yet. Explore the collection and begin your ritual — every
        cup is made to be savoured slow.
      </p>
      <Link href="/" className="mt-9">
        <MagneticButton>Explore the Collection →</MagneticButton>
      </Link>
    </motion.div>
  );
}

export default function Cart() {
  const { items, lineCount, subtotal, setQty, remove, clear } = useCart();
  const shipping = items.length ? (subtotal >= 60 ? 0 : 6) : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-ink text-cream">
      <CartHeader />

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pt-20">
        {/* page title */}
        <div className="mb-12 flex flex-col gap-4 border-b border-white/8 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow mb-4 block">Your Bag</span>
            <h1 className="font-display text-5xl font-semibold leading-none text-cream md:text-7xl">
              Cart
            </h1>
          </div>
          <p className="font-sans text-sm font-light text-white/40">
            {lineCount} {lineCount === 1 ? 'item' : 'items'} · ceremonial-grade, served cold
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            {/* line items */}
            <div>
              <ul className="flex flex-col divide-y divide-white/8">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="flex gap-5 py-6 first:pt-0"
                    >
                      <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          accent={item.accent}
                          label={item.name}
                          className="h-full w-full"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-xl font-medium text-cream">
                              {item.name}
                            </h3>
                            <p className="mt-0.5 font-sans text-xs font-light text-white/40">
                              {money(item.price)} {item.unit}
                            </p>
                          </div>
                          <span className="font-display text-lg text-cream">
                            {money(item.price * item.qty)}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <QtyStepper qty={item.qty} onChange={(q) => setQty(item.id, q)} />
                          <button
                            onClick={() => remove(item.id)}
                            className="font-sans text-xs font-light text-white/35 transition-colors hover:text-matcha"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <button
                onClick={clear}
                className="mt-8 font-sans text-xs uppercase tracking-widest2 text-white/30 transition-colors hover:text-matcha"
              >
                Clear bag
              </button>
            </div>

            {/* order summary */}
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm">
                <h2 className="font-display text-lg font-medium text-cream">
                  Order Summary
                </h2>

                <dl className="mt-6 space-y-3 font-sans text-sm font-light">
                  <div className="flex justify-between text-white/55">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums text-cream">{money(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-white/55">
                    <dt>Shipping</dt>
                    <dd className="tabular-nums text-cream">
                      {shipping === 0 ? 'Free' : money(shipping)}
                    </dd>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-white/30">
                      Free shipping over $60 — you&rsquo;re {money(60 - subtotal)} away.
                    </p>
                  )}
                </dl>

                <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-5">
                  <span className="font-display text-base text-cream">Total</span>
                  <span className="font-display text-2xl text-cream tabular-nums">
                    {money(total)}
                  </span>
                </div>

                <div className="mt-7">
                  <MagneticButton className="w-full">Checkout →</MagneticButton>
                </div>
                <p className="mt-4 text-center font-sans text-[0.7rem] font-light text-white/30">
                  Taxes calculated at checkout · Secure payment
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* featured / upsell */}
        <FeaturedGrid excludeIds={items.map((i) => i.id)} />
      </main>

      <Footer />
    </div>
  );
}
