'use client';

import type { ReactNode } from 'react';
import { useMagnetic } from '@/hooks/useMagnetic';

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'solid' | 'ghost';
}

/**
 * Magnetic CTA. Outer element follows the cursor (useMagnetic); an inner
 * label counter-eases slightly for depth. Matcha glow ring on hover.
 */
export default function MagneticButton({
  children,
  onClick,
  className = '',
  variant = 'solid',
}: MagneticButtonProps) {
  const ref = useMagnetic<HTMLButtonElement>({ strength: 0.45, damping: 0.7 });

  const base =
    'group relative inline-flex items-center justify-center rounded-full px-9 py-4 font-sans text-sm font-medium tracking-wide transition-colors duration-500 ease-cinema';
  const styles =
    variant === 'solid'
      ? 'bg-matcha text-ink hover:bg-matcha/90'
      : 'border border-white/20 text-cream hover:border-matcha/70';

  return (
    <button ref={ref} onClick={onClick} className={`${base} ${styles} ${className}`}>
      <span
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: '0 0 40px rgba(138,160,95,0.5)' }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
