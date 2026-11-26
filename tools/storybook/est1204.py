# Estimated timeline for the 3.12.04 Learn video review cut (no audio yet: Q4, voice later).
# Pace matched to the voiced 3.12.01 video (about 0.39 s per word with pauses). Replace with the Scribe timeline when voiced.
import json
secs = {
 "vid-open": "Hoo! Claire has three rods. Watch them become a triangle.",
 "vid-math": ["Here are three rods. Join them end to end. Each rod is a side. The sides are straight, and they meet with no gaps, so the shape is closed. That's a triangle.",
  "A triangle has three sides. Where two sides meet is a vertex, so it has three vertices. Each vertex has an angle, so it has three angles. Big or small, thin or turned, it's still a triangle.",
  "These shapes are not triangles. This one has a gap, so it's not closed. This one has a curved side. This one has four sides.",
  "When two sides are the same length, we mark them with the same number of tick marks. Same marks, same length.",
  "Watch out! Not every three rods make a triangle. These two short rods can't reach each other. Together they're shorter than the long rod, so the shape can't close."],
 "vid-close": "Three straight sides, closed up tight. That's a triangle. Now it's your turn!"}
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
json.dump(tl, open('timeline-3-12-04-est.json', 'w'))
print('total', tl['total'], 'math', round(st, 1), 'close', round(cs, 1))
