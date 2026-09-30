// ─────────────────────────────────────────────────────────────────────────────
//  Mihwa · 미화 — a roll of film, framed in ink.
// ─────────────────────────────────────────────────────────────────────────────
import { LANGS, STRINGS } from './i18n.js';
import { HER, PHOTOS, LETTER } from './her.js';
import { loadPhotos } from './fx/placeholder.js';
import { mountSheet, pencilLoop } from './fx/sheet.js';
import { extractPalette } from './fx/palette.js';
import { mountLightbox } from './fx/lightbox.js';
import { makeGrainDataURL, makeDeckle } from './scene/inktex.js';
import { setSound, pluck, phrase, shutter } from './audio.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const mobile = matchMedia('(max-width: 820px), (pointer: coarse)').matches;
const root = document.documentElement;
const IG_URL = `https://www.instagram.com/${HER.instagram}/`;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

// ─────────────────────────── paper, grain & ink edges ───────────────────────────
root.style.setProperty('--grain', `url(${makeGrainDataURL()})`);
root.style.setProperty('--edge-dark-top', makeDeckle('#0e0a09', false));
root.style.setProperty('--edge-dark-bottom', makeDeckle('#0e0a09', true));

// ─────────────────────────── language ───────────────────────────
function guessLang() {
  const saved = store.get('mihwa-lang');
  if (LANGS.includes(saved)) return saved;
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return LANGS.includes(nav) ? nav : 'en';
}
let lang = guessLang();
const t = (k) => STRINGS[lang]?.[k] ?? STRINGS.en[k] ?? k;
const locale = () => ({ en: 'en-GB', fr: 'fr-FR', ko: 'ko-KR' }[lang]);
const onLang = [];

function applyLang() {
  root.lang = lang;
  $$('[data-i18n]').forEach((el) => {
    const k = el.dataset.i18n;
    if (k === 'letter.sign') el.textContent = LETTER[lang].sign;
    else if (k === 'hero.hint' && !finePointer) el.textContent = t('hero.hint.touch');
    else el.textContent = t(k);
  });
  $$('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
  $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', t(el.dataset.i18nTitle)); });
  const body = $('[data-i18n-html="letter.body"]');
  body.innerHTML = '';
  LETTER[lang].body.forEach((para) => { const p = document.createElement('p'); p.textContent = para; body.appendChild(p); });
  $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  onLang.forEach((fn) => fn(lang));
}
$$('.lang button').forEach((b) => b.addEventListener('click', () => {
  lang = b.dataset.lang;
  store.set('mihwa-lang', lang);
  applyLang();
  pluck(LANGS.indexOf(lang) * 2 + 3, { gain: 0.14 });
}));

// ─────────────────────────── sound ───────────────────────────
const soundBtn = $('.sound');
soundBtn.addEventListener('click', () => {
  const on = soundBtn.getAttribute('aria-pressed') !== 'true';
  soundBtn.setAttribute('aria-pressed', String(on));
  setSound(on);
  if (on) shutter();
});

// ─────────────────────────── the film leader ───────────────────────────
const leaderNum = $('.leader-num');
let count = 3;
const leaderTimer = setInterval(() => { count = count > 1 ? count - 1 : 3; leaderNum.textContent = count; }, 1000);

// ─────────────────────────── static bits ───────────────────────────
$('#hero-ig').href = IG_URL;
$('#hero-ig').textContent = `@${HER.instagram}`;
$('#ig-follow').href = IG_URL;
$('#ig-avatar').href = IG_URL;
$('#ig-handle').textContent = `@${HER.instagram}`;
$('#ig-ring-path').setAttribute('d', pencilLoop(60, 60, 55, 55, 21));
$('#reel').style.height = `${PHOTOS.length * 56 + 100}vh`;

// ─────────────────────────── cursor ───────────────────────────
const cursor = $('.cursor');
const cDot = $('.cursor-dot'), cRing = $('.cursor-ring');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
if (finePointer) {
  document.body.classList.add('has-cursor');
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; cDot.style.transform = `translate3d(${mx}px, ${my}px, 0)`; }, { passive: true });
  const loop = () => { rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2; cRing.style.transform = `translate3d(${rx}px, ${ry}px, 0)`; requestAnimationFrame(loop); };
  loop();
  document.addEventListener('pointerover', (e) => cursor.classList.toggle('is-hover', !!e.target.closest('a, button, .cf, .ig-tile')));
}

// ─────────────────────────── clocks ───────────────────────────
function haversine(a, b) {
  const R = 6371, r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const SEOUL = { id: 'seoul', lat: 37.5665, lon: 126.978, home: true, name: { en: 'Seoul', fr: 'Séoul', ko: '서울' } };
const PARIS = { id: 'paris', lat: 48.8566, lon: 2.3522, home: true, name: { en: 'Paris', fr: 'Paris', ko: '파리' } };
function tzOffset(tz, d) { return Math.round((new Date(d.toLocaleString('en-US', { timeZone: tz })) - new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }))) / 36e5); }
function tickClocks() {
  const now = new Date();
  const time = (tz) => new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(now);
  const date = (tz) => new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz }).format(now);
  $('#clock-seoul').textContent = time('Asia/Seoul');
  $('#clock-paris').textContent = time('Europe/Paris');
  $('#date-seoul').textContent = date('Asia/Seoul');
  $('#date-paris').textContent = date('Europe/Paris');
  $('#clock-note').textContent = t('homes.note').replace('{h}', tzOffset('Asia/Seoul', now) - tzOffset('Europe/Paris', now));
  $('#clock-dist').textContent = t('homes.dist').replace('{d}', (Math.round(haversine(SEOUL, PARIS) / 10) * 10).toLocaleString(locale()));
}
onLang.push(tickClocks);
setInterval(tickClocks, 15000);

// ─────────────────────────── field notes & bio ───────────────────────────
onLang.push(() => {
  const dl = $('#notes');
  dl.innerHTML = '';
  HER.notes.forEach((n) => {
    const row = document.createElement('div');
    const dt = document.createElement('dt'); dt.textContent = n.k[lang];
    const dd = document.createElement('dd'); dd.textContent = n.v[lang];
    row.append(dt, dd);
    dl.appendChild(row);
  });
  const bio = $('#ig-bio');
  bio.innerHTML = '';
  (HER.bio[lang] || []).forEach((line) => { const li = document.createElement('li'); li.textContent = line; bio.appendChild(li); });
});

// ─────────────────────────── footer: the eternal question ───────────────────────────
$('#noodle').addEventListener('click', (e) => {
  const open = e.currentTarget.getAttribute('aria-expanded') !== 'true';
  e.currentTarget.setAttribute('aria-expanded', String(open));
  $('#noodle-a').hidden = !open;
  if (open) phrase(5);
});

// ─────────────────────────── the seal ───────────────────────────
const seal = $('#letter-seal');
new IntersectionObserver((es, io) => es.forEach((e) => {
  if (e.isIntersecting) { seal.classList.add('is-stamped'); setTimeout(() => pluck(0, { gain: 0.24 }), 550); io.disconnect(); }
}), { threshold: 0.5 }).observe(seal);

applyLang();

// ─────────────────────────── boot: fonts → photos → scenes ───────────────────────────
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fonts = document.fonts
  ? Promise.race([Promise.all([document.fonts.load('500 20px "DM Mono"'), document.fonts.load('40px "Nanum Pen Script"', '01. the pose 그 포즈')]), wait(2500)])
  : Promise.resolve();

let ink = null, reel = null, homes = null, lightbox = null, photos = [];

async function boot() {
  await fonts.catch(() => {});
  photos = await loadPhotos(PHOTOS, t('placeholder'));
  const hero = photos[HER.heroPhoto] || photos[0];

  lightbox = mountLightbox($('#lightbox'), photos, {
    caption: (i) => PHOTOS[i].caption?.[lang] ?? '',
    onChange: () => shutter({ gain: 0.2 }),
  });
  onLang.push(() => lightbox.refresh());
  const open = (i, e) => lightbox.open(i, e);

  // hero: her portrait in ink
  try {
    const { createInkHero } = await import('./fx/fluid.js');
    ink = createInkHero($('#ink-gl'), { source: hero.image || hero.canvas, reduceMotion, mobile, color: hero.placeholder ? 0.12 : 0.62 });
  } catch (err) { console.warn('ink hero unavailable', err); ink = null; }
  if (ink) {
    const heroLayout = () => {
      const portrait = innerWidth / innerHeight < 0.9;
      ink.setLayout(portrait
        ? { rect: [0.02, 0.36, 0.98, 0.99], blob: [0.5, 0.68], blobR: [0.5, 0.38] }
        : { rect: [0.38, 0.03, 0.97, 0.97], blob: [0.675, 0.5], blobR: [0.56, 0.6] });
    };
    heroLayout();
    addEventListener('resize', heroLayout);
    const heroSec = $('#hero');
    heroSec.addEventListener('pointermove', (e) => ink.pointer(e.clientX, e.clientY), { passive: true });
    heroSec.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button')) return;
      ink.burst(e.clientX, e.clientY);
      pluck(Math.floor(Math.random() * 10), { pan: (e.clientX / innerWidth) * 1.6 - 0.8, gain: 0.16 });
    });
  } else {
    $('#ink-gl').hidden = true;
    const img = $('#hero-fallback');
    img.src = hero.url;
    img.hidden = false;
  }

  // darkroom
  try {
    const { createReel } = await import('./fx/reel.js');
    reel = createReel($('#reel-gl'), photos, {
      reduceMotion, mobile,
      onOpen: open,
      onFrame: (i) => {
        $('#rc-num').textContent = String(i + 1).padStart(2, '0');
        $('#rc-cap').textContent = PHOTOS[i].caption?.[lang] ?? '';
      },
    });
  } catch (err) { console.warn('darkroom unavailable', err); reel = null; }
  $('#rc-of').textContent = `/ ${String(photos.length).padStart(2, '0')}`;
  if (reel) {
    reel.setCaptions(lang);
    onLang.push((l) => { reel.setCaptions(l); const n = Number($('#rc-num').textContent) - 1; $('#rc-cap').textContent = PHOTOS[n]?.caption?.[l] ?? ''; });
  }

  // contact sheet
  const sheet = mountSheet($('#contact'), photos, { favourites: HER.favourites, notes: () => t('sheet.notes'), onOpen: open, fine: finePointer });
  onLang.push(() => sheet.redraw());

  // her palette
  const pal = extractPalette(photos, 6);
  const palEl = $('#palette');
  const bar = document.createElement('div');
  bar.className = 'pal-bar';
  const chips = document.createElement('div');
  chips.className = 'pal-chips';
  pal.forEach((c, i) => {
    const s = document.createElement('span');
    s.style.background = c.hex;
    s.style.flexGrow = String(c.share);
    bar.appendChild(s);
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `<div class="chip-swatch" style="background:${c.hex}"></div><span class="chip-name">${HER.name.latin} ${String(i + 1).padStart(2, '0')}</span><span class="chip-hex">${c.hex}</span><span class="chip-share"></span>`;
    chips.appendChild(chip);
  });
  palEl.append(bar, chips);
  const shares = () => $$('.chip-share', palEl).forEach((el, i) => { el.textContent = `${Math.round(pal[i].share * 100)}% ${t('style.share')}`; });
  shares();
  onLang.push(shares);

  // instagram card
  $('#ig-avatar-img').src = hero.url;
  const grid = $('#ig-grid');
  photos.slice(0, 9).forEach((ph, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ig-tile';
    const img = document.createElement('img');
    img.src = ph.url; img.alt = ''; img.loading = 'lazy';
    b.appendChild(img);
    b.addEventListener('click', (e) => open(i, e));
    grid.appendChild(b);
  });
  const tileCaps = () => $$('.ig-tile', grid).forEach((b, i) => { const c = PHOTOS[i].caption?.[lang] ?? ''; b.dataset.cap = c; b.setAttribute('aria-label', c); });
  tileCaps();
  onLang.push(tileCaps);

  // two homes
  try {
    const { createHomes } = await import('./fx/homes.js');
    homes = createHomes($('#globe-gl'), [SEOUL, PARIS], { mobile });
  } catch (err) { console.warn('globe unavailable', err); homes = null; }
  if (homes) {
    const labelsEl = $('#globe-labels');
    const labels = [SEOUL, PARIS].map((p) => {
      const el = document.createElement('div');
      el.className = 'glabel';
      el.innerHTML = '<span></span>';
      labelsEl.appendChild(el);
      return { p, el, span: el.firstChild };
    });
    const labelText = () => labels.forEach(({ p, span }) => { span.innerHTML = ''; span.append(p.name[lang === 'ko' ? 'en' : lang]); const k = document.createElement('span'); k.className = 'ko'; k.textContent = p.name.ko; span.appendChild(k); });
    labelText();
    onLang.push(labelText);
    homes.onFrame((proj) => proj.forEach((m, i) => {
      const L = labels[i];
      if (!L) return;
      L.el.classList.toggle('is-visible', m.facing > 0.15);
      L.el.style.transform = `translate3d(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px, 0)`;
    }));
  } else {
    $('.homes-globe').hidden = true;
  }

  if (!ink && !reel) $('.webgl-fallback').hidden = false;

  // run each canvas only while it is on screen
  const watch = (el, api) => api && new IntersectionObserver((es) => es.forEach((e) => api.setActive(e.isIntersecting)), { rootMargin: '10% 0px' }).observe(el);
  watch($('#hero'), ink);
  watch($('#reel'), reel);
  watch($('.homes-globe'), homes);
  onScroll();

  clearInterval(leaderTimer);
  leaderNum.textContent = '1';
  await wait(reduceMotion ? 0 : 350);
  $('#loader').classList.add('is-done');
  document.body.classList.add('is-ready');
}

// ─────────────────────────── scroll ───────────────────────────
const bars = $$('[data-theme-bar]');
const railLinks = $$('.rail a');
function onScroll() {
  if (reel) {
    const r = $('#reel').getBoundingClientRect();
    reel.setProgress(-r.top / Math.max(1, r.height - innerHeight));
  }
  // the top bar takes the colour of whatever is under it
  const under = bars.find((el) => { const r = el.getBoundingClientRect(); return r.top <= 30 && r.bottom > 30; });
  document.body.classList.toggle('bar-dark', !!under && under.dataset.themeBar === 'dark');
  document.body.classList.toggle('scrolled', scrollY > innerHeight * 0.6);
  // active section in the rail
  const c = innerHeight * 0.5;
  let active = railLinks[0];
  railLinks.forEach((a) => { const s = $(a.getAttribute('href')); if (s && s.getBoundingClientRect().top <= c) active = a; });
  railLinks.forEach((a) => a.classList.toggle('is-active', a === active));
}
let queued = false;
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; onScroll(); }); } }, { passive: true });
addEventListener('resize', onScroll);

boot().catch((err) => {
  console.error(err);
  $('#loader').classList.add('is-done');
  document.body.classList.add('is-ready');
});
