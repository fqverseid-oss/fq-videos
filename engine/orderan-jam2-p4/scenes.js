/* ===== Orderan Jam 2 — Bagian 4 (TAMAT): adegan, timeline, render ===== */
const TEND = 164.3;
const SUB_Y = 1235, SUB_W = 820;
const ease = easeInOut;
const hex = (c) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k))).join(',')})`; };
const inR = (T, r) => r.some(([a, b]) => T >= a && T <= b);
const ARGA_SPK = [[8.72, 10.3], [61.08, 62.6], [95.12, 98.1], [139.92, 142.7]];
const LARAS_SPK = [[27.04, 29.1], [29.28, 36.9], [50.64, 58.2], [61.5, 61.5], [84.48, 88.3], [99.96, 106.9]];

function skyGrad(x, y, w, h, dawn, stars, T) {
  const g = X.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, mix('#0a1230', '#7390c4', dawn)); g.addColorStop(0.6, mix('#16224a', '#ffb27a', dawn)); g.addColorStop(1, mix('#1d2b57', '#ffe2a8', dawn));
  X.fillStyle = g; X.fillRect(x, y, w, h);
  if (dawn < 0.9) { const r = rng(5); for (let i = 0; i < 26; i++) { const sx = x + r() * w, sy = y + r() * h * 0.7; X.fillStyle = `rgba(243,238,227,${(0.8 - dawn) * (0.4 + 0.4 * Math.sin(T * 1.4 + i))})`; X.beginPath(); X.arc(sx, sy, 1.6, 0, 6.283); X.fill(); } X.fillStyle = `rgba(245,240,220,${0.9 - dawn})`; X.beginPath(); X.arc(x + w * 0.72, y + h * 0.22, 24, 0, 6.283); X.fill(); }
  else { X.fillStyle = 'rgba(255,240,200,0.9)'; X.beginPath(); X.arc(x + w * 0.5, y + h * 0.85, 40, 0, 6.283); X.fill(); }
}

/* ---------- RUANG MAKAN ---------- */
function room(T, o = {}) {
  const { lamp = 1, dawn = 0, candleOn = 1, cx = 540, cy = 780, z = 1, aM = 'calm', lM = 'calm', aTalk = 0, lTalk = 0, aTear = 0, lTear = 0, lAlpha = 1, aAlpha = 1, rec = 0, clean = false, steam = 0, photo = 'arga', photoB = 0, clockMin = 0, lPale = 0, aEyes = 'open', aLook = 1, ghosts = 0, rice = 1, spoon = 0, aX = 310, aY = 800, lEyes = null } = o;
  X.save(); X.translate(540, 780); X.scale(z, z); X.translate(-cx, -cy);
  // dinding
  const wg = X.createLinearGradient(0, 0, 0, 1130); wg.addColorStop(0, mix('#2a1f24', '#8d6a52', dawn)); wg.addColorStop(1, mix('#3a2a21', '#a07b60', dawn)); X.fillStyle = wg; X.fillRect(-300, -200, 1680, 1330);
  X.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 20; i++) X.fillRect(-300 + i * 90, -200, 3, 1330);
  X.fillStyle = mix('#241a16', '#6b4a38', dawn); X.fillRect(-300, 880, 1680, 250);
  X.fillStyle = mix('#1c1411', '#5a3b2b', dawn); X.fillRect(-300, 1120, 1680, 1200);
  // jendela
  X.fillStyle = '#4a3226'; rr(70, 370, 280, 350, 10); X.fill(); X.save(); rr(90, 390, 240, 310, 6); X.clip(); skyGrad(90, 390, 240, 310, dawn, true, T); X.restore();
  X.fillStyle = '#4a3226'; X.fillRect(204, 390, 12, 310); X.fillRect(90, 536, 240, 12);
  // jam & foto
  clockFace(760, 500, 70, clockMin, T);
  photoFrame(540, 540, 150, 190, 'arga', 1 - photoB); if (photoB > 0) photoFrame(540, 540, 150, 190, 'family', photoB);
  // pintu
  X.fillStyle = mix('#2c1d16', '#7a5238', dawn); rr(880, 400, 190, 740, 8); X.fill(); X.fillStyle = 'rgba(0,0,0,0.18)'; rr(900, 430, 150, 300, 6); X.fill(); rr(900, 760, 150, 340, 6); X.fill(); X.fillStyle = '#d9b26a'; X.beginPath(); X.arc(910, 780, 9, 0, 6.283); X.fill();
  // kursi
  X.fillStyle = mix('#33231a', '#6d4a34', dawn); rr(185, 760, 250, 340, 18); X.fill(); rr(645, 760, 250, 340, 18); X.fill();
  // hantu pengemudi lari (di belakang Laras)
  if (ghosts > 0) for (let i = 0; i < 3; i++) { const k = clamp(ghosts * 1.4 - i * 0.2); const gx = lerp(780, 985, easeOut(k)) - i * 40, ga = Math.sin(Math.PI * clamp(k)) * 0.55; arga(gx, 780, 0.5, { alpha: ga, mood: 'shock', T }); }
  // Laras
  if (lAlpha > 0) laras(770, 800, 1, { mood: lM, T, talk: lTalk, tear: lTear, alpha: lAlpha, pale: lPale });
  // Arga
  if (aAlpha > 0) arga(aX, aY, 1, { mood: aM, T, talk: aTalk, tear: aTear, eyes: aEyes, look: aLook, alpha: aAlpha });
  // meja
  X.fillStyle = mix('#5a3b2b', '#a67a58', dawn); X.fillRect(100, 1080, 880, 900);
  X.fillStyle = 'rgba(0,0,0,0.16)'; for (let i = 0; i < 9; i++) X.fillRect(100 + i * 110, 1090, 4, 880);
  X.fillStyle = mix('#7a523a', '#c79a74', dawn); rr(90, 1036, 900, 56, 10); X.fill(); X.fillStyle = 'rgba(255,255,255,0.08)'; X.fillRect(90, 1036, 900, 8);
  // piring
  plate(360, 1064, 0.95, { rice, clean, steam, T }); plate(720, 1064, 0.95, { rice, clean, steam, T });
  // sendok
  if (spoon > 0) {
    const k = ease(clamp(spoon)); const sx = lerp(380, aX + 12, k), sy = lerp(1030, 872, k);
    X.save(); X.strokeStyle = '#c8622b'; X.lineWidth = 48; X.lineCap = 'round'; X.beginPath(); X.moveTo(aX - 40, 1180); X.lineTo(sx - 30, sy + 90); X.stroke(); X.strokeStyle = '#d0d0d6'; X.lineWidth = 8; X.beginPath(); X.moveTo(sx - 30, sy + 90); X.lineTo(sx, sy); X.stroke();
    X.fillStyle = '#d6d6dc'; X.beginPath(); X.ellipse(sx, sy - 6, 24, 14, -0.5, 0, 6.283); X.fill(); X.fillStyle = '#fbf8ee'; X.beginPath(); X.ellipse(sx, sy - 14, 16, 9, -0.5, 0, 6.283); X.fill(); X.restore();
  }
  // lilin
  X.fillStyle = '#efe6cf'; rr(528, 982, 24, 62, 4); X.fill(); X.fillStyle = '#7a5a3a'; rr(514, 1038, 52, 12, 5); X.fill();
  if (candleOn > 0) flame(540, 960, 0.9, T, candleOn);
  else { X.strokeStyle = 'rgba(200,200,210,0.35)'; X.lineWidth = 4; const sm = (T * 30) % 80; X.beginPath(); X.moveTo(540, 978); X.bezierCurveTo(528, 950 - sm * 0.3, 554, 920 - sm * 0.4, 540, 890 - sm * 0.5); X.stroke(); }
  if (rec > 0) receipts(640, 1040, rec);
  X.restore();
  // cahaya
  const dk = clamp(1 - lamp);
  if (dk > 0) {
    const sx = 540 + (540 - cx) * z, sy = 780 + (965 - cy) * z; const g = X.createRadialGradient(sx, sy, 40 * z, sx, sy, 760 * z);
    g.addColorStop(0, `rgba(8,8,18,${0.04 * dk})`); g.addColorStop(0.45, `rgba(6,6,14,${0.55 * dk})`); g.addColorStop(1, `rgba(4,4,10,${0.94 * dk})`);
    X.fillStyle = g; X.fillRect(0, 0, W, H);
  }
}

/* ---------- GELAP ---------- */
function sDark(T) {
  X.fillStyle = '#05060c'; X.fillRect(0, 0, W, H);
  const g = X.createRadialGradient(540, 760, 80, 540, 760, 900); g.addColorStop(0, 'rgba(30,40,80,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  // detak jantung
  const beat = Math.max(0, Math.sin(T * 7.2)) ** 6; X.fillStyle = `rgba(120,20,30,${0.1 * beat})`; X.fillRect(0, 0, W, H);
  // Arga gemetar
  const tr = 3 * Math.sin(T * 40) * prog(T, 14, 20);
  arga(540 + tr, 840, 1.15, { mood: 'shock', T, eyes: T > 19.3 ? 'closed' : 'open', look: 0 });
  // Laras siluet mendekat
  if (T > 14.8 && T < 24.5) {
    const k = prog(T, 15.36, 19.0); const kk = ease(k); const s = lerp(0.35, 1.7, kk), lx = lerp(120, 330, kk), ly = lerp(560, 600, kk);
    const a = fadeIO(T, 14.8, 24.5, 0.8);
    X.save(); X.globalAlpha = a; laras(lx, ly, s, { mood: 'stare', T, pale: 1, alpha: 1 }); X.fillStyle = 'rgba(5,6,14,0.72)'; X.fillRect(0, 0, W, H); X.restore();
    X.save(); X.globalAlpha = a * 0.9; X.fillStyle = 'rgba(230,230,255,0.85)'; for (const d of [-1, 1]) { X.beginPath(); X.ellipse(lx + d * 32 * s, ly + 10 * s, 7 * s, 10 * s, 0, 0, 6.283); X.fill(); } X.restore();
  }
  // tangan menyentuh pipi
  if (T >= 21.6) {
    const k = ease(prog(T, 21.6, 23.4)); const warm = prog(T, 23.8, 25.2);
    const hx = lerp(1180, 690, k), hy = lerp(980, 900, k);
    X.save(); hand(hx, hy, 1.15, -0.5 + 0.05 * Math.sin(T * 3), mix('#8c94b8', '#e0bfa6', warm), 1); X.restore();
    glow(690, 900, 520, `rgba(255,170,90,${0.55 * warm})`, 1);
    if (warm > 0) glow(540, 760, 700, 'rgba(255,170,90,0.35)', warm);
  }
  vignette(0.5);
}

/* ---------- panel kenangan ---------- */
function panelFrame(draw, T, a0, b0) {
  const a = fadeIO(T, a0, b0, 0.3);
  X.save(); X.globalAlpha = a; X.fillStyle = '#0d0a10'; X.fillRect(0, 0, W, H);
  X.save(); rr(100, 300, 880, 880, 36); X.clip(); draw(); X.restore();
  X.strokeStyle = 'rgba(217,178,106,0.7)'; X.lineWidth = 6; rr(100, 300, 880, 880, 36); X.stroke();
  X.fillStyle = 'rgba(80,50,20,0.14)'; rr(100, 300, 880, 880, 36); X.fill();
  X.restore();
}
function sKid(T) {
  panelFrame(() => {
    X.fillStyle = '#f0c987'; X.fillRect(100, 300, 880, 880);
    X.fillStyle = '#d99b5b'; X.fillRect(100, 880, 880, 300);
    X.fillStyle = '#8f5a36'; X.fillRect(100, 960, 880, 220);
    laras(700, 640, 1.0, { mood: 'smile', T, young: true });
    arga(380, 760, 0.95, { mood: 'smile', cap: false, T, talk: 0 });
    // mangkuk sambal
    X.fillStyle = '#efe6cf'; X.beginPath(); X.ellipse(540, 960, 200, 44, 0, 0, 6.283); X.fill(); X.fillStyle = '#d6302a'; X.beginPath(); X.ellipse(540, 952, 150, 30, 0, 0, 6.283); X.fill();
    for (let i = 0; i < 5; i++) { const px = 300 + i * 100 + Math.sin(T * 2 + i) * 6, py = 560 + (i % 2) * 70 + Math.cos(T * 2 + i) * 6; X.save(); X.translate(px, py); X.rotate(0.5 + i); X.fillStyle = '#d6302a'; rr(-8, -38, 16, 76, 8); X.fill(); X.fillStyle = '#3c8a3a'; X.fillRect(-4, -46, 8, 12); X.restore(); }
    text('Arga kecil', 540, 1130, { font: `italic 54px ${SERIF}`, color: '#3a2a1a' });
  }, T, 72.6, 75.1);
}
function sBus(T) {
  panelFrame(() => {
    const g = X.createLinearGradient(0, 300, 0, 1180); g.addColorStop(0, '#ffb27a'); g.addColorStop(1, '#ffe2a8'); X.fillStyle = g; X.fillRect(100, 300, 880, 880);
    X.fillStyle = '#5c4a4a'; X.fillRect(100, 960, 880, 220); X.strokeStyle = '#f0e6d0'; X.lineWidth = 8; X.setLineDash([60, 50]); X.beginPath(); X.moveTo(100, 1070); X.lineTo(980, 1070); X.stroke(); X.setLineDash([]);
    const k = prog(T, 75.6, 79.6); const bx = lerp(260, 1100, ease(k) ** 1.4);
    X.fillStyle = '#2f7fbf'; rr(bx, 700, 380, 230, 24); X.fill(); X.fillStyle = '#d7ecff'; for (let i = 0; i < 4; i++) X.fillRect(bx + 24 + i * 86, 730, 66, 70); X.fillStyle = '#222'; for (const d of [70, 290]) { X.beginPath(); X.arc(bx + d, 940, 40, 0, 6.283); X.fill(); }
    arga(250, 760, 0.8, { mood: 'sad', cap: true, T, look: 1 });
    X.fillStyle = '#8a8a96'; rr(170, 930, 130, 90, 14); X.fill();
    text('Bu Laras melambai...', 540, 1130, { font: `italic 50px ${SERIF}`, color: '#3a2a1a' });
  }, T, 75.2, 80.0);
  if (T >= 76.8 && T <= 79.5) bubble(180, 330, 720, 150, ['"Nanti pulang kalau sudah sukses."'], { font: `italic 40px ${SERIF}`, tail: [330, 540], a: fadeIO(T, 76.8, 79.5, 0.2) });
}
function sCal(T) {
  panelFrame(() => {
    X.fillStyle = '#1a1830'; X.fillRect(100, 300, 880, 880);
    const k = prog(T, 79.9, 84.5);
    // kalender
    X.fillStyle = '#efe7d3'; rr(300, 380, 480, 560, 24); X.fill(); X.fillStyle = '#c33a3a'; rr(300, 380, 480, 110, 24); X.fill(); X.fillRect(300, 440, 480, 50);
    const yr = Math.floor(lerp(2006, 2026, ease(prog(T, 80.9, 82.4)))); text(String(yr), 540, 475, { font: `600 70px ${UIF}`, color: '#fff' });
    for (let i = 0; i < 5; i++) { const f = (T * 2.4 + i * 0.2) % 1; X.save(); X.globalAlpha = 1 - f; X.translate(540, 700 + f * 200); X.rotate(f * 0.6); X.fillStyle = '#efe7d3'; rr(-200, -90, 400, 180, 14); X.fill(); X.restore(); }
    text(T < 80.9 ? 'Lebaran' : 'tahun berganti', 540, 760, { font: `italic 64px ${SERIF}`, color: '#3a2a1a' });
    // hp tua
    if (T > 82.3) { const a = prog(T, 82.3, 82.9); X.save(); X.globalAlpha = a; X.translate(540, 1020); X.fillStyle = '#2b2b33'; rr(-70, -110, 140, 220, 20); X.fill(); X.fillStyle = '#10131c'; rr(-56, -92, 112, 90, 8); X.fill(); text('0 panggilan', 0, -38, { font: `500 20px ${UIF}`, color: '#7a8099' }); X.fillStyle = '#555'; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { X.beginPath(); X.arc(-30 + c * 30, 20 + r * 28, 9, 0, 6.283); X.fill(); } X.restore(); }
  }, T, 79.7, 84.6);
}
function sKampung(T) {
  X.fillStyle = '#0a0d1c'; X.fillRect(0, 0, W, H);
  skyGrad(0, 0, W, 900, 0, true, T);
  // rumah
  X.fillStyle = '#26202a'; X.beginPath(); X.moveTo(120, 760); X.lineTo(540, 560); X.lineTo(960, 760); X.lineTo(960, 1180); X.lineTo(120, 1180); X.closePath(); X.fill();
  X.fillStyle = '#ffcf7a'; rr(190, 840, 190, 150, 8); X.fill(); X.fillStyle = '#3a2a1a'; X.fillRect(280, 840, 10, 150); X.fillRect(190, 912, 190, 10);
  X.fillStyle = '#ffb04a'; rr(620, 800, 230, 380, 8); X.fill(); glow(735, 1000, 420, 'rgba(255,170,80,0.5)', 1);
  X.fillStyle = '#6b4636'; rr(660, 1020, 120, 160, 10); X.fill();
  ibu(735, 900, 0.62, { mood: 'calm', T });
  // HP di pangkuan
  X.fillStyle = '#20232f'; rr(700, 1040, 70, 110, 10); X.fill(); X.fillStyle = '#9fc0ff'; rr(706, 1048, 58, 90, 6); X.fill();
  glow(735, 1090, 160, 'rgba(150,190,255,0.5)', 0.8 + 0.2 * Math.sin(T * 4));
  ground(1180, '#2a2218', '#171108');
  // kartu panggilan terakhir
  const a = prog(T, 93.7, 94.2);
  if (a > 0) { X.save(); X.globalAlpha = a; X.translate(0, (1 - easeOut(a)) * 30); X.fillStyle = 'rgba(20,24,40,0.92)'; rr(160, 400, 760, 150, 30); X.fill(); X.fillStyle = '#4b9bff'; X.beginPath(); X.arc(250, 475, 40, 0, 6.283); X.fill(); text('Ibu', 340, 462, { font: `600 44px ${UIF}`, color: '#fff', align: 'left' }); text('Panggilan terakhir: 3 bulan lalu', 340, 515, { font: `400 32px ${UIF}`, color: '#9aa6c8', align: 'left' }); X.restore(); }
  if (T >= 95.1 && T <= 98.1) { arga(240, 900, 0.5, { mood: 'sad', T, alpha: fadeIO(T, 95.1, 98.1, 0.25) }); bubble(110, 540, 620, 190, ['"Nanti ya, Bu.', 'Lagi sibuk narik."'], { font: `italic 40px ${SERIF}`, tail: [230, 800], a: fadeIO(T, 95.1, 98.1, 0.25) }); }
  vignette(0.45);
}
function sDoorChair(T) {
  X.fillStyle = '#0a0a12'; X.fillRect(0, 0, W, H); ground(1120, '#1b1410', '#0c0806');
  X.fillStyle = '#1a1520'; X.fillRect(0, 0, W, 1120);
  const k = prog(T, 105.5, 107.3);
  X.fillStyle = '#35241b'; rr(560, 380, 360, 740, 10); X.fill(); X.fillStyle = `rgba(255,200,120,${0.4 + 0.3 * k})`; X.fillRect(918, 400, 8, 700); glow(920, 760, 500, 'rgba(255,190,110,0.5)', 0.4 + 0.4 * k);
  // kursi kosong
  X.fillStyle = '#5a3b2b'; rr(300, 700, 150, 22, 6); X.fill(); X.fillRect(310, 722, 18, 330); X.fillRect(420, 722, 18, 330); X.fillRect(300, 560, 22, 160); rr(300, 560, 160, 18, 6); X.fill(); X.fillRect(300, 620, 160, 12);
  ibu(380, 600, 0.5, { mood: 'calm', T, alpha: 0.9 * prog(T, 105.2, 106.2) });
  vignette(0.6);
}
function sWindow(T) { // ayam berkokok
  const dawn = lerp(0.1, 0.85, prog(T, 107.3, 109.4));
  X.fillStyle = '#1a1318'; X.fillRect(0, 0, W, H);
  X.save(); rr(120, 330, 840, 860, 30); X.clip(); skyGrad(120, 330, 840, 860, dawn, true, T); glow(540, 1100, 600, `rgba(255,180,100,${0.7 * dawn})`, 1);
  // pagar & ayam
  X.fillStyle = '#2a1d16'; X.fillRect(120, 1010, 840, 180); for (let i = 0; i < 9; i++) { rr(130 + i * 98, 940, 60, 250, 8); X.fill(); }
  const cr = prog(T, 107.6, 109.0); const neck = Math.sin(cr * Math.PI) ;
  X.save(); X.translate(560, 960); X.fillStyle = '#7a3a1c'; X.beginPath(); X.ellipse(0, 40, 130, 90, -0.2, 0, 6.283); X.fill();
  X.fillStyle = '#a24b1c'; X.beginPath(); X.moveTo(-100, 20); X.quadraticCurveTo(-240, -80, -190, -200); X.quadraticCurveTo(-130, -90, -60, -10); X.fill(); X.fillStyle = '#d9b26a'; X.beginPath(); X.moveTo(-90, 30); X.quadraticCurveTo(-210, -20, -230, -140); X.quadraticCurveTo(-140, -40, -70, 10); X.fill();
  X.fillStyle = '#7a3a1c'; X.beginPath(); X.moveTo(60, -10); X.quadraticCurveTo(100 + neck * 20, -150 - neck * 40, 150, -190 - neck * 50); X.quadraticCurveTo(180, -110, 130, 20); X.fill();
  X.fillStyle = '#7a3a1c'; X.beginPath(); X.ellipse(150, -200 - neck * 50, 42, 36, 0, 0, 6.283); X.fill(); X.fillStyle = '#d6302a'; X.beginPath(); X.moveTo(130, -230 - neck * 50); X.quadraticCurveTo(146, -270 - neck * 50, 168, -234 - neck * 50); X.lineTo(150, -226 - neck * 50); X.fill();
  X.fillStyle = '#e8a23a'; X.beginPath(); X.moveTo(184, -208 - neck * 50); X.lineTo(224 + neck * 6, -218 - neck * 56); X.lineTo(184, -196 - neck * 50); X.fill(); if (neck > 0.2) { X.beginPath(); X.moveTo(184, -196 - neck * 50); X.lineTo(222 + neck * 6, -180 - neck * 40); X.lineTo(184, -190 - neck * 50); X.fill(); }
  X.fillStyle = '#fff'; X.beginPath(); X.arc(162, -208 - neck * 50, 7, 0, 6.283); X.fill(); X.fillStyle = '#111'; X.beginPath(); X.arc(164, -208 - neck * 50, 3.4, 0, 6.283); X.fill();
  X.restore(); X.restore();
  X.strokeStyle = '#4a3226'; X.lineWidth = 18; rr(120, 330, 840, 860, 30); X.stroke(); X.fillStyle = '#4a3226'; X.fillRect(530, 330, 20, 860);
  vignette(0.4);
}
function sClock(T) {
  const dawn = 0.85; X.fillStyle = mix('#2a1f24', '#8d6a52', dawn); X.fillRect(0, 0, W, H);
  // jarum macet di 2, lalu tik tik
  const t1 = T > 111.55 ? 1 : 0, t2 = T > 112.45 ? 1 : 0;
  const hop = (tt, k) => (T > tt && T < tt + 0.12 ? Math.sin((T - tt) / 0.12 * Math.PI) * 0.4 : 0);
  X.save(); X.translate(540, 760); const sh = hop(111.55) + hop(112.45); X.rotate(sh * 0.03); clockFace(0, 0, 380, 0.0 + t1 * 1 + t2 * 1 + (T > 112.8 ? (T - 112.8) * 6 : 0), T); X.restore();
  glow(540, 760, 700, 'rgba(255,180,100,0.25)', 1);
  if (T > 111.55 && T < 111.95) text('tik', 800, 480, { font: `italic 90px ${SERIF}`, color: '#ffd9a0', alpha: 1 - prog(T, 111.55, 111.95) });
  if (T > 112.45 && T < 112.85) text('tik', 300, 480, { font: `italic 90px ${SERIF}`, color: '#ffd9a0', alpha: 1 - prog(T, 112.45, 112.85) });
  vignette(0.35);
}
function sDoorOpen(T) {
  const k = ease(prog(T, 113.4, 115.6));
  X.fillStyle = '#150f12'; X.fillRect(0, 0, W, H);
  // cahaya subuh
  const lg = X.createLinearGradient(0, 0, W, 0); lg.addColorStop(0, `rgba(255,214,140,${0.95 * k})`); lg.addColorStop(1, `rgba(255,170,90,${0.3 * k})`);
  X.fillStyle = '#ffd9a0'; X.fillRect(260, 360, 560, 840); X.fillStyle = lg; X.fillRect(260, 360, 560, 840);
  X.fillStyle = `rgba(255,230,180,${0.9 * k})`; X.fillRect(260, 360, 560, 840);
  // kusen
  X.fillStyle = '#3a2418'; X.fillRect(230, 340, 600, 30); X.fillRect(230, 340, 34, 880); X.fillRect(796, 340, 34, 880);
  // daun pintu berayun (engsel kiri)
  const wdt = 530 * (1 - k * 0.85); X.fillStyle = '#4a2d1e'; X.beginPath(); X.moveTo(264, 372); X.lineTo(264 + wdt, 372 - 40 * k); X.lineTo(264 + wdt, 1200 + 40 * k); X.lineTo(264, 1200); X.closePath(); X.fill();
  X.fillStyle = 'rgba(0,0,0,0.2)'; X.beginPath(); X.moveTo(300, 420); X.lineTo(264 + wdt - 36, 420 - 30 * k); X.lineTo(264 + wdt - 36, 760); X.lineTo(300, 760); X.closePath(); X.fill();
  if (k < 0.7) { X.fillStyle = '#d9b26a'; X.beginPath(); X.arc(264 + wdt - 40, 800, 10, 0, 6.283); X.fill(); }
  glow(540, 780, 700 * k, 'rgba(255,220,150,0.8)', 1);
  // sinar ke lantai
  X.save(); X.globalAlpha = 0.6 * k; X.fillStyle = 'rgba(255,225,170,0.5)'; X.beginPath(); X.moveTo(300, 1200); X.lineTo(780, 1200); X.lineTo(1040, 1600); X.lineTo(40, 1600); X.closePath(); X.fill(); X.restore();
  vignette(0.35, '30,10,0');
}
function sPhone(T) {
  X.fillStyle = '#0c1020'; X.fillRect(0, 0, W, H); const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a2347'); g.addColorStop(1, '#3a2a40'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  const buzz = T < 129.2 ? Math.sin(T * 90) * 6 * prog(T, 127.6, 127.7) : 0;
  X.save(); X.translate(540 + buzz, 760); X.fillStyle = '#05060a'; rr(-230, -440, 460, 880, 60); X.fill(); X.fillStyle = '#10152c'; rr(-210, -420, 420, 840, 46); X.fill();
  glow(0, 0, 520, 'rgba(120,160,255,0.25)', 1);
  const a = easeOut(prog(T, 127.7, 128.4)); X.save(); X.translate(0, -300 + (1 - a) * -140); X.globalAlpha = a; X.fillStyle = 'rgba(245,246,250,0.96)'; rr(-190, -40, 380, 250, 28); X.fill();
  X.fillStyle = '#2f9e6a'; rr(-160, -12, 40, 40, 10); X.fill(); text('Pesanan', -100, 20, { font: `600 28px ${UIF}`, color: '#334', align: 'left' });
  text('Pesanan selesai.', -160, 92, { font: `700 40px ${UIF}`, color: '#111', align: 'left' }); text('Terima kasih, Arga.', -160, 148, { font: `400 36px ${UIF}`, color: '#445', align: 'left' }); X.restore();
  for (let i = 0; i < 5; i++) { const sa = easeBack(prog(T, 131.6 + i * 0.14, 131.9 + i * 0.14)); if (sa > 0) { X.save(); X.translate(-140 + i * 70, 300); X.scale(sa, sa); X.fillStyle = '#ffc53d'; X.beginPath(); for (let j = 0; j < 10; j++) { const rr2 = j % 2 ? 14 : 32; const an = -Math.PI / 2 + j * Math.PI / 5; X.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } X.closePath(); X.fill(); X.restore(); } }
  X.restore();
}
function sRoad(T) {
  const g = X.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, '#6f86b8'); g.addColorStop(0.6, '#ffb27a'); g.addColorStop(1, '#ffe2a8'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.fillStyle = 'rgba(255,245,210,0.95)'; X.beginPath(); X.arc(780, 830, 70, 0, 6.283); X.fill(); glow(780, 830, 420, 'rgba(255,220,150,0.6)', 1);
  X.fillStyle = '#4a3a58'; for (let i = 0; i < 8; i++) { const h = 160 + ((i * 97) % 200); X.fillRect(40 + i * 130, 1010 - h, 100, h); }
  X.fillStyle = '#3b3a45'; X.fillRect(0, 1010, W, 910); X.strokeStyle = '#efe6d0'; X.lineWidth = 10; X.setLineDash([70, 60]); X.beginPath(); X.moveTo(0, 1180); X.lineTo(W, 1180); X.stroke(); X.setLineDash([]);
  // motor
  X.save(); X.translate(640, 940); X.strokeStyle = '#161618'; X.lineWidth = 16; for (const d of [-130, 140]) { X.beginPath(); X.arc(d, 120, 78, 0, 6.283); X.stroke(); }
  X.fillStyle = '#b4381f'; X.beginPath(); X.moveTo(-130, 120); X.lineTo(-40, 10); X.lineTo(60, 10); X.lineTo(140, 120); X.lineTo(110, 130); X.lineTo(40, 60); X.lineTo(-60, 60); X.lineTo(-110, 130); X.closePath(); X.fill(); X.fillStyle = '#222'; rr(-70, -14, 130, 26, 10); X.fill(); X.strokeStyle = '#222'; X.lineWidth = 12; X.beginPath(); X.moveTo(100, 20); X.lineTo(120, -50); X.lineTo(170, -60); X.stroke(); X.restore();
  // Arga + telepon
  arga(330, 700, 1.0, { mood: 'smile', T, talk: inR(T, ARGA_SPK) ? 0.7 : 0 });
  X.save(); X.translate(430, 700); X.rotate(0.15); X.fillStyle = '#20232f'; rr(-24, -50, 48, 100, 10); X.fill(); X.restore(); X.fillStyle = SK_A; X.beginPath(); X.arc(430, 745, 26, 0, 6.283); X.fill();
  if (T >= 139.92 && T <= 142.9) bubble(170, 330, 740, 150, ['"Halo, Bu. Minggu ini, Arga pulang."'], { font: `italic 40px ${SERIF}`, tail: [330, 540], a: fadeIO(T, 139.92, 142.9, 0.2) });
  vignette(0.25, '40,15,0');
}
function sMother(T) {
  const g = X.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, '#9fc4e8'); g.addColorStop(1, '#ffd9a8'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.fillStyle = '#7a5a48'; X.beginPath(); X.moveTo(80, 780); X.lineTo(540, 520); X.lineTo(1000, 780); X.lineTo(1000, 1180); X.lineTo(80, 1180); X.closePath(); X.fill(); X.fillStyle = '#ffd9a0'; rr(380, 760, 320, 420, 10); X.fill();
  ibu(540, 800, 1.1, { mood: 'cry', T, tear: 1 });
  X.save(); X.translate(640, 760); X.rotate(-0.2); X.fillStyle = '#20232f'; rr(-24, -50, 48, 100, 10); X.fill(); X.restore();
  for (let i = 0; i < 4; i++) { const f = ((T - 142.8) * 0.5 + i * 0.25) % 1; heart(200 + i * 220, 760 - f * 300, 0.7, '#ff6b8b', Math.sin(Math.PI * f)); }
  ground(1180, '#a8865a', '#6b4e30');
  vignette(0.2, '60,30,0');
}
function sEnd(T) {
  const g = X.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a2347'); g.addColorStop(0.55, '#7a5a8c'); g.addColorStop(1, '#ffb27a'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  glow(540, 1100, 700, 'rgba(255,200,130,0.45)', 1);
  const a = easeOut(prog(T, 145.5, 146.4)); text('TAMAT', 540, 560, { font: `400 190px ${SERIF}`, color: '#fff7e6', alpha: a });
  text('ORDERAN JAM 2', 540, 650, { font: `600 44px ${UIF}`, color: '#ffd9a0', alpha: a, spacing: 12 });
  const b1 = prog(T, 149.68, 150.3); if (b1 > 0) { pill(540, 830, 'Kirim video ini ke ibumu', { w: 780, h: 104, bg: 'rgba(255,255,255,0.16)', ink: '#fff', font: `500 46px ${UIF}`, a: b1 }); heart(190, 830, 0.6, '#ff6b8b', b1); }
  const b2 = prog(T, 151.28, 151.9); if (b2 > 0) pill(540, 960, 'atau telepon dia malam ini', { w: 780, h: 104, bg: 'rgba(255,255,255,0.1)', ink: '#ffe8c8', font: `italic 46px ${SERIF}`, a: b2 });
  const fa = prog(T, 153.1, 153.7); if (fa > 0) { const pulse = 1 + 0.05 * Math.sin(T * 6); X.save(); X.globalAlpha = fa; X.translate(540, 1100); X.scale(pulse, pulse); X.fillStyle = '#ffd9a0'; rr(-270, -66, 540, 132, 66); X.fill(); text('+ Ikuti FQverse', 0, 20, { font: `600 54px ${UIF}`, color: '#1a2347' }); X.restore(); }
}
function sPromo(T) {
  nightBg(W, H, '#0a0f24', '#1c1842'); drawStars(STARS_FULL, T, 0.6);
  text(typed('Bikin video cerita', T, 156.0, 157.3), 540, 400, { font: `400 78px ${SERIF}`, color: COL.ivory });
  text(typed('seperti ini, cuma dari HP?', T, 157.3, 159.4), 540, 490, { font: `400 78px ${SERIF}`, color: COL.ivory });
  const pa = easeOut(prog(T, 158.4, 159.2));
  if (pa > 0) { X.save(); X.translate(540, 720 + (1 - pa) * 80); X.globalAlpha = pa; X.scale(0.6, 0.6); X.fillStyle = '#0b0c12'; rr(-190, -300, 380, 600, 60); X.fill(); X.fillStyle = '#1f2a55'; rr(-170, -280, 340, 560, 44); X.fill();
    for (let i = 0; i < 3; i++) { X.fillStyle = ['#ff8fb0', '#8fc2ff', '#e2b44a'][i]; X.globalAlpha = pa * 0.85; rr(-130, -230 + i * 150 + ((T * 20) % 10), 260, 120, 22); X.fill(); } X.restore(); }
  const fa = easeOut(prog(T, 160.56, 161.3)); if (fa > 0) { glow(540, 1070, 460, 'rgba(216,195,154,0.3)', fa); text('File Sakti', 540, 1090, { font: `400 170px ${SCRIPT}`, color: COL.champagne, alpha: fa }); }
  const la = prog(T, 162.8, 163.2); if (la > 0) pill(540, 1170, 'Link di bio', { w: 480, h: 92, bg: COL.champagne, ink: '#0a0f24', font: `600 46px ${UIF}`, a: la });
}

/* ---------- kamera & state ruang ---------- */
function roomState(T) {
  const o = {}; const L = (a, b, x, y) => lerp(x, y, ease(prog(T, a, b)));
  const tail = LARAS_SPK, aSp = inR(T, ARGA_SPK) ? 0.8 : 0, lSp = inR(T, LARAS_SPK) ? 0.7 : 0;
  Object.assign(o, { aTalk: aSp, lTalk: lSp, aM: 'calm', lM: 'calm', cx: 540, cy: 780, z: 1 });
  if (T < 12.9) { // adegan 1-2
    o.candleOn = T < 12.72 ? 1 : 0; o.lamp = T < 12.72 ? 1 : 1 - prog(T, 12.72, 13.5); o.aM = T > 8.4 ? 'shock' : 'calm'; o.lM = T > 10.4 ? 'stare' : 'calm'; o.lPale = prog(T, 10.4, 11.2) * 0.8;
    o.cx = L(10.4, 11.5, 540, 770); o.z = L(8.4, 11.5, 1, 1.5); o.cy = L(10.4, 11.5, 780, 820); o.steam = T < 8 ? 1 : 0;
  } else if (T < 37.2) { o.lamp = 0; }
  else if (T < 70.3) {
    o.candleOn = prog(T, 37.36, 37.9); o.lamp = lerp(0.3, 0.9, prog(T, 37.4, 41)); o.lM = T < 41 ? 'calm' : (T < 62 ? 'warm' : 'smile'); o.aM = T < 62 ? 'sad' : 'smile'; o.aLook = 1; o.aEyes = 'open';
    o.rec = prog(T, 44.2, 47.3); o.steam = 1;
    if (T < 44.0) { o.cx = L(37.4, 44, 540, 600); o.z = L(37.4, 44, 1, 1.06); }
    else if (T < 47.5) { o.cx = L(44, 44.8, 600, 640); o.cy = L(44, 44.8, 780, 1000); o.z = L(44, 44.8, 1.06, 1.9); }
    else if (T < 50.5) { o.cx = L(47.5, 48.6, 640, 560); o.cy = L(47.5, 48.6, 1000, 800); o.z = L(47.5, 48.6, 1.9, 1.02); }
    else if (T < 58.4) { o.cx = L(50.5, 51.4, 560, 760); o.cy = L(50.5, 51.4, 800, 820); o.z = L(50.5, 51.4, 1.02, 1.5); o.ghosts = prog(T, 54.9, 57.2); o.lM = 'warm'; }
    else { o.cx = L(58.4, 59.4, 760, 560); o.cy = 800; o.z = L(58.4, 59.4, 1.5, 1.08); o.aX = lerp(300, 350, ease(prog(T, 58.9, 59.9))); o.aM = T < 61 ? 'sad' : 'smile'; o.lM = T < 62.5 ? 'warm' : 'smile'; o.spoon = prog(T, 65.9, 66.9) * (1 - prog(T, 66.9, 67.9)) + prog(T, 68.3, 69.0) * (1 - prog(T, 69.0, 69.9)); o.rec = 1; }
    if (T > 58.4) { o.rec = 1; o.steam = T < 65.4 ? 0.6 : 1; }
  }
  else if (T < 98.9) { // close-up Laras kangen / Arga
    o.candleOn = 1; o.lamp = 0.85; o.rec = 1; o.steam = 0.6;
    if (T < 88.3) { o.cx = 770; o.cy = 830; o.z = 1.75; o.lM = 'sad'; o.lTear = prog(T, 85.6, 86.8); o.aM = 'smile'; }
    else { o.cx = 330; o.cy = 830; o.z = 1.75; o.aM = 'sad'; o.aTear = prog(T, 89.8, 91); o.lM = 'warm'; }
  }
  else if (T < 107.3) { o.candleOn = 1; o.lamp = 0.85; o.rec = 1; o.cx = 770; o.cy = 830; o.z = L(98.3, 99.6, 1.4, 1.75); o.lM = 'warm'; o.aM = 'sad'; o.lTear = 0.4; }
  else { // subuh
    const dw = prog(T, 107.3, 110); o.dawn = dw; o.candleOn = 0; o.lamp = 1; o.rec = 1; o.clean = T > 119.2; o.photoB = prog(T, 121.9, 122.8); o.clockMin = 0;
    o.lAlpha = 1 - prog(T, 116.4, 118.2); o.aM = 'calm'; o.aLook = T < 118 ? 1 : -1; o.aEyes = 'open';
    o.rice = T > 119.2 ? 0 : 1;
    if (T < 118) { o.cx = 540; o.cy = 780; o.z = 1.02; }
    else if (T < 119.4) { o.cx = L(118, 118.8, 540, 770); o.cy = 820; o.z = L(118, 118.8, 1.02, 1.6); }
    else if (T < 121.7) { o.cx = L(119.4, 120.2, 770, 540); o.cy = L(119.4, 120.2, 820, 1020); o.z = L(119.4, 120.2, 1.6, 1.9); }
    else { o.cx = L(121.7, 122.6, 540, 540); o.cy = L(121.7, 122.6, 1020, 540); o.z = L(121.7, 122.6, 1.9, 2.5); }
    if (T >= 119.6) o.aAlpha = 0;
  }
  return o;
}

/* ---------- timeline ---------- */
function drawFrame(T) {
  X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  if (T < 13.4) { room(T, roomState(T)); }
  else if (T < 37.2) { if (T < 19.2 || T >= 19.2) sDark(T); if (T >= 26.8) { room(T, { ...roomState(T), lamp: 0.28, candleOn: 0, cx: 770, cy: 830, z: 1.75, lM: 'sad', lTalk: inR(T, LARAS_SPK) ? 0.7 : 0, aAlpha: 0, lPale: 0.2 }); const k = 1 - prog(T, 26.8, 27.4); if (k > 0) { X.save(); X.globalAlpha = k; sDark(T); X.restore(); } } }
  else if (T < 70.3) room(T, roomState(T));
  else if (T < 72.6) room(T, { ...roomState(T), cx: 540, cy: 780, z: 1.05, lM: 'smile', aM: 'smile' });
  else if (T < 75.1) sKid(T);
  else if (T < 79.9) sBus(T);
  else if (T < 84.5) sCal(T);
  else if (T < 90.0) room(T, roomState(T));
  else if (T < 98.3) sKampung(T);
  else if (T < 105.5) room(T, roomState(T));
  else if (T < 107.3) { sDoorChair(T); }
  else if (T < 109.4) sWindow(T);
  else if (T < 113.2) sClock(T);
  else if (T < 116.4) sDoorOpen(T);
  else if (T < 127.6) room(T, roomState(T));
  else if (T < 132.9) sPhone(T);
  else if (T < 142.8) sRoad(T);
  else if (T < 145.4) sMother(T);
  else if (T < 155.9) sEnd(T);
  else sPromo(T);
  // transisi hitam singkat di batas adegan non-ruang
  const cuts = [13.4, 26.8, 70.3, 72.6, 75.1, 79.9, 84.5, 90.0, 98.3, 105.5, 107.3, 109.4, 113.2, 116.4, 127.6, 132.9, 142.8, 145.4, 155.9];
  for (const c of cuts) { const d = Math.abs(T - c); if (d < 0.16 && ![13.4, 26.8, 70.3, 84.5, 98.3].includes(c)) { X.fillStyle = `rgba(0,0,0,${1 - d / 0.16})`; X.fillRect(0, 0, W, H); } }
  if (T < 0.35) { X.fillStyle = `rgba(0,0,0,${1 - T / 0.35})`; X.fillRect(0, 0, W, H); }
  if (T > TEND - 0.5) { X.fillStyle = `rgba(0,0,0,${prog(T, TEND - 0.5, TEND)})`; X.fillRect(0, 0, W, H); }
  // label "Sebelumnya" + hasil vote
  if (T < 8.6) {
    const a1 = fadeIO(T, 0.1, 1.3, 0.25); if (a1 > 0) pill(540, 400, 'SEBELUMNYA', { w: 420, h: 80, bg: 'rgba(255,255,255,0.14)', ink: '#ffe8c8', font: `600 36px ${UIF}`, a: a1 });
    const a2 = fadeIO(T, 6.4, 8.5, 0.25); if (a2 > 0) { pill(540, 400, 'Pilihan terbanyak: B  Jujur', { w: 720, h: 90, bg: 'rgba(255,217,160,0.95)', ink: '#2a1a0a', font: `600 40px ${UIF}`, a: a2 }); }
  }
  if (T >= 8.72 && T <= 10.3) bubble(190, 330, 700, 130, ['"Saya bukan anak Ibu."'], { font: `italic 42px ${SERIF}`, tail: [300, 520], a: fadeIO(T, 8.72, 10.3, 0.2) });
  if (T >= 61.08 && T <= 62.6) bubble(190, 330, 700, 130, ['"Boleh saya makan, Bu?"'], { font: `italic 42px ${SERIF}`, tail: [380, 520], a: fadeIO(T, 61.08, 62.6, 0.2) });
  if (T >= 47.6 && T <= 50.4) pill(540, 400, '20 tahun menunggu', { w: 600, h: 84, bg: 'rgba(255,255,255,0.14)', ink: '#ffe8c8', font: `italic 44px ${SERIF}`, a: fadeIO(T, 47.6, 50.4, 0.25) });
  if (T >= 8.4 && T < 12.7) { /* getar lampu */ }
}
function caption(T) {
  if (!SUBS) return;
  for (let i = 0; i < CAPS.length; i++) {
    const [a, b0, str] = CAPS[i]; const b = Math.min(b0, i + 1 < CAPS.length ? CAPS[i + 1][0] - 0.02 : b0);
    if (T < a || T > b) continue;
    const k = Math.min(prog(T, a, a + 0.12), 1 - prog(T, b - 0.1, b));
    const font = `700 54px ${UIF}`; const lines = wrapLines(str, font, SUB_W); const lh = 66; const y0 = SUB_Y - (lines.length - 1) * lh / 2;
    X.save(); X.globalAlpha = k; X.lineJoin = 'round'; X.lineWidth = 12; X.strokeStyle = 'rgba(0,0,0,0.75)'; X.font = font; X.textAlign = 'center';
    lines.forEach((ln, j) => { X.strokeText(ln, 540, y0 + j * lh); }); X.fillStyle = '#fff';
    lines.forEach((ln, j) => { X.fillText(ln, 540, y0 + j * lh); }); X.restore();
  }
}
window.renderBoth = (T, q = 0.9) => { drawFrame(T); const nosub = C.toDataURL('image/jpeg', q).split(',')[1]; caption(T); const sub = C.toDataURL('image/jpeg', q).split(',')[1]; return { sub, nosub }; };
window.render = (T) => { drawFrame(T); caption(T); };
window.DURATION = TEND; window.ready = Promise.resolve(true);
