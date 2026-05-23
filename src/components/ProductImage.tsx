'use client';

import { useState } from 'react';
import Image from 'next/image';
import blurMap from '@/data/blur.json';

interface ProductImageProps {
  src?: string;
  alt?: string;
  accent?: string;
  className?: string;
  label?: string;
  /** Responsive sizes hint for next/image. Defaults to a card-ish width. */
  sizes?: string;
  /** Eager-load + high priority (use only for above-the-fold images). */
  priority?: boolean;
}

const BLUR: Record<string, string> = blurMap as Record<string, string>;

// Optimized siblings (.webp/.avif) live next to the original .png. We point
// next/image at the .webp; the loader still serves AVIF where the browser
// accepts it via the formats config. Falls back to the raw src otherwise.
const toWebp = (src: string) => src.replace(/\.png$/i, '.webp');

/**
 * Renders a product photo through next/image (responsive, lazy, format-
 * negotiated, blur-up). Gracefully degrades to a premium tinted placeholder
 * if the file isn't present, so the store looks intentional before real
 * photos are dropped into /public.
 */
export default function ProductImage({
  src,
  alt = '',
  accent = '#8aa05f',
  className = '',
  label,
  sizes = '(max-width: 768px) 100vw, 420px',
  priority = false,
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
        <div
          className="absolute h-1/2 w-1/2 rounded-full blur-2xl opacity-60"
          style={{ background: accent }}
        />
        <div
          className="absolute h-1/3 w-1/3 rounded-full blur-md opacity-40"
          style={{ background: accent }}
        />
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
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
      </div>
    );
  }

  const webp = toWebp(src);
  const blur = BLUR[webp];

  return (
    // The parent is always position-relative + sized, so `fill` matches the
    // old absolute-fill behaviour with zero layout shift.
    <Image
      src={webp}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      placeholder={blur ? 'blur' : 'empty'}
      blurDataURL={blur}
      className={`object-cover ${className}`}
    />
  );
}
