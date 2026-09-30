// ─────────────────────────────────────────────────────────────────────────────
//  사군자 — the Four Gentlemen, painted stroke by stroke.
// ─────────────────────────────────────────────────────────────────────────────
import {
  rng, strokeGen, dotGen, blossomGen, bud, wash, stamp, sealStamp, PROFILE, Painter, INK, OCHRE, smooth,
} from './brush.js';

const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

// ─────────────────────────── helpers ───────────────────────────

/** Integrate a curving line from a start point: returns control points. */
function curve(x, y, angle, length, bend, steps = 8, rand = Math.random, wobble = 0) {
  const pts = [[x, y]];
  let a = angle;
  const ds = length / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    a += (bend / steps) * (0.4 + t * 1.3) + (rand() - 0.5) * wobble;
    x += Math.cos(a) * ds; y += Math.sin(a) * ds;
    pts.push([x, y]);
  }
  return pts;
}

function inscription(ctx, text, x, y, size, { tone = 0.82 } = {}) {
  ctx.save();
  ctx.fillStyle = `rgba(27,23,21,${tone})`;
  ctx.font = `500 ${size}px "Noto Serif KR", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i < text.length; i++) ctx.fillText(text[i], x, y + i * size * 1.12);
  ctx.restore();
  return y + text.length * size * 1.12;
}

function colophon(ctx, text, x, y, u, seed) {
  const end = inscription(ctx, text, x, y, 12.5 * u);
  sealStamp(ctx, x, end + 14 * u, 22 * u, '美花', { seed, rot: (seed % 7 - 3) * 0.01 });
}

// ─────────────────────────── 매 · Plum under the moon ───────────────────────────

function plum(ctx, w, h, seed) {
  const R = rng(seed);
  const u = w / 300;
  const Q = [];

  // 월매 — the moon, left as bare paper inside a pale wash (홍운탁월)
  const mx = w * 0.7, my = h * 0.2, mr = 34 * u;
  Q.push(function* () {
    for (let i = 0; i < 44; i++) {
      const a = R() * TAU, d = mr * (1.25 + R() * 1.9);
      stamp(ctx, mx + Math.cos(a) * d, my + Math.sin(a) * d * 0.75, mr * (0.8 + R() * 0.9), INK, 0.028, 0.15);
      if (i % 4 === 0) yield 30;
    }
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const g = ctx.createRadialGradient(mx, my, mr * 0.9, mx, my, mr * 1.08);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(mx, my, mr * 1.1, 0, TAU); ctx.fill();
    ctx.restore();
    yield 30;
  });

  // trunk — angular, dry, old
  const trunk = [[-0.02 * w, 1.02 * h]];
  let a = -0.95;
  for (let k = 0; k < 6; k++) {
    const len = h * (0.08 + R() * 0.04);
    a += (k % 2 ? 0.42 : -0.46) + (R() - 0.5) * 0.18;
    a = Math.max(-1.45, Math.min(-0.45, a));
    const [px, py] = trunk[trunk.length - 1];
    trunk.push([px + Math.cos(a) * len, py + Math.sin(a) * len]);
  }
  const taper = (t) => (1 - 0.66 * t) * smooth(0, 0.03, t);
  Q.push(() => strokeGen(ctx, { pts: trunk, width: 38 * u, profile: taper, tone: 0.6, dry: 0.75, bleed: 0.18, spread: 0.65, side: 1, seed: seed + 1, bristles: 46 }));
  Q.push(() => strokeGen(ctx, { pts: trunk.map(([x, y], i) => [x - 9 * u + i * 0.8 * u, y - 2 * u]), width: 11 * u, profile: taper, tone: 0.95, dry: 0.6, bleed: 0.12, seed: seed + 2 }));

  // branches from trunk joints
  const twigBases = [];
  const branches = [];
  for (const k of [2, 3, 4, 5, 6]) {
    const [bx, by] = trunk[k];
    let ba = (k % 2 ? -0.25 : -2.3) + (R() - 0.5) * 0.4;
    if (k === 6) ba = -0.9;
    const pts = [[bx, by]];
    const segs = 3 + Math.floor(R() * 2);
    for (let s = 0; s < segs; s++) {
      ba += (s % 2 ? 0.35 : -0.35) + (R() - 0.5) * 0.3;
      const len = h * (0.055 + R() * 0.045);
      const [px, py] = pts[pts.length - 1];
      pts.push([px + Math.cos(ba) * len, py + Math.sin(ba) * len]);
      twigBases.push({ x: pts[pts.length - 1][0], y: pts[pts.length - 1][1], a: ba });
    }
    branches.push(pts);
  }
  for (const [i, pts] of branches.entries()) {
    Q.push(() => strokeGen(ctx, { pts, width: 13 * u, profile: (t) => (1 - 0.7 * t) * smooth(0, 0.05, t), tone: 0.82, dry: 0.5, bleed: 0.15, spread: 0.45, seed: seed + 10 + i }));
  }
  // twigs — long, straight, like spears
  const flowerSpots = [];
  twigBases.forEach((tb, i) => {
    if (R() < 0.25) return;
    const ta = -Math.PI / 2 + (R() - 0.35) * 1.5;
    const len = h * (0.07 + R() * 0.14);
    const ex = tb.x + Math.cos(ta) * len, ey = tb.y + Math.sin(ta) * len;
    Q.push(() => strokeGen(ctx, { pts: [[tb.x, tb.y], [lerp(tb.x, ex, 0.5) + (R() - 0.5) * 3 * u, lerp(tb.y, ey, 0.5)], [ex, ey]], width: 3.4 * u, profile: PROFILE.twig, tone: 0.95, dry: 0.2, bleed: 0.1, seed: seed + 40 + i }));
    for (let f = 0; f < 2 + R() * 2; f++) {
      const t = 0.35 + R() * 0.65;
      flowerSpots.push({ x: lerp(tb.x, ex, t) + (R() - 0.5) * 8 * u, y: lerp(tb.y, ey, t) + (R() - 0.5) * 6 * u, tip: t > 0.9 });
    }
  });
  // moss dots on the trunk
  for (let i = 0; i < 9; i++) {
    const k = 1 + Math.floor(R() * (trunk.length - 2));
    const [tx, ty] = trunk[k];
    Q.push(() => dotGen(ctx, tx + (R() - 0.5) * 20 * u, ty + (R() - 0.5) * 16 * u, (1.6 + R() * 1.4) * u, { tone: 1, seed: seed + 70 + i }));
  }
  // blossoms & buds
  flowerSpots.sort((p, q) => p.y - q.y);
  flowerSpots.forEach((f, i) => {
    if (f.tip || R() < 0.2) Q.push(() => { bud(ctx, f.x, f.y, (2.2 + R() * 1.2) * u, seed + 90 + i); return [3][Symbol.iterator](); });
    else Q.push(() => blossomGen(ctx, f.x, f.y, (9.5 + R() * 4) * u, { seed: seed + 100 + i, open: R() < 0.25 ? 0.5 : 1 }));
  });
  Q.push(() => { colophon(ctx, '暗香浮動', 26 * u, 22 * u, u, seed); return [1][Symbol.iterator](); });
  return Q;
}

// ─────────────────────────── 난 · Orchid ───────────────────────────

function orchid(ctx, w, h, seed) {
  const R = rng(seed);
  const u = w / 300;
  const Q = [];
  const bx = w * 0.36, by = h * 0.84;

  // soft ground: a pale rock wash and grasses
  Q.push(() => strokeGen(ctx, { pts: [[bx - 60 * u, by + 26 * u], [bx - 10 * u, by + 14 * u], [bx + 60 * u, by + 22 * u], [bx + 110 * u, by + 34 * u]], width: 26 * u, tone: 0.14, dry: 0.3, bleed: 0.9, spread: 0.6, seed: seed + 1 }));

  const leaves = [
    { a: -0.35, L: 0.92, k: 1.6, W: 7.2 },
    { a: 0.05, L: 0.72, k: -1.9, W: 6.8 },
    { a: -0.12, L: 0.55, k: 1.2, W: 6 },
    { a: 0.42, L: 0.5, k: 1.6, W: 5.6 },
    { a: -0.62, L: 0.45, k: -0.9, W: 5.4 },
    { a: 0.2, L: 0.34, k: -1.2, W: 5 },
    { a: -0.28, L: 0.28, k: 0.8, W: 4.6 },
  ];
  leaves.forEach((lf, i) => {
    const L = h * lf.L * (0.9 + R() * 0.15);
    const pts = curve(bx + (R() - 0.5) * 14 * u, by, -Math.PI / 2 + lf.a, L, lf.k, 10, R, 0.04);
    Q.push(() => strokeGen(ctx, { pts, width: lf.W * u, profile: PROFILE.orchid, tone: i > 4 ? 0.7 : 0.93, dry: 0.3, bleed: 0.12, spread: 0.35, side: lf.k > 0 ? 1 : -1, seed: seed + 10 + i }));
  });

  // flowers
  const flowers = [
    { x: bx + 62 * u, y: by - h * 0.36, s: 1 },
    { x: bx - 38 * u, y: by - h * 0.27, s: 0.85 },
    { x: bx + 18 * u, y: by - h * 0.18, s: 0.7 },
  ];
  flowers.forEach((f, i) => {
    Q.push(() => strokeGen(ctx, { pts: [[bx + (R() - 0.5) * 8 * u, by - 4 * u], [lerp(bx, f.x, 0.5) + (R() - 0.5) * 10 * u, lerp(by, f.y, 0.55)], [f.x, f.y + 4 * u]], width: 2 * u, profile: PROFILE.stroke, tone: 0.42, dry: 0.2, bleed: 0.2, seed: seed + 30 + i }));
    const petals = [-1.55, -0.72, 0, 0.72, 1.5];
    const up = -Math.PI / 2 + (R() - 0.5) * 0.5;
    petals.forEach((p, k) => {
      const ang = up + p * (0.9 + R() * 0.15);
      const len = (24 + R() * 10) * u * f.s * (k === 2 ? 0.75 : 1);
      const pts = curve(f.x + Math.cos(ang) * 2 * u, f.y + Math.sin(ang) * 2 * u, ang, len, (k < 2 ? -0.6 : 0.6), 4, R);
      Q.push(() => strokeGen(ctx, { pts, width: 12 * u * f.s, profile: (t) => Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.06)), 0.55), tone: 0.26, dry: 0.04, bleed: 0.7, spread: 0.55, bristles: 8, seed: seed + 40 + i * 7 + k }));
    });
    // the heart: 心-shaped dots
    const dots = [[-3, -2], [2.2, -4.2], [0.4, 0.4]];
    dots.forEach(([dx, dy], k) => Q.push(() => dotGen(ctx, f.x + dx * u * f.s, f.y + dy * u * f.s, 1.7 * u * f.s, { tone: 1, seed: seed + 60 + i * 3 + k })));
  });
  for (let i = 0; i < 6; i++) {
    Q.push(() => dotGen(ctx, bx + (R() - 0.3) * 120 * u, by + (8 + R() * 22) * u, (1.2 + R()) * u, { tone: 0.95, seed: seed + 80 + i }));
  }
  Q.push(() => { colophon(ctx, '空谷幽蘭', w - 26 * u, 22 * u, u, seed); return [1][Symbol.iterator](); });
  return Q;
}

// ─────────────────────────── 국 · Chrysanthemum ───────────────────────────

function chrysanthemum(ctx, w, h, seed) {
  const R = rng(seed);
  const u = w / 300;
  const Q = [];
  const heads = [
    { x: w * 0.56, y: h * 0.29, r: 54 * u, tilt: 0.82 },
    { x: w * 0.3, y: h * 0.47, r: 40 * u, tilt: 0.56 },
  ];
  const budP = { x: w * 0.8, y: h * 0.47, r: 11 * u };
  const base = [w * 0.5, h * 1.02];

  const stems = [
    [base, [w * 0.49, h * 0.76], [w * 0.56, h * 0.52], [heads[0].x, heads[0].y + heads[0].r * 0.55]],
    [[w * 0.49, h * 0.8], [w * 0.4, h * 0.64], [heads[1].x + 4 * u, heads[1].y + heads[1].r * 0.4]],
    [[w * 0.54, h * 0.64], [w * 0.7, h * 0.54], [budP.x, budP.y + budP.r]],
  ];
  stems.forEach((pts, i) => Q.push(() => strokeGen(ctx, { pts, width: (i ? 3 : 4) * u, profile: PROFILE.stroke, tone: 0.62, dry: 0.3, bleed: 0.15, seed: seed + i })));

  // leaves: five-lobed wet blots, veins drawn while the ink is still wet
  const leafSpots = [
    { x: w * 0.48, y: h * 0.86, a: Math.PI + 0.35, dark: true, s: 1.1 },
    { x: w * 0.52, y: h * 0.76, a: -0.35, dark: true, s: 1 },
    { x: w * 0.44, y: h * 0.7, a: Math.PI + 0.1, dark: false, s: 0.95 },
    { x: w * 0.56, y: h * 0.6, a: -0.55, dark: true, s: 0.95 },
    { x: w * 0.4, y: h * 0.6, a: Math.PI - 0.35, dark: true, s: 0.85 },
    { x: w * 0.68, y: h * 0.54, a: 0.15, dark: false, s: 0.75 },
    { x: w * 0.55, y: h * 0.45, a: -0.9, dark: true, s: 0.7 },
  ];
  const veins = [];
  leafSpots.forEach((lf, i) => {
    const tone = lf.dark ? 0.86 : 0.38;
    const L = 58 * u * lf.s;
    const dx = Math.cos(lf.a), dy = Math.sin(lf.a);
    const at = (t) => [lf.x + dx * L * t, lf.y + dy * L * t];
    // tip lobe along the midrib, then two pairs of side lobes
    const lobes = [
      { t0: 0.35, ang: 0, len: 0.62, wd: 21 },
      { t0: 0.18, ang: -1.0, len: 0.42, wd: 17 },
      { t0: 0.2, ang: 1.0, len: 0.42, wd: 17 },
      { t0: 0.52, ang: -0.85, len: 0.34, wd: 15 },
      { t0: 0.55, ang: 0.85, len: 0.34, wd: 15 },
    ];
    lobes.forEach((lb, j) => {
      const [sx, sy] = at(lb.t0);
      const ang = lf.a + lb.ang + (R() - 0.5) * 0.2;
      const pts = curve(sx, sy, ang, L * lb.len, (R() - 0.5) * 0.5, 3, R);
      Q.push(() => strokeGen(ctx, { pts, width: lb.wd * u * lf.s, profile: (t) => Math.pow(Math.sin(Math.PI * Math.min(1, t * 0.86 + 0.12)), 0.55), tone: tone * (0.82 + R() * 0.25), dry: 0.06, bleed: 0.9, spread: 0.6, side: lb.ang < 0 ? -1 : 1, seed: seed + 20 + i * 7 + j }));
      if (lf.dark && j > 0) veins.push({ pts: [at(lb.t0 * 0.9), [sx + Math.cos(ang) * L * lb.len * 0.35, sy + Math.sin(ang) * L * lb.len * 0.35], [sx + Math.cos(ang) * L * lb.len * 0.72, sy + Math.sin(ang) * L * lb.len * 0.72]], seed: seed + 50 + i * 7 + j });
    });
    if (lf.dark) veins.push({ pts: [at(0), at(0.45), at(0.9)], seed: seed + 49 + i });
  });
  veins.forEach((v) => Q.push(() => strokeGen(ctx, { pts: v.pts, width: 1.5 * u, profile: PROFILE.twig, tone: 1, dry: 0.15, bleed: 0.1, seed: v.seed })));

  // flower heads — 구륵: each petal an outlined loop, curling toward the heart
  heads.forEach((hd, i) => {
    Q.push(() => { wash(ctx, hd.x, hd.y, hd.r * 0.92, { rgb: OCHRE, alpha: 0.22, seed: seed + 60 + i, sy: hd.tilt, rim: 0.2 }); return [4][Symbol.iterator](); });
    const rings = [
      { n: 26, r: 1, len: 0.58, tone: 0.62, wd: 0.075 },
      { n: 20, r: 0.78, len: 0.56, tone: 0.66, wd: 0.07 },
      { n: 14, r: 0.54, len: 0.55, tone: 0.72, wd: 0.07 },
      { n: 9, r: 0.3, len: 0.7, tone: 0.8, wd: 0.07 },
    ];
    rings.forEach((ring, ri) => {
      for (let k = 0; k < ring.n; k++) {
        const ang = (k / ring.n) * TAU + ri * 0.37 + (R() - 0.5) * 0.16;
        if (hd.tilt < 0.7 && Math.sin(ang) > 0.45 && ri > 0) continue;
        const rr = hd.r * ring.r * (0.86 + R() * 0.2);
        const inR = rr * (1 - ring.len);
        const hw = hd.r * ring.wd * (0.8 + R() * 0.4);
        const P = (r, side) => {
          const a2 = ang + 0.12 * (1 - r / rr);
          const px = Math.cos(a2) * r - Math.sin(a2) * side, py = Math.sin(a2) * r + Math.cos(a2) * side;
          return [hd.x + px, hd.y + py * hd.tilt];
        };
        const loop = [P(inR, -hw * 0.6), P(lerp(inR, rr, 0.55), -hw), P(rr * 0.97, -hw * 0.45), P(rr, 0), P(rr * 0.97, hw * 0.45), P(lerp(inR, rr, 0.55), hw), P(inR, hw * 0.6)];
        Q.push(() => strokeGen(ctx, { pts: loop, width: 1.7 * u, profile: (t) => 0.55 + 0.45 * Math.sin(Math.PI * t), tone: ring.tone, dry: 0.15, bleed: 0.08, bristles: 3, seed: seed + 100 + i * 80 + ri * 20 + k, chunk: 14 }));
      }
    });
    for (let k = 0; k < 9; k++) {
      const ang = R() * TAU, d = R() * hd.r * 0.12;
      Q.push(() => dotGen(ctx, hd.x + Math.cos(ang) * d, hd.y + Math.sin(ang) * d * hd.tilt, 1.3 * u, { tone: 0.95, seed: seed + 300 + i * 10 + k }));
    }
  });
  // the bud
  for (let k = 0; k < 7; k++) {
    const ang = -Math.PI / 2 + (k - 3) * 0.35;
    const pts = [[budP.x + Math.cos(ang) * budP.r, budP.y + Math.sin(ang) * budP.r], [budP.x, budP.y + budP.r * 0.6]];
    Q.push(() => strokeGen(ctx, { pts, width: 3 * u, profile: PROFILE.petal, tone: 0.55, dry: 0.1, bleed: 0.15, bristles: 6, seed: seed + 400 + k }));
  }
  Q.push(() => { colophon(ctx, '傲霜孤節', 26 * u, 22 * u, u, seed); return [1][Symbol.iterator](); });
  return Q;
}

// ─────────────────────────── 죽 · Bamboo ───────────────────────────

function bamboo(ctx, w, h, seed) {
  const R = rng(seed);
  const u = w / 300;
  const Q = [];
  const pale = [], main = [], front = [];

  function stalk(list, x0, y0, x1, y1, W, tone, side) {
    const bend = (R() - 0.5) * 0.06 * w;
    const P = (t) => [lerp(x0, x1, t) + Math.sin(t * Math.PI) * bend, lerp(y0, y1, t)];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const ts = [0];
    while (ts[ts.length - 1] < 1) {
      const k = ts.length;
      const mid = Math.sin(Math.min(1, ts[ts.length - 1]) * Math.PI);
      ts.push(ts[ts.length - 1] + (0.085 + 0.055 * mid + R() * 0.02) * (h / len));
    }
    const gap = (W * 0.22) / len;
    const nodes = [];
    for (let i = 0; i < ts.length - 1; i++) {
      const ta = ts[i] + gap, tb = Math.min(1.05, ts[i + 1]) - gap;
      const A = P(ta), B = P(tb), M = P((ta + tb) / 2);
      list.push(() => strokeGen(ctx, { pts: [A, [M[0] + (R() - 0.5) * u, M[1]], B], width: W, profile: PROFILE.segment, tone, dry: 0.42, bleed: 0.2, spread: 0.5, side, seed: seed + i * 13 + W, bristles: Math.round(W / u * 2.6) }));
      if (ts[i + 1] < 1) {
        const [nx, ny] = P(ts[i + 1]);
        nodes.push({ x: nx, y: ny, t: ts[i + 1] });
        const mk = [[nx - W * 0.62, ny + W * 0.16], [nx - W * 0.2, ny - W * 0.1], [nx + W * 0.25, ny - W * 0.06], [nx + W * 0.62, ny + W * 0.18]];
        list.push(() => strokeGen(ctx, { pts: mk, width: W * 0.3, profile: PROFILE.stroke, tone: Math.min(1, tone + 0.4), dry: 0.2, bleed: 0.25, seed: seed + i * 17 + 5 }));
      }
    }
    return nodes;
  }

  function leafCluster(list, x, y, baseAng, n, tone, scale = 1) {
    const spread = 1.5;
    for (let k = 0; k < n; k++) {
      const ang = baseAng + (n === 1 ? 0 : (k / (n - 1) - 0.5) * spread) + (R() - 0.5) * 0.25;
      const L = (34 + R() * 26) * u * scale;
      const bendSign = Math.cos(ang) > 0 ? 1 : -1;
      const pts = curve(x, y, ang, L, 0.35 * bendSign, 5, R);
      list.push(() => strokeGen(ctx, { pts, width: (8 + R() * 2.5) * u * scale, profile: PROFILE.leaf, tone, dry: 0.1, bleed: 0.35, spread: 0.3, side: bendSign, seed: seed + 500 + list.length }));
    }
  }

  function twig(list, n, dir, tone, leafTone) {
    let x = n.x, y = n.y;
    let a = -Math.PI / 2 + dir * (0.55 + R() * 0.4);
    const segs = 2 + Math.floor(R() * 2);
    for (let s = 0; s < segs; s++) {
      const len = (22 + R() * 20) * u;
      const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
      list.push(() => strokeGen(ctx, { pts: [[x, y], [ex, ey]], width: 2.3 * u, profile: PROFILE.segment, tone, dry: 0.25, bleed: 0.1, seed: seed + 800 + list.length }));
      if (R() < 0.6) leafCluster(list, ex, ey, Math.PI / 2 - dir * (0.4 + R() * 0.6), 2 + Math.floor(R() * 2), leafTone, 0.85);
      x = ex; y = ey; a += dir * (R() - 0.3) * 0.4;
    }
    leafCluster(list, x, y, Math.PI / 2 - dir * 0.9 + (R() - 0.5) * 0.4, 3 + Math.floor(R() * 2), leafTone);
  }

  // pale stalk behind
  const nodesPale = stalk(pale, w * 0.78, h * 1.04, w * 0.66, h * 0.12, 7 * u, 0.3, -1);
  nodesPale.filter((_, i) => i % 2 === 1).slice(0, 3).forEach((n) => twig(pale, n, -1, 0.3, 0.32));
  // main stalk
  const nodesMain = stalk(main, w * 0.42, h * 1.04, w * 0.5, -h * 0.04, 10.5 * u, 0.62, 1);
  // front twigs & leaves
  nodesMain.forEach((n, i) => {
    if (n.t < 0.3 || R() < 0.35) return;
    twig(front, n, i % 2 ? 1 : -1, 0.85, 0.95);
  });
  leafCluster(front, w * 0.5, h * 0.03, Math.PI / 2 + 0.6, 3, 0.95);
  Q.push(...pale, ...main, ...front);
  Q.push(() => { colophon(ctx, '虛心直節', 26 * u, 22 * u, u, seed); return [1][Symbol.iterator](); });
  return Q;
}

const SUBJECTS = { plum, orchid, chrysanthemum, bamboo };

export function paintSubject(id, ctx, w, h, seed) {
  return SUBJECTS[id](ctx, w, h, seed);
}

// ─────────────────────────── DOM: hanging scrolls ───────────────────────────

export function mountScrolls(container, gentlemen, getLang, t, onStroke) {
  const items = [];
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  gentlemen.forEach((g, i) => {
    const el = document.createElement('div');
    el.className = 'hscroll';
    el.style.setProperty('--silk', g.silk);
    el.style.setProperty('--delay', `${-i * 1.7}s`);
    el.innerHTML = `
      <div class="hscroll-body" tabindex="0" role="button">
        <div class="hscroll-cord"></div>
        <div class="hscroll-rod"></div>
        <div class="hscroll-silk">
          <div class="hscroll-paper"><canvas></canvas></div>
          <span class="hscroll-again"></span>
        </div>
        <div class="hscroll-rod hscroll-rod--bottom"></div>
      </div>
      <div class="hscroll-caption">
        <span class="seal" aria-hidden="true">${g.hanja}</span>
        <p class="hscroll-name"><span class="ko">${g.ko}</span><span class="nm"></span></p>
        <p class="hscroll-season"></p>
        <p class="hscroll-text"></p>
      </div>`;
    container.appendChild(el);
    const canvas = el.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const body = el.querySelector('.hscroll-body');
    const item = { g, el, canvas, ctx, body, painter: new Painter(ctx, { speed: 34 }), seed: 11 + i * 101, painted: false, w: 0 };
    items.push(item);

    body.addEventListener('pointermove', (e) => {
      const r = body.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      body.style.setProperty('--ry', `${x * 10}deg`);
      body.style.setProperty('--rx', `${-y * 6}deg`);
    });
    body.addEventListener('pointerleave', () => { body.style.setProperty('--ry', '0deg'); body.style.setProperty('--rx', '0deg'); });
    const again = () => { item.seed += 7; paint(item, true); onStroke && onStroke(i); };
    body.addEventListener('click', again);
    body.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); again(); } });
  });

  function size(item) {
    const r = item.canvas.getBoundingClientRect();
    const W = Math.max(10, Math.round(r.width * dpr)), H = Math.max(10, Math.round(r.height * dpr));
    if (W === item.canvas.width && H === item.canvas.height) return false;
    item.canvas.width = W; item.canvas.height = H; item.w = W;
    return true;
  }

  function paint(item, animate) {
    size(item);
    const { ctx, canvas } = item;
    item.painter.clear();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const q = paintSubject(item.g.id, ctx, canvas.width, canvas.height, item.seed);
    q.forEach((f) => item.painter.add(f));
    item.painted = true;
    if (animate && !reduce) item.painter.run();
    else item.painter.finish();
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const item = items.find((it) => it.el === e.target);
      if (!item || item.painted) return;
      const idx = items.indexOf(item);
      setTimeout(() => paint(item, true), idx * 450);
      io.unobserve(e.target);
    });
  }, { threshold: 0.3 });

  const fontsReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('500 20px "Noto Serif KR"', '暗香浮動空谷幽蘭傲霜孤節虛心直節'), document.fonts.load('900 20px "Noto Serif KR"', '美花')]).catch(() => {})
    : Promise.resolve();
  fontsReady.then(() => items.forEach((it) => io.observe(it.el)));

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => items.forEach((it) => { if (it.painted && size(it)) paint(it, false); }), 250);
  });

  function setLang(lang) {
    items.forEach(({ g, el, body }) => {
      el.querySelector('.nm').textContent = g.name[lang] === g.ko ? '' : g.name[lang];
      el.querySelector('.hscroll-season').textContent = g.season[lang];
      el.querySelector('.hscroll-text').textContent = g.text[lang];
      el.querySelector('.hscroll-again').textContent = t('gent.again');
      body.setAttribute('aria-label', `${g.name[lang]} — ${t('gent.again')}`);
    });
  }
  return { setLang };
}
