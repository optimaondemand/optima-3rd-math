# Estimated timeline for the 3.12.02 Learn video review cut (no audio yet: Q4, voice later).
# Pace matched to the voiced 3.12.01 video (about 0.39 s per word with pauses). Replace with the Scribe timeline when voiced.
import json
secs = {
 "vid-open": "Hoo! Claire has two strips and a pin. Let's watch them make an angle.",
 "vid-math": ["Here are two strips, pinned together at one end. Turn one strip, and the strips open. The space between them is an angle. The pin is the vertex. That's where the two sides meet. Each side is called a ray.",
  "Open the strips wider, and the angle gets bigger. Close them, and it gets smaller. Even a tiny opening is still an angle. Open them all the way to one straight line, and that's a straight angle.",
  "This corner of a set square is a square corner. It's a right angle. Put the corner on the vertex and line up one ray. If the other ray hides under the set square, the angle is less than a right angle. If it sticks out past the set square, the angle is greater than a right angle.",
  "Watch out! Longer rays don't make a bigger angle. Only the opening matters. These two angles have the same opening, so they're the same size, even though one has much longer rays."],
 "vid-close": "Vertex, rays, and the opening between them. Check the size with a square corner. Now it's your turn!"}
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
json.dump(tl, open('timeline-3-12-02-est.json', 'w'))
print('total', tl['total'], 'math', round(st, 1), 'close', round(cs, 1))
