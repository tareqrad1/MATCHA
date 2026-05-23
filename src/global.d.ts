import type Lenis from 'lenis';

declare global {
  interface Window {
    /** The active Lenis instance, exposed by useLenis for scrollTo helpers. */
    __lenis?: Lenis;
  }
}

export {};
