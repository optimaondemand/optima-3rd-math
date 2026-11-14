# builds src/lesson-3-10-05.html (3.10.05 Comparing Fractions, Part 2, Bach's measures: the Coffee Cantata)
exec(open('/home/claude/g3sb/tools/helpers1002.py').read())
DCOL.update({16: '#6D4C41', 20: '#3949AB'})
def halfsvg(rows, gap=False, W=600, aria=''):
    # cups as tile bars with a gold halfway line (and the missing pieces outlined when gap)
    h = 52 * len(rows) + 30; out = ['<svg viewBox="0 0 %d %d" role="img" aria-label="%s" style="display:block;width:100%%;max-width:%dpx">' % (W + 80, h, aria, W + 80)]
    for r, (k, n) in enumerate(rows):
        y = 8 + 52 * r; w = (W - 10) / n; c = DCOL[n]
        for i in range(n):
            out.append('<rect x="%.1f" y="%d" width="%.1f" height="36" fill="%s" stroke="%s" stroke-width="2"/>' % (10 + i * w, y, w, c if i < k else '#fff', c))
        if gap and k < n:
            out.append('<rect x="%.1f" y="%d" width="%.1f" height="44" rx="6" fill="none" stroke="#B23A2E" stroke-width="3" stroke-dasharray="6 4"/>' % (10 + k * w - 1, y - 4, (n - k) * w + 2))
        out.append('<text x="%d" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="%s">%d</text><line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2"/><text x="%d" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="%s">%d</text>' % (W + 40, y + 13, c, k, W + 32, y + 18, W + 48, y + 18, c, W + 40, y + 33, c, n))
    hx = 10 + (W - 10) / 2
    out.append('<line x1="%.1f" y1="2" x2="%.1f" y2="%d" stroke="#C9A227" stroke-width="1.5"/><text x="%.1f" y="%d" text-anchor="middle" font-size="13" font-weight="900" fill="#8A6A00">one-half</text>' % (hx, hx, h - 18, hx, h - 4))
    out.append('</svg>'); return ''.join(out)

html = open('/home/claude/g3sb/src/lesson-3-10-04.html').read()
head = html[:html.index('<div class="sb-prog"')]
tail = html[html.index('<script type="application/json" id="sb-data">'):]
head = head.replace('Comparing Fractions, Part 1 · Grade 3 Math Lesson 3.10.04', 'Comparing Fractions, Part 2 · Grade 3 Math Lesson 3.10.05')
assert 'Lesson 3.10.05' in head

body = r'''<div class="sb-prog" aria-label="Progress"><span class="k">📖 BACH'S MEASURES</span><span class="bar"><i></i></span><span class="n">0 of 8 jobs</span></div>
<div class="sb-wrap">

<header class="sb-head">
  <div class="sb-brand"><img alt="" src="https://raw.githubusercontent.com/optimaondemand/optima-assets/eeb0b335630058906d52f478028361d352253a93/images/Optima%20Final%20Circle%20-%20Owl%20Only.png"><div><b>Optima Academy Online</b><small>An Education Experience Company</small></div></div>
  <h1 class="sb-title">Comparing Fractions, Part 2</h1>
  <div class="sb-chips">
    <span class="sb-chip lead">Lesson 3.10.05 · Unit 10 · Lesson 5</span>
    <button type="button" class="sb-chip" id="sb-read">🔊 Read aloud</button>
    <button type="button" class="sb-chip" data-pop="#sb-std" aria-expanded="false">Standards ▾</button>
    <button type="button" class="sb-chip" id="sb-music" aria-pressed="false">🎵 Music: off</button>
    <button type="button" class="sb-chip" id="sb-motion" aria-pressed="true">✨ Motion: on</button>
  </div>
  <div class="sb-pop" id="sb-std"><b>MA.3.FR.2.1</b> Plot, order and compare fractional numbers with the same numerator or the same denominator.<br><b>MA.3.FR.2.2</b> Identify equivalent fractions and explain why they are equivalent.<br><small>Today: compare fractions to the benchmarks one-half and 1. Dimensions Math 3B, Chapter 10, Lesson 5 · Comparing Fractions, Part 2</small></div>
</header>

<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 10">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-coffee-plate.jpg}}" alt="An old black-and-white print of a street with tall, fancy houses, horses and carriages, and people walking."><figcaption>Katharine Street, Leipzig, printed about 1720</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 10</div>
      <div class="sb-chap-t">Bach's Measures</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Leipzig, Germany · about 300 years ago</p>
      <div class="sb-chap-l">Lesson 5 · Comparing Fractions, Part 2</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How can you compare fractions without re-cutting?</h3>
    EQSVG
    <p style="margin:4px 0 0">One-sixth stops before the halfway line. Seven-twelfths goes past it. So seven-twelfths is greater, and you didn't have to re-cut.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Find</b> half of a denominator.</li>
      <li><b>Compare</b> a fraction to the benchmark one-half.</li>
      <li><b>Look at the missing piece</b> to tell which fraction is closer to 1.</li>
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

<div class="sb-opti" data-slot="warm-1">Hoo, welcome to a coffee house in Leipzig! About three hundred years ago, people came here to drink coffee and hear music. Bach's music group often played here. Bach wrote a funny piece called the Coffee Cantata. A father wants his daughter Lieschen to stop drinking coffee. But she loves it! Today we'll look at cups of coffee. Is a cup less than half full, more than half full, or almost full?</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-10-05-warm.jpg" src="assets/video/g3math-10-05-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Lesson 5: Cups of Coffee</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why Bach?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A real print of Katharine Street in Leipzig, made about 1720. The house marked 2 was Zimmermann's coffee house. Starting in 1729, Bach led a music group that played there, and people listened while they drank coffee. The other picture is Bach's own title page for the Coffee Cantata. It names the father, Schlendrian, and his daughter, Lieschen.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-coffee-house.jpg}}" alt="A close look at a tall, fancy house with many windows and a big doorway, with carriages in the street." style="object-fit:contain;background:#fff"><figcaption>Zimmermann's coffee house.<small>Johann Georg Schreiber, Katharine Street, Leipzig, engraving, about 1720 (detail). Public domain, via Wikimedia Commons.</small></figcaption></figure>
    <figure class="sb-fig"><img src="{{IMG:sb-bwv211-title.jpg}}" alt="A gray-blue page with old handwriting in brown ink, written in lines down the middle." style="object-fit:contain;background:#FBF6EA"><figcaption>Bach's title page for the Coffee Cantata.<small>Johann Sebastian Bach, autograph score of BWV 211, about 1734. Staatsbibliothek zu Berlin. Public domain, via Wikimedia Commons.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">Bach wrote the Coffee Cantata in the early 1730s. It is a funny story told by singers and players. A father tries to make his daughter stop drinking coffee, and she won't. In one song, Lieschen sings about how sweet her coffee tastes, and a flute plays along.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> each cup is one whole. Is it less than half full, more than half full, or almost full? Those questions let you compare without re-cutting.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-10-05 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-10-05</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to Lesson 5! Warm up by finding half of even numbers. Then look at three cups of coffee and show the halfway line.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Half of a Number</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">Today you'll find half of a number a lot. Half means divide by 2. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
      FLUENCY
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! Re-cut each fifth into 4, and one-fifth is 4 twentieths. Re-cutting always works. Today you'll learn two faster ways.">
  <span class="sb-k">Remember from Lesson 3.10.04</span>
  <h3>Re-cut to compare</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Three bars, the same length. One-fifth is shaded on the top bar. In the middle bar, each fifth is cut into 4 pieces. The bottom bar shows three-twentieths.</p></div>
  REVSVG
  <div class="sb-q">One-fifth = [[fr:4:20~Count the shaded twentieths in the middle bar. Then count all its pieces.]]</div>
  <div class="sb-q">So one-fifth [[w:>~4 twentieths is more than 3 twentieths. Use the greater than symbol.]] three-twentieths. (Type &lt;, &gt; or =.)</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: Three Cups</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">Here are three cups of coffee. Each cup is one whole. Press the button to show the halfway line. Which cups are more than half full? Which one is closest to full?</div>
  <p class="sb-story">At the coffee house, Lieschen, her father and a friend each have a cup. Lieschen's cup is two-ninths full. Her father's is five-sevenths full. The friend's is nine-tenths full.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Three cups of coffee as fraction tiles. Each bar is one whole cup. The shaded tiles show the coffee. The cups are cut into different-size pieces.</p></div>
  <div data-mod="bench" data-fr="2/9,5/7,9/10" data-rows="Lieschen's cup,Father's cup,Friend's cup" data-btns="half,gap" data-name="think" data-for="half gap"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="half"><h4>Show the halfway line</h4><p>Press <b>½ Show the halfway line</b>.</p></div>
    <div class="sb-step"><h4>Count the cups past half</h4>
      <div class="sb-q">[[n:2~Count the cups whose coffee goes past the gold line.]] cups are more than half full.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step" data-need="gap"><h4>Show the missing pieces</h4><p>Press <b>Show the missing pieces</b>.</p></div>
    <div class="sb-step"><h4>Which cup is closest to full?</h4>
      <div class="sb-q">The cup closest to full is [[fr:9:10~Look for the red box that is the smallest. Which cup is that?]] full.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Tell how you know</h4>
      <label class="sb-write-l" for="w-think">How do you know that cup is closest to full?</label>
      <textarea class="sb-write" id="w-think" data-req data-label="Closest to full" placeholder="It is missing only… and that piece is…"></textarea>
      <div class="sb-chips2">Remember to tell: <span>missing piece</span><span>smallest</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["The gold line is halfway across every cup. Coffee that goes past it is more than half.", "Lieschen&#39;s coffee stops before the line. The other two go past it.", "The friend&#39;s cup is missing one tenth. That is the smallest red box."]'>💡 Need a hint?</button>{{TOOL:fbars-half}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Hazel has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="hazel">I don't re-cut right away. First I ask: is it more or less than half?</div>
  <div class="sb-payoff" data-after-job="1">
    <div class="sb-art" style="margin:0">PAY1</div>
    <p style="margin:8px 0 0"><b>Two shortcuts.</b> The halfway line tells which cups are more than one-half. The missing piece tells which cup is closest to full.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">Nice work! Two cups are past the halfway line. Nine-tenths is missing just one small piece, so it is closest to full. You compared without re-cutting!</div>
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
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. First, Claire shows two shortcuts: the halfway line and the missing piece. Next, we fix some mix-ups. Then you try one on your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Halfway or Missing Piece</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Compare to one-half. Or look at the missing piece.</h3>
    KEYSVG
    KEYGAP
    <ol class="sb-steps4">
      <li><b>Find half of the denominator.</b> Half of 9 is 4 and a half. Half of 7 is 3 and a half.</li>
      <li><b>Compare each fraction to one-half.</b> Two-ninths is less than half. Five-sevenths is more than half. The one past half is greater. One-half is a <b>benchmark</b>: a number we compare to.</li>
      <li><b>Both on the same side?</b> Look at the missing pieces. Nine-tenths is missing one tenth. Eleven-twelfths is missing one twelfth. The smaller missing piece is closer to 1 whole, so eleven-twelfths is greater.</li>
      <li><b>Still stuck?</b> Re-cut, like in Lesson 3.10.04. Re-cutting always works.</li>
    </ol>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to see the three cups</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>Half of 9 is 4 and a half. Two-ninths stops way before the line.</span></div>
      <div class="sb-mate" data-who="felix"><span>Half of 7 is 3 and a half. Five-sevenths goes past it.</span></div>
      <div class="sb-mate" data-who="hazel"><span>One cup on each side of the line? The one past half is greater.</span></div>
      <div class="sb-mate" data-who="cora"><span>Both past half? I check the missing pieces. Smaller missing piece, fuller cup.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: Which Side of Half?</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Lieschen pours two more cups. One is three-tenths full. The other is six-elevenths full. Which cup has more coffee?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Two cups as fraction tiles: tenths on top, elevenths below. Under them is a box for a symbol.</p></div>
    <div data-mod="bench" data-fr="3/10,6/11" data-rows="Three-tenths,Six-elevenths" data-btns="half" data-name="yt" data-for="half"></div>
    <div data-mod="sym" data-a="3/10" data-b="6/11" data-ans="<" data-name="yt-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="half"><h4>Show the halfway line</h4><p>Press <b>½ Show the halfway line</b>.</p></div>
      <div class="sb-step"><h4>Check three-tenths</h4>
        <div class="sb-q">Half of 10 is [[n:5~10 ÷ 2]].</div>
        <div class="sb-q">3 is less than 5, so three-tenths is [[w:less|less than|smaller|smaller than~Is 3 more or less than 5?]] than one-half.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Check six-elevenths</h4>
        <div class="sb-q">Half of 11 is 5 and a half. 6 is more than that, so six-elevenths is [[w:more|more than|greater|greater than|bigger|bigger than~Is 6 more or less than 5 and a half?]] than one-half.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Compare</h4><p>Drag &lt;, &gt; or = into the box between three-tenths and six-elevenths.</p></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["The gold line is one-half. Which cup&#39;s coffee goes past it?", "Three-tenths stops before the line. Six-elevenths goes past it.", "The one past half is greater: three-tenths is less than six-elevenths."]'>💡 Need a hint?</button>{{TOOL:fbars-half}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="felix">One fraction on each side of half? Done! The one past half is greater.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. Here's a clue. Half of an odd number has a half in it. And when both fractions are past the halfway line, look at the missing pieces.</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Juno Picks the Bigger Missing Piece</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Juno compares two cups. One is six-sevenths full. The other is eight-ninths full. Juno says, "Six-sevenths is closer to full, because sevenths are bigger pieces."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Juno's two cups as fraction tiles: sevenths on top, ninths below. Juno's symbol is already in the box.</p></div>
    <div data-mod="bench" data-fr="6/7,8/9" data-rows="Six-sevenths,Eight-ninths" data-btns="gap" data-name="juno" data-for="gap"></div>
    <div data-mod="sym" data-a="6/7" data-b="8/9" data-ans="<" data-wrong=">" data-who="Juno" data-name="juno-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="gap"><h4>Show the missing pieces</h4><p>Press <b>Show the missing pieces</b>.</p></div>
      <div class="sb-step"><h4>Name the missing pieces</h4>
        <div class="sb-q">Six-sevenths is missing one [[w:seventh|1 seventh|one seventh~Look at the red box on the top cup.]].</div>
        <div class="sb-q">Eight-ninths is missing one [[w:ninth|1 ninth|one ninth~Look at the red box on the bottom cup.]].</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Which is closer to full?</h4>
        <div class="sb-q">A ninth is smaller than a seventh, so [[fr:8:9~The cup with the smaller missing piece is closer to full.]] is closer to full.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Fix Juno's symbol</h4><p>Drag the right symbol into the box over Juno's.</p></div>
      <div class="sb-step"><h4>Help Juno</h4><label class="sb-write-l" for="w-juno">Tell Juno why the bigger missing piece is farther from full.</label><textarea class="sb-write" id="w-juno" data-req data-label="Help Juno" placeholder="Six-sevenths is missing… Eight-ninths is missing… so…"></textarea><div class="sb-chips2">Remember to tell: <span>missing piece</span><span>smaller gap</span></div>
        <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Juno is right that sevenths are bigger pieces. But a bigger piece is missing from that cup!", "Six-sevenths is missing one seventh. Eight-ninths is missing one ninth.", "A smaller gap means a fuller cup. Eight-ninths is closer to full."]'>💡 Need a hint?</button>{{TOOL:fbars-half}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="atlas">When cups are almost full, I look at what's missing, not what's there.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Kai Stops at the Halfway Line</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Kai compares seven-ninths and nine-elevenths. Kai says, "Both are more than half, so they are equal."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Kai's two cups as fraction tiles: ninths on top, elevenths below. Kai's symbol is already in the box.</p></div>
    <div data-mod="bench" data-fr="7/9,9/11" data-rows="Seven-ninths,Nine-elevenths" data-btns="half,gap" data-name="kai" data-for="half gap"></div>
    <div data-mod="sym" data-a="7/9" data-b="9/11" data-ans="<" data-wrong="=" data-who="Kai" data-name="kai-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="half"><h4>Show the halfway line</h4><p>Press <b>½ Show the halfway line</b>.</p></div>
      <div class="sb-step"><h4>Can the halfway line help?</h4>
        <div class="sb-q">Are both cups past the halfway line? [[w:yes|yep|yes they are~Look at where each cup's coffee stops.]]</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="gap"><h4>Show the missing pieces</h4><p>Press <b>Show the missing pieces</b>.</p></div>
      <div class="sb-step"><h4>Compare the missing pieces</h4>
        <div class="sb-q">Each cup is missing [[n:2~Count the tiles in each red box.]] pieces.</div>
        <div class="sb-q">Two ninths is [[w:more|bigger|more than|bigger than|larger|larger than~Ninths are bigger pieces than elevenths.]] than two elevenths, so seven-ninths is farther from full.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Fix Kai's symbol</h4><p>Drag the right symbol into the box over Kai's.</p></div>
      <div class="sb-step"><h4>Help Kai</h4><label class="sb-write-l" for="w-kai">Tell Kai why "both more than half" does not mean equal.</label><textarea class="sb-write" id="w-kai" data-req data-label="Help Kai" placeholder="Both are past half, but… The missing pieces…"></textarea><div class="sb-chips2">Remember to tell: <span>same side of half</span><span>missing pieces</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["The halfway line only tells which side of half a fraction is on.", "When both are past half, use the missing pieces.", "Two elevenths is a smaller gap than two ninths, so nine-elevenths is greater."]'>💡 Need a hint?</button>{{TOOL:fbars-half}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="cora">Same side of half? I need a second shortcut: the missing piece, or re-cutting.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Leo Finds Half of Nine</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Leo's cup is four-ninths full. Leo says, "Half of 9 is 4, so four-ninths is exactly one-half."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Leo's cup as fraction tiles cut into ninths. Leo's symbol is already in the box.</p></div>
    <div data-mod="bench" data-fr="4/9" data-rows="Leo's cup" data-btns="half" data-name="leo" data-for="half"></div>
    <div data-mod="sym" data-a="4/9" data-b="1/2" data-ans="<" data-wrong="=" data-who="Leo" data-name="leo-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="half"><h4>Show the halfway line</h4><p>Press <b>½ Show the halfway line</b>.</p></div>
      <div class="sb-step"><h4>Where is half of 9?</h4>
        <div class="sb-q">The gold line goes through the middle of a tile. Half of 9 is 4 and a [[w:half|1/2~The line splits a tile in two.]].</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Compare to half</h4>
        <div class="sb-q">4 is less than 4 and a half, so four-ninths is [[w:less|less than|smaller|smaller than~Does Leo's coffee reach the gold line?]] than one-half.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Fix Leo's symbol</h4><p>Drag the right symbol into the box over Leo's.</p></div>
      <div class="sb-step"><h4>Help Leo</h4><label class="sb-write-l" for="w-leo">What did Leo forget about half of 9?</label><textarea class="sb-write" id="w-leo" data-req data-label="Help Leo" placeholder="Half of 9 is… so four-ninths…"></textarea><div class="sb-chips2">Remember to tell: <span>4 and a half</span><span>odd number</span></div>
        <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["9 is an odd number. It can&#39;t be split into two equal whole numbers.", "Half of 9 is 4 and a half. The gold line splits the 5th tile.", "4 is less than 4 and a half, so four-ninths is less than one-half."]'>💡 Need a hint?</button>{{TOOL:fbars-half}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="hazel">An odd denominator never has a tile that ends right on the halfway line.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn to work on your own. Find half of each denominator. Is each fraction less than half, or more? Then compare.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>Which Cup Has More?</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">One cup is <b>five-twelfths</b> full. Another is <b>seven-elevenths</b> full. Which cup has more coffee?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Two cups as fraction tiles: twelfths on top, elevenths below. Under them is a box for a symbol.</p></div>
    <div data-mod="bench" data-fr="5/12,7/11" data-rows="Five-twelfths,Seven-elevenths" data-btns="half" data-name="own" data-for="half"></div>
    <div data-mod="sym" data-a="5/12" data-b="7/11" data-ans="<" data-name="own-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="half"><h4>Show the halfway line</h4><p>Press <b>½ Show the halfway line</b>.</p></div>
      <div class="sb-step"><h4>Compare each cup to half</h4>
        <div class="sb-q">Half of 12 is [[n:6~12 ÷ 2]], so five-twelfths is [[w:less|less than|smaller|smaller than~Is 5 more or less than half of 12?]] than one-half.</div>
        <div class="sb-q">Half of 11 is 5 and a half, so seven-elevenths is [[w:more|more than|greater|greater than|bigger|bigger than~Is 7 more or less than 5 and a half?]] than one-half.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Compare</h4><p>Drag &lt;, &gt; or = into the box between five-twelfths and seven-elevenths.</p></div>
      <div class="sb-step"><h4>Tell how you know</h4><label class="sb-write-l" for="w-own">Which cup has more coffee? Tell how you know.</label><textarea class="sb-write" id="w-own" data-req data-label="Which cup has more" placeholder="The … cup has more because…"></textarea><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Find half of 12 and half of 11.", "Five-twelfths is less than half. Seven-elevenths is more than half.", "The one past half is greater."]'>💡 Need a hint?</button>{{TOOL:fbars-half}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! Sort the coffee cups. Less than half full goes on the left of the halfway line. More than half full goes on the right. Then press Play.</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>The Halfway Sorter</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">At the end of the night, six cups are left on the coffee house tables. Sort them for the waiter: less than half full, or more than half full.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A whole cup with a gold halfway line. Under it are two boxes: less than one-half and more than one-half. Each card shows a cup as a fraction and as a little bar. A wrong card goes back and tells you why.</p></div>
  <div data-mod="halfsort" data-cards="5/9,1/6,9/10,4/11,7/12,2/7" data-name="sorter" data-for="sorted play"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="sorted" data-cue=".hs-tray"><h4>Problem 1 · Sort the cups</h4><p>Drag each card into <b>Less than one-half</b> or <b>More than one-half</b>.</p></div>
    <div class="sb-step" data-need="play"><h4>Problem 1 · Listen</h4><p>Press <b>▶ Play the cups</b>. Each cup plays as one note, from least to greatest.</p></div>
    <div class="sb-step"><h4>Problem 2 · Closest to full</h4><div class="sb-q">The cup closest to full is [[fr:9:10~Which card is missing only one small piece?]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Problem 2 · Tell how you sorted</h4><label class="sb-write-l" for="w-sort">Pick one card from each side. Tell how you knew where it goes.</label><textarea class="sb-write" id="w-sort" data-req data-label="How I sorted" placeholder="… is less than half because half of … is … Then … is more than half because…"></textarea><div class="sb-chips2">Remember to tell: <span>half of the denominator</span><span>less or more</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  PROVESVG
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Look back at the three cups. Explain why five-sevenths is more than two-ninths, and why nine-tenths is closest to full.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="Half of 9 is… Half of 7 is… Nine-tenths is missing…"></textarea><div class="sb-chips2">Remember to tell: <span>halfway line</span><span>missing piece</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! Each is missing one piece. A twelfth is smaller than an eleventh, so eleven-twelfths is closer to full.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Almost Full</h3>
  <p>Compare ten-elevenths and eleven-twelfths. Use the missing piece.</p>
  <div class="sb-q" style="font-size:22px"><span class="fr"><span>10</span><span>11</span></span> [[w:<~Each cup is missing one piece. Which missing piece is smaller?]] <span class="fr"><span>11</span><span>12</span></span> (Type &lt;, &gt; or =.)</div>
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
    <li><span class="bx"></span><span>I drew a halfway line on two fractions in my math journal.</span></li>
    <li><span class="bx"></span><span>I used the missing piece to compare two fractions that were both more than half.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.10.06 · Adding and Subtracting Fractions, Part 1</h3>
  <p>Today you compared cups of coffee. Next, you'll add and subtract fractions that have the same denominator.</p>
</div>

<div class="sb-opti" data-slot="end-1">Before you go, listen to Lieschen's song from the Coffee Cantata. She sings about how sweet her coffee tastes, and a flute plays along. It's played here with a soft flute and harpsichord sound. Press play, and stop whenever you like.</div>
MUSICCARD
</section>

<footer class="sb-foot footer"><b>🏫 Optima Academy Online</b><br>Math · Grade 3 · Lesson 3.10.05 · Unit 10<br><span style="font-size:12px">Art: Johann Georg Schreiber, Katharine Street, Leipzig (about 1720), and Bach's autograph title page of BWV 211 (about 1734, Staatsbibliothek zu Berlin), public domain, via Wikimedia Commons. MUSICFOOT The Halfway Sorter: notes played in the page.</span></footer>
</div>

'''
MUSIC = {
 'card': '''<div class="sb-card sb-listen" data-src="bach-coffee-aria-bwv211.mp3">
  <img src="{{IMG:sb-coffee-house.jpg}}" alt="Zimmermann's coffee house in Leipzig" style="object-fit:contain;background:#fff">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>Bach · Coffee Cantata: Lieschen's song</h3>
    <p style="margin:2px 0">"Ah, how sweet the coffee tastes." The flute's part and the low part, played here with a soft flute and harpsichord sound.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Johann Sebastian Bach, "Ei! wie schmeckt der Coffee süße," from Schweigt stille, plaudert nicht (Coffee Cantata), BWV 211. Played with a flute and harpsichord sound made for this page from Michel Rondeau's arrangement files on IMSLP (CC BY-SA 4.0). This recording is shared under the same license.</p>
  </div>
</div>''',
 'foot': 'Music: Bach, Coffee Cantata, BWV 211, aria "Ei! wie schmeckt der Coffee süße," played from Michel Rondeau\'s arrangement (IMSLP, CC BY-SA 4.0).'}
FL = [(8, 2), (12, 2), (10, 2), (14, 2), (18, 2), (16, 2), (20, 2), (22, 2)]
flu = '\n      '.join('<div class="fluency-item"><span class="fluency-q">Half of %d =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="Half of %d"></div>' % (a, a // b, a) for a, b in FL)
rep = {
 'EQSVG': halfsvg([(1, 6), (7, 12)], aria='Two cups of the same size with a gold line at one-half. One-sixth stops before the line. Seven-twelfths goes past it.'),
 'FLUENCY': flu,
 'REVSVG': strips([(1, 5), (4, 20), (3, 20)], label=False, aria='Three bars of the same length. One-fifth of the top bar is shaded. In the middle bar each fifth is cut into 4, and four-twentieths stop at the same place. The bottom bar has three-twentieths shaded.'),
 'PAY1': '<div>%s</div><div>%s</div>' % (halfsvg([(2, 9), (5, 7), (9, 10)], aria='The three cups with the halfway line: two-ninths stops before it, five-sevenths and nine-tenths go past it.'), halfsvg([(2, 9), (5, 7), (9, 10)], gap=True, aria='The three cups with their missing pieces outlined. Nine-tenths is missing the smallest piece.')),
 'KEYSVG': halfsvg([(2, 9), (5, 7)], aria='Two-ninths stops before the halfway line. Five-sevenths goes past it.'),
 'KEYGAP': halfsvg([(9, 10), (11, 12)], gap=True, aria='Nine-tenths and eleven-twelfths, both past the halfway line. Nine-tenths is missing one tenth. Eleven-twelfths is missing one twelfth, a smaller piece.'),
 'PROVESVG': halfsvg([(2, 9), (5, 7), (9, 10)], aria='The three cups: two-ninths, five-sevenths and nine-tenths, with the halfway line.'),
 'MUSICCARD': MUSIC['card'], 'MUSICFOOT': MUSIC['foot'],
}
for k, v in rep.items():
    assert k in body, k
    body = body.replace(k, v)
out = head + body + tail
open('/home/claude/g3sb/src/lesson-3-10-05.html', 'w').write(out)
print('ok', len(out))
