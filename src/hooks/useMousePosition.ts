import { useEffect, useRef, type MutableRefObject } from 'react';

export interface MousePos {
  x: number;
  y: number;
}

/**
 * Tracks the pointer as normalized coordinates without re-rendering.
 * Returns a ref: { x, y } in [-1, 1], origin at viewport center.
 * Read it inside a RAF / useFrame loop for mouse-reactive lighting & parallax.
 */
export function useMousePosition(): MutableRefObject<MousePos> {
  const pos = useRef<MousePos>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pos.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return pos;
}
