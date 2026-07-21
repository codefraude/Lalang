"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { createWaterMaterial } from "@/components/island/webgl/shaders/gerstner-water";

/** The lagoon stop: an animated Gerstner-ish water plane, revealed as the
 *  descent lands. Only rendered in the back half of the scroll. */
export function Lagoon({ progress }: { progress: MotionValue<number> }) {
  const mat = React.useMemo(() => createWaterMaterial(), []);
  const ref = React.useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    mat.uniforms.uTime.value += delta;
    if (ref.current) ref.current.visible = progress.get() > 0.4;
  });

  React.useEffect(() => () => mat.dispose(), [mat]);

  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, -0.6, 0]} material={mat} visible={false}>
      <planeGeometry args={[80, 80, 180, 180]} />
    </mesh>
  );
}
