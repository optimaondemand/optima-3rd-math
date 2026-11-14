# builds src/lesson-3-10-03.html (3.10.03 Simplifying Fractions, Bach's measures: Wachet auf / Sleepers, Wake)
exec(open('/home/claude/g3sb/tools/helpers1002.py').read())
DCOL.update({16: '#6D4C41', 20: '#3949AB'})
def arc(down):
    return ('<svg class="ar-arc%s" viewBox="0 0 160 40" aria-hidden="true"><path d="%s" fill="none" stroke="#0E1C42" stroke-width="3"/><path d="%s" fill="#0E1C42"/></svg>'
            % ((' dn', 'M8 4 Q80 44 150 6', 'M150 6 l-12 2 l6 9 z') if down else ('', 'M8 36 Q80 -4 150 34', 'M150 34 l-12 -2 l6 -9 z')))
def arrsd(a, b, n, small=True):
    # a static picture of the ÷n arrows: a/b = (a/n)/(b/n)
    st = ' style="padding:6px 0"' if small else ''
    return ('<div class="sb-stage sb-arrows"%s role="img" aria-label="%d over %d, divided by %d on the numerator and divided by %d on the denominator, equals %d over %d"><div class="ar-grid"><div class="ar-f">%s</div><div class="ar-mid"><div class="ar-slot full ok"><span>÷%d</span></div>%s<div class="ar-eq">=</div>%s<div class="ar-slot full ok"><span>÷%d</span></div></div><div class="ar-f">%s</div></div></div>'
            % (st, a, b, n, n, a // n, b // n, fr(a, b), n, arc(0), arc(1), n, fr(a // n, b // n)))

html = open('/home/claude/g3sb/src/lesson-3-10-02.html').read()
head = html[:html.index('<div class="sb-prog"')]
tail = html[html.index('<script type="application/json" id="sb-data">'):]
head = head.replace('Finding Equivalent Fractions · Grade 3 Math Lesson 3.10.02', 'Simplifying Fractions · Grade 3 Math Lesson 3.10.03')
assert 'Lesson 3.10.03' in head

body = r'''<div class="sb-prog" aria-label="Progress"><span class="k">📖 BACH'S MEASURES</span><span class="bar"><i></i></span><span class="n">0 of 8 jobs</span></div>
<div class="sb-wrap">

<header class="sb-head">
  <div class="sb-brand"><img alt="" src="https://raw.githubusercontent.com/optimaondemand/optima-assets/eeb0b335630058906d52f478028361d352253a93/images/Optima%20Final%20Circle%20-%20Owl%20Only.png"><div><b>Optima Academy Online</b><small>An Education Experience Company</small></div></div>
  <h1 class="sb-title">Simplifying Fractions</h1>
  <div class="sb-chips">
    <span class="sb-chip lead">Lesson 3.10.03 · Unit 10 · Lesson 3</span>
    <button type="button" class="sb-chip" id="sb-read">🔊 Read aloud</button>
    <button type="button" class="sb-chip" data-pop="#sb-std" aria-expanded="false">Standards ▾</button>
    <button type="button" class="sb-chip" id="sb-music" aria-pressed="false">🎵 Music: off</button>
    <button type="button" class="sb-chip" id="sb-motion" aria-pressed="true">✨ Motion: on</button>
  </div>
  <div class="sb-pop" id="sb-std"><b>MA.4.FR.1.3</b> Identify and generate equivalent fractions. Describe how the numerator and denominator change when an equivalent fraction is made.<br><small>A Grade 4 preview: simplest form. Dimensions Math 3B, Chapter 10, Lesson 3 · Simplifying Fractions</small></div>
</header>

<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 10">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-thomas-plate.jpg}}" alt="An old black-and-white print of a tall church with a pointed roof and a tower, a big school building beside it, and people walking in the square."><figcaption>Saint Thomas Church and School in Leipzig, printed in 1723</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 10</div>
      <div class="sb-chap-t">Bach's Measures</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Leipzig, Germany · about 300 years ago</p>
      <div class="sb-chap-l">Lesson 3 · Simplifying Fractions</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How can you find a simpler name for a fraction by dividing?</h3>
    EQSVG
    EQARR
    <p style="margin:4px 0 0">Group every 2 sixteenths into 1 eighth. The numerator and the denominator are both divided by 2. The shaded amount stays the same.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Group</b> the parts of a measure into bigger, equal parts.</li>
      <li><b>Divide</b> the numerator and the denominator by the same number.</li>
      <li><b>Keep dividing</b> until a fraction is in simplest form.</li>
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

<div class="sb-opti" data-slot="warm-1">Hoo, welcome back to Leipzig! It's 1731, and Bach has written new music for church called Sleepers, Wake. In one part, the violins play a quick, dancing tune full of short notes. The singers sing an old hymn tune in long, slow notes. One long note fills the same time as a group of short ones. Fewer notes, longer notes. Today we'll find the math in that.</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-10-03-warm.jpg" src="assets/video/g3math-10-03-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Lesson 3: Fewer Notes, Longer Notes</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why Bach?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A real print made from a copper plate in 1723, the year Bach came to Leipzig to work. Number 1 is Saint Thomas Church. Number 2 is Saint Thomas School, where Bach lived and taught the boys who sang in the choir. Number 3 is a stone fountain in the square. The artist drew it from a house across the square. Today that house is the Bach Museum.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-thomas-1723.jpg}}" alt="The whole print: the church with its tall tower, the school on the left marked 2, the fountain marked 3, and old German words along the bottom." style="object-fit:contain;background:#FBF6EA"><figcaption>The whole print. Find the numbers 2 and 3.<small>Johann Gottfried Krügner, Saint Thomas Church and School, Leipzig, engraving, 1723. Public domain, via Wikimedia Commons (Deutsche Fotothek).</small></figcaption></figure>
    <figure class="sb-fig"><img src="{{IMG:sb-thomas-school-crop.jpg}}" alt="A close look at the tall school building with many windows, and small people walking in the square below it." style="object-fit:contain;background:#fff"><figcaption>Saint Thomas School, where Bach lived and worked.<small>Close-up of the same print.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">In 1731 Bach wrote church music called <i>Wachet auf</i>. That is German for "Sleepers, wake." In one part, the singers hold an old hymn tune in long notes, and the violins play quick notes all around it.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> one long note fills the same time as a group of short notes. When you group the parts of a measure into bigger parts, you divide the numerator and the denominator by the same number.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-10-03 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-10-03</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to Lesson 3! Warm up with ÷2, ÷3, ÷4 and ÷5 facts. Then look at one measure cut into tenths and find a strip with fewer parts.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Divide by 2, 3, 4 and 5</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">Today you'll divide by small numbers a lot. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
      FLUENCY
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! Split every eighth into 2, and one-eighth becomes two-sixteenths. Today you'll go the other way.">
  <span class="sb-k">Remember from Lesson 2</span>
  <h3>Split every part</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Two strips, the same length. The top strip has 8 equal parts with 1 shaded. In the bottom strip, every eighth is split into 2 pieces.</p></div>
  REVSVG
  <div class="sb-q">The bottom strip has [[n:2~Count the shaded pieces in the bottom strip.]] shaded sixteenths.</div>
  <div class="sb-q">So one-eighth = [[fr:2:16~Shaded pieces in the numerator, all the pieces in the denominator.]].</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: Fewer Parts, Same Amount</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">Here is one measure cut into ten parts. Eight parts are shaded. Can you shade the same amount on a strip with fewer parts? Try the halves. Then try the fifths. Which one lines up?</div>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>The navy bar is one whole measure. Under it, the same measure is cut into tenths, halves and fifths. Eight-tenths is already shaded. The gold line shows where it stops.</p>
    <div class="sb-how"><div><b>What to do:</b> Try the halves, then the fifths.</div></div></div>
  <div data-mod="stack" data-d="10,2,5" data-k="8" data-name="think"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="r1" data-cue="text:halves row, tile 1"><h4>Try the halves row</h4><p>Tap a tile in the halves row. Look at where it stops.</p></div>
    <div class="sb-step" data-need="r2" data-cue="text:fifths row, tile 1"><h4>Shade the fifths row up to the gold line</h4><p>Tap the fifths tile that ends right on the gold line.</p></div>
    <div class="sb-step"><h4>Name it with fifths</h4>
      <div class="sb-q">Eight-tenths = [[fr:4:5~Count the shaded fifths, then count all the fifths.]]</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
      <div class="sb-fb" aria-live="polite"></div>
    </div>
    <div class="sb-step"><h4>Help Felix</h4>
      <label class="sb-write-l" for="w-think">Felix says, "Eight-tenths is more than four-fifths, because it has more parts." Use the strips to tell Felix if he is right.</label>
      <textarea class="sb-write" id="w-think" data-req data-label="Help Felix" placeholder="Felix is… because the strips…"></textarea>
      <div class="sb-chips2">Remember to tell: <span>same length</span><span>fewer, bigger parts</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div>
      <div class="sb-fb" aria-live="polite"></div>
    </div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Tap a tile in a row and look at where the shading stops.", "One half stops before the gold line, and two halves go past it.", "Count the shaded fifths. Then count all the fifths in the row."]'>💡 Need a hint?</button>{{TOOL:fbars-2-5-10}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Hazel has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="hazel">I look for a row where a line lands right on the gold line.</div>
  <div class="sb-payoff" data-after-job="1">
    <div class="sb-art" style="margin:0">PAY1</div>
    <p style="margin:8px 0 0"><b>Pairs of tenths make fifths.</b> Group every 2 tenths into 1 fifth. Both numbers are divided by 2, and the shaded length stays the same.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">You found it! Eight-tenths and four-fifths are the same amount. The fifths strip has fewer parts, and each part is bigger. More parts does not mean more music.</div>
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
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. First, Claire shows how to group parts by dividing. Next, we fix some mix-ups together. Then you try one on your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Fewer, Longer Notes</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Divide the numerator and the denominator by the same number.</h3>
    KEYSVG
    KEYARR
    <ol class="sb-steps4">
      <li><b>Group the parts the same way.</b> Here, every 2 tenths make 1 fifth.</li>
      <li><b>Divide the numerator.</b> 8 shaded parts become 8 ÷ 2 = 4 shaded parts.</li>
      <li><b>Divide the denominator by the same number.</b> 10 parts become 10 ÷ 2 = 5 parts.</li>
      <li><b>Check.</b> Same whole, same shaded length, fewer and bigger parts. Can 4 and 5 both be divided by the same number? Only by 1. So four-fifths is in <b>simplest form</b>.</li>
    </ol>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to see eight-tenths and four-fifths</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>Same measure, and the shading stops at the same place.</span></div>
      <div class="sb-mate" data-who="felix"><span>Every 2 tenths group into 1 fifth, so there are fewer, bigger parts.</span></div>
      <div class="sb-mate" data-who="hazel"><span>The arrows say ÷2 on top and ÷2 on the bottom. Always the same number.</span></div>
      <div class="sb-mate" data-who="cora"><span>CORAFR Fewest, biggest parts. That's simplest form.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: Two Short Notes, One Longer Note</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">The violins play 14 sixteenth notes in one measure. Every 2 sixteenth notes last as long as 1 eighth note. Group them and find the simplest name.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A strip cut into 16 equal parts, with 14 shaded, under 1 whole. The gold dots mark the lines you can make thick. Under the strip are two curved arrows and a row of ÷ tags.</p>
      <div class="sb-how"><div><b>What to do:</b> Group the parts in twos, then fill in the dividing.</div></div></div>
    <div data-mod="group" data-d="16" data-sh="14" data-size="2" data-name="yt-group" data-for="group"></div>
    <div data-mod="arrows" data-op="div" data-a="14" data-b="16" data-by="2" data-name="yt-arrows" data-for="top bot"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="group" data-cue="text:line after part 2"><h4>Group the sixteenths in twos</h4><p>Tap the line after every 2 tiles to make it thick. You need 7 thick lines.</p></div>
      <div class="sb-step" data-need="top" data-cue=".ar-slot.top"><h4>Put ÷2 on the top arrow</h4><p>Drag the ÷2 tag onto the top arrow.</p></div>
      <div class="sb-step" data-need="bot" data-cue=".ar-slot.bot"><h4>Put ÷2 on the bottom arrow</h4><p>Drag the ÷2 tag onto the bottom arrow.</p></div>
      <div class="sb-step"><h4>Divide both numbers by 2</h4>
        <div class="sb-q">Numerator: 14 ÷ 2 = [[n:7~Count the shaded groups. 14 split into groups of 2.]]</div>
        <div class="sb-q">Denominator: 16 ÷ 2 = [[n:8~Count all the groups. 16 split into groups of 2.]]</div>
        <div class="sb-q">So fourteen-sixteenths = [[fr:7:8~Use the new numerator and the new denominator you just found.]].</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Can you group again?</h4>
        <div class="sb-q">Can 7 and 8 both be divided by 2 with none left over? [[w:no|nope~Try 7 ÷ 2. Is anything left over?]]</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Make a thick line after tile 2, tile 4, tile 6, and so on.", "Each group of 2 sixteenths is 1 eighth. Count the shaded groups.", "14 ÷ 2 = 7 and 16 ÷ 2 = 8."]'>💡 Need a hint?</button>{{TOOL:fbars-8}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="felix">Group in 2s means ÷2 on the numerator and ÷2 on the denominator.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. Here's a clue. Divide the numerator and the denominator by the same number. Don't take away. Then ask, can I divide again?</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Leo Divides One Number</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Leo wants a simpler name for two-twelfths. He divided only the numerator by 2 and wrote one-twelfth.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Fraction tiles under 1 whole: two bars of twelfths. Then two curved arrows from two-twelfths to a new fraction, and a row of ÷ tags.</p>
      <div class="sb-how"><div><b>What to do:</b> Check Leo's fraction, then fix his arrows.</div></div></div>
    <div data-mod="cmp" data-kind="tiles" data-da="12" data-db="12" data-a="2" data-b="1" data-rows="Two-twelfths,Leo's one-twelfth" data-name="leo-tiles" data-for="a b"></div>
    <div data-mod="arrows" data-op="div" data-a="2" data-b="12" data-by="2" data-name="leo-arrows" data-for="top bot"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="a" data-cue="text:two-twelfths, tile 2"><h4>Shade two-twelfths</h4><p>Tap the 2nd tile in the top bar.</p></div>
      <div class="sb-step" data-need="b" data-cue="text:Leo's one-twelfth, tile 1"><h4>Shade Leo's one-twelfth</h4><p>Tap the 1st tile in the bottom bar.</p></div>
      <div class="sb-step"><h4>Is it the same amount?</h4><div class="sb-q">Leo's one-twelfth is [[w:shorter|smaller|less|less than|short~Look at where each shaded part stops.]] than two-twelfths, so it is not a new name for it.</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="top" data-cue=".ar-slot.top"><h4>Put ÷2 on the top arrow</h4><p>Drag the ÷2 tag onto the top arrow.</p></div>
      <div class="sb-step" data-need="bot" data-cue=".ar-slot.bot"><h4>Put ÷2 on the bottom arrow</h4><p>Drag the ÷2 tag onto the bottom arrow.</p></div>
      <div class="sb-step"><h4>Fix Leo's fraction</h4><div class="sb-q">Two-twelfths = [[fr:1:6~Numerator: 2 ÷ 2. Denominator: 12 ÷ 2.]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Leo</h4><label class="sb-write-l" for="w-leo">What did Leo forget?</label><textarea class="sb-write" id="w-leo" data-req data-label="What Leo forgot" placeholder="Leo forgot to…"></textarea><div class="sb-chips2">Remember to tell: <span>denominator</span><span>same number</span></div>
        <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Shade the tiles in each bar and look at where each one stops.", "Leo changed the numerator but not the denominator, so his parts never got bigger.", "Use ÷2 on both arrows: 2 ÷ 2 and 12 ÷ 2."]'>💡 Need a hint?</button>{{TOOL:fbars-6-12}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="atlas">When I group parts, the shaded parts and all the parts get grouped. So both numbers change.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Juno Takes Away</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Juno wants a simpler name for two-tenths. She took 1 away from the numerator and 1 away from the denominator, and wrote one-ninth.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Fraction tiles under 1 whole: a bar of tenths and a bar of ninths. Use them to check Juno's work.</p>
      <div class="sb-how"><div><b>What to do:</b> Shade both bars, then compare the lengths.</div></div></div>
    <div data-mod="cmp" data-kind="tiles" data-da="10" data-db="9" data-a="2" data-b="1" data-rows="Two-tenths,Juno's one-ninth" data-name="juno"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="a" data-cue="text:two-tenths, tile 2"><h4>Shade two-tenths</h4><p>Tap the 2nd tile in the tenths bar.</p></div>
      <div class="sb-step" data-need="b" data-cue="text:Juno's one-ninth, tile 1"><h4>Shade Juno's one-ninth</h4><p>Tap the 1st tile in the ninths bar.</p></div>
      <div class="sb-step"><h4>Compare the lengths</h4><div class="sb-q">Juno's one-ninth is [[w:shorter|smaller|less|less than|short~Look at where each shaded part stops.]] than two-tenths, so taking away changed the amount.</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Divide instead</h4>
        <div class="sb-q">Group the tenths in pairs. Numerator: 2 ÷ 2 = [[n:1~2 shaded tenths make 1 group of 2.]]</div>
        <div class="sb-q">Denominator: 10 ÷ 2 = [[n:5~10 tenths make how many groups of 2?]]</div>
        <div class="sb-q">So two-tenths = [[fr:1:5~Use the numbers you just found.]].</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Juno</h4><label class="sb-write-l" for="w-juno">Tell Juno why taking away does not give a simpler name.</label><textarea class="sb-write" id="w-juno" data-req data-label="Help Juno" placeholder="When you take away 1 from both… Dividing…"></textarea><div class="sb-chips2">Remember to tell: <span>the parts change size</span><span>divide both</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Shade the tiles in each bar. Then look at where the shading stops.", "A ninth is a different size from a tenth. Taking away changed the size of every part.", "Divide both numbers by 2: 2 ÷ 2 = 1 and 10 ÷ 2 = 5."]'>💡 Need a hint?</button>{{TOOL:fbars-9-10}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="cora">Taking away changes the size of every part. Dividing groups the parts and keeps the amount.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Kai Stops Too Soon</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Kai simplified sixteen-twentieths. He divided both numbers by 2, got eight-tenths, and stopped.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Kai's work: a strip of twentieths and a strip of tenths with the same amount shaded. Under it, a strip of tenths with gold dots on the lines you can make thick.</p>
      <div class="sb-how"><div><b>What to do:</b> Check if Kai can divide again, then group again.</div></div></div>
    KAISVG
    <div data-mod="group" data-d="10" data-sh="8" data-size="2" data-name="kai-group"></div>
    <div class="sb-steps">
      <div class="sb-step"><h4>Can Kai divide again?</h4><div class="sb-q">8 and 10 are both even, so they can both be divided by [[n:2~Even numbers can be split into groups of what number?]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="group" data-cue="text:line after part 2"><h4>Group the tenths in twos</h4><p>Tap the line after every 2 tiles to make it thick. You need 4 thick lines.</p></div>
      <div class="sb-step"><h4>Finish Kai's work</h4><div class="sb-q">Sixteen-twentieths = [[fr:4:5~Count the shaded groups and all the groups.]].</div><div class="sb-q">Can 4 and 5 both be divided by the same number, other than 1? [[w:no|nope~Try 2, 3 and 4 on the number 5.]]</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Kai</h4><label class="sb-write-l" for="w-kai">Tell Kai why he was not done at eight-tenths.</label><textarea class="sb-write" id="w-kai" data-req data-label="Help Kai" placeholder="Kai was not done because 8 and 10… After that…"></textarea><div class="sb-chips2">Remember to tell: <span>both even</span><span>divide again</span><span>simplest form</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Is there a number that divides both 8 and 10 with none left over?", "Make a thick line after tile 2, tile 4, tile 6 and tile 8.", "8 ÷ 2 = 4 and 10 ÷ 2 = 5. Only 1 divides both 4 and 5."]'>💡 Need a hint?</button>{{TOOL:fbars-5-10}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="hazel">After I divide, I always ask: can both numbers be divided again?</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn to work on your own. Find a number that divides both numbers evenly. Divide both. Then check if you can divide again.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>Find the Simplest Name</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">The violins play 6 sixteenth notes, then rest. Write <b>six-sixteenths</b> in simplest form.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Two curved arrows from six-sixteenths to a new fraction, and a row of ÷ tags.</p>
      <div class="sb-how"><div><b>What to do:</b> Pick a tag that divides both numbers, then name the new fraction.</div></div></div>
    <div data-mod="arrows" data-op="div" data-a="6" data-b="16" data-by="2" data-name="own"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="top" data-cue=".ar-slot.top"><h4>Pick a tag for the top arrow</h4><p>Drag a tag onto the top arrow. It must divide both 6 and 16 with none left over.</p></div>
      <div class="sb-step" data-need="bot" data-cue=".ar-slot.bot"><h4>Use the same tag on the bottom arrow</h4><p>Drag the same tag onto the bottom arrow.</p></div>
      <div class="sb-step"><h4>Name it</h4><div class="sb-q">6 ÷ 2 = [[n:3~Split 6 into groups of 2.]] and 16 ÷ 2 = [[n:8~Split 16 into groups of 2.]]</div><div class="sb-q">Six-sixteenths = [[fr:3:8~Use the two numbers you just found.]].</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Tell why</h4><label class="sb-write-l" for="w-own">Why can't 3 and 8 both be divided by 2?</label><textarea class="sb-write" id="w-own" data-req data-label="Why I stopped" placeholder="3 ÷ 2… so…"></textarea><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Both 6 and 16 are even.", "Even numbers can be divided by 2. Use ÷2 on both arrows.", "6 ÷ 2 = 3 and 16 ÷ 2 = 8. Then try 3 ÷ 2."]'>💡 Need a hint?</button>{{TOOL:fbars-8}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! Trade small tiles for bigger ones, two at a time. Keep trading until no bigger tile fits. Then press Play and listen. Fewer notes, longer notes.</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>The Tile Trade-In</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">In Sleepers, Wake, quick notes and long notes share the same measures. Start with a measure of 16 sixteenth notes. Trade them for bigger tiles until one long note fills the measure. Then try a measure where the violins play 14 sixteenths and rest.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Two measures made of fraction tiles. Under each one is a tray of bigger tiles. When you drag a bigger tile onto a measure, the small tiles trade for it if they group evenly. The old row stays above, a little faded, so you can see every step.</p>
    <div class="sb-how"><div><b>What to do:</b> Trade, play, then try the second measure.</div></div></div>
  <div data-mod="trade" data-d="16" data-k="16" data-sizes="8,4,2,1" data-pre="" data-name="trade1" data-for="traded whole play"></div>
  <div data-mod="trade" data-d="16" data-k="14" data-sizes="8,4,2,1" data-pre="m2" data-name="trade2" data-for="m2traded m2simple"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="traded" data-cue=".tr-tray[data-t='8']"><h4>Problem 1 · Trade sixteenths for eighths</h4><p>Drag the one-eighth tile from the tray onto the measure.</p></div>
    <div class="sb-step" data-need="whole" data-cue=".tr-tray[data-t='4']"><h4>Problem 1 · Keep trading</h4><p>Drag the next bigger tile onto the measure. Stop when one tile fills the whole measure.</p></div>
    <div class="sb-step" data-need="play"><h4>Problem 1 · Play every row</h4><p>Press <b>▶ Play every row</b>. Listen: every row ends on the same beat.</p></div>
    <div class="sb-step" data-need="m2simple" data-cue=".tr-tray[data-t='8']"><h4>Problem 2 · A measure with a rest</h4><p>In the second measure, drag the one-eighth tile from the tray onto the measure.</p></div>
    <div class="sb-step"><h4>Problem 2 · Name it</h4><div class="sb-q">Fourteen-sixteenths = [[fr:7:8~Count the eighth tiles in the measure now, and how many eighths make 1 whole.]].</div><div class="sb-q">Can the 7 eighths trade for fourths? [[w:no|nope~Try putting 7 eighths into groups of 2.]]</div><div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Problem 2 · Tell why</h4><label class="sb-write-l" for="w-trade">Why can't the 7 eighths trade for fourths?</label><textarea class="sb-write" id="w-trade" data-req data-label="Why the eighths can't trade" placeholder="7 eighths in groups of 2…"></textarea><div class="sb-chips2">Remember to tell: <span>groups of 2</span><span>1 left over</span><span>simplest form</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  PROVESVG
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Look back at the Think. Explain how grouping every 2 tenths into 1 fifth matches ÷2 on the numerator and ÷2 on the denominator.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="Every 2 tenths… so the shaded part… and all the parts…"></textarea><div class="sb-chips2">Remember to tell: <span>groups of 2</span><span>÷2 on both</span><span>same length</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! Divide both by 2 two times, or by 4 one time. Four-twentieths = one-fifth.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Two Ways Down</h3>
  <p>Write four-twentieths in simplest form. Take two small steps or one big one.</p>
  <div class="sb-q" style="font-size:22px"><span class="fr"><span>4</span><span>20</span></span> = [[fr:1:5~What number divides both 4 and 20? Keep going until only 1 divides both.]]</div>
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
    <li><span class="bx"></span><span>I drew ÷ arrows on both the numerator and the denominator in my math journal.</span></li>
    <li><span class="bx"></span><span>I traded tiles until no bigger tile fit.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.10.04 · Comparing Fractions, Part 1</h3>
  <p>Today you grouped parts to find the simplest name. Next, you'll use new names to compare two fractions with different denominators.</p>
</div>

<div class="sb-opti" data-slot="end-1">Before you go, listen to Bach's Sleepers, Wake, played from his music with a soft organ sound. Listen for the slow hymn tune in long notes, with quick notes all around it. Press play, and stop whenever you like.</div>
<div class="sb-card sb-listen" data-src="bach-wachet-auf-bwv645.mp3">
  <img src="{{IMG:sb-thomas-plate.jpg}}" alt="Saint Thomas Church and School in Leipzig" style="object-fit:contain;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>Bach · Sleepers, Wake (Wachet auf)</h3>
    <p style="margin:2px 0">Bach's organ version, printed about 1748. Played here from Bach's music with a soft organ sound. About 3½ minutes.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Johann Sebastian Bach, Wachet auf, ruft uns die Stimme, BWV 645. Played with an organ sound made for this page from the Mutopia Project score (typeset by Bart Golsteijn from the Bach-Gesellschaft edition), CC BY-SA 2.5. This recording is shared under the same license.</p>
  </div>
</div>
</section>

<footer class="sb-foot footer"><b>🏫 Optima Academy Online</b><br>Math · Grade 3 · Lesson 3.10.03 · Unit 10<br><span style="font-size:12px">Art: Johann Gottfried Krügner, Saint Thomas Church and School, Leipzig (1723), public domain, via Wikimedia Commons. Music: Bach, Wachet auf, ruft uns die Stimme, BWV 645, played from the Mutopia Project score (Bart Golsteijn, CC BY-SA 2.5). Tile trade-in: a tune played in the page.</span></footer>
</div>

'''
FL = [(16, 2), (14, 2), (12, 3), (15, 3), (20, 4), (16, 4), (20, 5), (25, 5)]
flu = '\n      '.join('<div class="fluency-item"><span class="fluency-q">%d ÷ %d =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%d divided by %d"></div>' % (a, b, a // b, a, b) for a, b in FL)
rep = {
 'EQSVG': strips([(2, 16), (1, 8)], aria='Two strips of the same length. Two-sixteenths of the top strip are shaded. Every 2 sixteenths of the top strip group into 1 eighth in the bottom strip, and one-eighth is shaded. The shading stops at the same place.'),
 'EQARR': arrsd(2, 16, 2),
 'FLUENCY': flu,
 'REVSVG': strips([(1, 8), (2, 16)], label=False, aria='Two strips of the same length. One-eighth of the top strip is shaded. The bottom strip is cut into sixteenths, and the shading stops at the same place.'),
 'PAY1': '<div>%s</div><div>%s</div>' % (strips([(8, 10), (4, 5)], aria='Eight-tenths and four-fifths, the same length.'), arrsd(8, 10, 2)),
 'KEYSVG': strips([(8, 10), (4, 5)], aria='Two strips of the same length. Eight-tenths of the top strip are shaded. Every 2 tenths group into 1 fifth in the bottom strip, and four-fifths are shaded. The shading stops at the same place.'),
 'KEYARR': arrsd(8, 10, 2),
 'CORAFR': fr(8, 10) + ' = ' + fr(4, 5) + '.',
 'KAISVG': '<div class="sb-art" style="margin:0 0 8px"><div>' + strips([(16, 20), (8, 10)], aria="Kai's work: sixteen-twentieths and eight-tenths, the same length.") + '<p style="margin:2px 0 0;font-weight:800;color:#5B6478">Kai\'s work: sixteen-twentieths = eight-tenths. He stopped here.</p></div></div>',
 'PROVESVG': strips([(8, 10), (4, 5)], aria='Two strips of the same length. Eight-tenths of the top strip are shaded. Four-fifths of the bottom strip are shaded.'),
}
for k, v in rep.items():
    assert k in body, k
    body = body.replace(k, v)
out = head + body + tail
open('/home/claude/g3sb/src/lesson-3-10-03.html', 'w').write(out)
print('ok', len(out))
