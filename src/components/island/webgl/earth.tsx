"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion";

const R = 1;

/** Lat/Lng → point on the sphere matching an equirectangular texture. */
function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Mauritius ≈ 20.35°S, 57.55°E.
const MAURITIUS = latLngToVec3(-20.35, 57.55, R);

export function Earth({ progress }: { progress?: MotionValue<number> }) {
  const [day, clouds] = useTexture(["/textures/earth-day.jpg", "/textures/earth-clouds.png"]);
  day.colorSpace = THREE.SRGBColorSpace;
  const cloudsRef = React.useRef<THREE.Mesh>(null);
  const pinRef = React.useRef<THREE.Mesh>(null);

  // Hide the pin/label once we've dived past the globe (avoids it lingering).
  const fallback = useMotionValue(0);
  const mv = progress ?? fallback;
  const [showPin, setShowPin] = React.useState(true);
  useMotionValueEvent(mv, "change", (v) => {
    const next = v < 0.42;
    setShowPin((prev) => (prev === next ? prev : next));
  });

  // Rotate the globe so Mauritius greets the viewer, tilted slightly up.
  const quaternion = React.useMemo(() => {
    const from = MAURITIUS.clone().normalize();
    const to = new THREE.Vector3(0.12, 0.12, 1).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(from, to);
    return [q.x, q.y, q.z, q.w] as [number, number, number, number];
  }, []);

  useFrame((state, delta) => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.012;
    if (pinRef.current) pinRef.current.scale.setScalar(0.85 + 0.25 * Math.sin(state.clock.elapsedTime * 2.2));
  });

  return (
    <group quaternion={quaternion}>
      <mesh>
        <sphereGeometry args={[R, 96, 96]} />
        <meshStandardMaterial map={day} roughness={0.95} metalness={0} />
      </mesh>

      <mesh ref={cloudsRef} scale={1.006}>
        <sphereGeometry args={[R, 64, 64]} />
        <meshBasicMaterial map={clouds} transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {showPin && (
        <group position={MAURITIUS.clone().multiplyScalar(1.008).toArray()}>
          <mesh ref={pinRef}>
            <sphereGeometry args={[0.022, 14, 14]} />
            <meshBasicMaterial color="#FF8C42" toneMapped={false} />
          </mesh>
          <Html center distanceFactor={6} occlude style={{ pointerEvents: "none" }}>
            <div className="flex -translate-y-5 items-center gap-1 whitespace-nowrap rounded-full bg-[#FF8C42] px-2 py-0.5 text-[10px] font-semibold text-[#02121f] shadow-lg ring-2 ring-[#FF8C42]/30">
              🇲🇺 Mauritius
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
