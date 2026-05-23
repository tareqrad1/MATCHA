import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural ceramic cup with a glowing matcha surface, levitating and
 * rotating slowly at the center of the scene. Built from lathe + cylinder
 * primitives so no external model download is required.
 */
export default function MatchaCup() {
  const group = useRef<THREE.Group>(null);

  // Lathe profile for the cup body (x = radius, y = height).
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= 12; i++) {
    const v = i / 12;
    const y = v * 1.5 - 0.75;
    // gentle taper, wider at the rim
    const r = 0.62 + Math.sin(v * Math.PI * 0.5) * 0.18;
    points.push(new THREE.Vector2(r, y));
  }

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.rotation.y = t * 0.15;
    group.current.position.y = Math.sin(t * 0.5) * 0.12;
  });

  return (
    <group ref={group}>
      {/* ceramic body */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 64]} />
        <meshStandardMaterial
          color="#e7e1d3"
          roughness={0.55}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* matcha liquid surface, emissive so it glows from inside */}
      <mesh position={[0, 0.58, 0]}>
        <circleGeometry args={[0.74, 48]} />
        <meshStandardMaterial
          color="#8aa05f"
          emissive="#5e7242"
          emissiveIntensity={1.1}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>

      {/* handle */}
      <mesh position={[0.82, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.32, 0.07, 16, 48, Math.PI * 1.2]} />
        <meshStandardMaterial color="#e7e1d3" roughness={0.55} metalness={0.05} />
      </mesh>
    </group>
  );
}
