import * as THREE from "three";

/** Texture-free lagoon: summed directional sine waves + a fresnel sky reflection
 *  and a smoothstep foam highlight on the crests. */
const vertex = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vH;
  float wave(vec2 p, vec2 dir, float freq, float speed, float amp) {
    return amp * sin(dot(dir, p) * freq + uTime * speed);
  }
  void main() {
    vec3 pos = position;
    float h = 0.0;
    h += wave(pos.xy, normalize(vec2(1.0, 0.3)), 1.1, 0.8, 0.11);
    h += wave(pos.xy, normalize(vec2(-0.4, 1.0)), 2.0, 1.1, 0.055);
    h += wave(pos.xy, normalize(vec2(0.7, -0.8)), 3.2, 1.6, 0.028);
    pos.z += h;
    vH = h;
    vec4 wp = modelMatrix * vec4(pos, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uSky;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying float vH;
  void main() {
    float fres = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 3.0);
    vec3 col = mix(uDeep, uShallow, clamp(vH * 3.0 + 0.5, 0.0, 1.0));
    col = mix(col, uSky, fres * 0.75);
    float foam = smoothstep(0.13, 0.19, vH);
    col = mix(col, vec3(0.92, 0.98, 1.0), foam * 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createWaterMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#023a54") },
      uShallow: { value: new THREE.Color("#00b4d8") },
      uSky: { value: new THREE.Color("#cfeeff") },
    },
  });
}
