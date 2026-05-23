'use client';

import { useEffect, useState } from 'react';
import { useLenis } from '@/hooks/useLenis';
import { preloadImages } from '@/lib/preloader';
import { frameUrls } from '@/lib/frames';
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
  const [images, setImages] = useState<HTMLImageElement[] | null>(null);
  const [intro, setIntro] = useState(seen); // hero may animate in (curtain lifted)

  // Smooth scroll is held until the intro starts so users can't scroll past
  // the hero before it has revealed.
  useLenis(intro);

  // Preload the full image sequence invisibly underneath the splash. The
  // splash itself shows no %; `images != null` simply gates its final reveal.
  useEffect(() => {
    let cancelled = false;
    preloadImages(frameUrls).then((imgs) => {
      if (!cancelled) setImages(imgs);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Once frames exist & sections mount, refresh ScrollTrigger measurements.
  useEffect(() => {
    if (images) {
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(id);
    }
  }, [images]);

  return (
    <>
      {!seen && (
        <Loader
          ready={images != null}
          onComplete={() => {
            markIntroSeen();
            setIntro(true);
          }}
        />
      )}

      <Navbar />

      <main>
        <Hero intro={intro} />
        <ScrollSequence images={images} />
        <Manifesto />
        <Experience />
        <StoreGallery />
        <CallToAction />
      </main>

      <Footer />
    </>
  );
}
