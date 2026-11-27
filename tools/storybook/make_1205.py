# make1205: writes tools/storybook/lesson-3-12-05.src.html from the 3.12.04 source's head and tail + new middle.
import json, sys, re
sys.path.insert(0, '/home/claude/b1205')  # cloud build folder; the helpers are tools/storybook/svg1205.py
try:
    from svg import *
except ImportError:
    from svg1205 import *
SRC4 = '/home/claude/kit/tools/storybook/lesson-3-12-04.src.html'
OUT = '/home/claude/kit/tools/storybook/lesson-3-12-05.src.html'
s4 = open(SRC4).read()
head = s4[:s4.index('<!-- the open book -->')]
tail = s4[s4.index('</footer>') + len('</footer>'):]
head = head.replace('<title>Triangles · Grade 3 Math Lesson 3.12.04</title>', '<title>Properties of Triangles · Grade 3 Math Lesson 3.12.05</title>')
head = head.replace('<h1 class="sb-title">Triangles</h1>', '<h1 class="sb-title">Properties of Triangles</h1>')
head = head.replace('Lesson 3.12.04 · Unit 12 · Lesson 4', 'Lesson 3.12.05 · Unit 12 · Lesson 5')
head = re.sub(r'<small>Today:.*?</small>', '<small>Today: name triangles by their sides (equilateral, isosceles, scalene) and by their angles (acute, right, obtuse), and give one triangle both names. Dimensions Math 3B, Chapter 12, Lesson 5 · Properties of Triangles</small>', head)
assert 'Properties of Triangles</h1>' in head and '3.12.05 · Unit 12 · Lesson 5' in head

def J(o): return json.dumps(o, separators=(',', ':')).replace('"', '&quot;').replace('[', '&#91;').replace(']', '&#93;')

# geoboard shapes (pins 0..10) and the Wow (pixels, 700 x 420)
HOUSE = [{"p": [[2, 9], [8, 9], [8, 5], [5, 1], [2, 5]], "col": "#2F6FDE"}]
J3 = [{"p": [[1, 1], [1, 4], [3, 4]], "lab": "A", "ask": "a"}, {"p": [[5, 4], [10, 4], [7, 2]], "lab": "B", "ask": "a"}, {"p": [[2, 6], [6, 10], [8, 6]], "lab": "C", "ask": "a"}]
BEN = [{"p": [[0, 9], [10, 8], [4, 0]], "who": "Ben's triangle", "ask": "a", "col": "#D2453B"}]
MIA = [{"p": [[2, 2], [2, 8], [8, 8]], "who": "Mia's triangle", "ask": "a", "pre": {"s": "isosceles"}, "col": "#23915A"}]
H = 150 * 3 ** .5 / 2
WOW = [{"p": [[60, 330], [210, 330], [135, 255]], "lab": "A", "ask": "sa"},
       {"p": [[270, 330], [460, 330], [320, 290]], "lab": "B", "ask": "sa"},
       {"p": [[515, 330], [665, 330], [590, round(330 - H, 2)]], "lab": "C", "ask": "sa"}]
SIX = 'scalene,acute,isosceles,obtuse,equilateral,right'

# static diagrams
eqP = [(30, 185), (190, 185), (110, 185 - 160 * 3 ** .5 / 2)]
isP = [(245, 185), (395, 185), (320, 45)]
scP = [(455, 185), (625, 185), (495, 85)]
SIDES_SVG = '<svg viewBox="0 0 640 230">' + tri(eqP, marks=[1, 1, 1]) + tri(isP, marks=[2, 1, 1]) + tri(scP, marks=[3, 2, 1]) + label(110, 218, 'equilateral') + label(320, 218, 'isosceles') + label(540, 218, 'scalene') + '</svg>'
acP = [(30, 185), (190, 185), (100, 55)]
rtP = [(245, 185), (395, 185), (245, 65)]
obP = [(445, 185), (625, 185), (485, 125)]
ANG_SVG = '<svg viewBox="0 0 640 230">' + tri(acP, corners=True) + tri(rtP, corners=True) + tri(obP, corners=True) + label(110, 218, 'acute') + label(320, 218, 'right') + label(535, 218, 'obtuse') + '</svg>'
twoP = [(200, 190), (200, 40), (350, 190)]
TWO_SVG = '<svg viewBox="0 0 560 230">' + tri(twoP, marks=[1, 1, 2], corners=True) + '<text x="400" y="100" font-size="18" font-weight="900" fill="#0E1C42">sides: isosceles</text><text x="400" y="132" font-size="18" font-weight="900" fill="#1E7A4C">angles: right</text></svg>'
EQ_SVG = '<svg viewBox="0 0 260 190">' + tri([(40, 165), (40, 30), (175, 165)], marks=[1, 2, 1], corners=True) + '</svg>'
BONUS_SVG = '<svg viewBox="0 0 260 240"><polygon points="40,30 220,30 220,210 40,210" fill="#FBF6EA" stroke="#0E1C42" stroke-width="5" stroke-linejoin="round"/><line x1="40" y1="30" x2="220" y2="210" stroke="#0E1C42" stroke-width="5" stroke-linecap="round"/></svg>'

mid = '''<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 12">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-byrne-defs.jpg}}" alt="An old printed page of definitions. Next to each one is a small triangle drawn with red, yellow and blue sides."><figcaption>Euclid's names for triangles, from Oliver Byrne's book, 1847</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 12</div>
      <div class="sb-chap-t">Euclid's Compass</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Alexandria, Egypt · about 300 BC</p>
      <div class="sb-chap-l">Lesson 5 · Properties of Triangles</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How can we name a triangle by its sides and by its angles?</h3>
    <div class="sb-stage" role="img" aria-label="A triangle. Two of its sides have one tick mark each, and the third side has two. One corner has a small green square." style="margin:6px 0;max-width:240px">''' + EQ_SVG + '''</div>
    <p style="margin:4px 0 0">Count the equal sides for one name. Check the corners for the other.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Sort</b> triangles by how many sides are the same length.</li>
      <li><b>Check</b> each corner with a set square to name a triangle by its angles.</li>
      <li><b>Give</b> one triangle two names: one for its sides and one for its angles.</li>
    </ul>
  </div>
</div>

<div class="sb-tabs" role="tablist" aria-label="Lesson sections">
  <button class="sb-tab" role="tab" data-tab="warmup" aria-controls="tab-warmup">🔍 Warm-Up <span class="ck">✓</span></button>
  <button class="sb-tab" role="tab" data-tab="learn" aria-controls="tab-learn">📐 Lesson <span class="ck">✓</span></button>
  <button class="sb-tab" role="tab" data-tab="swyk" aria-controls="tab-swyk">🌟 Show What You Know <span class="ck">✓</span></button>
</div>

<!-- ══════════════ WARM-UP ══════════════ -->
<section class="sb-panel tab-panel" id="tab-warmup" role="tabpanel">

<div class="sb-opti" data-slot="warm-1">Hoo! Euclid's book gives names to triangles. Some names tell about the sides. Others tell about the angles. Isosceles comes from Greek words for equal legs. Scalene means uneven. Today you'll sort triangles and give each one two names.</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-12-05-warm.jpg" src="assets/video/g3math-12-05-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Lesson 5: Properties of Triangles</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the past</span>
  <h3>Euclid's names for triangles</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>This is a page from a copy of Euclid's book printed in London in 1847. Oliver Byrne drew every shape with red, yellow and blue lines, so the parts are easy to tell apart. On this page, each kind of triangle gets its own name. Euclid wrote these names in Greek about 2,300 years ago, and we still use them today.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-byrne-defs-tri.jpg}}" alt="A close-up of the old page. Small triangles with red, yellow and blue sides sit next to short definitions: equilateral, isosceles, scalene, right angled, obtuse angled, acute angled." style="object-fit:contain;background:#FBF6EA"><figcaption>Euclid's triangle names, from Oliver Byrne's book, London, 1847.<small>Public domain, via Wikimedia Commons.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">Euclid gave three names for the sides and three names for the angles. <b>Isosceles</b> comes from Greek words for "equal legs." <b>Scalene</b> comes from a Greek word for "uneven."</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> sort triangles, and give each one a name for its sides and a name for its angles.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-12-05 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-12-05</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to properties of triangles! Warm up with × 6 and × 9 facts. Then sort three rod triangles by how many sides are the same length.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Times 6 and Times 9</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">Warm up with × 6 and × 9 facts. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
''' + '\n'.join('      <div class="fluency-item"><span class="fluency-q">%d × %d =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%d times %d"></div>' % (a, b, a * b, a, b) for a, b in [(9, 3), (6, 8), (9, 7), (6, 6), (9, 9), (6, 4), (9, 12), (6, 7), (9, 5), (6, 12)]) + '''
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! The 2 bottom corners are square corners. The roof corners are not: one is smaller and two are bigger.">
  <span class="sb-k">Remember from Lesson 3</span>
  <h3>Find the square corners</h3>
  <p>Drag the set square onto each corner of this house shape. How many corners are square corners?</p>
  <div data-mod="tns" data-do="corner" data-tris="''' + J(HOUSE) + '''" data-name="review"></div>
  <div class="sb-q">The house shape has [[n:2~Look for the corners with a small green square.]] square corners.</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: Sort the Rod Triangles</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">Euclid's students built three triangles from rods. Look at the side lengths. Drag each triangle into a group. Then tell how you decided.</div>
  <p class="sb-story">Euclid's students built three triangles from rods. They want to sort them by their sides.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Three triangles, each made of 3 rods. The number on each rod is its length. Under them are three groups: all 3 rods the same length, 2 the same, or none the same.</p></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="sorted" data-cue=".tn-rt:not(.in)"><h4>Sort by the sides</h4><p>Drag each rod triangle into its group: All 3 the same, 2 the same, or None the same.</p></div>
    <div class="sb-step"><h4>How did you decide?</h4>
      <label class="sb-write-l" for="w-think">Tell how you knew which group each triangle goes in.</label>
      <textarea class="sb-write" id="w-think" data-req data-label="Sort the Rod Triangles" placeholder="I looked at … The 9, 9 and 4 triangle goes in … because …"></textarea>
      <div class="sb-chips2">Remember to tell: <span>rod numbers</span><span>same length</span><span>how many</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div data-mod="tns" data-do="rsort" data-rods="5-7-9,7-7-7,9-9-4" data-name="think" data-for="sorted"></div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Read the 3 numbers on each triangle.", "Count how many of the 3 numbers match. 9, 9 and 4 has two that match.", "7, 7 and 7: all 3 match. 5, 7 and 9: none match."]'>💡 Need a hint?</button>{{TOOL:rods-sort}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Felix has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="felix">I don't look at the colors first. I read the numbers and count how many are the same.</div>
  <div class="sb-payoff" data-after-job="1">
    <p style="margin:0"><b>You sorted by the sides.</b> Euclid named these groups. All 3 sides the same: <b>equilateral</b>. 2 sides the same: <b>isosceles</b>. No sides the same: <b>scalene</b>.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">You sorted by sides! Euclid named those groups. All three sides the same is equilateral. Two sides the same is isosceles. No sides the same is scalene.</div>
</section>

<div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="learn" data-go-st="1">Next: the Lesson →</button></div>
</section>

<!-- ══════════════ LESSON ══════════════ -->
<section class="sb-panel tab-panel" id="tab-learn" role="tabpanel">
<div class="sb-path" role="list">
  <button type="button" class="sb-pstep" data-st="1" role="listitem"><span class="num">1</span><span><b>Learn it</b><small>Learn + Your Turn</small></span></button>
  <button type="button" class="sb-pstep" data-st="2" role="listitem"><span class="num">2</span><span><b>Practice together</b><small>2 jobs</small></span></button>
  <button type="button" class="sb-pstep" data-st="3" role="listitem"><span class="num">3</span><span><b>On your own</b><small>1 job</small></span></button>
</div>

<!-- STATION 1 -->
<div class="sb-station" data-st="1">
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. First, you'll name triangles by their sides, then by their angles. Next, we fix some mix-ups. Then you'll make a triangle of your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Two Names for Every Triangle</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Names for the sides</h3>
    <div class="sb-stage" role="img" aria-label="Three triangles. The first has one tick mark on every side and is labeled equilateral. The second has one tick mark on two sides and two on the bottom, labeled isosceles. The third has one, two and three tick marks, labeled scalene." style="margin:6px 0">''' + SIDES_SVG + '''</div>
    <p style="margin:6px 0 0"><b>Tick marks</b> show which sides are the same length: sides with the same marks match. All 3 sides the same: <b>equilateral</b>. At least 2 sides the same: <b>isosceles</b>. No sides the same: <b>scalene</b>.</p>
    <p style="margin:6px 0 0">An equilateral triangle has at least 2 equal sides, too, so it is also isosceles. When we sort, we use the name that tells the most: equilateral.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Names for the angles</h3>
    <div class="sb-stage" role="img" aria-label="Three triangles. The first has three small orange arcs, labeled acute. The second has a green square in one corner, labeled right. The third has a red arc on one wide corner, labeled obtuse." style="margin:6px 0">''' + ANG_SVG + '''</div>
    <p style="margin:6px 0 0">Check every corner with a set square. All 3 angles smaller than a square corner: <b>acute</b>. One square corner: <b>right triangle</b>. One angle bigger than a square corner: <b>obtuse</b>.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Two names for one triangle</h3>
    <div class="sb-stage" role="img" aria-label="A triangle with one tick mark on two sides and two tick marks on the third side. One corner has a green square. Next to it: sides, isosceles. Angles, right." style="margin:6px auto;max-width:520px">''' + TWO_SVG + '''</div>
    <p style="margin:6px 0 0">Every triangle gets two names. Count the equal sides for one name. Check the corners for the other. This one is <b>isosceles</b> and <b>right</b>. Size doesn't change the names.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to stay on track</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>I count tick marks first. Matching marks mean matching sides.</span></div>
      <div class="sb-mate" data-who="felix"><span>I check all 3 corners, not just one. One wide corner makes it obtuse.</span></div>
      <div class="sb-mate" data-who="hazel"><span>I always give two names: one for the sides, one for the angles.</span></div>
      <div class="sb-mate" data-who="cora"><span>Big or tiny, a triangle keeps its names. I look at the corners, not the size.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN: SIDES -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: Two Equal Sides</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Euclid's students stretch a band on the geoboard. Make a triangle with exactly 2 sides the same length.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A geoboard with 11 rows of 11 pins. Tap a pin to hook the band on it. When you close the band, tick marks pop onto the sides. Sides with the same marks are the same length.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="made" data-cue=".tr-pin"><h4>Make the triangle</h4><p>Tap 3 pins to make a triangle with exactly 2 sides the same length. Then tap the first pin again to close the band.</p></div>
      <div class="sb-step" data-need="named" data-cue=".tn-cards"><h4>Name it by its sides</h4><p>Drag the card with your triangle's side name into the box.</p></div>
      <div class="sb-step"><h4>Count the equal sides</h4>
        <div class="sb-q">Your triangle has [[n:2~Count the sides that have one tick mark.]] sides that are the same length.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="tns" data-do="name" data-side="2" data-cards="equilateral,isosceles,scalene" data-name="yt" data-for="made named"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Pick a top pin. Count the same number of pin spaces down and to the left, and down and to the right.", "Close the band. Look for 2 sides with one tick mark each.", "2 sides the same length: isosceles."]'>💡 Need a hint?</button>{{TOOL:geoboard-names}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="atlas">A tall tent shape works every time: one pin on top, and two pins below it, the same distance to each side.</div>
  </section>

  <!-- JOB 3 · YOUR TURN: ANGLES -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Your Turn: Check the Corners</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Three triangles are on the geoboard. Name each one by its angles.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Triangles A, B and C on a geoboard. Every corner has a gold ring until you check it. The set square waits at the bottom right. When you check a corner, a mark shows what you found: a green square, an orange arc for smaller, or a red arc for bigger.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="checked" data-cue=".tn-cn:not(.done)"><h4>Check every corner</h4><p>Drag the set square onto a corner, one corner at a time, until all 9 gold rings are gone.</p></div>
      <div class="sb-step" data-need="named" data-cue=".tn-cards"><h4>Name each triangle</h4><p>Drag acute, right or obtuse into the box for each triangle.</p></div>
      <div class="sb-step"><h4>Count the square corners</h4>
        <div class="sb-q">The right triangle has [[n:1~Look at the right triangle. How many green squares does it have?]] square corner.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="tns" data-do="corner" data-tris="''' + J(J3) + '''" data-cards="acute,right,obtuse" data-name="ang" data-for="checked named"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Drop the square corner of the set square right on a gold ring.", "A green square means a square corner. A red arc means bigger.", "One green square: right. One red arc: obtuse. All orange: acute."]'>💡 Need a hint?</button>{{TOOL:setsquare}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="felix">I check all 3 corners before I pick a name. The wide corner can hide on any side.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. Here's a clue. Every triangle gets two names. Count the equal sides for one name. Check the corners for the other.</div>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Ben's Big Triangle</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Ben makes a huge triangle on the geoboard. He says, "Acute means tiny, so my big triangle can't be acute."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Ben's red triangle stretches almost across the whole geoboard. Each corner has a gold ring. The set square waits at the bottom right.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="checked" data-cue=".tn-cn:not(.done)"><h4>Check Ben's corners</h4><p>Drag the set square onto each corner of Ben's triangle, one at a time.</p></div>
      <div class="sb-step" data-need="named" data-cue=".tn-cards"><h4>Name it</h4><p>Drag the angle name for Ben's triangle into the box.</p></div>
      <div class="sb-step"><h4>Help Ben</h4><label class="sb-write-l" for="w-ben">Tell Ben what decides if a triangle is acute.</label><textarea class="sb-write" id="w-ben" data-req data-label="Help Ben" placeholder="Your triangle is acute because … Size doesn't …"></textarea><div class="sb-chips2">Remember to tell: <span>angles</span><span>smaller than a square corner</span><span>size</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="tns" data-do="corner" data-tris="''' + J(BEN) + '''" data-cards="acute,right,obtuse" data-name="ben" data-for="checked named"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Check all 3 corners. What color are the marks?", "All 3 corners are smaller than a square corner.", "All 3 angles smaller than a square corner: acute, no matter how big the triangle is."]'>💡 Need a hint?</button>{{TOOL:setsquare}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="cora">Acute is about the corners, not the size. A giant triangle can be acute, and a tiny one can be obtuse.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Mia's One Name</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Mia names her triangle. She says, "It's isosceles. Done!"</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Mia's green triangle on the geoboard. Tick marks show 2 sides the same length. Her box for the sides already says isosceles. The box for the angles is still empty.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="checked" data-cue=".tn-cn:not(.done)"><h4>Check Mia's corners</h4><p>Drag the set square onto each corner of Mia's triangle, one at a time.</p></div>
      <div class="sb-step" data-need="named" data-cue=".tn-cards"><h4>Give the second name</h4><p>Drag the angle name for Mia's triangle into the empty box.</p></div>
      <div class="sb-step"><h4>Help Mia</h4><label class="sb-write-l" for="w-mia">Tell Mia why her triangle needs two names, and what they are.</label><textarea class="sb-write" id="w-mia" data-req data-label="Help Mia" placeholder="Your triangle is isosceles and … because …"></textarea><div class="sb-chips2">Remember to tell: <span>two names</span><span>sides</span><span>angles</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="tns" data-do="corner" data-ticks="1" data-tris="''' + J(MIA) + '''" data-cards="acute,right,obtuse" data-name="mia" data-for="checked named"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Isosceles is the name for the sides. Now check the corners.", "One corner gets a green square.", "One square corner: right. Mia&#39;s triangle is isosceles and right."]'>💡 Need a hint?</button>{{TOOL:setsquare}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="hazel">One name is only half the job. I say the sides name, then I say the angles name.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn. Make a triangle with no equal sides and one angle bigger than a square corner. Then give it both names.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>On Your Own: Uneven and Wide</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Make a triangle with no sides the same length and one angle bigger than a square corner. Then give it both names.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A geoboard with 11 rows of 11 pins. When you close the band, tick marks show which sides match. The set square waits at the bottom right.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="made" data-cue=".tr-pin"><h4>Make the triangle</h4><p>Tap 3 pins and close the band so no sides are the same length and one corner is wider than a square corner.</p></div>
      <div class="sb-step" data-need="checked" data-cue=".tn-sq"><h4>Check the wide corner</h4><p>Drag the set square onto the wide corner of your triangle.</p></div>
      <div class="sb-step" data-need="named" data-cue=".tn-cards"><h4>Give both names</h4><p>Drag a sides name and an angles name into the two boxes. Check the other corners with the set square first.</p></div>
      <div class="sb-step"><h4>Tell how you know</h4><label class="sb-write-l" for="w-own">Tell how you know each name fits your triangle.</label><textarea class="sb-write" id="w-own" data-req data-label="Uneven and Wide" placeholder="It is scalene because … It is obtuse because …"></textarea><div class="sb-chips2">Remember to tell: <span>tick marks</span><span>set square</span><span>two names</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="tns" data-do="make" data-side="0" data-ang="obtuse" data-cards="''' + SIX + '''" data-name="own" data-for="made checked named"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Make a long, flat triangle. Put the top pin close to one end.", "Look at the tick marks: 1, 2 and 3 marks mean no sides match.", "No sides the same: scalene. One wide corner: obtuse."]'>💡 Need a hint?</button>{{TOOL:geoboard-names}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! Euclid's book has six triangle names. Use every name once to label three triangles. Count the sides, and check the corners.</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>Euclid's Six Names</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">Three triangles are drawn in red, yellow and blue, the way Oliver Byrne drew Euclid's shapes. Use all six names, each one once.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Triangles A, B and C. Tick marks show which sides match. Every corner has a gold ring for the set square. Under the mat are six name cards and two boxes for each triangle.</p></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="checked" data-cue=".tn-cn:not(.done)"><h4>Problem 1 · Check the corners</h4><p>Drag the set square onto a corner, one corner at a time, until all 9 gold rings are gone.</p></div>
    <div class="sb-step" data-need="named" data-cue=".tn-cards"><h4>Problem 2 · Use all six names</h4><p>Drag each name card into a box. Every triangle gets a sides name and an angles name.</p></div>
    <div class="sb-locked"></div>
  </div>
  <div data-mod="tns" data-do="match" data-free="1" data-tris="''' + J(WOW) + '''" data-cards="''' + SIX + '''" data-name="wow" data-for="checked named"></div>
  <div class="sb-payoff" data-after-job="7"><p style="margin:0">Euclid named all six about 2,300 years ago, and we still use his names. <b>Isosceles</b> means "equal legs": look at the two matching sides of triangle A. <b>Scalene</b> means "uneven": none of triangle B's sides match.</p></div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Count tick marks for the sides names. Use the set square for the angles names.", "Triangle C has the same mark on all 3 sides. Its sides name is equilateral.", "A: isosceles and right. B: scalene and obtuse. C: equilateral and acute."]'>💡 Need a hint?</button>{{TOOL:setsquare}}</div>
  <div class="sb-hintbox"></div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Write a note to a younger student. Tell them how to give a triangle its two names.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="First, look at the sides … Then check each corner … So the two names are …"></textarea><div class="sb-chips2">Remember to tell: <span>equal sides</span><span>set square</span><span>two names</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! Each half has 2 equal sides (the sides of the square) and 1 square corner, so each half is isosceles and right.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Half a Square</h3>
  <p>A square is cut from one corner to the opposite corner. Look at one of the two triangles.</p>
  <div class="sb-stage" role="img" aria-label="A square with a straight line from its top left corner to its bottom right corner, making two triangles." style="margin:6px auto;max-width:260px">''' + BONUS_SVG + '''</div>
  <div class="sb-q">One triangle has [[n:2~A square's sides are all the same length. How many of them does one triangle keep?]] equal sides and [[n:1~The square had 4 square corners. One triangle keeps one of them whole.]] square corner.</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div>
</div>

<div class="sb-card">
  <span class="sb-k">How to turn in</span>
  <h3>Turn in your work</h3>
  <ol class="sb-steps4">
    <li>Check the list below. Jobs 1 to 8 are required. The Bonus is optional.</li>
    <li>Press <b>📋 Gather my answers</b>, then <b>📋 Copy</b>. Or press <b>🖨️ Print or save as PDF</b>.</li>
    <li>Open this lesson's assignment in Canvas.</li>
    <li>Paste your answers (or upload your PDF and journal photo), then press <b>Submit</b>.</li>
  </ol>
</div>

<div class="sb-card sb-journal">
  <span class="sb-k">Math journal</span>
  <h3>All my answers</h3>
  <div class="sb-help"><button type="button" class="sb-btn" data-journal="gather">📋 Gather my answers</button><button type="button" class="sb-btn ghost" data-journal="copy">📋 Copy</button><button type="button" class="sb-btn ghost" data-journal="download">⬇️ Download as text</button><button type="button" class="sb-btn ghost" data-journal="print">🖨️ Print or save as PDF</button></div>
  <textarea id="sb-journal-out" readonly aria-label="All my answers">Press Gather my answers to collect everything here.</textarea>
  <p class="sb-saved">Your answers and your work on this page save on this device as you go.</p>
</div>

<div class="sb-card">
  <span class="sb-k">Checklist</span>
  <h3>Before you turn in</h3>
  <ul class="sb-check">
    <li><span class="bx"></span><span>I finished Jobs 1 to 8.</span></li>
    <li><span class="bx"></span><span>I can name a triangle by its sides: equilateral, isosceles or scalene.</span></li>
    <li><span class="bx"></span><span>I can name a triangle by its angles: acute, right or obtuse.</span></li>
    <li><span class="bx"></span><span>I can give one triangle both names.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.12.06 · Properties of Quadrilaterals</h3>
  <p>Next, you'll look at shapes with 4 sides. You'll check their sides and corners, just like you did today.</p>
</div>

<div class="sb-opti" data-slot="end-1">That's the fifth lesson in Chapter 12. Here's music by Johann Pachelbel, from more than 300 years ago. Three violins play the same tune, one after another, like three equal sides. Press play, and stop whenever you like.</div>
<div class="sb-card sb-listen" data-src="pachelbel-canon-macleod.mp3">
  <img src="{{IMG:sb-byrne-defs-tri.jpg}}" alt="Euclid's triangle names, from Oliver Byrne's book" style="object-fit:contain;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>Canon in D</h3>
    <p style="margin:2px 0">Johann Pachelbel wrote this canon for three violins and a low bass part. The first violin starts the tune. Then the second violin plays the same tune, a little later, and then the third. Listen for the tune passing from one violin to the next.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Johann Pachelbel, Canon in D major. "Canon in D Major" by Kevin MacLeod (incompetech.com), CC BY 3.0, via Wikimedia Commons.</p>
  </div>
</div>
</section>

<footer class="sb-foot footer"><b>🏫 Optima Academy Online</b><br>Math · Grade 3 · Lesson 3.12.05 · Unit 12<br><span style="font-size:12px">Art: Oliver Byrne, "The First Six Books of the Elements of Euclid" (London, 1847), public domain, via Wikimedia Commons. Music: Johann Pachelbel, Canon in D major, "Canon in D Major" by Kevin MacLeod (incompetech.com), CC BY 3.0, via Wikimedia Commons.</span></footer>'''
html = head + mid + tail
open(OUT, 'w').write(html)
print('wrote', OUT, len(html))
