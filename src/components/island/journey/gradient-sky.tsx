"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { evalStops } from "@/components/island/journey/stops";

const vertex = /* glsl */ `
  varying vec3 vP;
  void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragment = /* glsl */ `
  varying vec3 vP;
  uniform vec3 uTop;
  uniform vec3 uBottom;
  void main() {
    float h = normalize(vP).y * 0.5 + 0.5;
    gl_FragColor = vec4(mix(uBottom, uTop, smoothstep(0.0, 1.0, h)), 1.0);
  }
`;

/** A large inside-out sphere whose gradient lerps with the journey palette. */
export function GradientSky({ progress }: { progress: MotionValue<number> }) {
  const mat = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uTop: { value: new THREE.Color("#020617") }, uBottom: { value: new THREE.Color("#0a1a3a") } },
      }),
    [],
  );

  useFrame(() => {
    const e = evalStops(progress.get());
    mat.uniforms.uTop.value.copy(e.skyTop);
    mat.uniforms.uBottom.value.copy(e.skyBottom);
  });

  React.useEffect(() => () => mat.dispose(), [mat]);

  return (
    <mesh scale={60} material={mat} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 32]} />
    </mesh>
  );
}
