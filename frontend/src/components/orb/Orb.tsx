"use client";

import { Canvas } from "@react-three/fiber";
import { OrbMesh } from "./OrbMesh";
import { EnergyRings } from "./EnergyRings";
import { ParticleField } from "./ParticleField";
import type { OrbState } from "@/lib/types";

interface OrbProps {
  state: OrbState;
  amplitude: number;
  color?: string;
  speed?: number;
  size?: number;
}

export function Orb({ state, amplitude, color = "#00d9ff", speed = 1, size = 360 }: OrbProps) {
  return (
    <div style={{ width: size, height: size }} className="relative select-none">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <OrbMesh state={state} amplitude={amplitude} color={color} speed={speed} />
        <EnergyRings state={state} amplitude={amplitude} color={color} />
        <ParticleField state={state} amplitude={amplitude} color={color} />
      </Canvas>
    </div>
  );
}
