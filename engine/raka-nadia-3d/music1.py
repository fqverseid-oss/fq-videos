import numpy as np, wave
SR = 44100; DUR = 118.4; N = int(SR * DUR)
Lc = np.zeros(N); Rc = np.zeros(N); rng = np.random.default_rng(11)
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
def pad(m, dur):
    n = int(SR * dur); t = np.arange(n) / SR; f = mtof(m); s = 0
    for det in (-0.12, 0.0, 0.12):
        ff = f * 2 ** (det / 12); s = s + np.sin(2*np.pi*ff*t) + 0.25*np.sin(2*np.pi*2*ff*t)
    a = np.minimum(1, t / 2.0) * np.minimum(1, (dur - t) / 2.0)
    return s * a / 3
def noise_bp(n, lo, hi):
    x = rng.standard_normal(n); X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1/SR); X[(fr < lo) | (fr > hi)] = 0
    y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)
# ---- chord progression (Am F C G), 8 s each, sections set the mood ----
chords = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]
def section_gain(t):
    if t < 7.6: return 0.7
    if t < 22.8: return 0.6
    if t < 47: return 1.0
    if t < 61.4: return 0.55
    if t < 83: return 0.5
    if t < 110.2: return 0.8
    return 0.9
t = 0.0; ci = 0
while t < DUR - 1:
    root, tri = chords[ci % 4]; seg = 8.0
    g = section_gain(t)
    add(pad(root - 12 + 12, seg + 2), t, 0.16 * g, -0.1)
    for m in tri: add(pad(m, seg + 2), t, 0.075 * g, 0.1 * ((m % 3) - 1))
    # soft arpeggio
    if t >= 7.6 and not (47 <= t < 61.4) and not (77 <= t < 83):
        steps = [tri[0], tri[1], tri[2], tri[1] + 12, tri[2], tri[1], tri[0] + 12, tri[1]]
        for k in range(16):
            tt = t + k * 0.5
            if tt >= DUR - 1: break
            add(pluck(steps[k % 8] + (12 if (22.8 <= tt < 47) else 0), 1.3), tt, 0.05 * g * (0.7 + 0.3 * (k % 2)), (k % 3 - 1) * 0.25)
    elif 47 <= t < 61.4:
        for k in range(8): add(pluck(tri[k % 3] + 12, 2.2, 0.6), t + k * 1.0, 0.045, 0.0)
    t += seg; ci += 1
# ---- rain bed ----
def fade_env(n, a, b): x = np.ones(n); fi = int(a*SR); fo = int(b*SR); x[:fi] = np.linspace(0, 1, fi); x[-fo:] = np.linspace(1, 0, fo); return x
def rain(t0, t1, g):
    n = int((t1 - t0) * SR); r = noise_bp(n, 2500, 9000) * fade_env(n, 1.5, 2.0); add(r, t0, g, 0)
rain(7.6, 23.5, 0.08); rain(61.0, 66.5, 0.05)
# ---- sfx ----
def ping(f, dur=0.8, br=1.0):
    n = int(SR*dur); t = np.arange(n)/SR; return (np.sin(2*np.pi*f*t) + 0.5*br*np.sin(2*np.pi*2.76*f*t)*np.exp(-t*8)) * env(n, 0.002, dur/4)
def whoosh(dur=0.5, lo=400, hi=3000): n = int(SR*dur); return noise_bp(n, lo, hi) * np.sin(np.linspace(0, np.pi, n)) ** 2
add(whoosh(0.5, 300, 2500), 10.2, 0.12)                       # umbrella pops open
add(ping(1760, 0.5), 25.3, 0.06); add(ping(2349, 0.4), 25.45, 0.05)   # ice
add(ping(660, 0.35), 27.7, 0.05)                              # plate
for k, f in enumerate([2093, 2637, 3136, 2793, 3520]): add(ping(f, 0.6), 51.6 + k*0.11, 0.05, (k-2)*0.2)  # coins
add(ping(520, 1.2, 1.4), 48.7, 0.08)                          # tin lid
add(whoosh(0.9, 2000, 8000), 53.1, 0.05)                      # paper
add(whoosh(0.25, 800, 4000), 59.5, 0.1)                       # calendar flip
# freeze sting
n = int(SR*2.6); t = np.arange(n)/SR; fz = (np.sin(2*np.pi*55*t) + 0.6*np.sin(2*np.pi*58*t)) * env(n, 0.05, 1.2); add(fz, 77.4, 0.22)
add(ping(3951, 1.8), 77.4, 0.045, 0.3); add(ping(4186, 1.8), 77.5, 0.035, -0.3)
for tt in (83.0, 93.96): add(ping(880, 0.5), tt, 0.07); add(ping(1318, 0.5), tt+0.1, 0.05)
for tt, f in ((104.3, 1046), (106.4, 1318), (110.4, 1568)): add(ping(f, 0.8), tt, 0.06)
for k, f in enumerate([1568, 1976, 2349, 2637]): add(ping(f, 0.9), 114.4 + k*0.09, 0.05, (k-1.5)*0.25)
# gentle master fade
fo = np.ones(N); fi = int(2*SR); fo[:int(0.5*SR)] = np.linspace(0, 1, int(0.5*SR)); fo[-fi:] = np.linspace(1, 0, fi)
Lc *= fo; Rc *= fo
pk = max(np.abs(Lc).max(), np.abs(Rc).max()); Lc /= pk; Rc /= pk
st = np.stack([Lc, Rc], 1) * 0.85
with wave.open('music1.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
print('ok', DUR)
