import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DropletsProps {
  count?: number;
}

/**
 * Suspended liquid droplets — small instanced glossy matcha spheres that
 * levitate and drift, reinforcing the calm, suspended feel around the cup.
 */
export default function Droplets({ count = 40 }: DropletsProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        r: 1.4 + Math.random() * 2.6,
        a: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 3.5,
        speed: 0.05 + Math.random() * 0.18,
        bob: 0.3 + Math.random() * 0.5,
        s: 0.03 + Math.random() * 0.07,
        phase: Math.random() * Math.PI * 2,
      })),
    [count]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const inst = ref.current;
    if (!inst) return;
    seeds.forEach((d, i) => {
      const a = d.a + t * d.speed;
      dummy.position.set(
        Math.cos(a) * d.r,
        d.y + Math.sin(t * 0.5 + d.phase) * d.bob,
        Math.sin(a) * d.r
      );
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color="#8aa05f"
        emissive="#5e7242"
        emissiveIntensity={0.35}
        roughness={0.15}
        metalness={0.1}
      />
    </instancedMesh>
  );
}
