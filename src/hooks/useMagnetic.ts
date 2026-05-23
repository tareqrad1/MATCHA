import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from '@/lib/gsap';

interface MagneticOptions {
  strength?: number;
  damping?: number;
}

/**
 * Magnetic hover: the element eases toward the cursor while hovered and
 * springs back on leave. Returns a ref to attach to the target element.
 * `strength` scales the pull; `damping` is the quickTo smoothing.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>({
  strength = 0.4,
  damping = 0.6,
}: MagneticOptions = {}): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

    const xTo = gsap.quickTo(el, 'x', { duration: damping, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: damping, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - (r.left + r.width / 2);
      const relY = e.clientY - (r.top + r.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength, damping]);

  return ref;
}
