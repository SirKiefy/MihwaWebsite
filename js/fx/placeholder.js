// Film-style placeholder frames, used until her real photos are added in her.js.
// Each one is a moody, out-of-focus frame: warm gradients, light leaks, bokeh, grain.
import { rng } from '../ink/brush.js';

const TONES = [
  ['#2c1f1b', '#b9805f', '#f0b27a'], // amber
  ['#2a2419', '#c9a26a', '#ffd9a0'], // golden hour
  ['#1f2826', '#8fa597', '#e8e1c8'], // dusty teal
  ['#2d1d20', '#c4898a', '#f6c9c0'], // rose
  ['#26251c', '#a99d73', '#efe2b6'], // olive
  ['#1b202b', '#7b8aa6', '#d9d4e4'], // blue hour
  ['#2e211d', '#d19a7e', '#ffd2b8'], // peach
  ['#231c17', '#a88867', '#ead3ae'], // sepia
  ['#1f1c24', '#9b8aa4', '#f0d7d7'], // lilac dusk
  ['#27201a', '#b48b62', '#f7c98f'], // tungsten
  ['#1d2320', '#96a58c', '#f1e6c4'], // green room
  ['#2b1b18', '#c07a62', '#f5b89a'], // last light
];

export function makePlaceholder(i, aspect = 4 / 5, label = 'your photo here', long = 900) {
  const w = aspect >= 1 ? long : Math.round(long * aspect);
  const h = aspect >= 1 ? Math.round(long / aspect) : long;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const R = rng(1000 + i * 17);
  const [dark, mid, light] = TONES[i % TONES.length];

  // base: a soft diagonal light fall
  const a = R() * Math.PI * 2;
  const grd = g.createLinearGradient(w / 2 - Math.cos(a) * w, h / 2 - Math.sin(a) * h, w / 2 + Math.cos(a) * w, h / 2 + Math.sin(a) * h);
  grd.addColorStop(0, dark);
  grd.addColorStop(0.55, mid);
  grd.addColorStop(1, light);
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);

  // big soft shapes, like an out-of-focus room
  for (let k = 0; k < 7; k++) {
    const x = R() * w, y = R() * h, r = (0.25 + R() * 0.5) * Math.max(w, h);
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    const col = R() < 0.5 ? dark : light;
    rg.addColorStop(0, hexA(col, 0.35 + R() * 0.25));
    rg.addColorStop(1, hexA(col, 0));
    g.fillStyle = rg;
    g.fillRect(0, 0, w, h);
  }

  // bokeh
  g.globalCompositeOperation = 'screen';
  const nb = 10 + Math.floor(R() * 14);
  for (let k = 0; k < nb; k++) {
    const x = R() * w, y = R() * h * 0.8, r = (0.015 + R() * 0.05) * w;
    const rg = g.createRadialGradient(x, y, r * 0.6, x, y, r);
    rg.addColorStop(0, hexA(light, 0.16 + R() * 0.2));
    rg.addColorStop(0.9, hexA(light, 0.2 + R() * 0.2));
    rg.addColorStop(1, hexA(light, 0));
    g.fillStyle = rg;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  // light leak from one edge
  const lx = R() < 0.5 ? 0 : w, ly = R() * h;
  const leak = g.createRadialGradient(lx, ly, 0, lx, ly, w * 0.9);
  leak.addColorStop(0, 'rgba(255,120,60,0.55)');
  leak.addColorStop(0.35, 'rgba(255,90,50,0.18)');
  leak.addColorStop(1, 'rgba(255,90,50,0)');
  g.fillStyle = leak;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over';

  // vignette
  const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);

  // grain
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let p = 0; p < d.length; p += 4) {
    const n = (R() - 0.5) * 22;
    d[p] += n; d[p + 1] += n; d[p + 2] += n;
  }
  g.putImageData(img, 0, 0);

  // label
  const fs = Math.round(w * 0.032);
  g.font = `500 ${fs}px "DM Mono", ui-monospace, monospace`;
  g.fillStyle = 'rgba(255,248,236,0.72)';
  g.textBaseline = 'bottom';
  g.fillText(`${String(i + 1).padStart(2, '0')}  ·  ${label}`, fs * 1.4, h - fs * 1.3);

  return { canvas: c, url: c.toDataURL('image/jpeg', 0.88), width: w, height: h, placeholder: true };
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/**
 * Resolve every photo to something drawable: a loaded <img> for real files,
 * or a painted placeholder. Missing files fall back to placeholders.
 */
export async function loadPhotos(list, label) {
  return Promise.all(list.map((p, i) => new Promise((resolve) => {
    const fallback = () => resolve({ ...makePlaceholder(i, p.aspect || 4 / 5, label), meta: p, index: i });
    if (!p.src) return fallback();
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve({ image: img, url: p.src, width: img.naturalWidth, height: img.naturalHeight, placeholder: false, meta: p, index: i });
    img.onerror = fallback;
    img.src = p.src;
  })));
}
