// Shaders.ts
import * as THREE from 'three'

export const GLSL_SIMPLEX_3D = /* glsl */`
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4  j  = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p, int octaves, float lacunarity, float gain) {
  float value     = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value     += amplitude * snoise(p * frequency);
    frequency *= lacunarity;
    amplitude *= gain;
  }
  return value;
}
`

export const liquidSphereVert = /* glsl */`
${GLSL_SIMPLEX_3D}

uniform float uTime;
uniform vec2  uMouse;
uniform float uScrollVel;
uniform float uDistortion;
uniform float uMouseRadius;

varying vec3  vNormal;
varying vec3  vPosition;
varying vec3  vWorldPosition;
varying float vNoise;
varying float vFresnel;

const float BASE_AMPLITUDE = 0.18;
const float NOISE_FREQ     = 1.4;
const float NOISE_SPEED    = 0.38;
const float MOUSE_STRENGTH = 0.28;

void main() {
  vec3 noisePos = position * NOISE_FREQ + vec3(uTime * NOISE_SPEED);
  float n0 = fbm(noisePos,               5, 2.0, 0.5);
  float n1 = fbm(noisePos * 2.1 + 3.7,  3, 2.0, 0.45);
  float n2 = snoise(noisePos * 4.3 - 1.2);
  float noise = n0 * 0.60 + n1 * 0.28 + n2 * 0.12;
  vNoise = noise;

  float scrollTurb = abs(uScrollVel) * 0.012;
  float turbNoise  = snoise(position * 3.0 + vec3(uTime * 2.0)) * scrollTurb;

  vec3 mouseDir = normalize(vec3(uMouse * 1.5, 1.0));
  float mdot    = dot(normalize(position), mouseDir);
  float mFalloff = smoothstep(0.0, 1.0, (mdot + 1.0) * 0.5);
  mFalloff = pow(mFalloff, 3.0);
  float mouseDent = mFalloff * MOUSE_STRENGTH;

  float totalDisplace = noise * BASE_AMPLITUDE + turbNoise - mouseDent + uDistortion * noise * 0.15;
  vec3 displaced = position + normal * totalDisplace;

  float epsilon  = 0.001;
  vec3 tangent   = normalize(cross(normal, vec3(0.0, 1.0, 0.0) + 0.0001));
  vec3 bitangent = normalize(cross(normal, tangent));
  vec3 pT = position + tangent   * epsilon;
  vec3 pB = position + bitangent * epsilon;
  float nT = fbm(pT * NOISE_FREQ + vec3(uTime * NOISE_SPEED), 5, 2.0, 0.5) * BASE_AMPLITUDE;
  float nB = fbm(pB * NOISE_FREQ + vec3(uTime * NOISE_SPEED), 5, 2.0, 0.5) * BASE_AMPLITUDE;
  vec3 dispT = pT + normal * nT;
  vec3 dispB = pB + normal * nB;
  vec3 computedNormal = normalize(cross(dispT - displaced, dispB - displaced));

  vec3 viewDir = normalize(cameraPosition - displaced);
  vFresnel     = pow(1.0 - max(dot(computedNormal, viewDir), 0.0), 4.0);

  vNormal        = computedNormal;
  vPosition      = displaced;
  vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
  gl_Position    = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`

export const liquidSphereFrag = /* glsl */`
uniform float uTime;
uniform vec2  uMouse;
uniform float uScrollVel;
uniform float uDistortion;
uniform vec3  uColorObsidian;
uniform vec3  uColorCyan;     // repurposed: deep teal
uniform vec3  uColorMagenta;  // repurposed: iridescent lavender
uniform vec3  uColorGold;     // repurposed: warm amber highlight

varying vec3  vNormal;
varying vec3  vPosition;
varying vec3  vWorldPosition;
varying float vNoise;
varying float vFresnel;

vec3 linearToSRGB(vec3 c) {
  return mix(
    1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
    c * 12.92,
    step(c, vec3(0.0031308))
  );
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPosition);

  // slow, almost architectural rotation of key lights — feels like a gallery spot
  vec3 L1 = normalize(vec3(sin(uTime * 0.18) * 3.0,  2.4, cos(uTime * 0.18) * 3.0));
  vec3 L2 = normalize(vec3(sin(uTime * 0.18 + 3.14159), -1.2, cos(uTime * 0.18 + 3.14159) * 2.0));

  float diff1 = max(dot(N, L1), 0.0);
  float diff2 = max(dot(N, L2), 0.0) * 0.55;
  vec3  H1    = normalize(L1 + V);
  float spec1 = pow(max(dot(N, H1), 0.0), 160.0);
  vec3  H2    = normalize(L2 + V);
  float spec2 = pow(max(dot(N, H2), 0.0), 72.0) * 0.35;

  // iridescent base — obsidian fades into teal then lavender across noise bands
  float n = vNoise * 0.5 + 0.5;
  vec3 baseColor = mix(uColorObsidian, uColorCyan,    smoothstep(0.05, 0.5, n));
  baseColor      = mix(baseColor,      uColorMagenta, smoothstep(0.45, 0.92, n));

  // subtle time-driven oil-slick bands
  float timePulse = sin(uTime * 0.35 + vPosition.y * 1.8) * 0.5 + 0.5;
  baseColor = mix(baseColor, uColorMagenta, timePulse * 0.08);

  // thin oscillating rim
  float rimOscillate = sin(uTime * 0.55) * 0.5 + 0.5;
  vec3 rimColor      = mix(uColorCyan, uColorMagenta, rimOscillate);
  vec3 rimContrib    = rimColor * vFresnel * 1.15;

  // warm amber speculars — like brushed metal
  vec3 specContrib = uColorGold * (spec1 + spec2) * 0.55;

  float velFactor = clamp(abs(uScrollVel) / 50.0, 0.0, 1.0);
  baseColor = mix(baseColor, uColorMagenta, velFactor * 0.22);
  baseColor = mix(baseColor, uColorCyan,    velFactor * 0.10);

  float ambient = 0.05;
  vec3  color   = baseColor * (ambient + diff1 + diff2) + specContrib + rimContrib;

  // soft sub-surface lavender bleed
  float sss = max(dot(-V, N), 0.0);
  sss       = pow(sss, 3.0) * 0.42;
  color    += uColorMagenta * sss * 0.22;

  color = color / (color + vec3(1.0));
  color = linearToSRGB(color);

  gl_FragColor = vec4(color, 1.0);
}
`

export const projectCardVert = /* glsl */`
${GLSL_SIMPLEX_3D}

uniform float uTime;
uniform float uScrollVel;
uniform float uActive;
uniform float uHover;
uniform float uDistortion;

varying vec2  vUv;
varying float vNoise;
varying float vEdge;

void main() {
  vUv = uv;
  float velAbs = abs(uScrollVel);
  float wave   = snoise(vec3(position.x * 2.5, position.y * 2.5, uTime * 0.8));
  float dispAmount = (velAbs * 0.008 + uDistortion * 0.04) * (wave * 0.5 + 0.5);
  float activeLift  = uActive * 0.12;
  float activePulse = 1.0 + uActive * sin(uTime * 2.0) * 0.015;
  float hoverLift   = uHover * 0.06;

  vec3 displaced = position;
  displaced.z   += wave * dispAmount;
  displaced.y   += activeLift + hoverLift;
  displaced     *= activePulse;

  vec2 edgeUV = abs(uv - 0.5) * 2.0;
  vEdge = smoothstep(0.7, 1.0, max(edgeUV.x, edgeUV.y));
  vNoise = wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`

export const projectCardFrag = /* glsl */`
uniform sampler2D uTexture;
uniform float     uTime;
uniform float     uScrollVel;
uniform float     uActive;
uniform float     uHover;
uniform float     uDistortion;
uniform float     uFocus;
uniform float     uHolo;
uniform float     uOpacity;
uniform vec3      uColorCyan;
uniform vec3      uColorMagenta;

varying vec2  vUv;
varying float vNoise;
varying float vEdge;

void main() {
  float velAbs  = abs(uScrollVel);
  float rgbShift = velAbs * 0.006 + uDistortion * 0.012;
  vec2 offset    = vec2(rgbShift, 0.0);
  float warpAmt  = (velAbs * 0.004 + uHover * 0.006 + uActive * 0.003);
  vec2 warpedUV  = vUv + vec2(vNoise) * warpAmt;

  float r = texture2D(uTexture, warpedUV + offset).r;
  float g = texture2D(uTexture, warpedUV).g;
  float b = texture2D(uTexture, warpedUV - offset).b;
  vec3  tex = vec3(r, g, b);

  vec3 glassColor = mix(uColorCyan, uColorMagenta, vUv.x);
  tex = mix(tex, tex * 1.3 + glassColor * 0.08, uHover * 0.5);

  vec2 edgeUV   = abs(vUv - 0.5) * 2.0;
  float edgeDist = 1.0 - max(edgeUV.x, edgeUV.y);
  float border   = smoothstep(0.0, 0.05, edgeDist) * uActive;
  tex = mix(tex, uColorCyan, border * 0.4);

  // Desaturate when off-focus
  float luma = dot(tex, vec3(0.299, 0.587, 0.114));
  tex = mix(vec3(luma), tex, 0.35 + uFocus * 0.65);

  // Holographic sheen: UV-driven iridescent stripe, strongest at focus
  float sheen = sin(vUv.y * 6.0 + uTime * 2.0) * 0.06 * uHolo;
  tex += vec3(sheen * 0.35, sheen * 0.85, sheen * 1.0);

  float alpha = (1.0 - vEdge * 0.6) * uOpacity;
  gl_FragColor = vec4(tex, alpha);
}
`

export const particleVert = /* glsl */`
${GLSL_SIMPLEX_3D}

uniform float uTime;
uniform float uScrollProgress;
uniform float uScrollVel;
uniform vec2  uMouse;

attribute float aSize;
attribute float aRandom;
attribute vec3  aColor;

varying vec3  vColor;
varying float vAlpha;

void main() {
  vColor = aColor;
  float drift  = snoise(position * 0.4 + vec3(uTime * 0.12 + aRandom * 10.0));
  vec3  drifted = position + vec3(drift * 0.15, drift * 0.08, drift * 0.06);

  float parallax = (1.0 - clamp(abs(position.z) / 10.0, 0.0, 1.0)) * uScrollProgress * 2.0;
  drifted.y -= parallax;

  vec3 toMouse = drifted - vec3(uMouse * 5.0, 0.0);
  float dist   = length(toMouse.xy);
  float repel  = smoothstep(2.5, 0.0, dist) * 0.6;
  drifted.xy  += normalize(toMouse.xy + 0.001) * repel;

  vec4 mvPosition = modelViewMatrix * vec4(drifted, 1.0);
  float velPulse  = 1.0 + abs(uScrollVel) * 0.04;
  gl_PointSize    = (aSize * velPulse * 300.0) / -mvPosition.z;
  gl_PointSize    = clamp(gl_PointSize, 0.5, 8.0);
  vAlpha          = clamp(0.3 + drift * 0.4, 0.1, 0.9);
  gl_Position     = projectionMatrix * mvPosition;
}
`

export const particleFrag = /* glsl */`
varying vec3  vColor;
varying float vAlpha;

void main() {
  vec2  coord  = gl_PointCoord - vec2(0.5);
  float dist   = length(coord);
  float circle = 1.0 - smoothstep(0.35, 0.5, dist);
  float glow   = exp(-dist * 8.0) * 0.6;
  float alpha  = (circle + glow) * vAlpha;
  gl_FragColor = vec4(vColor, alpha);
}
`

export const distortionPassVert = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const distortionPassFrag = /* glsl */`
${GLSL_SIMPLEX_3D}

uniform sampler2D tDiffuse;
uniform float     uTime;
uniform float     uDistortion;
uniform float     uScrollVel;
uniform vec2      uResolution;

varying vec2 vUv;

void main() {
  float velAbs = abs(uScrollVel);
  vec2 center  = vUv - 0.5;
  float barrel = uDistortion * 0.15;
  vec2 distorted = center * (1.0 + barrel * dot(center, center));
  vec2 uv      = distorted + 0.5;

  float caStr = velAbs * 0.003 + uDistortion * 0.005;
  vec2  caOff = center * caStr;

  float r = texture2D(tDiffuse, uv + caOff).r;
  float g = texture2D(tDiffuse, uv        ).g;
  float b = texture2D(tDiffuse, uv - caOff).b;

  float scanline  = sin(uv.y * uResolution.y * 1.5) * 0.5 + 0.5;
  float scanAlpha = 1.0 - scanline * 0.018;

  float vignette = 1.0 - dot(center * 1.4, center * 1.4);
  vignette       = clamp(vignette, 0.0, 1.0);
  vignette       = pow(vignette, 0.5);

  vec3 color = vec3(r, g, b) * scanAlpha * (0.5 + 0.5 * vignette);
  gl_FragColor = vec4(color, 1.0);
}
`

export function makeSphereUniforms() {
  return {
    uTime:          { value: 0 },
    uMouse:         { value: new THREE.Vector2(0, 0) },
    uScrollVel:     { value: 0 },
    uDistortion:    { value: 0 },
    uMouseRadius:   { value: 1.2 },
    uColorObsidian: { value: new THREE.Color('#000000') },
    uColorCyan:     { value: new THREE.Color('#00F7FF') },
    uColorMagenta:  { value: new THREE.Color('#FF0087') },
    uColorGold:     { value: new THREE.Color('#FEEE91') },
  }
}

export function makeCardUniforms(texture: THREE.Texture) {
  return {
    uTexture:      { value: texture },
    uTime:         { value: 0 },
    uScrollVel:    { value: 0 },
    uActive:       { value: 0 },
    uHover:        { value: 0 },
    uDistortion:   { value: 0 },
    uFocus:        { value: 0 },
    uHolo:         { value: 1 },
    uOpacity:      { value: 1 },
    uColorCyan:    { value: new THREE.Color('#00F7FF') },
    uColorMagenta: { value: new THREE.Color('#FF0087') },
  }
}

export function makeDistortionUniforms(tDiffuse: THREE.Texture) {
  return {
    tDiffuse:    { value: tDiffuse },
    uTime:       { value: 0 },
    uDistortion: { value: 0 },
    uScrollVel:  { value: 0 },
    uResolution: { value: new THREE.Vector2(
      typeof window !== 'undefined' ? window.innerWidth  : 1920,
      typeof window !== 'undefined' ? window.innerHeight : 1080,
    )},
  }
}
