/* ===== Orderan Jam 2 — Bagian 4 (TAMAT): karakter & properti (2D datar) ===== */
const UIF = "'Hanken Grotesk', sans-serif";
const SK_A = '#b27b54', SK_A2 = '#8e5d3b', SK_L = '#d9baa4', SK_L2 = '#b9967f', SK_PALE = '#c9c6d6';

function pathJacket() {
  X.beginPath(); X.moveTo(-205, 340); X.quadraticCurveTo(-215, 150, -80, 116); X.lineTo(80, 116); X.quadraticCurveTo(215, 150, 205, 340); X.closePath();
}
/** Arga — bust. x,y = pusat kepala */
function arga(x, y, s, o = {}) {
  const { mood = 'calm', T = 0, eyes = 'open', cap = true, look = 0, tear = 0, talk = 0, tint = null, alpha = 1, helmet = true } = o;
  X.save(); X.globalAlpha *= alpha; X.translate(x, y); X.scale(s, s);
  // jaket
  X.fillStyle = '#c8622b'; pathJacket(); X.fill();
  X.save(); pathJacket(); X.clip(); X.fillStyle = 'rgba(0,0,0,0.18)'; X.fillRect(-220, 110, 90, 260); X.fillStyle = '#d6d6dc'; X.fillRect(-230, 246, 460, 24); X.fillStyle = 'rgba(0,0,0,0.12)'; X.fillRect(-230, 270, 460, 8); X.restore();
  X.strokeStyle = '#8f3f17'; X.lineWidth = 6; X.beginPath(); X.moveTo(0, 130); X.lineTo(0, 340); X.stroke();
  X.fillStyle = '#a24b1c'; X.beginPath(); X.moveTo(-60, 116); X.lineTo(0, 168); X.lineTo(60, 116); X.lineTo(36, 108); X.lineTo(0, 140); X.lineTo(-36, 108); X.closePath(); X.fill();
  // leher + kepala
  X.fillStyle = SK_A2; X.fillRect(-30, 80, 60, 56);
  X.fillStyle = SK_A; X.beginPath(); X.ellipse(0, 0, 90, 102, 0, 0, 6.283); X.fill();
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(d * 90, 14, 15, 24, 0, 0, 6.283); X.fill(); }
  if (cap) {
    X.fillStyle = '#2b2434'; X.beginPath(); X.moveTo(-98, -18); X.quadraticCurveTo(-106, -122, 0, -126); X.quadraticCurveTo(106, -122, 98, -18); X.quadraticCurveTo(60, -54, 0, -52); X.quadraticCurveTo(-60, -54, -98, -18); X.fill();
    X.fillStyle = 'rgba(255,255,255,0.12)'; X.beginPath(); X.ellipse(-34, -90, 28, 12, -0.4, 0, 6.283); X.fill();
  } else {
    X.fillStyle = '#1b1620'; X.beginPath(); X.moveTo(-94, -10); X.quadraticCurveTo(-100, -118, 0, -120); X.quadraticCurveTo(100, -118, 94, -10); X.quadraticCurveTo(60, -62, 0, -58); X.quadraticCurveTo(-60, -62, -94, -10); X.fill();
  }
  // mata
  const blink = (T % 3.7) > 3.58;
  for (const d of [-1, 1]) {
    const ex = d * 34, ey = 10;
    if (eyes === 'closed' || blink) {
      X.strokeStyle = '#1b1720'; X.lineWidth = 6; X.lineCap = 'round'; X.beginPath(); X.arc(ex, ey - 4, 17, 0.15 * Math.PI, 0.85 * Math.PI); X.stroke();
    } else {
      const ry = mood === 'shock' ? 27 : 23;
      X.fillStyle = '#fff'; X.beginPath(); X.ellipse(ex, ey, 20, ry, 0, 0, 6.283); X.fill();
      X.fillStyle = '#1b1720'; X.beginPath(); X.ellipse(ex + look * 6, ey + 2, mood === 'shock' ? 7 : 11, mood === 'shock' ? 7 : 13, 0, 0, 6.283); X.fill();
      X.fillStyle = '#fff'; X.beginPath(); X.arc(ex + look * 6 + 3, ey - 3, 3.4, 0, 6.283); X.fill();
    }
  }
  // alis
  X.strokeStyle = '#1b1720'; X.lineWidth = 6; X.lineCap = 'round';
  for (const d of [-1, 1]) {
    X.beginPath();
    if (mood === 'sad' || mood === 'shock') { X.moveTo(d * 18, -22 - (mood === 'shock' ? 8 : 0)); X.lineTo(d * 52, -34 - (mood === 'sad' ? 0 : 6) + (mood === 'sad' ? 0 : 0)); if (mood === 'sad') { X.clearRect(0, 0, 0, 0); } }
    else { X.moveTo(d * 20, -24); X.quadraticCurveTo(d * 36, -30, d * 52, -24); }
    X.stroke();
  }
  if (mood === 'sad') { X.strokeStyle = '#1b1720'; X.lineWidth = 6; for (const d of [-1, 1]) { X.beginPath(); X.moveTo(d * 18, -22); X.lineTo(d * 52, -30); X.stroke(); } }
  // mulut
  X.strokeStyle = '#4a221c'; X.lineWidth = 6; X.lineCap = 'round';
  const mo = talk > 0 ? (0.5 + 0.5 * Math.sin(T * 17)) * talk : 0;
  if (mo > 0.08) { X.fillStyle = '#4a221c'; X.beginPath(); X.ellipse(0, 52, 15, 6 + mo * 16, 0, 0, 6.283); X.fill(); }
  else if (mood === 'smile') { X.beginPath(); X.arc(0, 38, 22, 0.15, Math.PI - 0.15); X.stroke(); }
  else if (mood === 'sad') { X.beginPath(); X.arc(0, 66, 16, Math.PI + 0.3, -0.3); X.stroke(); }
  else if (mood === 'shock') { X.fillStyle = '#4a221c'; X.beginPath(); X.ellipse(0, 56, 11, 15, 0, 0, 6.283); X.fill(); }
  else { X.beginPath(); X.moveTo(-16, 54); X.lineTo(16, 54); X.stroke(); }
  // air mata
  if (tear > 0) { X.fillStyle = 'rgba(170,215,255,0.9)'; for (const d of [-1, 1]) { const ty = 40 + tear * 60; X.beginPath(); X.ellipse(d * 40, ty, 6, 10, 0, 0, 6.283); X.fill(); X.beginPath(); X.moveTo(d * 40, 30); X.lineTo(d * 40, ty); X.lineWidth = 5; X.strokeStyle = 'rgba(170,215,255,0.55)'; X.stroke(); } }
  X.restore();
}
/** Bu Laras — bust. */
function laras(x, y, s, o = {}) {
  const { mood = 'calm', T = 0, talk = 0, tear = 0, alpha = 1, pale = 0, young = false } = o;
  X.save(); X.globalAlpha *= alpha; X.translate(x, y); X.scale(s, s);
  const skin = pale ? SK_PALE : SK_L, skin2 = pale ? '#a8a5b8' : SK_L2;
  // sanggul
  X.fillStyle = young ? '#2a2226' : '#b6b8c4'; X.beginPath(); X.arc(0, -128, 44, 0, 6.283); X.fill();
  // badan (blus)
  X.fillStyle = '#4b6a78'; X.beginPath(); X.moveTo(-190, 340); X.quadraticCurveTo(-198, 156, -76, 120); X.lineTo(76, 120); X.quadraticCurveTo(198, 156, 190, 340); X.closePath(); X.fill();
  X.fillStyle = 'rgba(0,0,0,0.16)'; X.beginPath(); X.moveTo(-190, 340); X.quadraticCurveTo(-198, 156, -76, 120); X.lineTo(-60, 120); X.lineTo(-90, 340); X.closePath(); X.fill();
  X.fillStyle = '#dfe4e0'; X.beginPath(); X.moveTo(-50, 112); X.lineTo(0, 168); X.lineTo(50, 112); X.lineTo(30, 104); X.lineTo(0, 134); X.lineTo(-30, 104); X.closePath(); X.fill();
  X.fillStyle = skin2; X.fillRect(-28, 78, 56, 54);
  X.fillStyle = skin; X.beginPath(); X.ellipse(0, 0, 84, 98, 0, 0, 6.283); X.fill();
  for (const d of [-1, 1]) { X.beginPath(); X.ellipse(d * 84, 14, 13, 22, 0, 0, 6.283); X.fill(); }
  // rambut
  X.fillStyle = young ? '#2a2226' : '#b6b8c4'; X.beginPath(); X.moveTo(-90, 6); X.quadraticCurveTo(-100, -108, 0, -112); X.quadraticCurveTo(100, -108, 90, 6); X.quadraticCurveTo(76, -50, 0, -66); X.quadraticCurveTo(-76, -50, -90, 6); X.fill();
  // mata
  const blink = (T % 4.1) > 3.98;
  for (const d of [-1, 1]) {
    const ex = d * 32, ey = 10;
    if (mood === 'stare') { X.fillStyle = '#f4f2fa'; X.beginPath(); X.ellipse(ex, ey, 21, 25, 0, 0, 6.283); X.fill(); X.fillStyle = '#0c0a12'; X.beginPath(); X.ellipse(ex, ey + 1, 4, 5, 0, 0, 6.283); X.fill(); }
    else if (blink || mood === 'closed') { X.strokeStyle = '#2a1f24'; X.lineWidth = 5; X.lineCap = 'round'; X.beginPath(); X.arc(ex, ey - 3, 14, 0.15 * Math.PI, 0.85 * Math.PI); X.stroke(); }
    else if (mood === 'smile' || mood === 'warm') { X.strokeStyle = '#2a1f24'; X.lineWidth = 5; X.lineCap = 'round'; X.beginPath(); X.arc(ex, ey + 6, 13, Math.PI * 1.1, Math.PI * 1.9); X.stroke(); }
    else { X.fillStyle = '#fff'; X.beginPath(); X.ellipse(ex, ey, 16, 17, 0, 0, 6.283); X.fill(); X.fillStyle = '#2a1f24'; X.beginPath(); X.ellipse(ex, ey + 2, 8.5, 10, 0, 0, 6.283); X.fill(); X.fillStyle = '#fff'; X.beginPath(); X.arc(ex + 2.5, ey - 2, 2.6, 0, 6.283); X.fill(); }
    if (mood === 'stare') { X.fillStyle = 'rgba(20,14,34,0.35)'; X.beginPath(); X.ellipse(ex, ey - 2, 26, 32, 0, 0, 6.283); X.fill(); }
  }
  // alis + kerut
  X.strokeStyle = young ? '#2a2226' : '#8c8f9b'; X.lineWidth = 5; X.lineCap = 'round';
  for (const d of [-1, 1]) { X.beginPath(); X.moveTo(d * 16, -22); X.quadraticCurveTo(d * 32, -32 + (mood === 'sad' ? 8 : 0), d * 50, -22 + (mood === 'sad' ? 0 : 0)); X.stroke(); }
  if (!young) { X.strokeStyle = 'rgba(100,70,60,0.35)'; X.lineWidth = 3; for (const d of [-1, 1]) { X.beginPath(); X.moveTo(d * 58, 42); X.quadraticCurveTo(d * 52, 52, d * 56, 62); X.stroke(); } }
  // mulut
  X.strokeStyle = '#5b2a26'; X.lineWidth = 5; X.lineCap = 'round';
  const mo = talk > 0 ? (0.5 + 0.5 * Math.sin(T * 14)) * talk : 0;
  if (mood === 'stare') { X.fillStyle = '#2a1018'; X.beginPath(); X.ellipse(0, 56, 14, 22, 0, 0, 6.283); X.fill(); }
  else if (mo > 0.1) { X.fillStyle = '#5b2a26'; X.beginPath(); X.ellipse(0, 52, 12, 4 + mo * 12, 0, 0, 6.283); X.fill(); }
  else if (mood === 'smile' || mood === 'warm') { X.beginPath(); X.arc(0, 40, 22, 0.15, Math.PI - 0.15); X.stroke(); }
  else if (mood === 'sad') { X.beginPath(); X.arc(0, 66, 14, Math.PI + 0.3, -0.3); X.stroke(); }
  else { X.beginPath(); X.moveTo(-14, 54); X.quadraticCurveTo(0, 58, 14, 54); X.stroke(); }
  if (tear > 0) { X.fillStyle = 'rgba(170,215,255,0.9)'; for (const d of [-1, 1]) { const ty = 38 + tear * 64; X.beginPath(); X.ellipse(d * 36, ty, 6, 10, 0, 0, 6.283); X.fill(); X.beginPath(); X.moveTo(d * 36, 28); X.lineTo(d * 36, ty); X.lineWidth = 5; X.strokeStyle = 'rgba(170,215,255,0.5)'; X.stroke(); } }
  X.restore();
}
/** Ibu Arga di kampung — kerudung coklat, batik. */
function ibu(x, y, s, o = {}) {
  const { mood = 'calm', T = 0, tear = 0, alpha = 1 } = o;
  X.save(); X.globalAlpha *= alpha; X.translate(x, y); X.scale(s, s);
  X.fillStyle = '#7a4f3a'; X.beginPath(); X.moveTo(-200, 340); X.quadraticCurveTo(-210, 130, -70, 108); X.lineTo(70, 108); X.quadraticCurveTo(210, 130, 200, 340); X.closePath(); X.fill();
  X.fillStyle = '#d9b26a'; for (let i = 0; i < 6; i++) { X.beginPath(); X.arc(-120 + i * 48, 250 + (i % 2) * 36, 9, 0, 6.283); X.fill(); }
  X.fillStyle = '#6b4636'; X.beginPath(); X.ellipse(0, -4, 104, 118, 0, 0, 6.283); X.fill();
  X.fillStyle = SK_L; X.beginPath(); X.ellipse(0, 6, 76, 88, 0, 0, 6.283); X.fill();
  X.fillStyle = '#6b4636'; X.beginPath(); X.moveTo(-90, -40); X.quadraticCurveTo(0, -112, 90, -40); X.quadraticCurveTo(0, -70, -90, -40); X.fill();
  const blink = (T % 4.3) > 4.18;
  for (const d of [-1, 1]) {
    if (mood === 'cry' || blink) { X.strokeStyle = '#2a1f24'; X.lineWidth = 5; X.lineCap = 'round'; X.beginPath(); X.arc(d * 28, 8, 13, 0.15 * Math.PI, 0.85 * Math.PI); X.stroke(); }
    else { X.fillStyle = '#fff'; X.beginPath(); X.ellipse(d * 28, 8, 15, 16, 0, 0, 6.283); X.fill(); X.fillStyle = '#2a1f24'; X.beginPath(); X.ellipse(d * 28, 10, 8, 9.5, 0, 0, 6.283); X.fill(); }
  }
  X.strokeStyle = '#5b2a26'; X.lineWidth = 5; X.lineCap = 'round';
  if (mood === 'cry') { X.beginPath(); X.arc(0, 38, 20, 0.2, Math.PI - 0.2); X.stroke(); }
  else { X.beginPath(); X.moveTo(-12, 50); X.quadraticCurveTo(0, 55, 12, 50); X.stroke(); }
  if (tear > 0) { X.fillStyle = 'rgba(170,215,255,0.92)'; for (const d of [-1, 1]) { const k = (T * 1.2 + (d > 0 ? 0.5 : 0)) % 1; const ty = 30 + k * 70; X.beginPath(); X.ellipse(d * 32, ty, 6, 10, 0, 0, 6.283); X.fill(); X.beginPath(); X.moveTo(d * 32, 24); X.lineTo(d * 32, ty); X.lineWidth = 5; X.strokeStyle = 'rgba(170,215,255,0.5)'; X.stroke(); } }
  X.restore();
}
function hand(x, y, s, rot, col = SK_L, a = 1) {
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.rotate(rot); X.scale(s, s); X.fillStyle = col;
  X.beginPath(); X.ellipse(0, 0, 62, 78, 0, 0, 6.283); X.fill();
  for (let i = 0; i < 4; i++) { rr(-56 + i * 30, -158 + (i === 1 || i === 2 ? -14 : 0) + (i === 3 ? 14 : 0), 26, 100, 13); X.fill(); }
  X.beginPath(); X.ellipse(-62, 26, 18, 50, 0.7, 0, 6.283); X.fill();
  X.fillStyle = '#4b6a78'; X.fillRect(-60, 62, 120, 160);
  X.restore();
}

/* ---------- properti ---------- */
function flame(x, y, s, T, a = 1) {
  const fl = 1 + 0.08 * Math.sin(T * 13) + 0.05 * Math.sin(T * 23);
  glow(x, y, 360 * s * fl, 'rgba(255,170,80,0.55)', a);
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s * fl);
  X.fillStyle = '#ffb347'; X.beginPath(); X.moveTo(0, -46); X.quadraticCurveTo(22, -12, 0, 14); X.quadraticCurveTo(-22, -12, 0, -46); X.fill();
  X.fillStyle = '#fff1b8'; X.beginPath(); X.moveTo(0, -24); X.quadraticCurveTo(10, -6, 0, 8); X.quadraticCurveTo(-10, -6, 0, -24); X.fill();
  X.restore();
}
function plate(x, y, s, { rice = 1, clean = false, steam = 0, T = 0 } = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  X.fillStyle = '#e9e3d4'; X.beginPath(); X.ellipse(0, 0, 130, 30, 0, 0, 6.283); X.fill();
  X.fillStyle = '#cfc8b6'; X.beginPath(); X.ellipse(0, 3, 96, 20, 0, 0, 6.283); X.fill();
  if (!clean) {
    X.fillStyle = '#fbf8ee'; X.beginPath(); X.moveTo(-70, 0); X.quadraticCurveTo(-60, -66 * rice, 0, -70 * rice); X.quadraticCurveTo(60, -66 * rice, 70, 0); X.quadraticCurveTo(0, 22, -70, 0); X.fill();
    X.fillStyle = '#d6302a'; X.beginPath(); X.ellipse(58, -2, 26, 12, 0.2, 0, 6.283); X.fill();
    if (steam > 0) { X.strokeStyle = `rgba(255,255,255,${0.35 * steam})`; X.lineWidth = 5; X.lineCap = 'round'; for (let i = 0; i < 3; i++) { const o = (T * 40 + i * 30) % 90; X.beginPath(); X.moveTo(-30 + i * 30, -76 * rice - o * 0.3); X.bezierCurveTo(-42 + i * 30, -100 * rice - o * 0.5, -18 + i * 30, -124 * rice - o * 0.6, -30 + i * 30, -150 * rice - o * 0.7); X.stroke(); } }
  }
  X.restore();
}
function receipts(x, y, amount, seed = 3) {
  const r = rng(seed); const n = Math.floor(amount * 26);
  for (let i = 0; i < n; i++) {
    const px = x + (r() - 0.5) * 120, py = y - i * 3.2 + (r() - 0.5) * 6, rot = (r() - 0.5) * 0.5;
    X.save(); X.translate(px, py); X.rotate(rot); X.fillStyle = i % 2 ? '#f3efe2' : '#e6e0cf'; X.fillRect(-34, -22, 68, 44);
    X.fillStyle = 'rgba(60,50,40,0.5)'; X.fillRect(-26, -12, 40, 3); X.fillRect(-26, -4, 52, 3); X.fillRect(-26, 4, 30, 3); X.restore();
  }
}
function clockFace(x, y, r, minutes, T = 0, a = 1, dark = 0) {
  X.save(); X.globalAlpha *= a; X.translate(x, y);
  X.fillStyle = '#5a3b2b'; X.beginPath(); X.arc(0, 0, r + 12, 0, 6.283); X.fill();
  X.fillStyle = '#efe7d3'; X.beginPath(); X.arc(0, 0, r, 0, 6.283); X.fill();
  X.fillStyle = '#3a2c25'; for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; X.beginPath(); X.arc(Math.sin(an) * (r - 12), -Math.cos(an) * (r - 12), 3.5, 0, 6.283); X.fill(); }
  const mAn = (minutes % 60) / 60 * Math.PI * 2, hAn = ((2 + minutes / 60) % 12) / 12 * Math.PI * 2;
  X.strokeStyle = '#2a1f1a'; X.lineCap = 'round'; X.lineWidth = r * 0.07; X.beginPath(); X.moveTo(0, 0); X.lineTo(Math.sin(hAn) * r * 0.5, -Math.cos(hAn) * r * 0.5); X.stroke();
  X.lineWidth = r * 0.045; X.beginPath(); X.moveTo(0, 0); X.lineTo(Math.sin(mAn) * r * 0.78, -Math.cos(mAn) * r * 0.78); X.stroke();
  X.fillStyle = '#2a1f1a'; X.beginPath(); X.arc(0, 0, r * 0.07, 0, 6.283); X.fill();
  X.restore();
}
function photoFrame(x, y, w, h, kind, a = 1) {
  X.save(); X.globalAlpha *= a; X.translate(x, y);
  X.fillStyle = '#6a4630'; rr(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 10); X.fill();
  X.fillStyle = '#c6d4e4'; X.fillRect(-w / 2, -h / 2, w, h);
  X.save(); X.beginPath(); X.rect(-w / 2, -h / 2, w, h); X.clip();
  if (kind === 'family') {
    X.fillStyle = '#e8cfa0'; X.fillRect(-w / 2, -h / 2, w, h);
    laras(w * 0.12, h * 0.16, w / 600, { mood: 'smile' });
    arga(-w * 0.18, h * 0.22, w / 640, { cap: false, mood: 'smile' });
  } else {
    X.fillStyle = '#b9d0e6'; X.fillRect(-w / 2, -h / 2, w, h);
    X.fillStyle = '#4b6a78'; X.beginPath(); X.ellipse(0, h * 0.5, w * 0.42, h * 0.3, 0, 0, 6.283); X.fill();
    X.fillStyle = SK_A; X.beginPath(); X.ellipse(0, -h * 0.02, w * 0.22, h * 0.24, 0, 0, 6.283); X.fill();
    X.fillStyle = '#1b1620'; X.beginPath(); X.ellipse(0, -h * 0.17, w * 0.23, h * 0.13, 0, Math.PI, 0); X.fill();
    X.fillStyle = '#1b1720'; for (const d of [-1, 1]) { X.beginPath(); X.arc(d * w * 0.09, -h * 0.02, 4, 0, 6.283); X.fill(); }
    X.strokeStyle = '#4a221c'; X.lineWidth = 3; X.beginPath(); X.arc(0, h * 0.04, w * 0.07, 0.2, Math.PI - 0.2); X.stroke();
  }
  X.restore();
  if (kind === 'arga') { X.fillStyle = '#d9b26a'; rr(-w * 0.42, h / 2 + 26, w * 0.84, 36, 6); X.fill(); text('ARGA', 0, h / 2 + 54, { font: `700 26px ${UIF}`, color: '#3a2c25', spacing: 6 }); }
  X.restore();
}
