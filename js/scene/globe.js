// The moon that becomes the world: one sphere, two paintings.
import * as THREE from '../../vendor/three/three.module.min.js';
import { NOISE } from './glsl.js';
import { makeLandTexture } from './inktex.js';

const DEG = Math.PI / 180;

export function latLonToVec3(lat, lon, r = 1) {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const theta = ((90 - lat) / 180) * Math.PI;
  return new THREE.Vector3(-Math.cos(phi) * Math.sin(theta) * r, Math.cos(theta) * r, Math.sin(phi) * Math.sin(theta) * r);
}

function slerpUnit(a, b, t) {
  const om = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
  if (om < 1e-5) return a.clone();
  const s = Math.sin(om);
  return a.clone().multiplyScalar(Math.sin((1 - t) * om) / s).add(b.clone().multiplyScalar(Math.sin(t * om) / s));
}

const wrapPi = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class Globe {
  constructor(U, { mobile = false } = {}) {
    this.U = U;
    this.group = new THREE.Group();
    this.spin = new THREE.Group();
    this.spin.rotation.order = 'XYZ';
    this.group.add(this.spin);

    this.rx = 0.62; this.ry = -1.1;      // current rotation
    this.trx = this.rx; this.try = this.ry;
    this.vy = 0; this.vx = 0;
    this.dragging = false;
    this.selected = null;
    this.hovered = null;
    this.visible = 0;

    this.uniforms = {
      uLand: { value: makeLandTexture(mobile ? 0.5 : 1) },
      uMorph: { value: 0 },
      uTime: U.uTime,
      uNoise: U.uNoise,
      uPaper: U.uPaper,
      uPaperLight: { value: new THREE.Vector3(0.985, 0.968, 0.93) },
      uInkCol: U.uInkCol,
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /* glsl */ `
        varying vec3 vObj; varying vec3 vN; varying vec2 vUv; varying vec3 vView;
        void main() {
          vUv = uv; vObj = position;
          vN = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: NOISE + /* glsl */ `
        uniform sampler2D uLand; uniform float uMorph; uniform float uTime;
        uniform vec3 uPaper; uniform vec3 uPaperLight; uniform vec3 uInkCol;
        varying vec3 vObj; varying vec3 vN; varying vec2 vUv; varying vec3 vView;
        void main() {
          vec3 N = normalize(vN); vec3 V = normalize(vView);
          vec3 nrm = normalize(vObj);
          float facing = clamp(dot(N, V), 0.0, 1.0);
          // the moon — bare paper with the faintest maria
          float maria = smoothstep(0.5, 0.74, fbm3(vObj * 1.7 + 2.0, nrm));
          vec3 moon = mix(uPaperLight, uPaperLight * vec3(0.935, 0.925, 0.905), maria * 0.8);
          // the earth — land washed in ink, coasts drawn, oceans combed with waves
          vec4 L = texture2D(uLand, vUv);
          float land = smoothstep(0.3, 0.7, L.r);
          float coast = smoothstep(0.1, 0.42, L.r) * (1.0 - smoothstep(0.52, 0.9, L.r));
          float n = fbm3(vObj * 7.0, nrm);
          float nb = fbm3(vObj * 2.1 + 5.0, nrm);
          float inkLand = land * (0.12 + 0.2 * n + 0.14 * nb);
          float bleed = L.g * (1.0 - land) * 0.14;
          float lat = vUv.y * 180.0;
          float waves = sin(lat * 2.4 + sin(vUv.x * 50.0 + lat * 0.13) * 1.4);
          float ocean = (1.0 - land) * smoothstep(0.86, 1.0, waves) * 0.07 * smoothstep(0.35, 0.7, fbm3(vObj * 4.0 + 1.0, nrm));
          vec2 g = vec2(vUv.x * 24.0, vUv.y * 12.0);
          vec2 gf = abs(fract(g - 0.5) - 0.5) / fwidth(g);
          float grid = (1.0 - min(min(gf.x, gf.y), 1.0)) * 0.08;
          float dens = clamp(inkLand + coast * 0.6 + bleed + ocean + grid, 0.0, 1.0);
          vec3 earth = mix(uPaper, uInkCol, dens);
          // ink spreads across the moon and it becomes the world
          float spread = fbm3(vObj * 2.4 + 9.0, nrm);
          float e = smoothstep(spread - 0.07, spread + 0.07, uMorph * 1.3 - 0.15);
          vec3 col = mix(moon, earth, e);
          // soft wash on the shadow side
          vec3 Ld = normalize(vec3(-0.55, 0.5, 0.75));
          float lam = dot(N, Ld);
          col = mix(col, uInkCol, (1.0 - smoothstep(-0.4, 0.65, lam)) * mix(0.035, 0.2, e));
          // a brush-drawn rim
          float rimN = fbm3(vObj * 4.5 + uTime * 0.04, nrm);
          float rim = smoothstep(0.6 + 0.16 * rimN, 0.97, 1.0 - facing);
          col = mix(col, uInkCol, rim * mix(0.1, 0.6, e));
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    this.sphere = new THREE.Mesh(new THREE.SphereGeometry(1, mobile ? 72 : 128, mobile ? 48 : 96), mat);
    this.spin.add(this.sphere);

    // 홍운탁월 — clouds washed around the moon
    this.haloU = { uTime: U.uTime, uNoise: U.uNoise, uOpacity: { value: 1 }, uInkCol: U.uInkCol, uInner: { value: 0.325 } };
    this.halo = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        uniforms: this.haloU,
        transparent: true,
        depthWrite: false,
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: NOISE + /* glsl */ `
          uniform float uTime; uniform float uOpacity; uniform vec3 uInkCol; uniform float uInner;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float r = length(p);
            // horizontal cloud banks, drifting
            float c1 = fbm(vec2(p.x * 1.4 + uTime * 0.012, p.y * 3.6));
            float c2 = fbm(vec2(p.x * 3.0 - uTime * 0.008, p.y * 7.0 + 3.0));
            float inner = smoothstep(uInner * 0.97, uInner * 1.05, r);
            float fall = exp(-(r - uInner) * 3.2);
            float clouds = smoothstep(0.25, 0.85, c1 * 0.7 + c2 * 0.45);
            float a = inner * fall * (0.2 + 0.8 * clouds);
            // the wash pools right at the moon's edge
            a += inner * (1.0 - smoothstep(uInner * 1.0, uInner * 1.22, r)) * 0.16;
            a *= 1.0 - smoothstep(0.75, 1.0, r);
            gl_FragColor = vec4(uInkCol, clamp(a, 0.0, 1.0) * 0.42 * uOpacity);
          }`,
      }),
    );
    this.halo.renderOrder = -1;
    this.group.add(this.halo);

    this.markers = [];
    this.arcs = [];
    this.markerGeo = new THREE.PlaneGeometry(1, 1);
    this.pulse = this.makePulse();
    this.spin.add(this.pulse);
  }

  makeMarkerMaterial(home) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uCol: { value: home ? new THREE.Vector3(0.184, 0.259, 0.4) : new THREE.Vector3(0.72, 0.2, 0.165) },
        uOpacity: { value: 0 },
        uHome: { value: home ? 1 : 0 },
        uHover: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uCol; uniform float uOpacity; uniform float uHome; uniform float uHover;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float a;
          if (uHome > 0.5) {
            float r = length(p);
            a = 1.0 - smoothstep(0.42, 0.5, r);
            a = max(a, (smoothstep(0.66, 0.72, r) * (1.0 - smoothstep(0.8, 0.86, r))) * 0.9);
          } else {
            vec2 ap = abs(p);
            float box = max(ap.x, ap.y);
            a = 1.0 - smoothstep(0.46, 0.54, box);
            float inner = smoothstep(0.22, 0.26, box) * (1.0 - smoothstep(0.31, 0.35, box));
            a *= 1.0 - inner * 0.85;
          }
          vec3 c = mix(uCol, uCol * 0.6, uHover);
          gl_FragColor = vec4(c, a * uOpacity);
        }`,
    });
  }

  makePulse() {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1, 48),
      new THREE.ShaderMaterial({
        uniforms: { uT: { value: 0 }, uOpacity: { value: 0 } },
        transparent: true,
        depthWrite: false,
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform float uT; uniform float uOpacity; void main(){ gl_FragColor = vec4(0.72, 0.2, 0.165, (1.0 - uT) * 0.8 * uOpacity); }`,
      }),
    );
    m.visible = false;
    return m;
  }

  setPlaces(places) {
    this.places = places;
    for (const p of places) {
      const pos = latLonToVec3(p.lat, p.lon, 1.004);
      const mesh = new THREE.Mesh(this.markerGeo, this.makeMarkerMaterial(!!p.home));
      mesh.position.copy(pos);
      mesh.lookAt(pos.clone().multiplyScalar(2));
      const s = p.home ? 0.05 : 0.034;
      mesh.scale.setScalar(s);
      mesh.userData = { place: p, base: s };
      // generous invisible hit area
      const hit = new THREE.Mesh(new THREE.CircleGeometry(1, 12), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.copy(pos); hit.quaternion.copy(mesh.quaternion); hit.scale.setScalar(0.07);
      hit.userData = { place: p };
      this.spin.add(mesh, hit);
      this.markers.push({ place: p, mesh, hit, pos, normal: pos.clone().normalize() });
    }
    const seoul = places.find((p) => p.id === 'seoul');
    const paris = places.find((p) => p.id === 'paris');
    this.homeArc = this.makeArc(seoul, paris, [0.72, 0.2, 0.165], 0.0085, 0.22);
    this.homeArc.material.uniforms.uProgress.value = 0;
  }

  makeArc(a, b, col, radius = 0.006, lift = null) {
    const va = latLonToVec3(a.lat, a.lon), vb = latLonToVec3(b.lat, b.lon);
    const ang = va.angleTo(vb);
    const h = lift ?? 0.05 + 0.2 * (ang / Math.PI);
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      pts.push(slerpUnit(va, vb, t).multiplyScalar(1.003 + h * Math.sin(Math.PI * t)));
    }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, radius, 6, false);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uCol: { value: new THREE.Vector3(...col) }, uProgress: { value: 0 }, uTime: this.U.uTime, uOpacity: { value: 1 } },
      transparent: true,
      depthWrite: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uCol; uniform float uProgress; uniform float uTime; uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          if (vUv.x > uProgress) discard;
          float flow = 0.7 + 0.3 * sin(vUv.x * 60.0 - uTime * 3.0);
          float head = smoothstep(uProgress - 0.05, uProgress, vUv.x) * step(uProgress, 0.999);
          gl_FragColor = vec4(mix(uCol, vec3(0.1), head * 0.4), uOpacity * (flow + head * 0.3));
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    this.spin.add(mesh);
    return mesh;
  }

  clearArcs() {
    for (const a of this.arcs) { a.userData.dying = true; }
  }

  /** face a place towards the viewer */
  focus(place) {
    const v = latLonToVec3(place.lat, place.lon);
    this.try = this.ry + wrapPi(-Math.atan2(v.x, v.z) + this.camAz - this.ry);
    this.trx = THREE.MathUtils.clamp(place.lat * DEG - this.camEl * 0.6, -1.1, 1.1);
  }

  select(place) {
    this.selected = place;
    this.clearArcs();
    if (!place) { this.pulse.visible = false; return; }
    this.focus(place);
    const m = this.markers.find((mk) => mk.place === place);
    this.pulse.visible = true;
    this.pulse.position.copy(m.pos);
    this.pulse.quaternion.copy(m.mesh.quaternion);
    this.pulseT = 0;
    if (!place.home) {
      const seoul = this.places.find((p) => p.id === 'seoul');
      const paris = this.places.find((p) => p.id === 'paris');
      const a1 = this.makeArc(seoul, place, [0.72, 0.2, 0.165], 0.0055);
      const a2 = this.makeArc(paris, place, [0.184, 0.259, 0.4], 0.0055);
      a2.userData.delay = 0.25;
      this.arcs.push(a1, a2);
    }
  }

  startDrag() { this.dragging = true; this.vx = this.vy = 0; }
  drag(dx, dy) {
    const k = 0.0055;
    this.ry += dx * k; this.rx += dy * k;
    this.rx = THREE.MathUtils.clamp(this.rx, -1.2, 1.2);
    this.try = this.ry; this.trx = this.rx;
    this.vy = dx * k; this.vx = dy * k;
  }
  endDrag() { this.dragging = false; }

  /** hit test in world space; returns place or null */
  pick(raycaster) {
    if (this.visible < 0.5) return null;
    const hits = raycaster.intersectObjects([this.sphere, ...this.markers.map((m) => m.hit)], false);
    if (!hits.length) return null;
    const first = hits[0];
    // markers sit on the surface: accept if the marker hit is within a hair of the sphere hit
    const mk = hits.find((h) => h.object.userData.place);
    if (!mk) return null;
    if (first.object === this.sphere && mk.distance - first.distance > 0.02 * this.group.scale.x) return null;
    return mk.object.userData.place;
  }

  update(dt, camera, morph, haloOpacity, interactive) {
    this.uniforms.uMorph.value = morph;
    this.haloU.uOpacity.value = haloOpacity;
    this.visible = interactive;

    // viewer direction in the globe's frame (for focusing)
    const toCam = camera.position.clone().sub(this.group.position).normalize();
    this.camAz = Math.atan2(toCam.x, toCam.z);
    this.camEl = Math.asin(THREE.MathUtils.clamp(toCam.y, -1, 1));

    if (!this.dragging) {
      if (Math.abs(this.vy) > 1e-5 || Math.abs(this.vx) > 1e-5) {
        this.ry += this.vy; this.rx = THREE.MathUtils.clamp(this.rx + this.vx, -1.2, 1.2);
        this.vy *= Math.pow(0.05, dt); this.vx *= Math.pow(0.05, dt);
        this.try = this.ry; this.trx = this.rx;
      } else if (!this.selected) {
        this.try += dt * 0.05;
        this.ry += (this.try - this.ry) * (1 - Math.exp(-dt * 2));
        this.rx += (this.trx - this.rx) * (1 - Math.exp(-dt * 2));
      } else {
        const k = 1 - Math.exp(-dt * 3.2);
        this.ry += (this.try - this.ry) * k;
        this.rx += (this.trx - this.rx) * k;
      }
    }
    this.spin.rotation.set(this.rx, this.ry, 0);

    // halo faces the camera
    this.halo.quaternion.copy(camera.quaternion);
    this.halo.position.set(0, 0, 0);
    this.halo.scale.setScalar(6);

    const show = THREE.MathUtils.smoothstep(morph, 0.75, 1);
    for (const m of this.markers) {
      const u = m.mesh.material.uniforms;
      const hov = this.hovered === m.place || this.selected === m.place ? 1 : 0;
      u.uHover.value += (hov - u.uHover.value) * Math.min(1, dt * 8);
      u.uOpacity.value = show;
      m.mesh.scale.setScalar(m.mesh.userData.base * (1 + 0.5 * u.uHover.value));
    }
    // arcs
    const hp = this.homeArc.material.uniforms;
    hp.uProgress.value = morph > 0.85 ? Math.min(1, hp.uProgress.value + dt * 0.45) : Math.max(0, hp.uProgress.value - dt * 2);
    hp.uOpacity.value = show * (this.selected && !this.selected.home ? 0.35 : 1);
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const a = this.arcs[i];
      const u = a.material.uniforms;
      if (a.userData.dying) {
        u.uOpacity.value -= dt * 3;
        if (u.uOpacity.value <= 0) { this.spin.remove(a); a.geometry.dispose(); a.material.dispose(); this.arcs.splice(i, 1); }
      } else {
        a.userData.t = (a.userData.t || 0) + dt;
        u.uProgress.value = Math.min(1, Math.max(0, a.userData.t - (a.userData.delay || 0)) * 0.9);
        u.uOpacity.value = show;
      }
    }
    if (this.pulse.visible) {
      this.pulseT = (this.pulseT + dt * 0.8) % 1;
      const s = 0.03 + this.pulseT * 0.09;
      this.pulse.scale.setScalar(s);
      this.pulse.material.uniforms.uT.value = this.pulseT;
      this.pulse.material.uniforms.uOpacity.value = show;
    }
  }

  /** screen positions for HTML labels */
  project(camera, w, h, out = []) {
    out.length = 0;
    const tmp = new THREE.Vector3(), nrm = new THREE.Vector3(), cam = camera.position;
    for (const m of this.markers) {
      tmp.copy(m.pos);
      this.spin.localToWorld(tmp);
      nrm.copy(m.normal).applyQuaternion(this.spin.getWorldQuaternion(new THREE.Quaternion()));
      const facing = nrm.dot(cam.clone().sub(tmp).normalize());
      tmp.project(camera);
      out.push({ place: m.place, x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h, facing });
    }
    return out;
  }
}
