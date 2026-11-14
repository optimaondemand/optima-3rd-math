# builds src/lesson-3-10-06.html (3.10.06 Adding and Subtracting Fractions, Part 1, Bach's measures: copying night)
exec(open('/home/claude/g3sb/tools/helpers1002.py').read())
DCOL.update({16: '#6D4C41', 18: '#7A5C1E', 20: '#3949AB'})
def bar(parts, d, W=600, label=None, aria='', taken=0):
    # one bar of d tiles; parts = list of counts, first dark, then lighter; taken = tiles crossed out after them
    h = 58; out = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s" style="display:block;width:100%%;max-width:%dpx">' % (W + 90, h, aria, W + 90)]
    w = (W - 10) / d; c = DCOL[d]; i = 0
    for p, k in enumerate(parts):
        for _ in range(k):
            out.append('<rect x="%.1f" y="8" width="%.1f" height="40" rx="3" fill="%s" fill-opacity="%s" stroke="#fff" stroke-width="2.5"/>' % (10 + i * w, w, c, 1 if p == 0 else .45)); i += 1
    for _ in range(taken):
        out.append('<rect x="%.1f" y="8" width="%.1f" height="40" fill="#fff" stroke="%s" stroke-width="2" stroke-dasharray="4 3"/><text x="%.1f" y="35" text-anchor="middle" font-size="18" font-weight="900" fill="#B23A2E">✕</text>' % (10 + i * w, w, c, 10 + i * w + w / 2)); i += 1
    while i < d:
        out.append('<rect x="%.1f" y="8" width="%.1f" height="40" fill="#fff" stroke="%s" stroke-width="2"/>' % (10 + i * w, w, c)); i += 1
    if label:
        a, b = label
        out.append('<text x="%d" y="24" text-anchor="middle" font-size="15" font-weight="900" fill="%s">%s</text><line x1="%d" y1="30" x2="%d" y2="30" stroke="%s" stroke-width="2"/><text x="%d" y="47" text-anchor="middle" font-size="15" font-weight="900" fill="%s">%s</text>' % (W + 48, c, a, W + 36, W + 60, c, W + 48, c, b))
    out.append('</svg>'); return ''.join(out)

html = open('/home/claude/g3sb/src/lesson-3-10-05.html').read()
head = html[:html.index('<div class="sb-prog"')]
tail = html[html.index('<script type="application/json" id="sb-data">'):]
head = head.replace('Comparing Fractions, Part 2 · Grade 3 Math Lesson 3.10.05', 'Adding and Subtracting Fractions, Part 1 · Grade 3 Math Lesson 3.10.06')
assert 'Lesson 3.10.06' in head

body = r'''<div class="sb-prog" aria-label="Progress"><span class="k">📖 BACH'S MEASURES</span><span class="bar"><i></i></span><span class="n">0 of 8 jobs</span></div>
<div class="sb-wrap">

<header class="sb-head">
  <div class="sb-brand"><img alt="" src="https://raw.githubusercontent.com/optimaondemand/optima-assets/eeb0b335630058906d52f478028361d352253a93/images/Optima%20Final%20Circle%20-%20Owl%20Only.png"><div><b>Optima Academy Online</b><small>An Education Experience Company</small></div></div>
  <h1 class="sb-title">Adding and Subtracting Fractions, Part 1</h1>
  <div class="sb-chips">
    <span class="sb-chip lead">Lesson 3.10.06 · Unit 10 · Lesson 6</span>
    <button type="button" class="sb-chip" id="sb-read">🔊 Read aloud</button>
    <button type="button" class="sb-chip" data-pop="#sb-std" aria-expanded="false">Standards ▾</button>
    <button type="button" class="sb-chip" id="sb-music" aria-pressed="false">🎵 Music: off</button>
    <button type="button" class="sb-chip" id="sb-motion" aria-pressed="true">✨ Motion: on</button>
  </div>
  <div class="sb-pop" id="sb-std"><b>MA.4.FR.2.2</b> Add and subtract fractions with like denominators, including mixed numbers and fractions greater than one, with procedural reliability.<br><small>Grade 4 preview: today you add and take away fractions that have the same denominator, using tiles first. Dimensions Math 3B, Chapter 10, Lesson 7 · Adding and Subtracting Fractions, Part 1</small></div>
</header>

<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 10">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-thomas-plate2.jpg}}" alt="An old black-and-white print of a tall school building with a steep roof and many windows, marked with the number 2, next to a church."><figcaption>The Saint Thomas School, Leipzig, printed in 1723</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 10</div>
      <div class="sb-chap-t">Bach's Measures</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Leipzig, Germany · about 300 years ago</p>
      <div class="sb-chap-l">Lesson 6 · Adding and Subtracting Fractions, Part 1</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>What happens when you add or take away pieces that are the same size?</h3>
    EQSVG
    <p style="margin:4px 0 0">Three-elevenths and four more elevenths make seven-elevenths. You count the pieces. They are still elevenths.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Add</b> fractions with the same denominator by counting the pieces.</li>
      <li><b>Take away</b> fractions with the same denominator by counting back.</li>
      <li><b>Cut 1 whole</b> into pieces so you can take some away.</li>
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

<div class="sb-opti" data-slot="warm-1">Hoo, it's Saturday night in Leipzig, about three hundred years ago. Tomorrow, Bach's choir will sing a brand-new cantata. But every singer and every player needs their own part, copied by hand! So Anna Magdalena Bach and Bach's students copy music late into the night. Every measure has to add up to one whole. Today you'll add pieces of a measure, and take some away.</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-10-06-warm.jpg" src="assets/video/g3math-10-06-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Lesson 6: Copying Night</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why Bach?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A real print of Saint Thomas Church and School in Leipzig, made in 1723. That is the year Bach moved there. The building marked 2 is the school. Bach lived there with his family, and he taught the boys who sang in his choir. The second picture is a close look at the square in front of the church.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-thomas-1723.jpg}}" alt="The whole print: a church with a tall tower, the school on the left marked 2, a fountain, and old German words along the bottom." style="object-fit:contain;background:#FBF6EA"><figcaption>Saint Thomas Church and School.<small>Johann Gottfried Krügner, engraving, 1723. Public domain, via Wikimedia Commons.</small></figcaption></figure>
    <figure class="sb-fig"><img src="{{IMG:sb-thomas-square.jpg}}" alt="A close look at the square: a line of small people walking, a fountain, and people crossing the stones." style="object-fit:contain;background:#fff"><figcaption>The square in front of the church.<small>Johann Gottfried Krügner, engraving, 1723 (detail). Public domain, via Wikimedia Commons.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">Almost every Sunday, Bach's choir sang a cantata. Each singer and each player needed their own part, written out by hand. There were no copy machines! Anna Magdalena Bach and some of Bach's students copied many of these parts. In every measure, the notes have to add up to exactly one whole.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> a measure is one whole. Sixteen sixteenth notes fill it, so each one is a sixteenth. To add notes, count the sixteenths. To take some away, count back.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-10-06 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-10-06</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to Lesson 6! Warm up with adding and subtracting facts. Then help Anna Magdalena fill one measure of music, and take away the notes an ink drop smudged.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Adding and Subtracting</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">Today you'll count pieces up and back a lot. Warm up with these facts. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
      FLUENCY
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! Five-sevenths means 5 pieces, and each piece is one-seventh. Today you'll add and take away pieces like these.">
  <span class="sb-k">Remember from Lesson 3.09.01</span>
  <h3>A fraction counts pieces</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>One bar cut into 7 equal pieces. Five of the pieces are shaded.</p></div>
  REVSVG
  <div class="sb-q">The bar has [[n:7~Count every piece, shaded or not.]] equal pieces in all.</div>
  <div class="sb-q">Five-sevenths is [[n:5~Count the shaded pieces.]] pieces, and each piece is one-seventh.</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: Copying Night</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">Anna Magdalena is copying one measure. It holds sixteen sixteenth notes. She writes five, then nine more. How much of the measure is written now? Then a drop of ink smudges three notes.</div>
  <p class="sb-story">Anna Magdalena dips her quill and copies one measure of the soprano part. Sixteen sixteenth notes fill the measure. She writes five of them. Then she writes nine more. Oh no! A drop of ink falls and smudges three notes. She scrapes them off.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is one whole measure. The bar under it is the measure Anna Magdalena is copying. Each tile in the tray is one sixteenth note: one-sixteenth of the measure.</p></div>
  <div data-mod="addsub" data-d="16" data-ops="+5,+9,-3" data-label="1 whole measure" data-name="think" data-for="f1 f2 f3"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="f1"><h4>Write the first notes</h4><p>Drag <b>5</b> one-sixteenth tiles from the tray into the measure.</p></div>
    <div class="sb-step" data-need="f2"><h4>Write nine more</h4><p>Drag <b>9 more</b> one-sixteenth tiles into the measure.</p></div>
    <div class="sb-step"><h4>How much is written?</h4>
      <div class="sb-q">5 sixteenths + 9 sixteenths = [[fr:14:16~Count all the shaded tiles. The pieces are still sixteenths.]] of the measure.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step" data-need="f3"><h4>The ink drop</h4><p>Tap <b>3</b> tiles in the measure to smudge them out.</p></div>
    <div class="sb-step"><h4>How much is left?</h4>
      <div class="sb-q">14 sixteenths − 3 sixteenths = [[fr:11:16~Count the shaded tiles that are left. Skip the ✕ tiles.]] of the measure.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Tell how you counted</h4>
      <label class="sb-write-l" for="w-think">How did you find how much of the measure was left?</label>
      <textarea class="sb-write" id="w-think" data-req data-label="Copying Night" placeholder="First I counted… Then I took away…"></textarea>
      <div class="sb-chips2">Remember to tell: <span>count</span><span>sixteenths</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Sixteenths are the unit. Count them like you would count apples.", "5 + 9 = 14, so 5 sixteenths and 9 sixteenths make 14 sixteenths.", "14 − 3 = 11. The pieces are still sixteenths, so 11 sixteenths are left."]'>💡 Need a hint?</button>{{TOOL:fbars-16}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Atlas has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="atlas">5 apples and 9 apples make 14 apples. 5 sixteenths and 9 sixteenths work the same way.</div>
  <div class="sb-payoff" data-after-job="1">
    <div class="sb-art" style="margin:0">PAY1</div>
    <p style="margin:8px 0 0"><b>Sixteenths are the unit.</b> Add sixteenths by counting on. Take sixteenths away by counting back. The pieces never change size.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">You did it! Five sixteenths and nine sixteenths make fourteen sixteenths. Take away three, and eleven sixteenths are left. Sixteenths are the unit, so you just count them.</div>
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
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. First, Claire shows how to add and take away pieces that are the same size. Next, we fix some mix-ups. Then you try one on your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Count the Pieces</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Same-size pieces: count them, and keep the unit</h3>
    KEYSVG
    <p style="margin:2px 0 8px;font-size:20px;font-weight:800;text-align:center"><span class="fr"><span>4</span><span>9</span></span> + <span class="fr"><span>3</span><span>9</span></span> = <span class="fr"><span>7</span><span>9</span></span></p>
    KEYSUB
    <p style="margin:2px 0 8px;font-size:20px;font-weight:800;text-align:center"><span class="fr"><span>7</span><span>9</span></span> − <span class="fr"><span>5</span><span>9</span></span> = <span class="fr"><span>2</span><span>9</span></span></p>
    <ol class="sb-steps4">
      <li><b>Check the denominators.</b> The same denominator means the pieces are the same size. The denominator names the <b>unit</b>, like apples or candles.</li>
      <li><b>To add, count on.</b> 4 ninths + 3 ninths = 7 ninths. Add the numerators. The unit stays ninths. The answer is the <b>sum</b>.</li>
      <li><b>To take away, count back.</b> 7 ninths − 5 ninths = 2 ninths. Subtract the numerators. The answer is the <b>difference</b>.</li>
      <li><b>Taking away from 1 whole?</b> Cut the whole into pieces first. 1 whole = 9 ninths.</li>
    </ol>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to see 4 ninths + 3 ninths</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>4 apples and 3 apples make 7 apples. 4 ninths and 3 ninths make 7 ninths.</span></div>
      <div class="sb-mate" data-who="felix"><span>I start at 4 tiles and count on: 5, 6, 7.</span></div>
      <div class="sb-mate" data-who="hazel"><span>To take away, I hop back on the number line, one ninth at a time.</span></div>
      <div class="sb-mate" data-who="cora"><span>The pieces never change size, so the denominator never changes.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: The Alto Part</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A student copies the alto singers' part. One page holds 7 lines of music. He copies 4 lines before supper and 2 more lines after supper. How much of the page has he copied?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is 1 whole page. The bar under it is the page he is copying. Each tile is one line: one-seventh of the page.</p></div>
    <div data-mod="addsub" data-d="7" data-ops="+4,+2" data-label="1 whole page" data-name="yt" data-for="f1 f2"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="f1"><h4>Before supper</h4><p>Drag <b>4</b> one-seventh tiles onto the page.</p></div>
      <div class="sb-step" data-need="f2"><h4>After supper</h4><p>Drag <b>2 more</b> one-seventh tiles onto the page.</p></div>
      <div class="sb-step"><h4>Find the sum</h4>
        <div class="sb-q">4 sevenths + 2 sevenths = [[fr:6:7~Count all the shaded tiles. Each one is a seventh.]] of the page.</div>
        <div class="sb-q">The unit is [[w:sevenths|seventh|a seventh|one-seventh~What size is each tile?]].</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Each tile is one line, one-seventh of the page.", "Start at 4 and count on 2 more: 5, 6.", "4 sevenths + 2 sevenths = 6 sevenths."]'>💡 Need a hint?</button>{{TOOL:fbars-7}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="felix">I say the unit out loud: 4 sevenths, 5 sevenths, 6 sevenths. Then I can't forget it.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. Here's a clue. The denominator tells the size of the pieces. When you add or take away pieces, they don't change size.</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Juno Adds the Denominators</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">The violin part has 9 pages. Anna Magdalena copies 2 pages, and a student copies 6 pages. That is two-ninths and six-ninths of the part. Juno says, "2 + 6 = 8 and 9 + 9 = 18, so they copied eight-eighteenths."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is the whole violin part. The bar under it is cut into ninths, one tile for each page.</p></div>
    <div data-mod="addsub" data-d="9" data-ops="+2,+6" data-label="the whole violin part" data-name="juno" data-for="f1 f2"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="f1"><h4>Anna Magdalena's pages</h4><p>Drag <b>2</b> one-ninth tiles onto the bar.</p></div>
      <div class="sb-step" data-need="f2"><h4>The student's pages</h4><p>Drag <b>6 more</b> one-ninth tiles onto the bar.</p></div>
      <div class="sb-step"><h4>Find the sum</h4>
        <div class="sb-q">2 ninths + 6 ninths = [[fr:8:9~Count the shaded tiles. Are they still ninths?]] of the part.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Look at Juno's answer</h4>
        JUNOSVG
        <div class="sb-q">Juno's eight-eighteenths is [[w:less|smaller|shorter|less than|smaller than|shorter than~Compare the bottom bar to the top bar.]] than six-ninths, the student's pages alone.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Juno</h4><label class="sb-write-l" for="w-juno">Tell Juno what went wrong. How do the tiles show it?</label><textarea class="sb-write" id="w-juno" data-req data-label="Help Juno" placeholder="Juno added… but the tiles show…"></textarea><div class="sb-chips2">Remember to tell: <span>same-size pieces</span><span>ninths</span></div>
        <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Adding more pages can&#39;t make less! Juno&#39;s answer is smaller than one part alone.", "The tiles are ninths before and after you add them. Only the number of tiles changes.", "2 ninths + 6 ninths = 8 ninths. Add the numerators. Keep the denominator."]'>💡 Need a hint?</button>{{TOOL:fbars-9a}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="cora">If my answer is smaller than one of the parts I added, I know something went wrong.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Kai Takes Away the Denominators</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">The students copy by candlelight. One candle is eleven-twelfths as tall as a new candle. By midnight, four-twelfths of it burns away. Kai says, "11 − 4 = 7 and 12 − 12 = 0, so seven over zero is left."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is 1 whole new candle. The bar under it is the candle tonight: 11 of its 12 pieces are still there.</p></div>
    <div data-mod="addsub" data-d="12" data-start="11" data-ops="-4" data-label="1 whole new candle" data-name="kai" data-for="f1"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="f1"><h4>Burn the candle</h4><p>Tap <b>4</b> tiles to take away the part that burned.</p></div>
      <div class="sb-step"><h4>Find the difference</h4>
        <div class="sb-q">11 twelfths − 4 twelfths = [[fr:7:12~Count the shaded tiles left. What size is each one?]] of a candle.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Check Kai's denominator</h4>
        <div class="sb-q">The tiles left are still [[w:twelfths|twelfth|one-twelfth|12ths~What size is each tile that is left?]], so the denominator is still 12.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Kai</h4><label class="sb-write-l" for="w-kai">How do the tiles show that Kai's answer can't be right?</label><textarea class="sb-write" id="w-kai" data-req data-label="Help Kai" placeholder="When you take away pieces, the pieces left are…"></textarea><div class="sb-chips2">Remember to tell: <span>take away pieces</span><span>twelfths</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["A denominator of 0 would mean the candle is cut into 0 pieces. That can&#39;t be, and there is still candle left!", "You took away 4 pieces. The pieces that are left did not change size.", "11 twelfths − 4 twelfths = 7 twelfths."]'>💡 Need a hint?</button>{{TOOL:nl-12b}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="hazel">Take away subtracts the numerators. The denominator just names the pieces.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Leo and the New Ink Pot</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A new pot of ink is 1 whole. Tonight the copyists use four-ninths of it. Leo says, "I can't take ninths away from 1. There are no ninths in 1."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is 1 whole pot of ink. The bar under it is the same pot, not cut into pieces yet.</p></div>
    <div data-mod="addsub" data-d="9" data-ops="cut,-4" data-label="1 whole pot of ink" data-name="leo" data-for="f1 f2"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="f1"><h4>Cut the whole</h4><p>Press <b>✂ Cut 1 whole into ninths</b>.</p></div>
      <div class="sb-step"><h4>Name the whole</h4>
        <div class="sb-q">1 whole = [[fr:9:9~Count all the tiles. Each one is a ninth.]]</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="f2"><h4>Use the ink</h4><p>Tap <b>4</b> tiles to take away the ink they used.</p></div>
      <div class="sb-step"><h4>Find the difference</h4>
        <div class="sb-q">9 ninths − 4 ninths = [[fr:5:9~Count the shaded tiles left.]] of the pot.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Leo</h4><label class="sb-write-l" for="w-leo">Tell Leo how to take ninths away from 1 whole.</label><textarea class="sb-write" id="w-leo" data-req data-label="Help Leo" placeholder="First cut 1 whole into… Then…"></textarea><div class="sb-chips2">Remember to tell: <span>9 ninths</span><span>take away</span></div>
        <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["1 whole can be cut into any number of equal pieces.", "Cut into ninths, 1 whole is 9 ninths.", "9 ninths − 4 ninths = 5 ninths."]'>💡 Need a hint?</button>{{TOOL:fbars-9c}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="felix">When I take away from 1, I rename it first. 1 whole is 9 ninths, or 12 twelfths, or 16 sixteenths.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn to work on your own. Find the unit first. Take away one amount, and then take away the other.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>The Midnight Bread</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">The copyists share a loaf of bread. <b>Ten-elevenths</b> of the loaf is on the table. They eat <b>three-elevenths</b>. Later they eat <b>two-elevenths</b> more. How much bread is left?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is 1 whole loaf. The bar under it is the loaf on the table, cut into elevenths.</p></div>
    <div data-mod="addsub" data-d="11" data-start="10" data-ops="-3,-2" data-label="1 whole loaf" data-name="own" data-for="f1 f2"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="f1"><h4>First bite</h4><p>Tap <b>3</b> tiles to take away the bread they ate first.</p></div>
      <div class="sb-step" data-need="f2"><h4>Later</h4><p>Tap <b>2 more</b> tiles to take away the bread they ate later.</p></div>
      <div class="sb-step"><h4>Find what is left</h4>
        <div class="sb-q">10 elevenths − 3 elevenths − 2 elevenths = [[fr:5:11~Count the shaded tiles that are left.]] of the loaf.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Tell how you know</h4><label class="sb-write-l" for="w-own">How much bread is left? Tell how you found it.</label><textarea class="sb-write" id="w-own" data-req data-label="The midnight bread" placeholder="First I took away… Then… So … is left."></textarea><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["The unit is elevenths. Take away both amounts.", "10 − 3 = 7. Then 7 − 2 = 5.", "5 elevenths of the loaf is left."]'>💡 Need a hint?</button>{{TOOL:nl-11}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! Each measure needs sixteen sixteenths. Some notes are already written. Add sixteenths until each measure is full. Then press Play.</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>The Measure Filler</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">It is almost morning. Three measures of the flute part are only partly copied. Fill each one so Sunday's music keeps a steady beat.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Three measures. The dark tiles are notes already written. The empty space still needs notes. Each tile in the tray is one sixteenth note.</p></div>
  <div data-mod="mfill" data-d="16" data-m="13,11,9" data-name="filler" data-for="all play"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="all"><h4>Problem 1 · Fill the measures</h4><p>Drag one-sixteenth tiles into each measure until all three are full.</p></div>
    <div class="sb-step" data-need="play"><h4>Problem 1 · Listen</h4><p>Press <b>▶ Play the measures</b>.</p></div>
    <div class="sb-step"><h4>Problem 2 · Write the math</h4>
      <div class="sb-q">Measure 1: <span class="fr"><span>13</span><span>16</span></span> + [[n:3~How many light tiles did you add to measure 1?]] sixteenths = 1 whole.</div>
      <div class="sb-q">Measure 3: <span class="fr"><span>9</span><span>16</span></span> + [[n:7~How many light tiles did you add to measure 3?]] sixteenths = 1 whole.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Problem 2 · Tell how you knew</h4><label class="sb-write-l" for="w-fill">Pick one measure. How did you know how many sixteenths to add?</label><textarea class="sb-write" id="w-fill" data-req data-label="Measure Filler" placeholder="1 whole is 16 sixteenths. The measure had… so I added…"></textarea><div class="sb-chips2">Remember to tell: <span>16 sixteenths</span><span>how many more</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  PROVESVG
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Look back at Anna Magdalena's measure. Show how you found how much of the measure was written, and how much was left after the ink drop. Use words, numbers or a picture.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="She wrote… then… so… Then the ink drop…"></textarea><div class="sb-chips2">Remember to tell: <span>count on</span><span>count back</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! 1 whole is 11 elevenths. 11 − 2 − 5 = 4, so 4 elevenths of the candle is left.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Two Nights of Candlelight</h3>
  <p>A new candle is 1 whole. It burns two-elevenths on Saturday night and five-elevenths on Sunday night. How much is left?</p>
  <div class="sb-q" style="font-size:22px">1 − <span class="fr"><span>2</span><span>11</span></span> − <span class="fr"><span>5</span><span>11</span></span> = [[fr:4:11~Start with 1 whole = 11 elevenths. Then take away both amounts.]]</div>
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
    <li><span class="bx"></span><span>I drew one adding problem and one take-away problem with tiles in my math journal.</span></li>
    <li><span class="bx"></span><span>I named the unit in every answer.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.10.07 · Adding and Subtracting Fractions, Part 2</h3>
  <p>Today you added and took away pieces of the same size. Next, you'll do it again, then write each answer in simplest form.</p>
</div>

<div class="sb-opti" data-slot="end-1">Before you go, listen to a little piece from Anna Magdalena's notebook. It's a musette, a happy dance. Nobody knows for sure who wrote it. It's played here with a harpsichord sound. Press play, and stop whenever you like.</div>
<div class="sb-card sb-listen" data-src="bach-musette-anh126.mp3">
  <img src="{{IMG:sb-thomas-plate2.jpg}}" alt="The Saint Thomas School in Leipzig" style="object-fit:cover;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>Musette in D, from Anna Magdalena's notebook</h3>
    <p style="margin:2px 0">A happy dance with a low note that keeps humming underneath, like bagpipes. It is played twice through.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Musette in D major, BWV Anhang 126, from the Notebook for Anna Magdalena Bach (1725). Composer unknown. Played with a harpsichord sound made for this page from the Mutopia Project's public-domain MIDI file.</p>
  </div>
</div>
</section>

<footer class="sb-foot footer"><b>🏫 Optima Academy Online</b><br>Math · Grade 3 · Lesson 3.10.06 · Unit 10<br><span style="font-size:12px">Art: Johann Gottfried Krügner, Saint Thomas Church and School, Leipzig (engraving, 1723), public domain, via Wikimedia Commons. Music: Musette in D major, BWV Anhang 126, Notebook for Anna Magdalena Bach (1725), composer unknown, from the Mutopia Project (public domain). The Measure Filler: notes played in the page.</span></footer>
</div>

'''
FL = [('9 + 7', 16), ('14 − 6', 8), ('8 + 5', 13), ('15 − 9', 6), ('6 + 9', 15), ('13 − 4', 9), ('7 + 8', 15), ('16 − 7', 9)]
flu = '\n      '.join('<div class="fluency-item"><span class="fluency-q">%s =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%s"></div>' % (q, a, q.replace('−', 'minus').replace('+', 'plus')) for q, a in FL)
def two(a, b, d, aria, W=600):
    # two short bars stacked: Juno's 8/18 under the student's 6/9
    return ('<div style="margin:6px 0">' + bar([b], d, W, (b, d), aria='The student\'s pages alone: six-ninths.') +
            bar([a], 18, W, (a, 18), aria=aria) + '</div>')
rep = {
 'EQSVG': bar([3, 4], 11, label=('7', '11'), aria='One bar cut into elevenths. Three tiles are dark, four more tiles are lighter. Seven-elevenths in all.'),
 'FLUENCY': flu,
 'REVSVG': bar([5], 7, label=('5', '7'), aria='A bar cut into 7 equal pieces with 5 shaded.'),
 'PAY1': '<div>%s</div>' % bar([11], 16, label=('11', '16'), taken=3, aria='The measure: 11 sixteenths still shaded and 3 sixteenths crossed out, 2 sixteenths empty.'),
 'KEYSVG': bar([4, 3], 9, label=('7', '9'), aria='A bar in ninths: 4 dark tiles and 3 lighter tiles, 7 ninths in all.'),
 'KEYSUB': bar([2], 9, label=('2', '9'), taken=5, aria='A bar in ninths: 2 tiles shaded and 5 tiles crossed out. 7 ninths take away 5 ninths leaves 2 ninths.'),
 'JUNOSVG': two(8, 6, 9, 'Juno\'s answer, eight-eighteenths: a bar cut into 18 tiny pieces with 8 shaded. It stops before six-ninths.'),
 'PROVESVG': bar([5, 9], 16, label=('14', '16'), aria='The measure: 5 dark sixteenths and 9 lighter sixteenths, 14 sixteenths in all.'),
}
for k, v in rep.items():
    assert k in body, k
    body = body.replace(k, v)
out = head + body + tail
open('/home/claude/g3sb/src/lesson-3-10-06.html', 'w').write(out)
print('ok', len(out))
