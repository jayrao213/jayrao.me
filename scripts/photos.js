/**
 * Clothesline gallery: chunk photos into rows, pointer-drag reorder, localStorage order.
 * Replace DEFAULT_PHOTOS src with ../images/photos/*.jpg when assets are added.
 */

const STORAGE_KEY = 'jayrao.photos.order';

const TILTS = [-3.5, 2.8, -2.2, 4.2, -4, 3.2, -2.8, 3.8, -3, 2.2, -4.2, 2.5];

const DEFAULT_PHOTOS = [
  { id: 'p1',  thumb: '../images/moonlit_trees_thumb.webp',        src: '../images/moonlit_trees.webp',        alt: 'Moonlit trees on the Northwestern Lakefill' },
  { id: 'p2',  thumb: '../images/telescope_thumb.webp',            src: '../images/telescope.webp',            alt: 'Deaborn Observatory telescope' },
  { id: 'p3',  thumb: '../images/nyc_thumb.webp',                  src: '../images/nyc.webp',                  alt: 'Steinway Tower at sunset in NYC' },
  { id: 'p4',  thumb: '../images/plane_sunset_thumb.webp',         src: '../images/plane_sunset.webp',         alt: 'Clouds over Lake Michigan from 30,000ft above' },
  { id: 'p5',  thumb: '../images/squirrel_thumb.webp',             src: '../images/squirrel.webp',             alt: 'Curious squirrel sitting on a tree' },
  { id: 'p16', thumb: '../images/deering_day_thumb.webp',          src: '../images/deering_day.webp',          alt: 'Deering Library on a bright day' },
  { id: 'p7',  thumb: '../images/spac_thumb.webp',                 src: '../images/spac.webp',                 alt: 'Moonlight beaming through the clouds on SPAC' },
  { id: 'p13', thumb: '../images/lightning_thumb.webp',            src: '../images/lightning.webp',            alt: 'Lightning over two ducks at night' },
  { id: 'p8',  thumb: '../images/flowers_thumb.webp',              src: '../images/flowers.webp',              alt: 'Bright colored flowers in the spring' },
  { id: 'p9',  thumb: '../images/bienen_thumb.webp',               src: '../images/bienen.webp',               alt: 'Ryan Center at night' },
  { id: 'p14', thumb: '../images/music_admin_building_thumb.webp', src: '../images/music_admin_building.webp', alt: 'Music Administration Building on campus' },
  { id: 'p15', thumb: '../images/lake_michigan_sunrise_thumb.webp',src: '../images/lake_michigan_sunrise.webp',alt: 'Sunrise over Lake Michigan' },
  { id: 'p10', thumb: '../images/atrium_thumb.webp',               src: '../images/atrium.webp',               alt: 'Atrium of Northwestern University\'s Technological Institute' },
  { id: 'p11', thumb: '../images/norris_thumb.webp',               src: '../images/norris.webp',               alt: 'Norris University Center sitting next to the iced out lakefill' },
  { id: 'p12', thumb: '../images/arches_thumb.webp',               src: '../images/arches.webp',               alt: 'Spooky arches on campus at midnight' },
  { id: 'p6',  thumb: '../images/deering_thumb.webp',              src: '../images/deering.webp',              alt: 'Deering Library at night' }
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
  wrap.dataset.fullSrc = photo.src;
  wrap.style.setProperty('--tilt', tiltForIndex(tiltIndex));

  const frame = document.createElement('div');
  frame.className = 'clothesline-frame';

  const img = document.createElement('img');
  img.src = photo.thumb;
  img.alt = photo.alt;
  img.loading = 'lazy';
  img.decoding = 'async';
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

let ghostEl          = null;
let previewOrderIds  = null;
let renderScheduled  = false;

// Re-render using previewOrderIds, keeping the dragged photo invisible as a placeholder
function schedulePreviewRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    if (!dragState || !previewOrderIds) return;

    const map          = photosByIdMap();
    const cols         = getCols();
    const ordered      = previewOrderIds.map(id => map.get(id)).filter(Boolean);
    const rows         = chunk(ordered.map(p => p.id), cols);
    const hiddenId     = dragState.photoId;

    rootEl.innerHTML = '';
    let tiltIndex = 0;
    rows.forEach(rowIds => {
      const section = document.createElement('section');
      section.className = 'clothesline-row';
      const line = document.createElement('div');
      line.className = 'clothesline-line';
      line.setAttribute('aria-hidden', 'true');
      const track = document.createElement('div');
      track.className = 'clothesline-track';
      rowIds.forEach(id => {
        const photo = map.get(id);
        if (!photo) return;
        const hang = buildHang(photo, tiltIndex++);
        if (id === hiddenId) hang.style.visibility = 'hidden';
        track.appendChild(hang);
      });
      section.appendChild(line);
      section.appendChild(track);
      rootEl.appendChild(section);
    });
  });
}

// Find the flat insertion index by querying visible hang positions
function computeDropIndex(clientX, clientY, draggedId) {
  let best = null, bestD = Infinity;
  rootEl.querySelectorAll('.clothesline-hang').forEach(h => {
    if (h.style.visibility === 'hidden') return; // skip placeholder
    const r = h.getBoundingClientRect();
    if (!r.width) return;
    const d = (r.left + r.width / 2 - clientX) ** 2 + (r.top + r.height / 2 - clientY) ** 2;
    if (d < bestD) { bestD = d; best = h; }
  });
  if (!best) return previewOrderIds.indexOf(draggedId);

  const r      = best.getBoundingClientRect();
  const before = clientX < r.left + r.width / 2;
  const without = previewOrderIds.filter(id => id !== draggedId);
  const idx    = without.indexOf(best.dataset.photoId);
  return idx === -1 ? without.length : (before ? idx : idx + 1);
}

function onPointerDown(e) {
  const hang = e.target.closest('.clothesline-hang');
  if (!hang || !rootEl.contains(hang)) return;
  if (e.button !== 0) return;
  e.preventDefault();

  const rect    = hang.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;
  const tilt    = hang.style.getPropertyValue('--tilt') || '0deg';

  ghostEl = hang.cloneNode(true);
  Object.assign(ghostEl.style, {
    position:        'fixed',
    width:           rect.width  + 'px',
    height:          rect.height + 'px',
    left:            rect.left   + 'px',
    top:             rect.top    + 'px',
    zIndex:          '99999',
    pointerEvents:   'none',
    opacity:         '0.9',
    filter:          'drop-shadow(0 14px 28px rgba(0,0,0,0.5))',
    transform:       `rotate(${tilt})`,
    transformOrigin: '50% 0%',
    transition:      'none',
    margin:          '0',
  });
  document.body.appendChild(ghostEl);

  previewOrderIds = [...currentOrderIds];

  dragState = {
    photoId:       hang.dataset.photoId,
    pointerId:     e.pointerId,
    offsetX,
    offsetY,
    startX:        e.clientX,
    startY:        e.clientY,
    lastDropIndex: -1,
  };

  hang.style.visibility = 'hidden'; // turn source into invisible placeholder

  window.addEventListener('pointermove',   onPointerMove);
  window.addEventListener('pointerup',     onPointerUpWindow);
  window.addEventListener('pointercancel', onPointerUpWindow);
}

function onPointerMove(e) {
  if (!dragState || e.pointerId !== dragState.pointerId) return;

  ghostEl.style.left = (e.clientX - dragState.offsetX) + 'px';
  ghostEl.style.top  = (e.clientY - dragState.offsetY) + 'px';

  const dropIndex = computeDropIndex(e.clientX, e.clientY, dragState.photoId);
  if (dropIndex === dragState.lastDropIndex) return;
  dragState.lastDropIndex = dropIndex;

  const without   = previewOrderIds.filter(id => id !== dragState.photoId);
  const clamped   = Math.max(0, Math.min(dropIndex, without.length));
  previewOrderIds = [...without.slice(0, clamped), dragState.photoId, ...without.slice(clamped)];
  schedulePreviewRender();
}

function onPointerUpWindow(e) {
  if (!dragState || e.pointerId !== dragState.pointerId) return;

  const { photoId, startX, startY } = dragState;
  dragState       = null;
  renderScheduled = false;

  window.removeEventListener('pointermove',   onPointerMove);
  window.removeEventListener('pointerup',     onPointerUpWindow);
  window.removeEventListener('pointercancel', onPointerUpWindow);

  if (ghostEl) { ghostEl.remove(); ghostEl = null; }

  const moved = Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4;
  if (!moved) {
    previewOrderIds = null;
    const hang = rootEl.querySelector(`[data-photo-id="${photoId}"]`);
    if (hang) { hang.style.visibility = ''; openLightbox(hang); }
    return;
  }

  currentOrderIds = previewOrderIds;
  previewOrderIds = null;
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

  const fullSrc = hangEl.dataset.fullSrc || imgEl.src;
  lbImg.src = fullSrc;
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
