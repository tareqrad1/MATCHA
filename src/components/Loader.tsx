'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Easing } from 'framer-motion';

/**
 * Cinematic word-by-word splash screen.
 *
 * Big display words flash in sequence (blur → sharp, lift, glow) like the
 * opening title cards of a film, then a black curtain lifts into the hero.
 * No percentage counter — assets preload invisibly underneath.
 *
 * Timing model: the word reel plays on its own elegant cadence and HOLDS on
 * the final word until `ready` (real asset load) is true; only then does the
 * curtain lift. So fast connections still get the full filmic intro, and slow
 * ones simply dwell on the last card a beat longer — never a stalled %.
 */

interface LoaderProps {
  ready: boolean;
  onComplete: () => void;
}

const WORDS = ['Breathe.', 'Whisk.', 'Matcha.'];
const PER_WORD = 900; // ms each intermediate word holds on screen

const EASE: Easing = [0.16, 1, 0.3, 1];

export default function Loader({ ready, onComplete }: LoaderProps) {
  const [index, setIndex] = useState(0);
  const [lifted, setLifted] = useState(false);

  // Advance through the words; pause on the last until assets are ready.
  useEffect(() => {
    if (index < WORDS.length - 1) {
      const t = setTimeout(() => setIndex((i) => i + 1), PER_WORD);
      return () => clearTimeout(t);
    }
    // On the final word: wait for assets, then a short beat, then lift.
    if (ready) {
      const t = setTimeout(() => setLifted(true), 650);
      return () => clearTimeout(t);
    }
  }, [index, ready]);

  const isLast = index === WORDS.length - 1;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!lifted && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink"
          exit={{ y: '-100%' }}
          transition={{ duration: 1.05, ease: EASE }}
        >
          {/* atmospheric matcha bloom drifting behind the words */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[55vh] w-[55vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-matcha/12 blur-[120px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* corner brand mark — quiet, persistent */}
          <motion.div
            className="absolute left-6 top-6 flex items-center gap-2 md:left-10 md:top-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-matcha shadow-[0_0_12px_rgba(138,160,95,0.8)]" />
            <span className="font-display text-sm font-medium uppercase tracking-[0.3em] text-cream/80">
              MATCHA
            </span>
          </motion.div>

          {/* the word reel */}
          <div className="relative flex h-[1.1em] items-center justify-center px-6">
            <AnimatePresence mode="wait">
              <motion.h1
                key={index}
                className={`display-line text-center text-[15vw] leading-none md:text-[9vw] ${
                  isLast ? 'text-matcha glow-text' : 'text-cream'
                }`}
                initial={{ opacity: 0, y: 40, filter: 'blur(18px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -40, filter: 'blur(18px)' }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                {WORDS[index]}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* thin breathing progress hairline — presence, not a number */}
          <motion.div
            className="absolute bottom-[14vh] left-1/2 h-px w-[42vw] max-w-xs -translate-x-1/2 overflow-hidden bg-white/8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <motion.span
              className="absolute inset-y-0 left-0 w-1/3 bg-matcha"
              style={{ boxShadow: '0 0 16px rgba(138,160,95,0.7)' }}
              animate={{ x: ['-120%', '380%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
