# builds src/lesson-3-10-04.html (3.10.04 Comparing Fractions, Part 1, Bach's measures: Friedemann's notebook and the Inventions)
exec(open('/home/claude/g3sb/tools/helpers1002.py').read())
DCOL.update({16: '#6D4C41', 20: '#3949AB'})
def arc(down):
    return ('<svg class="ar-arc%s" viewBox="0 0 160 40" aria-hidden="true"><path d="%s" fill="none" stroke="#0E1C42" stroke-width="3"/><path d="%s" fill="#0E1C42"/></svg>'
            % ((' dn', 'M8 4 Q80 44 150 6', 'M150 6 l-12 2 l6 9 z') if down else ('', 'M8 36 Q80 -4 150 34', 'M150 34 l-12 -2 l6 -9 z')))
def arrsx(a, b, n):
    # a static picture of the ×n arrows: a/b = (a×n)/(b×n)
    return ('<div class="sb-stage sb-arrows" style="padding:6px 0" role="img" aria-label="%d over %d, multiplied by %d on the numerator and multiplied by %d on the denominator, equals %d over %d"><div class="ar-grid"><div class="ar-f">%s</div><div class="ar-mid"><div class="ar-slot full ok"><span>×%d</span></div>%s<div class="ar-eq">=</div>%s<div class="ar-slot full ok"><span>×%d</span></div></div><div class="ar-f">%s</div></div></div>'
            % (a, b, n, n, a * n, b * n, fr(a, b), n, arc(0), arc(1), n, fr(a * n, b * n)))

html = open('/home/claude/g3sb/src/lesson-3-10-03.html').read()
head = html[:html.index('<div class="sb-prog"')]
tail = html[html.index('<script type="application/json" id="sb-data">'):]
head = head.replace('Simplifying Fractions · Grade 3 Math Lesson 3.10.03', 'Comparing Fractions, Part 1 · Grade 3 Math Lesson 3.10.04')
assert 'Lesson 3.10.04' in head

body = r'''<div class="sb-prog" aria-label="Progress"><span class="k">📖 BACH'S MEASURES</span><span class="bar"><i></i></span><span class="n">0 of 8 jobs</span></div>
<div class="sb-wrap">

<header class="sb-head">
  <div class="sb-brand"><img alt="" src="https://raw.githubusercontent.com/optimaondemand/optima-assets/eeb0b335630058906d52f478028361d352253a93/images/Optima%20Final%20Circle%20-%20Owl%20Only.png"><div><b>Optima Academy Online</b><small>An Education Experience Company</small></div></div>
  <h1 class="sb-title">Comparing Fractions, Part 1</h1>
  <div class="sb-chips">
    <span class="sb-chip lead">Lesson 3.10.04 · Unit 10 · Lesson 4</span>
    <button type="button" class="sb-chip" id="sb-read">🔊 Read aloud</button>
    <button type="button" class="sb-chip" data-pop="#sb-std" aria-expanded="false">Standards ▾</button>
    <button type="button" class="sb-chip" id="sb-music" aria-pressed="false">🎵 Music: off</button>
    <button type="button" class="sb-chip" id="sb-motion" aria-pressed="true">✨ Motion: on</button>
  </div>
  <div class="sb-pop" id="sb-std"><b>MA.3.FR.2.1</b> Plot, order and compare fractional numbers with the same numerator or the same denominator.<br><b>MA.3.FR.2.2</b> Identify equivalent fractions and explain why they are equivalent.<br><small>Today stretches toward Grade 4: renaming fractions to compare them. Dimensions Math 3B, Chapter 10, Lesson 4 · Comparing Fractions, Part 1</small></div>
</header>

<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 10">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-wfb-plate.jpg}}" alt="An old, yellowed page of handwritten music. Rows of notes climb up and down, with small letters written under them in brown ink."><figcaption>A page Bach wrote for his son Friedemann, 1720</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 10</div>
      <div class="sb-chap-t">Bach's Measures</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Leipzig, Germany · about 300 years ago</p>
      <div class="sb-chap-l">Lesson 4 · Comparing Fractions, Part 1</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How can you compare fractions when the pieces are different sizes?</h3>
    EQSVG
    <p style="margin:4px 0 0">Cut each sixth into 2. Now both bars are cut into twelfths, so you can count: 2 twelfths and 5 twelfths.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Re-cut</b> one bar so both bars have pieces of the same size.</li>
      <li><b>Multiply</b> the numerator and the denominator by the same number.</li>
      <li><b>Compare</b> the fractions with &lt;, &gt; or =.</li>
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

<div class="sb-opti" data-slot="warm-1">Hoo, hello again! Before Bach moved to Leipzig, he started a little music book for his son Friedemann, who was nine years old. Inside are short pieces with two parts, one for each hand. Later, Bach wrote them out neatly and called them Inventions. Two hands play in the same measure. Which part holds its note longer? Today we'll find out.</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-10-04-warm.jpg" src="assets/video/g3math-10-04-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Lesson 4: Two Hands, One Measure</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why Bach?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Real pages from the music book Bach started for his oldest son, Wilhelm Friedemann, in January 1720. Friedemann was nine. On the first page, Bach wrote the name of every note in small letters under it, so his son could learn to read music. On another page, Bach showed what the little squiggles over some notes mean.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-wfb-clefguide.jpg}}" alt="A whole page of handwritten music. Notes climb up and down on rows of lines, and small letters are written under the notes." style="object-fit:contain;background:#FBF6EA"><figcaption>Bach wrote the name of each note under it.<small>Johann Sebastian Bach, Clavier-Büchlein for Wilhelm Friedemann Bach, 1720. Yale University, Beinecke Library. Public domain, via Wikimedia Commons.</small></figcaption></figure>
    <figure class="sb-fig"><img src="{{IMG:sb-wfb-trill-crop.jpg}}" alt="A close look at the page: one note with a small squiggle over it, and under it the same time filled with six quick notes." style="object-fit:contain;background:#FBF6EA"><figcaption>One note with a squiggle means: play six quick notes in the same time.<small>Close-up of Bach's table of note signs from the same book.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">Some short pieces in the book have two parts: one for the right hand and one for the left. In 1723, Bach wrote them out neatly and called them <i>Inventions</i>. Then he moved to Leipzig.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> two hands share one measure. If their notes are cut into pieces of different sizes, you can't just count. Re-cut so the pieces match. Then count and compare.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-10-04 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-10-04</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to Lesson 4! Warm up with ×2, ×4 and ×5 facts. Then look at two parts of one measure that look almost the same, and re-cut one so you can count.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Multiply by 2, 4 and 5</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">Today you'll multiply by small numbers a lot. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
      FLUENCY
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! When the pieces are the same size, count them. More twelfths means more. Today the pieces will start out different.">
  <span class="sb-k">Remember from Lesson 3.09.03</span>
  <h3>Same-size pieces</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Two bars, the same length, both cut into twelfths. The top bar has 5 tiles shaded. The bottom bar has 7 tiles shaded.</p></div>
  REVSVG
  <div class="sb-q">Five-twelfths is [[w:less|less than|smaller|smaller than|shorter|shorter than~Both bars are cut into twelfths. Which bar has fewer shaded tiles?]] seven-twelfths.</div>
  <div class="sb-q">So 5 twelfths [[w:<~Use the symbol for less than. The small point faces the smaller fraction.]] 7 twelfths. (Type &lt;, &gt; or =.)</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: Too Close to Tell</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">Here are two parts in one measure. One note lasts four-fifths of the measure. The other lasts seven-tenths. They look almost the same! Cut each fifth into two pieces. Then count and compare.</div>
  <p class="sb-story">Here is a practice measure like one Friedemann might have played. The right hand holds one note for four-fifths of the measure. The left hand holds one note for seven-tenths.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is one whole measure. Under it are the two hands' notes as fraction tiles. The right hand's bar is cut into fifths. The left hand's bar is cut into tenths. A gold line shows where each note stops.</p></div>
  <div data-mod="recut" data-da="5" data-ka="4" data-db="10" data-kb="7" data-rows="Right hand,Left hand" data-cut="a" data-by="2" data-opts="2,3" data-name="think" data-for="cut"></div>
  <div data-mod="sym" data-a="4/5" data-b="7/10" data-ans=">" data-name="think-sym" data-for="sym"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="cut"><h4>Re-cut the right hand's bar</h4><p>Press <b>✂ Cut each fifth into 2</b>.</p></div>
    <div class="sb-step"><h4>Name it in tenths</h4>
      <div class="sb-q">Four-fifths = [[fr:8:10~Count the shaded tiles in the right hand's bar now. Then count all its tiles.]]</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
      <div class="sb-fb" aria-live="polite"></div>
    </div>
    <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Compare</h4><p>Drag &lt;, &gt; or = into the box between four-fifths and seven-tenths.</p></div>
    <div class="sb-step"><h4>Did the note get longer?</h4>
      <label class="sb-write-l" for="w-think">When you cut each fifth into 2, did the right hand's note get longer? How do you know?</label>
      <textarea class="sb-write" id="w-think" data-req data-label="Did the note get longer?" placeholder="The note… because the gold line…"></textarea>
      <div class="sb-chips2">Remember to tell: <span>gold line</span><span>same length</span><span>more, smaller pieces</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div>
      <div class="sb-fb" aria-live="polite"></div>
    </div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Look at the gold lines. They are very close, so your eyes can&#39;t be sure.", "After the cut, every piece in both bars is one-tenth. Count the shaded tenths in each bar.", "8 tenths and 7 tenths. Which is more?"]'>💡 Need a hint?</button>{{TOOL:fbars-5-10c}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Hazel has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="hazel">When two notes look almost the same, I don't guess. I make the pieces the same size and count.</div>
  <div class="sb-payoff" data-after-job="1">
    <div class="sb-art" style="margin:0">PAY1</div>
    <p style="margin:8px 0 0"><b>Cut each fifth into 2, and fifths become tenths.</b> The numerator and the denominator are both multiplied by 2. The note is the same length, so now you can count.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">You did it! Four-fifths is the same as eight-tenths. Now both parts are cut into tenths, so you can count. Eight tenths is more than seven tenths. Same-size pieces make comparing fair.</div>
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
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. First, Claire shows two ways to compare. Next, we fix some mix-ups together. Then you try one on your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Same-Size Pieces</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Re-cut so the pieces are the same size. Then compare.</h3>
    KEYSVG
    KEYARR
    <ol class="sb-steps4">
      <li><b>Look at the pieces.</b> Fifths and tenths are different sizes, so counting them would not be fair.</li>
      <li><b>Re-cut one bar.</b> Cut each fifth into 2. Multiply the numerator and the denominator by the same number: 4 × 2 = 8 and 5 × 2 = 10.</li>
      <li><b>Count and compare.</b> Now both fractions have a <b>common denominator</b>. 8 tenths is more than 7 tenths, so four-fifths is greater than seven-tenths.</li>
      <li><b>Another way.</b> Sometimes it is easier to make a <b>common numerator</b>. One-sixth = two-twelfths. Two-elevenths and two-twelfths both have 2 pieces, and an eleventh is bigger than a twelfth. So two-elevenths is greater.</li>
    </ol>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to see four-fifths and seven-tenths</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>Same measure, two notes. The gold lines are close, so I don't trust my eyes.</span></div>
      <div class="sb-mate" data-who="felix"><span>Cut each fifth into 2. Every piece is a tenth now, so I can count: 8 and 7.</span></div>
      <div class="sb-mate" data-who="hazel"><span>The arrows say ×2 on top and ×2 on the bottom. Always the same number.</span></div>
      <div class="sb-mate" data-who="cora"><span>CORAFR Then 8 tenths &gt; 7 tenths.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: Eighths and Sixteenths</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">In another practice measure, the right hand holds a note for seven-eighths. The left hand holds a note for thirteen-sixteenths. Which note is longer?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>One measure and the two hands' notes as fraction tiles: eighths on top, sixteenths below. Under them is a box for a symbol.</p></div>
    <div data-mod="recut" data-da="8" data-ka="7" data-db="16" data-kb="13" data-rows="Right hand,Left hand" data-cut="a" data-by="2" data-opts="2,3" data-name="yt" data-for="cut"></div>
    <div data-mod="sym" data-a="7/8" data-b="13/16" data-ans=">" data-name="yt-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="cut"><h4>Re-cut the eighths</h4><p>Press <b>✂ Cut each eighth into 2</b>.</p></div>
      <div class="sb-step"><h4>Multiply both numbers by 2</h4>
        <div class="sb-q">Numerator: 7 × 2 = [[n:14~Count the shaded tiles in the right hand's bar now.]]</div>
        <div class="sb-q">Denominator: 8 × 2 = [[n:16~Count all the tiles in the right hand's bar now.]]</div>
        <div class="sb-q">So seven-eighths = [[fr:14:16~Use the new numerator and the new denominator you just found.]].</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Compare</h4><p>Drag &lt;, &gt; or = into the box between seven-eighths and thirteen-sixteenths.</p></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Eighths and sixteenths are different sizes. One eighth is as long as 2 sixteenths.", "After the cut, count the shaded sixteenths in each bar.", "14 sixteenths and 13 sixteenths. Which is more?"]'>💡 Need a hint?</button>{{TOOL:fbars-8}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="felix">Cut each piece into 2 means ×2 on the numerator and ×2 on the denominator.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. Here's a clue. Before you compare, re-cut so both fractions have the same size pieces. Multiply the numerator and the denominator by the same number.</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Juno Counts Different Pieces</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Juno compares two notes. One lasts seventeen-twentieths of a measure. The other lasts nine-tenths. Juno says, "Seventeen-twentieths is longer, because 17 is more than 9."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>One measure and Juno's two notes as fraction tiles: twentieths on top, tenths below. Juno's symbol is already in the box.</p></div>
    <div data-mod="recut" data-da="20" data-ka="17" data-db="10" data-kb="9" data-rows="Seventeen-twentieths,Nine-tenths" data-cut="b" data-by="2" data-opts="2,4" data-name="juno" data-for="cut"></div>
    <div data-mod="sym" data-a="17/20" data-b="9/10" data-ans="<" data-wrong=">" data-who="Juno" data-name="juno-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="cut"><h4>Re-cut the tenths</h4><p>Press <b>✂ Cut each tenth into 2</b>.</p></div>
      <div class="sb-step"><h4>Name it in twentieths</h4><div class="sb-q">Nine-tenths = [[fr:18:20~Numerator: 9 × 2. Denominator: 10 × 2.]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Fix Juno's symbol</h4><p>Drag the right symbol into the box over Juno's.</p></div>
      <div class="sb-step"><h4>Help Juno</h4><label class="sb-write-l" for="w-juno">Tell Juno why 17 is more than 9, but seventeen-twentieths is not more than nine-tenths.</label><textarea class="sb-write" id="w-juno" data-req data-label="Help Juno" placeholder="Twentieths are… so 17 twentieths… Nine-tenths is…"></textarea><div class="sb-chips2">Remember to tell: <span>piece size</span><span>re-cut</span><span>18 twentieths</span></div>
        <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["A twentieth is smaller than a tenth. So 17 small pieces might not be more.", "Cut each tenth into 2. Now both bars are cut into twentieths.", "18 twentieths is more than 17 twentieths."]'>💡 Need a hint?</button>{{TOOL:fbars-5-10c}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="atlas">I only count and compare numerators when the pieces are the same size.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Kai Picks the Bigger Denominator</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Kai compares three-twentieths and one-fifth. Kai says, "Three-twentieths is more, because 20 is bigger than 5."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>One measure and Kai's two fractions as fraction tiles: twentieths on top, fifths below. Kai's symbol is already in the box.</p></div>
    <div data-mod="recut" data-da="20" data-ka="3" data-db="5" data-kb="1" data-rows="Three-twentieths,One-fifth" data-cut="b" data-by="4" data-opts="2,3,4" data-name="kai" data-for="cut"></div>
    <div data-mod="sym" data-a="3/20" data-b="1/5" data-ans="<" data-wrong=">" data-who="Kai" data-name="kai-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="cut" data-cue=".rc-cuts"><h4>Re-cut the fifths to match</h4><p>Press a ✂ button. Pick the cut that makes the fifths into twentieths.</p></div>
      <div class="sb-step"><h4>Name it in twentieths</h4><div class="sb-q">One-fifth = [[fr:4:20~How many twentieths fit under one fifth? That is the numerator.]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Fix Kai's symbol</h4><p>Drag the right symbol into the box over Kai's.</p></div>
      <div class="sb-step"><h4>Help Kai</h4><label class="sb-write-l" for="w-kai">Tell Kai why a bigger denominator does not mean a bigger fraction.</label><textarea class="sb-write" id="w-kai" data-req data-label="Help Kai" placeholder="A bigger denominator means… so each piece…"></textarea><div class="sb-chips2">Remember to tell: <span>more pieces</span><span>smaller pieces</span><span>4 twentieths</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["The denominator tells how many pieces make the whole. More pieces means each piece is smaller.", "5 × 4 = 20. Cut each fifth into 4.", "One-fifth = 4 twentieths. Is 3 twentieths more or less?"]'>💡 Need a hint?</button>{{TOOL:fbars-5-10c}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="cora">A big denominator means lots of tiny pieces. I check how many pieces are shaded, too.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Leo Re-cuts Only the Denominator</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Leo compares eleven-twentieths and four-fifths. He changed four-fifths into four-twentieths. He multiplied the denominator by 4, but not the numerator. Then he said eleven-twentieths is greater.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>First, two bars to check Leo's new name: fifths and twentieths. Then the two fractions Leo wanted to compare, and a box for a symbol.</p></div>
    <div data-mod="cmp" data-kind="tiles" data-da="5" data-db="20" data-a="4" data-b="4" data-rows="Four-fifths,Leo's four-twentieths" data-name="leo-check" data-for="a b"></div>
    <div data-mod="recut" data-da="20" data-ka="11" data-db="5" data-kb="4" data-rows="Eleven-twentieths,Four-fifths" data-cut="b" data-by="4" data-opts="2,3,4" data-name="leo" data-for="cut"></div>
    <div data-mod="sym" data-a="11/20" data-b="4/5" data-ans="<" data-wrong=">" data-who="Leo" data-name="leo-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="a" data-cue="text:four-fifths, tile 4"><h4>Shade four-fifths</h4><p>Tap the 4th tile in the fifths bar.</p></div>
      <div class="sb-step" data-need="b" data-cue="text:Leo's four-twentieths, tile 4"><h4>Shade Leo's four-twentieths</h4><p>Tap the 4th tile in the twentieths bar.</p></div>
      <div class="sb-step"><h4>Is it the same amount?</h4><div class="sb-q">Leo's four-twentieths is [[w:shorter|smaller|less|less than|short~Look at where each shaded part stops.]] than four-fifths, so it is not a new name for it.</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="cut"><h4>Re-cut the right way</h4><p>Press <b>✂ Cut each fifth into 4</b>.</p></div>
      <div class="sb-step"><h4>Fix Leo's fraction</h4><div class="sb-q">Four-fifths = [[fr:16:20~Multiply the numerator by 4 too: 4 × 4. Denominator: 5 × 4.]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Fix Leo's symbol</h4><p>Drag the right symbol into the box over Leo's.</p></div>
      <div class="sb-step"><h4>Help Leo</h4><label class="sb-write-l" for="w-leo">What did Leo forget?</label><textarea class="sb-write" id="w-leo" data-req data-label="What Leo forgot" placeholder="Leo forgot to…"></textarea><div class="sb-chips2">Remember to tell: <span>numerator</span><span>same number</span></div>
        <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Shade the tiles in each bar and look at where each one stops.", "When each fifth is cut into 4, the shaded pieces are cut into 4 too. So the numerator changes.", "Multiply both numbers by 4: 4 × 4 = 16 and 5 × 4 = 20."]'>💡 Need a hint?</button>{{TOOL:fbars-5-10c}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="hazel">When I re-cut, the shaded pieces get cut too. So both numbers change by the same number.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn to work on your own. Re-cut one fraction so both have the same denominator. Then count the pieces and compare.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>Which Note Is Longer?</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">In one measure, the right hand holds a note for <b>seven-tenths</b>. The left hand holds a note for <b>thirteen-twentieths</b>. Which note is longer?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>One measure and the two notes as fraction tiles: tenths on top, twentieths below. Under them is a box for a symbol.</p></div>
    <div data-mod="recut" data-da="10" data-ka="7" data-db="20" data-kb="13" data-rows="Right hand,Left hand" data-cut="a" data-by="2" data-opts="2,3,4" data-name="own" data-for="cut"></div>
    <div data-mod="sym" data-a="7/10" data-b="13/20" data-ans=">" data-name="own-sym" data-for="sym"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="cut" data-cue=".rc-cuts"><h4>Re-cut the tenths</h4><p>Press a ✂ button. Pick the cut that makes the tenths into twentieths.</p></div>
      <div class="sb-step"><h4>Name it</h4><div class="sb-q">Seven-tenths = [[fr:14:20~Multiply the numerator and the denominator by the same number.]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Compare</h4><p>Drag &lt;, &gt; or = into the box between seven-tenths and thirteen-twentieths.</p></div>
      <div class="sb-step"><h4>Tell how you know</h4><label class="sb-write-l" for="w-own">Which note is longer? Tell how you know.</label><textarea class="sb-write" id="w-own" data-req data-label="Which note is longer" placeholder="The … note is longer because…"></textarea><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["How many twentieths fit under one tenth?", "10 × 2 = 20. Cut each tenth into 2.", "7 × 2 = 14. Compare 14 twentieths and 13 twentieths."]'>💡 Need a hint?</button>{{TOOL:fbars-5-10c}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! Press Play and listen to both parts together. Which note keeps ringing after the other one stops? Then re-cut and count to prove what you heard.</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>The Duet</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">In an Invention, both hands play at the same time. Here, the right hand holds a note for nine-tenths of the measure. The left hand holds a note for thirteen-twentieths. Listen first. Then prove what you heard.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>One measure and the two hands' notes as fraction tiles: tenths on top, twentieths below. Play makes both notes sound together, with a gold line moving across the measure.</p></div>
  <div data-mod="recut" data-da="10" data-ka="9" data-db="20" data-kb="13" data-rows="Right hand,Left hand" data-cut="a" data-by="2" data-opts="2,3" data-play="1" data-name="duet" data-for="heard cut heard2"></div>
  <div data-mod="sym" data-a="9/10" data-b="13/20" data-ans=">" data-name="duet-sym" data-for="sym"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="heard"><h4>Problem 1 · Listen</h4><p>Press <b>▶ Play both parts</b>. Listen to the end of each note.</p></div>
    <div class="sb-step"><h4>Problem 1 · What did you hear?</h4><div class="sb-q">The note in the [[w:right|right hand|the right hand|right hand's|top~The right hand plays the high note. The left hand plays the low note. Which one was still ringing at the end?]] hand kept ringing longer.</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step" data-need="cut"><h4>Problem 2 · Re-cut the tenths</h4><p>Press <b>✂ Cut each tenth into 2</b>.</p></div>
    <div class="sb-step"><h4>Problem 2 · Name it</h4><div class="sb-q">Nine-tenths = [[fr:18:20~Numerator: 9 × 2. Denominator: 10 × 2.]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step" data-need="sym" data-cue=".sym-cards"><h4>Problem 2 · Compare</h4><p>Drag &lt;, &gt; or = into the box between nine-tenths and thirteen-twentieths.</p></div>
    <div class="sb-step" data-need="heard2"><h4>Problem 2 · Listen to the pieces</h4><p>Press <b>▶ Play both parts</b> again. Now every shaded piece is one quick tap.</p></div>
    <div class="sb-step"><h4>Problem 2 · Tell why</h4><label class="sb-write-l" for="w-duet">How do the taps prove what you heard the first time?</label><textarea class="sb-write" id="w-duet" data-req data-label="How the taps prove it" placeholder="The right hand tapped… the left hand tapped…"></textarea><div class="sb-chips2">Remember to tell: <span>18 taps</span><span>13 taps</span><span>same-size pieces</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  PROVESVG
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Look back at the Think. Explain how cutting each fifth into 2 proves that four-fifths is greater than seven-tenths.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="Each fifth… so four-fifths… Then 8 tenths…"></textarea><div class="sb-chips2">Remember to tell: <span>×2 on both</span><span>same-size pieces</span><span>8 &gt; 7</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! In twentieths they are 4, 6 and 7 twentieths. So one-fifth, three-tenths, seven-twentieths.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Three Notes in Order</h3>
  <p>Put three-tenths, one-fifth and seven-twentieths in order from least to greatest. Re-cut them all into twentieths first.</p>
  <div class="sb-q" style="font-size:22px">[[fr:1:5~One-fifth = 4 twentieths. That is the least.]] &lt; [[fr:3:10~Three-tenths = 6 twentieths.]] &lt; [[fr:7:20~Seven-twentieths is already in twentieths.]]</div>
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
    <li><span class="bx"></span><span>I drew ×2 or ×4 arrows on both the numerator and the denominator in my math journal.</span></li>
    <li><span class="bx"></span><span>I re-cut before I compared.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.10.05 · Comparing Fractions, Part 2</h3>
  <p>Today you re-cut fractions to compare them. Next, you'll compare fractions to one-half and to one whole.</p>
</div>

<div class="sb-opti" data-slot="end-1">Before you go, listen to Bach's first Invention, one of the pieces he wrote for students like Friedemann. Listen for the two parts, one for each hand, chasing each other up and down. Press play, and stop whenever you like.</div>
<div class="sb-card sb-listen" data-src="bach-invention-1-bwv772.mp3">
  <img src="{{IMG:sb-wfb-plate.jpg}}" alt="A page from Friedemann's music book" style="object-fit:contain;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>Bach · Invention No. 1 in C major</h3>
    <p style="margin:2px 0">Two parts, one for each hand. Played here from Bach's music with a harpsichord sound. About 1¼ minutes.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Johann Sebastian Bach, Invention No. 1 in C major, BWV 772. Played with a harpsichord sound made for this page from the Mutopia Project MIDI file (public domain, via Wikimedia Commons).</p>
  </div>
</div>
</section>

<footer class="sb-foot footer"><b>🏫 Optima Academy Online</b><br>Math · Grade 3 · Lesson 3.10.04 · Unit 10<br><span style="font-size:12px">Art: Johann Sebastian Bach, Clavier-Büchlein for Wilhelm Friedemann Bach (1720), Yale University, Beinecke Rare Book and Manuscript Library; public domain, via Wikimedia Commons. Music: Bach, Invention No. 1, BWV 772, played from the Mutopia Project MIDI (public domain). The Duet: notes played in the page.</span></footer>
</div>

'''
FL = [(4, 2), (7, 2), (9, 2), (3, 4), (5, 4), (4, 5), (7, 5), (6, 2)]
flu = '\n      '.join('<div class="fluency-item"><span class="fluency-q">%d × %d =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%d times %d"></div>' % (a, b, a * b, a, b) for a, b in FL)
rep = {
 'EQSVG': strips([(1, 6), (2, 12), (5, 12)], aria='Three strips of the same length. One-sixth of the top strip is shaded. In the middle strip every sixth is cut into 2, and two-twelfths are shaded, stopping at the same place. The bottom strip has five-twelfths shaded.'),
 'FLUENCY': flu,
 'REVSVG': strips([(5, 12), (7, 12)], label=False, aria='Two strips of the same length, both cut into twelfths. Five tiles of the top strip are shaded and seven tiles of the bottom strip are shaded.'),
 'PAY1': '<div>%s</div><div>%s</div>' % (strips([(4, 5), (8, 10), (7, 10)], aria='Four-fifths, eight-tenths and seven-tenths. Four-fifths and eight-tenths stop at the same place. Seven-tenths is shorter.'), arrsx(4, 5, 2)),
 'KEYSVG': strips([(4, 5), (8, 10), (7, 10)], aria='Three strips of the same length. Four-fifths of the top strip are shaded. In the middle strip each fifth is cut into 2, and eight-tenths stop at the same place. The bottom strip has seven-tenths shaded, a little shorter.'),
 'KEYARR': arrsx(4, 5, 2),
 'CORAFR': fr(4, 5) + ' = ' + fr(8, 10) + '.',
 'PROVESVG': strips([(4, 5), (7, 10)], aria='Two strips of the same length. Four-fifths of the top strip are shaded. Seven-tenths of the bottom strip are shaded.'),
}
for k, v in rep.items():
    assert k in body, k
    body = body.replace(k, v)
out = head + body + tail
open('/home/claude/g3sb/src/lesson-3-10-04.html', 'w').write(out)
print('ok', len(out))
