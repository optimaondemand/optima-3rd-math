# Bach Invention No. 1 in C, BWV 772, played with a soft harpsichord-like pluck from the Mutopia Project MIDI
# (public domain, via Wikimedia Commons "Bach - Invention 01.mid"). Run from the repo root: python tools/storybook/harpsi1004.py
import mido, numpy as np, scipy.io.wavfile as wf
m = mido.MidiFile('tools/storybook/src1004/bwv772-mutopia.mid')
SR = 44100; QPM = 72; tpb = m.ticks_per_beat; spt = 60 / QPM / tpb
notes = []
for ti, t in enumerate(m.tracks):
    now = 0; on = {}
    for x in t:
        now += x.time
        if x.type == 'note_on' and x.velocity > 0: on[x.note] = now
        elif x.type in ('note_off', 'note_on') and x.note in on:
            notes.append((on.pop(x.note) * spt, now * spt, x.note, ti))
end = max(e for _, e, _, _ in notes) + 3
out = np.zeros(int(end * SR) + SR)
rng = np.random.default_rng(1723)
for s, e, n, ti in notes:
    f = 440 * 2 ** ((n - 69) / 12)
    ring = min(2.2, max(0.35, (e - s) + 0.5))   # the string rings a little past the note, then the damper falls
    N = int(ring * SR); tt = np.arange(N) / SR
    sig = np.zeros(N)
    for k in range(1, 14):
        fk = f * k
        if fk > 11000: break
        a = (1 / k ** 0.9) * (0.6 + 0.4 * np.sin(k * 1.7))          # plucked near the end: bright, uneven harmonics
        sig += a * np.exp(-tt * (1.2 + 0.55 * k * f / 440)) * np.sin(2 * np.pi * fk * tt + rng.uniform(0, 6.28))
    att = np.minimum(1, tt / 0.003)
    damp = np.ones(N); off = int((e - s) * SR)
    if off < N: damp[off:] = np.exp(-(tt[off:] - tt[off]) / 0.06)
    g = 0.15 if ti == 1 else 0.17
    i = int(s * SR); out[i:i + N] += g * att * damp * sig
rev = out.copy()
for d, a in ((0.023, .22), (0.041, .18), (0.067, .14), (0.109, .1), (0.173, .07), (0.251, .05)):
    k = int(d * SR); rev[k:] += a * out[:-k]
rev /= np.abs(rev).max() * 1.12
wf.write('bwv772.wav', SR, (rev * 32767).astype(np.int16))
print(round(end, 1), 's')
