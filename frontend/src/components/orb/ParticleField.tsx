"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbState } from "@/lib/types";

const PARTICLE_COUNT = 360;

interface ParticleFieldProps {
  state: OrbState;
  amplitude: number;
  color: string;
}

export function ParticleField({ state, amplitude, color }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 1.8 + Math.random() * 1.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!points || !material) return;

    points.rotation.y += delta * 0.04;
    points.rotation.x += delta * 0.01;

    const targetScale = state === "listening" ? 1.3 + amplitude * 0.3 : state === "speaking" ? 1.12 + amplitude * 0.2 : 1;
    const nextScale = points.scale.x + (targetScale - points.scale.x) * 0.06;
    points.scale.setScalar(nextScale);

    const targetOpacity = state === "idle" ? 0.22 : 0.55;
    material.opacity += (targetOpacity - material.opacity) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.018}
        color={color}
        transparent
        opacity={0.22}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
