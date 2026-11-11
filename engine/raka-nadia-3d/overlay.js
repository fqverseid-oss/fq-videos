/* Video demo — "Sebuah Dunia Untukmu" (website kado ulang tahun)
 * Deterministic: window.render(t) draws the frame at time t (seconds). 1080×1920. */
const C = document.getElementById('c');
const X = C.getContext('2d');
const W = 1080, H = 1920;
const SUBS = !location.search.includes('nosub');

const COL = {
  midnight: '#05070f', night: '#0a1024', navy: '#111a36', dusk: '#1d2747',
  ivory: '#f3eee3', champagne: '#d8c39a', gold: '#b8955a', mist: '#8d96ad', paper: '#efe7d6', ink: '#2a2318',
};
const SERIF = "'Instrument Serif', serif";
const UI = "'Hanken Grotesk', sans-serif";
const SCRIPT = "'Pinyon Script', cursive";

/* ───────────── helpers ───────────── */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeBack = (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }

function rr(x, y, w, h, r) {
  X.beginPath();
  X.moveTo(x + r, y);
  X.arcTo(x + w, y, x + w, y + h, r);
  X.arcTo(x + w, y + h, x, y + h, r);
  X.arcTo(x, y + h, x, y, r);
  X.arcTo(x, y, x + w, y, r);
  X.closePath();
}
/** arch: centre x, bottom y, width, height (semicircular top) */
function archPath(cx, by, w, h) {
  const r = w / 2;
  X.beginPath();
  X.moveTo(cx - r, by);
  X.lineTo(cx - r, by - h + r);
  X.arc(cx, by - h + r, r, Math.PI, 0);
  X.lineTo(cx + r, by);
  X.closePath();
}
function glow(x, y, r, color, a = 1) {
  const g = X.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  X.save();
  X.globalAlpha *= a;
  X.globalCompositeOperation = 'lighter';
  X.fillStyle = g;
  X.fillRect(x - r, y - r, r * 2, r * 2);
  X.restore();
}
function text(str, x, y, { font = `64px ${SERIF}`, color = COL.ivory, align = 'center', alpha = 1, spacing = 0, base = 'alphabetic' } = {}) {
  X.save();
  X.globalAlpha *= alpha;
  X.font = font;
  X.fillStyle = color;
  X.textAlign = align;
  X.textBaseline = base;
  if (spacing) X.letterSpacing = spacing + 'px';
  X.fillText(str, x, y);
  X.restore();
}
function wrapLines(str, font, maxW) {
  X.save();
  X.font = font;
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (X.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  X.restore();
  return lines;
}

/* star fields (precomputed) */
function makeStars(n, seed, w, h) {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({ x: r() * w, y: r() * h, s: r() * 1.8 + 0.4, p: r() * 6.28, sp: 0.6 + r() * 1.8 }));
}
const STARS_FULL = makeStars(240, 7, W, H);
const STARS_SCREEN = makeStars(170, 11, 600, 1240);
function drawStars(stars, t, a = 1, color = '243,238,227') {
  for (const s of stars) {
    const k = 0.45 + 0.55 * Math.sin(t * s.sp + s.p) ** 2;
    X.fillStyle = `rgba(${color},${(k * a).toFixed(3)})`;
    X.beginPath();
    X.arc(s.x, s.y, s.s, 0, 6.283);
    X.fill();
  }
}
function nightBg(w, h, top = '#060a18', bottom = '#121a38') {
  const g = X.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  X.fillStyle = g;
  X.fillRect(0, 0, w, h);
}

/* ───────────── characters ───────────── */
const SKIN = '#f2cba8', SKIN_D = '#d9a985';

function face(x, y, s, { mood = 'calm', t = 0, girl = false }) {
  // eyes
  const ex = 34 * s, ey = y + 6 * s;
  X.fillStyle = '#1b1720';
  if (mood === 'happy') {
    X.strokeStyle = '#1b1720'; X.lineWidth = 5 * s; X.lineCap = 'round';
    for (const d of [-1, 1]) { X.beginPath(); X.arc(x + d * ex, ey + 6 * s, 14 * s, Math.PI * 1.15, Math.PI * 1.85); X.stroke(); }
  } else if (mood === 'wish' || mood === 'blow') {
    // eyes gently closed
    X.strokeStyle = '#1b1720'; X.lineWidth = 5 * s; X.lineCap = 'round';
    for (const d of [-1, 1]) {
      X.beginPath(); X.arc(x + d * ex, ey - 4 * s, 13 * s, Math.PI * 0.15, Math.PI * 0.85); X.stroke();
      // lashes
      X.lineWidth = 3 * s;
      X.beginPath(); X.moveTo(x + d * (ex + 12 * s), ey + 2 * s); X.lineTo(x + d * (ex + 19 * s), ey - 2 * s); X.stroke();
      X.lineWidth = 5 * s;
    }
  } else {
    const blink = (t % 3.1) > 2.95 ? 0.15 : 1;
    for (const d of [-1, 1]) {
      X.beginPath(); X.ellipse(x + d * ex, ey, 10 * s, (mood === 'panic' ? 15 : 13) * s * blink, 0, 0, 6.283); X.fill();
      if (blink > 0.5) { X.fillStyle = '#fff'; X.beginPath(); X.arc(x + d * ex + 3 * s, ey - 4 * s, 3.4 * s, 0, 6.283); X.fill(); X.fillStyle = '#1b1720'; }
    }
  }
  // brows
  X.strokeStyle = girl ? '#3a2418' : '#1d1a22'; X.lineWidth = 5 * s; X.lineCap = 'round';
  for (const d of [-1, 1]) {
    X.beginPath();
    if (mood === 'panic') { X.moveTo(x + d * 20 * s, ey - 26 * s); X.lineTo(x + d * 48 * s, ey - 34 * s); }
    else { X.moveTo(x + d * 22 * s, ey - 26 * s); X.quadraticCurveTo(x + d * 36 * s, ey - 31 * s, x + d * 48 * s, ey - 25 * s); }
    X.stroke();
  }
  // puffed cheeks while blowing
  if (mood === 'blow') {
    X.fillStyle = SKIN;
    for (const d of [-1, 1]) { X.beginPath(); X.ellipse(x + d * 58 * s, ey + 40 * s, 40 * s, 34 * s, 0, 0, 6.283); X.fill(); }
  }
  // blush
  X.fillStyle = mood === 'blow' ? 'rgba(232,120,110,0.5)' : 'rgba(232,130,120,0.35)';
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(x + d * (mood === 'blow' ? 60 : 50) * s, ey + (mood === 'blow' ? 36 : 26) * s, (mood === 'blow' ? 18 : 13) * s, (mood === 'blow' ? 11 : 8) * s, 0, 0, 6.283); X.fill(); }
  // mouth
  X.strokeStyle = '#5b2a26'; X.lineWidth = 5 * s;
  if (mood === 'panic') { X.fillStyle = '#5b2a26'; X.beginPath(); X.ellipse(x, y + 52 * s, 10 * s, 13 * s, 0, 0, 6.283); X.fill(); }
  else if (mood === 'blow') {
    X.fillStyle = '#c4645c'; X.beginPath(); X.ellipse(x, y + 50 * s, 11 * s, 10 * s, 0, 0, 6.283); X.fill();
    X.fillStyle = '#5b2a26'; X.beginPath(); X.ellipse(x, y + 51 * s, 5 * s, 5 * s, 0, 0, 6.283); X.fill();
  }
  else if (mood === 'wish') { X.beginPath(); X.arc(x, y + 36 * s, 10 * s, 0.3, Math.PI - 0.3); X.stroke(); }
  else if (mood === 'happy') { X.fillStyle = '#7a3430'; X.beginPath(); X.arc(x, y + 42 * s, 18 * s, 0.1, Math.PI - 0.1); X.closePath(); X.fill(); }
  else { X.beginPath(); X.arc(x, y + 38 * s, 13 * s, 0.25, Math.PI - 0.25); X.stroke(); }
}

function raka(x, y, s, { mood = 'calm', t = 0, phoneGlow = 1 }) {
  X.save();
  // torso (hoodie)
  X.fillStyle = '#2b3a67';
  X.beginPath();
  X.moveTo(x - 190 * s, y + 420 * s);
  X.quadraticCurveTo(x - 185 * s, y + 170 * s, x - 70 * s, y + 140 * s);
  X.lineTo(x + 70 * s, y + 140 * s);
  X.quadraticCurveTo(x + 185 * s, y + 170 * s, x + 190 * s, y + 420 * s);
  X.closePath(); X.fill();
  X.strokeStyle = '#d8c39a'; X.lineWidth = 4 * s;
  X.beginPath(); X.moveTo(x - 22 * s, y + 160 * s); X.lineTo(x - 26 * s, y + 250 * s); X.moveTo(x + 22 * s, y + 160 * s); X.lineTo(x + 26 * s, y + 250 * s); X.stroke();
  // neck
  X.fillStyle = SKIN_D; X.fillRect(x - 32 * s, y + 90 * s, 64 * s, 60 * s);
  // head
  X.fillStyle = SKIN; X.beginPath(); X.ellipse(x, y, 98 * s, 112 * s, 0, 0, 6.283); X.fill();
  // ears
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(x + d * 98 * s, y + 10 * s, 18 * s, 26 * s, 0, 0, 6.283); X.fill(); }
  // hair
  X.fillStyle = '#1d1a22';
  X.beginPath();
  X.moveTo(x - 104 * s, y - 4 * s);
  X.quadraticCurveTo(x - 118 * s, y - 120 * s, x - 10 * s, y - 128 * s);
  X.quadraticCurveTo(x + 110 * s, y - 132 * s, x + 106 * s, y - 10 * s);
  X.quadraticCurveTo(x + 80 * s, y - 70 * s, x + 30 * s, y - 62 * s);
  X.quadraticCurveTo(x - 10 * s, y - 40 * s, x - 40 * s, y - 70 * s);
  X.quadraticCurveTo(x - 80 * s, y - 60 * s, x - 104 * s, y - 4 * s);
  X.fill();
  face(x, y, s, { mood, t });
  // sweat drop
  if (mood === 'panic') {
    const k = (t * 1.6) % 1;
    X.fillStyle = 'rgba(160,210,255,0.9)';
    X.beginPath(); const sx = x + 92 * s, sy = y - 40 * s + k * 30 * s;
    X.moveTo(sx, sy - 18 * s); X.quadraticCurveTo(sx + 14 * s, sy + 4 * s, sx, sy + 10 * s); X.quadraticCurveTo(sx - 14 * s, sy + 4 * s, sx, sy - 18 * s); X.fill();
  }
  // phone glow on face
  glow(x, y + 120 * s, 220 * s, 'rgba(140,190,255,0.35)', phoneGlow);
  // hands + phone
  X.fillStyle = '#16192a'; rr(x - 60 * s, y + 230 * s, 120 * s, 200 * s, 18 * s); X.fill();
  X.fillStyle = `rgba(150,200,255,${0.75 * phoneGlow})`; rr(x - 52 * s, y + 238 * s, 104 * s, 184 * s, 12 * s); X.fill();
  X.fillStyle = SKIN;
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(x + d * 62 * s, y + 360 * s, 34 * s, 44 * s, 0, 0, 6.283); X.fill(); }
  X.restore();
}

function nadia(x, y, s, { t = 0, mood = 'happy', screen = null, glowCol = 'rgba(255,200,130,0.45)' }) {
  X.save();
  // hair behind
  X.fillStyle = '#3a2418';
  X.beginPath();
  X.moveTo(x - 128 * s, y + 250 * s);
  X.quadraticCurveTo(x - 150 * s, y - 150 * s, x, y - 140 * s);
  X.quadraticCurveTo(x + 150 * s, y - 150 * s, x + 128 * s, y + 250 * s);
  X.closePath(); X.fill();
  // torso (cream sweater)
  X.fillStyle = '#efe3cf';
  X.beginPath();
  X.moveTo(x - 190 * s, y + 430 * s);
  X.quadraticCurveTo(x - 180 * s, y + 175 * s, x - 70 * s, y + 145 * s);
  X.lineTo(x + 70 * s, y + 145 * s);
  X.quadraticCurveTo(x + 180 * s, y + 175 * s, x + 190 * s, y + 430 * s);
  X.closePath(); X.fill();
  X.fillStyle = SKIN_D; X.fillRect(x - 28 * s, y + 90 * s, 56 * s, 60 * s);
  X.fillStyle = SKIN; X.beginPath(); X.ellipse(x, y, 92 * s, 108 * s, 0, 0, 6.283); X.fill();
  // fringe
  X.fillStyle = '#3a2418';
  X.beginPath();
  X.moveTo(x - 96 * s, y + 10 * s);
  X.quadraticCurveTo(x - 100 * s, y - 118 * s, x, y - 118 * s);
  X.quadraticCurveTo(x + 100 * s, y - 118 * s, x + 96 * s, y + 10 * s);
  X.quadraticCurveTo(x + 60 * s, y - 60 * s, x + 10 * s, y - 64 * s);
  X.quadraticCurveTo(x - 50 * s, y - 50 * s, x - 96 * s, y + 10 * s);
  X.fill();
  // hair clip
  X.fillStyle = COL.champagne; rr(x + 46 * s, y - 70 * s, 34 * s, 10 * s, 5 * s); X.fill();
  face(x, y, s, { mood, t, girl: true });
  // warm glow from the phone (candles)
  glow(x, y + 140 * s, 240 * s, glowCol);
  X.fillStyle = '#16192a'; rr(x - 60 * s, y + 235 * s, 120 * s, 200 * s, 18 * s); X.fill();
  if (screen) {
    X.save(); rr(x - 52 * s, y + 243 * s, 104 * s, 184 * s, 12 * s); X.clip();
    X.translate(x - 52 * s, y + 243 * s); X.scale((104 * s) / 300, (184 * s) / 530); screen(); X.restore();
  } else { X.fillStyle = 'rgba(255,214,150,0.85)'; rr(x - 52 * s, y + 243 * s, 104 * s, 184 * s, 12 * s); X.fill(); }
  X.fillStyle = SKIN;
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(x + d * 62 * s, y + 365 * s, 34 * s, 44 * s, 0, 0, 6.283); X.fill(); }
  X.restore();
}

function sparkle(x, y, r, a) {
  X.save(); X.globalAlpha *= a; X.fillStyle = COL.champagne;
  X.beginPath();
  X.moveTo(x, y - r); X.quadraticCurveTo(x, y, x + r, y); X.quadraticCurveTo(x, y, x, y + r); X.quadraticCurveTo(x, y, x - r, y); X.quadraticCurveTo(x, y, x, y - r);
  X.fill(); X.restore();
}

/* ===== Raka & Nadia — Bagian 01 : "Bahu Kiri" (cinta) ===== */
const S_END = 118.2;
const FADE = 0.3;
const typed = (str, T, a, b) => str.slice(0, Math.floor(str.length * clamp((T - a) / (b - a))));
const fadeIO = (T, a, b, f = 0.25) => Math.min(prog(T, a, a + f), 1 - prog(T, b - f, b));

/* ---------- extra helpers ---------- */
function heart(x, y, s, color = '#ff6b8b', a = 1) {
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s); X.fillStyle = color;
  X.beginPath(); X.moveTo(0, 30); X.bezierCurveTo(-60, -10, -30, -55, 0, -22); X.bezierCurveTo(30, -55, 60, -10, 0, 30); X.fill(); X.restore();
}
function bubble(x, y, w, h, lines, { font = `italic 46px ${SERIF}`, tail = [x + 60, y + h + 70], color = '#fffaf0', ink = '#2a2318', a = 1, lh = 56, think = false } = {}) {
  X.save(); X.globalAlpha *= a;
  X.shadowColor = 'rgba(0,0,0,0.35)'; X.shadowBlur = 24;
  X.fillStyle = color; rr(x, y, w, h, 44); X.fill();
  X.shadowBlur = 0;
  if (think) { for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(tail[0] - i * 22 + (i === 2 ? 10 : 0), tail[1] - i * 40, 22 - i * 6, 0, 6.283); X.fill(); } }
  else { X.beginPath(); X.moveTo(tail[0] - 30, y + h - 4); X.lineTo(tail[0], tail[1]); X.lineTo(tail[0] + 36, y + h - 4); X.closePath(); X.fill(); }
  X.restore();
  lines.forEach((ln, i) => text(ln, x + w / 2, y + 78 + i * lh, { font, color: ink, alpha: a }));
}
function bustRaka(x, y, s, { mood = 'calm', t = 0, wet = 0 } = {}) {
  X.save();
  X.fillStyle = '#2b3a67';
  X.beginPath(); X.moveTo(x - 190 * s, y + 420 * s); X.quadraticCurveTo(x - 185 * s, y + 170 * s, x - 70 * s, y + 140 * s); X.lineTo(x + 70 * s, y + 140 * s);
  X.quadraticCurveTo(x + 185 * s, y + 170 * s, x + 190 * s, y + 420 * s); X.closePath(); X.fill();
  if (wet > 0) { // his left shoulder = viewer's right
    X.save(); X.globalAlpha = 0.75 * wet; X.fillStyle = '#121a38';
    X.beginPath(); X.moveTo(x + 70 * s, y + 140 * s); X.quadraticCurveTo(x + 185 * s, y + 170 * s, x + 190 * s, y + 420 * s);
    X.lineTo(x + 70 * s, y + 420 * s); X.quadraticCurveTo(x + 120 * s, y + 280 * s, x + 70 * s, y + 140 * s); X.fill(); X.restore();
  }
  X.strokeStyle = '#d8c39a'; X.lineWidth = 4 * s;
  X.beginPath(); X.moveTo(x - 22 * s, y + 160 * s); X.lineTo(x - 26 * s, y + 250 * s); X.moveTo(x + 22 * s, y + 160 * s); X.lineTo(x + 26 * s, y + 250 * s); X.stroke();
  X.fillStyle = SKIN_D; X.fillRect(x - 32 * s, y + 90 * s, 64 * s, 60 * s);
  X.fillStyle = SKIN; X.beginPath(); X.ellipse(x, y, 98 * s, 112 * s, 0, 0, 6.283); X.fill();
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(x + d * 98 * s, y + 10 * s, 18 * s, 26 * s, 0, 0, 6.283); X.fill(); }
  X.fillStyle = '#1d1a22';
  X.beginPath(); X.moveTo(x - 104 * s, y - 4 * s); X.quadraticCurveTo(x - 118 * s, y - 120 * s, x - 10 * s, y - 128 * s); X.quadraticCurveTo(x + 110 * s, y - 132 * s, x + 106 * s, y - 10 * s);
  X.quadraticCurveTo(x + 80 * s, y - 70 * s, x + 30 * s, y - 62 * s); X.quadraticCurveTo(x - 10 * s, y - 40 * s, x - 40 * s, y - 70 * s); X.quadraticCurveTo(x - 80 * s, y - 60 * s, x - 104 * s, y - 4 * s); X.fill();
  face(x, y, s, { mood, t });
  if (mood === 'panic') {
    const k = (t * 1.6) % 1; X.fillStyle = 'rgba(160,210,255,0.9)'; X.beginPath(); const sx = x + 92 * s, sy = y - 40 * s + k * 30 * s;
    X.moveTo(sx, sy - 18 * s); X.quadraticCurveTo(sx + 14 * s, sy + 4 * s, sx, sy + 10 * s); X.quadraticCurveTo(sx - 14 * s, sy + 4 * s, sx, sy - 18 * s); X.fill();
  }
  X.restore();
}
function bustNadia(x, y, s, { mood = 'happy', t = 0 } = {}) {
  X.save();
  X.fillStyle = '#3a2418';
  X.beginPath(); X.moveTo(x - 128 * s, y + 250 * s); X.quadraticCurveTo(x - 150 * s, y - 150 * s, x, y - 140 * s); X.quadraticCurveTo(x + 150 * s, y - 150 * s, x + 128 * s, y + 250 * s); X.closePath(); X.fill();
  X.fillStyle = '#efe3cf';
  X.beginPath(); X.moveTo(x - 190 * s, y + 430 * s); X.quadraticCurveTo(x - 180 * s, y + 175 * s, x - 70 * s, y + 145 * s); X.lineTo(x + 70 * s, y + 145 * s);
  X.quadraticCurveTo(x + 180 * s, y + 175 * s, x + 190 * s, y + 430 * s); X.closePath(); X.fill();
  X.fillStyle = SKIN_D; X.fillRect(x - 28 * s, y + 90 * s, 56 * s, 60 * s);
  X.fillStyle = SKIN; X.beginPath(); X.ellipse(x, y, 92 * s, 108 * s, 0, 0, 6.283); X.fill();
  X.fillStyle = '#3a2418';
  X.beginPath(); X.moveTo(x - 96 * s, y + 10 * s); X.quadraticCurveTo(x - 100 * s, y - 118 * s, x, y - 118 * s); X.quadraticCurveTo(x + 100 * s, y - 118 * s, x + 96 * s, y + 10 * s);
  X.quadraticCurveTo(x + 60 * s, y - 60 * s, x + 10 * s, y - 64 * s); X.quadraticCurveTo(x - 50 * s, y - 50 * s, x - 96 * s, y + 10 * s); X.fill();
  X.fillStyle = COL.champagne; rr(x + 46 * s, y - 70 * s, 34 * s, 10 * s, 5 * s); X.fill();
  face(x, y, s, { mood, t, girl: true });
  X.restore();
}
function rain(T, { intensity = 1, shelter = null, angle = 0.18, n = 170 } = {}) {
  const r = rng(77); X.save(); X.strokeStyle = 'rgba(190,215,255,0.55)'; X.lineWidth = 3; X.lineCap = 'round';
  const cnt = Math.floor(n * intensity);
  for (let i = 0; i < cnt; i++) {
    const x0 = r() * (W + 300) - 150, sp = 1500 + r() * 900, y0 = r() * (H + 200);
    const y = ((y0 + T * sp) % (H + 200)) - 100, x = x0 - y * angle;
    if (shelter && x > shelter[0] && x < shelter[1] && y > shelter[2]) continue;
    X.beginPath(); X.moveTo(x, y); X.lineTo(x - 18 * angle * 3, y + 54); X.stroke();
  }
  X.restore();
}
function umbrella(cx, cy, R, a = 1, part = 'all') {
  X.save(); X.globalAlpha *= a;
  if (part !== 'canopy') { X.strokeStyle = '#7a5a3a'; X.lineWidth = 12; X.lineCap = 'round';
  X.beginPath(); X.moveTo(cx, cy); X.lineTo(cx, cy + 430); X.arc(cx - 36, cy + 430, 36, 0, Math.PI * 0.95); X.stroke(); }
  if (part === 'handle') { X.restore(); return; }
  X.fillStyle = '#2f6fd6';
  X.beginPath(); X.moveTo(cx - R, cy); X.ellipse(cx, cy, R, R * 0.62, 0, Math.PI, 0);
  const n = 4, w = (2 * R) / n; for (let i = 0; i < n; i++) X.arc(cx + R - w / 2 - i * w, cy, w / 2, 0, Math.PI);
  X.closePath(); X.fill();
  X.strokeStyle = 'rgba(255,255,255,0.35)'; X.lineWidth = 4;
  for (const k of [-0.55, 0, 0.55]) { X.beginPath(); X.moveTo(cx, cy - R * 0.62); X.quadraticCurveTo(cx + k * R * 1.1, cy - R * 0.3, cx + k * R, cy); X.stroke(); }
  X.fillStyle = '#4b8cf0'; X.beginPath(); X.ellipse(cx - R * 0.35, cy - R * 0.38, R * 0.22, R * 0.1, -0.5, 0, 6.283); X.fill();
  X.restore();
}
function pill(x, y, str, { w = 640, h = 84, bg = 'rgba(255,255,255,0.12)', ink = COL.ivory, font = `500 38px ${UI}`, a = 1, stroke = null } = {}) {
  X.save(); X.globalAlpha *= a; X.fillStyle = bg; rr(x - w / 2, y - h / 2, w, h, h / 2); X.fill();
  if (stroke) { X.strokeStyle = stroke; X.lineWidth = 3; rr(x - w / 2, y - h / 2, w, h, h / 2); X.stroke(); }
  text(str, x, y + 13, { font, color: ink }); X.restore();
}
function vignette(a, col = '0,0,0') {
  const g = X.createRadialGradient(540, 960, 400, 540, 960, 1150); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`);
  X.fillStyle = g; X.fillRect(0, 0, W, H);
}
function ground(y, c1, c2) { const g = X.createLinearGradient(0, y, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); X.fillStyle = g; X.fillRect(0, y, W, H - y); }


/* ---------- S5 vote ---------- */
function voteCard(x, y, w, h, o) {
  X.save(); X.globalAlpha *= o.a;
  X.translate(0, (1 - easeOut(o.k)) * 60);
  X.shadowColor = 'rgba(0,0,0,0.45)'; X.shadowBlur = 36; X.fillStyle = 'rgba(20,26,54,0.92)'; rr(x, y, w, h, 40); X.fill(); X.shadowBlur = 0;
  X.strokeStyle = o.col; X.lineWidth = 5; rr(x, y, w, h, 40); X.stroke();
  X.fillStyle = o.col; X.beginPath(); X.arc(x + 100, y + 100, 64, 0, 6.283); X.fill();
  text(o.letter, x + 100, y + 128, { font: `600 90px ${UI}`, color: '#0a0f24' });
  text(o.title, x + 200, y + 88, { font: `400 68px ${SERIF}`, color: COL.ivory, align: 'left', alpha: prog(o.T, o.t0, o.t0 + 0.4) });
  const qa = prog(o.T, o.t1, o.t1 + 0.4);
  text(o.quote, x + 200, y + 150, { font: `italic 44px ${SERIF}`, color: COL.champagne, align: 'left', alpha: qa });
  const row = (yy, mark, col, str, tA) => {
    const a = prog(o.T, tA, tA + 0.45); if (a <= 0) return;
    X.save(); X.globalAlpha *= a; X.translate((1 - a) * 30, 0);
    X.fillStyle = col; X.beginPath(); X.arc(x + 80, yy, 34, 0, 6.283); X.fill();
    X.strokeStyle = '#0a0f24'; X.lineWidth = 8; X.lineCap = 'round'; X.beginPath();
    if (mark === 'ok') { X.moveTo(x + 66, yy); X.lineTo(x + 76, yy + 12); X.lineTo(x + 96, yy - 12); } else { X.moveTo(x + 68, yy - 12); X.lineTo(x + 92, yy + 12); X.moveTo(x + 92, yy - 12); X.lineTo(x + 68, yy + 12); }
    X.stroke();
    const ls = wrapLines(str, `400 42px ${UI}`, w - 220);
    ls.forEach((ln, i) => text(ln, x + 140, yy + 14 + i * 52 - (ls.length - 1) * 26, { font: `400 42px ${UI}`, color: COL.ivory, align: 'left' }));
    X.restore();
  };
  row(y + 300, 'ok', '#7fd49b', o.pro, o.tPro);
  row(y + 460, 'no', '#ff8f84', o.con, o.tCon);
  X.restore();
}
function sVote(T) {
  nightBg(W, H, '#080c1f', '#171f44'); drawStars(STARS_FULL, T, 0.5);
  const after = prog(T, 104.2, 104.8);
  const aDim = 1 - 0.5 * prog(T, 93.9, 94.4); const dimAll = 1 - 0.6 * after;
  const hd = fadeIO(T, 82.9, 104.4, 0.4);
  voteCard(80, 470, 920, 600, { a: dimAll * aDim, k: prog(T, 83.0, 83.5), col: '#ff8fb0', letter: 'A', title: 'Jujur', quote: '"Karena aku suka kamu."', pro: 'Lega, akhirnya Nadia tahu', con: 'Persahabatan bisa jadi canggung, atau bahkan berakhir', T, t0: 83.2, t1: 84.7, tPro: 86.7, tCon: 89.7 });
  voteCard(80, 1110, 920, 600, { a: dimAll * prog(T, 93.9, 94.3), k: prog(T, 93.9, 94.4), col: '#8fc2ff', letter: 'B', title: 'Bilang sahabat', quote: '"Karena kita sahabat."', pro: 'Semuanya tetap aman seperti biasa', con: 'Nadia mungkin tidak akan pernah tahu, dan kamu bisa menyesal seumur hidup', T, t0: 94.0, t1: 94.9, tPro: 96.7, tCon: 99.1 });
  if (T < 93.9 || true) text('Kalau kamu jadi Raka?', 540, 410, { font: `italic 60px ${SERIF}`, color: COL.ivory, alpha: fadeIO(T, 83.0, 104.6, 0.4) * 0.9 });
  if (after > 0) {
    const bx = 540, by = 880;
    X.save(); X.globalAlpha = after; X.fillStyle = 'rgba(245,240,230,0.96)'; X.shadowColor = 'rgba(0,0,0,0.5)'; X.shadowBlur = 40; rr(110, by - 110, 860, 220, 40); X.fill(); X.shadowBlur = 0;
    text('Ketik A atau B di komentar', bx, by - 22, { font: `italic 52px ${SERIF}`, color: '#2a2318' });
    const cur = Math.floor(T * 2) % 2 === 0 ? '|' : ''; const typedAB = T > 105.0 ? (T > 105.2 ? 'A  atau  B' : 'A') : '';
    text(typedAB + cur, bx, by + 70, { font: `600 62px ${UI}`, color: '#2f9e6a' });
    X.restore();
    const fa = prog(T, 106.4, 106.9); const pulse = 1 + 0.05 * Math.sin(T * 6);
    if (fa > 0) { X.save(); X.globalAlpha = fa; X.translate(540, 1280); X.scale(pulse, pulse); X.fillStyle = COL.champagne; rr(-250, -70, 500, 140, 70); X.fill(); text('+ Ikuti', 0, 22, { font: `600 64px ${UI}`, color: '#0a0f24' }); X.restore(); }
    const ta = prog(T, 107.6, 108.2); if (ta > 0) { text('Bagian 02', 540, 1500, { font: `400 96px ${SERIF}`, color: COL.ivory, alpha: ta }); text('menunggu pilihanmu', 540, 1570, { font: `italic 46px ${SERIF}`, color: COL.mist, alpha: ta }); }
  }
}

/* ---------- S6 promo ---------- */
function sPromo(T) {
  nightBg(W, H, '#0a0f24', '#1c1842'); drawStars(STARS_FULL, T, 0.6);
  const ta = prog(T, 110.5, 111.1);
  text(typed('Penasaran gimana', T, 111.1, 112.2), 540, 470, { font: `400 80px ${SERIF}`, color: COL.ivory, alpha: 1 });
  text(typed('video ini dibuat?', T, 112.2, 113.3), 540, 560, { font: `400 80px ${SERIF}`, color: COL.ivory, alpha: 1 });
  const pa = easeOut(prog(T, 113.3, 114.0));
  if (pa > 0) { X.save(); X.translate(540, 960 + (1 - pa) * 100); X.globalAlpha = pa; X.fillStyle = '#0b0c12'; rr(-190, -300, 380, 600, 60); X.fill(); X.fillStyle = '#1f2a55'; rr(-170, -280, 340, 560, 44); X.fill();
    for (let i = 0; i < 3; i++) { X.fillStyle = ['#ff8fb0', '#8fc2ff', '#e2b44a'][i]; rr(-130, -230 + i * 150 + ((T * 20) % 10), 260, 120, 22); X.globalAlpha = pa * 0.8; X.fill(); }
    X.globalAlpha = pa; text('dari HP', 0, 360, { font: `italic 60px ${SERIF}`, color: COL.champagne }); X.restore(); }
  const fa = easeOut(prog(T, 114.4, 115.2));
  if (fa > 0) { glow(540, 1480, 500, 'rgba(216,195,154,0.3)', fa); text('File Sakti', 540, 1500, { font: `400 190px ${SCRIPT}`, color: COL.champagne, alpha: fa }); }
  const la = prog(T, 116.6, 117.1); if (la > 0) pill(540, 1700, 'Link di bio', { w: 520, h: 100, bg: COL.champagne, ink: '#0a0f24', font: `600 50px ${UI}`, a: la });
}


/* ---------- timeline & captions ---------- */
const CAPS = [
  [0, 0.95, 'Tiga tahun.'], [1.35, 3.8, 'Raka sudah tiga tahun menyukai Nadia.'], [4.1, 5.75, 'Dan Nadia masih mengira,'], [5.85, 7.3, 'Raka cuma sahabatnya.'],
  [7.8, 10.1, 'Sore itu hujan turun tiba-tiba.'], [10.35, 13.7, 'Payung biru kecil milik Raka, cuma muat untuk satu orang.'], [14.05, 16.45, 'Tapi Nadia tetap masuk, sambil tertawa.'],
  [16.85, 20.1, 'Dan seperti biasa, bahu kiri Raka basah kuyup.'], [20.5, 22.2, 'Dia tidak pernah bilang apa-apa.'],
  [22.75, 25.0, 'Di kantin, Raka tidak perlu bertanya.'], [25.3, 27.3, 'Es teh tanpa gula, untuk Nadia.'], [27.65, 30.3, 'Nasi goreng tanpa tomat, juga untuk Nadia.'],
  [30.7, 34.1, 'Sudah tiga tahun, dan Raka tidak pernah salah ingat.'], [34.6, 35.6, 'Nadia tersenyum.'], [35.9, 38.8, '"Kamu tuh, kayak buku catatan berjalan."'],
  [39.1, 40.5, 'Raka ikut tertawa.'], [40.65, 44.0, 'Padahal dalam hatinya, dia ingin sekali bilang,'], [44.05, 46.7, '"Aku ingat semuanya, karena itu kamu."'],
  [47.3, 51.3, 'Malam harinya, Raka membuka kaleng biskuit tua di bawah tempat tidurnya.'], [51.6, 54.9, 'Isinya uang receh, dan beberapa lembar yang dilipat rapi.'],
  [55.3, 57.0, 'Dia menghitungnya pelan-pelan.'], [57.45, 58.1, 'Belum cukup.'], [58.45, 61.1, 'Tapi hari ulang tahun Nadia, tinggal seminggu lagi.'],
  [61.65, 64.5, 'Keesokan sorenya, mereka duduk berdua di halte.'], [64.85, 66.0, 'Hujan sudah reda.'], [66.3, 70.5, 'Nadia menatap payung biru kecil di pangkuan Raka, lalu bicara pelan.'],
  [77.4, 79.4, 'Raka membeku.'], [80.2, 82.7, 'Kalau kamu jadi Raka, kamu pilih apa?'],
  [110.45, 111.0, 'Oh iya.'], [111.1, 114.2, 'Penasaran gimana video seperti ini dibuat, cuma dari HP?'], [114.4, 116.6, 'Semua caranya ada di File Sakti.'], [116.7, 117.8, 'Link di bio.'],
];
/* Zona aman Reels: atas (<260px) dan bawah (>1300px) tertutup UI Instagram, kanan (>930px) tertutup tombol. Subtitle di tengah-bawah. */
const SUB_Y = 1235, SUB_W = 800;
function caption(t) {
  if (!SUBS) return;
  for (const [a, b, str] of CAPS) {
    if (t < a || t > b) continue;
    const k = Math.min(prog(t, a, a + 0.2), 1 - prog(t, b - 0.15, b));
    const font = `italic 54px ${SERIF}`; const lines = wrapLines(str, font, SUB_W); const lh = 64; const y0 = SUB_Y - (lines.length - 1) * lh / 2;
    X.save(); X.globalAlpha = k;
    const g = X.createLinearGradient(0, y0 - 110, 0, y0 + lines.length * lh + 40);
    g.addColorStop(0, 'rgba(5,7,15,0)'); g.addColorStop(0.35, 'rgba(5,7,15,0.5)'); g.addColorStop(0.8, 'rgba(5,7,15,0.5)'); g.addColorStop(1, 'rgba(5,7,15,0)');
    X.fillStyle = g; X.fillRect(0, y0 - 110, W, lines.length * lh + 150);
    X.shadowColor = 'rgba(0,0,0,0.85)'; X.shadowBlur = 14;
    lines.forEach((ln, i) => text(ln, 500, y0 + i * lh, { font, color: COL.ivory }));
    X.restore();
  }
}
