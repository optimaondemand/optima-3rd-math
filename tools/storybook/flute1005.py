# Bach, Coffee Cantata BWV 211, aria "Ei! wie schmeckt der Coffee süße": measures 1-51 + the cadence chord of 52
# (opening ritornello and Lieschen's first section), from Michel Rondeau's arrangement on IMSLP (#423263,
# CC BY-SA 4.0; score file in tools/storybook/src1005/). The flute part plays on a soft flute sound; Lieschen's tune
# and the low part play on the harpsichord-like pluck from harpsi1004.py. Eighth = 120.
# Run from the repo root: python tools/storybook/flute1005.py   (needs music21, numpy, scipy)
from music21 import converter
import numpy as np, scipy.io.wavfile as wf
s = converter.parse('tools/storybook/src1005/BacBWV211a4Sco.xml').stripTies()
SR = 44100; SPQ = 1.0; LAST = 51 * 1.5   # quarters
notes = []   # (start s, end s, midi, kind)
for pi, kind in ((0, 'tune'), (1, 'flute'), (2, 'bass')):
    for n in s.parts[pi].flatten().notes:
        o = float(n.getOffsetInHierarchy(s.parts[pi]))
        if o > LAST + 1e-6: continue
        d = float(n.quarterLength)
        if o >= LAST - 1e-6: d = 3.0           # the cadence chord on the downbeat of measure 52 rings out
        for p in n.pitches: notes.append((o * SPQ, (o + d) * SPQ, p.midi, kind))
end = max(e for _, e, _, _ in notes) + 2.5
out = np.zeros(int(end * SR) + SR); rng = np.random.default_rng(1734)
def harpsi(f, dur, g):
    ring = min(2.2, max(0.35, dur + 0.5)); N = int(ring * SR); tt = np.arange(N) / SR; sig = np.zeros(N)
    for k in range(1, 14):
        fk = f * k
        if fk > 11000: break
        a = (1 / k ** 0.9) * (0.6 + 0.4 * np.sin(k * 1.7))
        sig += a * np.exp(-tt * (1.2 + 0.55 * k * f / 440)) * np.sin(2 * np.pi * fk * tt + rng.uniform(0, 6.28))
    att = np.minimum(1, tt / 0.003); damp = np.ones(N); off = int(dur * SR)
    if off < N: damp[off:] = np.exp(-(tt[off:] - tt[off]) / 0.06)
    return g * att * damp * sig
def flute(f, dur, g):
    N = int((dur + 0.08) * SR); tt = np.arange(N) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt) * np.minimum(1, tt / 0.35)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    sig = np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.07 * np.sin(3 * ph) + 0.02 * np.sin(4 * ph)
    breath = rng.normal(0, 1, N); breath = np.convolve(breath, np.ones(30) / 30, 'same') * 0.05
    env = np.minimum(1, tt / 0.045) * np.minimum(1, np.maximum(0, (dur + 0.08 - tt)) / 0.06)
    return g * env * (sig + breath * np.minimum(1, tt / 0.03) * np.exp(-tt * 6) * 3)
for st, en, m, kind in notes:
    f = 440 * 2 ** ((m - 69) / 12); d = en - st
    sig = flute(f, d, 0.16) if kind == 'flute' else harpsi(f, d, 0.15 if kind == 'tune' else 0.17)
    i = int(st * SR); out[i:i + len(sig)] += sig
rev = out.copy()
for dl, a in ((0.023, .22), (0.041, .18), (0.067, .14), (0.109, .1), (0.173, .07), (0.251, .05)):
    k = int(dl * SR); rev[k:] += a * out[:-k]
rev /= np.abs(rev).max() * 1.12
wf.write('bwv211.wav', SR, (rev * 32767).astype(np.int16)); print(round(end, 1), 's')
