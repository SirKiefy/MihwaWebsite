// ─────────────────────────────────────────────────────────────────────────────
//  The ink world: a Jeong Seon–style landscape in layered washes, a moon that
//  turns into the globe, a plum branch, falling petals and a line of geese.
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from '../../vendor/three/three.module.min.js';
import { NOISE, SKY, makeNoiseTexture } from './glsl.js';
import { Globe } from './globe.js';
import { makePineTexture, makePavilionTexture, makeBlossomAtlas } from './inktex.js';
import { rng, noise1 } from '../ink/brush.js';

const FOV = 35;
const TAN = Math.tan((FOV / 2) * (Math.PI / 180));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t) => t * t * (3 - 2 * t);

// Hero camera — mountain layers are laid out in its screen space.
const HERO_CAM = { y: 2, z: 22, lookY: 3.2 };
function worldY(f, D) {
  return HERO_CAM.y + ((HERO_CAM.lookY - HERO_CAM.y) / HERO_CAM.z) * D + (f - 0.5) * 2 * TAN * D;
}

// ─────────────────────────── scroll states ───────────────────────────
// Each state is where the camera and the moon/globe sit when a section is in view.
function makeStates(portrait) {
  const hero = {
    cam: [0, HERO_CAM.y, HERO_CAM.z], look: [0, HERO_CAM.lookY, 0],
    globe: portrait ? [0.72, 0.83, 0.05, 200] : [0.76, 0.77, 0.075, 200], morph: 0, halo: 1,
    fade: 0, wash: 1, cloud: 0, dusk: 0, branch: 1, petals: 1, birds: 1, parallax: 1,
  };
  const moon = {
    cam: [0, 9, 19], look: [0, 12.5, 0],
    globe: portrait ? [0.5, 0.68, 0.14, 70] : [0.68, 0.58, 0.2, 70], morph: 0.06, halo: 1,
    fade: 0.55, wash: 1.25, cloud: 0.55, dusk: 0, branch: 0, petals: 0.55, birds: 0.35, parallax: 0.7,
  };
  const world = {
    cam: [0, 16, 16], look: [0, 16.5, 0],
    globe: portrait ? [0.5, 0.66, 0.2, 12] : [0.7, 0.5, 0.35, 12], morph: 1, halo: 0.22,
    fade: 0.84, wash: 0.75, cloud: 1, dusk: 0, branch: 0, petals: 0.12, birds: 0, parallax: 0.22,
  };
  const letter = {
    cam: [0, HERO_CAM.y + 0.4, HERO_CAM.z], look: [0, HERO_CAM.lookY + 0.7, 0],
    globe: portrait ? [0.28, 0.86, 0.05, 200] : [0.8, 0.8, 0.085, 200], morph: 0, halo: 1,
    fade: 0, wash: 1.15, cloud: 0, dusk: 1, branch: 1, petals: 1, birds: 0.6, parallax: 1,
  };
  // indices match the keyframes computed in main.js
  return [hero, moon, world, world, world, letter, letter];
}

function mixState(a, b, t, out = {}) {
  for (const k of Object.keys(a)) {
    const va = a[k], vb = b[k];
    if (Array.isArray(va)) out[k] = va.map((v, i) => lerp(v, vb[i], t));
    else out[k] = lerp(va, vb, t);
  }
  return out;
}

// ─────────────────────────── ridge profiles ───────────────────────────

function ridgeProfile(n, seed, style) {
  const R = rng(seed);
  const out = new Float32Array(n);
  const fold = new Float32Array(n);
  const f1 = (x, s) => noise1(x, s) * 2 - 1;
  const smax = (a, b, k) => Math.max(a, b) + Math.max(k - Math.abs(a - b), 0) ** 2 / (4 * k);
  const sh = style.sh || [1.2, 2];
  const round = style.round ?? 0.35;
  const peaks = [];
  for (let k = 0; k < (style.peaks || 0); k++) {
    const c = style.center != null ? style.center + (R() - 0.5) * style.spread : R();
    const w = style.peakW[0] + R() * (style.peakW[1] - style.peakW[0]);
    const h = style.peakH[0] + R() * (style.peakH[1] - style.peakH[0]);
    const p = { c, h, wl: w * (0.6 + R() * 0.8), wr: w * (0.6 + R() * 0.8), sh: sh[0] + R() * (sh[1] - sh[0]), round: round * (0.5 + R()) };
    peaks.push(p);
    // shoulders: smaller heads leaning on the main peak
    const ns = R() < 0.75 ? 1 + Math.floor(R() * 2) : 0;
    for (let j = 0; j < ns; j++) {
      const side = R() < 0.5 ? -1 : 1;
      peaks.push({ c: c + side * w * (0.45 + R() * 0.45), h: h * (0.45 + R() * 0.3), wl: w * (0.35 + R() * 0.3), wr: w * (0.35 + R() * 0.3), sh: p.sh, round: p.round });
    }
  }
  const base = style.base;
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    let h = base + style.roll * (0.5 * f1(x * 2.2 + seed, seed) + 0.32 * f1(x * 6, seed + 1) + 0.18 * f1(x * 14, seed + 2));
    if (style.slope) h += style.slope * (x - 0.5);
    for (const p of peaks) {
      const d = (x - p.c) / (x < p.c ? p.wl : p.wr);
      if (Math.abs(d) > 1.4) continue;
      const spire = Math.pow(Math.max(0, 1 - Math.abs(d)), p.sh);
      const bell = Math.exp(-(2.2 * d) * (2.2 * d));
      h = smax(h, base * 0.5 + p.h * (spire + (bell - spire) * p.round), 0.04);
    }
    const rough = style.rough ?? 0.022;
    h += rough * (0.55 * f1(x * 48, seed + 3) + 0.3 * f1(x * 120, seed + 4) + 0.15 * f1(x * 260, seed + 5)) * smooth01((h - base) / 0.4);
    out[i] = clamp(h, 0, 1);
  }
  // an inner fold: a lower, shifted echo of the ridge, drawn inside the mass
  const shift = Math.round(n * 0.012);
  for (let i = 0; i < n; i++) {
    const j = Math.min(n - 1, Math.max(0, i + shift));
    const x = i / (n - 1);
    fold[i] = base + (out[j] - base) * (0.5 + 0.18 * f1(x * 4, seed + 9));
  }
  return { prof: out, fold };
}
const smooth01 = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };

const LAYERS = [
  // far: a pale, rolling range
  { z: -150, fBase: 0.4, fPeak: 0.6, ink: 0.18, seed: 11, line: 0.3, decay: 7, cun: 0.2, dots: 0, style: { base: 0.35, roll: 0.35, peaks: 5, peakH: [0.55, 0.9], peakW: [0.05, 0.12], sh: [1, 1.4], round: 0.55, rough: 0.012 } },
  // the Geumgang cluster: crystalline spires gathered right of centre
  { z: -112, fBase: 0.33, fPeak: 0.66, ink: 0.3, seed: 23, line: 0.42, decay: 8, cun: 0.75, dots: 0, style: { base: 0.22, roll: 0.22, peaks: 15, peakH: [0.35, 1], peakW: [0.012, 0.05], sh: [1.3, 2.2], round: 0.12, rough: 0.03, center: 0.6, spread: 0.3 } },
  // middle range: rounded earth mountains with a few taller heads
  { z: -80, fBase: 0.26, fPeak: 0.5, ink: 0.4, seed: 37, line: 0.5, decay: 9, cun: 0.4, dots: 0.35, style: { base: 0.3, roll: 0.4, peaks: 5, peakH: [0.55, 0.95], peakW: [0.04, 0.1], sh: [1.1, 1.6], center: 0.42, spread: 0.6 } },
  // mid-near hills
  { z: -54, fBase: 0.17, fPeak: 0.4, ink: 0.52, seed: 41, line: 0.6, decay: 10, cun: 0.45, dots: 0.6, style: { base: 0.3, roll: 0.45, slope: 0.25, peaks: 4, peakH: [0.6, 0.95], peakW: [0.05, 0.1], sh: [1.1, 1.5], center: 0.6, spread: 0.4 } },
  // near bank: low on the left (room for the title), rising to the right
  { z: -33, fBase: 0.04, fPeak: 0.33, ink: 0.66, seed: 53, line: 0.75, decay: 11, cun: 0.75, dots: 0.8, pines: [0.56, 0.585, 0.64], style: { base: 0.22, roll: 0.3, slope: 0.4, peaks: 3, peakH: [0.6, 0.95], peakW: [0.04, 0.07], sh: [1.2, 1.6], center: 0.6, spread: 0.12 } },
  // the near cliff, with a pavilion and pines
  { z: -15, fBase: -0.1, fPeak: 0.46, ink: 0.82, seed: 67, line: 0.9, decay: 12, cun: 1, dots: 0.9, pines: [0.688, 0.7, 0.735], pavilion: 0.668, style: { base: 0.1, roll: 0.1, slope: 0.35, peaks: 1, peakH: [0.9, 1], peakW: [0.1, 0.12], sh: [1.05, 1.2], round: 0.5, center: 0.715, spread: 0.01 } },
];

// ─────────────────────────── the world ───────────────────────────

export function createWorld(canvas, opts = {}) {
  const { reduceMotion = false, places = [] } = opts;
  const mobile = matchMedia('(max-width: 820px), (pointer: coarse)').matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  const maxDpr = mobile ? 1.5 : 1.75;
  let dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
  // measure the canvas itself: on phones innerHeight changes with the URL bar
  const view = { w: 1, h: 1 };
  const measureView = () => { const r = canvas.getBoundingClientRect(); view.w = Math.max(1, r.width || innerWidth); view.h = Math.max(1, r.height || innerHeight); };
  measureView();
  renderer.setPixelRatio(dpr);
  renderer.setSize(view.w, view.h, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, view.w / view.h, 0.1, 800);
  camera.position.set(0, HERO_CAM.y, HERO_CAM.z);
  scene.add(camera);

  const U = {
    uRes: { value: new THREE.Vector2(view.w * dpr, view.h * dpr) },
    uTime: { value: 0 },
    uWash: { value: 1 },
    uDusk: { value: 0 },
    uCloud: { value: 0 },
    uFade: { value: 0 },
    uPaper: { value: new THREE.Vector3(0.949, 0.922, 0.867) },
    uInkCol: { value: new THREE.Vector3(0.106, 0.09, 0.082) },
    uNoise: { value: makeNoiseTexture() },
  };
  const skyU = { uRes: U.uRes, uTime: U.uTime, uWash: U.uWash, uDusk: U.uDusk, uCloud: U.uCloud, uPaper: U.uPaper, uNoise: U.uNoise };

  // ── sky ──
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: skyU,
      depthTest: false,
      depthWrite: false,
      vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
      fragmentShader: NOISE + SKY + `void main(){ gl_FragColor = vec4(skyColor(gl_FragCoord.xy / uRes), 1.0); }`,
    }),
  );
  sky.frustumCulled = false;
  sky.renderOrder = -1000;
  scene.add(sky);

  // ── mountains ──
  const RN = 1024;
  const ridgeData = new Uint16Array(RN * LAYERS.length * 4);
  const mountains = new THREE.Group();
  scene.add(mountains);
  const layerMeta = [];
  LAYERS.forEach((L, li) => {
    const D = HERO_CAM.z - L.z;
    const width = 2 * TAN * D * 3.0;
    const yBottom = worldY(-0.25, D);
    const yTop = worldY(L.fPeak + 0.06, D);
    const H = yTop - yBottom;
    const { prof, fold } = ridgeProfile(RN, L.seed, L.style);
    const heights = new Float32Array(RN);
    const toR = (v) => (worldY(L.fBase + v * (L.fPeak - L.fBase), D) - yBottom) / H;
    for (let i = 0; i < RN; i++) {
      const r = toR(prof[i]);
      heights[i] = r;
      const o = (li * RN + i) * 4;
      ridgeData[o] = THREE.DataUtils.toHalfFloat(r);
      ridgeData[o + 1] = THREE.DataUtils.toHalfFloat(prof[i]);
      ridgeData[o + 2] = THREE.DataUtils.toHalfFloat(toR(fold[i]));
      ridgeData[o + 3] = THREE.DataUtils.toHalfFloat(smooth01((prof[i] - L.style.base - 0.1) / 0.3));
    }
    layerMeta.push({ D, width, yBottom, H, heights, z: L.z });
  });
  const ridgeTex = new THREE.DataTexture(ridgeData, RN, LAYERS.length, THREE.RGBAFormat, THREE.HalfFloatType);
  ridgeTex.magFilter = ridgeTex.minFilter = THREE.LinearFilter;
  ridgeTex.needsUpdate = true;

  const mountainFrag = NOISE + SKY + /* glsl */ `
    uniform sampler2D uRidge; uniform float uRow; uniform float uInk; uniform float uSeed;
    uniform float uW; uniform float uH; uniform float uD; uniform float uLine; uniform float uDecay;
    uniform float uCun; uniform float uDots; uniform float uFade; uniform vec3 uInkCol;
    varying vec2 vUv;
    void main() {
      float S = 0.0063 * uD;                // one "percent of screen height" in world units
      vec4 rp = texture2D(uRidge, vec2(vUv.x, uRow));
      vec2 q = vec2(vUv.x * uW, vUv.y * uH) / S;
      float rq = rp.x * uH / S;
      float wob = snz(vec2(q.x * 0.6, uSeed * 13.0)) * 0.22;
      float dq = rq - q.y + wob;            // depth below the ridge, in screen-percent
      float aa = fwidth(dq) * 1.1;
      float inside = smoothstep(-aa, aa, dq);
      if (inside < 0.004) discard;

      float hi = smoothstep(0.12, 0.75, rp.y);   // peaks get the boldest brushwork
      float n1 = fbm(q * vec2(0.035, 0.06) + uSeed * 7.0);
      float n2 = fbm(vec2(q.x * 0.22, uSeed * 3.0));
      // contour: the brush outline of the ridge, thick and thin, fading on the flats
      float lw = uLine * (0.4 + 1.0 * n2) * mix(0.55, 1.15, hi);
      float contour = (1.0 - smoothstep(lw * 0.35, lw, dq)) * mix(0.3, 1.0, hi);
      contour *= 0.55 + 0.45 * smoothstep(0.3, 0.65, fbm(vec2(q.x * 0.45, uSeed)));
      // wash body that dissolves downward into mist
      float body = exp(-dq / (uDecay * (0.55 + 0.9 * n1))) * mix(0.6, 1.0, hi);
      // vertical texture strokes (수직준), only on rock faces
      float streak = smoothstep(0.3, 0.85, snz(vec2(q.x * 0.9, q.y * 0.1 + uSeed)));
      float cunMask = smoothstep(0.5, 0.72, fbm(q * 0.04 + uSeed * 2.0)) * hi;
      float cun = streak * cunMask * exp(-dq / (uDecay * 0.9)) * uCun;
      // moss dots (태점) along the ridges
      float dots = smoothstep(0.5, 0.66, snz(q * 0.9 + uSeed * 5.0)) * exp(-dq / 2.2) * uDots;
      // inner fold: a second, fainter ridge line with its own wash below it
      float d2 = rp.z * uH / S - q.y + wob * 0.7;
      float foldLine = (1.0 - smoothstep(lw * 0.15, lw * 0.75, abs(d2))) * rp.w * (0.35 + 0.65 * fbm(vec2(q.x * 0.3, uSeed + 4.0)));
      float body2 = step(0.0, d2) * exp(-max(d2, 0.0) / (uDecay * 0.6)) * rp.w;
      float dens = contour * 0.9 + body * (0.28 + 0.5 * n1) + cun * 0.5 + dots * 0.85 + foldLine * 0.5 + body2 * (0.12 + 0.2 * n1);
      // rising cloud sea: the lower slopes vanish first
      float T = mix(90.0, -6.0, uFade) + (fbm(vec2(q.x * 0.03 + uTime * 0.01, q.y * 0.04)) - 0.5) * 22.0;
      dens *= smoothstep(T, T - 12.0, dq);
      dens = clamp(dens, 0.0, 1.0) * uInk;
      vec3 col = mix(skyColor(gl_FragCoord.xy / uRes), uInkCol, dens);
      gl_FragColor = vec4(col, inside);
    }`;
  const basicVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

  LAYERS.forEach((L, li) => {
    const m = layerMeta[li];
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...skyU,
        uRidge: { value: ridgeTex }, uRow: { value: (li + 0.5) / LAYERS.length },
        uInk: { value: L.ink }, uSeed: { value: L.seed * 0.137 }, uW: { value: m.width }, uH: { value: m.H }, uD: { value: m.D },
        uLine: { value: L.line }, uDecay: { value: L.decay }, uCun: { value: L.cun }, uDots: { value: L.dots },
        uFade: U.uFade, uInkCol: U.uInkCol,
      },
      vertexShader: basicVert,
      fragmentShader: mountainFrag,
      transparent: true,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(m.width, m.H), mat);
    mesh.position.set(0, m.yBottom + m.H / 2, L.z);
    mountains.add(mesh);
  });

  // ridge lookup (world y of the ridge at world x on a layer)
  function ridgeAt(li, u) {
    const m = layerMeta[li];
    const i = clamp(u, 0, 1) * (RN - 1);
    const i0 = Math.floor(i), i1 = Math.min(RN - 1, i0 + 1);
    const r = lerp(m.heights[i0], m.heights[i1], i - i0);
    return m.yBottom + r * m.H;
  }

  // ── pines & a pavilion on the near ridges ──
  const pineTex = [makePineTexture(3), makePineTexture(8), makePineTexture(21)];
  const pavTex = makePavilionTexture();
  const spriteMats = [];
  function spriteMat(map) {
    const mat = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, opacity: 1 });
    spriteMats.push(mat);
    return mat;
  }
  LAYERS.forEach((L, li) => {
    const m = layerMeta[li];
    const S = 0.0063 * m.D * 100; // screen height in world units at this depth
    (L.pines || []).forEach((u, k) => {
      const hgt = S * (0.075 + (k % 2) * 0.025) * (li === 5 ? 1.4 : 1);
      const x = (u - 0.5) * m.width;
      const y = Math.min(ridgeAt(li, u - 0.004), ridgeAt(li, u), ridgeAt(li, u + 0.004));
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(hgt * 0.667, hgt), spriteMat(pineTex[(k + li) % 3]));
      mesh.position.set(x, y + hgt * 0.44, L.z + 0.2);
      mesh.material.opacity = L.ink + 0.1;
      mesh.userData.baseOpacity = Math.min(1, L.ink + 0.15);
      mountains.add(mesh);
    });
    if (L.pavilion != null) {
      const u = L.pavilion;
      const w = S * 0.08;
      const y = Math.min(ridgeAt(li, u - 0.003), ridgeAt(li, u), ridgeAt(li, u + 0.003));
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.78), spriteMat(pavTex));
      mesh.position.set((u - 0.5) * m.width, y + w * 0.3, L.z + 0.25);
      mesh.userData.baseOpacity = 0.95;
      mountains.add(mesh);
    }
  });

  // ── drifting mist between the ranges ──
  const mistMats = [];
  [[-128, 0.36, 0.1], [-95, 0.3, 0.12], [-66, 0.24, 0.12], [-42, 0.16, 0.14], [-22, 0.02, 0.2]].forEach(([z, f, hf], i) => {
    const D = HERO_CAM.z - z;
    const width = 2 * TAN * D * 3.0;
    const h = hf * 2 * TAN * D;
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...skyU, uSeed: { value: i * 3.7 + 1 }, uAlpha: { value: 0.85 }, uFade: U.uFade },
      transparent: true,
      depthWrite: false,
      vertexShader: basicVert,
      fragmentShader: NOISE + SKY + /* glsl */ `
        uniform float uSeed; uniform float uAlpha; uniform float uFade;
        varying vec2 vUv;
        void main() {
          float n = fbm(vec2(vUv.x * 7.0 + uTime * 0.012 * (1.0 + uSeed * 0.1) + uSeed, vUv.y * 1.6 + uSeed * 2.3));
          float band = smoothstep(0.0, 0.45, vUv.y) * (1.0 - smoothstep(0.45, 1.0, vUv.y));
          float a = smoothstep(0.38, 0.72, n) * band * uAlpha * (1.0 + uFade);
          gl_FragColor = vec4(skyColor(gl_FragCoord.xy / uRes) * 1.006, clamp(a, 0.0, 1.0));
        }`,
    });
    mistMats.push(mat);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, h), mat);
    mesh.position.set(0, worldY(f, D), z + 1);
    scene.add(mesh);
  });

  // ── the moon / globe ──
  const globe = new Globe(U, { mobile });
  globe.setPlaces(places);
  scene.add(globe.group);

  // ── geese (평사낙안) ──
  const GEESE = 7;
  const geeseGeo = new THREE.PlaneGeometry(1, 0.5);
  const phase = new Float32Array(GEESE);
  for (let i = 0; i < GEESE; i++) phase[i] = i * 0.7;
  geeseGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1));
  const geeseMat = new THREE.ShaderMaterial({
    uniforms: { uTime: U.uTime, uOpacity: { value: 1 }, uInkCol: U.uInkCol },
    transparent: true,
    depthWrite: false,
    vertexShader: `attribute float aPhase; varying vec2 vUv; varying float vPhase;
      void main(){ vUv = uv; vPhase = aPhase; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uOpacity; uniform vec3 uInkCol;
      varying vec2 vUv; varying float vPhase;
      void main() {
        vec2 p = vec2(vUv.x * 2.0 - 1.0, (vUv.y * 2.0 - 1.0) * 0.5);
        float flap = sin(uTime * 4.2 + vPhase * 2.3);
        float ax = abs(p.x);
        float yw = (0.42 + 0.3 * flap) * ax - (0.4 + 0.34 * flap) * ax * ax - 0.08;
        float d = abs(p.y - yw);
        float th = mix(0.06, 0.018, ax);
        float a = (1.0 - smoothstep(th * 0.55, th, d)) * (1.0 - smoothstep(0.86, 1.0, ax));
        a = max(a, 1.0 - smoothstep(0.035, 0.06, length(p - vec2(0.0, 0.02))));
        gl_FragColor = vec4(uInkCol, a * 0.85 * uOpacity);
      }`,
  });
  const geese = new THREE.InstancedMesh(geeseGeo, geeseMat, GEESE);
  geese.frustumCulled = false;
  scene.add(geese);
  const geeseState = { t: 0.3 };

  // ── plum branch, held in front of the camera ──
  const branch = new THREE.Group();
  camera.add(branch);
  const branchRoot = new THREE.Group();
  branch.add(branchRoot);
  const branchU = { uOpacity: { value: 1 }, uInkCol: U.uInkCol, uPaper: U.uPaper, uNoise: U.uNoise, uSeedB: { value: 0.3 } };
  const branchMat = new THREE.ShaderMaterial({
    uniforms: branchU,
    side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: NOISE + /* glsl */ `
      uniform float uOpacity; uniform vec3 uInkCol; uniform vec3 uPaper; uniform float uSeedB;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        float facing = abs(dot(normalize(vN), normalize(vV)));
        float edge = 1.0 - facing;
        float streak = snz(vec2(vUv.x * 3.0 + uSeedB, vUv.y * 16.0));
        float dryMask = smoothstep(0.4, 0.8, fbm(vec2(vUv.x * 2.0 + uSeedB, vUv.y * 8.0)));
        float dry = smoothstep(0.1, 0.7, streak) * dryMask;
        float dens = mix(0.78, 1.0, smoothstep(0.25, 0.85, edge));
        dens *= 1.0 - dry * 0.55 * (1.0 - edge * 0.6);
        gl_FragColor = vec4(mix(uPaper, uInkCol, dens), uOpacity);
      }`,
  });

  const blossomTex = makeBlossomAtlas();
  const blossomMat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: blossomTex }, uTime: U.uTime, uOpacity: { value: 1 }, uGust: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute float aTile; attribute float aPhase;
      uniform float uTime; uniform float uGust;
      varying vec2 vUv;
      void main() {
        vec2 tile = vec2(mod(aTile, 2.0), floor(aTile / 2.0));
        vUv = (uv + tile) * 0.5;
        vUv.y = 1.0 - ((1.0 - uv.y) + tile.y) * 0.5;
        float sway = sin(uTime * 1.3 + aPhase) * (0.06 + uGust * 0.25);
        vec3 p = position;
        float c = cos(sway), s = sin(sway);
        p.xy = mat2(c, -s, s, c) * p.xy;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `uniform sampler2D uMap; uniform float uOpacity; varying vec2 vUv;
      void main(){ vec4 c = texture2D(uMap, vUv); if (c.a < 0.02) discard; gl_FragColor = vec4(c.rgb, c.a * uOpacity); }`,
  });

  function buildBranch() {
    const R = rng(7);
    const limbs = [];
    // normalized space: +x right, +y up; the corner anchor is (0,0), screen half-height = 1
    function limb(start, angle, segs, len, r0, r1, depth = 0) {
      const pts = [new THREE.Vector3(...start)];
      let a = angle;
      for (let i = 0; i < segs; i++) {
        a += (i % 2 ? 0.34 : -0.34) + (R() - 0.5) * 0.25;
        const l = len * (0.8 + R() * 0.4);
        const p = pts[pts.length - 1];
        pts.push(new THREE.Vector3(p.x + Math.cos(a) * l, p.y + Math.sin(a) * l, p.z + (R() - 0.5) * 0.06));
      }
      limbs.push({ pts, r0, r1, depth });
      return pts;
    }
    const main = limb([-0.22, -0.02, 0], -0.2, 6, 0.15, 0.038, 0.012);
    const sub = [];
    sub.push(limb(main[2].toArray(), -1.1, 4, 0.11, 0.018, 0.006, 1));
    sub.push(limb(main[3].toArray(), 0.35, 4, 0.1, 0.016, 0.005, 1));
    sub.push(limb(main[5].toArray(), -0.9, 3, 0.09, 0.012, 0.004, 1));
    sub.push(limb(main[4].toArray(), -0.2, 3, 0.1, 0.012, 0.004, 1));
    // straight twigs
    const twigs = [];
    [...main.slice(1), ...sub.flatMap((s) => s.slice(1))].forEach((p, i) => {
      if (R() < 0.35) return;
      const a = (R() < 0.6 ? 0.9 : -1.6) + (R() - 0.5) * 0.9;
      const l = 0.05 + R() * 0.1;
      const e = new THREE.Vector3(p.x + Math.cos(a) * l, p.y + Math.sin(a) * l, p.z + (R() - 0.5) * 0.04);
      limbs.push({ pts: [p.clone(), p.clone().lerp(e, 0.5).add(new THREE.Vector3(0, 0.004, 0)), e], r0: 0.0045, r1: 0.0012, depth: 2 });
      twigs.push([p, e]);
    });
    for (const L of limbs) {
      const curve = new THREE.CatmullRomCurve3(L.pts, false, 'centripetal', 0.2);
      const tub = L.depth === 2 ? 12 : 48;
      const geo = new THREE.TubeGeometry(curve, tub, 1, 8, false);
      const pos = geo.attributes.position;
      const c = new THREE.Vector3(), v = new THREE.Vector3();
      for (let i = 0; i <= tub; i++) {
        const t = i / tub;
        curve.getPointAt(t, c);
        const rad = lerp(L.r0, L.r1, Math.pow(t, 0.8)) * (1 + 0.15 * Math.sin(t * 40 + L.r0 * 100));
        for (let j = 0; j <= 8; j++) {
          const idx = i * 9 + j;
          v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(rad).add(c);
          pos.setXYZ(idx, v.x, v.y, v.z);
        }
      }
      geo.computeVertexNormals();
      branchRoot.add(new THREE.Mesh(geo, branchMat));
    }
    // blossoms along twigs and near joints
    const spots = [];
    twigs.forEach(([a, b]) => {
      const n = 1 + Math.floor(R() * 3);
      for (let k = 0; k < n; k++) spots.push(a.clone().lerp(b, 0.3 + R() * 0.7).add(new THREE.Vector3((R() - 0.5) * 0.02, (R() - 0.5) * 0.02, 0.01 + R() * 0.02)));
    });
    [...sub.flatMap((s) => s.slice(2))].forEach((p) => { if (R() < 0.6) spots.push(p.clone().add(new THREE.Vector3(0, 0.012, 0.02))); });
    const count = spots.length;
    const geo = new THREE.PlaneGeometry(1, 1);
    const tiles = new Float32Array(count), ph = new Float32Array(count);
    const mesh = new THREE.InstancedMesh(geo, blossomMat, count);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    spots.forEach((p, i) => {
      const bud = R() < 0.18;
      tiles[i] = bud ? 3 : Math.floor(R() * 3);
      ph[i] = R() * 6.28;
      e.set((R() - 0.5) * 0.9, (R() - 0.5) * 0.9, R() * 6.28);
      q.setFromEuler(e);
      const s = bud ? 0.05 : 0.055 + R() * 0.035;
      m4.compose(p, q, new THREE.Vector3(s, s, s));
      mesh.setMatrixAt(i, m4);
    });
    geo.setAttribute('aTile', new THREE.InstancedBufferAttribute(tiles, 1));
    geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(ph, 1));
    mesh.frustumCulled = false;
    branchRoot.add(mesh);
    return spots;
  }
  const blossomSpots = buildBranch();

  // ── falling petals ──
  const PETALS = reduceMotion ? 24 : mobile ? 60 : 130;
  const petalGeo = new THREE.PlaneGeometry(1, 1);
  const pTint = new Float32Array(PETALS);
  const petals = [];
  const petalMat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 1 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `attribute float aTint; varying vec2 vUv; varying float vTint;
      void main(){ vUv = uv; vTint = aTint; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity; varying vec2 vUv; varying float vTint;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        p.y += 0.12 * p.x * p.x;
        float d = length(vec2(p.x * 1.05, p.y * 1.22 + 0.05));
        float a = 1.0 - smoothstep(0.82, 0.98, d);
        if (a < 0.01) discard;
        vec3 deep = mix(vec3(0.84, 0.36, 0.45), vec3(0.93, 0.62, 0.66), vTint);
        vec3 pale = mix(vec3(0.98, 0.86, 0.87), vec3(1.0, 0.96, 0.94), vTint);
        vec3 c = mix(deep, pale, smoothstep(-0.9, 0.7, p.y));
        c = mix(c, deep * 0.92, smoothstep(0.7, 0.95, d) * 0.6);   // pigment pooling at the rim
        gl_FragColor = vec4(c, a * 0.92 * uOpacity);
      }`,
  });
  const petalMesh = new THREE.InstancedMesh(petalGeo, petalMat, PETALS);
  petalMesh.frustumCulled = false;
  camera.add(petalMesh);
  const PR = rng(42);
  for (let i = 0; i < PETALS; i++) {
    pTint[i] = PR();
    petals.push(spawnPetal({}, true));
  }
  petalGeo.setAttribute('aTint', new THREE.InstancedBufferAttribute(pTint, 1));

  function spawnPetal(p, anywhere = false) {
    const z = -(3 + PR() * 12);
    const hh = -z * TAN, hw = hh * camera.aspect;
    p.z = z;
    p.x = anywhere ? (PR() * 2 - 1) * hw * 1.2 : -hw * (1.1 + PR() * 0.3) + PR() * hw * 1.4;
    p.y = anywhere ? (PR() * 2 - 1) * hh : hh * (1.05 + PR() * 0.3);
    p.vx = 0.25 + PR() * 0.35; p.vy = -(0.18 + PR() * 0.2); p.vz = 0;
    p.rx = PR() * 6.28; p.ry = PR() * 6.28; p.rz = PR() * 6.28;
    p.wx = (PR() - 0.5) * 3; p.wy = (PR() - 0.5) * 3; p.wz = (PR() - 0.5) * 2;
    p.s = 0.05 + PR() * 0.05;
    p.ph = PR() * 6.28;
    p.life = 1;
    return p;
  }

  // ── pointer / interaction state ──
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, vx: 0, vy: 0, px: 0, py: 0, has: false };
  const raycaster = new THREE.Raycaster();
  let story = 0;
  let portrait = view.w / view.h < 0.85;
  let STATES = makeStates(portrait);
  const cur = mixState(STATES[0], STATES[0], 0);
  let visible = true;
  let gust = 0;

  function targetState() {
    const i = clamp(Math.floor(story), 0, STATES.length - 1);
    const j = Math.min(STATES.length - 1, i + 1);
    return mixState(STATES[i], STATES[j], ease(clamp(story - i)));
  }

  function resize() {
    measureView();
    const w = view.w, h = view.h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const db = renderer.getDrawingBufferSize(new THREE.Vector2());
    U.uRes.value.copy(db);
    const p = w / h < 0.85;
    if (p !== portrait) { portrait = p; STATES = makeStates(portrait); }
  }

  const tmpV = new THREE.Vector3(), fwd = new THREE.Vector3(), right = new THREE.Vector3(), upv = new THREE.Vector3();
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), s4 = new THREE.Vector3();

  function update(dt, t, snap = false) {
    U.uTime.value = t;
    const T = targetState();
    const k = snap ? 1 : 1 - Math.exp(-dt * (reduceMotion ? 20 : 3.2));
    for (const key of Object.keys(T)) {
      if (Array.isArray(T[key])) cur[key] = cur[key].map((v, i) => lerp(v, T[key][i], k));
      else cur[key] = lerp(cur[key], T[key], k);
    }
    // pointer smoothing
    pointer.sx = lerp(pointer.sx, pointer.x, 1 - Math.exp(-dt * 3));
    pointer.sy = lerp(pointer.sy, pointer.y, 1 - Math.exp(-dt * 3));
    const par = cur.parallax * (reduceMotion ? 0.2 : 1);
    const breathe = reduceMotion ? 0 : Math.sin(t * 0.21) * 0.25;

    camera.position.set(cur.cam[0] + pointer.sx * 1.1 * par + breathe, cur.cam[1] + pointer.sy * 0.45 * par, cur.cam[2]);
    camera.lookAt(cur.look[0] + pointer.sx * 0.5 * par, cur.look[1] + pointer.sy * 0.25 * par, cur.look[2]);
    camera.updateMatrixWorld();

    U.uWash.value = cur.wash;
    U.uCloud.value = cur.cloud;
    U.uDusk.value = cur.dusk;
    U.uFade.value = cur.fade;
    for (const mt of spriteMats) mt.opacity = (1 - cur.fade) * 0.95;
    mountains.visible = cur.fade < 0.995;

    // globe placement in screen space
    const [sx, sy, sr, D] = cur.globe;
    const halfH = D * TAN, halfW = halfH * camera.aspect;
    camera.getWorldDirection(fwd);
    right.crossVectors(fwd, camera.up).normalize();
    upv.crossVectors(right, fwd).normalize();
    const bob = Math.sin(t * 0.6) * 0.012 * cur.morph;
    globe.group.position.copy(camera.position)
      .addScaledVector(fwd, D)
      .addScaledVector(right, (sx - 0.5) * 2 * halfW)
      .addScaledVector(upv, (sy - 0.5 + bob) * 2 * halfH);
    globe.group.scale.setScalar(Math.max(0.001, sr * 2 * halfH));
    globe.update(dt, camera, cur.morph, cur.halo, cur.morph > 0.9 ? 1 : 0);

    // geese drift across the upper sky
    geeseState.t += dt * 0.012;
    const gt = (geeseState.t % 1.3) - 0.15;
    const GD = 95;
    const gh = GD * TAN, gw = gh * camera.aspect;
    for (let i = 0; i < GEESE; i++) {
      const row = i === 0 ? 0 : Math.ceil(i / 2);
      const side = i === 0 ? 0 : (i % 2 ? 1 : -1);
      tmpV.copy(camera.position).addScaledVector(fwd, GD)
        .addScaledVector(right, lerp(gw * 1.3, -gw * 1.3, gt) + row * 2.2)
        .addScaledVector(upv, gh * 0.5 + side * row * 0.9 - row * 0.2 + Math.sin(t * 0.7 + i) * 0.12);
      q4.copy(camera.quaternion);
      m4.compose(tmpV, q4, s4.setScalar(2.6));
      geese.setMatrixAt(i, m4);
    }
    geese.instanceMatrix.needsUpdate = true;
    geeseMat.uniforms.uOpacity.value = cur.birds;
    geese.visible = cur.birds > 0.01;

    // branch in the corner
    const side = 1;
    const Db = 6.2;
    const hb = Db * TAN, wb = hb * camera.aspect;
    const sc = hb * Math.min(1, camera.aspect * 0.95);
    const show = cur.branch;
    branch.position.set(side * (wb + (1 - show) * hb * 0.8) * 1.0, hb + (1 - show) * hb * 0.55, -Db);
    branch.scale.set(-side * sc, sc, sc);
    branchRoot.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.5) * 0.012 + gust * 0.02;
    branch.visible = show > 0.01;
    gust = Math.max(0, gust - dt * 0.6);
    blossomMat.uniforms.uGust.value = gust;

    // petals
    petalMat.uniforms.uOpacity.value = cur.petals;
    petalMesh.visible = cur.petals > 0.01;
    if (petalMesh.visible) {
      const pvx = pointer.vx, pvy = pointer.vy;
      for (let i = 0; i < PETALS; i++) {
        const p = petals[i];
        const hh = -p.z * TAN, hw = hh * camera.aspect;
        const flutter = Math.sin(t * 1.7 + p.ph);
        p.vx += (0.22 + gust * 1.2 - p.vx) * dt * 0.5;
        p.vy += (-0.24 - p.vy) * dt * 0.5;
        // the cursor stirs the air
        if (pointer.has) {
          const px = (p.x / hw), py = (p.y / hh);
          const dx = px - pointer.x, dy = py - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 0.06) {
            const f = (1 - d2 / 0.06) * 2.2;
            p.vx += pvx * f * dt * hw; p.vy += pvy * f * dt * hh;
          }
        }
        p.x += (p.vx + flutter * 0.18) * dt * (hh * 0.25);
        p.y += (p.vy + Math.cos(t * 1.3 + p.ph) * 0.06) * dt * (hh * 0.25);
        p.rx += p.wx * dt; p.ry += p.wy * dt; p.rz += p.wz * dt;
        if (p.y < -hh * 1.15 || p.x > hw * 1.3 || p.x < -hw * 1.6) spawnPetal(p);
        e4.set(p.rx, p.ry, p.rz);
        q4.setFromEuler(e4);
        tmpV.set(p.x, p.y, p.z);
        m4.compose(tmpV, q4, s4.setScalar(p.s * hh * 0.28));
        petalMesh.setMatrixAt(i, m4);
      }
      petalMesh.instanceMatrix.needsUpdate = true;
    }
    pointer.vx *= Math.exp(-dt * 6); pointer.vy *= Math.exp(-dt * 6);
  }

  // ── adaptive quality ──
  let slow = 0, fast = 0;
  function adapt(dt) {
    if (dt > 1 / 32) { slow++; fast = 0; } else if (dt < 1 / 55) { fast++; slow = Math.max(0, slow - 1); }
    if (slow > 90 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); resize(); slow = 0; }
    if (fast > 600 && dpr < Math.min(maxDpr, devicePixelRatio || 1)) { dpr = Math.min(maxDpr, dpr + 0.25); renderer.setPixelRatio(dpr); resize(); fast = 0; }
  }

  // ── loop ──
  const clock = new THREE.Clock();
  let raf = 0, t = 0, onFrame = null, hiddenSnapped = false;
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta());
    if (document.hidden) return;
    if (!visible) {
      // hidden behind paper: move the camera straight to where it should be, skip drawing
      if (!hiddenSnapped) { update(dt, t, true); hiddenSnapped = true; }
      return;
    }
    hiddenSnapped = false;
    t += dt;
    update(dt, t);
    renderer.render(scene, camera);
    adapt(dt);
    onFrame && onFrame();
  }

  // ── public API ──
  const api = {
    renderer, camera, globe,
    start() { resize(); update(0.016, 0); renderer.render(scene, camera); if (!raf) frame(); },
    renderOnce() { update(0.016, t); renderer.render(scene, camera); },
    resize,
    setStory(s) { if (s !== story) hiddenSnapped = false; story = s; },
    setVisible(v) { visible = v; },
    onFrame(fn) { onFrame = fn; },
    setPointer(nx, ny) {
      if (pointer.has) { pointer.vx += (nx - pointer.px) * 20; pointer.vy += (ny - pointer.py) * 20; }
      pointer.px = nx; pointer.py = ny;
      pointer.x = nx; pointer.y = ny; pointer.has = true;
    },
    /** scatter blossoms from a screen point */
    burst(cx, cy, n = 16) {
      gust = Math.min(1.5, gust + 0.8);
      const nx = (cx / view.w) * 2 - 1, ny = -(cy / view.h) * 2 + 1;
      for (let k = 0; k < n; k++) {
        const p = petals[Math.floor(PR() * PETALS)];
        p.z = -(4 + PR() * 5);
        const hh = -p.z * TAN, hw = hh * camera.aspect;
        p.x = nx * hw + (PR() - 0.5) * 0.3; p.y = ny * hh + (PR() - 0.5) * 0.3;
        const a = PR() * 6.28, sp = 0.6 + PR() * 1.4;
        p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp + 0.4;
      }
    },
    /** globe picking from client coordinates */
    pick(cx, cy) {
      raycaster.setFromCamera({ x: (cx / view.w) * 2 - 1, y: -(cy / view.h) * 2 + 1 }, camera);
      return globe.pick(raycaster);
    },
    projectMarkers(out) { return globe.project(camera, view.w, view.h, out); },
    get morph() { return cur.morph; },
  };
  return api;
}
