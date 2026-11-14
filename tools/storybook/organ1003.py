import mido, numpy as np, scipy.io.wavfile as wf, sys
m = mido.MidiFile('tools/storybook/src1003/bwv645.mid')
SR = 44100; QPM = 66; tpb = m.ticks_per_beat; spt = 60/QPM/tpb
notes = {}
for ti, t in enumerate(m.tracks):
    now = 0; on = {}
    for x in t:
        now += x.time
        if x.type == 'note_on' and x.velocity > 0: on[x.note] = now
        elif x.type in ('note_off', 'note_on') and x.note in on:
            notes.setdefault(ti, []).append((on.pop(x.note) * spt, now * spt, x.note))
end = max(e for v in notes.values() for _, e, _ in v) + 3
out = np.zeros(int(end * SR) + SR)
# voices: (harmonic amplitudes, gain, octave shift list)
V = {1: ([1, .5, .25, .12, .06], .16, [0]),            # upper: flute 8'
     2: ([1, .7, .55, .4, .3, .2, .12], .20, [0]),     # lower: the chorale, reedier
     3: ([1, .45, .2, .08], .22, [0, -12])}            # pedal 16' + 8'
for ti, (H, g, octs) in V.items():
    for s, e, n in notes.get(ti, []):
        dur = max(0.05, e - s - 0.02); N = int(dur * SR); tt = np.arange(N) / SR
        env = np.minimum(1, np.minimum(tt / 0.02, (dur - tt) / 0.05).clip(0))
        sig = np.zeros(N)
        for o in octs:
            f = 440 * 2 ** ((n + o - 69) / 12)
            for k, a in enumerate(H, 1):
                if f * k < 9000: sig += a * np.sin(2 * np.pi * f * k * tt + k)
        sig *= (1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt))  # gentle tremulant-ish
        i = int(s * SR); out[i:i + N] += g * env * sig
# soft room: a few decaying echoes
rev = out.copy()
for d, a in ((0.029, .25), (0.047, .2), (0.083, .15), (0.131, .1), (0.197, .07)):
    k = int(d * SR); rev[k:] += a * out[:-k]
rev /= np.abs(rev).max() * 1.12
wf.write('bwv645.wav', SR, (rev * 32767).astype(np.int16))
print(round(end, 1), 's')
