/**
 * Clothesline gallery: chunk photos into rows, pointer-drag reorder, localStorage order.
 * Replace DEFAULT_PHOTOS src with ../images/photos/*.jpg when assets are added.
 */

const STORAGE_KEY = 'jayrao.photos.order';

const TILTS = [-3.5, 2.8, -2.2, 4.2, -4, 3.2, -2.8, 3.8, -3, 2.2, -4.2, 2.5];

const DEFAULT_PHOTOS = [
  { id: 'p1', src: '../images/moonlit_trees.jpeg', alt: 'Moonlit trees on the Northwestern Lakefill' },
  { id: 'p2', src: '../images/telescope.jpeg', alt: 'Deaborn Observatory telescope' },
  { id: 'p3', src: '../images/nyc.jpeg', alt: 'Steinway Tower at sunset in NYC' },
  { id: 'p4', src: '../images/plane_sunset.jpeg', alt: 'Clouds over Lake Michigan from 30,000ft above' },
  { id: 'p5', src: '../images/squirrel.jpeg', alt: 'Curious squirrel sitting on a tree' },
  { id: 'p6', src: '../images/deering.jpeg', alt: 'Deering Library at night' },
  { id: 'p7', src: '../images/spac.jpeg', alt: 'Moonlight beaming through the clouds on SPAC' },
  { id: 'p8', src: '../images/flowers.jpg', alt: 'Bright colored flowers in the spring' },
  { id: 'p9', src: '../images/bienen.jpeg', alt: 'Ryan Center at night' },
  { id: 'p10', src: '../images/atrium.jpg', alt: 'Atrium of Northwestern University\'s Technological Institute' },
  { id: 'p11', src: '../images/norris.jpeg', alt: 'Norris University Center sitting next to the iced out lakefill' },
  { id: 'p12', src: '../images/arches.jpeg', alt: 'Spooky arches on campus at midnight' }
];

let currentOrderIds = [];
let dragState = null;
let rootEl = null;

function getCols() {
  if (window.innerWidth <= 768) return 2;
  return 4;
}

function loadSavedOrder() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveOrder(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function mergeOrder(defaultPhotos, savedIds) {
  if (!savedIds || !savedIds.length) return defaultPhotos.map((p) => p.id);

  const map = new Map(defaultPhotos.map((p) => [p.id, p]));
  const ordered = [];
  const seen = new Set();

  for (const id of savedIds) {
    if (map.has(id) && !seen.has(id)) {
      ordered.push(id);
      seen.add(id);
    }
  }
  for (const p of defaultPhotos) {
    if (!seen.has(p.id)) ordered.push(p.id);
  }
  return ordered;
}

function chunk(ids, size) {
  const rows = [];
  for (let i = 0; i < ids.length; i += size) {
    rows.push(ids.slice(i, i + size));
  }
  return rows;
}

function tiltForIndex(i) {
  return `${TILTS[i % TILTS.length]}deg`;
}

function photosByIdMap() {
  return new Map(DEFAULT_PHOTOS.map((p) => [p.id, p]));
}

function buildHang(photo, tiltIndex) {
  const wrap = document.createElement('div');
  wrap.className = 'clothesline-hang';
  wrap.dataset.photoId = photo.id;
  wrap.style.setProperty('--tilt', tiltForIndex(tiltIndex));

  const frame = document.createElement('div');
  frame.className = 'clothesline-frame';

  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = photo.alt;
  img.loading = 'lazy';
  img.draggable = false;

  frame.appendChild(img);
  wrap.appendChild(frame);
  return wrap;
}

function render() {
  if (!rootEl) return;

  const map = photosByIdMap();
  const orderedPhotos = currentOrderIds.map((id) => map.get(id)).filter(Boolean);
  const cols = getCols();
  const rows = chunk(orderedPhotos.map((p) => p.id), cols);

  rootEl.innerHTML = '';

  let tiltIndex = 0;
  rows.forEach((rowIds) => {
    const section = document.createElement('section');
    section.className = 'clothesline-row';

    const line = document.createElement('div');
    line.className = 'clothesline-line';
    line.setAttribute('aria-hidden', 'true');

    const track = document.createElement('div');
    track.className = 'clothesline-track';

    rowIds.forEach((id) => {
      const photo = map.get(id);
      if (!photo) return;
      track.appendChild(buildHang(photo, tiltIndex));
      tiltIndex += 1;
    });

    section.appendChild(line);
    section.appendChild(track);
    rootEl.appendChild(section);
  });
}

function readFlatOrderFromDom() {
  const ids = [];
  rootEl.querySelectorAll('.clothesline-hang').forEach((el) => {
    ids.push(el.dataset.photoId);
  });
  return ids;
}

function nearestHang(clientX, clientY, exclude) {
  let best = null;
  let bestD = Infinity;
  rootEl.querySelectorAll('.clothesline-hang').forEach((h) => {
    if (h === exclude) return;
    const r = h.getBoundingClientRect();
    const hx = r.left + r.width / 2;
    const hy = r.top + r.height / 2;
    const d = (hx - clientX) ** 2 + (hy - clientY) ** 2;
    if (d < bestD) {
      bestD = d;
      best = h;
    }
  });
  return best;
}

function computeInsertIndex(clientX, clientY, draggedEl) {
  const draggedId = draggedEl.dataset.photoId;
  const current = readFlatOrderFromDom();
  const without = current.filter((id) => id !== draggedId);

  draggedEl.style.pointerEvents = 'none';
  let targetHang = document.elementFromPoint(clientX, clientY)?.closest('.clothesline-hang');
  draggedEl.style.pointerEvents = '';

  if (targetHang === draggedEl) targetHang = null;
  if (!targetHang) {
    targetHang = nearestHang(clientX, clientY, draggedEl);
  }

  if (!targetHang) {
    return without.length;
  }

  const tid = targetHang.dataset.photoId;
  const idx = without.indexOf(tid);
  if (idx === -1) return without.length;

  const r = targetHang.getBoundingClientRect();
  const insertLeft = clientX < r.left + r.width / 2;
  return insertLeft ? idx : idx + 1;
}

function applyDragTransform(el, dx, dy) {
  const tilt = getComputedStyle(el).getPropertyValue('--tilt').trim() || '0deg';
  el.style.transform = `translate(${dx}px, ${dy}px) rotate(${tilt})`;
}

function clearDragTransform(el) {
  el.style.transform = '';
}

function onPointerDown(e) {
  const hang = e.target.closest('.clothesline-hang');
  if (!hang || !rootEl.contains(hang)) return;

  if (e.button !== 0) return;

  e.preventDefault();
  hang.setPointerCapture(e.pointerId);

  dragState = {
    el: hang,
    pointerId: e.pointerId,
    originX: e.clientX,
    originY: e.clientY,
    dx: 0,
    dy: 0
  };

  hang.classList.add('dragging');
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUpWindow);
  window.addEventListener('pointercancel', onPointerUpWindow);
}

function onPointerMove(e) {
  if (!dragState || e.pointerId !== dragState.pointerId) return;

  dragState.dx = e.clientX - dragState.originX;
  dragState.dy = e.clientY - dragState.originY;
  applyDragTransform(dragState.el, dragState.dx, dragState.dy);
}

function onPointerUpWindow(e) {
  if (!dragState || e.pointerId !== dragState.pointerId) return;

  const { el, dx, dy, pointerId } = dragState;
  dragState = null;

  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUpWindow);
  window.removeEventListener('pointercancel', onPointerUpWindow);

  try {
    el.releasePointerCapture(pointerId);
  } catch {
    /* ignore */
  }

  el.classList.remove('dragging');
  clearDragTransform(el);

  const moved = Math.abs(dx) > 4 || Math.abs(dy) > 4;
  if (!moved) {
    openLightbox(el);
    return;
  }

  const before = readFlatOrderFromDom();
  const insertIndex = computeInsertIndex(e.clientX, e.clientY, el);
  const draggedId = el.dataset.photoId;
  const without = before.filter((id) => id !== draggedId);

  const clamped = Math.max(0, Math.min(insertIndex, without.length));
  const newOrder = [...without.slice(0, clamped), draggedId, ...without.slice(clamped)];

  if (newOrder.join() === before.join()) return;

  currentOrderIds = newOrder;
  saveOrder(currentOrderIds);
  render();
}

function setupPointerHandlers() {
  rootEl.addEventListener('pointerdown', onPointerDown);
}

// Lightbox Logic
function openLightbox(hangEl) {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCap = document.getElementById('lightbox-caption');
  if (!lightbox) return;

  const imgEl = hangEl.querySelector('img');
  if (!imgEl) return;
  
  lbImg.src = imgEl.src;
  lbCap.textContent = imgEl.alt;

  lightbox.classList.add('active');
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('active');
  }
}

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  if (!lightbox || !closeBtn) return;

  closeBtn.addEventListener('click', closeLightbox);
  
  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Close on escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

let resizeTimer;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    render();
  }, 120);
}

function init() {
  rootEl = document.getElementById('clothesline-root');
  if (!rootEl) return;

  const saved = loadSavedOrder();
  currentOrderIds = mergeOrder(DEFAULT_PHOTOS, saved);
  render();
  setupPointerHandlers();
  setupLightbox();
  window.addEventListener('resize', onResize);

  if (document.body.classList.contains('fun-mode')) {
    setTimeout(() => {
      if (typeof window.onFunModeActivated === 'function') {
        window.onFunModeActivated();
      }
    }, 50);
  }
}

window.addEventListener('DOMContentLoaded', init);

// Triggered by shared.js when toggling fun mode
window.onFunModeActivated = function () {
  const tracks = document.querySelectorAll('.clothesline-track');
  tracks.forEach((track, index) => {
    const burstClass = index % 2 === 0 ? 'fun-burst-left' : 'fun-burst-right';
    track.classList.add(burstClass);

    const onEnd = () => {
      track.classList.remove(burstClass);
      track.removeEventListener('animationend', onEnd);
    };
    track.addEventListener('animationend', onEnd);
  });
};
