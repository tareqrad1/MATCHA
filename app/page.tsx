'use client';

import dynamic from 'next/dynamic';

// The landing page is entirely animation/3D-driven (Three.js, GSAP, Lenis),
// so it must run only on the client. ssr:false guarantees no SSR execution.
const Landing = dynamic(() => import('@/views/Landing'), { ssr: false });

export default function HomePage() {
  return <Landing />;
}
