import * as THREE from './three.module.js';
const GLC = document.createElement('canvas'); GLC.width = W; GLC.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: GLC, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(34, W / H, 0.1, 90);
const hemi = new THREE.HemisphereLight('#a9bcf0', '#3a3358', 0.75); scene.add(hemi);
const sun = new THREE.DirectionalLight('#cfdcff', 0.9); sun.position.set(-3, 6, 5); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -4, near: 1, far: 22 }); sun.shadow.radius = 4; scene.add(sun);
const fillL = new THREE.DirectionalLight('#ffe6cc', 0.75); fillL.position.set(1.5, 2.5, 8); scene.add(fillL);
const PT = {};
for (const [k, c, p] of [['street', '#ffb866', [3.2, 3.2, -1.2]], ['k1', '#ffb35c', [-1.9, 3.0, 0.6]], ['k2', '#ffb35c', [0.9, 3.0, 0.6]], ['malam', '#ffc27a', [2.0, 3.4, 1.0]]]) { const l = new THREE.PointLight(c, 0, 14, 2); l.position.set(...p); scene.add(l); PT[k] = l; }

/* ---------- toon characters v2 (cel-shaded, outlined) ---------- */
const gm = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]), 4, 1, THREE.RGBAFormat); gm.minFilter = gm.magFilter = THREE.NearestFilter; gm.needsUpdate = true;
const T_ = (c) => new THREE.MeshToonMaterial({ color: c, gradientMap: gm });
const OUT = new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { t: { value: 0.012 } }, vertexShader: 'uniform float t; void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position + normal*t,1.0);}', fragmentShader: 'void main(){ gl_FragColor = vec4(0.10,0.07,0.12,1.0);}' });
function outlined(geo, mat, th = 0.012) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; if (th > 0) { const o = new THREE.Mesh(geo, new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { t: { value: th } }, vertexShader: OUT.vertexShader, fragmentShader: OUT.fragmentShader })); m.add(o); } return m; }
function ell(r, mat, sx, sy, sz, th = 0.01) { const m = outlined(new THREE.SphereGeometry(r, 36, 24), mat, th); m.scale.set(sx, sy, sz); return m; }
function flat(r, color, sx, sy, sz, op = 1) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), new THREE.MeshBasicMaterial({ color, transparent: op < 1, opacity: op })); m.scale.set(sx, sy, sz); return m; }
function limb(r0, r1, len, mat, th = 0.01) { const m = outlined(new THREE.CylinderGeometry(r0, r1, len, 24, 1), mat, th); return m; }
function headGeo(R) { // egg-shaped head: wider cheeks, softer chin
  const g = new THREE.SphereGeometry(R, 48, 36); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = y / R;
    if (k < 0) { const f = 1 - 0.22 * Math.pow(-k, 1.6); x *= f; z *= (1 - 0.1 * Math.pow(-k, 1.6)); y *= 1.0; }
    else { x *= 1 - 0.04 * k; }
    p.setXYZ(i, x * 1.04, y * 0.96, z * 0.94); }
  g.computeVertexNormals(); return g; }
function torsoGeo(wide) { const pts = [[0.001, 0], [0.24, 0.0], [0.3 * wide, 0.14], [0.3 * wide, 0.42], [0.27 * wide, 0.6], [0.2, 0.7], [0.1, 0.74], [0.001, 0.75]].map(([x, y]) => new THREE.Vector2(x, y)); const g = new THREE.LatheGeometry(pts, 40); return g; }
function makeChar({ skin, hair, shirt, shirt2, pants, girl }) {
  const g = new THREE.Group(); const sk = T_(skin), hr = T_(hair), sh = T_(shirt), sh2 = T_(shirt2 || shirt), pn = T_(pants), shoeM = T_('#22202c');
  const wetMat = T_('#16224f'); const dark = new THREE.MeshBasicMaterial({ color: '#1a1420' });
  const eyesA = [], browsA = [];
  // legs
  const legs = [];
  for (const d of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(d * 0.13, 0.56, 0); const l = limb(0.085, 0.07, 0.5, girl ? sk : pn); l.position.y = -0.25; piv.add(l); const shoe = ell(0.1, shoeM, 1, 0.65, 1.55, 0.008); shoe.position.set(0, -0.52, 0.06); piv.add(shoe); g.add(piv); legs.push(piv); }
  // torso
  const torso = outlined(torsoGeo(1), sh, 0.012); torso.position.y = 0.5; torso.scale.set(1, 1, 0.78); g.add(torso);
  if (girl) { const skirt = outlined(new THREE.CylinderGeometry(0.25, 0.42, 0.34, 40, 1, true), T_('#c9a98a'), 0.01); skirt.material.side = THREE.DoubleSide; skirt.position.y = 0.55; g.add(skirt); const belt = ell(0.27, T_('#8a6a52'), 1, 0.12, 0.8, 0.006); belt.position.y = 0.66; g.add(belt); }
  else { const pocket = ell(0.16, sh2, 1.1, 0.5, 0.2, 0.006); pocket.position.set(0, 0.7, 0.2); g.add(pocket); const col = outlined(new THREE.TorusGeometry(0.15, 0.05, 14, 32), sh2, 0.008); col.rotation.x = Math.PI / 2; col.position.set(0, 1.22, 0.01); col.scale.set(1, 1.2, 1); g.add(col); }
  const neck = limb(0.09, 0.1, 0.18, sk, 0.008); neck.position.y = 1.3; g.add(neck);
  // head
  const head = new THREE.Group(); head.position.y = 1.7; g.add(head);
  head.add(outlined(headGeo(0.47), sk, 0.012));
  for (const d of [-1, 1]) {
    const ear = ell(0.08, sk, 0.5, 1, 0.8, 0.008); ear.position.set(d * 0.47, -0.02, -0.02); head.add(ear);
    const eye = ell(0.062, dark, 1, 1.45, 0.45, 0); eye.position.set(d * 0.165, 0.0, 0.405); head.add(eye);
    const h1 = flat(0.022, '#fff', 1, 1, 0.5); h1.position.set(d * 0.165 + 0.02, 0.045, 0.438); head.add(h1);
    const h2 = flat(0.011, '#fff', 1, 1, 0.5); h2.position.set(d * 0.165 - 0.02, -0.04, 0.438); head.add(h2); eyesA.push({ e: eye, h1, h2 });
    const brow = outlined(new THREE.CapsuleGeometry(0.014, 0.1, 4, 10), T_(girl ? '#3a2418' : '#1d1a22'), 0); brow.rotation.z = Math.PI / 2 + d * 0.12; brow.position.set(d * 0.17, 0.15, 0.4); head.add(brow); browsA.push({ b: brow, d });
    if (girl) { const lash = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.009, 6, 16, Math.PI * 0.8), dark); lash.rotation.z = Math.PI * 0.1 + (d < 0 ? 0.3 : 0); lash.position.set(d * 0.165, 0.045, 0.43); head.add(lash); }
    const cheek = flat(0.07, '#ff8f8f', 1, 0.6, 0.25, 0.45); cheek.position.set(d * 0.29, -0.12, 0.34); head.add(cheek);
  }
  const nose = ell(0.028, T_('#e8b08a'), 1, 0.8, 0.8, 0); nose.position.set(0, -0.06, 0.45); head.add(nose);
  const mouth = new THREE.Group(); mouth.position.set(0, -0.16, 0.42);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.011, 8, 24, Math.PI), new THREE.MeshBasicMaterial({ color: '#5b2a26' })); smile.rotation.z = Math.PI; mouth.add(smile);
  const open = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: '#7a2f2a', side: THREE.DoubleSide })); open.position.z = -0.001; mouth.add(open); mouth.userData.open = open; head.add(mouth);
  // hair
  const cap = outlined(new THREE.SphereGeometry(0.49, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), hr, 0.012); cap.position.set(0, 0.04, -0.05); cap.rotation.x = -0.2; head.add(cap);
  if (girl) {
    const back = ell(0.5, hr, 1.0, 1.25, 0.62, 0.012); back.position.set(0, -0.28, -0.22); head.add(back);
    for (const d of [-1, 1]) { const lock = outlined(new THREE.CapsuleGeometry(0.075, 0.42, 6, 14), hr, 0.01); lock.position.set(d * 0.42, -0.34, 0.14); lock.rotation.z = d * 0.08; head.add(lock); }
    const bang = ell(0.5, hr, 1.0, 0.34, 0.78, 0.01); bang.position.set(0, 0.28, 0.14); bang.rotation.x = -0.5; head.add(bang);
    for (const [bx, rz] of [[-0.2, 0.5], [0.2, -0.5]]) { const b = ell(0.1, hr, 0.7, 1.1, 0.45, 0.008); b.position.set(bx, 0.18, 0.37); b.rotation.z = rz * 0.5; head.add(b); }
    const clip = outlined(new THREE.CapsuleGeometry(0.02, 0.1, 4, 8), T_('#d8c39a'), 0.006); clip.rotation.z = 0.8; clip.position.set(0.3, 0.26, 0.3); head.add(clip);
  } else {
    const fr = ell(0.5, hr, 1.0, 0.36, 0.78, 0.01); fr.position.set(0.02, 0.27, 0.15); fr.rotation.set(-0.5, 0, -0.12); head.add(fr);
    const tuft = ell(0.12, hr, 1.0, 0.8, 0.8, 0.01); tuft.position.set(-0.08, 0.5, 0.1); tuft.rotation.z = 0.5; head.add(tuft);
    for (const d of [-1, 1]) { const sb = ell(0.07, hr, 0.6, 1.4, 0.7, 0.008); sb.position.set(d * 0.43, -0.02, 0.1); head.add(sb); }
  }
  // arms
  const arms = [];
  for (const d of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(d * 0.31, 1.15, 0);
    const sho = ell(0.105, sh, 1, 1, 1, 0.01); piv.add(sho);
    const a = limb(0.085, 0.07, 0.4, sh); a.position.y = -0.22; piv.add(a);
    const cuff = outlined(new THREE.TorusGeometry(0.068, 0.022, 10, 20), sh2, 0.006); cuff.rotation.x = Math.PI / 2; cuff.position.y = -0.42; piv.add(cuff);
    const hand = ell(0.075, sk, 1, 1.1, 0.9, 0.008); hand.position.y = -0.5; piv.add(hand);
    const thumb = ell(0.03, sk, 1, 1.4, 1, 0.005); thumb.position.set(d * -0.06, -0.48, 0.04); piv.add(thumb);
    g.add(piv); arms.push({ piv, a, sho, d });
  }
  g.userData = { head, arms, legs, wetMat, body: torso, mouth, smile, hy: 1.7, eyes: eyesA, brows: browsA };
  return g;
}
const raka = makeChar({ skin: '#f3c8a2', hair: '#1d1a22', shirt: '#38559f', shirt2: '#2b4282', pants: '#2c3250' });
const nadia = makeChar({ skin: '#f3c8a2', hair: '#4a2c1d', shirt: '#f1e6d2', shirt2: '#e2cfb0', pants: '#2c3250', girl: true });
scene.add(raka, nadia);
{ const a = raka.userData.arms.find(a => a.d === 1); a.a.material = raka.userData.wetMat; a.sho.material = raka.userData.wetMat;
  const patch = outlined(new THREE.SphereGeometry(0.2, 24, 16), raka.userData.wetMat, 0); patch.scale.set(0.9, 1.0, 0.6); patch.position.set(0.17, 1.0, 0.02); raka.add(patch); }

/* umbrella */
const umb = new THREE.Group(); scene.add(umb);
const UB = 1.0;
const canopy = outlined(new THREE.SphereGeometry(0.98, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.42), T_('#2f6fd6'), 0.012); canopy.material.side = THREE.DoubleSide; canopy.scale.set(1, 0.9, 1); canopy.position.y = UB; canopy.castShadow = false; umb.add(canopy);
for (let i = 0; i < 8; i++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.008, 6, 40, Math.PI * 0.42), new THREE.MeshBasicMaterial({ color: '#9cc0ff' })); rib.scale.set(1, 0.9, 1); rib.position.y = UB; rib.rotation.set(0, i * Math.PI / 4, Math.PI / 2 - Math.PI * 0.42 + 0); umb.add(rib); }
const rim = outlined(new THREE.TorusGeometry(0.98 * Math.sin(Math.PI * 0.42), 0.028, 10, 48), T_('#1e4fa8'), 0.006); rim.rotation.x = Math.PI / 2; rim.position.y = UB + 0.98 * Math.cos(Math.PI * 0.42) * 0.9; umb.add(rim);
const shaft = outlined(new THREE.CylinderGeometry(0.022, 0.022, 1.6, 12), T_('#8a6a46'), 0.005); shaft.position.y = UB - 0.8 + 0.05; umb.add(shaft);
const hook = outlined(new THREE.TorusGeometry(0.07, 0.022, 10, 20, Math.PI), T_('#8a6a46'), 0.005); hook.position.set(-0.07, UB - 1.6 + 0.05, 0); hook.rotation.z = Math.PI; umb.add(hook);
const tip = ell(0.035, T_('#c8a050'), 1, 1.6, 1, 0.004); tip.position.y = UB + 0.98 * 0.9 + 0.02; umb.add(tip);


/* ===== environment builders ===== */
const clampv = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const eo = (k) => 1 - Math.pow(1 - k, 3);
const pr = (t, a, b) => clampv((t - a) / (b - a));
function boxm(w, h, d, color, x, y, z, parent, { toon = true, shadow = false, recv = false } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon ? T_(color) : new THREE.MeshStandardMaterial({ color, roughness: 0.8 }));
  m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = recv; parent.add(m); return m;
}
function cyl(r0, r1, h, color, x, y, z, parent, seg = 28) { const m = outlined(new THREE.CylinderGeometry(r0, r1, h, seg), T_(color), 0.006); m.position.set(x, y, z); parent.add(m); return m; }
function textTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const proj = (v) => { const p = v.clone().project(cam); return { x: (p.x * 0.5 + 0.5) * W, y: (-p.y * 0.5 + 0.5) * H }; };
const headPos = (c, dy = 0.55) => { const v = new THREE.Vector3(); c.userData.head.getWorldPosition(v); v.y += dy; return v; };

/* --- street (hook + hujan) --- */
const gStreet = new THREE.Group(); scene.add(gStreet);
{
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#2b3347', roughness: 0.35, metalness: 0.1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; gStreet.add(ground);
  boxm(60, 0.18, 3, '#434b63', 0, 0.09, -3.2, gStreet, { recv: true });
  const bcols = ['#3a4666', '#4a4f73', '#33405e', '#554a6e', '#3d5575'];
  for (let i = 0; i < 11; i++) {
    const w = 1.6 + (i % 3) * 0.5, h = 3 + ((i * 7) % 5), x = -9 + i * 2.1;
    boxm(w, h, 1.6, bcols[i % 5], x, h / 2, -6 - (i % 2), gStreet, { toon: false });
    for (let r = 0; r < Math.floor(h / 1.1); r++) for (let c = 0; c < 2; c++) {
      const lit = (i * 3 + r * 5 + c) % 3 !== 0;
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.5), new THREE.MeshBasicMaterial({ color: lit ? '#ffd38a' : '#1c2236' })); win.position.set(x - w * 0.22 + c * w * 0.44, 0.9 + r * 1.1, -6 - (i % 2) + 0.81); gStreet.add(win);
    }
  }
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.4, 12), new THREE.MeshStandardMaterial({ color: '#20242f' })); post.position.set(3.2, 1.7, -1.2); gStreet.add(post);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshBasicMaterial({ color: '#ffe0a8' })); bulb.position.set(3.2, 3.4, -1.2); gStreet.add(bulb);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshBasicMaterial({ color: '#ffb866', transparent: true, opacity: 0.18 })); halo.position.copy(bulb.position); gStreet.add(halo);
}
const puddleMat = new THREE.MeshStandardMaterial({ color: '#5a6f9a', roughness: 0.05, metalness: 0.6 });
const rings = [];
for (const [x, z, r] of [[-1.6, 1.2, 0.7], [1.9, 1.6, 0.55], [0.2, -0.9, 0.5], [-0.4, 2.4, 0.4]]) {
  const p = new THREE.Mesh(new THREE.CircleGeometry(r, 32), puddleMat); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.01, z); p.scale.set(1.4, 1, 1); gStreet.add(p);
  for (let k = 0; k < 2; k++) { const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 32), new THREE.MeshBasicMaterial({ color: '#c8d8ff', transparent: true, opacity: 0 })); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.02, z); gStreet.add(ring); rings.push({ ring, r, k, x }); }
}
const drips = new THREE.Group(); gStreet.add(drips);
for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshBasicMaterial({ color: '#9cc4ff' })); d.scale.y = 1.6; drips.add(d); }

/* --- rain (shared) --- */
const RN = 900, rp = new Float32Array(RN * 6), rs = []; let sd_ = 3; const RR = () => ((sd_ = (sd_ * 16807) % 2147483647) - 1) / 2147483646;
for (let i = 0; i < RN; i++) rs.push({ x: RR() * 14 - 7, z: RR() * 10 - 6, y: RR() * 7, sp: 8 + RR() * 5 });
const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
const rainL = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: '#cfe0ff', transparent: true, opacity: 0.55 })); rainL.frustumCulled = false; scene.add(rainL);
function updateRain(T, inten, shelter) {
  const cnt = Math.floor(RN * inten);
  for (let i = 0; i < RN; i++) {
    if (i >= cnt) { rp.fill(0, i * 6, i * 6 + 6); continue; }
    const r = rs[i]; const y = ((r.y - T * r.sp) % 7 + 7) % 7; const x = r.x + (7 - y) * 0.1;
    let L = 0.55; if (shelter && Math.abs(x + 0.1) < 0.9 && Math.abs(r.z) < 1.0 && y < 3.3) L = 0; if (shelter === 'halte' && Math.abs(x) < 2.1 && r.z > -1.0 && r.z < 1.0 && y < 3.0) L = 0;
    rp.set([x, y, r.z, x - 0.07, y + L, r.z], i * 6);
  }
  rg.attributes.position.needsUpdate = true;
}

/* --- kantin --- */
const gKantin = new THREE.Group(); scene.add(gKantin);
const kItems = {};
{
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshStandardMaterial({ color: '#6b4426', roughness: 0.9 })); wall.position.set(0, 4, -2.3); gKantin.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), new THREE.MeshStandardMaterial({ color: '#3b2616', roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; gKantin.add(floor);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.5), new THREE.MeshBasicMaterial({ color: '#f9d38a' })); win.position.set(2.5, 2.6, -2.25); gKantin.add(win);
  boxm(1.9, 0.07, 0.05, '#7a5230', 2.5, 2.6, -2.22, gKantin); boxm(0.07, 1.5, 0.05, '#7a5230', 2.5, 2.6, -2.22, gKantin);
  boxm(2.0, 0.08, 0.1, '#7a5230', 2.5, 1.85, -2.2, gKantin); boxm(2.0, 0.08, 0.1, '#7a5230', 2.5, 3.35, -2.2, gKantin);
  for (const x of [-1.9, 0.9]) { cyl(0.012, 0.012, 1.2, '#222', x, 3.6, 0.6, gKantin, 6); const sh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), T_('#e8b25a')); sh.position.set(x, 3.0, 0.6); sh.material.side = THREE.DoubleSide; gKantin.add(sh);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshBasicMaterial({ color: '#fff0c0' })); b.position.set(x, 2.95, 0.6); gKantin.add(b); }
  const signT = textTex(512, 160, (g, w, h) => { g.fillStyle = '#2c4a3b'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 24); g.fill(); g.fillStyle = '#f3eee3'; g.font = '600 80px sans-serif'; g.textAlign = 'center'; g.fillText('KANTIN', w / 2, 105); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ map: signT, transparent: true })); sign.position.set(-2.7, 2.9, -2.2); gKantin.add(sign);
  const tb = boxm(6.2, 0.85, 1.5, '#8a5a2b', 0, 0.425, 0.85, gKantin, { recv: true, shadow: true });
  boxm(6.4, 0.08, 1.7, '#b27a40', 0, 0.89, 0.85, gKantin, { recv: true });
  // es teh
  const gl = new THREE.Group(); gl.position.set(0.18, 0.93, 0.85);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.42, 28), new THREE.MeshStandardMaterial({ color: '#d98a30', roughness: 0.15, transparent: true, opacity: 0.88 })); cup.position.y = 0.21; cup.castShadow = true; gl.add(cup);
  for (const [x, y, z] of [[-0.04, 0.12, 0.02], [0.05, 0.22, -0.03], [0, 0.32, 0.04]]) { const ic = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 })); ic.position.set(x, y, z); ic.rotation.set(x * 9, y * 7, 0); gl.add(ic); }
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), T_('#ffffff')); straw.position.set(0.05, 0.4, 0); straw.rotation.z = -0.25; gl.add(straw);
  gKantin.add(gl); kItems.glass = gl;
  // nasi goreng
  const pl = new THREE.Group(); pl.position.set(0.98, 0.93, 0.9);
  cyl(0.42, 0.36, 0.05, '#f4efe6', 0, 0.025, 0, pl); const mound = outlined(new THREE.SphereGeometry(0.28, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), T_('#e0a845'), 0.008); mound.scale.y = 0.75; mound.position.y = 0.05; pl.add(mound);
  for (const [x, z, c] of [[-0.1, 0.05, '#7a4a20'], [0.08, -0.06, '#7fb069'], [0.0, 0.12, '#7a4a20'], [0.14, 0.06, '#7fb069'], [-0.06, -0.1, '#7a4a20']]) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), T_(c)); p.position.set(x, 0.2 - (x * x + z * z) * 1.2, z); pl.add(p); }
  gKantin.add(pl); kItems.plate = pl;
}
/* --- malam --- */
const gMalam = new THREE.Group(); scene.add(gMalam);
const mTin = {};
{
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshStandardMaterial({ color: '#1b1f3d', roughness: 0.95 })); wall.position.set(0, 4, -3); gMalam.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), new THREE.MeshStandardMaterial({ color: '#2a2142', roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; gMalam.add(floor);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.4, 40), new THREE.MeshStandardMaterial({ color: '#3b2f66', roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.012, 0.6); gMalam.add(rug);
  const wf = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.9), new THREE.MeshBasicMaterial({ color: '#0d1534' })); wf.position.set(-2.6, 2.8, -2.95); gMalam.add(wf);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 16), new THREE.MeshBasicMaterial({ color: '#efe7d6' })); moon.position.set(-2.4, 3.2, -2.9); gMalam.add(moon);
  boxm(1.8, 0.06, 0.08, '#2a3354', -2.6, 2.8, -2.92, gMalam); boxm(0.06, 1.9, 0.08, '#2a3354', -2.6, 2.8, -2.92, gMalam);
  boxm(3.4, 0.55, 1.9, '#3a2f5c', 3.3, 0.28, -1.7, gMalam, { shadow: true }); boxm(1.2, 0.2, 0.8, '#d8cdb8', 4.0, 0.65, -1.9, gMalam);
  cyl(0.012, 0.012, 1.0, '#222', 2.0, 4.3, 1.0, gMalam, 6);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), new THREE.MeshBasicMaterial({ color: '#ffe0a8' })); bulb.position.set(2.0, 3.75, 1.0); gMalam.add(bulb);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 12), new THREE.MeshBasicMaterial({ color: '#ffb866', transparent: true, opacity: 0.16 })); hl.position.copy(bulb.position); gMalam.add(hl);
  const tin = new THREE.Group(); tin.position.set(0.55, 0, 1.0); gMalam.add(tin);
  cyl(0.42, 0.42, 0.62, '#9c2e26', 0, 0.31, 0, tin, 36); cyl(0.428, 0.428, 0.14, '#c8a050', 0, 0.3, 0, tin, 36);
  const inside = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), new THREE.MeshBasicMaterial({ color: '#220a0a' })); inside.rotation.x = -Math.PI / 2; inside.position.y = 0.625; tin.add(inside);
  const lid = new THREE.Group(); cyl(0.45, 0.45, 0.08, '#b3382e', 0, 0, 0, lid, 36); cyl(0.4, 0.4, 0.02, '#c8473b', 0, 0.05, 0, lid, 36); tin.add(lid); mTin.lid = lid; mTin.tin = tin;
  const coins = new THREE.Group(); coins.position.y = 0.62; tin.add(coins); mTin.coins = coins;
  let sdc = 5; const rc = () => ((sdc = (sdc * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 24; i++) { const a = rc() * 6.28, r = rc() * 0.28; const c = outlined(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 18), T_(i % 3 ? '#e2b44a' : '#c99a36'), 0.004); c.position.set(Math.cos(a) * r, 0.02 + (i % 4) * 0.022, Math.sin(a) * r); c.rotation.set((rc() - 0.5) * 0.7, 0, (rc() - 0.5) * 0.7); coins.add(c); }
  const bills = new THREE.Group(); bills.position.y = 0.7; tin.add(bills); mTin.bills = bills;
  for (let i = 0; i < 4; i++) { const b = outlined(new THREE.BoxGeometry(0.26, 0.03, 0.17), T_(i % 2 ? '#7fb6a0' : '#9ab3d8'), 0.004); b.position.set(-0.15 + i * 0.1, i * 0.01, (i % 2 - 0.5) * 0.12); b.rotation.set(0.1, i * 0.5 - 0.7, 0.15); bills.add(b); }
}
/* --- halte --- */
const gHalte = new THREE.Group(); scene.add(gHalte);
const hObj = {};
{
  const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: textTex(8, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6d4f7a'); gr.addColorStop(0.45, '#f2a06b'); gr.addColorStop(0.62, '#ffd9a0'); gr.addColorStop(1, '#ffd9a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) })); gHalte.add(sky);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#4a4468', roughness: 0.3, metalness: 0.15 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; gHalte.add(ground);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.25), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.35 })); stripe.rotation.x = -Math.PI / 2; stripe.position.set(0, 0.02, -5); gHalte.add(stripe);
  boxm(5.2, 0.14, 2.0, '#35314f', 0, 3.15, 0, gHalte, { shadow: true }); for (const x of [-2.5, 2.5]) boxm(0.12, 3.1, 0.12, '#35314f', x, 1.55, -0.8, gHalte);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 2.4), new THREE.MeshStandardMaterial({ color: '#d8e6ff', transparent: true, opacity: 0.12, roughness: 0.1 })); back.position.set(0, 1.9, -0.8); gHalte.add(back);
  boxm(3.4, 0.1, 0.8, '#3d3658', 0, 0.5, 0.05, gHalte, { shadow: true, recv: true }); boxm(3.4, 0.5, 0.06, '#3d3658', 0, 0.8, -0.32, gHalte);
  for (const x of [-1.5, 1.5]) boxm(0.1, 0.5, 0.7, '#2a2542', x, 0.25, 0.05, gHalte);
  const rb = new THREE.Group(); const cols = ['#ff6b6b', '#ffb84d', '#ffe66d', '#7fd49b', '#6fa8e8', '#a68bd6'];
  cols.forEach((c, i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(9 - i * 0.28, 0.14, 8, 60, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, fog: false })); rb.add(t); });
  rb.position.set(0.5, 0, -14); gHalte.add(rb); hObj.rb = rb;
  const um = new THREE.Group(); um.position.set(0.7, 0.72, 0.3); um.rotation.z = Math.PI / 2 + 0.1; gHalte.add(um); hObj.um = um;
  const cone = outlined(new THREE.ConeGeometry(0.14, 0.9, 20), T_('#2f6fd6'), 0.008); cone.position.y = 0.2; um.add(cone);
  const st = outlined(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 10), T_('#8a6a46'), 0.004); st.position.y = -0.55; um.add(st);
  const hk = outlined(new THREE.TorusGeometry(0.06, 0.02, 8, 16, Math.PI), T_('#8a6a46'), 0.004); hk.position.set(-0.06, -0.85, 0); hk.rotation.z = Math.PI; um.add(hk);
}
const gAll = { street: gStreet, kantin: gKantin, malam: gMalam, halte: gHalte };

/* ===== look presets ===== */
function look(name, o) {
  for (const [k, g] of Object.entries(gAll)) g.visible = (k === name) || (name === 'hook' && k === 'street') || (name === 'hujan' && k === 'street');
  scene.background = o.bg ? new THREE.Color(o.bg) : null; scene.fog = new THREE.Fog(o.fog[0], o.fog[1], o.fog[2]);
  hemi.color.set(o.hemi[0]); hemi.groundColor.set(o.hemi[1]); hemi.intensity = o.hemi[2];
  sun.intensity = o.sun; sun.color.set(o.sunC || '#cfdcff'); fillL.intensity = o.fill; fillL.color.set(o.fillC || '#ffe6cc');
  for (const k of Object.keys(PT)) PT[k].intensity = (o.pts && o.pts[k]) || 0;
  sun.position.set(...(o.sunP || [-3, 6, 5]));
}
const LOOKS = {
  hook: { bg: '#0b1126', fog: ['#0b1126', 8, 26], hemi: ['#6d83c8', '#1d1a33', 0.6], sun: 0.4, fill: 0.5, pts: { street: 34 } },
  hujan: { bg: '#2a3550', fog: ['#2a3550', 7, 24], hemi: ['#a9bcf0', '#3a3358', 0.75], sun: 0.9, fill: 0.75, pts: { street: 30 } },
  kantin: { bg: '#2a1a10', fog: ['#2a1a10', 12, 40], hemi: ['#ffd9a8', '#4a2c18', 0.85], sun: 0.3, sunC: '#ffd7a0', fill: 0.55, pts: { k1: 12, k2: 12 }, sunP: [2, 6, 6] },
  malam: { bg: '#080b1a', fog: ['#080b1a', 12, 40], hemi: ['#5a6aaa', '#2d2552', 0.62], sun: 0.2, fill: 0.4, pts: { malam: 34 } },
  halte: { bg: null, fog: ['#f2b78a', 18, 60], hemi: ['#ffe0b8', '#4a4468', 0.95], sun: 1.0, sunC: '#ffcf9a', sunP: [4, 3.5, 6], fill: 0.4 },
};

/* ===== character posing ===== */
function resetChar(c, x, z = 0, ry = 0) {
  c.visible = true; c.position.set(x, 0, z); c.rotation.set(0, ry, 0); c.scale.setScalar(1);
  c.userData.head.rotation.set(0, 0, 0); c.userData.head.position.y = c.userData.hy;
  c.userData.legs.forEach(l => l.rotation.set(0, 0, 0)); c.userData.body.scale.set(1, 1, 0.78);
  c.userData.arms.forEach(a => a.piv.rotation.set(0, 0, a.d * 0.05));
  express(c, {});
}
function express(c, { eye = 1, happy = 0, smile = 0.8, open = 0, brow = 0, look = 0, nod = 0, tilt = 0, blink = true, T = 0 }) {
  const u = c.userData; const bl = blink && ((T % 3.4) > 3.28) ? 0.12 : 1; const ey = Math.min(eye, bl) * (1 - 0.82 * happy);
  u.eyes.forEach(({ e, h1, h2 }) => { e.scale.y = 1.45 * Math.max(ey, 0.1); h1.visible = h2.visible = ey > 0.5; });
  u.brows.forEach(({ b, d }) => { b.rotation.z = Math.PI / 2 + d * (0.12 + brow); b.position.y = 0.15 + (happy ? 0.03 : 0) + Math.max(0, -brow) * 0.0; });
  u.smile.scale.set(1, Math.max(0.15, smile), 1); u.mouth.userData.open.scale.set(1, Math.max(0.001, open), 1); u.mouth.userData.open.visible = open > 0.03;
  u.head.rotation.y = look; u.head.rotation.x = nod; u.head.rotation.z = tilt;
}
function sit(c, on = true) { c.userData.legs.forEach(l => l.rotation.x = on ? -1.45 : 0); }
function idle(c, T, amp = 1) { const b = Math.sin(T * 2.2 + (c === nadia ? 1 : 0)) * 0.012 * amp; c.userData.head.position.y = c.userData.hy + b; c.userData.body.scale.y = 1 + b * 1.0; }
const speak = (T, a, b) => (T > a && T < b) ? 0.15 + 0.7 * Math.abs(Math.sin(T * 13)) : 0;
function camSet(px, py, pz, lx, ly, lz) { cam.position.set(px, py, pz); cam.lookAt(lx, ly, lz); cam.updateMatrixWorld(true); }
function gl() { scene.updateMatrixWorld(true); renderer.render(scene, cam); X.drawImage(GLC, 0, 0); }
function ringAnim(T) { rings.forEach(p => { const k = ((T * 0.9 + p.k * 0.5 + p.x) % 1 + 1) % 1; p.ring.scale.set(p.r * (0.3 + k * 1.2) * 1.4, p.r * (0.3 + k * 1.2), 1); p.ring.material.opacity = 0.5 * (1 - k); }); }
function hideAll() { raka.visible = nadia.visible = false; umb.visible = false; drips.visible = false; }

/* ===== scenes ===== */
function sHook(T) {
  look('hook', LOOKS.hook); hideAll(); updateRain(T, 0); ringAnim(T);
  const push = pr(T, 0, 8); camSet(lerp(0.2, 0, push), lerp(1.9, 1.7, push), lerp(12.0, 10.2, push), 0, 1.4, 0);
  resetChar(raka, -1.0); resetChar(nadia, 1.0);
  idle(raka, T); idle(nadia, T);
  express(raka, { smile: 0.7, look: 0.55, T }); express(nadia, { happy: T > 1.4 ? 0.7 : 0, smile: 0.9, open: 0, look: -0.12, T });
  gl();
  const dk = 1 - prog(T, 1.0, 2.0); if (dk > 0) { X.fillStyle = `rgba(6,9,22,${0.92 * dk})`; X.fillRect(0, 0, W, H); }
  const pop = easeBack(prog(T, 0, 0.5)); const bigA = 1 - prog(T, 1.3, 2.1);
  if (bigA > 0) { X.save(); X.translate(540, 940); X.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop); text('3', 0, 80, { font: `400 520px ${SERIF}`, color: COL.champagne, alpha: bigA }); text('TAHUN', 0, 190, { font: `600 70px ${UI}`, color: COL.ivory, alpha: bigA, spacing: 22 }); X.restore(); }
  const hv = fadeIO(T, 1.8, 5.8, 0.4);
  if (hv > 0) {
    const a = proj(headPos(raka, 0.75)), b = proj(headPos(nadia, 0.75));
    for (let i = 0; i < 4; i++) { const k = ((T * 0.3 + i / 4) % 1); heart(lerp(a.x, b.x, k), lerp(a.y, b.y, k) - Math.sin(k * Math.PI) * 140, 0.5 + 0.12 * Math.sin(T * 5 + i), '#ff6b8b', hv * Math.sin(k * Math.PI)); }
    glow(a.x, a.y + 40, 150, 'rgba(255,107,139,0.35)', hv * (0.6 + 0.4 * Math.sin(T * 5)));
  }
  const bq = fadeIO(T, 4.3, 7.4, 0.4);
  if (bq > 0) { const p = proj(headPos(nadia, 0.7)); bubble(clampv(p.x - 190, 30, W - 410), p.y - 290, 380, 150, ['Sahabat.'], { tail: [p.x, p.y - 100], think: true, a: bq, font: `italic 64px ${SERIF}` }); }
}
function sHujan(T) {
  look('hujan', LOOKS.hujan); hideAll(); drips.visible = true; umb.visible = true;
  const inten = clampv((T - 7.8) / 1.4) * 0.9 + 0.1; updateRain(T, inten, true); ringAnim(T);
  const push = pr(T, 7.6, 22.8); camSet(lerp(0.3, 0.05, push), lerp(2.2, 1.95, push), lerp(10.2, 8.4, push), 0, lerp(1.7, 1.6, push), 0);
  resetChar(raka, 0.75); const nx = lerp(-3.4, -0.5, eo(pr(T, 14.0, 15.2))); resetChar(nadia, nx, 0.1);
  const uk = eo(pr(T, 10.3, 11.1)); umb.scale.setScalar(Math.max(0.001, uk)); umb.position.set(0.16, 1.58, 0); umb.rotation.set(0, 0, 0.26 + Math.sin(T * 1.3) * 0.01);
  raka.userData.arms.find(a => a.d === -1).piv.rotation.z = -Math.PI * 0.85 * uk;
  idle(raka, T); idle(nadia, T);
  const walking = T > 14.0 && T < 15.3; const wk = walking ? Math.sin(T * 11) * 0.45 : 0; nadia.userData.legs[0].rotation.x = wk; nadia.userData.legs[1].rotation.x = -wk;
  nadia.userData.arms.forEach(a => a.piv.rotation.z = a.d * 0.12 + (walking ? Math.sin(T * 11) * 0.3 * a.d : 0));
  const laugh = (T > 15.4 && T < 17.0) ? 1 : 0;
  express(raka, { smile: T > 20.4 ? 0.45 : 0.75, look: T > 15 ? -0.28 : 0, brow: T > 20.4 ? 0.12 : 0, T });
  express(nadia, { happy: laugh ? 0.85 : 0.25, smile: 0.95, open: laugh * (0.4 + 0.5 * Math.abs(Math.sin(T * 10))), look: 0.15, tilt: laugh * Math.sin(T * 7) * 0.05, T });
  const wet = pr(T, 18.2, 19.8); drips.visible = wet > 0;
  drips.children.forEach((d, i) => { const k = ((T * 1.2 + i * 0.33) % 1); d.position.set(1.12 + i * 0.02, 0.62 - k * 0.55, 0.05); d.visible = wet > 0 && T > 18.2; });
  gl();
  const an = fadeIO(T, 12.4, 14.0, 0.3); if (an > 0) pill(540, 470, 'muat untuk satu orang', { a: an, w: 700, font: `italic 46px ${SERIF}` });
  const hl = fadeIO(T, 18.3, 20.3, 0.35); if (hl > 0) { const p = proj(new THREE.Vector3(1.1, 0.95, 0.1)); X.save(); X.strokeStyle = `rgba(255,214,150,${0.9 * hl})`; X.lineWidth = 7; X.setLineDash([22, 14]); X.lineDashOffset = -T * 40; X.beginPath(); X.ellipse(p.x, p.y, 120, 170, 0.2, 0, 6.283); X.stroke(); X.restore(); }
  const sd = fadeIO(T, 20.6, 22.6, 0.4); if (sd > 0) { const p = proj(headPos(raka, 0.7)); const n = Math.floor(((T - 20.6) * 2.2) % 4); text('.'.repeat(n), p.x + 150, p.y - 60, { font: `700 120px ${UI}`, color: COL.ivory, alpha: sd }); }
}
function tomatoNo(x, y, a) {
  X.save(); X.globalAlpha *= a; X.fillStyle = '#d64545'; X.beginPath(); X.arc(x, y, 42, 0, 6.283); X.fill();
  X.fillStyle = '#4c9a3a'; X.beginPath(); X.moveTo(x - 20, y - 36); X.lineTo(x, y - 54); X.lineTo(x + 20, y - 36); X.lineTo(x, y - 28); X.closePath(); X.fill();
  X.strokeStyle = '#fff'; X.lineWidth = 9; X.lineCap = 'round'; X.beginPath(); X.moveTo(x - 58, y + 58); X.lineTo(x + 58, y - 58); X.stroke();
  X.strokeStyle = '#e03a3a'; X.lineWidth = 4; X.beginPath(); X.arc(x, y, 66, 0, 6.283); X.stroke(); X.restore();
}
function sKantin(T) {
  look('kantin', LOOKS.kantin); hideAll(); updateRain(T, 0);
  const push = pr(T, 22.8, 47); camSet(lerp(0, 0.1, push), lerp(1.9, 1.75, push), lerp(11.6, 10.0, push), 0, 1.15, 0);
  resetChar(raka, -0.72, -0.1); resetChar(nadia, 0.72, -0.1); sit(raka); sit(nadia); idle(raka, T); idle(nadia, T);
  raka.userData.arms.forEach(a => a.piv.rotation.set(-1.05, 0, a.d * 0.12)); nadia.userData.arms.forEach(a => a.piv.rotation.set(-1.05, 0, a.d * 0.12));
  const g1 = eo(pr(T, 25.3, 25.9)), p1 = eo(pr(T, 27.7, 28.3));
  kItems.glass.visible = g1 > 0; kItems.glass.scale.setScalar(Math.max(0.001, g1)); kItems.glass.position.y = 0.93 + (1 - g1) * 0.35;
  kItems.plate.visible = p1 > 0; kItems.plate.scale.setScalar(Math.max(0.001, p1)); kItems.plate.position.y = 0.93 + (1 - p1) * 0.35;
  const nsmile = T > 34.6 && T < 39 ? 1 : 0; const rlaugh = T > 39.1 && T < 40.5 ? 1 : 0; const nsay = speak(T, 35.9, 38.7);
  express(nadia, { happy: nsmile ? 0.5 : 0.2, smile: 0.95, open: Math.max(nsay, 0), look: -0.2, T });
  express(raka, { happy: rlaugh ? 0.85 : 0, smile: 0.8, open: rlaugh * (0.4 + 0.5 * Math.abs(Math.sin(T * 10))), look: 0.28, T: T + 1 });
  gl();
  const dim = prog(T, 40.6, 41.4) * 0.5;
  if (dim > 0) { const p = proj(headPos(raka, 0)); const gr = X.createRadialGradient(p.x, p.y, 200, p.x, p.y, 1100); gr.addColorStop(0, 'rgba(25,10,10,0)'); gr.addColorStop(1, `rgba(25,10,10,${dim * 1.6})`); X.fillStyle = gr; X.fillRect(0, 0, W, H); }
  const gp = proj(new THREE.Vector3(0.18, 0.9, 0.85)), pp = proj(new THREE.Vector3(0.98, 0.9, 0.9));
  const la = fadeIO(T, 25.8, 28.0, 0.35); if (la > 0) { X.save(); X.globalAlpha = la; X.fillStyle = '#fff'; rr(gp.x - 40, 1640, 80, 80, 12); X.fill(); X.strokeStyle = '#e03a3a'; X.lineWidth = 10; X.lineCap = 'round'; X.beginPath(); X.moveTo(gp.x - 60, 1740); X.lineTo(gp.x + 60, 1620); X.stroke(); X.restore(); text('tanpa gula', gp.x, 1800, { font: `italic 44px ${SERIF}`, color: COL.ivory, alpha: la }); }
  const ta = fadeIO(T, 28.6, 31.2, 0.35); if (ta > 0) { tomatoNo(pp.x, 1680, ta); text('tanpa tomat', pp.x, 1800, { font: `italic 44px ${SERIF}`, color: COL.ivory, alpha: ta }); }
  const na = fadeIO(T, 26.6, 30.4, 0.35); if (na > 0) { const p = proj(headPos(nadia, 0.85)); pill(p.x, p.y, 'untuk Nadia', { w: 340, h: 66, bg: 'rgba(255,107,139,0.92)', ink: '#fff', font: `600 34px ${UI}`, a: na }); }
  const sa2 = fadeIO(T, 30.9, 34.4, 0.4);
  if (sa2 > 0) { for (let i = 0; i < 3; i++) { const k = easeBack(prog(T, 31.0 + i * 0.3, 31.4 + i * 0.3)); X.save(); X.translate(380 + i * 160, 1660); X.scale(k, k); X.strokeStyle = '#a5f0bd'; X.lineWidth = 16; X.lineCap = 'round'; X.globalAlpha = sa2; X.beginPath(); X.moveTo(-40, 0); X.lineTo(-10, 34); X.lineTo(46, -40); X.stroke(); X.restore(); }
    text('3 tahun, tak pernah salah', 540, 1800, { font: `italic 56px ${SERIF}`, color: COL.ivory, alpha: sa2 }); }
  const q = fadeIO(T, 35.4, 39.0, 0.35);
  if (q > 0) { const p = proj(headPos(nadia, 0.8)); bubble(clampv(p.x - 240, 30, W - 510), 410, 480, 230, ['"Kamu tuh, kayak', 'buku catatan berjalan."'].map((s, i) => i === 0 ? typed(s, T, 35.9, 37.0) : typed(s, T, 37.0, 38.5)), { tail: [clampv(p.x, 120, 960), 700], a: q, font: `italic 44px ${SERIF}` }); }
  const th = fadeIO(T, 41.0, 46.9, 0.4);
  if (th > 0) { const p = proj(headPos(raka, 0.8)); const bx = clampv(p.x - 250, 30, W - 560), by = 400;
    bubble(bx, by, 520, 270, ['"Aku ingat', 'semuanya,', 'karena itu kamu."'].map((s, i) => typed(s, T, 44.0 + i * 0.8, 44.9 + i * 0.8)), { tail: [clampv(p.x, 120, 960), 740], a: th, think: true, font: `italic 44px ${SERIF}`, lh: 60, color: '#fff0f3' });
    heart(bx + 490, by + 10, 0.5 + 0.06 * Math.sin(T * 6), '#ff6b8b', th); }
}
function sMalam(T) {
  look('malam', LOOKS.malam); hideAll(); updateRain(T, 0);
  camSet(0.1, 2.7, 11.0, 0.05, 0.75, 0.5);
  resetChar(raka, -0.95, 0.3, 0.35); sit(raka); raka.position.y = -0.42; idle(raka, T, 0.6);
  raka.userData.arms.forEach(a => a.piv.rotation.set(-1.15, 0, a.d * 0.2));
  const down = prog(T, 47.6, 48.6) * 0.38 - (T > 58.4 ? 0.2 * prog(T, 58.4, 59.2) : 0);
  const sad = T > 57.4 && T < 58.3 ? 1 : 0;
  express(raka, { smile: sad ? 0.3 : 0.55, brow: sad ? 0.25 : 0.05, nod: down, look: 0.5, T });
  hideAll(); raka.visible = true;
  const lift = eo(pr(T, 48.7, 50.3)); const lid = mTin.lid; lid.position.set(lift * 0.95, 0.66 - lift * 0.62 + Math.sin(Math.PI * lift) * 0.7, lift * 0.25); lid.rotation.set(0, 0, -Math.sin(Math.PI * lift) * 0.5);
  const ca = eo(pr(T, 51.6, 52.9)), ba = eo(pr(T, 53.1, 54.5));
  mTin.coins.visible = ca > 0; mTin.coins.scale.setScalar(Math.max(0.001, ca)); mTin.bills.visible = ba > 0; mTin.bills.scale.setScalar(Math.max(0.001, ba));
  mTin.tin.position.y = T > 55.3 && T < 57.2 ? Math.abs(Math.sin((T - 55.3) * 7)) * 0.03 : 0;
  gl();
  const bar = fadeIO(T, 55.2, 61.4, 0.4);
  if (bar > 0) { const fillK = lerp(0.18, 0.62, eo(pr(T, 55.3, 57.2)));
    X.save(); X.globalAlpha = bar; X.fillStyle = 'rgba(255,255,255,0.14)'; rr(140, 1640, 800, 54, 27); X.fill();
    const flash = T > 57.4 && T < 58.3 ? 0.5 + 0.5 * Math.sin((T - 57.4) * 24) : 0;
    X.fillStyle = flash > 0.5 ? '#ff7a6b' : '#e2b44a'; rr(140, 1640, 800 * fillK, 54, 27); X.fill();
    X.strokeStyle = COL.ivory; X.lineWidth = 4; X.setLineDash([10, 8]); X.beginPath(); X.moveTo(940, 1618); X.lineTo(940, 1716); X.stroke(); X.setLineDash([]);
    text('tabungan', 140, 1610, { font: `500 34px ${UI}`, color: COL.mist, align: 'left' }); text('kado Nadia', 940, 1610, { font: `500 34px ${UI}`, color: COL.mist, align: 'right' });
    if (T > 57.4) text('belum cukup', 540, 1790, { font: `italic 52px ${SERIF}`, color: '#ff9d8f', alpha: prog(T, 57.4, 57.8) }); X.restore(); }
  const ck = eo(pr(T, 58.5, 59.3)); const cOut = 1 - prog(T, 61.0, 61.5);
  if (ck > 0 && cOut > 0) { X.save(); X.globalAlpha = Math.min(ck, cOut); X.translate(790, 640 + (1 - ck) * 80); X.shadowColor = 'rgba(0,0,0,0.5)'; X.shadowBlur = 30; X.fillStyle = '#f6f0e4'; rr(-190, -170, 380, 380, 28); X.fill(); X.shadowBlur = 0;
    X.fillStyle = '#d64545'; X.beginPath(); X.moveTo(-190, -142); X.arcTo(-190, -170, -162, -170, 28); X.lineTo(162, -170); X.arcTo(190, -170, 190, -142, 28); X.lineTo(190, -90); X.lineTo(-190, -90); X.closePath(); X.fill();
    text('ULANG TAHUN NADIA', 0, -112, { font: `600 26px ${UI}`, color: '#fff', spacing: 3 }); text(T < 59.6 ? '8' : '7', 0, 100, { font: `400 230px ${SERIF}`, color: '#2a2318' }); text('hari lagi', 0, 168, { font: `italic 44px ${SERIF}`, color: '#6a5a40' }); X.restore(); }
}
function sHalte(T) {
  look('halte', LOOKS.halte); hideAll(); raka.visible = nadia.visible = true;
  const rin = (1 - pr(T, 61.4, 64.8)) * 0.8; updateRain(T, Math.max(0, rin), 'halte');
  const z1 = prog(T, 80.2, 82.6) * 0.85;
  camSet(lerp(0, 0.45, z1), lerp(1.65, 1.95, z1), lerp(8.4, 5.2, z1), lerp(0, 0.7, z1), lerp(1.3, 1.8, z1), 0);
  resetChar(nadia, -0.72, 0.05); resetChar(raka, 0.72, 0.05); sit(raka); sit(nadia);
  const frozen = T > 77.4; if (!frozen) { idle(raka, T); idle(nadia, T); }
  raka.userData.arms.forEach(a => a.piv.rotation.set(-0.6, 0, a.d * 0.1)); nadia.userData.arms.forEach(a => a.piv.rotation.set(-0.4, 0, a.d * 0.12));
  const ua = eo(pr(T, 62.6, 63.4)); hObj.um.visible = ua > 0; hObj.um.scale.setScalar(Math.max(0.001, ua));
  hObj.rb.children.forEach(t => t.material.opacity = fadeIO(T, 65.4, 80.0, 1.2) * 0.4);
  const gaze = pr(T, 66.2, 66.9) * (1 - pr(T, 70.5, 71.2)); const spk = speak(T, 71.04, 76.9);
  const sp2 = (T > 71.04 && T < 76.9) ? (0.15 + 0.6 * Math.abs(Math.sin(T * 12))) * (T % 2.9 < 2.4 ? 1 : 0.1) : 0;
  express(nadia, { smile: 0.7, open: sp2, look: lerp(0.0, 0.3, Math.max(gaze, (T > 70.9 && T < 77.4) ? 1 : 0)), nod: 0.35 * gaze, T });
  const sh = frozen && T < 80 ? Math.sin(T * 50) * 0.01 : 0; raka.position.x = 0.72 + sh;
  express(raka, { smile: frozen ? 0.1 : 0.7, open: frozen ? 0.5 : 0, brow: frozen ? 0.35 : 0, eye: frozen ? 1.25 : 1, look: frozen ? 0 : -0.25, T });
  gl();
  const sp = fadeIO(T, 70.9, 77.0, 0.35);
  if (sp > 0) { const L = ['"Ka. Aku tahu,', 'bahu kiri kamu selalu basah.', 'Kamu kenapa sih,', 'selalu ada buat aku?"']; const tm = [[71.04, 71.5], [71.68, 74.28], [74.48, 75.5], [75.6, 76.9]]; const p = proj(headPos(nadia, 0.8));
    bubble(60, 320, 960, 330, L.map((s, i) => typed(s, T, tm[i][0], tm[i][1])), { tail: [clampv(p.x, 140, 900), Math.min(p.y - 140, 720)], a: sp, font: `italic 50px ${SERIF}`, lh: 70 }); }
  const fz = prog(T, 77.4, 78.2);
  if (fz > 0) { X.fillStyle = `rgba(150,200,255,${0.3 * fz})`; X.fillRect(0, 0, W, H); vignette(0.55 * fz, '120,180,255');
    X.save(); X.globalAlpha = fz; X.strokeStyle = 'rgba(255,255,255,0.8)'; X.lineWidth = 4; for (const [fx, fy] of [[60, 60], [1020, 60], [60, 1860], [1020, 1860]]) for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3; X.beginPath(); X.moveTo(fx, fy); X.lineTo(fx + Math.cos(an) * 90, fy + Math.sin(an) * 90); X.stroke(); } X.restore();
    const p = proj(headPos(raka, 0.8)); text('...', p.x, p.y - 80, { font: `700 130px ${UI}`, color: '#fff', alpha: fz * (0.5 + 0.5 * Math.sin(T * 5)) * (1 - prog(T, 80.2, 80.8)) }); }
  const qa = fadeIO(T, 80.2, 83.2, 0.4);
  if (qa > 0) { vignette(0.45 * qa); const p = proj(headPos(raka, 0.95)); text('?', p.x, p.y - 20, { font: `400 520px ${SERIF}`, color: COL.champagne, alpha: 0.95 * qa }); glow(p.x, p.y - 160, 380, 'rgba(216,195,154,0.35)', qa); }
}
const SC = [
  { a: 0, b: 7.6, fn: sHook }, { a: 7.6, b: 22.8, fn: sHujan }, { a: 22.8, b: 47.0, fn: sKantin },
  { a: 47.0, b: 61.4, fn: sMalam }, { a: 61.4, b: 83.0, fn: sHalte }, { a: 83.0, b: 110.2, fn: sVote }, { a: 110.2, b: S_END, fn: sPromo },
];
function drawFrame(T) {
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  for (let i = 0; i < SC.length; i++) {
    const s = SC[i]; if (T < s.a - FADE || T > s.b + FADE) continue;
    let a = 1; if (i > 0 && T < s.a + FADE) a = prog(T, s.a - FADE, s.a + FADE); if (i < SC.length - 1 && T > s.b - FADE) a = Math.min(a, 1 - prog(T, s.b - FADE, s.b + FADE));
    if (a <= 0) continue; X.save(); X.globalAlpha = a; s.fn(T); X.restore();
  }
  if (T < 0.2) { X.fillStyle = `rgba(0,0,0,${1 - T / 0.2})`; X.fillRect(0, 0, W, H); }
  if (T > S_END - 0.6) { X.fillStyle = `rgba(0,0,0,${prog(T, S_END - 0.6, S_END)})`; X.fillRect(0, 0, W, H); }
}
window.render = (T) => { drawFrame(T); caption(T); };
window.renderBoth = (T, q = 0.93) => { drawFrame(T); const nosub = C.toDataURL('image/jpeg', q).split(',')[1]; caption(T); const sub = C.toDataURL('image/jpeg', q).split(',')[1]; return { sub, nosub }; };
window.DURATION = S_END;
window.ready = Promise.resolve(true);
