"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { Earth } from "@/components/island/webgl/earth";

export default function HeroCanvas() {
  // Drag-to-rotate on mouse; on touch we leave rotation off so the page can
  // still be scrolled by swiping over the hero.
  const [finePointer, setFinePointer] = React.useState(false);
  React.useEffect(() => {
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0.2, 3.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 3, 5]} intensity={2.1} />
      <Stars radius={80} depth={45} count={2600} factor={4} saturation={0} fade speed={0.5} />
      <Sparkles count={60} scale={7} size={2.5} speed={0.3} color="#00d4ff" opacity={0.6} />

      <React.Suspense fallback={null}>
        <group position={[0, 0.2, 0]}>
          <Earth />
        </group>
      </React.Suspense>

      <OrbitControls
        target={[0, 0.2, 0]}
        enablePan={false}
        enableZoom={false}
        enableRotate={finePointer}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        autoRotate
        autoRotateSpeed={0.45}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.8}
      />
    </Canvas>
  );
}
