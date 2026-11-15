# builds src/lesson-3-11-01.html (3.11.01 Meters and Centimeters, Chapter 11 "The Meter of Paris": the marble meter, 1796)
import json
exec(open('/home/claude/g3sb/tools/helpers1002.py').read())
MW, MS, RW, RS, NAVY = '#F6DE94', '#B8902A', '#EAF3FF', '#8FB2DA', '#0E1C42'
def stick(x, y, w, cm, kind='meter', v0=0, h=34, end_lab=False):
    # a meter stick (wood) or centimeter ruler (blue), `cm` long, drawn w px wide, ticks every cm, labels every 10
    k = w / cm; fill, st = (MW, MS) if kind == 'meter' else (RW, RS)
    o = ['<rect x="%.1f" y="%d" width="%.1f" height="%d" rx="3" fill="%s" stroke="%s" stroke-width="2"/>' % (x, y, w, h, fill, st)]
    step = 1 if k >= 2.2 else 5
    for i in range(0, cm + 1, step):
        v = v0 + i; big = v % 10 == 0; mid = v % 5 == 0; xx = x + i * k
        o.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="%s"/>' % (xx, y, xx, y + (h * .5 if big else h * .34 if mid else h * .2), NAVY, 1.6 if big else 1))
        if big and (0 < i < cm or (i == 0 and v == 0) or (i == cm and end_lab)):
            o.append('<text x="%.1f" y="%d" text-anchor="middle" font-size="11" font-weight="800" fill="%s">%d</text>' % (xx, y + h - 4, NAVY, v))
    return ''.join(o)
def svgw(W, H, aria, body): return '<svg viewBox="0 0 %d %d" role="img" aria-label="%s" style="display:block;width:100%%;max-width:%dpx;margin:6px 0">%s</svg>' % (W, H, aria, W, body)
def bond(whole, a, b, aria, W=360):
    # number bond: whole on top, two parts below
    o = ['<line x1="%d" y1="44" x2="%d" y2="96" stroke="#5B6478" stroke-width="3"/><line x1="%d" y1="44" x2="%d" y2="96" stroke="#5B6478" stroke-width="3"/>' % (W / 2, W / 4, W / 2, 3 * W / 4)]
    for cx, cy, t, c in ((W / 2, 30, whole, '#0E1C42'), (W / 4, 112, a, '#8A6A00'), (3 * W / 4, 112, b, '#1D4FA8')):
        o.append('<rect x="%d" y="%d" width="130" height="38" rx="19" fill="#fff" stroke="%s" stroke-width="3"/><text x="%d" y="%d" text-anchor="middle" font-size="19" font-weight="900" fill="%s">%s</text>' % (cx - 65, cy - 19, c, cx, cy + 7, c, t))
    return svgw(W, 136, aria, ''.join(o))
def sticks_row(n, extra, aria, W=690, show_cm=True):
    # n meter sticks end to end (each one labeled 1 m) and then `extra` cm on a short piece
    unit = (W - 20) / (n + 0.6); o = []
    for i in range(n):
        x = 10 + i * unit
        o.append('<rect x="%.1f" y="10" width="%.1f" height="30" rx="3" fill="%s" stroke="%s" stroke-width="2"/><text x="%.1f" y="31" text-anchor="middle" font-size="14" font-weight="900" fill="#5A4300">1 m</text>' % (x, unit, MW, MS, x + unit / 2))
    xe = 10 + n * unit; we = unit * extra / 100
    o.append('<rect x="%.1f" y="10" width="%.1f" height="30" rx="3" fill="%s" stroke="%s" stroke-width="2"/>' % (xe, max(we, 4), RW, RS))
    if show_cm: o.append('<text x="%.1f" y="62" text-anchor="middle" font-size="14" font-weight="900" fill="#1D4FA8">%d cm</text>' % (xe + we / 2, extra))
    o.append('<text x="%.1f" y="62" text-anchor="middle" font-size="14" font-weight="900" fill="#5A4300">%d meter sticks</text>' % (10 + n * unit / 2, n))
    return svgw(W, 72, aria, ''.join(o))
def juno():
    # Juno's 76 cm next to one meter stick: it doesn't reach the end
    k = 560 / 100; o = [stick(10, 30, 560, 100, 'meter', end_lab=True), '<text x="10" y="22" font-size="13" font-weight="900" fill="#5B6478">ONE METER STICK · 100 cm</text>']
    o.append('<text x="10" y="96" font-size="13" font-weight="900" fill="#5B6478">JUNO\'S 94 cm</text><rect x="10" y="104" width="%.1f" height="26" rx="13" fill="#FDECEA" stroke="#B23A2E" stroke-width="2.5"/>' % (94 * k))
    o.append('<line x1="%.1f" y1="26" x2="%.1f" y2="138" stroke="#C9A227" stroke-width="2.5" stroke-dasharray="5 4"/>' % (10 + 94 * k, 10 + 94 * k))
    return svgw(600, 144, 'One meter stick, 100 centimeters long. Under it, Juno\'s 94 centimeters is a red bar that stops before the end of the meter stick.', ''.join(o))
def crayon():
    k = 560 / 15; o = [stick(10, 60, 560, 15, 'ruler')]
    o.append('<rect x="10" y="22" width="%.1f" height="28" rx="6" fill="#4E7A1A"/><polygon points="%.1f,22 %.1f,36 %.1f,50" fill="#4E7A1A"/><rect x="18" y="28" width="%.1f" height="16" rx="3" fill="#fff" opacity=".6"/>' % (9 * k - 22, 10 + 9 * k - 22, 10 + 9 * k, 10 + 9 * k - 22, 9 * k - 50))
    o.append('<text x="12" y="16" font-size="13" font-weight="900" fill="#5B6478">CRAYON</text>')
    return svgw(590, 104, 'A green crayon lying on a centimeter ruler. Its flat end is on 0.', ''.join(o))
def eq():
    o = [stick(10, 24, 560, 100, 'meter', end_lab=True), '<text x="10" y="16" font-size="13" font-weight="900" fill="#5A4300">1 METER</text>',
         '<text x="290" y="86" text-anchor="middle" font-size="15" font-weight="900" fill="#0E1C42">100 centimeters</text>']
    return svgw(580, 94, 'One meter stick with marks from 0 to 100. One meter is 100 centimeters.', ''.join(o))
def laid(L, objname, fill, aria):
    # the object with the meter stick and the 60 cm ruler laid on it (Key idea card, payoffs)
    k = 670 / 165; o = ['<text x="10" y="14" font-size="13" font-weight="900" fill="#5B6478">%s</text>' % objname.upper(),
                        '<rect x="10" y="20" width="%.1f" height="30" rx="4" fill="%s" stroke="#5A3A1A" stroke-width="2"/>' % (L * k, fill),
                        stick(10, 58, 100 * k, 100, 'meter'), stick(10 + 100 * k, 58, 60 * k, 60, 'ruler'),
                        '<line x1="%.1f" y1="16" x2="%.1f" y2="98" stroke="#C9A227" stroke-width="2.5" stroke-dasharray="5 4"/>' % (10 + L * k, 10 + L * k),
                        '<text x="%.1f" y="112" text-anchor="middle" font-size="12" font-weight="800" fill="#5A4300">meter stick · 1 m</text>' % (10 + 50 * k),
                        '<text x="%.1f" y="112" text-anchor="middle" font-size="12" font-weight="800" fill="#1D4FA8">centimeter ruler</text>' % (10 + 130 * k)]
    return svgw(690, 118, aria, ''.join(o))

html = open('/home/claude/g3sb/src/lesson-3-10-07.html').read()
head = html[:html.index('<div class="sb-prog"')]
tail = html[html.index('<script type="application/json" id="sb-data">'):]
head = head.replace('Adding and Subtracting Fractions, Part 2 · Grade 3 Math Lesson 3.10.07', 'Meters and Centimeters · Grade 3 Math Lesson 3.11.01')
assert 'Lesson 3.11.01' in head

body = r'''<div class="sb-prog" aria-label="Progress"><span class="k">📖 THE METER OF PARIS</span><span class="bar"><i></i></span><span class="n">0 of 8 jobs</span></div>
<div class="sb-wrap">

<header class="sb-head">
  <div class="sb-brand"><img alt="" src="https://raw.githubusercontent.com/optimaondemand/optima-assets/eeb0b335630058906d52f478028361d352253a93/images/Optima%20Final%20Circle%20-%20Owl%20Only.png"><div><b>Optima Academy Online</b><small>An Education Experience Company</small></div></div>
  <h1 class="sb-title">Meters and Centimeters</h1>
  <div class="sb-chips">
    <span class="sb-chip lead">Lesson 3.11.01 · Unit 11 · Lesson 1</span>
    <button type="button" class="sb-chip" id="sb-read">🔊 Read aloud</button>
    <button type="button" class="sb-chip" data-pop="#sb-std" aria-expanded="false">Standards ▾</button>
    <button type="button" class="sb-chip" id="sb-music" aria-pressed="false">🎵 Music: off</button>
    <button type="button" class="sb-chip" id="sb-motion" aria-pressed="true">✨ Motion: on</button>
  </div>
  <div class="sb-pop" id="sb-std"><b>MA.3.M.1.1</b> Select and use appropriate tools to measure the length of an object, the volume of liquid within a beaker and temperature on a thermometer.<br><small>Today: measure lengths longer than 1 meter with a meter stick and a centimeter ruler, and write a length in meters and centimeters or in centimeters only. Dimensions Math 3B, Chapter 11, Lesson 1 · Meters and Centimeters</small></div>
</header>

<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 11">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-mesures-plate.jpg}}" alt="An old black-and-white print of three people. One pours a drink into a measuring cup, one weighs things on a balance, and a man holds up a long stick to measure a piece of cloth."><figcaption>Using the new measures, a print made in Paris in 1800</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 11</div>
      <div class="sb-chap-t">The Meter of Paris</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Paris, France · about 230 years ago</p>
      <div class="sb-chap-l">Lesson 1 · Meters and Centimeters</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How are meters and centimeters related?</h3>
    EQSVG
    <p style="margin:4px 0 0">One meter is 100 centimeters. A length can be written in meters and centimeters, or in centimeters only.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Measure</b> things longer than 1 meter with a meter stick and a centimeter ruler.</li>
      <li><b>Write</b> one length two ways: in meters and centimeters, and in centimeters only.</li>
      <li><b>Compare</b> two lengths after you write them in the same unit.</li>
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
  <video controls preload="metadata" playsinline poster="assets/video/g3math-11-01-warm.jpg" src="assets/video/g3math-11-01-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Chapter 11: The Meter of Paris</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why the meter?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>On the left is a real print sold in Paris in 1800, when France was changing to new measures. Each small picture shows one new measure in use. In picture 3, a man measures cloth with a meter stick. On the right is a real marble meter on a wall in Paris. People could hold their own measuring sticks up to it to check them.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-mesures-detail.jpg}}" alt="A man in a long coat holds a long stick against a piece of cloth with a flower pattern. The cloth rolls off a small table." style="object-fit:contain;background:#FBF6EA"><figcaption>Measuring cloth with the new meter.<small>Usages des Nouvelles Mesures, L. F. Labrousse after J. P. Delion, Paris, 1800 (detail). Public domain, via Wikimedia Commons.</small></figcaption></figure>
    <figure class="sb-fig"><img src="{{IMG:sb-metre-wall.jpg}}" alt="A long white marble stone set into a stone wall. The word METRE is carved on it, and a thin metal bar with marks runs along it." style="object-fit:contain;background:#fff"><figcaption>A marble meter, still on a wall in Paris.<small>36 rue de Vaugirard. Photo by Airair, 2008, CC BY-SA 3.0, via Wikimedia Commons.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">In the 1790s, two French scientists measured a long line across the land, from Dunkirk in France to Barcelona in Spain. They did it to decide exactly how long one meter should be. In 1796 and 1797, Paris set 16 marble meters into walls around the city, so anyone could check a measuring stick. Two of them are still there today.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> one meter is 100 centimeters. When something is longer than one meter stick, measure the rest with a centimeter ruler. Then say the length two ways.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-11-01 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-11-01</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to Unit 11, Measurement! Warm up with hundreds. Then measure a piece of cloth that is longer than one meter stick, just like a shop in Paris long ago.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Hundreds</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">One meter is 100 centimeters, so today you'll use hundreds a lot. Warm up with these. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
      FLUENCY
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! The crayon starts at 0, so its other end tells the length: 9 centimeters. Today you'll start at 0 every time.">
  <span class="sb-k">Remember from 2nd grade</span>
  <h3>How long is the crayon?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A crayon lying on a centimeter ruler. The flat end of the crayon is on 0.</p></div>
  CRAYONSVG
  <div class="sb-q">The crayon is [[n:9~Read the mark at the pointed end of the crayon.]] centimeters long.</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: The Cloth Check</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">OPTI_THINK</div>
  <p class="sb-story">Paris, 1796. A cloth seller wants to check a piece of cloth with the new meter. The cloth is longer than one meter stick. How long is it?</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The cloth is at the top. The gold line shows where the cloth ends. Below are two tools: a meter stick, which is exactly 1 meter long, and a centimeter ruler.</p></div>
  <div data-mod="mstick" data-mode="lay" data-len="137" data-obj="cloth" data-label="cloth" data-name="think" data-for="stick ruler"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="stick"><h4>Lay the meter stick</h4><p>Drag the meter stick onto the cloth.</p></div>
    <div class="sb-step" data-need="ruler" data-cue='[aria-label="Centimeter ruler"]'><h4>Measure the rest</h4><p>Drag the centimeter ruler to the end of the meter stick.</p></div>
    <div class="sb-step"><h4>Read the tools</h4>
      <div class="sb-q">The cloth is [[n:1~The meter stick is 1 meter.]] m [[n:37~Read the ruler at the gold line, where the cloth ends.]] cm long.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Now in centimeters only</h4>
      <div class="sb-q">1 m is 100 cm. So the cloth is 100 cm + 37 cm = [[n:137~Add the 100 centimeters in the meter stick to the 37 on the ruler.]] cm.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Two ways to say it</h4>
      <label class="sb-write-l" for="w-think">Write the cloth's length two ways. How do you know both ways are the same length?</label>
      <textarea class="sb-write" id="w-think" data-req data-label="The Cloth Check" placeholder="The cloth is … and also … because 1 meter is …"></textarea>
      <div class="sb-chips2">Remember to tell: <span>meters and centimeters</span><span>100 cm</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Start with the meter stick at the left end of the cloth. That covers 1 meter.", "The ruler shows how much cloth is left past the meter stick: 37 cm.", "1 meter and 37 centimeters. 1 meter is 100 centimeters, and 100 + 37 = 137."]'>💡 Need a hint?</button>{{TOOL:ruler-m}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Atlas has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="atlas">I count the meter sticks first. Then I read the little ruler for the centimeters that are left.</div>
  <div class="sb-payoff" data-after-job="1">
    <div class="sb-art" style="margin:0">PAY1</div>
    <p style="margin:8px 0 0"><b>Same cloth, two ways.</b> 1 m 37 cm and 137 cm are the same length. The meter stick is the 100 centimeters.</p>
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
    <div class="cap">🎬 One Meter, One Hundred Centimeters</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>One meter is 100 centimeters</h3>
    KEYSVG
    <ol class="sb-steps4">
      <li><b>Start at 0.</b> Lay the meter stick at the end of the thing you measure. That is 1 meter.</li>
      <li><b>Measure the rest.</b> Put the centimeter ruler where the meter stick ends. Read the mark where the thing ends.</li>
      <li><b>Meters and centimeters to centimeters only.</b> Each meter is 100 centimeters. A rope that is 1 m 46 cm is 100 cm + 46 cm = 146 cm.</li>
      <li><b>Centimeters only to meters and centimeters.</b> Every hundred centimeters makes 1 meter. A path that is 935 cm is 9 m 35 cm.</li>
      <li><b>Watch the zero.</b> 8 m 3 cm is 800 cm + 3 cm = 803 cm, not 83 cm.</li>
    </ol>
    BONDSVG
    <p style="margin:4px 0 0">When you write one length using two units, like 1 m 46 cm, you are using <b>meters and centimeters together</b>.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to work with meters and centimeters</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>I always start at 0. Then I count meter sticks.</span></div>
      <div class="sb-mate" data-who="felix"><span>Each meter is a hundred. 8 meters are 8 hundreds, so 800 centimeters.</span></div>
      <div class="sb-mate" data-who="hazel"><span>I split a big number of centimeters: the hundreds are meters, the rest are centimeters.</span></div>
      <div class="sb-mate" data-who="cora"><span>Before I compare two lengths, I write them both in centimeters.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: The Shelf Board</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A carpenter in Paris cuts a shelf board. The board is <b>152 cm</b> long. He wants to write its length in meters and centimeters.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The board is at the top, and the gold line shows where it ends. The meter stick and the centimeter ruler are below.</p></div>
    <div data-mod="mstick" data-mode="lay" data-len="152" data-obj="board" data-label="board" data-name="yt" data-for="stick ruler"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="stick"><h4>Lay the meter stick</h4><p>Drag the meter stick onto the board.</p></div>
      <div class="sb-step" data-need="ruler" data-cue='[aria-label="Centimeter ruler"]'><h4>Measure the rest</h4><p>Drag the centimeter ruler to the end of the meter stick.</p></div>
      <div class="sb-step"><h4>Meters and centimeters</h4>
        <div class="sb-q">152 cm = [[n:1~One meter stick is 100 cm. How many meter sticks fit?]] m [[n:52~Read the ruler at the gold line. Or take 100 away from 152.]] cm</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Now the other way</h4>
        <p>His curtain rod is <b>8 m 90 cm</b> long.</p>
        ROD8
        <div class="sb-q">8 m = [[n:800~Each meter is 100 cm. 8 meters are 8 hundreds.]] cm, so the rod is [[n:890~Add the 90 cm to the 800 cm.]] cm long.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Lay the meter stick first, then the ruler.", "152 = 100 + 52. The 100 cm is 1 meter.", "8 meters is 800 cm. 800 + 90 = 890."]'>💡 Need a hint?</button>{{TOOL:bond-m}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="hazel">I split 152 into 100 and 52. The 100 is one meter, and the 52 stays centimeters.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">OPTI_PRACTICE</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Juno Loses the Zero</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A rope maker's rope is <b>9 m 4 cm</b> long. Juno writes it in centimeters and says, "Ninety-four centimeters!"</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The top picture shows the rope as 9 meter sticks and 4 more centimeters. The bottom picture puts Juno's 94 centimeters next to one meter stick.</p></div>
    ROPE7
    JUNOSVG
    <div class="sb-steps">
      <div class="sb-step"><h4>Look at Juno's answer</h4>
        <div class="sb-q">Juno's 94 cm is [[w:shorter|less|smaller|shorter than|less than|smaller than~Look where the red bar stops. Does it reach the end of one meter stick?]] than one meter stick.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>The meters first</h4>
        <div class="sb-q">9 m = [[n:900~9 meter sticks. Each one is 100 cm.]] cm</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Add the centimeters</h4>
        <div class="sb-q">9 m 4 cm = 900 cm + 4 cm = [[n:904~900 + 4. There are no tens, so the tens place gets a 0.]] cm</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Juno</h4><label class="sb-write-l" for="w-juno">Tell Juno why 9 m 4 cm is 904 cm and not 94 cm.</label><textarea class="sb-write" id="w-juno" data-req data-label="Help Juno" placeholder="9 meters is … so … The zero shows…"></textarea><div class="sb-chips2">Remember to tell: <span>900</span><span>zero</span></div>
        <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["A rope that is 9 meters long can&#39;t be shorter than one meter stick.", "9 meters is 9 hundreds: 900 centimeters.", "900 + 4 = 904. The 0 in the middle says there are no tens."]'>💡 Need a hint?</button><button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="felix">Meters are hundreds. I write the hundreds first, then the centimeters. If there are no tens, I put a 0 there.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Leo Starts at 1</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Leo measures a quill pen. He lines up its end with the 1 on the ruler. Then he reads the mark at the tip and says, "Nineteen centimeters."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A quill pen, the feather pen people wrote with long ago, lying on a centimeter ruler. The red line shows where its end is now.</p></div>
    <div data-mod="mstick" data-mode="start" data-r="25" data-s="1" data-len="18" data-obj="quill" data-label="quill pen" data-name="leo" data-for="zero"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="zero"><h4>Start at zero</h4><p>Drag the quill pen so its end is on 0.</p></div>
      <div class="sb-step"><h4>Read the length</h4>
        <div class="sb-q">The quill pen is [[n:18~Read the mark at the tip of the quill.]] cm long.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>How far off was Leo?</h4>
        <div class="sb-q">Leo said 19 cm. He was [[n:1~19 − 18 = ?]] cm too long.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Leo</h4><label class="sb-write-l" for="w-leo">Tell Leo where to line up the quill pen, and why.</label><textarea class="sb-write" id="w-leo" data-req data-label="Help Leo" placeholder="Line up the end with … because …"></textarea><div class="sb-chips2">Remember to tell: <span>0</span><span>too long</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Starting at 1 counts one extra centimeter.", "Slide the quill pen so its end is on 0. Then read the tip.", "The tip is at 18. 19 − 18 = 1, so Leo was 1 cm too long."]'>💡 Need a hint?</button>{{TOOL:ruler-cm}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="atlas">I put one end on 0 every time. Then the number at the other end is the length.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Kai Picks the Bigger Number</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Kai has a cord that is <b>98 cm</b> long. He says, "My cord is longer than 1 meter, because 98 is bigger than 1."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Kai's blue cord lying on a meter stick. The meter stick is exactly 1 meter long. The red line shows where the cord starts now.</p></div>
    <div data-mod="mstick" data-mode="start" data-r="100" data-s="1" data-len="98" data-obj="cord" data-label="cord" data-name="kai" data-for="zero"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="zero"><h4>Line them up</h4><p>Drag the cord so its end is on 0.</p></div>
      <div class="sb-step"><h4>Look at the cord</h4>
        <div class="sb-q">The cord is [[w:shorter|less|smaller|shorter than|less than|smaller than~Look at the end of the cord. Does it reach 100?]] than 1 meter.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Same unit first</h4>
        <p>Next, Kai compares <b>1 m 2 cm</b> and <b>97 cm</b>. He says 97 cm is longer.</p>
        <div class="sb-q">1 m 2 cm = [[n:102~1 meter is 100 cm. Add the 2 cm.]] cm</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym"><h4>Compare</h4><p>Drag the right symbol into the box.</p></div>
      <div class="sb-step"><h4>Help Kai</h4><label class="sb-write-l" for="w-kai">Tell Kai what to do before he compares two lengths.</label><textarea class="sb-write" id="w-kai" data-req data-label="Help Kai" placeholder="First write both lengths in … Then …"></textarea><div class="sb-chips2">Remember to tell: <span>same unit</span><span>100 cm</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="sym" data-a="102 cm" data-b="97 cm" data-ans=">" data-wrong="<" data-who="Kai" data-name="kai-sym" data-for="sym"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["98 centimeters and 1 meter use different units. Change 1 meter to centimeters first.", "1 m = 100 cm, and 98 is less than 100.", "1 m 2 cm = 102 cm, and 102 is greater than 97."]'>💡 Need a hint?</button><button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="cora">I never compare meters with centimeters. I change them to the same unit, and then I compare.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">OPTI_OWN</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>The Seller's Order Book</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A seller in Paris writes two lengths in his order book. A table is <b>1 m 68 cm</b> long. A garden wall is <b>738 cm</b> long. Write each one the other way.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The table with a meter stick and a centimeter ruler already laid along it. The gold line shows where the table ends.</p></div>
    <div data-mod="mstick" data-mode="show" data-len="168" data-obj="table" data-label="table" data-name="own"></div>
    <div class="sb-steps">
      <div class="sb-step"><h4>The table</h4>
        <div class="sb-q">1 m 68 cm = [[n:168~1 meter is 100 cm. Add the 68 cm.]] cm</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>The garden wall</h4>
        <div class="sb-q">738 cm = [[n:7~How many hundreds are in 738? Each hundred is 1 meter.]] m [[n:38~What is left after the hundreds?]] cm</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Tell how you know</h4><label class="sb-write-l" for="w-own">Tell how you changed 738 cm into meters and centimeters.</label><textarea class="sb-write" id="w-own" data-req data-label="The seller's order book" placeholder="738 has … hundreds, so … The rest …"></textarea><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Each meter is 100 centimeters.", "1 m 68 cm = 100 + 68. 738 = 700 + 38.", "168 cm. 700 cm is 7 m, so 738 cm is 7 m 38 cm."]'>💡 Need a hint?</button>{{TOOL:bond-m2}}</div>
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
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>Check It on the Marble Meter</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">You are the cloth seller now! A customer wants two ribbons. Cut each one to the right length on the marble meter. A centimeter ruler sits right after it.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The white stone is the marble meter, exactly 1 meter long. The blue centimeter ruler starts where the marble meter ends. The purple ribbon starts at 0, and you can drag its ✂ end.</p></div>
  <div data-mod="mstick" data-mode="cut" data-t="108,141" data-obj="ribbon" data-label="ribbon" data-name="wow" data-for="cut1 cut2"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="cut1"><h4>Problem 1 · Cut 1 m 8 cm</h4><p>Drag the ✂ end of the ribbon to 1 m 8 cm.</p></div>
    <div class="sb-step ms-say1"><h4>Problem 1 · Say it in centimeters</h4>
      <div class="sb-q">1 m 8 cm = [[n:108~The marble meter is 100 cm. Add the 8 cm on the ruler. There are no tens.]] cm</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step" data-need="cut2"><h4>Problem 2 · Cut 141 cm</h4><p>Drag the ✂ end of the ribbon to 141 cm.</p></div>
    <div class="sb-step ms-say2"><h4>Problem 2 · Say it in meters and centimeters</h4>
      <div class="sb-q">141 cm = [[n:1~The marble meter is 1 meter.]] m [[n:41~141 − 100 = ?]] cm</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["The whole marble meter is 1 meter. Go past it onto the ruler.", "1 m 8 cm: past the marble meter, then 8 on the ruler. 141 cm is 100 cm and 41 cm.", "108 cm. 141 cm = 1 m 41 cm, so stop at 41 on the ruler."]'>💡 Need a hint?</button></div>
  <div class="sb-hintbox"></div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  PROVESVG
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Look back at the cloth from Job 1. Show how you found its length in meters and centimeters, and in centimeters only. Use words, numbers or a picture.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="First I laid … Then I read … So the cloth is … which is also …"></textarea><div class="sb-chips2">Remember to tell: <span>meter stick</span><span>ruler</span><span>100 cm</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! 8 m 6 cm is 800 + 6 = 806 cm. 860 cm is more, and 860 − 806 = 54, so the wire is 54 cm longer.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Rope or Wire?</h3>
  <p>A rope is 8 m 6 cm long. A wire is 860 cm long. Which is longer, and by how many centimeters?</p>
  <div class="sb-q">8 m 6 cm = [[n:806~8 meters is 800 cm. Add 6.]] cm. The [[w:wire|the wire~Compare 806 cm and 860 cm.]] is longer by [[n:54~860 − 806 = ?]] cm.</div>
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
    <li><span class="bx"></span><span>I measured past one meter and wrote a length two ways.</span></li>
    <li><span class="bx"></span><span>I showed in my math journal how I changed meters to centimeters.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.11.02 · Subtracting from Meters</h3>
  <p>Next time, the cloth seller cuts some ribbon off a long piece. You'll take centimeters away from whole meters and find out how much is left.</p>
</div>

<div class="sb-opti" data-slot="end-1">OPTI_END</div>
<div class="sb-card sb-listen" data-src="haydn-101-clock-andante.mp3">
  <img src="{{IMG:sb-mesures-plate.jpg}}" alt="Using the new measures, a print made in Paris in 1800" style="object-fit:cover;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>The "Clock" Symphony</h3>
    <p style="margin:2px 0">The slow part of a symphony by Joseph Haydn, first played in London in 1794. Listen for the steady tick, tock under the tune, even and regular like the marks on a meter stick.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Symphony No. 101 in D major, "The Clock," Hob. I:101, second part (Andante), Joseph Haydn (1794). Recording by The Geneva Camerata, via Wikimedia Commons, CC BY 3.0.</p>
  </div>
</div>
</section>

<footer class="sb-foot footer"><b>🏫 Optima Academy Online</b><br>Math · Grade 3 · Lesson 3.11.01 · Unit 11<br><span style="font-size:12px">Art: Usages des Nouvelles Mesures, L. F. Labrousse after J. P. Delion (Paris, 1800), public domain, via Wikimedia Commons. Photo: the marble meter at 36 rue de Vaugirard, Paris, by Airair (2008), CC BY-SA 3.0, via Wikimedia Commons. Music: Haydn, Symphony No. 101 "The Clock," II. Andante, played by The Geneva Camerata, CC BY 3.0, via Wikimedia Commons.</span></footer>
</div>

'''
S = json.load(open('/home/claude/scripts1101.json'))
notes = {k[len('g3m-3-11-01-'):]: v for k, v in S.items()}
FL = [('100 + 25', 125), ('100 + 9', 109), ('900 + 18', 918), ('900 + 6', 906), ('500 + 62', 562), ('8 × 100', 800), ('9 × 100', 900), ('100 + 63', 163), ('500 + 9', 509), ('8 hundreds + 5 ones', 805)]
flu = '\n      '.join('<div class="fluency-item"><span class="fluency-q">%s =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%s"></div>' % (q, a, q.replace('×', 'times').replace('+', 'plus')) for q, a in FL)
rep = {
 'OPTI_WARM': notes['warm-1'], 'OPTI_THINKDONE': notes['think-done'], 'OPTI_THINK': notes['think-1'], 'OPTI_LEARN': notes['learn-1'],
 'OPTI_PRACTICE': notes['practice-1'], 'OPTI_OWN': notes['own-1'], 'OPTI_SWYK': notes['swyk-1'], 'OPTI_END': notes['end-1'],
 'EQSVG': eq(), 'FLUENCY': flu, 'CRAYONSVG': crayon(),
 'PAY1': '<div>%s%s</div>' % (laid(137, 'cloth', '#F3E7C9', 'The cloth with the meter stick and the centimeter ruler laid along it. The cloth ends at 37 on the ruler.'), bond('137 cm', '1 m = 100 cm', '37 cm', '137 centimeters splits into 1 meter, which is 100 centimeters, and 37 centimeters.')),
 'KEYSVG': laid(146, 'rope', '#C9A46A', 'A rope with a meter stick and a centimeter ruler laid along it. The rope ends at 46 on the ruler: 1 meter 46 centimeters.'),
 'BONDSVG': bond('935 cm', '900 cm = 9 m', '35 cm', '935 centimeters splits into 900 centimeters, which is 9 meters, and 35 centimeters.'),
 'ROD8': sticks_row(8, 90, '8 meter sticks end to end and 90 more centimeters.'),
 'ROPE7': sticks_row(9, 4, 'The rope: 9 meter sticks end to end and 4 more centimeters.'),
 'JUNOSVG': juno(),
 'PROVESVG': laid(137, 'cloth', '#F3E7C9', 'The cloth from Job 1 with the meter stick and the ruler laid along it.'),
}
for k in ['OPTI_THINKDONE']:
    body = body.replace(k, rep.pop(k))
for k, v in rep.items():
    assert k in body, k
    body = body.replace(k, v)
out = head + body + tail
open('/home/claude/g3sb/src/lesson-3-11-01.html', 'w').write(out)
print('ok', len(out))
