# builds src/lesson-3-10-01.html (3.10.01 Equivalent Fractions, Bach's measures)
DCOL = {1:'#0E1C42',2:'#6B46C1',3:'#B05E09',4:'#8A6A00',5:'#4E7A1A',6:'#2F6FDE',7:'#B03A2E',8:'#A23B8C',9:'#2E7D6B',10:'#117E7E',11:'#8C2F6E',12:'#5B6478'}
def strips(rows, W=600, label=True, aria=''):
    # rows: list of (shaded, parts); one strip per row, same length; fraction label at right
    h = 46*len(rows)+12; out = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s" style="display:block;width:100%%;max-width:%dpx">' % (W+80, h, aria, W+80)]
    for r,(k,n) in enumerate(rows):
        y = 6+46*r; w = (W-10)/n; c = DCOL[n]
        for i in range(n):
            out.append('<rect x="%.1f" y="%d" width="%.1f" height="34" fill="%s" stroke="%s" stroke-width="2"/>' % (10+i*w, y, w, c if i<k else '#fff', c))
        if label:
            out.append('<text x="%d" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="%s">%d</text><line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2"/><text x="%d" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="%s">%d</text>' % (W+40, y+12, c, k, W+32, y+17, W+48, y+17, c, W+40, y+32, c, n))
    k0,n0 = rows[0]; gx = 10+(W-10)*k0/n0
    out.append('<line x1="%.1f" y1="2" x2="%.1f" y2="%d" stroke="#C9A227" stroke-width="3" stroke-dasharray="5 4"/>' % (gx, gx, h-2))
    out.append('</svg>'); return ''.join(out)
def fr(a,b): return '<span class="fr"><span>%s</span><span>%s</span></span>' % (a,b)
def lines(n1, n2, k1, k2, W=600):
    out=['<svg viewBox="0 0 %d 170" role="img" aria-label="Two number lines from 0 to 1, one in %ss and one in %ss. A dot at %d out of %d on the top line and %d out of %d on the bottom line land on the same spot." style="display:block;width:100%%;max-width:%dpx">' % (W+40, 'fifth' if n1==5 else str(n1), 'tenth' if n2==10 else str(n2), k1,n1,k2,n2, W+40)]
    for r,(n,k) in enumerate(((n1,k1),(n2,k2))):
        y=40+80*r; c=DCOL[n]
        out.append('<line x1="20" y1="%d" x2="%d" y2="%d" stroke="#1F2A44" stroke-width="3" stroke-linecap="round"/>' % (y, W+20, y))
        for q in range(n+1):
            x=20+q*W/n; big = q in (0,n)
            out.append('<line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="%s" stroke-width="%s"/>' % (x, y-(13 if big else 9), x, y+(13 if big else 9), '#1F2A44' if big else c, 3 if big else 2.5))
        out.append('<text x="20" y="%d" text-anchor="middle" font-size="16" font-weight="900" fill="#1F2A44">0</text><text x="%d" y="%d" text-anchor="middle" font-size="16" font-weight="900" fill="#1F2A44">1</text>' % (y+34, W+20, y+34))
        x=20+k*W/n
        out.append('<circle cx="%.1f" cy="%d" r="9" fill="#1E7A4C" stroke="#fff" stroke-width="3"/><text x="%.1f" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="#1E7A4C">%d</text><line x1="%.1f" y1="%d" x2="%.1f" y2="%d" stroke="#1E7A4C" stroke-width="2"/><text x="%.1f" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="#1E7A4C">%d</text>' % (x, y, x, y+30, k, x-8, y+35, x+8, y+35, x, y+51, n))
    x=20+k1*W/n1; out.append('<line x1="%.1f" y1="44" x2="%.1f" y2="116" stroke="#C9A227" stroke-width="2" stroke-dasharray="5 5"/>' % (x,x))
    out.append('</svg>'); return ''.join(out)

HINT = lambda h: h.replace("'", '&#39;')
html = open('/home/claude/g3sb/src/lesson-3-09-04.html').read()
head = html[:html.index('<div class="sb-prog"')]
tail = html[html.index('<script type="application/json" id="sb-data">'):]
head = head.replace('Comparing Fractions with Like Numerators · Grade 3 Math Lesson 3.09.04', 'Equivalent Fractions · Grade 3 Math Lesson 3.10.01')

body = r'''<div class="sb-prog" aria-label="Progress"><span class="k">📖 BACH'S MEASURES</span><span class="bar"><i></i></span><span class="n">0 of 8 jobs</span></div>
<div class="sb-wrap">

<header class="sb-head">
  <div class="sb-brand"><img alt="" src="https://raw.githubusercontent.com/optimaondemand/optima-assets/eeb0b335630058906d52f478028361d352253a93/images/Optima%20Final%20Circle%20-%20Owl%20Only.png"><div><b>Optima Academy Online</b><small>An Education Experience Company</small></div></div>
  <h1 class="sb-title">Equivalent Fractions</h1>
  <div class="sb-chips">
    <span class="sb-chip lead">Lesson 3.10.01 · Unit 10 · Lesson 1</span>
    <button type="button" class="sb-chip" id="sb-read">🔊 Read aloud</button>
    <button type="button" class="sb-chip" data-pop="#sb-std" aria-expanded="false">Standards ▾</button>
    <button type="button" class="sb-chip" id="sb-music" aria-pressed="false">🎵 Music: off</button>
    <button type="button" class="sb-chip" id="sb-motion" aria-pressed="true">✨ Motion: on</button>
  </div>
  <div class="sb-pop" id="sb-std"><b>MA.3.FR.2.2</b> Identify equivalent fractions and explain why they are equivalent.<br><small>Dimensions Math 3B, Chapter 10, Lesson 1 · Equivalent Fractions</small></div>
</header>

<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 10">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-bach-plate.jpg}}" alt="A painting of Johann Sebastian Bach in a dark coat and a white wig. He holds a small page of music."><figcaption>Johann Sebastian Bach, painted in 1748</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 10</div>
      <div class="sb-chap-t">Bach's Measures</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Leipzig, Germany · about 300 years ago</p>
      <div class="sb-chap-l">Lesson 1 · Equivalent Fractions</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How can two fractions with different numbers name the same amount?</h3>
    EQSVG
    <p style="margin:4px 0 0">Same whole, same length shaded. One-fifth and two-tenths are two names for the same amount.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Split</b> every part of a whole into the same number of pieces and give the same amount a new name.</li>
      <li><b>Group</b> equal parts into bigger parts to find another name.</li>
      <li><b>Explain</b> why equivalent fractions name the same amount.</li>
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

<div class="sb-opti" data-slot="warm-1">Hoo, welcome to Chapter 10! Let's open our old book to a new time and place: Leipzig, Germany, about 300 years ago. Meet Johann Sebastian Bach. He wrote music, and in his music, one measure is one whole. Bach could fill a measure in many ways: one long note, or shorter notes that take the same time. Let's listen.</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-10-01-warm.jpg" src="assets/video/g3math-10-01-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Chapter 10: Bach's Measures</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why Bach?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A real painting of Johann Sebastian Bach, made in 1748 when he was 63 years old. He holds a small page of music he wrote. Bach worked in Leipzig for 27 years. Every week he wrote music for the church and taught the boys at the school next door.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-bach-haussmann.jpg}}" alt="A painting of Johann Sebastian Bach. He wears a dark coat and a white wig and holds a small page of music." style="object-position:50% 25%"><figcaption>Bach holds a page of his own music.<small>Elias Gottlob Haussmann, Johann Sebastian Bach, 1748. Public domain.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0"><b>Today's math:</b> in music, a <b>measure</b> is one whole. Different notes can fill the same amount of time. Today you'll find fractions that look different but fill the same amount.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-10-01 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-10-01</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to Chapter 10! Start with the times-8 fact warm-up. Then share one measure between two players and listen for the same beat.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Multiply by 8: Double, Double, Double</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">To multiply by 8, double the number three times. 8 × 3: 3, 6, 12, 24. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
FLUENCY
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! One of 6 equal parts is one-sixth, and 6 sixths make 1 whole.">
  <span class="sb-k">Remember from Chapter 9</span>
  <h3>One equal part</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A strip cut into 6 equal parts. One part is shaded.</p></div>
  REVIEWSVG
  <div class="sb-q">One part of 6 equal parts: [[fr:1:6~Count all the equal parts. That number goes on the bottom.]]</div>
  <div class="sb-q">[[n:6~How many equal parts make the whole strip?]] sixths make 1 whole.</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: Two Players, One Measure</h3><span class="sb-kind">🔨 Do · listen</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">Two players share one measure. The top player plays two one-third notes. Build the bottom row from twelfths until it ends on the same beat. Press Play to check. How many twelfths did it take?</div>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is one whole measure of music. The top player's row has 2 one-third tiles. The bottom player's row is empty. Every tile plays a note that lasts as long as the tile is long. The gold line shows where the top player stops.</p>
    <div class="sb-how"><div><b>What to do:</b> Build the bottom row, then play both rows.</div></div></div>
  <div data-mod="beat" data-a="3,3" data-d="12" data-name="think"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="build"><h4>Build the bottom row from twelfths</h4><p>Tap the one-twelfth tile in the tray to add it to the bottom row. Stop when the bottom row ends on the gold line.</p></div>
    <div class="sb-step" data-need="play"><h4>Press ▶ Play both rows</h4><p>Listen. Do both players stop on the same beat?</p></div>
    <div class="sb-step"><h4>Name both rows</h4>
      <div class="sb-q">The bottom row has [[n:8~Count the one-twelfth tiles in the bottom row.]] one-twelfth tiles.</div>
      <div class="sb-q">The top row is [[fr:2:3~The top row has 2 tiles, and each tile is one-third.]] of the measure. The bottom row is [[fr:8:12~How many twelfths are in the bottom row? That number goes on top.]] of the measure.</div>
      <label class="sb-write-l" for="w-think">What did you hear? What did you see?</label>
      <textarea class="sb-write" id="w-think" data-req data-label="What I heard and saw" placeholder="I heard… I saw…"></textarea>
      <div class="sb-chips2">Remember to tell: <span>same beat</span><span>same length</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
      <div class="sb-fb" aria-live="polite"></div>
    </div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='HINTS1'>💡 Need a hint?</button>{{TOOL:fbars-3-12}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Hazel has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="hazel">Each one-third tile is as long as 4 one-twelfth tiles. Count the twelfths under each third.</div>
  <div class="sb-payoff" data-after-job="1">
    PAYOFF1
    <p style="margin:8px 0 0"><b>Different tiles, same length.</b> Two-thirds and eight-twelfths fill the same amount of the measure: FR23 = FR812.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">You heard it! Both rows ended on the same beat. Two-thirds and eight-twelfths fill the same amount. In the Lesson, you'll learn a word for this.</div>
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
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. It has three stops. First, learn what equivalent fractions are. Next, we fix some mix-ups together. Then you try one on your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Same Amount, New Name</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Equivalent fractions name the same amount.</h3>
    LEARNSTRIPS
    <p style="margin:2px 0 12px">Split every fifth into 2 equal pieces. Now there are 10 pieces, and 2 are shaded. The shaded part did not change. FR15 = FR210.</p>
    LEARNLINES
    <ol class="sb-steps4">
      <li><b>Same whole.</b> Only compare parts of the same whole: strips or number lines that are the same length.</li>
      <li><b>Split every part the same way.</b> The numerator and the denominator change. The shaded amount does not.</li>
      <li><b>Or group the parts the same way.</b> Equal groups make fewer, bigger parts. The shaded amount stays the same.</li>
      <li><b>Check.</b> The shaded parts end at the same place, and the fractions land on the same spot on a number line. <b>Equivalent</b> sounds like <b>equal</b>: same amount, new name.</li>
    </ol>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to see one-fifth and two-tenths</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>Same strip, and the shading stops at the same place.</span></div>
      <div class="sb-mate" data-who="felix"><span>Split each fifth in 2. One part becomes 2 parts, and 5 parts become 10.</span></div>
      <div class="sb-mate" data-who="hazel"><span>On the number lines, FR15 and FR210 land on the same spot.</span></div>
      <div class="sb-mate" data-who="cora"><span>FR15 = FR210. Different names, same amount.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: Find the Twin</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Bach's music rule is 1 meter long. One edge is marked in <b>sixths</b> and the other edge in <b>twelfths</b>. Find the twelfths mark that lines up with <b>five-sixths</b>.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Two number lines from 0 to 1, the same length. The top line is cut into sixths. The bottom line is cut into twelfths.</p>
      <div class="sb-how"><div><b>What to do:</b> Put a dot on each line, then name the twin.</div></div></div>
    <div data-mod="nl2" data-n="6" data-n2="12" data-ka="5" data-kb="10" data-same="1" data-rows="Sixths,Twelfths" data-name="yt-lines"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="top"><h4>Put the top dot on five-sixths</h4><p>Drag the red dot on the sixths line 5 jumps from 0. You can also tap a mark.</p></div>
      <div class="sb-step" data-need="bot"><h4>Put the bottom dot right under the top dot</h4><p>Drag the red dot on the twelfths line until it sits right under the top dot.</p></div>
      <div class="sb-step"><h4>Name the twin</h4><div class="sb-q">Five-sixths is the same spot as [[fr:10:12~Count the jumps on the twelfths line, from 0 to the dot.]].</div><div class="sb-q">Each sixth is the same length as [[n:2~How many twelfths jumps fit in one sixths jump?]] twelfths.</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='HINTS2'>💡 Need a hint?</button>{{TOOL:nl-12}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="felix">I count by twos on the twelfths line: every 2 twelfths make 1 sixth.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. A clue: the wholes must be the same size, and the parts must be equal. Then look at the length, not just the numbers.</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Ava's Bigger Numbers</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Ava says, "4 and 12 are bigger numbers than 1 and 3, so <b>four-twelfths</b> is more than <b>one-third</b>." She wrote FR412 &gt; FR13.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Fraction tiles: a bar of twelfths and a bar of thirds under 1 whole. Then Ava's comparison. Her symbol is in the box, marked "Ava's".</p>
      <div class="sb-how"><div><b>What to do:</b> Shade both bars, then fix Ava's symbol.</div></div></div>
    <div data-mod="cmp" data-kind="tiles" data-da="12" data-db="3" data-a="4" data-b="1" data-rows="Twelfths,Thirds" data-name="ava-tiles" data-for="a b"></div>
    <div data-mod="sym" data-a="4/12" data-b="1/3" data-ans="=" data-wrong=">" data-who="Ava" data-name="ava-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="a"><h4>Shade 4 tiles in the twelfths bar</h4><p>Tap the 4th tile in the twelfths bar.</p></div>
      <div class="sb-step" data-need="b"><h4>Shade 1 tile in the thirds bar</h4><p>Tap the 1st tile in the thirds bar.</p></div>
      <div class="sb-step"><h4>Where does the shading stop?</h4><div class="sb-q">The shading in both bars stops at the [[w:same|same place|same spot~Look at where the shading ends in each bar.]] place.</div><div class="sb-q">So four-twelfths is [[w:equal|the same|same|equivalent~Is one shaded part longer, or are they the same length?]] to one-third.</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym"><h4>Fix Ava's symbol</h4><p>Drag a new symbol into the box.</p></div>
      <div class="sb-step"><h4>Help Ava</h4><label class="sb-write-l" for="w-ava">Tell Ava why bigger numbers do not mean a bigger amount.</label><textarea class="sb-write" id="w-ava" data-req data-label="Help Ava" placeholder="The shaded parts are…"></textarea><div class="sb-chips2">Remember to tell: <span>same length</span><span>smaller pieces</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='HINTS3'>💡 Need a hint?</button>{{TOOL:fbars-3-12}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="cora">Twelfths are tiny pieces, so it takes more of them to fill the same length.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Leo's Paper Strips</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Leo made two paper strips to show <b>two-fifths</b> and <b>four-tenths</b>. He says they are not equal, because the shading does not stop at the same place. Look closely at his bottom strip.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is 1 whole. The top strip is cut into 5 equal parts with 2 shaded. Leo's bottom strip has 10 parts with 4 shaded. The dashed line shows where 1 whole ends.</p>
      <div class="sb-how"><div><b>What to do:</b> Fix the length, fix the cuts, then compare.</div></div></div>
    <div data-mod="fixstrip" data-ta="2" data-da="5" data-tb="4" data-db="10" data-name="leo"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="whole" data-cue=".fx-end"><h4>Make the bottom strip 1 whole</h4><p>Drag the gold end of the bottom strip to the dashed line. You can also tap it.</p></div>
      <div class="sb-step" data-need="equal"><h4>Make the 10 parts equal</h4><p>Press <b>✂ Re-cut into 10 equal parts</b>.</p></div>
      <div class="sb-step"><h4>Compare again</h4><div class="sb-q">Now the shading stops at the [[w:same|same place|same spot~Look at the gold line.]] place. Two-fifths and four-tenths are [[w:equivalent|equal|the same|same~Same whole, same shaded length. What do we call them?]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Fix Leo's thinking</h4><label class="sb-write-l" for="w-leo">What two things did Leo need to fix?</label><textarea class="sb-write" id="w-leo" data-req data-label="Fix Leo's thinking" placeholder="First, his strip… Second, his parts…"></textarea><div class="sb-chips2">Remember to tell: <span>same whole</span><span>equal parts</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='HINTS4'>💡 Need a hint?</button>{{TOOL:fbars-5-10}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="atlas">Before I compare, I check two things: Are the wholes the same size? Are the parts equal?</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Group the Tenths</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Bach's student shaded <b>8 tenths</b> of a strip. Group the tenths in pairs to find a name with fewer, bigger parts.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A strip cut into 10 equal parts, with 8 shaded. A small gold dot sits on every line between two parts. Tap a dot to make that line a thick group line.</p>
      <div class="sb-how"><div><b>What to do:</b> Make groups of 2 tenths, then name the new fraction.</div></div></div>
    <div data-mod="group" data-d="10" data-sh="8" data-size="2" data-name="group"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="group" data-cue=".gp-line"><h4>Make a group line after every 2 tenths</h4><p>Tap the gold dot after the 2nd tenth. Then tap the dots after the 4th, the 6th and the 8th tenth.</p></div>
      <div class="sb-step"><h4>Name the bigger parts</h4><div class="sb-q">Now there are [[n:5~Count the bigger parts between the thick lines.]] bigger equal parts, and [[n:4~Count the bigger parts that are shaded.]] of them are shaded.</div><div class="sb-q">Eight-tenths is equal to [[fr:4:5~How many bigger parts are shaded, out of how many bigger parts in all?]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='HINTS5'>💡 Need a hint?</button>{{TOOL:fbars-5-10}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="felix">Grouping is splitting backwards. 2 tenths go back together into 1 fifth.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn to work on your own. Split every piece into two equal pieces. The shaded part stays the same length. Only its name changes.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>Split the Fifths</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Bach's music copier filled <b>three-fifths</b> of a page with notes. Split every fifth into 2 equal pieces. What is the new name?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A strip cut into 5 equal parts, with 3 shaded, under 1 whole. The buttons split every piece at once.</p>
      <div class="sb-how"><div><b>What to do:</b> Split every piece in 2, then name it.</div></div></div>
    <div data-mod="split" data-d="5" data-sh="3" data-by="2" data-name="split"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="split"><h4>Split every piece in 2</h4><p>Press <b>✂ Split every piece in 2</b>.</p></div>
      <div class="sb-step"><h4>Name it</h4><div class="sb-q">Now there are [[n:10~Count all the equal parts now.]] equal parts, and [[n:6~Count the shaded parts now.]] are shaded.</div><div class="sb-q">Three-fifths is equal to [[fr:6:10~How many shaded parts, out of how many equal parts in all?]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Tell why</h4><label class="sb-write-l" for="w-own">Why is the shaded amount the same after you split the pieces?</label><textarea class="sb-write" id="w-own" data-req data-label="Why the amount stayed the same" placeholder="Every piece was split…"></textarea><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='HINTS6'>💡 Need a hint?</button>{{TOOL:fbars-5-10}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! Show what you know. Fill one of Bach's measures any way you like. Then press Play and listen to your music.</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>Fill Bach's Measure</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">Write your own measure of music. Use any notes you like, but the measure must be exactly <b>1 whole</b>. Then play it with the start of a real piece by Bach.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is 1 whole measure. The tray has a half note tile, a quarter note tile and an eighth note tile. Each tile plays its note for as long as the tile is long.</p>
    <div class="sb-how"><div><b>What to do:</b> Fill the measure, play it, then write what you see.</div></div></div>
  <div data-mod="measure" data-name="measure"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="full"><h4>Problem 1 · Fill the measure</h4><p>Tap the note tiles in the tray to add them. Keep going until the measure is exactly full.</p></div>
    <div class="sb-step" data-need="play"><h4>Problem 1 · Play it</h4><p>Press <b>▶ Play my measure with Bach</b>.</p></div>
    <div class="sb-step"><h4>Problem 2 · Write what you see</h4><label class="sb-write-l" for="w-measure">Find two parts of your measure that take the same amount of time. Write them as two equivalent fractions, and tell how you know.</label><textarea class="sb-write" id="w-measure" data-req data-label="Two equivalent fractions in my measure" placeholder="These notes… take the same time as… so…"></textarea><div class="sb-chips2">Remember to tell: <span>which notes</span><span>same length</span><span>two fractions</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Pick a fraction. Split every piece into the same number of smaller pieces. Write your two fractions. Then explain why they are equivalent.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="I picked… I split every piece into… So… is equal to… because…"></textarea><div class="sb-chips2">Remember to tell: <span>same whole</span><span>every piece split the same way</span><span>same amount</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! One-fourth is the same amount as 2 eighths and as 3 twelfths.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Three Names for One Amount</h3>
  <p>Fill in the numerators so all three fractions name the same amount.</p>
  <div class="sb-q" style="font-size:22px">FR14 = <span class="sb-frac">[[n:2~Each fourth splits into 2 eighths.]]<i></i><input class="sb-ans" data-a="8" value="8" readonly aria-label="bottom number 8"></span> = <span class="sb-frac">[[n:3~Each fourth splits into 3 twelfths.]]<i></i><input class="sb-ans" data-a="12" value="12" readonly aria-label="bottom number 12"></span></div>
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
    <li><span class="bx"></span><span>I sketched my Prove It strips in my math journal.</span></li>
    <li><span class="bx"></span><span>I wrote two equivalent fractions from my own measure.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.10.02 · Finding Equivalent Fractions</h3>
  <p>Today you split and grouped strips to find equivalent fractions. Next, you'll find a shortcut: what happens to the numerator and the denominator when every piece is split the same way?</p>
</div>

<div class="sb-opti" data-slot="end-1">Before you go, listen to Bach's music for a group of string players. Hear the long notes and quick notes fit together. Press play, and press stop whenever you like.</div>
<div class="sb-card sb-listen" data-src="bach-brandenburg-3-1.mp3">
  <img src="{{IMG:sb-bach-haussmann.jpg}}" alt="The painting of Johann Sebastian Bach">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>Bach · Brandenburg Concerto No. 3, first part</h3>
    <p style="margin:2px 0">Written about 300 years ago for nine string players and a keyboard. About 5 minutes.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Johann Sebastian Bach, Brandenburg Concerto No. 3 in G major, BWV 1048, first movement. Recording from the Al Goldstein collection (Pandora Music, ibiblio.org), Wikimedia Commons, CC BY-SA 2.0.</p>
  </div>
</div>
</section>

<footer class="sb-foot footer"><b>🏫 Optima Academy Online</b><br>Math · Grade 3 · Lesson 3.10.01 · Unit 10<br><span style="font-size:12px">Art: Elias Gottlob Haussmann, Johann Sebastian Bach (1748), public domain. Music: Bach, Brandenburg Concerto No. 3, BWV 1048, first movement, Al Goldstein collection, Wikimedia Commons, CC BY-SA 2.0. Measure tool: the start of Bach's Prelude in C, BWV 846, played in the page.</span></footer>
</div>

'''
fl = ''.join('      <div class="fluency-item"><span class="fluency-q">8 × %d =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="8 times %d"></div>\n' % (k, 8*k, k) for k in (3,6,4,7,9,5,8,2))
import json
H = {
 'HINTS1': ["Tap the small tile in the tray. Each tap adds one twelfth.", "Watch the gold line. The bottom row must end right on it.", "One third is as long as 4 twelfths. Two thirds is as long as 2 groups of 4 twelfths."],
 'HINTS2': ["Count 5 jumps from 0 on the sixths line.", "Move the bottom dot until it is straight under the top dot.", "Every sixth is 2 twelfths. 5 sixths is 5 groups of 2 twelfths."],
 'HINTS3': ["Shade the tiles first. Then look at where the shading stops.", "Twelfths are smaller tiles, so you need more of them to cover the same length.", "If the shaded parts are the same length, the fractions are equal. Use =."],
 'HINTS4': ["Drag the gold end of the bottom strip all the way to the dashed line.", "Then press the ✂ button so all 10 parts are the same size.", "Same whole and equal parts: now look at the gold line."],
 'HINTS5': ["A group line goes after every 2 tenths.", "Tap the dots after tenth number 2, 4, 6 and 8.", "Count the bigger parts, then count the shaded bigger parts."],
 'HINTS6': ["Press the button that splits every piece in 2.", "Every shaded fifth became 2 shaded tenths.", "3 fifths, each split in 2, makes 6 tenths."],
}
for k,v in H.items(): body = body.replace("'"+k+"'", "'"+HINT(json.dumps(v))+"'")
body = body.replace('FLUENCY\n', fl)
body = body.replace('EQSVG', strips([(1,5),(2,10)], aria='Two strips of the same length. One-fifth of the top strip is shaded. Two-tenths of the bottom strip is shaded. The shading stops at the same place.'))
body = body.replace('REVIEWSVG', strips([(1,6)], label=False, aria='A strip cut into 6 equal parts. One part is shaded.').replace('<line x1="', '<line data-x x1="',1) if False else strips([(1,6)], label=False, aria='A strip cut into 6 equal parts. One part is shaded.'))
body = body.replace('PAYOFF1', strips([(2,3),(8,12)], aria='Two strips of the same length. Two-thirds of the top strip is shaded. Eight-twelfths of the bottom strip is shaded. The shading stops at the same place.'))
body = body.replace('LEARNSTRIPS', strips([(1,5),(2,10)], aria='Two strips of the same length. One-fifth is shaded on the top strip. Every fifth is split in 2 on the bottom strip, and two-tenths are shaded. The shading stops at the same place.'))
body = body.replace('LEARNLINES', lines(5,10,1,2))
for a,b in (('23','2/3'),('812','8/12'),('15','1/5'),('210','2/10'),('412','4/12'),('13','1/3'),('14','1/4')):
    n,d = b.split('/'); body = body.replace('FR'+a+' ', fr(n,d)+' ').replace('FR'+a+'.', fr(n,d)+'.').replace('FR'+a+'<', fr(n,d)+'<').replace('FR'+a+',', fr(n,d)+',')
import re; left=[body[i-30:i+12] for i in [m.start() for m in re.finditer(r"FR\d", body)]]; assert not left, left
open('/home/claude/g3sb/src/lesson-3-10-01.html','w').write(head + body + tail)
print('ok', len(head+body+tail))
