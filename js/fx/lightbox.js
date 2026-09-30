// Full-screen viewer: opens from where you clicked, like light spreading.
export function mountLightbox(el, photos, { caption, onChange } = {}) {
  const img = el.querySelector('.lb-img');
  const cap = el.querySelector('.lb-cap');
  const num = el.querySelector('.lb-num');
  let index = 0, lastFocus = null;

  function show(i) {
    index = (i + photos.length) % photos.length;
    const ph = photos[index];
    img.src = ph.url;
    img.classList.toggle('is-placeholder', !!ph.placeholder);
    num.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    cap.textContent = caption ? caption(index) : '';
    onChange && onChange(index);
  }
  function open(i, e) {
    lastFocus = document.activeElement;
    const x = e && e.clientX != null ? e.clientX : innerWidth / 2;
    const y = e && e.clientY != null ? e.clientY : innerHeight / 2;
    el.style.setProperty('--ox', `${x}px`);
    el.style.setProperty('--oy', `${y}px`);
    show(i);
    el.hidden = false;
    el.classList.remove('is-open');
    void el.offsetWidth;
    el.classList.add('is-open');
    document.documentElement.classList.add('lb-lock');
    el.querySelector('.lb-close').focus({ preventScroll: true });
  }
  function close() {
    el.classList.remove('is-open');
    document.documentElement.classList.remove('lb-lock');
    setTimeout(() => { el.hidden = true; }, 450);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  el.querySelector('.lb-close').addEventListener('click', close);
  el.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  el.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  el.addEventListener('click', (e) => { if (e.target === el || e.target.classList.contains('lb-stage')) close(); });
  addEventListener('keydown', (e) => {
    if (el.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
  let sx = null;
  el.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (sx == null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    sx = null;
  });
  return { open, close, refresh: () => { if (!el.hidden) show(index); } };
}
