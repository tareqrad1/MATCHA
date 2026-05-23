import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
}

/**
 * Floating energy particles — a soft additive point cloud filling the volume
 * with slow upward drift. Gives the scene atmosphere and depth haze.
 */
export default function Particles({ count = 700 }: ParticlesProps) {
  const points = useRef<THREE.Points>(null);
  const ref = useRef<THREE.BufferGeometry>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      speeds[i] = 0.1 + Math.random() * 0.4;
    }
    return { positions, speeds };
  }, [count]);

  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(220,226,200,1)');
    g.addColorStop(0.3, 'rgba(138,160,95,0.55)');
    g.addColorStop(1, 'rgba(138,160,95,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state, delta) => {
    const geo = ref.current;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * 0.6;
      if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = -6; // recycle to bottom
    }
    geo.attributes.position.needsUpdate = true;
    if (points.current) points.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={points}>
      <bufferGeometry ref={ref}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        map={tex}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}
