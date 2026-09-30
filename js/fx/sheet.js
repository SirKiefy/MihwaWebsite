// ─────────────────────────────────────────────────────────────────────────────
//  Contact sheet on a light table: film strips, a loupe that follows the
//  cursor, and red grease-pencil circles around her best poses.
// ─────────────────────────────────────────────────────────────────────────────
import { rng, noise1 } from '../ink/brush.js';

const TAU = Math.PI * 2;

/** A hand-drawn loop: one pass and a little overshoot, never quite closed. */
export function pencilLoop(cx, cy, rx, ry, seed) {
  const R = rng(seed);
  const start = -Math.PI * 0.6 + (R() - 0.5) * 0.6;
  const sweep = TAU + 0.45 + R() * 0.35;
  const n = 36;
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const a = start + t * sweep;
    const wob = 1 + (noise1(t * 5 + seed, seed) - 0.5) * 0.1 + t * 0.07;
    pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob * (1 + (R() - 0.5) * 0.01)]);
  }
  // Catmull–Rom → cubic Bézier
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export function mountSheet(root, photos, { favourites = [], notes = () => [], onOpen, fine = true } = {}) {
  const strips = root.querySelector('.strips');
  const svg = root.querySelector('.marks');
  const notesEl = root.querySelector('.gp-notes');
  const loupe = document.querySelector('.loupe');
  let cols = 0;
  let frames = [];

  function build() {
    const w = root.clientWidth;
    const c = w > 1080 ? 6 : w > 700 ? 4 : 3;
    if (c === cols && frames.length) { drawMarks(); return; }
    cols = c;
    strips.innerHTML = '';
    frames = [];
    for (let r = 0; r * cols < photos.length; r++) {
      const row = photos.slice(r * cols, r * cols + cols);
      const strip = document.createElement('div');
      strip.className = 'strip';
      strip.style.setProperty('--cols', cols);
      const edgeTop = document.createElement('div');
      edgeTop.className = 'strip-edge';
      edgeTop.textContent = `MIHWA 400   ◂ ${r * cols + 1}   ${'▸ '.repeat(3)}   5063   ◂ ${r * cols + 1}A`;
      const inner = document.createElement('div');
      inner.className = 'strip-frames';
      row.forEach((ph, k) => {
        const i = r * cols + k;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cf';
        b.dataset.i = i;
        b.setAttribute('aria-label', `${i + 1}`);
        const img = document.createElement('img');
        img.src = ph.url;
        img.alt = '';
        img.loading = 'lazy';
        img.draggable = false;
        const num = document.createElement('span');
        num.className = 'cf-num';
        num.textContent = `${i + 1}${i % 2 ? 'A' : ''}`;
        b.append(img, num);
        b.addEventListener('click', (e) => onOpen && onOpen(i, e));
        if (fine) {
          b.addEventListener('pointermove', (e) => moveLoupe(e, b, ph));
          b.addEventListener('pointerleave', () => loupe.classList.remove('is-on'));
        }
        inner.appendChild(b);
        frames.push(b);
      });
      const edgeBot = document.createElement('div');
      edgeBot.className = 'strip-edge strip-edge--bottom';
      edgeBot.textContent = row.map((_, k) => `▸ ${r * cols + k + 1}`).join('          ');
      strip.append(edgeTop, inner, edgeBot);
      strips.appendChild(strip);
    }
    requestAnimationFrame(drawMarks);
  }

  function drawMarks() {
    const box = root.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.setAttribute('width', box.width);
    svg.setAttribute('height', box.height);
    svg.innerHTML = '';
    notesEl.innerHTML = '';
    const words = notes();
    favourites.filter((i) => frames[i]).forEach((i, n) => {
      const r = frames[i].getBoundingClientRect();
      const cx = r.left - box.left + r.width / 2, cy = r.top - box.top + r.height / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pencilLoop(cx, cy, r.width * 0.56, r.height * 0.55, 7 + i * 13));
      path.setAttribute('class', 'gp');
      path.style.setProperty('--d', `${n * 0.35}s`);
      svg.appendChild(path);
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = root.classList.contains('is-drawn') ? '0' : `${len}`;
      path.dataset.len = len;
      const note = document.createElement('span');
      note.className = 'gp-note';
      note.textContent = words[n % words.length] || '';
      const right = cx + r.width * 0.55 < box.width - 90;
      note.style.left = `${right ? cx + r.width * 0.42 : cx - r.width * 0.42}px`;
      note.style.top = `${cy - r.height * 0.66}px`;
      note.style.setProperty('--rot', `${(right ? -1 : 1) * (5 + (i % 3) * 3)}deg`);
      note.style.setProperty('--d', `${n * 0.35 + 0.7}s`);
      if (!right) note.classList.add('is-left');
      notesEl.appendChild(note);
    });
  }

  // loupe: 2.6× through a round glass
  const Z = 2.6;
  function moveLoupe(e, b, ph) {
    const r = b.querySelector('img').getBoundingClientRect();
    const L = loupe.offsetWidth || 190;
    const s = Math.max(r.width / ph.width, r.height / ph.height);
    const dw = ph.width * s, dh = ph.height * s;
    const ix = e.clientX - r.left - (r.width - dw) / 2, iy = e.clientY - r.top - (r.height - dh) / 2;
    loupe.style.backgroundImage = `url("${ph.url}")`;
    loupe.style.backgroundSize = `${dw * Z}px ${dh * Z}px`;
    loupe.style.backgroundPosition = `${-(ix * Z - L / 2)}px ${-(iy * Z - L / 2)}px`;
    loupe.style.transform = `translate3d(${e.clientX - L / 2}px, ${e.clientY - L / 2}px, 0)`;
    loupe.classList.add('is-on');
  }

  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) {
      root.classList.add('is-drawn');
      svg.querySelectorAll('.gp').forEach((p) => { p.style.strokeDashoffset = '0'; });
      io.disconnect();
    }
  }), { threshold: 0.35 });
  io.observe(root);

  build();
  let rt;
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(build, 120); }).observe(root);
  return { redraw: drawMarks };
}
