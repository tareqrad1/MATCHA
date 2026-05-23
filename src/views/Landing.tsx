'use client';

import { useEffect, useRef, useState } from 'react';
import { useLenis } from '@/hooks/useLenis';
import { FrameSequence } from '@/lib/preloader';
import { FRAME_COUNT, INITIAL_FRAME_BATCH } from '@/lib/frames';
import { ScrollTrigger } from '@/lib/gsap';

import { hasSeenIntro, markIntroSeen } from '@/lib/introGate';
import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/sections/Hero';
import ScrollSequence from '@/sections/ScrollSequence';
import Manifesto from '@/sections/Manifesto';
import Experience from '@/sections/Experience';
import StoreGallery from '@/sections/StoreGallery';
import CallToAction from '@/sections/CallToAction';

/** The cinematic landing page (route: "/"). */
export default function Landing() {
  // Splash plays only once per browser session. On return visits the intro is
  // already "done": the hero animates in immediately and no Loader mounts.
  const seen = hasSeenIntro();
  const [sequence, setSequence] = useState<FrameSequence | null>(null);
  const [firstBatchReady, setFirstBatchReady] = useState(false);
  const [intro, setIntro] = useState(seen); // hero may animate in (curtain lifted)
  const seqRef = useRef<FrameSequence | null>(null);

  // Smooth scroll is held until the intro starts so users can't scroll past
  // the hero before it has revealed.
  useLenis(intro);

  // Stream the image sequence. Only the first small batch gates the splash;
  // the rest loads in the background and buffers ahead of the scroll position.
  useEffect(() => {
    const seq = new FrameSequence(FRAME_COUNT, INITIAL_FRAME_BATCH);
    seqRef.current = seq;
    setSequence(seq);
    seq.start(() => setFirstBatchReady(true));
    return () => seq.destroy();
  }, []);

  // Once the opening frames exist & sections mount, refresh ScrollTrigger.
  useEffect(() => {
    if (firstBatchReady) {
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(id);
    }
  }, [firstBatchReady]);

  return (
    <>
      {!seen && (
        <Loader
          ready={firstBatchReady}
          onComplete={() => {
            markIntroSeen();
            setIntro(true);
          }}
        />
      )}

      <Navbar />

      <main>
        <Hero intro={intro} />
        <ScrollSequence sequence={sequence} />
        <Manifesto />
        <Experience />
        <StoreGallery />
        <CallToAction />
      </main>

      <Footer />
    </>
  );
}
