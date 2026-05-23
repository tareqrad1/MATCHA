import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import FontshareDisplay from './FontshareDisplay';

// Inter is self-hosted and subset by next/font — no render-blocking request,
// no layout shift, served from our own origin. Exposed as a CSS variable so
// Tailwind's `font-sans` resolves to it.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MATCHA — A Quiet Ritual',
  description:
    'MATCHA — ceremonial-grade matcha, served cold. A quiet ritual of purity, taste and calm.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0c120d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preload the hero LCP plate so first paint isn't gated on discovery. */}
        <link rel="preload" as="image" href="/bg.webp" fetchPriority="high" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Display type (General Sans / Satoshi) loaded non-render-blocking. */}
        <FontshareDisplay />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
