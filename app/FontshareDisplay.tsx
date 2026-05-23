'use client';

import { useEffect } from 'react';

const HREF =
  'https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&f[]=satoshi@400,500,700&display=swap';

/**
 * Loads the Fontshare display fonts (General Sans / Satoshi) without blocking
 * first paint. Fontshare isn't on Google Fonts, so it can't go through
 * next/font; instead we inject the stylesheet after mount. Body text (Inter,
 * self-hosted via next/font) renders immediately; the display face swaps in a
 * beat later via the CSS fallback stack — no blank text, no blocked paint.
 */
export default function FontshareDisplay() {
  useEffect(() => {
    if (document.querySelector(`link[href="${HREF}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = HREF;
    document.head.appendChild(link);
  }, []);

  return null;
}
