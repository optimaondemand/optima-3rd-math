# make_1206: writes tools/storybook/lesson-3-12-06.src.html (head and tail from the 3.12.05 source + new middle).
import json, sys, re
sys.path.insert(0, '/home/claude/b1205')  # cloud build folder; the helpers are tools/storybook/svg1205.py
try:
    from svg import *
except ImportError:
    from svg1205 import *
SRC5 = '/home/claude/kit/tools/storybook/lesson-3-12-05.src.html'
OUT = '/home/claude/kit/tools/storybook/lesson-3-12-06.src.html'
s5 = open(SRC5).read()
head = s5[:s5.index('<!-- the open book -->')]
tail = s5[s5.index('</footer>') + len('</footer>'):]
head = head.replace('Properties of Triangles · Grade 3 Math Lesson 3.12.05', 'Properties of Quadrilaterals · Grade 3 Math Lesson 3.12.06').replace('<h1 class="sb-title">Properties of Triangles</h1>', '<h1 class="sb-title">Properties of Quadrilaterals</h1>').replace('Lesson 3.12.05 · Unit 12 · Lesson 5', 'Lesson 3.12.06 · Unit 12 · Lesson 6')
head = re.sub(r'<div class="sb-pop" id="sb-std">.*?</div>', '<div class="sb-pop" id="sb-std"><b>MA.3.GR.1.2</b> Identify and draw quadrilaterals based on their defining attributes. Quadrilaterals include parallelograms, rhombi, rectangles, squares and trapezoids.<br><b>MA.K12.MTR.2.1</b> Show math in many ways. <b>MTR.5.1</b> Use patterns and structure. <b>MTR.6.1</b> Check that answers make sense.<br><small>Today: check the sides and corners of 4-sided shapes and give each one the name that tells the most. Dimensions Math 3B, Chapter 12, Lesson 6 · Properties of Quadrilaterals</small></div>', head, flags=re.S)
assert 'Quadrilaterals</h1>' in head and 'MA.3.GR.1.2' in head
def J(o): return json.dumps(o, separators=(',', ':')).replace('"', '&quot;').replace('[', '&#91;').replace(']', '&#93;')

# static diagrams
WHAT = '<svg viewBox="0 0 640 210">' + quad([(20,170),(190,170),(170,60),(40,40)]) + quad([(230,170),(300,170),(300,110),(230,120)]) + quad([(400,30),(470,100),(400,170),(330,100)]) + quad([(520,180),(570,40),(625,180),(572,130)]) + '</svg>'
tz = [(30,180),(280,180),(220,60),(90,60)]; pg = [(350,180),(560,180),(615,60),(405,60)]
PAR = '<svg viewBox="0 0 640 230">' + quad(tz, par=[(0,2,True)]) + quad(pg, par=[(0,2,True),(1,3,True)]) + label(155,218,'trapezoid: at least 1 pair') + label(482,218,'parallelogram: 2 pairs') + '</svg>'
rh = [(110,30),(185,105),(110,180),(35,105)]; rc = [(240,50),(420,50),(420,160),(240,160)]; sq = [(480,40),(610,40),(610,170),(480,170)]
SPEC = '<svg viewBox="0 0 640 230">' + quad(rh, marks=[1,1,1,1]) + quad(rc, marks=[1,2,1,2], corners=True) + quad(sq, marks=[1,1,1,1], corners=True) + label(110,218,'rhombus') + label(330,218,'rectangle') + label(545,218,'square') + '</svg>'
EQ = '<svg viewBox="0 0 260 190">' + quad([(30,160),(200,160),(230,40),(60,40)], marks=[1,2,1,2], par=[(0,2,True),(1,3,True)]) + '</svg>'
REV = '<svg viewBox="0 0 300 220">' + tri([(60,190),(60,40),(230,190)], marks=[1,2,1], corners=True) + '</svg>'
BON = '<svg viewBox="0 0 240 240"><g fill="#FBF6EA" stroke="#0E1C42" stroke-width="5" stroke-linejoin="round"><rect x="30" y="30" width="90" height="90"/><rect x="120" y="30" width="90" height="90"/><rect x="30" y="120" width="90" height="90"/><rect x="120" y="120" width="90" height="90"/></g></svg>'
SIX = 'quadrilateral,trapezoid,parallelogram,rectangle,rhombus,square'

mid = '''<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 12">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-byrne-quads.jpg}}" style="object-position:top" alt="An old printed page of definitions. Next to each one is a small four-sided shape drawn with red, yellow and blue sides: a square, an oblong and a rhombus."><figcaption>Euclid's names for four-sided shapes, from Oliver Byrne's book, 1847</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 12</div>
      <div class="sb-chap-t">Euclid's Compass</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Alexandria, Egypt · about 300 BC</p>
      <div class="sb-chap-l">Lesson 6 · Properties of Quadrilaterals</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How can we name a 4-sided shape by its sides and corners?</h3>
    <div class="sb-stage" role="img" aria-label="A slanted 4-sided shape. Arrow marks show two pairs of parallel sides. Tick marks show two pairs of equal sides." style="margin:6px 0;max-width:240px">''' + EQ + '''</div>
    <p style="margin:4px 0 0">Check three things: parallel sides, equal sides, square corners.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Make</b> 4-sided shapes on a geoboard.</li>
      <li><b>Check</b> for parallel sides, equal sides and square corners.</li>
      <li><b>Name</b> trapezoids, parallelograms, rectangles, rhombuses and squares.</li>
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

<div class="sb-opti" data-slot="warm-1">Hoo! Euclid's book names four-sided shapes, too: the square, the oblong, the rhombus, and more. In Roman towns, builders laid floors with marble rhombuses. Today you'll stretch bands into four-sided shapes and find each one's family.</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-12-06-warm.jpg" src="assets/video/g3math-12-06-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Lesson 6: Properties of Quadrilaterals</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the past</span>
  <h3>A floor of rhombuses</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>This marble floor is in Herculaneum, a Roman town in Italy. In the year 79, a volcano called Mount Vesuvius buried the town in ash and mud, and the floor stayed hidden for about 1,700 years. Look at the pieces of stone. Many of them have 4 equal sides, and their corners are not square corners. Those pieces are rhombuses. Small triangles fill the spaces between them.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-herculaneum-rhombi.jpg}}" alt="A floor made of colored marble pieces: pink, grey, white and blue rhombuses, with small triangles between them."><figcaption>A marble floor in Herculaneum, Italy, from before the year 79.<small>Photo by AlMare, 2002. CC BY-SA 3.0, via Wikimedia Commons.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">Euclid wrote down names for four-sided shapes, like the square and the rhombus. Builders used those same shapes to make floors.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> make 4-sided shapes, check their sides and corners, and give each one the name that tells the most.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-12-06 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-12-06</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to properties of quadrilaterals! Warm up with × 7 and × 9 facts. Then reshape a rectangle on the geoboard and tell what stays the same.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Times 7 and Times 9</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">Warm up with × 7 and × 9 facts. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
''' + '\n'.join('      <div class="fluency-item"><span class="fluency-q">%d × %d =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%d times %d"></div>' % (a, b, a * b, a, b) for a, b in [(7, 4), (9, 6), (7, 7), (9, 8), (7, 11), (9, 4), (7, 8), (9, 11), (7, 6), (9, 3)]) + '''
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! The tick marks show 2 sides the same length, and the green square shows 1 square corner. Today you'll check sides and corners on 4-sided shapes.">
  <span class="sb-k">Remember from Lesson 5</span>
  <h3>Read the marks</h3>
  <p>Look at the marks on this triangle. Count the sides that are the same length, and count the square corners.</p>
  <div class="sb-stage" role="img" aria-label="A triangle. Two sides have one tick mark each and the third side has two. One corner has a small green square." style="margin:6px auto;max-width:280px">''' + REV + '''</div>
  <div class="sb-q">It has [[n:2~Sides with the same number of tick marks are the same length.]] sides the same length and [[n:1~Count the small green squares.]] square corner.</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: Reshape the Rectangle</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">Euclid's students made a rectangle with a band. Move its corners to make three new shapes, each with four sides. What stays the same every time?</div>
  <p class="sb-story">Euclid's students stretched a band into a rectangle. What happens if they move its corners?</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A geoboard with 11 rows of 11 pins. A purple band makes a rectangle. Each corner of the band has a big dot you can move to another pin.</p></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="made3" data-cue=".qd-h"><h4>Make 3 new shapes</h4><p>Drag a corner dot to a different pin. Keep moving corners until you have made 3 new 4-sided shapes.</p></div>
    <div class="sb-step"><h4>What stays the same?</h4>
      <label class="sb-write-l" for="w-think">Every shape you made is different. Tell what stayed the same every time.</label>
      <textarea class="sb-write" id="w-think" data-req data-label="Reshape the Rectangle" placeholder="Every shape had … The sides were … There were no …"></textarea>
      <div class="sb-chips2">Remember to tell: <span>4 sides</span><span>straight</span><span>corners</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div data-mod="quad" data-do="reshape" data-name="think" data-for="made3"></div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Drag one corner dot up, down or sideways to a new pin.", "If the band crosses itself, pick a different pin.", "Every shape still has 4 straight sides and 4 corners, with no gaps."]'>💡 Need a hint?</button>{{TOOL:geoboard-quad}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Cora has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="cora">I count the sides after every move. If I still get 4 straight sides with no gaps, it's a 4-sided shape.</div>
  <div class="sb-payoff" data-after-job="1">
    <p style="margin:0"><b>Every shape you made is a quadrilateral:</b> a closed shape with 4 straight sides and 4 corners. "Quad" means four.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">Every shape you made had four straight sides, four corners, and no gaps. That's a quadrilateral. Quad means four.</div>
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
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. First, you'll check the sides and corners of four-sided shapes. Next, we fix some mix-ups. Then you'll make a shape of your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Check Three Things</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>What is a quadrilateral?</h3>
    <div class="sb-stage" role="img" aria-label="Four different 4-sided shapes: a big lopsided one, a small one, a square turned on its corner, and a pointy dart shape." style="margin:6px 0">''' + WHAT + '''</div>
    <p style="margin:6px 0 0">A <b>quadrilateral</b> is a closed shape with 4 straight sides and 4 corners. Big or small, tipped or pointy: if it has 4 straight sides and no gaps, it is a quadrilateral.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Check 1: parallel sides</h3>
    <div class="sb-stage" role="img" aria-label="Two shapes. The first has orange arrow marks on its top and bottom sides only, labeled trapezoid, at least 1 pair. The second has one arrow on its top and bottom and two arrows on its slanted sides, labeled parallelogram, 2 pairs." style="margin:6px 0">''' + PAR + '''</div>
    <p style="margin:6px 0 0"><b>Parallel</b> sides go the same way, like train tracks. They never meet. Arrow marks show them. A quadrilateral with at least 1 pair of parallel sides is a <b>trapezoid</b>. With 2 pairs, it is a <b>parallelogram</b>.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Checks 2 and 3: equal sides and square corners</h3>
    <div class="sb-stage" role="img" aria-label="Three shapes. A rhombus with one tick mark on every side. A rectangle with green squares in all four corners and tick marks showing two long and two short sides. A square with one tick mark on every side and green squares in all four corners." style="margin:6px 0">''' + SPEC + '''</div>
    <p style="margin:6px 0 0">4 equal sides: <b>rhombus</b>. 4 square corners: <b>rectangle</b>. Both: <b>square</b>. So a square is a rectangle and a rhombus, too. We give each shape the name that tells the most.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to stay on track</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>I look for train tracks first. Arrow marks show me the parallel sides.</span></div>
      <div class="sb-mate" data-who="felix"><span>I check all 4 corners with the set square, one at a time.</span></div>
      <div class="sb-mate" data-who="hazel"><span>Tick marks tell me which sides match. 4 matching sides make a rhombus.</span></div>
      <div class="sb-mate" data-who="cora"><span>A tipped square is still a square. I check its sides and corners, not the way it points.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN: CHECK -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: Check Three Things</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Euclid's students found this shape on the geoboard. Check it, then name it.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A green 4-sided shape on a geoboard. Tick marks show which sides are the same length. Every corner has a gold ring for the set square, which waits at the bottom right.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="par" data-cue=".qd-side"><h4>Find the parallel sides</h4><p>Tap a side, then tap the side that goes the same way. Find every parallel pair.</p></div>
      <div class="sb-step" data-need="checked" data-cue=".tn-cn:not(.done)"><h4>Check the corners</h4><p>Drag the set square onto each corner, one at a time, until all 4 gold rings are gone.</p></div>
      <div class="sb-step" data-need="named" data-cue=".qd-cards"><h4>Name it</h4><p>Drag the card with the name that tells the most into the box.</p></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="quad" data-do="check" data-quad="''' + J([[2, 7], [7, 7], [9, 3], [4, 3]]) + '''" data-col="#23915A" data-cards="''' + SIX + '''" data-name="yt" data-for="par checked named"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["The top and bottom sides go straight across. Do the slanted sides go the same way too?", "There are 2 parallel pairs, and none of the corners is a square corner.", "2 pairs of parallel sides, no square corners, sides not all equal: parallelogram."]'>💡 Need a hint?</button>{{TOOL:geoboard-quad}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="atlas">I imagine making two sides longer and longer. If they would never meet, they are parallel.</div>
  </section>

  <!-- JOB 3 · YOUR TURN: MAKE -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Your Turn: A Long Rectangle</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Make a rectangle that is not a square: 2 long sides and 2 short sides.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A geoboard with 11 rows of 11 pins. Tap 4 pins to hook the band, then tap the first pin again to close it. The set square waits at the bottom right.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="made" data-cue=".tr-pin"><h4>Make the rectangle</h4><p>Tap 4 pins to make a rectangle with 2 long sides and 2 short sides. Then tap the first pin again to close the band.</p></div>
      <div class="sb-step" data-need="checked" data-cue=".tn-cn:not(.done)"><h4>Check the corners</h4><p>Drag the set square onto each corner, one at a time, until all 4 gold rings are gone.</p></div>
      <div class="sb-step" data-need="named" data-cue=".qd-cards"><h4>Name it</h4><p>Drag the card with the name that tells the most into the box.</p></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="quad" data-do="make" data-rule="rect-not-square" data-need="ck" data-cards="''' + SIX + '''" data-name="rect" data-for="made checked named"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Go straight across from a pin, then straight down.", "Make the across sides longer than the up-and-down sides.", "4 square corners but sides not all equal: rectangle."]'>💡 Need a hint?</button>{{TOOL:geoboard-quad}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="felix">I count pin spaces. 6 across and 3 down makes a long rectangle every time.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. Here's a clue. Check three things every time. Are sides parallel? Are they equal? Are the corners square?</div>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Ben's Square</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Ben makes a square on the geoboard. He says, "This is a square, so it can't be a rectangle."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Ben's red square on the geoboard. Tick marks show 4 sides the same length. Each corner has a gold ring for the set square.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="checked" data-cue=".tn-cn:not(.done)"><h4>Check Ben's corners</h4><p>Drag the set square onto each corner, one at a time, until all 4 gold rings are gone.</p></div>
      <div class="sb-step"><h4>Count the square corners</h4>
        <div class="sb-q">Ben's square has [[n:4~Count the green squares in the corners.]] square corners.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sorted" data-cue=".tn-slot"><h4>Is it a rectangle?</h4><p>A rectangle is any 4-sided shape with 4 square corners. Drag the card that answers Ben into the box.</p></div>
      <div class="sb-step"><h4>Help Ben</h4><label class="sb-write-l" for="w-ben">Tell Ben why his square is also a rectangle.</label><textarea class="sb-write" id="w-ben" data-req data-label="Help Ben" placeholder="Your square is a rectangle because …"></textarea><div class="sb-chips2">Remember to tell: <span>4 square corners</span><span>rectangle</span><span>equal sides</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="quad" data-do="isrect" data-quad="''' + J([[3, 3], [7, 3], [7, 7], [3, 7]]) + '''" data-col="#D2453B" data-name="ben" data-for="checked sorted"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Check every corner. How many are square corners?", "All 4 corners are square corners.", "A rectangle has 4 square corners. Ben&#39;s square has 4 square corners, so it is a rectangle too."]'>💡 Need a hint?</button>{{TOOL:setsquare}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="hazel">A square is a special rectangle: 4 square corners, and all its sides are equal too.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Mia's Four Shapes</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Mia draws four shapes. She says, "They're all quadrilaterals."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Mia's four blue shapes in the tray. Under them are two groups: Quadrilateral and Not a quadrilateral.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="sorted" data-cue=".qd-tray .tn-rt"><h4>Sort Mia's shapes</h4><p>Drag each shape into Quadrilateral or Not a quadrilateral.</p></div>
      <div class="sb-step"><h4>Help Mia</h4><label class="sb-write-l" for="w-mia">Tell Mia which shape surprised you, and why.</label><textarea class="sb-write" id="w-mia" data-req data-label="Help Mia" placeholder="I was surprised that … because …"></textarea><div class="sb-chips2">Remember to tell: <span>4 straight sides</span><span>closed</span><span>curved</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="quad" data-do="qsort" data-name="mia" data-for="sorted"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["For each shape, count the straight sides and look for gaps or curves.", "A shape with a curve, a gap or 5 sides breaks a rule.", "The pointy dart has 4 straight sides and is closed, so it is a quadrilateral."]'>💡 Need a hint?</button>{{TOOL:geoboard-quad}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="cora">Pointy doesn't matter. I trace each side with my finger and count to 4.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn. Make a four-sided shape with exactly one pair of parallel sides. Then give it its family name.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>On Your Own: One Pair</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Make a 4-sided shape with exactly 1 pair of parallel sides. Then name it.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A geoboard with 11 rows of 11 pins. Tap 4 pins to hook the band, then tap the first pin again to close it.</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="made" data-cue=".tr-pin"><h4>Make the shape</h4><p>Tap 4 pins and close the band so exactly 1 pair of sides is parallel.</p></div>
      <div class="sb-step" data-need="par" data-cue=".qd-side"><h4>Show the parallel pair</h4><p>Tap one of the parallel sides, then tap the side that goes the same way.</p></div>
      <div class="sb-step" data-need="named" data-cue=".qd-cards"><h4>Name it</h4><p>Drag the card with the name that tells the most into the box.</p></div>
      <div class="sb-step"><h4>Tell how you know</h4><label class="sb-write-l" for="w-own">Tell how you made exactly 1 pair of parallel sides, and why the name fits.</label><textarea class="sb-write" id="w-own" data-req data-label="One Pair" placeholder="I made the top and bottom … It is a … because …"></textarea><div class="sb-chips2">Remember to tell: <span>parallel</span><span>1 pair</span><span>trapezoid</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="quad" data-do="make" data-rule="one-pair" data-need="par" data-cards="''' + SIX + '''" data-name="own" data-for="made par named"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Make the bottom side go straight across.", "Make the top side go straight across too, but shorter than the bottom.", "Exactly 1 pair of parallel sides: trapezoid."]'>💡 Need a hint?</button>{{TOOL:geoboard-quad}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! Every four-sided shape belongs to a family. Put each shape in its place on the family tree. Which shape fits in every family?</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>The Family Tree</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">Every 4-sided shape belongs to the quadrilateral family. Lower on the tree, the names tell more.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Six shape cards in the tray. Under them is a family tree with six spots: quadrilateral at the top, then trapezoid, then parallelogram, then rectangle and rhombus side by side, then square at the bottom.</p></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="placed" data-cue=".qd-tray .tn-rt"><h4>Problem 1 · Fill the tree</h4><p>Drag each shape card to the spot with the name that tells the most about it.</p></div>
    <div class="sb-step" data-need="all" data-cue=".qd-node:not(.tap)"><h4>Problem 2 · The square's names</h4><p>Tap every name on the tree that fits a square.</p></div>
    <div class="sb-locked"></div>
  </div>
  <div data-mod="quad" data-do="tree" data-name="wow" data-for="placed all"></div>
  <div class="sb-payoff" data-after-job="7"><p style="margin:0">A square fits every name on the tree: it has 4 straight sides, 2 pairs of parallel sides, 4 equal sides and 4 square corners. Euclid's book names the square first of all the four-sided shapes.</p></div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Start with the shapes you are sure of, like the square.", "The pointy shape has no parallel sides, so it only fits the top: quadrilateral.", "Every name on the tree fits the square: all 6."]'>💡 Need a hint?</button>{{TOOL:geoboard-quad}}</div>
  <div class="sb-hintbox"></div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Write a note to a younger student. Tell them the 3 things to check to name a 4-sided shape.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="First, check … Next, check … Then check … The name that tells the most is …"></textarea><div class="sb-chips2">Remember to tell: <span>parallel</span><span>equal sides</span><span>square corners</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! There are 4 small squares, plus 1 big square made of all four: 4 + 1 = 5.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Hidden Squares</h3>
  <p>Four small squares make a bigger shape. How many squares can you find in all?</p>
  <div class="sb-stage" role="img" aria-label="Four small squares in 2 rows of 2, making one big square." style="margin:6px auto;max-width:240px">''' + BON + '''</div>
  <div class="sb-q">I can find [[n:5~Count the 4 small squares. Then look for one more: the big one around all of them.]] squares in all.</div>
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
    <li><span class="bx"></span><span>I can tell what makes a shape a quadrilateral.</span></li>
    <li><span class="bx"></span><span>I can check for parallel sides, equal sides and square corners.</span></li>
    <li><span class="bx"></span><span>I can name trapezoids, parallelograms, rectangles, rhombuses and squares.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.12.07 · Using a Compass</h3>
  <p>Next, you'll use a compass, the tool in our chapter's name, to draw circles and build shapes the way Euclid did.</p>
</div>

<div class="sb-opti" data-slot="end-1">That's the sixth lesson in Chapter 12. Here's music by Joseph Haydn, from more than 230 years ago. It's a string quartet: four players, like the four sides of a quadrilateral. Press play, and stop whenever you like.</div>
<div class="sb-card sb-listen" data-src="haydn-lark-quartet.mp3">
  <img src="{{IMG:sb-herculaneum-rhombi.jpg}}" alt="The marble rhombus floor in Herculaneum" style="object-fit:cover;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>String Quartet "The Lark"</h3>
    <p style="margin:2px 0">Joseph Haydn wrote this quartet in 1790 for two violins, a viola and a cello. Near the start, the first violin floats up high over the others, like a lark singing in the sky. That's how the piece got its nickname.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Joseph Haydn, String Quartet in D major, Op. 64 No. 5, "The Lark" (first part). Played by the Musopen String Quartet. Public domain, via Wikimedia Commons.</p>
  </div>
</div>
</section>

<footer class="sb-foot footer"><b>🏫 Optima Academy Online</b><br>Math · Grade 3 · Lesson 3.12.06 · Unit 12<br><span style="font-size:12px">Art: Oliver Byrne, "The First Six Books of the Elements of Euclid" (London, 1847), public domain, via Wikimedia Commons; marble floor in Herculaneum, photo by AlMare, CC BY-SA 3.0, via Wikimedia Commons. Music: Joseph Haydn, String Quartet Op. 64 No. 5, "The Lark", played by the Musopen String Quartet, public domain, via Wikimedia Commons.</span></footer>'''
html = head + mid + tail
open(OUT, 'w').write(html)
print('wrote', OUT, len(html))
