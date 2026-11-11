import numpy as np, wave
SR = 44100; DUR = 164.9; N = int(SR * DUR)
Lc = np.zeros(N); Rc = np.zeros(N); rng = np.random.default_rng(4)
def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    sig = sig[:N - i]
    Lc[i:i + len(sig)] += sig * g * (1 - max(0, pan)); Rc[i:i + len(sig)] += sig * g * (1 + min(0, pan))
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def pluck(m, dur=1.4, br=1.0):
    n = int(SR * dur); t = np.arange(n) / SR; f = mtof(m)
    s = np.sin(2*np.pi*f*t) + 0.3*br*np.sin(2*np.pi*2*f*t)*np.exp(-t*3) + 0.1*br*np.sin(2*np.pi*3*f*t)*np.exp(-t*5)
    return s * env(n, 0.004, dur/3.0)
def pad(m, dur, a=2.0):
    n = int(SR * dur); t = np.arange(n) / SR; f = mtof(m); s = 0
    for det in (-0.12, 0.0, 0.12):
        ff = f * 2 ** (det / 12); s = s + np.sin(2*np.pi*ff*t) + 0.25*np.sin(2*np.pi*2*ff*t)
    return s * np.minimum(1, t / a) * np.minimum(1, (dur - t) / a) / 3
def noise_bp(n, lo, hi):
    x = rng.standard_normal(n); X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1/SR); X[(fr < lo) | (fr > hi)] = 0
    y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)
def ping(f, dur=0.8, br=1.0):
    n = int(SR*dur); t = np.arange(n)/SR; return (np.sin(2*np.pi*f*t) + 0.5*br*np.sin(2*np.pi*2.76*f*t)*np.exp(-t*8)) * env(n, 0.002, dur/4)
def thump(f=58, dur=0.28):
    n = int(SR*dur); t = np.arange(n)/SR; return np.sin(2*np.pi*(f*(1+0.8*np.exp(-t*25)))*t) * np.exp(-t*14)
def tick(f=1800, dur=0.12):
    n = int(SR*dur); t = np.arange(n)/SR; return (np.sin(2*np.pi*f*t) * np.exp(-t*60) + 0.4*noise_bp(n, 1500, 6000) * np.exp(-t*80))
def whoosh(dur=0.5, lo=400, hi=3000): n = int(SR*dur); return noise_bp(n, lo, hi) * np.sin(np.linspace(0, np.pi, n)) ** 2
def sweep(f0, f1, dur, vib=0.0):
    n = int(SR*dur); t = np.arange(n)/SR; f = np.linspace(f0, f1, n); ph = 2*np.pi*np.cumsum(f)/SR + vib*np.sin(2*np.pi*7*t)
    s = np.sin(ph) + 0.5*np.sin(2*ph) + 0.3*np.sin(3*ph); return s * np.sin(np.linspace(0, np.pi, n)) ** 0.6
# ---------- bed ----------
# 0-12.7 tegang rendah (Am)
for m in (33, 45): add(pad(m, 14, 1.5), 0, 0.10 if m == 33 else 0.05)
# 12.7-26.8 gelap: drone cluster + desis dingin
add(pad(29, 15, 2.0), 12.2, 0.16); add(pad(30, 15, 2.0), 12.2, 0.12); add(pad(41, 15, 2.5), 12.2, 0.05)
add(noise_bp(int(SR*14), 3000, 9000) * np.sin(np.linspace(0, np.pi, int(SR*14))) ** 1.5, 12.8, 0.018)
# detak jantung 13-26
tt = 13.4
while tt < 25.6:
    add(thump(58, 0.3), tt, 0.55 if tt < 23 else 0.4); add(thump(52, 0.25), tt + 0.22, 0.32)
    tt += 0.92 - 0.12 * ((tt - 13.4) / 12.2)
# langkah pelan 15.4-19.2
for k, tt in enumerate(np.arange(15.5, 19.1, 0.62)): add(thump(70, 0.2), tt, 0.35 + 0.12 * k)
# sentuhan dingin + hangat
add(whoosh(1.4, 200, 1800), 21.8, 0.05); add(ping(1568, 2.2, 0.6), 23.5, 0.035, 0.2); add(ping(2093, 2.2, 0.6), 23.6, 0.025, -0.2)
# 26.8-37.2 piano tunggal lembut
for k, (m, tt) in enumerate([(57, 27.2), (60, 29.0), (64, 31.0), (62, 33.2), (60, 35.2), (57, 36.6)]): add(pluck(m, 3.0, 0.6), tt, 0.10)
add(pad(45, 11, 2.5), 26.8, 0.10); add(pad(57, 11, 2.5), 26.8, 0.05)
# ---------- progresi hangat (Am F C G) mulai 37 ----------
chords = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]
def gain(t):
    if t < 44: return 0.7
    if t < 70: return 0.85
    if t < 90: return 0.75
    if t < 107: return 0.8
    if t < 116: return 0.6
    if t < 127: return 1.0
    if t < 145: return 0.9
    if t < 156: return 1.0
    return 0.8
t = 37.0; ci = 0
while t < DUR - 1:
    root, tri = chords[ci % 4]
    if t >= 116: root, tri = [(48, [55, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62]), (48, [55, 60, 64])][ci % 4]
    seg = 8.0; g = gain(t)
    add(pad(root, seg + 2), t, 0.17 * g, -0.1)
    for m in tri: add(pad(m, seg + 2), t, 0.07 * g, 0.1 * ((m % 3) - 1))
    arp = (41 <= t < 107) or (t >= 116)
    if arp:
        steps = [tri[0], tri[1], tri[2], tri[1] + 12, tri[2], tri[1], tri[0] + 12, tri[1]]
        for k in range(16):
            tx = t + k * 0.5
            if tx >= DUR - 1: break
            if 70 <= tx < 99 and k % 2 == 1: continue
            add(pluck(steps[k % 8] + (12 if tx >= 116 else 0), 1.3), tx, 0.048 * g * (0.7 + 0.3 * (k % 2)), (k % 3 - 1) * 0.25)
    t += seg; ci += 1
# ---------- SFX ----------
# lilin menyala
add(whoosh(0.5, 1000, 5000), 37.3, 0.06); add(ping(1318, 1.6), 37.5, 0.05)
# struk / kertas
add(whoosh(1.0, 2000, 8000), 44.4, 0.05)
# hantu pengemudi lari: langkah cepat
for k in range(8): add(thump(90, 0.15), 55.0 + k * 0.22, 0.18)
# kursi bergeser
add(noise_bp(int(SR*0.5), 80, 700) * np.sin(np.linspace(0, np.pi, int(SR*0.5))), 59.0, 0.18)
# sendok + piring
for tt in (66.2, 68.6): add(ping(2600, 0.3, 0.8), tt, 0.05)
# kalender
for k in range(6): add(whoosh(0.18, 800, 4000), 80.5 + k * 0.28, 0.06)
# bus pergi
add(noise_bp(int(SR*3.5), 60, 500) * np.sin(np.linspace(0, np.pi, int(SR*3.5))), 76.2, 0.10)
# ayam berkokok 107.5-109.2
add(sweep(520, 900, 0.32, 0.5), 107.6, 0.10); add(sweep(780, 640, 0.18), 107.98, 0.09); add(sweep(700, 880, 0.3, 0.8), 108.2, 0.09); add(sweep(850, 560, 0.55, 1.2), 108.55, 0.10)
# tik tik
add(tick(1900), 111.58, 0.30); add(tick(1700), 112.48, 0.30)
for k in range(5): add(tick(1800), 112.85 + k * 0.35, 0.13)
# pintu berderit + cahaya masuk
add(sweep(180, 420, 2.4, 0.2) * 0.5, 113.3, 0.06); add(noise_bp(int(SR*2.4), 300, 2500) * np.sin(np.linspace(0, np.pi, int(SR*2.4))) ** 2, 113.3, 0.035)
for k, f in enumerate([1046, 1318, 1568, 2093]): add(ping(f, 1.8), 114.8 + k * 0.18, 0.05, (k - 1.5) * 0.25)
# hp bergetar
for k in range(4): add(np.sin(2*np.pi*92*np.arange(int(SR*0.22))/SR) * np.sin(np.linspace(0, np.pi, int(SR*0.22))), 127.7 + k * 0.3, 0.18)
add(ping(1568, 0.7), 128.5, 0.05)
for k, f in enumerate([1318, 1568, 1760, 2093, 2637]): add(ping(f, 1.0), 131.6 + k * 0.14, 0.06, (k - 2) * 0.2)
# promo
for k, f in enumerate([1568, 1976, 2349, 2637]): add(ping(f, 0.9), 160.6 + k * 0.09, 0.05, (k - 1.5) * 0.25)
add(ping(1318, 0.8), 162.8, 0.05)
# master fade
fo = np.ones(N); fi = int(2.5*SR); fo[:int(0.5*SR)] = np.linspace(0, 1, int(0.5*SR)); fo[-fi:] = np.linspace(1, 0, fi)
Lc *= fo; Rc *= fo
pk = max(np.abs(Lc).max(), np.abs(Rc).max()); Lc /= pk; Rc /= pk
st = np.stack([Lc, Rc], 1) * 0.85
with wave.open('music4.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', DUR)
