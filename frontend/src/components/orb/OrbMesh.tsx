"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ORB_FRAGMENT_SHADER, ORB_VERTEX_SHADER } from "./orbShaders";
import type { OrbState } from "@/lib/types";

interface OrbMeshProps {
  state: OrbState;
  amplitude: number;
  color: string;
  speed: number;
}

export function OrbMesh({ state, amplitude, color, speed }: OrbMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0 },
      uTurbulence: { value: 0.1 },
      uColor: { value: new THREE.Color(color) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    uniforms.uTime.value += delta * speed;

    const idleAmplitude = 0.06 + Math.sin(uniforms.uTime.value * 0.8) * 0.02;
    const targetAmplitude = state === "idle" ? idleAmplitude : amplitude;
    uniforms.uAmplitude.value += (targetAmplitude - uniforms.uAmplitude.value) * 0.15;

    const targetTurbulence = state === "listening" ? 0.22 : state === "speaking" ? 0.3 : state === "thinking" ? 0.18 : 0.1;
    uniforms.uTurbulence.value += (targetTurbulence - uniforms.uTurbulence.value) * 0.05;

    (uniforms.uColor.value as THREE.Color).set(color);

    const targetScale =
      state === "listening" ? 1.15 : state === "speaking" ? 1.08 + amplitude * 0.25 : state === "thinking" ? 1.04 : 1.0;
    const nextScale = mesh.scale.x + (targetScale - mesh.scale.x) * 0.1;
    mesh.scale.setScalar(nextScale);

    mesh.rotation.y += delta * 0.15 * speed;
    mesh.rotation.x = Math.sin(uniforms.uTime.value * 0.15) * 0.12;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 4]} />
      <shaderMaterial
        vertexShader={ORB_VERTEX_SHADER}
        fragmentShader={ORB_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
