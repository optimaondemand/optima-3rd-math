# builds src/lesson-3-11-04.html (3.11.04 Subtracting from Kilometers, Chapter 11 "The Meter of Paris", Lesson 4:
# Delambre measures the Melun road, 1798). Story stays on the Warm-Up. The Lesson and Show What You Know tabs are
# plain math: roads of whole kilometers, one kilometer broken into 1,000 m.
import json
src = open('/home/claude/g3sb/tools/make_1101.py').read()
exec(src[:src.index("html = open(")])          # svgw, bond … and the colors
exec(open('/home/claude/s4.py').read().split('on=sum')[0])   # O (Opti notes), V, K
GOLDT, BLUE, PURP = '#5A4300', '#1D4FA8', '#6B46C1'

def c(n): return '{:,}'.format(n)

def road(n_whole, gone, cut, aria, left=True, W=690, cut_lab=None, lock=0):
    # a road: `gone` km taken away (dashed), `n_whole` whole km, one open km; below it the open km drawn large
    # (1,000 m) with `cut` m shaded from 0 (or from `lock`, an earlier part, lighter).
    tot = gone + n_whole + 1; gap = 4; u = (W - 20 - gap * (tot - 1)) / tot; o = []; bx = 0
    for i in range(tot):
        x = 10 + i * (u + gap)
        if i < gone:
            o.append('<rect x="%.1f" y="8" width="%.1f" height="34" rx="4" fill="#F1ECFA" stroke="%s" stroke-width="2" stroke-dasharray="5 4"/><text x="%.1f" y="30" text-anchor="middle" font-size="11" font-weight="900" fill="%s">%s</text>' % (x, u, PURP, x + u / 2, PURP, 'taken away' if u > 70 else '✓'))
        elif i == gone:
            bx = x; o.append('<rect x="%.1f" y="8" width="%.1f" height="34" rx="4" fill="%s" stroke="%s" stroke-width="2"/><text x="%.1f" y="30" text-anchor="middle" font-size="12" font-weight="900" fill="%s">open</text>' % (x, u, RW, RS, x + u / 2, BLUE))
        else:
            o.append('<rect x="%.1f" y="8" width="%.1f" height="34" rx="4" fill="%s" stroke="%s" stroke-width="2"/><text x="%.1f" y="31" text-anchor="middle" font-size="14" font-weight="900" fill="%s">1 km</text>' % (x, u, MW, MS, x + u / 2, GOLDT))
    yS = 92; k = (W - 20) / 1000
    o.append('<polygon points="%.1f,42 %.1f,42 %d,%d 10,%d" fill="%s" opacity=".2"/>' % (bx, bx + u, W - 10, yS, yS, RS))
    o.append('<rect x="10" y="%d" width="%.1f" height="40" rx="3" fill="%s" stroke="%s" stroke-width="2"/>' % (yS, W - 20, RW, RS))
    if lock: o.append('<rect x="10" y="%d" width="%.1f" height="40" fill="#C7B6EE" stroke="%s" stroke-width="1.5"/>' % (yS, lock * k, PURP))
    if cut: o.append('<rect x="%.1f" y="%d" width="%.1f" height="40" fill="%s" opacity=".55"/>' % (10 + lock * k, yS, (cut - lock) * k, PURP))
    for m in range(0, 1001, 10):
        xx = 10 + m * k; big = m % 100 == 0; mid = m % 50 == 0
        o.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="%s"/>' % (xx, yS, xx, yS + (20 if big else 13.6 if mid else 8), NAVY, 1.6 if big else 1))
        if big: o.append('<text x="%.1f" y="%d" text-anchor="%s" font-size="11" font-weight="800" fill="%s">%s</text>' % (xx + (4 if m == 1000 else 0), yS + 36, 'end' if m == 1000 else 'middle', NAVY, c(m)))
    if cut:
        o.append('<text x="%.1f" y="%d" text-anchor="middle" font-size="13" font-weight="900" fill="%s">%s</text>' % (10 + (lock + cut) / 2 * k, yS + 58, PURP, cut_lab or '%s m cut off' % c(cut - lock)))
        if left: o.append('<text x="%.1f" y="%d" text-anchor="middle" font-size="13" font-weight="900" fill="%s">%s m left</text>' % (10 + (cut + 1000) / 2 * k, yS + 58, BLUE, c(1000 - cut)))
    return svgw(W, yS + 66, aria, ''.join(o))

def countup(a, m, b, aria, W=600):
    # count up on a number line: a → m → b, the jumps marked "+ ?"
    def X(v): return 30 + (v - a) / (b - a) * (W - 60)
    o = ['<line x1="20" y1="80" x2="%d" y2="80" stroke="%s" stroke-width="3"/>' % (W - 20, NAVY)]
    for v in (a, m, b):
        o.append('<line x1="%.1f" y1="70" x2="%.1f" y2="90" stroke="%s" stroke-width="3"/><text x="%.1f" y="112" text-anchor="middle" font-size="17" font-weight="900" fill="%s">%s</text>' % (X(v), X(v), NAVY, X(v), NAVY, c(v)))
    for p, q in ((a, m), (m, b)):
        mx = (X(p) + X(q)) / 2; h = 26 + (X(q) - X(p)) * 0.12
        o.append('<path d="M%.1f 70 Q%.1f %.1f %.1f 70" fill="none" stroke="%s" stroke-width="3"/><text x="%.1f" y="%.1f" text-anchor="middle" font-size="16" font-weight="900" fill="%s">+ ?</text>' % (X(p), mx, 70 - 2 * h, X(q), PURP, mx, 70 - h - 6, PURP))
    return svgw(W, 120, aria, ''.join(o))

def N(a, h):
    a = int(a)
    return '[[n:%d|%s~%s]]' % (a, c(a), h) if a >= 1000 else '[[n:%d~%s]]' % (a, h)

html = open('/home/claude/g3sb/src/lesson-3-11-03.html').read()
head = html[:html.index('<div class="sb-prog"')]
tail = html[html.index('<script type="application/json" id="sb-data">'):]
head = head.replace('Kilometers · Grade 3 Math Lesson 3.11.03', 'Subtracting from Kilometers · Grade 3 Math Lesson 3.11.04')
assert 'Lesson 3.11.04' in head

body = r'''<div class="sb-prog" aria-label="Progress"><span class="k">📖 THE METER OF PARIS</span><span class="bar"><i></i></span><span class="n">0 of 8 jobs</span></div>
<div class="sb-wrap">

<header class="sb-head">
  <div class="sb-brand"><img alt="" src="https://raw.githubusercontent.com/optimaondemand/optima-assets/eeb0b335630058906d52f478028361d352253a93/images/Optima%20Final%20Circle%20-%20Owl%20Only.png"><div><b>Optima Academy Online</b><small>An Education Experience Company</small></div></div>
  <h1 class="sb-title">Subtracting from Kilometers</h1>
  <div class="sb-chips">
    <span class="sb-chip lead">Lesson 3.11.04 · Unit 11 · Lesson 4</span>
    <button type="button" class="sb-chip" id="sb-read">🔊 Read aloud</button>
    <button type="button" class="sb-chip" data-pop="#sb-std" aria-expanded="false">Standards ▾</button>
    <button type="button" class="sb-chip" id="sb-music" aria-pressed="false">🎵 Music: off</button>
    <button type="button" class="sb-chip" id="sb-motion" aria-pressed="true">✨ Motion: on</button>
  </div>
  <div class="sb-pop" id="sb-std"><b>MA.3.M.1.2</b> Solve real-world problems involving any of the four operations with whole-number lengths, masses, weights, temperatures or liquid volumes.<br><small>Today: subtract meters, or kilometers and meters, from whole kilometers by breaking one kilometer into 1,000 meters, and check by adding back. Dimensions Math 3B, Chapter 11, Lesson 4 · Subtracting from Kilometers</small></div>
</header>

<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 11">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-melun-plate.jpg}}" alt="An old black-and-white engraving. On a flat road, men in long coats lay long rods end to end, with a town and mountains behind them."><figcaption>Measuring a straight line with long rods, an engraving from 1740</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 11</div>
      <div class="sb-chap-t">The Meter of Paris</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Near Paris, France · about 230 years ago</p>
      <div class="sb-chap-l">Lesson 4 · Subtracting from Kilometers</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How do you take meters away from whole kilometers?</h3>
    EQSVG
    <p style="margin:4px 0 0">Break one kilometer into 1,000 meters. Take the meters from that kilometer, and keep the other kilometers whole.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Break</b> one kilometer into 1,000 meters when you need to take meters away.</li>
      <li><b>Subtract</b> meters, or kilometers and meters, from whole kilometers.</li>
      <li><b>Check</b> your answer by adding back.</li>
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

<div class="sb-opti" data-slot="warm-1">OPTI_WARM</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-11-04-warm.jpg" src="assets/video/g3math-11-04-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Chapter 11: The Long Straight Road</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why Delambre's road?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>This real engraving was made in France in 1740 for a report about measuring the land. It shows how a team measured a long, straight line along the ground: they laid long rods down end to end, one after another. Delambre's team did the same kind of job in 1798, almost 60 years after this picture was made.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-melun-wide.jpg}}" alt="A wide black-and-white engraving. Mountains and a town fill the back. In front, on a flat straight road, small figures in long coats work with long rods laid on the ground." style="object-fit:contain;background:#FBF6EA"><figcaption>Measuring a straight line on the ground with rods.<small>César-François Cassini de Thury, engraving for the French Royal Academy of Sciences, 1740 (Bibliothèque nationale de France). Public domain, via Wikimedia Commons.</small></figcaption></figure>
    <figure class="sb-fig"><img src="{{IMG:sb-melun-detail.jpg}}" alt="A close-up of the engraving: men walk along a straight line on flat ground, two of them holding a long pole level between them." style="object-fit:contain;background:#FBF6EA"><figcaption>Two men carry a long pole along the line.<small>Detail of the same engraving.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">To set the length of the new meter, French scientists measured a long line across France, from Dunkirk in the north to Barcelona in Spain. A big measuring job like this is called a survey. Near the town of Melun, Jean-Baptiste Delambre's team measured a straight road almost 12 kilometers long. That road was their baseline, the one line they measured rod by rod. They laid four metal rulers end to end, each about 4 meters long, again and again. It took them about six weeks.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> a road is measured in whole kilometers, but the part that is done may be only some meters. Break one kilometer into 1,000 meters, take the meters away, and keep the other kilometers whole.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-11-04 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-11-04</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome back to kilometers! Warm up by taking numbers away from 1,000. Then break a kilometer to find out how much of a road is still left to measure.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Taking Away from 1,000</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">One kilometer is 1,000 meters, so today you'll take numbers away from 1,000 a lot. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
      FLUENCY
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! Each kilometer is 1,000 meters, so 6 km 200 m = 6,000 m + 200 m = 6,200 m.">
  <span class="sb-k">Remember from Lesson 3.11.03</span>
  <h3>Kilometers into meters</h3>
  <div class="sb-q">1 km = NR1000 m</div>
  <div class="sb-q">6 km 200 m = NR6200 m</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: Measuring Before Lunch</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">OPTI_THINK</div>
  <p class="sb-story">Today Delambre's team has <b>3 km</b> of road to measure. By lunch, they have measured <b>450 m</b>. How much road is left to measure?</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The road is drawn as 3 whole kilometers in a row. When you break a kilometer, it opens up below as one long ruler, 1,000 meters long, with a marker to cut it.</p></div>
  <div data-mod="cutkm" data-km="3" data-orders="0:450" data-name="think" data-for="break cut"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="break" data-cue=".ck-next"><h4>Break a kilometer</h4><p>Press ✂ Break a kilometer.</p></div>
    <div class="sb-step" data-need="cut" data-cue=".ck-next"><h4>Cut 450 m</h4><p>Drag the marker to 450 on the open kilometer.</p></div>
    <div class="sb-step"><h4>What is left of the open kilometer?</h4>
      <div class="sb-q">1,000 m − 450 m = [[n:550~Count up from 450: 50 more makes 500, then 500 more makes 1,000.]] m</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>What is left of the road?</h4>
      <div class="sb-q">The road still has [[n:2~Count the whole kilometers that are still gold.]] whole kilometers. So 3 km − 450 m = [[n:2~The whole kilometers that were not broken.]] km [[n:550~The meters left in the open kilometer.]] m</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Now write it in meters</h4>
      <div class="sb-q">3 km = N3000 m, and N3000B − 450 = N2550 m</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Tell how</h4>
      <label class="sb-write-l" for="w-think">Tell how you found how much road is left.</label>
      <textarea class="sb-write" id="w-think" data-req data-label="Measuring Before Lunch" placeholder="First I broke … Then I cut … The road still has …"></textarea>
      <div class="sb-chips2">Remember to tell: <span>break a kilometer</span><span>1,000 m</span><span>whole kilometers</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["You can&#39;t cut meters from a whole kilometer. Break one kilometer first.", "The open kilometer has 1,000 m. After you cut 450 m, count up from 450 to 1,000.", "450 + 550 = 1,000, so 550 m are left in the open kilometer. 2 whole kilometers were never touched."]'>💡 Need a hint?</button>{{TOOL:bond-1000}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Atlas has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="atlas">I break only one kilometer. The other kilometers stay whole, so I just count them.</div>
  <div class="sb-payoff" data-after-job="1">
    <div class="sb-art" style="margin:0">PAY1</div>
    <p style="margin:8px 0 0"><b>2 km 550 m are left.</b> One kilometer broke into 1,000 m. 450 m were measured, 550 m were not, and 2 whole kilometers were never touched.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">OPTI_THINKDONE</div>
</section>

<div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="learn" data-go-st="1">Next: the Lesson →</button></div>
</section>

<!-- ══════════════ LESSON ══════════════ -->
<section class="sb-panel tab-panel" id="tab-learn" role="tabpanel">
<div class="sb-path" role="list">
  <button type="button" class="sb-pstep" data-st="1" role="listitem"><span class="num">1</span><span><b>Learn it</b><small>Learn + Your Turn</small></span></button>
  <button type="button" class="sb-pstep" data-st="2" role="listitem"><span class="num">2</span><span><b>Practice together</b><small>Fix 3 mix-ups</small></span></button>
  <button type="button" class="sb-pstep" data-st="3" role="listitem"><span class="num">3</span><span><b>On your own</b><small>1 job</small></span></button>
</div>

<!-- STATION 1 -->
<div class="sb-station" data-st="1">
  <div class="sb-opti" data-slot="learn-1">OPTI_LEARN</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Break a Kilometer</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Break one kilometer, keep the rest</h3>
    KEYSVG
    <ol class="sb-steps4">
      <li><b>Take away the whole kilometers.</b> 6 km − 1 km 240 m: take 1 whole kilometer away. 5 km are left.</li>
      <li><b>Break one kilometer.</b> You can't take meters from a whole kilometer. Break one kilometer into 1,000 m. 5 km is the same as 4 km 1,000 m.</li>
      <li><b>Take the meters from the 1,000.</b> Count up: 240 + 60 = 300, and 300 + 700 = 1,000. So 1,000 − 240 = 760.</li>
      <li><b>Keep the other kilometers.</b> 6 km − 1 km 240 m = 4 km 760 m.</li>
      <li><b>All in meters.</b> 6 km is 6,000 m. 6,000 m − 1,240 m = 4,760 m = 4 km 760 m.</li>
      <li><b>Check by adding back.</b> 4 km 760 m + 1 km 240 m = 5 km 1,000 m = 6 km.</li>
    </ol>
    BONDSVG
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to subtract from kilometers</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>I break just one kilometer. The other kilometers stay whole.</span></div>
      <div class="sb-mate" data-who="felix"><span>I take a whole kilometer away. Then I give back the meters I didn't need.</span></div>
      <div class="sb-mate" data-who="hazel"><span>I count up from the cut to 1,000. That's what is left of the open kilometer.</span></div>
      <div class="sb-mate" data-who="cora"><span>I check by adding back. The parts must make the whole road again.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: 7 km − 2 km 640 m</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A road is <b>7 km</b> long. Take away <b>2 km 640 m</b>. How much is left?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A road of 7 whole kilometers. Take whole kilometers away by tapping them. A broken kilometer opens below as a 1,000 m ruler.</p></div>
    <div data-mod="cutkm" data-km="7" data-orders="2:640" data-name="yt" data-for="km break cut"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="km" data-cue=".ck-next"><h4>Take away the kilometers</h4><p>Tap 2 whole kilometers to take them away.</p></div>
      <div class="sb-step" data-need="break" data-cue=".ck-next"><h4>Break a kilometer</h4><p>Press ✂ Break a kilometer.</p></div>
      <div class="sb-step" data-need="cut" data-cue=".ck-next"><h4>Cut 640 m</h4><p>Drag the marker to 640 on the open kilometer.</p></div>
      <div class="sb-step"><h4>What is left?</h4>
        <div class="sb-q">The open kilometer has 1,000 m − 640 m = [[n:360~Count up from 640 to 700, then to 1,000.]] m left. The road has [[n:4~Count the gold kilometers that are still whole.]] whole kilometers left.</div>
        <div class="sb-q">7 km − 2 km 640 m = [[n:4~The whole kilometers left.]] km [[n:360~The meters left in the open kilometer.]] m</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Check by adding back</h4>
        <div class="sb-q">4 km 360 m + 2 km 640 m: 360 m + 640 m = N1000 m = 1 km. So the total is [[n:7~4 km + 2 km + the new 1 km.]] km.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Take away the 2 whole kilometers first. Then break one more kilometer for the 640 m.", "1,000 − 640: count up 640 → 700 is 60, and 700 → 1,000 is 300. 60 + 300 = 360.", "7 km − 2 km 640 m = 4 km 360 m."]'>💡 Need a hint?</button>{{TOOL:bond-1000}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="hazel">I count up from 640: 60 makes 700, and 300 more makes 1,000. 60 and 300 is 360.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">OPTI_PRACTICE</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Kai Counts a Broken Kilometer</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A road is <b>8 km</b> long. Take away <b>3 km 200 m</b>. Kai says, "5 km 800 m are left."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A road of 8 whole kilometers. Take whole kilometers away by tapping them. A broken kilometer opens below as a 1,000 m ruler.</p></div>
    <div data-mod="cutkm" data-km="8" data-orders="3:200" data-name="kai" data-for="km break cut"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="km" data-cue=".ck-next"><h4>Take away the kilometers</h4><p>Tap 3 whole kilometers to take them away.</p></div>
      <div class="sb-step" data-need="break" data-cue=".ck-next"><h4>Break a kilometer</h4><p>Press ✂ Break a kilometer.</p></div>
      <div class="sb-step" data-need="cut" data-cue=".ck-next"><h4>Cut 200 m</h4><p>Drag the marker to 200 on the open kilometer.</p></div>
      <div class="sb-step"><h4>Count what is left</h4>
        <div class="sb-q">Whole kilometers still on the road: [[n:4~One kilometer was broken. Count only the gold ones.]]</div>
        <div class="sb-q">8 km − 3 km 200 m = [[n:4~The whole kilometers left.]] km [[n:800~1,000 − 200.]] m</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Find Kai's mix-up</h4>
        <div class="sb-q">Kai counted [[n:5~Look at Kai's answer: how many kilometers did he say?]] whole kilometers. He counted the broken kilometer too, so his answer is [[n:1~5 km − 4 km = ?]] km too long.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Kai</h4><label class="sb-write-l" for="w-kai">Tell Kai what happens to the kilometer he broke.</label><textarea class="sb-write" id="w-kai" data-req data-label="Help Kai" placeholder="When you break a kilometer, it … so you have …"></textarea><div class="sb-chips2">Remember to tell: <span>the broken kilometer</span><span>1,000 m</span><span>whole kilometers</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["After you take away 3 km, 5 km are left. But you need 200 m too, so one more kilometer has to break.", "The broken kilometer is not whole anymore. It is in the open ruler now.", "4 whole kilometers + 800 m: 8 km − 3 km 200 m = 4 km 800 m."]'>💡 Need a hint?</button><button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="atlas">When I break a kilometer, I take one away from the whole kilometers. Then I count only the gold ones.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Leo Breaks It Into 100</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A road is <b>3 km</b> long. Take away <b>70 m</b>. Leo says, "100 − 70 = 30, so 2 km 30 m are left."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A road of 3 whole kilometers. A broken kilometer opens below as a ruler. Look at the number at its end.</p></div>
    <div data-mod="cutkm" data-km="3" data-orders="0:70" data-name="leo" data-for="break cut"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="break" data-cue=".ck-next"><h4>Break a kilometer</h4><p>Press ✂ Break a kilometer.</p></div>
      <div class="sb-step" data-need="cut" data-cue=".ck-next"><h4>Cut 70 m</h4><p>Drag the marker to 70 on the open kilometer.</p></div>
      <div class="sb-step"><h4>How long is the open kilometer?</h4>
        <div class="sb-q">The open kilometer goes from 0 to NL1000 m, not 100 m.</div>
        <div class="sb-q">1,000 m − 70 m = [[n:930~Count up from 70 to 100, then from 100 to 1,000.]] m</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>What is left?</h4>
        <div class="sb-q">3 km − 70 m = [[n:2~The whole kilometers left.]] km [[n:930~The meters left in the open kilometer.]] m</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Leo</h4><label class="sb-write-l" for="w-leo">Tell Leo why 100 is the wrong number here.</label><textarea class="sb-write" id="w-leo" data-req data-label="Help Leo" placeholder="A meter breaks into … but a kilometer breaks into …"></textarea><div class="sb-chips2">Remember to tell: <span>1,000 m</span><span>100 cm</span><span>kilometer</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Leo used 100, like a meter broken into centimeters. A kilometer is bigger.", "1 km = 1,000 m. Take 70 from 1,000.", "70 + 30 = 100, and 100 + 900 = 1,000. So 1,000 − 70 = 930, and 3 km − 70 m = 2 km 930 m."]'>💡 Need a hint?</button><button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="cora">A meter breaks into 100 centimeters. A kilometer breaks into 1,000 meters. I say it before I start.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Juno Writes the Wrong Part</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A road is <b>6 km</b> long. Take away <b>900 m</b>. Juno says, "5 km 900 m are left."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A road of 6 whole kilometers. A broken kilometer opens below as a 1,000 m ruler. The part you cut off turns purple.</p></div>
    <div data-mod="cutkm" data-km="6" data-orders="0:900" data-name="juno" data-for="break cut"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="break" data-cue=".ck-next"><h4>Break a kilometer</h4><p>Press ✂ Break a kilometer.</p></div>
      <div class="sb-step" data-need="cut" data-cue=".ck-next"><h4>Cut 900 m</h4><p>Drag the marker to 900 on the open kilometer.</p></div>
      <div class="sb-step"><h4>Read the open kilometer</h4>
        <div class="sb-q">The purple part, cut off: [[n:900~Read where the purple part ends.]] m. The part still left: [[n:100~From 900 to the end at 1,000.]] m.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>What is left?</h4>
        <div class="sb-q">6 km − 900 m = [[n:5~The whole kilometers left.]] km [[n:100~The meters still left in the open kilometer.]] m</div>
        <div class="sb-q">Juno wrote the part that was [[w:cut off|cut|taken away|taken|cut away~Is 900 m the purple part or the part still left?]], not the part that is left.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Juno</h4><label class="sb-write-l" for="w-juno">Tell Juno how to check her answer by adding back.</label><textarea class="sb-write" id="w-juno" data-req data-label="Help Juno" placeholder="Add your answer to the 900 m … If you get … it is right."></textarea><div class="sb-chips2">Remember to tell: <span>cut off</span><span>left</span><span>add back</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Look at the open kilometer. Which part is purple, and which part is not?", "900 m were cut off. 1,000 − 900 = 100 m are still left in the open kilometer.", "5 whole kilometers + 100 m: 6 km − 900 m = 5 km 100 m. Check: 5 km 100 m + 900 m = 6 km."]'>💡 Need a hint?</button><button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="felix">I add my answer back to the part I took away. If I don't get the whole road, I wrote the wrong part.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">OPTI_OWN</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>On Your Own: Two Roads</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A long road is <b>9 km</b>. Take away <b>2 km 480 m</b>. Then a short road is <b>1 km</b>. Take away <b>340 m</b>.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The long road: 9 whole kilometers. Take whole kilometers away by tapping them. A broken kilometer opens below as a 1,000 m ruler.</p></div>
    <div data-mod="cutkm" data-km="9" data-orders="2:480" data-name="own" data-for="km break cut"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="km" data-cue=".ck-next"><h4>Take away the kilometers</h4><p>Tap 2 whole kilometers to take them away.</p></div>
      <div class="sb-step" data-need="break" data-cue=".ck-next"><h4>Break a kilometer</h4><p>Press ✂ Break a kilometer.</p></div>
      <div class="sb-step" data-need="cut" data-cue=".ck-next"><h4>Cut 480 m</h4><p>Drag the marker to 480 on the open kilometer.</p></div>
      <div class="sb-step"><h4>The long road</h4>
        <div class="sb-q">9 km − 2 km 480 m = [[n:6~Count the whole kilometers still on the road.]] km [[n:520~1,000 − 480. Count up from 480.]] m</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>The short road</h4>
        OWNSVG
        <div class="sb-q">1 km − 340 m = [[n:660~Count up from 340: 60 makes 400, then 600 more makes 1,000.]] m</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Tell how you know</h4><label class="sb-write-l" for="w-own">Tell how you found what is left of the long road, step by step.</label><textarea class="sb-write" id="w-own" data-req data-label="9 km − 2 km 480 m" placeholder="First I took away … Then I broke … So …"></textarea><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Take away the 2 whole kilometers first. Then break one more kilometer for the 480 m.", "1,000 − 480: count up 480 → 500 is 20, and 500 → 1,000 is 500. 1,000 − 340: 340 → 400 is 60, 400 → 1,000 is 600.", "9 km − 2 km 480 m = 6 km 520 m. 1 km − 340 m = 660 m."]'>💡 Need a hint?</button>{{TOOL:bond-1000}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">OPTI_SWYK</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>Two Parts in a Row</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">A road is <b>6 km</b> long. Part 1 measured is <b>2 km 350 m</b>. Part 2 measured is <b>1 km 550 m</b>. Take them away one at a time. How much of the road is left to measure?</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A road of 6 whole kilometers. Tap a whole kilometer to take it away. A broken kilometer opens below as a 1,000 m ruler, and each part you cut stays shaded on it.</p></div>
  <div data-mod="cutkm" data-km="6" data-orders="2:350,1:550" data-name="wow" data-for="km1 break1 cut1 km2 cut2"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="km1" data-cue=".ck-next"><h4>Problem 1 · Part 1: take away the kilometers</h4><p>Tap 2 whole kilometers to take them away.</p></div>
    <div class="sb-step" data-need="break1" data-cue=".ck-next"><h4>Problem 1 · Part 1: break a kilometer</h4><p>Press ✂ Break a kilometer.</p></div>
    <div class="sb-step" data-need="cut1" data-cue=".ck-next"><h4>Problem 1 · Part 1: cut 350 m</h4><p>Drag the marker to 350 on the open kilometer.</p></div>
    <div class="sb-step"><h4>Problem 1 · What is left after part 1?</h4>
      <div class="sb-q">6 km − 2 km 350 m = [[n:3~Count the gold kilometers still on the road.]] km [[n:650~1,000 − 350. Count up from 350.]] m</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step" data-need="km2" data-cue=".ck-next"><h4>Problem 2 · Part 2: take away the kilometer</h4><p>Tap 1 whole kilometer to take it away.</p></div>
    <div class="sb-step" data-need="cut2" data-cue=".ck-next"><h4>Problem 2 · Part 2: cut 550 m</h4><p>The open kilometer still has 650 m. Drag the marker to cut 550 m more.</p></div>
    <div class="sb-step"><h4>Problem 2 · What is left after part 2?</h4>
      <div class="sb-q">3 km 650 m − 1 km 550 m = [[n:2~3 km − 1 km. Did you break another kilometer this time?]] km [[n:100~650 − 550 = ?]] m</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Part 1: take away 2 whole kilometers, then break one more kilometer for the 350 m.", "After part 1, the open kilometer has 650 m. Part 2&#39;s 550 m comes out of those 650 m, so you don&#39;t need to break another kilometer. Just take 1 whole kilometer away.", "3 km 650 m, then 3 km − 1 km = 2 km and 650 − 550 = 100, so 2 km 100 m."]'>💡 Need a hint?</button></div>
  <div class="sb-hintbox"></div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  PROVESVG
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Look back at Job 1: 3 km − 450 m. Tell the steps you follow every time you take meters away from kilometers. Then show one more way to check your answer.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="Step 1: I … Step 2: I … Step 3: … To check, I …"></textarea><div class="sb-chips2">Remember to tell: <span>break a kilometer</span><span>1,000 m</span><span>add back</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! Take away 4 km, then break one kilometer: 1,000 − 75 = 925. So 10 km − 4 km 75 m = 5 km 925 m. Check: 5 km 925 m + 4 km 75 m = 9 km 1,000 m = 10 km.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Ten Kilometers</h3>
  <p>A road is 10 km long. Take away 4 km 75 m. How much is left?</p>
  <div class="sb-q">10 km − 4 km 75 m = [[n:5~Take away 4 km, then one more kilometer breaks for the 75 m.]] km [[n:925~1,000 − 75. Count up from 75 to 100, then to 1,000.]] m</div>
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
    <li><span class="bx"></span><span>I broke one kilometer into 1,000 m and kept the other kilometers whole.</span></li>
    <li><span class="bx"></span><span>I checked an answer by adding back.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.11.05 · Liters and Milliliters</h3>
  <p>Next time, you'll measure something new: how much water a bottle or a cup can hold, in liters and milliliters.</p>
</div>

<div class="sb-opti" data-slot="end-1">OPTI_END</div>
<div class="sb-card sb-listen" data-src="haydn-104-andante.mp3">
  <img src="{{IMG:sb-melun-plate.jpg}}" alt="Measuring a straight line with long rods, an engraving from 1740" style="object-fit:cover;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>The "London" Symphony</h3>
    <p style="margin:2px 0">The slow part of a symphony by Joseph Haydn, first played in London in 1795. The tune walks along, calm and steady, then grows big and strong before it turns gentle again.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">MUSICCREDIT</p>
  </div>
</div>
</section>

<footer class="sb-foot footer"><b>🏫 Optima Academy Online</b><br>Math · Grade 3 · Lesson 3.11.04 · Unit 11<br><span style="font-size:12px">Art: "Mesure d'une base à la perche," César-François Cassini de Thury, engraving for the French Royal Academy of Sciences (1740), public domain, via Wikimedia Commons. Music: MUSICFOOT</span></footer>
</div>

'''
MUSIC = {"credit": "Symphony No. 104 in D major, \"London,\" Hob. I:104, second part (Andante), Joseph Haydn (1795). Played by The Evergreen Symphony Orchestra. CC BY 3.0, via Wikimedia Commons.", "foot": "Haydn, Symphony No. 104 \"London,\" II. Andante, The Evergreen Symphony Orchestra, CC BY 3.0, via Wikimedia Commons."}
NUMS = {'NR1000': N(1000, 'One kilometer is ten hundreds of meters.'), 'NR6200': N(6200, '6 km is 6,000 m. Add the 200 m.'),
        'N3000B': '3,000', 'N3000': N(3000, 'Each kilometer is 1,000 m.'), 'N2550': N(2550, '3,000 − 450. Take 450 from one of the thousands: 1,000 − 450 = 550.'),
        'NL1000': N(1000, 'Read the number at the end of the open kilometer.'), 'N1000': N(1000, '360 + 640. Add the hundreds, then the tens.'),
        'MUSICCREDIT': MUSIC['credit'], 'MUSICFOOT': MUSIC['foot']}
for k2, v2 in NUMS.items():
    assert k2 in body, k2
    body = body.replace(k2, v2)
FL = [('1,000 − 100', 900), ('1,000 − 800', 200), ('1,000 − 500', 500), ('1,000 − 700', 300), ('1,000 − 650', 350), ('1,000 − 50', 950), ('1,000 − 90', 910), ('1,000 − 20', 980), ('5,000 − 1,000', 4000), ('8,000 − 1,000', 7000)]
flu = ['<div class="fluency-item"><span class="fluency-q">%s =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%s"></div>' % (q, a, q.replace('−', 'minus')) for q, a in FL]
rep = {
 'OPTI_WARM': O['warm-1'], 'OPTI_THINKDONE': O['think-done'], 'OPTI_THINK': O['think-1'], 'OPTI_LEARN': O['learn-1'],
 'OPTI_PRACTICE': O['practice-1'], 'OPTI_OWN': O['own-1'], 'OPTI_SWYK': O['swyk-1'], 'OPTI_END': O['end-1'],
 'EQSVG': road(5, 0, 0, 'Six whole kilometers of road. Five are still whole, and one kilometer is open, drawn large below with marks from 0 to 1,000 meters.', left=False),
 'FLUENCY': '\n      '.join(flu),
 'PAY1': '<div>%s%s</div>' % (road(2, 0, 450, 'The road after lunch: 2 whole kilometers, and the open kilometer with 450 meters cut off and 550 meters left.'),
                               bond('1,000 m', '450 m done', '550 m left', 'One kilometer, 1,000 meters, splits into the 450 meters measured and the 550 meters left.')),
 'KEYSVG': road(4, 1, 240, 'Six kilometers of road: 1 kilometer taken away, 4 whole kilometers, and the open kilometer with 240 meters cut off and 760 meters left.'),
 'BONDSVG': bond('1,000 m', '240 m', '760 m', 'One kilometer, 1,000 meters, splits into 240 meters and 760 meters.'),
 'OWNSVG': countup(340, 400, 1000, 'A number line from 340 to 1,000 with a mark at 400. One jump goes from 340 to 400 and another from 400 to 1,000. Each jump is labeled plus question mark.'),
 'PROVESVG': road(2, 0, 450, 'The road from Job 1: 2 whole kilometers, and the open kilometer with 450 meters cut off.', left=False, cut_lab='450 m measured'),
}
for kk in ['OPTI_THINKDONE']:
    body = body.replace(kk, rep.pop(kk))
for kk, vv in rep.items():
    assert kk in body, kk
    body = body.replace(kk, vv)
out = head + body + tail
open('/home/claude/g3sb/src/lesson-3-11-04.html', 'w').write(out)
print('ok', len(out))
