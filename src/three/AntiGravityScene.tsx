'use client';

import { Suspense, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';

import Lighting from './Lighting';
import MatchaCup from './MatchaCup';
import IceCube from './IceCube';
import Droplets from './Droplets';
import Particles from './Particles';
import { useMousePosition, type MousePos } from '@/hooks/useMousePosition';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface RigProps {
  mouse: MutableRefObject<MousePos>;
}

/** Slow cinematic camera drift + gentle parallax toward the cursor. */
function CameraRig({ mouse }: RigProps) {
  const { camera } = useThree();
  const base = useRef(new THREE.Vector3(0, 0.5, 9));

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const targetX = base.current.x + Math.sin(t * 0.12) * 0.6 + mouse.current.x * 0.8;
    const targetY = base.current.y + Math.cos(t * 0.1) * 0.3 + mouse.current.y * 0.5;
    camera.position.x += (targetX - camera.position.x) * (1 - Math.pow(0.01, delta));
    camera.position.y += (targetY - camera.position.y) * (1 - Math.pow(0.01, delta));
    camera.lookAt(0, 0.3, 0);
  });
  return null;
}

/** The orbiting ice ring — varied radii / phases / sizes for a natural cluster. */
function IceField({ count = 8 }: { count?: number }) {
  const cubes = Array.from({ length: count }, (_, i) => {
    const phase = (i / count) * Math.PI * 2;
    const spin: [number, number, number] = [0.3 + i * 0.05, 0.2 + i * 0.03, 0.15];
    return (
      <IceCube
        key={i}
        phase={phase}
        radius={2 + (i % 3) * 0.5}
        height={(i % 2 === 0 ? 1 : -1) * (0.4 + (i % 4) * 0.3)}
        speed={0.18 + (i % 3) * 0.06}
        size={0.32 + (i % 4) * 0.08}
        bob={0.2 + (i % 3) * 0.12}
        spin={spin}
      />
    );
  });
  return <group>{cubes}</group>;
}

export default function AntiGravityScene({ className = '' }: { className?: string }) {
  const mouse = useMousePosition();
  const isMobile = useIsMobile();

  return (
    <div className={className}>
      <Canvas
        shadows
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        camera={{ position: [0, 0.5, 9], fov: 42 }}
      >
        {/* depth fog dissolves objects into the black void; the canvas itself
            stays transparent (alpha) so the bg.png plate shows through behind
            the floating cup, ice and particles. */}
        <fog attach="fog" args={['#0c120d', 8, 18]} />

        <Suspense fallback={null}>
          <Lighting mouse={mouse} />
          <CameraRig mouse={mouse} />

          <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
            <MatchaCup />
          </Float>

          <IceField count={isMobile ? 5 : 8} />
          <Droplets count={isMobile ? 18 : 40} />
          <Particles count={isMobile ? 280 : 700} />

          <Environment preset="night" />
        </Suspense>

        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}
