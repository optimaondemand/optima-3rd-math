# Estimated timeline for the 3.12.06 Learn video review cut (no audio yet: Q4, voice later).
# Pace matched to the voiced 3.12.01 video (about 0.39 s per word with pauses). Replace with the Scribe timeline when voiced.
import json
secs = {
 "vid-open": "Hoo! Claire has some four-sided shapes. Let's find their names!",
 "vid-math": [
  "A quadrilateral is a closed shape with four straight sides. Big or small, tipped or pointy, if it has four straight sides and no gaps, it's a quadrilateral.",
  "First, check for parallel sides. Parallel sides go the same way, like train tracks, and never meet. A shape with at least one pair is a trapezoid. Two pairs make a parallelogram.",
  "Next, check the lengths. A parallelogram with four equal sides is a rhombus.",
  "Then check the corners with a set square. A parallelogram with four square corners is a rectangle. Four equal sides and four square corners make a square.",
  "Watch out! A square is a rectangle, too, because it has four square corners. But a rectangle with two long sides and two short sides is not a square."
 ],
 "vid-close": "Check the sides, check the corners, then name the shape. Now it's your turn!"
}
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
json.dump(tl, open('timeline-3-12-06-est.json', 'w'))
print('total', tl['total'], 'math', round(st, 1), 'close', round(cs, 1))
