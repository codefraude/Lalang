"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { Earth } from "@/components/island/webgl/earth";

/** The orbit stop: the real Earth with the Mauritius pin. Auto-rotates, and on
 *  a fine pointer you can grab and spin it (with inertia). Rotating the globe —
 *  not the camera — so it never fights the scroll-driven journey. Hidden once
 *  the descent fog swallows it. */
export function EarthStop({ progress }: { progress: MotionValue<number> }) {
  const ref = React.useRef<THREE.Group>(null);
  const { gl } = useThree();
  const drag = React.useRef({ active: false, lastX: 0, lastY: 0, velY: 0, velX: 0 });
  const fine = React.useRef(false);

  React.useEffect(() => {
    fine.current = window.matchMedia("(pointer: fine)").matches;
    if (!fine.current) return;
    const el = gl.domElement;
    el.style.cursor = "grab";
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.active || !ref.current) return;
      d.velY = (e.clientX - d.lastX) * 0.005;
      d.velX = (e.clientY - d.lastY) * 0.005;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      ref.current.rotation.y += d.velY;
      ref.current.rotation.x = THREE.MathUtils.clamp(ref.current.rotation.x + d.velX, -0.6, 0.6);
    };
    const onUp = () => {
      drag.current.active = false;
      el.style.cursor = "grab";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.style.cursor = "";
    };
  }, [gl]);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!fine.current) return;
    drag.current = { active: true, lastX: e.clientX, lastY: e.clientY, velY: 0, velX: 0 };
    gl.domElement.style.cursor = "grabbing";
  };

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    g.visible = progress.get() < 0.58;
    if (!drag.current.active) {
      g.rotation.y += delta * 0.06 + drag.current.velY;
      g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + drag.current.velX, -0.6, 0.6);
      drag.current.velY *= 0.92;
      drag.current.velX *= 0.92;
    }
  });

  return (
    <group ref={ref} onPointerDown={onPointerDown}>
      <Earth progress={progress} />
    </group>
  );
}
