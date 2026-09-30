// ─────────────────────────────────────────────────────────────────────────────
//  The darkroom: her prints hanging on drying lines under the safelight.
//  Scrolling walks you down the line; each print develops as it reaches you,
//  its emulsion brushed on by hand, its caption pencilled in the margin.
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from '../../vendor/three/three.module.min.js';
import { makeNoiseTexture } from '../scene/glsl.js';

const SPACING = 4.8;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function captionCanvas(text, num, aspect = 6) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = Math.max(32, Math.round(1024 / aspect));
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(60,52,48,1)';
  g.font = `${Math.round(c.height * 0.62)}px "Nanum Pen Script", "Gowun Batang", cursive`;
  g.textBaseline = 'middle';
  g.fillText(num ? `${num}.  ${text}` : text, 10, c.height * 0.52);
  return c;
}

export function createReel(canvas, photos, { reduceMotion = false, mobile = false, onOpen, onFrame } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch { return null; }
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(dpr);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 200);
  const noise = makeNoiseTexture();
  const U = { uTime: { value: 0 }, uNoise: { value: noise } };

  // ── the room: deep brown-black, a red safelight glowing above ──
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { ...U, uAspect: { value: 1 } },
    depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uAspect; uniform sampler2D uNoise; varying vec2 vUv;
      float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      void main() {
        vec2 p = vUv - vec2(0.5, 1.05); p.x *= uAspect;
        float glow = exp(-dot(p, p) * 2.2);
        float haze = texture2D(uNoise, vec2(vUv.x * uAspect * 0.6 + uTime * 0.004, vUv.y * 0.8 - uTime * 0.002)).a;
        vec3 col = vec3(0.045, 0.032, 0.03);
        col += vec3(0.3, 0.05, 0.04) * glow * (0.7 + 0.5 * haze);
        col += vec3(0.05, 0.012, 0.01) * smoothstep(0.4, 0.0, vUv.y);
        vec2 v = vUv - 0.5; col *= 1.0 - dot(v, v) * 0.9;
        col += (hash(gl_FragCoord.xy + fract(uTime * 11.0) * 71.0) - 0.5) * 0.02;
        gl_FragColor = vec4(col, 1.0);
      }`,
  }));
  bg.frustumCulled = false;
  bg.renderOrder = -10;
  scene.add(bg);

  // ── prints ──
  const printMat = (tex, cap, imgAspect, size, imgRect, seed) => new THREE.ShaderMaterial({
    uniforms: {
      ...U,
      uMap: { value: tex }, uCap: { value: cap }, uImgAspect: { value: imgAspect },
      uSize: { value: new THREE.Vector2(...size) }, uImgRect: { value: new THREE.Vector4(...imgRect) },
      uDev: { value: reduceMotion ? 1 : 0 }, uHover: { value: 0 }, uSeed: { value: seed },
    },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uSeed; uniform vec2 uSize;
      varying vec2 vUv; varying float vShade;
      void main() {
        vUv = uv;
        vec3 p = position;
        // paper curls a little toward the edges and breathes
        float cx = (uv.x - 0.5) * 2.0;
        p.z += cx * cx * 0.05 * uSize.x + sin(uTime * 0.7 + uSeed * 6.0 + uv.y * 2.0) * 0.012 * (1.0 - uv.y);
        vShade = 0.86 + 0.14 * (1.0 - cx * cx) - (1.0 - uv.y) * 0.05;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap; uniform sampler2D uCap; uniform sampler2D uNoise;
      uniform float uImgAspect; uniform vec2 uSize; uniform vec4 uImgRect;
      uniform float uDev; uniform float uHover; uniform float uSeed; uniform float uTime;
      varying vec2 vUv; varying float vShade;
      float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      void main() {
        vec3 paper = vec3(0.935, 0.918, 0.885) * (0.985 + 0.03 * texture2D(uNoise, vUv * 3.0 + uSeed).b);
        vec2 ext = uImgRect.zw - uImgRect.xy;
        vec2 ir = (vUv - uImgRect.xy) / ext;
        // hand-brushed emulsion: the image edge wavers and breaks into bristle streaks
        vec2 dw = min(ir, 1.0 - ir) * ext * uSize;
        float sv = texture2D(uNoise, vec2(vUv.x * 0.5 + uSeed, vUv.y * 9.0)).b;
        float sh = texture2D(uNoise, vec2(vUv.x * 9.0, vUv.y * 0.5 + uSeed)).b;
        float wob = texture2D(uNoise, vUv * 1.5 + uSeed * 3.0).r;
        float ex = dw.x + (sv - 0.5) * 0.04 + (wob - 0.5) * 0.035;
        float ey = dw.y + (sh - 0.5) * 0.04 + (wob - 0.5) * 0.035;
        float d = min(ex, ey);
        float bristle = smoothstep(0.3, 0.6, texture2D(uNoise, vec2(vUv.x * 30.0, vUv.y * 30.0) + uSeed).b);
        float coat = smoothstep(-0.006, 0.012, d) * mix(bristle, 1.0, smoothstep(0.0, 0.03, d));
        // her photo, cover-fitted
        float ra = (ext.x * uSize.x) / (ext.y * uSize.y);
        vec2 sc = ra > uImgAspect ? vec2(1.0, uImgAspect / ra) : vec2(ra / uImgAspect, 1.0);
        vec3 ph = texture2D(uMap, (ir - 0.5) * sc + 0.5).rgb;
        ph = mix(ph, ph * ph * (3.0 - 2.0 * ph), 0.28);
        ph = ph * vec3(1.03, 1.0, 0.94) + vec3(0.03, 0.022, 0.018);
        float lum = dot(ph, vec3(0.3, 0.59, 0.11));
        // developing: the shadows arrive first, then everything else
        float dev = clamp(uDev * 1.6 - (lum * 0.6) , 0.0, 1.0);
        dev = dev * dev * (3.0 - 2.0 * dev);
        vec3 img = mix(paper, ph, dev);
        vec3 col = mix(paper, img, coat);
        // pencilled caption in the bottom margin
        vec2 cuv = vec2((vUv.x - uImgRect.x) / ext.x, (vUv.y - 0.012) / (uImgRect.y - 0.02));
        if (cuv.x > 0.0 && cuv.x < 1.0 && cuv.y > 0.0 && cuv.y < 1.0) {
          float ca = texture2D(uCap, vec2(cuv.x, cuv.y)).a;
          col = mix(col, vec3(0.3, 0.27, 0.26), ca * 0.9 * smoothstep(0.2, 0.8, uDev));
        }
        // light: safelight red on undeveloped paper, warm white once developed
        vec3 light = mix(vec3(0.88, 0.74, 0.7), vec3(1.0, 0.975, 0.95), smoothstep(0.1, 0.85, uDev));
        col *= light * vShade * (0.9 + 0.12 * uHover);
        col += (hash(gl_FragCoord.xy + fract(uTime * 17.0) * 53.0) - 0.5) * 0.035;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });

  const prints = [];
  const H = mobile ? 2.2 : 2.6;
  photos.forEach((ph, i) => {
    const src = ph.image || ph.canvas;
    const tex = new THREE.Texture(src);
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = maxAniso;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.needsUpdate = true;
    const aspect = ph.width / ph.height;
    const imgH = H, imgW = H * aspect;
    const m = 0.13, mb = 0.36;
    const W = imgW + m * 2, PH = imgH + m + mb;
    const imgRect = [m / W, mb / PH, 1 - m / W, 1 - m / PH];
    const capTex = new THREE.CanvasTexture(captionCanvas('', ''));
    capTex.colorSpace = THREE.NoColorSpace;
    const mat = printMat(tex, capTex, aspect, [W, PH], imgRect, i * 0.137 + 0.21);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(W, PH, 20, 20), mat);
    const side = i % 2 === 0 ? -1 : 1;
    const capAspect = ((imgRect[2] - imgRect[0]) * W) / ((imgRect[1] - 0.02) * PH);
    mesh.userData = { index: i, side, dev: reduceMotion ? 1 : 0, hover: 0, baseRotY: -side * 0.32, baseRotZ: (Math.sin(i * 12.9) * 0.5) * 0.06, capTex, capAspect, H: PH };
    mesh.position.set(0, 0, -i * SPACING);
    scene.add(mesh);
    prints.push(mesh);
  });

  // ── drying lines with pegs ──
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x2a1b18 });
  const pegMat = new THREE.MeshBasicMaterial({ color: 0x6b4430 });
  const pegGeo = new THREE.BoxGeometry(0.07, 0.24, 0.05);
  const lines = [new THREE.Group(), new THREE.Group()];
  lines.forEach((g) => scene.add(g));
  let layoutX = 1.7;
  const WALL = 2.15;
  let wallDist = 6;
  function buildLines() {
    lines.forEach((g) => { g.children.forEach((c) => c.geometry !== pegGeo && c.geometry.dispose()); g.clear(); });
    const top = (p) => p.position.y + p.userData.H / 2 + 0.05;
    const clip = (p) => new THREE.Vector3(p.position.x, top(p), p.position.z);
    const pts = [];
    const dir = clip(prints[Math.min(1, prints.length - 1)]).sub(clip(prints[0])).normalize();
    pts.push(clip(prints[0]).addScaledVector(dir, -SPACING).add(new THREE.Vector3(0, 0.12, 0)));
    prints.forEach((p, k) => {
      pts.push(clip(p));
      if (k < prints.length - 1) pts.push(clip(p).lerp(clip(prints[k + 1]), 0.5).add(new THREE.Vector3(0, -0.16, 0)));
      [-0.3, 0.3].forEach((o) => {
        const peg = new THREE.Mesh(pegGeo, pegMat);
        const s = p.scale.x;
        peg.position.set(p.position.x + o * s * Math.cos(p.userData.baseRotY), top(p) - 0.06, p.position.z - o * s * Math.sin(p.userData.baseRotY));
        peg.rotation.y = p.userData.baseRotY;
        lines[0].add(peg);
      });
    });
    pts.push(clip(prints[prints.length - 1]).addScaledVector(dir, SPACING).add(new THREE.Vector3(0, 0.12, 0)));
    lines[0].add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.008, 6, false), lineMat));
  }

  // ── dust drifting through the safelight ──
  const DUST = mobile ? 120 : 220;
  const dpos = new Float32Array(DUST * 3), dsz = new Float32Array(DUST);
  const zLen = photos.length * SPACING + 10;
  for (let i = 0; i < DUST; i++) {
    dpos[i * 3] = (Math.random() - 0.5) * 7;
    dpos[i * 3 + 1] = (Math.random() - 0.5) * 4;
    dpos[i * 3 + 2] = 6 - Math.random() * zLen;
    dsz[i] = 0.4 + Math.random() * 1.2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  dustGeo.setAttribute('aSize', new THREE.BufferAttribute(dsz, 1));
  const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
    uniforms: { ...U, uScale: { value: 1 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float aSize; uniform float uTime; uniform float uScale; varying float vA;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.2 + position.z) * 0.25 + uTime * 0.02 * aSize;
        p.y = mod(p.y + 2.0, 4.0) - 2.0;
        p.x += sin(uTime * 0.13 + position.y * 2.0) * 0.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * uScale * 2.6 / -mv.z;
        vA = smoothstep(18.0, 3.0, -mv.z) * smoothstep(0.3, 1.2, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      void main() { vec2 c = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(c)); gl_FragColor = vec4(1.0, 0.62, 0.52, a * vA * 0.3); }`,
  }));
  dust.frustumCulled = false;
  scene.add(dust);

  // ── layout ──
  let portrait = false;
  function layout() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(2, r.width), h = Math.max(2, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bg.material.uniforms.uAspect.value = w / h;
    dust.material.uniforms.uScale.value = h * dpr * 0.08;
    const wasPortrait = portrait;
    portrait = w / h < 0.9;
    if (wasPortrait !== portrait) camZ = null;
    prints.forEach((p, i) => {
      p.userData.side = 1;
      if (portrait) {
        p.position.set(i * WALL, Math.sin(i * 7.3) * 0.05, 0);
        p.userData.baseRotY = 0;
      } else {
        p.position.set(1.55, Math.sin(i * 7.3) * 0.08 - 0.05, -i * SPACING);
        p.userData.baseRotY = -0.62;
      }
      p.scale.setScalar(portrait ? 0.82 : 1);
      p.userData.H = p.geometry.parameters.height * p.scale.x;
    });
    // on tall screens, stand back far enough for one print to fill ~80% of the width
    const maxW = Math.max(...prints.map((p) => p.geometry.parameters.width * p.scale.x));
    wallDist = (maxW / 0.8) / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
    buildLines();
  }

  // ── captions ──
  function setCaptions(lang) {
    prints.forEach((p, i) => {
      const cap = photos[i].meta.caption?.[lang] ?? '';
      const c = captionCanvas(cap, String(i + 1).padStart(2, '0'), p.userData.capAspect);
      // a fresh texture each time: the canvas size can differ from the old one
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.NoColorSpace;
      tex.anisotropy = maxAniso;
      p.userData.capTex.dispose();
      p.userData.capTex = tex;
      p.material.uniforms.uCap.value = tex;
    });
  }

  // ── interaction ──
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = null;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  function pick(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(prints, false)[0];
    return hit && hit.distance < 14 ? hit.object : null;
  }
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    if (e.pointerType === 'mouse') {
      hovered = pick(e.clientX, e.clientY);
      canvas.style.cursor = hovered ? 'pointer' : '';
    }
  });
  canvas.addEventListener('pointerleave', () => { hovered = null; });
  canvas.addEventListener('click', (e) => {
    const p = pick(e.clientX, e.clientY);
    if (p && onOpen) onOpen(p.userData.index, e);
  });

  // ── loop ──
  let progress = 0, camZ = null, active = false, raf = 0, t = 0, last = performance.now(), current = -1;
  const zStart = 7.2, zEnd = () => -(prints.length - 1) * SPACING + 4.4;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!active || document.hidden) return;
    t += dt;
    U.uTime.value = t;
    const target = portrait ? lerp(0, (prints.length - 1) * WALL, progress) : lerp(zStart, zEnd(), progress);
    camZ = camZ === null ? target : lerp(camZ, target, 1 - Math.exp(-dt * (reduceMotion ? 30 : 4)));
    pointer.sx = lerp(pointer.sx, pointer.x, 1 - Math.exp(-dt * 3));
    pointer.sy = lerp(pointer.sy, pointer.y, 1 - Math.exp(-dt * 3));
    if (portrait) {
      camera.position.set(camZ + pointer.sx * 0.15, 0.05, wallDist);
      camera.lookAt(camZ, 0.05, 0);
    } else {
      camera.position.set(-0.55 + pointer.sx * 0.3, 0.1 + pointer.sy * 0.18, camZ);
      camera.lookAt(0.4 + pointer.sx * 0.6, 0.0 + pointer.sy * 0.2, camZ - 6);
    }

    let nearest = 0, best = Infinity;
    prints.forEach((p, i) => {
      const u = p.userData;
      const ahead = portrait ? Math.abs(camZ - p.position.x) * 3 + 2.3 : camZ - p.position.z;
      if (!reduceMotion) u.dev = Math.max(u.dev, portrait ? smooth(7, 3.2, ahead) : smooth(17, 7.5, ahead));
      p.material.uniforms.uDev.value = u.dev;
      u.hover = lerp(u.hover, hovered === p ? 1 : 0, 1 - Math.exp(-dt * 8));
      p.material.uniforms.uHover.value = u.hover;
      const sway = reduceMotion ? 0 : Math.sin(t * 0.6 + i * 1.7) * 0.025;
      p.rotation.set(0, u.baseRotY * (1 - u.hover * 0.55), u.baseRotZ + sway);
      if (ahead > 2.2 && ahead < best) { best = ahead; nearest = i; }
    });
    if (nearest !== current) { current = nearest; onFrame && onFrame(current); }
    renderer.render(scene, camera);
  }

  layout();
  raf = requestAnimationFrame(frame);
  addEventListener('resize', () => layout());

  return {
    setProgress(p) { progress = clamp(p); },
    setActive(v) { active = v; if (v) last = performance.now(); },
    setCaptions,
    count: prints.length,
  };
}
