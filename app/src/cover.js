// Vice Coast Cover Studio — poster renderer.
// Draws a multi-panel GTA-style poster onto a canvas: the photos fill their
// panels, a colour grade washes over the whole sheet, grain and a vignette
// finish it, and the caption sits in a measured block at the foot so its
// letters can never run off the bottom edge.

export const POST_SIZES = {
  square: { w: 1080, h: 1080, label: '1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
  wide: { w: 1920, h: 1080, label: '1920 × 1080' },
};

export const LAYOUTS = {
  five: { label: 'Five panels', panels: 5 },
  trio: { label: 'Hero + three', panels: 4 },
  solo: { label: 'Full bleed', panels: 1 },
};

// Each grade is a wash of two colours, an ink for the gutters and caption
// band, and an accent for the tagline script.
export const GRADES = {
  neon: { label: 'Neon Nights', wash: ['#ff2e88', '#00d5ff'], ink: '#160a24', accent: '#7df3ff', title: ['#ffe95e', '#ff5e8a'] },
  sunset: { label: 'Sunset Gold', wash: ['#ff7a2e', '#c2185b'], ink: '#241016', accent: '#ffd166', title: ['#fff3b0', '#ff8a3d'] },
  pastel: { label: 'Pastel Vice', wash: ['#ff9ecf', '#5ec8c0'], ink: '#1c2430', accent: '#ffe3f1', title: ['#ffffff', '#ffb3dd'] },
  midnight: { label: 'Midnight Teal', wash: ['#0e7c86', '#7b2ff7'], ink: '#08131c', accent: '#8ef1e4', title: ['#d8fff6', '#7fb2ff'] },
  coral: { label: 'Coral Dusk', wash: ['#ff5e62', '#ff9966'], ink: '#22101a', accent: '#ffe08a', title: ['#fff8d6', '#ff7a6b'] },
};

function panelRects(layout, w, h) {
  const g = Math.max(6, Math.round(Math.min(w, h) * 0.012)); // gutter
  if (layout === 'solo') return [{ x: 0, y: 0, w, h }];
  if (layout === 'trio') {
    const heroH = Math.round(h * 0.62);
    const third = Math.round((w - g * 4) / 3);
    const small = [0, 1, 2].map((i) => ({ x: g + i * (third + g), y: heroH + g, w: third, h: h - heroH - g * 2 }));
    return [{ x: 0, y: 0, w, h: heroH }, ...small];
  }
  // five: big hero on the left, four stacked two-by-two on the right.
  const heroW = Math.round(w * 0.58);
  const sideW = Math.round((w - heroW - g * 2) / 2);
  const sideH = Math.round((h - g * 3) / 2);
  return [
    { x: 0, y: 0, w: heroW, h },
    { x: heroW + g, y: 0, w: sideW, h: sideH },
    { x: heroW + g + sideW + g, y: 0, w: sideW, h: sideH },
    { x: heroW + g, y: sideH + g, w: sideW, h: sideH },
    { x: heroW + g + sideW + g, y: sideH + g, w: sideW, h: sideH },
  ];
}

/** Paints one photo into a panel rect, cover-fit, with the panel's framing. */
export function drawPanelPhoto(ctx, photo, rect, frame) {
  if (!photo) {
    const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    grad.addColorStop(0, '#3a2340');
    grad.addColorStop(1, '#1a1024');
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }
  const zoom = frame?.zoom ?? 1;
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight) * zoom;
  const pw = photo.naturalWidth * base;
  const ph = photo.naturalHeight * base;
  const cx = rect.x + rect.w / 2 + (frame?.dx ?? 0) * rect.w;
  const cy = rect.y + rect.h / 2 + (frame?.dy ?? 0) * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.restore();
}

/**
 * Measures the whole caption block — title, gap, tagline — then shrinks it
 * until it fits inside the frame with a real bottom margin. Nothing is
 * drawn below h - margin, so the last rows of the poster stay clean.
 */
export function drawCaptionBlock(ctx, w, h, title, tagline, grade) {
  const text = (title || '').trim().toUpperCase();
  const sub = (tagline || '').trim();
  if (!text && !sub) return;
  const margin = Math.round(h * 0.045);
  const bottom = h - margin;
  const maxBand = Math.round(h * 0.30); // caption may use at most the bottom 30%
  let titleSize = Math.round(h * 0.105);
  let tagSize = 0;
  let blockH = 0;
  for (;;) {
    ctx.font = `${titleSize}px Anton, sans-serif`;
    const tw = text ? ctx.measureText(text).width : 0;
    if (tw > w * 0.92 && titleSize > 14) { titleSize = Math.round(titleSize * 0.94); continue; }
    tagSize = Math.round(titleSize * 0.36);
    const gap = Math.round(titleSize * 0.22);
    blockH = (text ? titleSize : 0) + (text && sub ? gap : 0) + (sub ? tagSize : 0);
    if (blockH <= maxBand || titleSize <= 14) break;
    titleSize = Math.round(titleSize * 0.94);
  }
  const bandTop = bottom - blockH;
  // Dark band behind the lettering so it reads over any photo.
  const band = ctx.createLinearGradient(0, bandTop - titleSize * 0.45, 0, h);
  band.addColorStop(0, 'rgba(10, 6, 18, 0)');
  band.addColorStop(0.35, 'rgba(10, 6, 18, 0.72)');
  band.addColorStop(1, 'rgba(10, 6, 18, 0.88)');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandTop - titleSize * 0.45, w, h - bandTop + titleSize * 0.45);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let y = bandTop + (text ? titleSize : 0);
  if (text) {
    ctx.font = `${titleSize}px Anton, sans-serif`;
    const grad = ctx.createLinearGradient(0, y - titleSize, 0, y);
    grad.addColorStop(0, grade.title[0]);
    grad.addColorStop(1, grade.title[1]);
    ctx.lineWidth = Math.max(2, titleSize * 0.07);
    ctx.strokeStyle = 'rgba(12, 6, 20, 0.9)';
    ctx.strokeText(text, w / 2, y);
    ctx.fillStyle = grad;
    ctx.fillText(text, w / 2, y);
  }
  if (sub) {
    y += (text ? Math.round(titleSize * 0.22) : 0) + tagSize;
    ctx.font = `${tagSize}px Pacifico, cursive`;
    ctx.lineWidth = Math.max(1.5, tagSize * 0.06);
    ctx.strokeStyle = 'rgba(12, 6, 20, 0.85)';
    ctx.strokeText(sub, w / 2, y);
    ctx.fillStyle = grade.accent;
    ctx.fillText(sub, w / 2, y);
  }
}

/** Draws the full poster for the given state onto the canvas. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] ?? GRADES.neon;
  const layout = LAYOUTS[state.layout] ? state.layout : 'five';
  const rects = panelRects(layout, w, h);
  ctx.fillStyle = grade.ink;
  ctx.fillRect(0, 0, w, h);
  rects.forEach((rect, i) => {
    drawPanelPhoto(ctx, state.photos[i] ?? null, rect, state.frames[i]);
  });
  // Colour grade: a soft diagonal wash over everything.
  const wash = ctx.createLinearGradient(0, 0, w, h);
  wash.addColorStop(0, hexA(grade.wash[0], 0.16));
  wash.addColorStop(0.55, hexA(grade.wash[0], 0.05));
  wash.addColorStop(1, hexA(grade.wash[1], 0.20));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  // Warm sunset glow low on the sheet.
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.95, 0, w * 0.5, h * 0.95, w * 0.75);
  glow.addColorStop(0, hexA(grade.wash[0], 0.22));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  drawCaptionBlock(ctx, w, h, state.title, state.tagline, grade);
  // Grain: a seeded speckle so the poster feels printed, not flat.
  let seed = 1234567;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < Math.round(w * h / 900); i++) {
    ctx.fillRect(rnd() * w, rnd() * h, 1.4, 1.4);
  }
  // Vignette: darkened corners pull the eye to the middle.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(8,4,14,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function hexA(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
