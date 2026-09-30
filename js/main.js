// ─────────────────────────────────────────────────────────────────────────────
//  Mihwa · 미화 — orchestration: language, scroll story, globe, studio, sound.
// ─────────────────────────────────────────────────────────────────────────────
import { LANGS, STRINGS, LETTER, PLACES, LEXICON, EVENTS, GENTLEMEN } from './content.js';
import { makeGrainDataURL, makeDeckle } from './scene/inktex.js';
import { mountScrolls } from './ink/sagunja.js';
import { mountStudio } from './ink/studio.js';
import { paintHandscroll } from './ink/scrollpaint.js';
import { setSound, pluck, phrase } from './audio.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

// ─────────────────────────── paper & edges ───────────────────────────
const root = document.documentElement;
root.style.setProperty('--grain', `url(${makeGrainDataURL()})`);
root.style.setProperty('--deckle-top', makeDeckle('#f2ebdd', false));
root.style.setProperty('--deckle-bottom', makeDeckle('#f2ebdd', true));

// ─────────────────────────── language ───────────────────────────
function guessLang() {
  const saved = store.get('mihwa-lang');
  if (LANGS.includes(saved)) return saved;
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return LANGS.includes(nav) ? nav : 'en';
}
let lang = guessLang();
const t = (key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
const langListeners = [];
const locale = () => ({ en: 'en-GB', fr: 'fr-FR', ko: 'ko-KR' }[lang]);

function applyLang() {
  root.lang = lang;
  $$('[data-i18n]').forEach((el) => {
    const k = el.dataset.i18n;
    if (k === 'letter.sign') el.textContent = LETTER[lang].sign;
    else if (k === 'hero.hint' && !finePointer) el.textContent = t('hero.hint.touch');
    else el.textContent = t(k);
  });
  $$('[data-i18n-html]').forEach((el) => {
    const k = el.dataset.i18nHtml;
    if (k === 'letter.body') {
      el.innerHTML = '';
      LETTER[lang].body.forEach((para) => { const p = document.createElement('p'); p.textContent = para; el.appendChild(p); });
    } else el.innerHTML = t(k);
  });
  $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', t(el.dataset.i18nTitle)); });
  $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  langListeners.forEach((fn) => fn(lang));
}
$$('.lang button').forEach((b) => b.addEventListener('click', () => {
  lang = b.dataset.lang;
  store.set('mihwa-lang', lang);
  applyLang();
  pluck(LANGS.indexOf(lang) * 2 + 3);
  requestAnimationFrame(measure);
}));

// ─────────────────────────── sound ───────────────────────────
const soundBtn = $('.sound');
soundBtn.addEventListener('click', () => {
  const on = soundBtn.getAttribute('aria-pressed') !== 'true';
  soundBtn.setAttribute('aria-pressed', String(on));
  setSound(on);
  if (on) phrase(3);
});

// ─────────────────────────── 3D world ───────────────────────────
const canvas = $('#webgl');
let world = null;
async function startWorld() {
  try {
    const { createWorld } = await import('./scene/world3d.js');
    world = createWorld(canvas, { reduceMotion, places: PLACES });
    if (world) { world.start(); world.onFrame(onWorldFrame); }
  } catch (err) {
    console.warn('WebGL scene unavailable:', err);
    world = null;
  }
  if (!world) {
    document.body.classList.add('no-webgl');
    $('.webgl-fallback').hidden = false;
    canvas.style.display = 'none';
  }
}

// ─────────────────────────── scroll story ───────────────────────────
const sections = Object.fromEntries($$('[data-scene]').map((el) => [el.id, el]));
const worldHold = ($('#world').dataset.hold || '0.25,0.75').split(',').map(Number);
const KEYS = [['hero', 0.5], ['moon', 0.5], ['world', worldHold[0]], ['world', worldHold[1]], ['lexicon', 0.5], ['gentlemen', 0.3], ['letter', 0.5]];
let keyYs = [];
const papers = $$('.paper, .footer');
const letterCard = $('.letter');
const railLinks = $$('.rail a');
const railIds = railLinks.map((a) => a.getAttribute('href').slice(1));
let story = 0;

function measure() {
  keyYs = KEYS.map(([id, f]) => {
    const r = sections[id].getBoundingClientRect();
    return r.top + scrollY + f * r.height;
  });
  layoutTies();
  onScroll();
}

function computeStory() {
  const c = scrollY + innerHeight / 2;
  if (c <= keyYs[0]) return 0;
  for (let i = 0; i < keyYs.length - 1; i++) {
    if (c < keyYs[i + 1]) return i + (c - keyYs[i]) / Math.max(1, keyYs[i + 1] - keyYs[i]);
  }
  return keyYs.length - 1;
}

function canvasCovered() {
  const vh = innerHeight;
  const spans = papers.map((el) => el.getBoundingClientRect()).filter((r) => r.bottom > 0 && r.top < vh).map((r) => [r.top, r.bottom]).sort((a, b) => a[0] - b[0]);
  let reach = 0;
  for (const [a, b] of spans) { if (a > reach + 1) return false; reach = Math.max(reach, b); if (reach >= vh) return true; }
  return false;
}

let activeId = 'hero';
function onScroll() {
  story = computeStory();
  const covered = canvasCovered();
  if (world) { world.setStory(story); world.setVisible(!covered); }
  // the top bar needs a paper backdrop wherever text scrolls beneath it
  const topPaper = [...papers, letterCard].some((el) => { const r = el.getBoundingClientRect(); return r.top < 70 && r.bottom > 0; });
  document.body.classList.toggle('on-paper', topPaper);
  const max = document.documentElement.scrollHeight - innerHeight;
  root.style.setProperty('--progress', (scrollY / Math.max(1, max)).toFixed(4));
  $('.rail-ink span').style.setProperty('--progress', (scrollY / Math.max(1, max)).toFixed(4));
  // active rail item
  const c = scrollY + innerHeight * 0.5;
  let id = 'hero';
  for (const sid of railIds) {
    const el = sections[sid];
    if (el && el.getBoundingClientRect().top + scrollY <= c) id = sid;
  }
  if (id !== activeId) {
    activeId = id;
    railLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
  }
  updateTies();
  // leaving the world scene closes the place card
  if (selected && (story < 1.7 || story > 4.2)) closeCard();
}
let scrollQueued = false;
addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
}, { passive: true });

let resizeT;
addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => { world && world.resize(); measure(); }, 120);
});

// ─────────────────────────── pointer, cursor & blossoms ───────────────────────────
const cursor = $('.cursor');
const cDot = $('.cursor-dot'), cRing = $('.cursor-ring');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
if (finePointer) document.body.classList.add('has-cursor');

addEventListener('pointermove', (e) => {
  mx = e.clientX; my = e.clientY;
  if (world) world.setPointer((mx / innerWidth) * 2 - 1, -(my / innerHeight) * 2 + 1);
  if (finePointer) cDot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
}, { passive: true });

function cursorLoop() {
  rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
  cRing.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
  requestAnimationFrame(cursorLoop);
}
if (finePointer) {
  cursorLoop();
  const hoverSel = 'a, button, [role="button"], input, .lex, .globe-hit.is-pick';
  document.addEventListener('pointerover', (e) => cursor.classList.toggle('is-hover', !!e.target.closest(hoverSel)));
  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
}

// click the landscape to scatter blossoms
['hero', 'moon', 'letter'].forEach((id) => {
  sections[id].addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button, input, .letter, .panel')) return;
    if (world) world.burst(e.clientX, e.clientY);
    pluck(Math.floor(Math.random() * 10), { pan: (e.clientX / innerWidth) * 1.6 - 0.8 });
  });
});

// ─────────────────────────── moon: clocks ───────────────────────────
function haversine(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const SEOUL = PLACES.find((p) => p.id === 'seoul');
const PARIS = PLACES.find((p) => p.id === 'paris');
const fmtKm = (km) => Math.round(km / 10) * 10;

function tzOffsetHours(tz, d) {
  const a = new Date(d.toLocaleString('en-US', { timeZone: tz }));
  const b = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
  return Math.round((a - b) / 36e5);
}
function tickClocks() {
  const now = new Date();
  const time = (tz) => new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(now);
  const date = (tz) => new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz }).format(now);
  $('#clock-seoul').textContent = time('Asia/Seoul');
  $('#clock-paris').textContent = time('Europe/Paris');
  $('#date-seoul').textContent = date('Asia/Seoul');
  $('#date-paris').textContent = date('Europe/Paris');
  const diff = tzOffsetHours('Asia/Seoul', now) - tzOffsetHours('Europe/Paris', now);
  $('#clock-note').textContent = t('moon.note.behind').replace('{h}', diff);
  $('#clock-dist').textContent = t('moon.dist').replace('{d}', fmtKm(haversine(SEOUL, PARIS)).toLocaleString(locale()));
}
langListeners.push(tickClocks);
setInterval(tickClocks, 15000);

// ─────────────────────────── world: places, card, labels ───────────────────────────
const placesEl = $('#places');
const card = $('#place-card');
let selected = null;
const placeButtons = PLACES.map((p) => {
  const li = document.createElement('li');
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.home = String(!!p.home);
  b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', () => (selected === p ? closeCard() : selectPlace(p)));
  li.appendChild(b);
  placesEl.appendChild(li);
  return { p, b };
});

const labelsEl = $('#globe-labels');
const labels = PLACES.map((p) => {
  const el = document.createElement('div');
  el.className = 'glabel' + (p.home ? ' glabel--home' : '');
  el.innerHTML = '<span class="glabel-text"></span>';
  labelsEl.appendChild(el);
  return { p, el, text: el.firstChild };
});

function renderPlaceTexts() {
  placeButtons.forEach(({ p, b }) => { b.textContent = p.name[lang]; });
  labels.forEach(({ p, text }) => {
    text.innerHTML = '';
    text.append(p.name[lang === 'ko' ? 'en' : lang]);
    const k = document.createElement('span');
    k.className = 'ko'; k.textContent = p.name.ko;
    text.append(k);
  });
  if (selected) renderCard(selected);
}
langListeners.push(renderPlaceTexts);

function coordStr(p) {
  const ns = p.lat >= 0 ? 'N' : 'S', ew = p.lon >= 0 ? 'E' : 'W';
  return `${Math.abs(p.lat).toFixed(2)}° ${ns}, ${Math.abs(p.lon).toFixed(2)}° ${ew}`;
}
function renderCard(p) {
  $('#pc-ko').textContent = p.name.ko;
  $('#pc-name').textContent = p.name[lang === 'ko' ? 'en' : lang];
  $('#pc-inst').textContent = p.inst[lang];
  $('#pc-desc').textContent = p.desc[lang];
  const km = (a, b) => (a === b ? '—' : `${fmtKm(haversine(a, b)).toLocaleString(locale())} km`);
  $('#pc-seoul').textContent = km(SEOUL, p);
  $('#pc-paris').textContent = km(PARIS, p);
  $('#pc-coords').textContent = coordStr(p);
}
function selectPlace(p) {
  selected = p;
  renderCard(p);
  card.hidden = false;
  card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
  placeButtons.forEach(({ p: q, b }) => b.setAttribute('aria-pressed', String(q === p)));
  if (world) world.globe.select(p);
  pluck(PLACES.indexOf(p) % 10, { gain: 0.18 });
}
function closeCard() {
  selected = null;
  card.hidden = true;
  placeButtons.forEach(({ b }) => b.setAttribute('aria-pressed', 'false'));
  if (world) world.globe.select(null);
}
$('#place-close').addEventListener('click', closeCard);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && selected) closeCard(); });

// globe dragging & picking
const hit = $('#globe-hit');
let drag = null;
hit.addEventListener('pointerdown', (e) => {
  if (!world || world.morph < 0.9) return;
  drag = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
  world.globe.startDrag();
  hit.setPointerCapture(e.pointerId);
  hit.classList.add('is-dragging');
});
hit.addEventListener('pointermove', (e) => {
  if (!world) return;
  if (drag && e.pointerId === drag.id) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
    world.globe.drag(dx, dy);
  } else if (e.pointerType === 'mouse') {
    const p = world.pick(e.clientX, e.clientY);
    world.globe.hovered = p;
    hit.classList.toggle('is-pick', !!p);
    hit.style.cursor = p ? 'pointer' : '';
    cursor.classList.toggle('is-hover', !!p);
  }
});
function endDrag(e) {
  if (!drag || (e && e.pointerId !== drag.id)) return;
  world.globe.endDrag();
  hit.classList.remove('is-dragging');
  if (!drag.moved && e && e.type === 'pointerup') {
    const p = world.pick(e.clientX, e.clientY);
    if (p) selectPlace(p);
  }
  drag = null;
}
hit.addEventListener('pointerup', endDrag);
hit.addEventListener('pointercancel', endDrag);
hit.addEventListener('pointerleave', () => { if (world && !drag) world.globe.hovered = null; });

const proj = [];
function onWorldFrame() {
  // project globe labels while the world scene is on screen
  const inWorld = story > 1.55 && story < 4.4 && world.morph > 0.85;
  labelsEl.style.display = inWorld ? '' : 'none';
  if (!inWorld) return;
  const rect = labelsEl.getBoundingClientRect();
  world.projectMarkers(proj);
  for (let i = 0; i < proj.length; i++) {
    const m = proj[i];
    const L = labels[i];
    const wanted = m.place.home || m.place === selected || m.place === world.globe.hovered;
    const vis = wanted && m.facing > 0.18;
    L.el.classList.toggle('is-visible', vis);
    if (vis) L.el.style.transform = `translate3d(${(m.x - rect.left).toFixed(1)}px, ${(m.y - rect.top).toFixed(1)}px, 0)`;
  }
}

// ─────────────────────────── lexicon ───────────────────────────
const lexEl = $('#lexicon-list');
const lexItems = LEXICON.map((w) => {
  const li = document.createElement('li');
  li.className = 'lex';
  li.innerHTML = `
    <div class="lex-inner">
      <div class="lex-face lex-front">
        <span class="lex-ko">${w.ko}</span><span class="lex-fr">${w.fr}</span><span class="lex-en">${w.en}</span>
        <button type="button" aria-label="${w.ko} · ${w.hanja}"></button>
      </div>
      <div class="lex-face lex-back">
        <span class="seal seal--xs" aria-hidden="true">${w.hanja[0]}</span>
        <span class="lex-hanja">${w.hanja}</span><span class="lex-gloss"></span>
      </div>
    </div>`;
  li.querySelector('button').addEventListener('click', () => { li.classList.toggle('is-flipped'); pluck(LEXICON.indexOf(w)); });
  li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pluck(LEXICON.indexOf(w), { gain: 0.1 }); });
  lexEl.appendChild(li);
  return { w, li };
});
langListeners.push(() => lexItems.forEach(({ w, li }) => { li.querySelector('.lex-gloss').textContent = w.gloss[lang]; }));

// ─────────────────────────── ties: the handscroll ───────────────────────────
const tiesSec = $('#ties');
const track = $('#scroll-track');
const scrollWin = $('.scroll-window');
const paintingCanvas = $('#scroll-painting');
const eventsEl = $('#events');
const eventEls = EVENTS.map((ev, i) => {
  const li = document.createElement('li');
  li.className = 'event' + (i === EVENTS.length - 1 ? ' event--last' : '');
  li.innerHTML = `<span class="event-year">${ev.year}</span><span class="event-tag"><span class="seal seal--xs" aria-hidden="true">${ev.seal}</span>${ev.tag}</span><p></p>`;
  eventsEl.appendChild(li);
  return li;
});
langListeners.push(() => EVENTS.forEach((ev, i) => { eventEls[i].querySelector('p').textContent = ev.text[lang]; }));

let trackW = 0, eventXs = [], paintedSize = '', lastEventIn = -1, tiesNear = false;
function layoutTies() {
  const vw = scrollWin.clientWidth, h = scrollWin.clientHeight;
  if (!vw || !h) return;
  const spacing = vw < 600 ? vw * 0.86 : clamp(vw * 0.36, 290, 460);
  const pad = Math.min(vw * 0.1, 120);
  eventXs = EVENTS.map((_, i) => pad + i * spacing);
  trackW = Math.round(pad + EVENTS.length * spacing + vw * 0.22);
  track.style.width = trackW + 'px';
  track.style.height = h + 'px';
  eventEls.forEach((el, i) => { el.style.left = eventXs[i] + 'px'; });
  const key = `${trackW}x${h}`;
  if (tiesNear && key !== paintedSize) {
    paintedSize = key;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1, 14000 / trackW);
    paintHandscroll(paintingCanvas, trackW, h, EVENTS, eventXs, dpr);
  }
}
new IntersectionObserver((es) => {
  if (es.some((e) => e.isIntersecting) && !tiesNear) { tiesNear = true; layoutTies(); updateTies(); }
}, { rootMargin: '150% 0px' }).observe(tiesSec);

function updateTies() {
  if (!trackW) return;
  const r = tiesSec.getBoundingClientRect();
  const total = r.height - innerHeight;
  const p = clamp(-r.top / Math.max(1, total));
  const vw = scrollWin.clientWidth;
  const x = -p * Math.max(0, trackW - vw);
  track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
  let lastIn = -1;
  eventEls.forEach((el, i) => {
    const on = eventXs[i] + x < vw * 0.8;
    el.classList.toggle('is-in', on);
    if (on) lastIn = i;
  });
  if (lastIn > lastEventIn && r.top < innerHeight * 0.2 && r.bottom > innerHeight) pluck(lastIn + 2, { gain: 0.14 });
  lastEventIn = lastIn;
}

// ─────────────────────────── the Four Gentlemen ───────────────────────────
const scrolls = mountScrolls($('#scrolls'), GENTLEMEN, () => lang, t, (i) => phrase(i * 2));
langListeners.push(() => scrolls.setLang(lang));

// ─────────────────────────── the studio ───────────────────────────
const studio = mountStudio({
  root: $('#studio'),
  canvas: $('#studio-canvas'),
  hint: $('#hanji-hint'),
  onPaint: (kind) => {
    if (kind === 'blossom') pluck(7 + Math.floor(Math.random() * 3), { gain: 0.16 });
    else if (kind === 'seal') pluck(0, { gain: 0.24 });
    else pluck(2 + Math.floor(Math.random() * 5), { gain: 0.08 });
  },
});
const toolBtns = $$('.studio-tools [data-tool]');
toolBtns.forEach((b) => b.addEventListener('click', () => {
  toolBtns.forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-checked', String(x === b)); });
  studio.setTool(b.dataset.tool, b.dataset.tone ? Number(b.dataset.tone) : undefined);
}));
const sizeInput = $('#brush-size');
sizeInput.addEventListener('input', () => { studio.setSize(Number(sizeInput.value)); cursor.style.setProperty('--brush', `${Number(sizeInput.value) * 1.1}px`); });
cursor.style.setProperty('--brush', `${Number(sizeInput.value) * 1.1}px`);
$('#studio-clear').addEventListener('click', () => { studio.clear(); phrase(1); });
$('#studio-save').addEventListener('click', () => studio.save());
const hanji = $('#hanji');
hanji.addEventListener('pointerenter', () => cursor.classList.add('is-brush'));
hanji.addEventListener('pointerleave', () => cursor.classList.remove('is-brush'));

// ─────────────────────────── reveals & the seal ───────────────────────────
const revealIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } }), { threshold: 0.2 });
$$('.reveal').forEach((el) => revealIO.observe(el));
const seal = $('#letter-seal');
new IntersectionObserver((es, io) => es.forEach((e) => {
  if (e.isIntersecting) { seal.classList.add('is-stamped'); setTimeout(() => pluck(0, { gain: 0.26 }), 600); io.disconnect(); }
}), { threshold: 0.9 }).observe(seal);

// ─────────────────────────── boot ───────────────────────────
applyLang();
tickClocks();
const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);
Promise.all([fontsReady, startWorld()]).catch((e) => console.warn(e)).then(() => {
  measure();
  if (world) world.renderOnce();
  requestAnimationFrame(() => {
    $('#loader').classList.add('is-done');
    document.body.classList.add('is-ready');
    $$('.scene--hero .reveal').forEach((el) => el.classList.add('is-in'));
  });
});
// fonts can shift layout a little after load
if (document.fonts) document.fonts.ready.then(() => measure());
addEventListener('load', () => measure());
