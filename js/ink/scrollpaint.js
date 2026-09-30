// ─────────────────────────────────────────────────────────────────────────────
//  A long handscroll landscape (두루마리) painted under the France–Korea timeline,
//  with small motifs beside some of the years.
// ─────────────────────────────────────────────────────────────────────────────
import { rng, noise1, stroke, stamp, wash, blossomGen, bud, PROFILE, INK, PLUM } from './brush.js';

const run = (g) => { while (!g.next().done); };

function ridgeFill(ctx, xs, ys, baseY, tone, depth) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(xs[0], baseY);
  for (let i = 0; i < xs.length; i++) ctx.lineTo(xs[i], ys[i]);
  ctx.lineTo(xs[xs.length - 1], baseY);
  ctx.closePath();
  const minY = Math.min(...ys);
  const grd = ctx.createLinearGradient(0, minY, 0, minY + depth);
  grd.addColorStop(0, `rgba(27,23,21,${tone})`);
  grd.addColorStop(0.35, `rgba(27,23,21,${tone * 0.45})`);
  grd.addColorStop(1, 'rgba(27,23,21,0)');
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();
}

function range(ctx, W, H, { seed, y0, amp, tone, line, depth, freq = 1, spikes = 0 }) {
  const R = rng(seed);
  const xs = [], ys = [];
  const step = 6;
  const peaks = [];
  for (let k = 0; k < spikes; k++) peaks.push({ c: R() * W, h: amp * (0.5 + R() * 0.8), w: 30 + R() * 90 });
  for (let x = -20; x <= W + 20; x += step) {
    const n = noise1(x * 0.0022 * freq, seed) * 0.6 + noise1(x * 0.007 * freq, seed + 1) * 0.3 + noise1(x * 0.03, seed + 2) * 0.1;
    let y = y0 - n * amp;
    for (const p of peaks) {
      const d = Math.abs(x - p.c) / p.w;
      if (d < 1) y = Math.min(y, y0 - amp * 0.3 - p.h * Math.pow(1 - d, 1.5));
    }
    xs.push(x); ys.push(y);
  }
  ridgeFill(ctx, xs, ys, H, tone * 0.55, depth);
  // brush contour, in broken lengths
  let i = 0;
  while (i < xs.length - 2) {
    const len = 30 + Math.floor(R() * 60);
    const pts = [];
    for (let k = i; k < Math.min(xs.length, i + len); k += 3) pts.push([xs[k], ys[k] + 1]);
    if (pts.length > 2) stroke(ctx, { pts, width: line * (0.7 + R() * 0.6), profile: PROFILE.stroke, tone, dry: 0.45, bleed: 0.2, spread: 0.5, seed: seed + i, chunk: 40 });
    i += len - (R() < 0.3 ? -6 : 2);
  }
  return { xs, ys, at: (x) => { const k = Math.max(0, Math.min(xs.length - 1, Math.round((x + 20) / step))); return ys[k]; } };
}

function pine(ctx, x, y, s, seed) {
  const R = rng(seed);
  stroke(ctx, { pts: [[x, y], [x + (R() - 0.5) * 6 * s, y - 14 * s], [x + (R() - 0.5) * 8 * s, y - 30 * s]], width: 3 * s, profile: PROFILE.twig, tone: 0.85, dry: 0.4, seed });
  for (let k = 0; k < 4; k++) {
    const yy = y - (10 + k * 6) * s;
    wash(ctx, x + (R() - 0.5) * 6 * s, yy, (9 - k * 1.3) * s, { rgb: INK, alpha: 0.55, sx: 1.4, sy: 0.35, seed: seed + k, rim: 0.3 });
  }
}

function ship(ctx, x, y, s, seed) {
  const L = (pts, w, tone = 0.9, sd = 0) => stroke(ctx, { pts, width: w * s, tone, dry: 0.3, bleed: 0.15, seed: seed + sd, profile: PROFILE.stroke });
  L([[x - 40 * s, y - 6 * s], [x - 20 * s, y + 4 * s], [x + 30 * s, y + 4 * s], [x + 46 * s, y - 8 * s]], 4, 0.95, 1);
  [[-18, 52], [4, 62], [24, 46]].forEach(([dx, h], i) => {
    L([[x + dx * s, y], [x + dx * s, y - h * s]], 1.8, 0.9, 2 + i);
    ctx.fillStyle = 'rgba(27,23,21,0.14)';
    ctx.beginPath();
    ctx.moveTo(x + (dx - 12) * s, y - (h - 8) * s);
    ctx.quadraticCurveTo(x + (dx + 2) * s, y - (h - 20) * s, x + (dx - 12) * s, y - 12 * s);
    ctx.lineTo(x + (dx + 12) * s, y - 12 * s);
    ctx.quadraticCurveTo(x + (dx + 16) * s, y - (h - 20) * s, x + (dx + 12) * s, y - (h - 8) * s);
    ctx.closePath();
    ctx.fill();
  });
  for (let k = 0; k < 4; k++) L([[x - 60 * s + k * 34 * s, y + 12 * s], [x - 40 * s + k * 34 * s, y + 10 * s]], 1.2, 0.35, 10 + k);
}

function pavilion(ctx, x, y, s, seed) {
  const L = (pts, w, tone = 0.95, sd = 0) => stroke(ctx, { pts, width: w * s, tone, dry: 0.25, bleed: 0.15, seed: seed + sd, profile: PROFILE.stroke });
  ctx.fillStyle = 'rgba(27,23,21,0.2)';
  ctx.beginPath(); ctx.moveTo(x - 40 * s, y - 42 * s); ctx.quadraticCurveTo(x, y - 36 * s, x + 40 * s, y - 42 * s); ctx.lineTo(x + 12 * s, y - 56 * s); ctx.lineTo(x - 12 * s, y - 56 * s); ctx.closePath(); ctx.fill();
  L([[x - 50 * s, y - 52 * s], [x - 40 * s, y - 42 * s], [x - 20 * s, y - 37 * s], [x, y - 36 * s], [x + 20 * s, y - 37 * s], [x + 40 * s, y - 42 * s], [x + 50 * s, y - 52 * s]], 3.6, 0.95, 1);
  L([[x - 36 * s, y - 42 * s], [x - 12 * s, y - 56 * s], [x + 12 * s, y - 56 * s], [x + 36 * s, y - 42 * s]], 2.4, 0.9, 2);
  L([[x - 16 * s, y - 57 * s], [x + 16 * s, y - 57 * s]], 3, 0.95, 5);
  [-24, -8, 8, 24].forEach((dx, i) => L([[x + dx * s, y - 36 * s], [x + dx * s, y - 4 * s]], 1.8, 0.9, 3 + i));
  L([[x - 34 * s, y - 2 * s], [x + 34 * s, y - 2 * s]], 3, 0.9, 9);
}

function eiffel(ctx, x, y, s, seed) {
  const L = (pts, w, tone = 0.92, sd = 0) => stroke(ctx, { pts, width: w * s, tone, dry: 0.3, bleed: 0.12, seed: seed + sd, profile: PROFILE.stroke });
  // two sweeping legs, the arch, the platforms, the spire
  L([[x - 34 * s, y], [x - 20 * s, y - 40 * s], [x - 9 * s, y - 92 * s], [x - 2.5 * s, y - 150 * s]], 3, 0.92, 1);
  L([[x + 34 * s, y], [x + 20 * s, y - 40 * s], [x + 9 * s, y - 92 * s], [x + 2.5 * s, y - 150 * s]], 3, 0.92, 2);
  L([[x - 24 * s, y], [x - 12 * s, y - 20 * s], [x, y - 25 * s], [x + 12 * s, y - 20 * s], [x + 24 * s, y]], 2, 0.8, 3);
  L([[x - 25 * s, y - 34 * s], [x + 25 * s, y - 34 * s]], 2.4, 0.9, 4);
  L([[x - 11 * s, y - 86 * s], [x + 11 * s, y - 86 * s]], 2, 0.9, 5);
  L([[x, y - 150 * s], [x, y - 176 * s]], 1.6, 0.95, 6);
  for (let k = 0; k < 7; k++) {
    const t = k / 7;
    const yy = y - 40 * s - t * 100 * s;
    const hw = (20 - t * 16) * s;
    L([[x - hw, yy], [x + hw * 0.9, yy - 12 * s]], 0.7, 0.45, 20 + k);
    L([[x + hw, yy], [x - hw * 0.9, yy - 12 * s]], 0.7, 0.45, 40 + k);
  }
}

function plumSpray(ctx, x, y, s, seed) {
  const R = rng(seed);
  stroke(ctx, { pts: [[x - 70 * s, y + 30 * s], [x - 30 * s, y + 6 * s], [x - 4 * s, y - 20 * s], [x + 30 * s, y - 36 * s]], width: 7 * s, profile: PROFILE.twig, tone: 0.85, dry: 0.6, seed });
  stroke(ctx, { pts: [[x - 30 * s, y + 6 * s], [x - 20 * s, y - 36 * s], [x - 14 * s, y - 70 * s]], width: 3 * s, profile: PROFILE.twig, tone: 0.95, dry: 0.2, seed: seed + 1 });
  stroke(ctx, { pts: [[x - 4 * s, y - 20 * s], [x + 20 * s, y - 60 * s], [x + 26 * s, y - 84 * s]], width: 2.6 * s, profile: PROFILE.twig, tone: 0.95, dry: 0.2, seed: seed + 2 });
  [[-16, -48], [-12, -66], [14, -52], [24, -76], [28, -36], [-40, 0], [4, -24]].forEach(([dx, dy], i) => {
    if (i === 3) bud(ctx, x + dx * s, y + dy * s, 3 * s, seed + i);
    else run(blossomGen(ctx, x + dx * s, y + dy * s, (8 + R() * 3) * s, { seed: seed + 10 + i }));
  });
}

export function paintHandscroll(canvas, W, H, events, eventXs, dpr) {
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const s = Math.max(0.7, Math.min(1.25, H / 560));

  // far, middle, near ranges
  range(ctx, W, H, { seed: 3, y0: H * 0.66, amp: H * 0.22, tone: 0.3, line: 1.6, depth: H * 0.24, freq: 1.3, spikes: Math.round(W / 240) });
  // mist band
  for (let i = 0; i < W / 70; i++) stamp(ctx, Math.random() * W, H * (0.64 + Math.random() * 0.05), 60 + Math.random() * 60, [242, 235, 221], 0.45, 0.2);
  const mid = range(ctx, W, H, { seed: 11, y0: H * 0.8, amp: H * 0.19, tone: 0.56, line: 2.6, depth: H * 0.22, freq: 1, spikes: Math.round(W / 420) });
  const near = range(ctx, W, H, { seed: 29, y0: H * 0.96, amp: H * 0.11, tone: 0.82, line: 3.6, depth: H * 0.13, freq: 0.8 });
  // water lines
  const R = rng(5);
  for (let i = 0; i < W / 90; i++) {
    const x = R() * W, y = H * (0.86 + R() * 0.08), l = 30 + R() * 80;
    stroke(ctx, { pts: [[x, y], [x + l * 0.5, y - 1.5], [x + l, y]], width: 1.4, tone: 0.25, dry: 0.3, bleed: 0.1, seed: i, profile: PROFILE.stroke });
  }
  // pines along the near ridge
  for (let x = 120; x < W; x += 240 + R() * 260) pine(ctx, x, near.at(x) + 2, s * 0.9, (x | 0) + 1);

  // motifs beside the years
  const motif = { 1866: ship, 1886: pavilion, 1900: eiffel, 1951: (c, x, y, sc, sd) => { pine(c, x - 20 * sc, y, sc * 1.3, sd); pine(c, x + 18 * sc, y + 2, sc * 1.1, sd + 3); }, 2026: plumSpray };
  events.forEach((ev, i) => {
    const fn = motif[ev.year];
    if (!fn) return;
    const x = eventXs[i] + 210 * s;
    const y = ev.year === '1866' ? H * 0.9 : mid.at(x) + 4;
    fn(ctx, x, y, s, 100 + i * 17);
  });
}
