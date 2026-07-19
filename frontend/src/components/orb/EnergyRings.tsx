"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbState } from "@/lib/types";

interface RingProps {
  radius: number;
  axis: [number, number, number];
  speed: number;
  color: string;
  active: boolean;
  amplitude: number;
}

function Ring({ radius, axis, speed, color, active, amplitude }: RingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const axisVec = useRef(new THREE.Vector3(...axis).normalize());

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    mesh.rotateOnAxis(axisVec.current, delta * speed);

    const targetOpacity = active ? 0.3 + amplitude * 0.45 : 0.06;
    material.opacity += (targetOpacity - material.opacity) * 0.08;

    const targetScale = active ? 1 + amplitude * 0.35 : 1;
    const nextScale = mesh.scale.x + (targetScale - mesh.scale.x) * 0.08;
    mesh.scale.setScalar(nextScale);
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[radius, 0.006, 16, 128]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

interface EnergyRingsProps {
  state: OrbState;
  amplitude: number;
  color: string;
}

export function EnergyRings({ state, amplitude, color }: EnergyRingsProps) {
  const active = state === "speaking" || state === "listening";
  return (
    <group>
      <Ring radius={1.55} axis={[1, 0.3, 0]} speed={0.4} color={color} active={active} amplitude={amplitude} />
      <Ring radius={1.85} axis={[0, 1, 0.4]} speed={-0.25} color={color} active={active} amplitude={amplitude} />
      <Ring radius={2.15} axis={[0.5, 0.2, 1]} speed={0.15} color={color} active={state === "speaking"} amplitude={amplitude} />
    </group>
  );
}
