'use client';

import { useEffect, useRef, type ElementType } from 'react';
import { gsap } from '@/lib/gsap';

interface AnimatedTextProps {
  as?: ElementType;
  text: string;
  className?: string;
  delay?: number;
  start?: string;
}

/**
 * Cinematic text reveal. Splits children into words → letters and animates
 * each letter from blurred / lifted / transparent into sharp focus with a
 * stagger, triggered when the line scrolls into view.
 */
export default function AnimatedText({
  as: Tag = 'h2',
  text,
  className = '',
  delay = 0,
  start = 'top 82%',
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const letters = el.querySelectorAll('[data-letter]');
    if (!letters.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set(letters, { opacity: 1, y: 0, filter: 'blur(0px)' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(letters, {
        opacity: 0,
        yPercent: 120,
        filter: 'blur(12px)',
        willChange: 'transform, opacity, filter',
      });
      gsap.to(letters, {
        opacity: 1,
        yPercent: 0,
        filter: 'blur(0px)',
        duration: 1.1,
        ease: 'power3.out',
        delay,
        stagger: { each: 0.028, from: 'start' },
        scrollTrigger: { trigger: el, start, once: true },
        // Drop the compositor hint once revealed so idle headlines don't pin
        // a layer for the whole session.
        onComplete: () => gsap.set(letters, { willChange: 'auto' }),
      });
    }, el);

    return () => ctx.revert();
  }, [delay, start, text]);

  const words = String(text).split(' ');

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span
          key={wi}
          className="inline-block overflow-hidden align-top"
          aria-hidden="true"
        >
          {word.split('').map((char, ci) => (
            <span
              key={ci}
              data-letter
              className="inline-block"
              style={{ transformOrigin: 'bottom' }}
            >
              {char}
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
