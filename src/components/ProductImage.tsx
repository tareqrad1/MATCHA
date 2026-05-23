'use client';

import { useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt?: string;
  accent?: string;
  className?: string;
  label?: string;
}

/**
 * Renders a product photo, gracefully degrading to a premium placeholder if
 * the file isn't present yet. The placeholder is a tinted matcha gradient
 * orb + glow + initial, so the store looks intentional before real photos
 * are dropped into /public/products.
 */
export default function ProductImage({
  src,
  alt = '',
  accent = '#8aa05f',
  className = '',
  label,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden ${className}`}
        style={{
          background:
            'radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.05), transparent 60%), #0a0a0a',
        }}
        aria-label={alt}
      >
        {/* tinted orb */}
        <div
          className="absolute h-1/2 w-1/2 rounded-full blur-2xl opacity-60"
          style={{ background: accent }}
        />
        <div
          className="absolute h-1/3 w-1/3 rounded-full blur-md opacity-40"
          style={{ background: accent }}
        />
        {/* caption */}
        <div className="relative z-10 text-center">
          <span
            className="font-display text-4xl font-semibold"
            style={{ color: accent }}
          >
            {(label || alt || '?').charAt(0)}
          </span>
          <span className="mt-2 block font-sans text-[0.6rem] uppercase tracking-widest2 text-white/30">
            Add photo
          </span>
        </div>
        {/* subtle grain edge */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
