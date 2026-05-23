'use client';

import dynamic from 'next/dynamic';

// The cart uses Framer Motion + cart context (localStorage); render client-only.
const Cart = dynamic(() => import('@/views/Cart'), { ssr: false });

export default function CartPage() {
  return <Cart />;
}
