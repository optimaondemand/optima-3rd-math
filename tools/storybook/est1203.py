# Estimated timeline for the 3.12.03 Learn video review cut (no audio yet: Q4, voice later).
# Pace matched to the voiced 3.12.01 video (about 0.39 s per word with pauses). Replace with the Scribe timeline when voiced.
import json
secs = {
 "vid-open": "Hoo! Claire has a scrap of paper. Watch it become a right-angle checker.",
 "vid-math": ["Here's a scrap of paper with bumpy edges. Fold it once. The fold makes a straight edge. Now fold that edge onto itself. The new corner is a square corner, a right angle. That's your right-angle checker.",
  "Put the checker's corner on the vertex and line up one side. If the other side lines up too, it's a right angle. Mark it with a small square. If the other side hides under the checker, the angle is less than a right angle. If it sticks out, it's greater.",
  "Check a shape one corner at a time, and mark each right angle. A quarter of a round pie has a right angle at its point. The round edge has no corner, so it has no angle.",
  "Lines that meet at a right angle are perpendicular. These two roads cross and make four right angles. A gate that stands straight out from the wall is perpendicular to the wall.",
  "Watch out! This corner looks almost square, but the checker shows a gap. It's greater than a right angle. Always check. Don't guess."],
 "vid-close": "Fold it, fit it, mark it. Lines that meet at a square corner are perpendicular. Now it's your turn!"}
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
json.dump(tl, open('timeline-3-12-03-est.json', 'w'))
print('total', tl['total'], 'math', round(st, 1), 'close', round(cs, 1))
