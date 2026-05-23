// Single GSAP + ScrollTrigger registration point.
// Import { gsap, ScrollTrigger } from here everywhere else.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registration is a no-op on the server; all consumers are client-only.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // Quietly drop will-change after tweens so the compositor isn't held hostage.
  gsap.config({ autoSleep: 60, nullTargetWarn: false });
}

export { gsap, ScrollTrigger };
