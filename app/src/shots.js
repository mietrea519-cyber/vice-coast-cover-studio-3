// Fixed demo scenes for screenshots: ?shot=cover shows the poster alone,
// ?shot=editor shows the editor with a photo loaded, and ?shot=editor34
// shows the same editor scrolled down to steps 3 (caption + grades) and 4
// (export sizes), so the caption editing and the three PNG sizes are visible.
// `photo` picks the sample, `caption` the title, `tagline` the subtitle,
// `grade` the colour grade, `size` the post size. window.__shotReady is
// set once the scene has painted.

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function runShot(shot, query, state, loadSample, redraw) {
  const photo = query.get('photo') ?? 'neon';
  const other = photo === 'neon' ? 'pier' : 'neon';
  state.title = query.get('caption') ?? 'NEON COAST';
  state.tagline = query.get('tagline') ?? 'Vice City nights';
  document.getElementById('titleInput').value = state.title;
  document.getElementById('taglineInput').value = state.tagline;
  state.grade = query.get('grade') ?? 'neon';
  state.layout = query.get('layout') ?? 'five';
  state.size = query.get('size') ?? 'square';
  try { await document.fonts.load('100px Anton'); await document.fonts.load('40px Pacifico'); } catch { /* fall back to system fonts */ }
  await document.fonts.ready;
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const a = await loadImage(`samples/${photo}.jpg`);
    const b = await loadImage(`samples/${other}.jpg`);
    state.photos = [a, b, a, b, a];
    state.frames = state.frames.map(() => ({ zoom: 1, dx: 0, dy: 0 }));
    redraw();
  } else {
    await loadSample(photo);
    state.photos[1] = await loadImage(`samples/${other}.jpg`);
    redraw();
    if (shot === 'editor34') {
      document.body.classList.add('shot-steps34');
    }
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
