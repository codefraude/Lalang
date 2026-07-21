"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { CameraRig } from "@/components/island/journey/camera-rig";
import { GradientSky } from "@/components/island/journey/gradient-sky";
import { EarthStop } from "@/components/island/journey/earth-stop";
import { Lagoon } from "@/components/island/journey/lagoon";

/** The ONE persistent scroll-driven canvas for the whole journey. Lazy-loaded on
 *  the landing only; camera + fog are owned by the scroll progress. */
export default function JourneyCanvas({ progress }: { progress: MotionValue<number> }) {
  const [dpr, setDpr] = React.useState<[number, number]>([1, 2]);
  React.useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) setDpr([1, 1.5]);
  }, []);

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 3.4], fov: 45 }}
      dpr={dpr}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={2.1} />
      <GradientSky progress={progress} />
      <Stars radius={26} depth={18} count={2000} factor={3.5} saturation={0} fade speed={0.4} />
      <Sparkles count={45} scale={7} size={2.4} speed={0.3} color="#bfeaff" opacity={0.5} />
      <React.Suspense fallback={null}>
        <EarthStop progress={progress} />
      </React.Suspense>
      <Lagoon progress={progress} />
      <CameraRig progress={progress} />
    </Canvas>
  );
}
