# Estimated timelines for the 3.12.07 review cuts (no audio yet: Q4, voice later).
# Pace matched to the voiced 3.12.01 video (about 0.39 s per word with pauses). Replace with the Scribe
# timelines when the lesson is voiced.  python3 est1207.py
import json

secs = {
 "vid-open": "Hoo! Claire has some paper shapes. Let's fold them and see!",
 "vid-math": [
  "Fold a shape along a line. If the two halves match exactly, the fold is a line of symmetry. Each half is a mirror image of the other.",
  "Some shapes have one line of symmetry. Some have more than one. Some shapes have none at all, so no fold makes the halves match.",
  "A compass draws circles. Set its opening to the radius, then turn it all the way around. The diameter is twice the radius. Open it wider, and the circle gets bigger.",
  "Watch out! Two equal halves don't always make a line of symmetry. Cut a rectangle corner to corner. The halves are the same size, but when you fold, they don't match."
 ],
 "vid-close": "Fold it, check it, and count the lines. Now it's your turn!"
}
WARM = ("Hoo! Here's Euclid's very first problem: draw two circles of the same size with a compass. "
        "Their picture has a fold line where both halves match. Greek builders made their temples match "
        "side to side, too. Today you'll fold shapes to find lines of symmetry.")

WD, SENT, COMMA, SECT = 0.33, 0.28, 0.1, 0.6

def words(text, t):
    out = []
    for w in text.split():
        out.append({"w": w, "t": round(t, 3), "e": round(t + WD * .85, 3)}); t += WD
        if w[-1] in '.!?': t += SENT
        elif w[-1] in ',:': t += COMMA
    return out, t

# Learn video
tl = {"secs": {}, "estimated": True}; t = 0.8
w, t = words(secs['vid-open'], t); tl['secs']['vid-open'] = {"start": 0.8, "words": w}; t += 1.2
st = t; ms = []
for s in secs['vid-math']:
    w, t = words(s, t); ms += w; t += SECT
tl['secs']['vid-math'] = {"start": round(st, 3), "words": ms}; t += 0.6
cs = t; w, t = words(secs['vid-close'], t); tl['secs']['vid-close'] = {"start": round(cs, 3), "words": w}
tl['total'] = round(t + 1.5, 3)
json.dump(tl, open('timeline-3-12-07-est.json', 'w'))
print('learn total', tl['total'], 'math', round(st, 1), 'close', round(cs, 1))

# Warm-Up film (one Opti note, already-written warm-1)
w, t = words(WARM, 0.0)
json.dump({"dur": round(t, 3), "words": w, "estimated": True}, open('warm/w25-est.json', 'w'))
print('warm dur', round(t, 3))
