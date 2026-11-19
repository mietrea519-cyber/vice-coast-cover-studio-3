// Vice Coast Cover Studio — editor wiring.
// Owns the four steps (photos, framing, caption, export), the live preview
// canvas, and the fixed ?shot= demo scenes the screenshots are taken from.

import { drawCover, POST_SIZES, LAYOUTS, GRADES } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('preview');
const statusEl = $('status');

const state = {
  photos: [null, null, null, null, null],
  frames: [0, 1, 2, 3, 4].map(() => ({ zoom: 1, dx: 0, dy: 0 })),
  layout: 'five',
  grade: 'neon',
  title: 'NEON COAST',
  tagline: 'Vice City nights',
  size: 'square',
  selected: 0,
};

function panelCount() {
  return LAYOUTS[state.layout].panels;
}

function applySize() {
  const s = POST_SIZES[state.size];
  canvas.width = s.w;
  canvas.height = s.h;
  canvas.classList.toggle('is-wide', state.size === 'wide');
  canvas.classList.toggle('is-portrait', state.size === 'portrait');
}

export function redraw() {
  applySize();
  drawCover(canvas, state);
  syncPanelDots();
  $('zoom').value = state.frames[state.selected].zoom;
  $('shiftX').value = state.frames[state.selected].dx;
  $('shiftY').value = state.frames[state.selected].dy;
  document.querySelectorAll('#layoutRow button').forEach((b) => b.classList.toggle('on', b.dataset.layout === state.layout));
  document.querySelectorAll('#gradeRow button').forEach((b) => b.classList.toggle('on', b.dataset.grade === state.grade));
  document.querySelectorAll('#sizeRow button').forEach((b) => b.classList.toggle('on', b.dataset.size === state.size));
}

function syncPanelDots() {
  const dots = $('panelDots');
  dots.innerHTML = '';
  for (let i = 0; i < panelCount(); i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1}${state.photos[i] ? ' ●' : ''}`;
    b.classList.toggle('on', i === state.selected);
    b.addEventListener('click', () => { state.selected = i; redraw(); });
    dots.appendChild(b);
  }
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSample(name) {
  const img = await loadImage(`samples/${name}.jpg`);
  state.photos[state.selected] = img;
  redraw();
  statusEl.textContent = `Loaded sample ${name} into panel ${state.selected + 1}.`;
}

function fillAllPanels() {
  const img = state.photos[state.selected];
  if (!img) { statusEl.textContent = 'Pick a photo for the selected panel first.'; return; }
  const frame = { ...state.frames[state.selected] };
  for (let i = 0; i < panelCount(); i++) { state.photos[i] = img; state.frames[i] = { ...frame }; }
  redraw();
  statusEl.textContent = 'One photo now fills every panel.';
}

function exportPng(sizeKey) {
  const s = POST_SIZES[sizeKey];
  const off = document.createElement('canvas');
  off.width = s.w;
  off.height = s.h;
  drawCover(off, { ...state, size: sizeKey });
  off.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-coast-${s.w}x${s.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved vice-coast-${s.w}x${s.h}.png`;
  }, 'image/png');
}

// --- Step 1: photos -------------------------------------------------------
$('fileInput').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (const file of files) {
    const img = await loadImage(URL.createObjectURL(file));
    const slot = state.photos.findIndex((p) => !p);
    state.photos[slot === -1 ? state.selected : slot] = img;
  }
  redraw();
  statusEl.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} added.`;
});
document.querySelectorAll('[data-sample]').forEach((b) => b.addEventListener('click', () => loadSample(b.dataset.sample)));
$('fillAll').addEventListener('click', fillAllPanels);
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = [...(e.dataTransfer?.files ?? [])].find((f) => f.type.startsWith('image/'));
  if (!file) return;
  state.photos[state.selected] = await loadImage(URL.createObjectURL(file));
  redraw();
});

// --- Step 2: frame the panel ----------------------------------------------
let dragging = false;
let lastX = 0;
let lastY = 0;
canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const r = canvas.getBoundingClientRect();
  const f = state.frames[state.selected];
  f.dx += (e.clientX - lastX) / r.width;
  f.dy += (e.clientY - lastY) / r.height;
  f.dx = Math.max(-1, Math.min(1, f.dx));
  f.dy = Math.max(-1, Math.min(1, f.dy));
  lastX = e.clientX; lastY = e.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const f = state.frames[state.selected];
  f.zoom = Math.max(1, Math.min(4, f.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  redraw();
}, { passive: false });
$('zoom').addEventListener('input', (e) => { state.frames[state.selected].zoom = Number(e.target.value); redraw(); });
$('shiftX').addEventListener('input', (e) => { state.frames[state.selected].dx = Number(e.target.value); redraw(); });
$('shiftY').addEventListener('input', (e) => { state.frames[state.selected].dy = Number(e.target.value); redraw(); });
$('resetFrame').addEventListener('click', () => { state.frames[state.selected] = { zoom: 1, dx: 0, dy: 0 }; redraw(); });

// --- Step 3: caption + grade ----------------------------------------------
$('titleInput').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('taglineInput').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
document.querySelectorAll('#gradeRow button').forEach((b) => b.addEventListener('click', () => { state.grade = b.dataset.grade; redraw(); }));
document.querySelectorAll('#layoutRow button').forEach((b) => b.addEventListener('click', () => {
  state.layout = b.dataset.layout;
  state.selected = 0;
  redraw();
}));

// --- Step 4: export ---------------------------------------------------------
document.querySelectorAll('#sizeRow button').forEach((b) => b.addEventListener('click', () => { state.size = b.dataset.size; redraw(); }));
document.querySelectorAll('[data-export]').forEach((b) => b.addEventListener('click', () => exportPng(b.dataset.export)));

$('titleInput').value = state.title;
$('taglineInput').value = state.tagline;

const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  runShot(params.get('shot'), params, state, loadSample, redraw);
} else {
  redraw();
}
