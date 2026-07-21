import * as THREE from "three";

/**
 * Data-driven journey waypoints. The whole cinematic is interpolated from this
 * config — camera pose, fog and sky per stop — so adding a stop is a data edit.
 * Phase 1 ships the first three: Orbit → Descent → Lagoon.
 */
export interface Stop {
  id: string;
  at: number; // scroll progress 0..1
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  fog: string;
  fogDensity: number;
  skyTop: string;
  skyBottom: string;
}

export const STOPS: Stop[] = [
  { id: "orbit", at: 0.0, pos: [0, 0, 3.4], look: [0, 0, 0], fov: 45, fog: "#020617", fogDensity: 0.008, skyTop: "#020617", skyBottom: "#0a1a3a" },
  { id: "descent", at: 0.5, pos: [0, 0.4, 1.35], look: [0, -0.15, 0], fov: 68, fog: "#1f8fd0", fogDensity: 0.32, skyTop: "#0a3a6b", skyBottom: "#00a6c9" },
  { id: "lagoon", at: 1.0, pos: [0, 0.5, 3.8], look: [0, 0.3, -4], fov: 55, fog: "#00b4d8", fogDensity: 0.06, skyTop: "#5cc6ea", skyBottom: "#f4d6a0" },
];

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _la = new THREE.Vector3();
const _lb = new THREE.Vector3();
const _c1 = new THREE.Color();
const _c2 = new THREE.Color();
const _s1 = new THREE.Color();
const _s2 = new THREE.Color();
const _s3 = new THREE.Color();
const _s4 = new THREE.Color();

export interface EvalResult {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  fog: THREE.Color;
  fogDensity: number;
  skyTop: THREE.Color;
  skyBottom: THREE.Color;
}

const out: EvalResult = {
  pos: new THREE.Vector3(),
  look: new THREE.Vector3(),
  fov: 45,
  fog: new THREE.Color(),
  fogDensity: 0,
  skyTop: new THREE.Color(),
  skyBottom: new THREE.Color(),
};

/** Interpolate the journey state at scroll progress `p` (mutates a shared result). */
export function evalStops(p: number): EvalResult {
  const c = Math.max(0, Math.min(1, p));
  let i = 0;
  for (let k = 0; k < STOPS.length - 1; k++) if (c >= STOPS[k].at) i = k;
  const a = STOPS[i];
  const b = STOPS[Math.min(i + 1, STOPS.length - 1)];
  const span = b.at - a.at || 1;
  const t = easeInOut(Math.max(0, Math.min(1, (c - a.at) / span)));

  out.pos.lerpVectors(_a.fromArray(a.pos), _b.fromArray(b.pos), t);
  out.look.lerpVectors(_la.fromArray(a.look), _lb.fromArray(b.look), t);
  out.fov = a.fov + (b.fov - a.fov) * t;
  out.fog.lerpColors(_c1.set(a.fog), _c2.set(b.fog), t);
  out.fogDensity = a.fogDensity + (b.fogDensity - a.fogDensity) * t;
  out.skyTop.lerpColors(_s1.set(a.skyTop), _s2.set(b.skyTop), t);
  out.skyBottom.lerpColors(_s3.set(a.skyBottom), _s4.set(b.skyBottom), t);
  return out;
}
