// Seoul ↔ Paris: a small ink globe with a red thread between her two homes.
import * as THREE from '../../vendor/three/three.module.min.js';
import { Globe } from '../scene/globe.js';
import { makeNoiseTexture } from '../scene/glsl.js';

export function createHomes(canvas, places, { mobile = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch { return null; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 4.4);
  const U = {
    uTime: { value: 0 },
    uNoise: { value: makeNoiseTexture() },
    uPaper: { value: new THREE.Vector3(0.945, 0.922, 0.878) },
    uInkCol: { value: new THREE.Vector3(0.07, 0.058, 0.055) },
  };
  const globe = new Globe(U, { mobile });
  globe.setPlaces(places);
  scene.add(globe.group);
  // start with both homes in view
  globe.camAz = 0; globe.camEl = 0;
  globe.focus({ lat: 50, lon: 66 });
  globe.rx = globe.trx; globe.ry = globe.try;

  function size() {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(2, r.width), Math.max(2, r.height), false);
    camera.aspect = r.width / Math.max(1, r.height);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(canvas);
  size();

  // drag to turn
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; globe.startDrag(); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    globe.drag(e.clientX - drag.x, e.clientY - drag.y);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const end = () => { if (drag) { globe.endDrag(); drag = null; } };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  let active = false, t = 0, last = performance.now(), onFrame = null;
  const proj = [];
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!active || document.hidden) return;
    t += dt;
    U.uTime.value = t;
    globe.update(dt, camera, 1, 0, 1);
    renderer.render(scene, camera);
    if (onFrame) {
      const r = canvas.getBoundingClientRect();
      onFrame(globe.project(camera, r.width, r.height, proj));
    }
  }
  requestAnimationFrame(frame);
  return {
    setActive(v) { active = v; if (v) last = performance.now(); },
    onFrame(fn) { onFrame = fn; },
  };
}
