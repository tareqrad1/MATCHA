'use client';

import { CartProvider } from '@/context/CartContext';
import CartToast from '@/components/CartToast';

/**
 * Client-side app providers. Wraps every route in the cart store and mounts
 * the global "added to bag" toast once near the root.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartToast />
    </CartProvider>
  );
}
