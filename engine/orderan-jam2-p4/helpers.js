/* Video demo — "Sebuah Dunia Untukmu" (website kado ulang tahun)
 * Deterministic: window.render(t) draws the frame at time t (seconds). 1080×1920. */
const C = document.getElementById('c');
const X = C.getContext('2d');
const W = 1080, H = 1920;
const SUBS = !location.search.includes("nosub");

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

function sparkle(x, y, r, a) {
  X.save(); X.globalAlpha *= a; X.fillStyle = COL.champagne;
  X.beginPath();
  X.moveTo(x, y - r); X.quadraticCurveTo(x, y, x + r, y); X.quadraticCurveTo(x, y, x, y + r); X.quadraticCurveTo(x, y, x - r, y); X.quadraticCurveTo(x, y, x, y - r);
  X.fill(); X.restore();
}

/* ===== Raka & Nadia — Bagian 01 : "Bahu Kiri" (cinta) ===== */
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
