"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { evalStops } from "@/components/island/journey/stops";

/** Drives camera pose + scene fog from the (spring-smoothed) scroll progress.
 *  All mutation on the live objects in useFrame — no per-frame React state. */
export function CameraRig({ progress }: { progress: MotionValue<number> }) {
  const { camera, scene } = useThree();

  React.useEffect(() => {
    scene.fog = new THREE.FogExp2("#020617", 0.008);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const e = evalStops(progress.get());
    camera.position.copy(e.pos);
    camera.lookAt(e.look);
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(cam.fov - e.fov) > 0.01) {
      cam.fov = e.fov;
      cam.updateProjectionMatrix();
    }
    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog) {
      fog.color.copy(e.fog);
      fog.density = e.fogDensity;
    }
  });

  return null;
}
