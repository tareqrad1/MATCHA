import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MutableRefObject } from 'react';
import type { MousePos } from '@/hooks/useMousePosition';

interface LightingProps {
  mouse: MutableRefObject<MousePos>;
}

/**
 * Cinematic studio lighting. A cool ambient base, a warm-neutral key light
 * that tracks the cursor (mouse-reactive lighting), a matcha rim/back light
 * for the neon edge glow, and a soft fill.
 */
export default function Lighting({ mouse }: LightingProps) {
  const key = useRef<THREE.PointLight>(null);
  const target = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!key.current || !mouse) return;
    const { x, y } = mouse.current;
    // Ease the key light toward a position offset by the pointer.
    target.current.set(x * 6, 3 + y * 3, 6);
    key.current.position.lerp(target.current, 1 - Math.pow(0.001, delta));
  });

  return (
    <>
      <ambientLight intensity={0.28} color="#8a9b6a" />

      {/* mouse-reactive key */}
      <pointLight
        ref={key}
        position={[3, 4, 6]}
        intensity={120}
        distance={30}
        color="#f4f1ea"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* matcha neon rim from behind */}
      <spotLight
        position={[-4, 2, -6]}
        angle={0.7}
        penumbra={1}
        intensity={140}
        distance={30}
        color="#5e7242"
      />

      {/* cool fill from below for the levitation read */}
      <pointLight position={[0, -4, 2]} intensity={30} distance={18} color="#3a4a2c" />

      {/* subtle top accent */}
      <directionalLight position={[0, 8, 2]} intensity={0.6} color="#c2c9a8" />
    </>
  );
}
