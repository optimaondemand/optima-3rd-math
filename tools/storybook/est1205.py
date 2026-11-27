# Estimated timeline for the 3.12.05 Learn video review cut (no audio yet: Q4, voice later).
# Pace matched to the voiced 3.12.01 video (about 0.39 s per word with pauses). Replace with the Scribe timeline when voiced.
import json
secs = {
 "vid-open": "Hoo! Claire is sorting triangles. Every triangle gets two names!",
 "vid-math": ["First, look at the sides. These three rods are the same length, so this triangle is equilateral. This one has two sides the same, so it's isosceles. This one has no sides the same. It's scalene.",
  "Tick marks show which sides are equal. Sides with the same marks are the same length. An equilateral triangle has at least two equal sides, so it's isosceles, too.",
  "Now check the angles with a set square. If one angle is a square corner, it's a right triangle. If one angle is bigger than a square corner, it's obtuse. If all three angles are smaller, it's acute.",
  "So every triangle gets two names, one for its sides and one for its angles. This triangle is isosceles and right.",
  "Watch out! Size doesn't change the name. A big triangle and a tiny one can have the same angles, so they get the same names."],
 "vid-close": "Count the sides, check the corners, and give two names. Now it's your turn!"}
WD, SENT, COMMA, SECT = 0.33, 0.28, 0.1, 0.6
def words(text, t):
    out = []
    for w in text.split():
        out.append({"w": w, "t": round(t, 3), "e": round(t + WD * .85, 3)}); t += WD
        if w[-1] in '.!?': t += SENT
        elif w[-1] in ',:': t += COMMA
    return out, t
tl = {"secs": {}, "estimated": True}; t = 0.8
w, t = words(secs['vid-open'], t); tl['secs']['vid-open'] = {"start": 0.8, "words": w}; t += 1.2
st = t; ms = []
for s in secs['vid-math']:
    w, t = words(s, t); ms += w; t += SECT
tl['secs']['vid-math'] = {"start": round(st, 3), "words": ms}; t += 0.6
cs = t; w, t = words(secs['vid-close'], t); tl['secs']['vid-close'] = {"start": round(cs, 3), "words": w}
tl['total'] = round(t + 1.5, 3)
json.dump(tl, open('timeline-3-12-05-est.json', 'w'))
print('total', tl['total'], 'math', round(st, 1), 'close', round(cs, 1))
