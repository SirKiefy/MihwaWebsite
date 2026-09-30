// ─────────────────────────────────────────────────────────────────────────────
//  여백의 미 — a small ink studio on hanji.
//  The brush is a bundle of bristles; it runs dry as you paint, spreads when
//  you linger, and thins out when you move fast — like a real brush.
// ─────────────────────────────────────────────────────────────────────────────
import { rng, noise1, stamp, blossomGen, sealStamp, INK, Painter } from './brush.js';

export function drawHanji(g, w, h, seed = 1) {
  const R = rng(seed);
  g.fillStyle = '#f6efe1';
  g.fillRect(0, 0, w, h);
  // mottling
  for (let i = 0; i < 26; i++) {
    const x = R() * w, y = R() * h, r = (0.05 + R() * 0.2) * Math.max(w, h);
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    const warm = R() < 0.5;
    grd.addColorStop(0, warm ? 'rgba(214,196,160,0.035)' : 'rgba(255,253,246,0.14)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // fibres (닥섬유)
  g.lineCap = 'round';
  const n = Math.round((w * h) / 2600);
  for (let i = 0; i < n; i++) {
    const x = R() * w, y = R() * h, a = R() * Math.PI * 2, l = 8 + R() * 38;
    g.strokeStyle = R() < 0.55 ? `rgba(160,132,92,${0.03 + R() * 0.05})` : `rgba(255,255,255,${0.22 + R() * 0.25})`;
    g.lineWidth = 0.4 + R() * 0.7;
    g.beginPath();
    g.moveTo(x, y);
    g.bezierCurveTo(x + Math.cos(a) * l * 0.3 + (R() - 0.5) * 10, y + Math.sin(a) * l * 0.3 + (R() - 0.5) * 10, x + Math.cos(a) * l * 0.7 + (R() - 0.5) * 10, y + Math.sin(a) * l * 0.7 + (R() - 0.5) * 10, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
}

export function mountStudio({ root, canvas, hint, onPaint, onTool }) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  let tool = 'ink', tone = 0.95, size = 22;
  const painter = new Painter(ctx, { speed: 40 });

  function resize() {
    const r = canvas.getBoundingClientRect();
    const nw = Math.max(10, Math.round(r.width * dpr)), nh = Math.max(10, Math.round(r.height * dpr));
    if (nw === W && nh === H) return;
    const old = W ? (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(canvas, 0, 0); return c; })() : null;
    W = canvas.width = nw; H = canvas.height = nh;
    drawHanji(ctx, W, H, 5);
    if (old) ctx.drawImage(old, 0, 0, W, H);
  }

  // ── brush state ──
  let drawing = false;
  let pid = null;
  let bristles = [];
  let last = null;
  let prev2 = null;
  let wet = [];
  let loop = 0;
  let touched = false;
  let seedN = 0;

  function newBristles() {
    const R = rng((Math.random() * 1e9) | 0);
    const nb = 20;
    bristles = [];
    for (let j = 0; j < nb; j++) {
      const o = (j / (nb - 1)) * 2 - 1 + (R() - 0.5) * 0.08;
      bristles.push({ o, ink: 1 + R() * 0.35, rate: (0.55 + R() * 0.9) * (1 + Math.abs(o) * 1.1), tone: 1 - 0.4 * ((o + 1) / 2) * (0.5 + R() * 0.5), wf: 0.8 + R() * R() * 2, px: 0, py: 0 });
    }
    seedN = R() * 100;
  }

  function toLocal(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr, t: e.timeStamp || performance.now(), p: e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : null };
  }

  function segment(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const steps = Math.max(1, Math.ceil(len / (1.4 * dpr)));
    const [ir, ig, ib] = INK;
    // wet body underneath
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const w = a.w + (b.w - a.w) * t;
      stamp(ctx, a.x + dx * t, a.y + dy * t, w * 0.56, INK, tone * (0.045 + 0.07 * (1 - tone)), 0.3);
    }
    // Bristles are painted as opaque greys with 'darken': where a bristle crosses
    // itself (or the seam between two pointer samples) nothing piles up, while
    // dark ink still wins over pale ink — so no hatching, just streaks.
    ctx.save();
    ctx.globalCompositeOperation = 'darken';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const br of bristles) {
      ctx.beginPath();
      let pen = false;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const w = a.w + (b.w - a.w) * t;
        const nx = a.nx + (b.nx - a.nx) * t, ny = a.ny + (b.ny - a.ny) * t;
        const x = a.x + dx * t + nx * br.o * w * 0.5;
        const y = a.y + dy * t + ny * br.o * w * 0.5;
        const skip = br.ink < 0.3 && Math.random() > br.ink * 2.8;
        if (!skip) {
          if (!pen) { ctx.moveTo(br.px, br.py); pen = true; }
          ctx.lineTo(x, y);
        } else pen = false;
        br.px = x; br.py = y;
      }
      br.ink -= (len / dpr) * 0.00045 * br.rate;
      const al = Math.max(0, Math.min(1, br.ink * 1.7)) * br.tone * tone * (0.55 + 0.45 * tone);
      const mix = (p, q) => Math.round(p + (q - p) * al);
      ctx.lineWidth = Math.max(0.6, (b.w / bristles.length) * 2.2 * br.wf);
      ctx.strokeStyle = `rgb(${mix(246, ir)},${mix(239, ig)},${mix(225, ib)})`;
      ctx.stroke();
    }
    ctx.restore();
  }

  function makePoint(pt, prev) {
    let nx = 0, ny = 1, speed = 0;
    if (prev) {
      const dx = pt.x - prev.x, dy = pt.y - prev.y, l = Math.hypot(dx, dy) || 1;
      nx = -dy / l; ny = dx / l;
      speed = l / dpr / Math.max(4, pt.t - prev.t); // px per ms
      // smooth the normal to avoid twisting
      nx = prev.nx * 0.5 + nx * 0.5; ny = prev.ny * 0.5 + ny * 0.5;
      const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    }
    const dist = prev ? prev.dist + Math.hypot(pt.x - prev.x, pt.y - prev.y) : 0;
    const press = pt.p != null ? 0.25 + pt.p * 1.1 : Math.max(0.35, Math.min(1.25, 1.25 - speed * 0.55));
    // the brush is pressed down gradually, and never quite even
    const ramp = 0.3 + 0.7 * Math.min(1, dist / (size * dpr * 2.2));
    const wobble = 0.86 + 0.28 * noise1(dist * 0.012 / dpr, seedN);
    const target = size * dpr * press * ramp * wobble;
    const w = prev ? prev.w + (target - prev.w) * 0.35 : size * dpr * 0.3;
    return { ...pt, nx, ny, w, speed, dist };
  }

  function down(e) {
    if (e.button !== undefined && e.button !== 0) return;
    const pt = toLocal(e);
    if (!touched) { touched = true; hint && hint.classList.add('is-hidden'); }
    if (tool === 'blossom') {
      const r = (size * 0.55 + 10) * dpr;
      painter.add(() => blossomGen(ctx, pt.x, pt.y, r, { seed: (Math.random() * 1e6) | 0 }));
      painter.run();
      onPaint && onPaint('blossom', e);
      return;
    }
    if (tool === 'seal') {
      sealStamp(ctx, pt.x, pt.y, Math.max(44, size * 2.8) * dpr, '美花', { seed: (Math.random() * 1e6) | 0, rot: (Math.random() - 0.5) * 0.08 });
      onPaint && onPaint('seal', e);
      return;
    }
    drawing = true;
    pid = e.pointerId;
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    newBristles();
    last = makePoint(pt, null);
    for (const br of bristles) { br.px = last.x + br.o * last.w * 0.5; br.py = last.y; }
    // the brush touches down: a wet blot
    stamp(ctx, pt.x, pt.y, size * dpr * 0.45, INK, tone * 0.35, 0.4);
    wet.push({ x: pt.x, y: pt.y, r: size * dpr * 0.5, age: 0 });
    kick();
    onPaint && onPaint('ink', e);
    e.preventDefault();
  }

  function move(e) {
    if (!drawing || e.pointerId !== pid) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of evs.length ? evs : [e]) {
      const pt = makePoint(toLocal(ev), last);
      if (Math.hypot(pt.x - last.x, pt.y - last.y) < 0.8) continue;
      segment(last, pt);
      if (pt.speed < 0.2 && Math.random() < 0.3) wet.push({ x: pt.x, y: pt.y, r: pt.w * 0.55, age: 0 });
      prev2 = last;
      last = pt;
    }
    kick();
    e.preventDefault();
  }

  function up(e) {
    if (!drawing || (e && e.pointerId !== pid)) return;
    drawing = false;
    if (last && prev2) {
      // lift-off: the tip leaves the paper in a fine point
      let dx = last.x - prev2.x, dy = last.y - prev2.y;
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const len = Math.min(size * dpr * 1.3, last.w * 1.6);
      let p = last;
      for (let k = 1; k <= 6; k++) {
        const t = k / 6;
        const q = { ...last, x: last.x + dx * len * t, y: last.y + dy * len * t, w: last.w * Math.pow(1 - t, 1.3) + 0.3 };
        segment(p, q);
        p = q;
      }
    }
    last = null;
    prev2 = null;
  }

  // ink keeps spreading into the paper for a moment
  function kick() {
    if (loop) return;
    const tick = () => {
      loop = 0;
      if (!wet.length) return;
      for (let i = wet.length - 1; i >= 0; i--) {
        const w = wet[i];
        w.age++;
        stamp(ctx, w.x, w.y, w.r * (1 + w.age * 0.022), INK, tone * 0.0075 * (1 - w.age / 36) * (1.3 - tone * 0.3), 0.15);
        if (w.age > 36) wet.splice(i, 1);
      }
      if (wet.length > 120) wet.splice(0, wet.length - 120);
      loop = requestAnimationFrame(tick);
    };
    loop = requestAnimationFrame(tick);
  }

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('lostpointercapture', up);

  function clear() {
    painter.clear();
    wet = [];
    const snapshot = document.createElement('canvas');
    snapshot.width = W; snapshot.height = H;
    drawHanji(snapshot.getContext('2d'), W, H, 5);
    let f = 0;
    const step = () => {
      f++;
      ctx.globalAlpha = 0.12;
      ctx.drawImage(snapshot, 0, 0);
      ctx.globalAlpha = 1;
      if (f < 34) requestAnimationFrame(step);
      else ctx.drawImage(snapshot, 0, 0);
    };
    requestAnimationFrame(step);
  }

  /** a PNG of the painting, as a data URL */
  function snapshot() {
    return canvas.toDataURL('image/png');
  }

  new ResizeObserver(() => resize()).observe(canvas);
  resize();

  return {
    setTool(t, tn) { tool = t; if (tn != null) tone = tn; onTool && onTool(tool); },
    setSize(s) { size = s; },
    get size() { return size; },
    get tool() { return tool; },
    clear, snapshot,
  };
}
