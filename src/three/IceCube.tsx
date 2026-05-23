import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface IceCubeProps {
  radius?: number;
  height?: number;
  speed?: number;
  phase?: number;
  size?: number;
  spin?: [number, number, number];
  bob?: number;
}

/**
 * A single levitating ice cube. Orbits the cup on its own radius/phase/speed
 * and tumbles slowly. Glass-like transmission material catches the matcha glow.
 */
export default function IceCube({
  radius = 2.2,
  height = 0,
  speed = 0.25,
  phase = 0,
  size = 0.45,
  spin = [0.2, 0.15, 0.1],
  bob = 0.25,
}: IceCubeProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const a = phase + t * speed;
    const m = ref.current;
    if (!m) return;
    m.position.x = Math.cos(a) * radius;
    m.position.z = Math.sin(a) * radius;
    m.position.y = height + Math.sin(t * 0.6 + phase) * bob;
    m.rotation.x += spin[0] * 0.01;
    m.rotation.y += spin[1] * 0.01;
    m.rotation.z += spin[2] * 0.01;
  });

  return (
    <mesh ref={ref} scale={size} castShadow>
      {/* slightly rounded cube reads as ice, not a dice */}
      <boxGeometry args={[1, 1, 1, 2, 2, 2]} />
      <MeshTransmissionMaterial
        transmission={1}
        thickness={0.6}
        roughness={0.08}
        ior={1.31}
        chromaticAberration={0.06}
        anisotropy={0.2}
        distortion={0.2}
        distortionScale={0.3}
        temporalDistortion={0.1}
        attenuationColor={new THREE.Color('#b9c79a')}
        attenuationDistance={2.5}
        color={'#eef0e4'}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}
