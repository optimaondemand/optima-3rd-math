# builds src/lesson-3-11-07.html (3.11.07 Word Problems, Chapter 11 "The Meter of Paris", Lesson 7, the chapter's last:
# market day with all the new measures, the 1800 print "Usage des Nouvelles Mesures"). Story stays on the Warm-Up.
# The Lesson and Show What You Know tabs are plain math: the cut-a-meter roll, bar models, a thermometer, a beaker and a scale.
#   python3 make_1107.py <lesson-3-11-06.src.html> <out.html>
import sys, re

def bm(whole, parts, aria):
    # a finished bar model drawn in HTML (the same look as the bar model jobs), for cards only
    col = ['#2F6FDE', '#2E7D6B', '#B05E09', '#6B46C1']
    segs = ''.join('<div class="bm-seg" style="flex:%s;background:%s"><span class="bm-slot full">%s</span></div>' % (s, col[i % 4], l) for i, (l, s) in enumerate(parts))
    return ('<div class="sb-stage sb-bm" role="img" aria-label="%s" style="margin:6px 0"><div class="bm-wrap"><div class="bm-top"><span class="bm-slot full">%s</span><span class="bm-brace"></span></div>'
            '<div class="bm-bar">%s</div></div></div>') % (aria, whole, segs)

EQ = bm('?', [('part', 3), ('part', 2)], 'A bar model: two parts and a question mark over the whole bar.')
LEARN = bm('6 m 20 cm', [('2 m 55 cm', 255), ('1 m 70 cm', 170), ('?', 195)], 'A bar model: the whole is 6 meters 20 centimeters; the parts are 2 meters 55 centimeters, 1 meter 70 centimeters and a question mark.')
PROVE = bm('3 kg', [('1 kg 650 g', 1650), ('?', 1350)], 'A bar model: the whole is 3 kilograms; one part is 1 kilogram 650 grams, the other part is a question mark.')

def fill(tpl):
    s = open(tpl).read()
    head = s[:s.index('<!-- the open book -->')]
    tail = s[s.index('<footer'):]
    head = head.replace('Kilograms and Grams · Grade 3 Math Lesson 3.11.06', 'Word Problems · Grade 3 Math Lesson 3.11.07')
    head = head.replace('<h1 class="sb-title">Kilograms and Grams</h1>', '<h1 class="sb-title">Word Problems</h1>')
    head = head.replace('Lesson 3.11.06 · Unit 11 · Lesson 6', 'Lesson 3.11.07 · Unit 11 · Lesson 7')
    head = re.sub(r'<div class="sb-pop" id="sb-std">.*?</div>', '<div class="sb-pop" id="sb-std"><b>MA.3.M.1.2</b> Solve real-world problems involving any of the four operations with whole-number lengths, masses, weights, temperatures or liquid volumes.<br><b>MA.3.AR.1.2</b> Solve one- and two-step real-world problems involving any of the four operations with whole numbers.<br><small>Today: read a word problem, draw a bar model, convert to one unit, solve, and write the answer in compound units. Lengths, liquid volumes, masses and a temperature. Dimensions Math 3B, Chapter 11, Lesson 7 · Word Problems</small></div>', head, flags=re.S)
    tail = re.sub(r'Lesson 3\.11\.06 · Unit 11<br><span[^>]*>.*?</span>', 'Lesson 3.11.07 · Unit 11<br><span style="font-size:12px">Art: "Usage des Nouvelles Mesures," etching by Labrousse after Jean-Pierre Delion, Paris, 1800, Bibliothèque nationale de France, public domain, via Wikimedia Commons. Music: Gluck, Orfeo ed Euridice, Dance of the Blessed Spirits, New York Philharmonic, Arturo Toscanini (1929), public domain, via Wikimedia Commons.</span>', tail, flags=re.S)
    return head + BODY + tail

BODY = r'''<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 11">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-mesures-row-plate.jpg}}" alt="An old black and white print in three parts. A man pours from a jug through a funnel into a bottle. A woman weighs on a small balance with weights on her table. A man measures flowered cloth with a long stick."><figcaption>Using the new measures, Paris, 1800</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 11</div>
      <div class="sb-chap-t">The Meter of Paris</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Paris, France · the year 1800</p>
      <div class="sb-chap-l">Lesson 7 · Word Problems</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How do I solve a measurement word problem?</h3>
    ''' + EQ + r'''
    <p style="margin:4px 0 0">Read it, draw a bar model, convert to one unit, then solve and write it the tidy way.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Draw</b> a bar model for a word problem.</li>
      <li><b>Convert</b> to one unit, then add or subtract.</li>
      <li><b>Write</b> the answer in compound units, like 2 m 52 cm.</li>
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

<div class="sb-opti" data-slot="warm-1">Hoo! It's Paris in the year 1800. The new measures are everywhere now. Look at this old print. A man pours with a liter. A woman weighs with grams on a balance. A man measures cloth with a meter stick. At the market, people need all the measures at once. Word problems are like that. Today you'll read a problem, draw a bar model, and solve it.</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-11-07-warm.jpg" src="assets/video/g3math-11-07-warm.mp4"></video>
  <div class="cap">🎬 Opti Closes Chapter 11: Market Day</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why a market day?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>This real print was sold in Paris in 1800. Its title means "Using the New Measures." Six pictures show people using the new units. In the top row, a man pours a liter, a woman weighs in grams, and a man measures cloth with a meter.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-mesures-full.jpg}}" alt="The whole print: a title at the top, then six numbered pictures of people pouring, weighing, measuring cloth, measuring a wall, counting coins and stacking firewood, with labels underneath." style="object-fit:contain;background:#FBF6EA"><figcaption>"Usage des Nouvelles Mesures," Paris, 1800.<small>Labrousse after Jean-Pierre Delion (Bibliothèque nationale de France). Public domain, via Wikimedia Commons.</small></figcaption></figure>
    <figure class="sb-fig"><img src="{{IMG:sb-gramme-detail.jpg}}" alt="A close-up of picture 2: a woman holds up a small balance with two pans. Weights sit on the table in front of her." style="object-fit:contain;background:#FBF6EA"><figcaption>Picture 2, "le Gramme": weighing with grams.<small>Detail of the same print.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">By 1800 the meter, the liter and the gram were the new measures in France. One shopper might buy cloth by the meter, milk by the liter and flour by the gram, all on the same trip. Real problems mix measures like that, and the same steps solve all of them.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> read the problem, draw a bar model, change to one unit, solve, and write the answer in compound units.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-11-07 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-11-07</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to measurement word problems! Warm up with make-100 and make-1,000 facts. Then cut cloth at the market.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Make 100 and Make 1,000</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">Today you'll take away from 100 and 1,000 and add up to them. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
FACTS
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! Each kilogram is 1,000 grams, so 4 kg 80 g = 4,000 g + 80 g = 4,080 g.">
  <span class="sb-k">Remember from Lesson 3.11.06</span>
  <h3>Kilograms into grams</h3>
  <div class="sb-q">1 kg = [[n:1000|1,000~A thousand grams make a kilogram.]] g</div>
  <div class="sb-q">4 kg 80 g = [[n:4080|4,080~4 kg is 4,000 g. Add the 80 g. Keep the zero in the hundreds place.]] g</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: The Cloth Seller</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">A cloth seller at the market has five meters of cloth. She sells two meters forty-eight centimeters. Cut the cloth to find out how much she has left.</div>
  <p class="sb-story">A cloth seller at the market has <b>5 m</b> of cloth. She sells <b>2 m 48 cm</b>. How much cloth is left?</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A roll of 5 whole meters of cloth. Tap a whole meter to hand it over. A broken meter opens below as a 100 cm ruler.</p></div>
  <div data-mod="cutm" data-m="5" data-orders="2:48" data-name="think" data-for="meters break cut"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="meters" data-cue=".cm-next"><h4>Hand over the meters</h4><p>Tap 2 whole meters to hand them over.</p></div>
    <div class="sb-step" data-need="break" data-cue=".cm-next"><h4>Break a meter</h4><p>Press ✂ Break a meter.</p></div>
    <div class="sb-step" data-need="cut" data-cue=".cm-next"><h4>Cut 48 cm</h4><p>Drag the scissors to 48 on the open meter.</p></div>
    <div class="sb-step"><h4>How much is left?</h4>
      <div class="sb-q">The open meter has 100 cm − 48 cm = [[n:52~Count up from 48 to 50, then to 100.]] cm left. The roll still has [[n:2~Count the whole meters that are left.]] whole meters.</div>
      <div class="sb-q">5 m − 2 m 48 cm = [[n:2~The whole meters left.]] m [[n:52~The centimeters left in the open meter.]] cm</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Tell how</h4>
      <label class="sb-write-l" for="w-think">Tell how you found the cloth that is left.</label>
      <textarea class="sb-write" id="w-think" data-req data-label="The Cloth Seller" placeholder="I handed over … Then I broke … and cut … So … is left."></textarea>
      <div class="sb-chips2">Remember to tell: <span>2 whole meters</span><span>break a meter</span><span>100 cm</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Hand over the 2 whole meters first. Then break one more meter for the 48 cm.", "100 − 48: 2 makes 50, and 50 more makes 100. 2 + 50 = 52.", "5 m − 2 m 48 cm = 2 m 52 cm."]'>💡 Need a hint?</button>{{TOOL:bond-100b}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Hazel has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="hazel">I count up from 48: 2 makes 50, and 50 more makes 100. So 52 cm are left in the open meter.</div>
  <div class="sb-payoff" data-after-job="1">
    <p style="margin:0"><b>2 m 52 cm of cloth is left.</b> 2 whole meters went to the shopper, one meter was broken into 100 cm, and 48 cm were cut from it.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">You did it! You handed over two meters, broke a meter into one hundred centimeters, and cut forty-eight. Two meters fifty-two centimeters of cloth are left.</div>
</section>

<div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="learn" data-go-st="1">Next: the Lesson →</button></div>
</section>

<!-- ══════════════ LESSON ══════════════ -->
<section class="sb-panel tab-panel" id="tab-learn" role="tabpanel">
<div class="sb-path" role="list">
  <button type="button" class="sb-pstep" data-st="1" role="listitem"><span class="num">1</span><span><b>Learn it</b><small>Learn + Your Turn</small></span></button>
  <button type="button" class="sb-pstep" data-st="2" role="listitem"><span class="num">2</span><span><b>Practice together</b><small>3 jobs</small></span></button>
  <button type="button" class="sb-pstep" data-st="3" role="listitem"><span class="num">3</span><span><b>On your own</b><small>1 job</small></span></button>
</div>

<!-- STATION 1 -->
<div class="sb-station" data-st="1">
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. First, Claire shows four steps for any word problem. Next, we fix some mix-ups. Then you work on your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Four Steps for Word Problems</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>Four steps for any measurement word problem</h3>
    <p style="margin:4px 0">A rope is <b>6 m 20 cm</b> long. Ben cuts off <b>2 m 55 cm</b>, then <b>1 m 70 cm</b>. How much rope is left?</p>
    ''' + LEARN + r'''
    <ol class="sb-steps4">
      <li><b>Read it.</b> Find the question: how much rope is left?</li>
      <li><b>Draw a bar model.</b> The whole bar is 6 m 20 cm. The two pieces Ben cut are parts. The part that is left is the ?.</li>
      <li><b>Convert and solve.</b> 6 m 20 cm = 620 cm. 620 − 255 = 365. 365 − 170 = 195 cm.</li>
      <li><b>Write it tidy.</b> 195 cm = 1 m 95 cm.</li>
    </ol>
    <p style="margin:6px 0 0"><b>Same steps for liters:</b> 2 L 350 mL − 1 L 760 mL = 2,350 mL − 1,760 mL = 590 mL.</p>
    <p style="margin:6px 0 0"><b>Watch out:</b> 3 m 110 cm is not finished. 110 cm is 1 m 10 cm, so write <b>4 m 10 cm</b>. A tidy answer has less than one big unit after it: under 100 centimeters, or under 1,000 meters, milliliters or grams.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to stay on track</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>I find the question first. Then I know what the ? is.</span></div>
      <div class="sb-mate" data-who="felix"><span>I draw the bar model before I touch the numbers.</span></div>
      <div class="sb-mate" data-who="hazel"><span>I convert to one unit: all centimeters, or all grams.</span></div>
      <div class="sb-mate" data-who="cora"><span>I check that my answer is tidy, like 4 kg 210 g, not 3 kg 1,210 g.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: Ana's Bike Ride</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Ana rides <b>1 km 490 m</b> to the park. Then she rides <b>880 m</b> to the library. How far does she ride in total?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>An empty bar model and three labels. The top shows the whole. The two pieces of the bar are the parts.</p></div>
    <div data-mod="bar" data-whole="?" data-parts="1 km 490 m:1490;880 m:880" data-name="yt" data-for="bar"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="bar" data-cue=".bm-chip.bm-next"><h4>Draw the bar model</h4><p>Drag each label onto the bar model: the two rides are the parts, and the ? is the total.</p></div>
      <div class="sb-step"><h4>Convert and add</h4>
        <div class="sb-q">1 km 490 m = [[n:1490|1,490~1 km is 1,000 m. Add the 490 m.]] m</div>
        <div class="sb-q">1,490 m + 880 m = [[n:2370|2,370~490 + 880 = 1,370. Then add the 1,000.]] m</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Write it tidy</h4>
        <div class="sb-q">2,370 m = [[n:2~Every 1,000 m is 1 km.]] km [[n:370~The meters left after the kilometers.]] m. Ana rides that far in total.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Both rides are parts. We don’t know the total yet, so the ? goes on top.", "1 km 490 m is 1,490 m. 1,490 + 880: 490 + 880 = 1,370, so 1,490 + 880 = 2,370.", "2,370 m = 2 km 370 m."]'>💡 Need a hint?</button>{{TOOL:bar-yt}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="felix">The word "total" tells me the ? is the whole bar. Then I add the parts.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. Here's a clue. Change to one unit before you add or subtract. Then write the answer the tidy way, in compound units.</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Kai Mixes the Units</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A plank is <b>3 m 10 cm</b> long. Ms. Lee cuts off <b>45 cm</b>. Kai says, "45 − 10 = 35, so the plank is 3 m 35 cm now."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>An empty bar model and three labels. The plank is the whole bar.</p></div>
    <div data-mod="bar" data-whole="3 m 10 cm" data-parts="45 cm:45;?:265" data-name="kai" data-for="bar"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="bar" data-cue=".bm-chip.bm-next"><h4>Draw the bar model</h4><p>Drag each label onto the bar model: the plank is the whole, the cut piece is one part, and the ? is the part that is left.</p></div>
      <div class="sb-step"><h4>Convert and subtract</h4>
        <div class="sb-q">3 m 10 cm = [[n:310~3 m is 300 cm. Add the 10 cm.]] cm</div>
        <div class="sb-q">310 cm − 45 cm = [[n:265~310 − 40 = 270, then take away 5 more.]] cm = [[n:2~Every 100 cm is 1 m.]] m [[n:65~The centimeters after the meters.]] cm</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Kai</h4><label class="sb-write-l" for="w-kai">Tell Kai why 3 m 35 cm can't be right, and how to fix it.</label><textarea class="sb-write" id="w-kai" data-req data-label="Help Kai" placeholder="A cut plank gets shorter, but 3 m 35 cm is … First change … to …"></textarea><div class="sb-chips2">Remember to tell: <span>shorter</span><span>310 cm</span><span>2 m 65 cm</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Kai took 10 from 45. But the 45 cm is taken away from the plank, so the plank must get shorter.", "Change the plank to centimeters: 3 m 10 cm = 310 cm. Then 310 − 45.", "310 − 45 = 265 cm = 2 m 65 cm."]'>💡 Need a hint?</button>{{TOOL:bar-kai}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="atlas">When I cut something, the answer must be smaller than what I started with. 3 m 35 cm is longer, so I know it's wrong.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Leo Leaves It Untidy</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A baker has a bag of flour that weighs <b>2 kg 840 g</b> and a bag of sugar that weighs <b>1 kg 370 g</b>. What is the total weight? Leo writes "3 kg 1,210 g."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>An empty bar model and three labels: the two bags and the ?.</p></div>
    <div data-mod="bar" data-whole="?" data-parts="2 kg 840 g:2840;1 kg 370 g:1370" data-name="leo" data-for="bar"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="bar" data-cue=".bm-chip.bm-next"><h4>Draw the bar model</h4><p>Drag each label onto the bar model: the two bags are the parts, and the ? is the total.</p></div>
      <div class="sb-step"><h4>Convert and add</h4>
        <div class="sb-q">2,840 g + 1,370 g = [[n:4210|4,210~840 + 370 = 1,210. 2,000 + 1,000 + 1,210 = 4,210.]] g</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Write it tidy</h4>
        <div class="sb-q">4,210 g = [[n:4~Every 1,000 g is 1 kg.]] kg [[n:210~The grams left after the kilograms.]] g</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Leo</h4><label class="sb-write-l" for="w-leo">Tell Leo why 3 kg 1,210 g is not finished.</label><textarea class="sb-write" id="w-leo" data-req data-label="Help Leo" placeholder="1,210 g is more than … so …"></textarea><div class="sb-chips2">Remember to tell: <span>1,000 g = 1 kg</span><span>4 kg 210 g</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Leo added right: 3 kg and 1,210 g. But 1,210 g has another kilogram inside it.", "1,210 g = 1 kg 210 g. Add that kilogram to the 3 kg.", "3 kg 1,210 g = 4 kg 210 g = 4,210 g."]'>💡 Need a hint?</button>{{TOOL:bar-leo}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="cora">After the kilograms, the grams must be less than 1,000. If they're not, I trade 1,000 g for 1 more kilogram.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>A Warmer Afternoon</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">In the morning, the thermometer by the school door shows the temperature. By the afternoon it is <b>76 °F</b>. How many degrees warmer is the afternoon?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A thermometer with Fahrenheit on the left and Celsius on the right. The red line shows the morning temperature.</p></div>
    <div data-mod="thermo" data-f="58" data-do="read drag" data-t="76" data-name="temp" data-for="read temp"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="read" data-cue=".th-ptr"><h4>Read the morning</h4><p>Drag the gold pointer up to the top of the red line.</p></div>
      <div class="sb-step"><h4>The morning temperature</h4>
        <div class="sb-q">On the °F side, the marks go up by 2. The morning is [[n:58~The last number below the red line is 50. Count up by 2s.]] °F.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="temp" data-cue=".th-top"><h4>The afternoon</h4><p>Drag the top of the red line up to 76 °F.</p></div>
      <div class="sb-step"><h4>How much warmer?</h4>
        <div class="sb-q">76 °F − 58 °F = [[n:18~Count up from 58: 2 makes 60, and 16 more makes 76.]] degrees warmer.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Each mark on the °F side is 2 degrees. The red line starts 4 marks past 50.", "The morning is 58 °F. From 58 up to 76: 2 makes 60, then 16 more makes 76.", "76 − 58 = 18. The afternoon is 18 degrees warmer."]'>💡 Need a hint?</button><button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="hazel">"How many degrees warmer" is a difference. I count up from the cooler number to the warmer one.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn to work on your own. Draw the bar model first. Then solve it one step at a time.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>On Your Own: The Fish Tank</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A fish tank holds <b>5 L</b>. Sam pours in <b>2 L 600 mL</b> of water, then <b>1 L 900 mL</b> more. How much water is in the tank? How much more will fill it?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>An empty bar model and four labels. The whole bar is what the tank holds.</p></div>
    <div data-mod="bar" data-whole="5 L" data-parts="2 L 600 mL:2600;1 L 900 mL:1900;?:500" data-name="own" data-for="bar"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="bar" data-cue=".bm-chip.bm-next"><h4>Draw the bar model</h4><p>Drag each label onto the bar model: the tank is the whole, the two pours are parts, and the ? is the space that is still empty.</p></div>
      <div class="sb-step"><h4>Step 1: water in the tank</h4>
        <div class="sb-q">2,600 mL + 1,900 mL = [[n:4500|4,500~600 + 900 = 1,500. 2,000 + 1,000 + 1,500 = 4,500.]] mL = [[n:4~Every 1,000 mL is 1 L.]] L [[n:500~The milliliters after the liters.]] mL</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Step 2: what will fill it?</h4>
        <div class="sb-q">5 L = 5,000 mL. 5,000 mL − 4,500 mL = [[n:500~Count up from 4,500 to 5,000.]] mL more fills the tank.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Tell how you know</h4><label class="sb-write-l" for="w-own">Tell why this problem needs two steps.</label><textarea class="sb-write" id="w-own" data-req data-label="The Fish Tank" placeholder="First I found … Then I …"></textarea><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["The tank (5 L) is the whole. The two pours are parts. The empty space is the ?.", "2 L 600 mL + 1 L 900 mL = 2,600 + 1,900 = 4,500 mL.", "5,000 − 4,500 = 500 mL more fills the tank."]'>💡 Need a hint?</button>{{TOOL:bar-own}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! First, pour some water. Then weigh it in a bucket. Remember, one milliliter of water weighs one gram. Then solve the problem.</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>Pour, Weigh, Solve</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">Pour <b>1,150 mL</b> of water. Put an empty bucket on the scale, then pour the water into it. How heavy is the bucket of water? How many more grams would make it weigh <b>3 kg</b>?</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A beaker that holds 2,000 mL, with marks every 50 mL. Below it, a scale with a dial and a tray with an empty bucket and the water. 1 mL of water weighs 1 g.</p></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="fill" data-cue=".bk-fill"><h4>Problem 1 · Pour the water</h4><p>Drag the top of the water up to 1,150 mL.</p></div>
    <div class="sb-step" data-need="on" data-cue=".wg-item.wg-next"><h4>Problem 1 · Weigh the bucket</h4><p>Drag the empty bucket onto the scale.</p></div>
    <div class="sb-step"><h4>Problem 1 · The empty bucket</h4>
      <div class="sb-q">The empty bucket weighs [[n:500~Each small mark is 50 g. The long mark halfway to 1 kg is 500.]] g.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step" data-need="all" data-cue=".wg-item.wg-next"><h4>Problem 1 · Add the water</h4><p>Drag the water onto the scale, next to the bucket.</p></div>
    <div class="sb-step"><h4>Problem 1 · Bucket and water</h4>
      <div class="sb-q">1,150 mL of water weighs [[n:1150|1,150~1 mL of water weighs 1 g.]] g.</div>
      <div class="sb-q">The scale shows 500 g + 1,150 g = [[n:1650|1,650~500 + 1,150.]] g = [[n:1~1,000 g is 1 kg.]] kg [[n:650~The grams after the kilogram.]] g</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Problem 2 · Up to 3 kg</h4>
      <div class="sb-q">3 kg = 3,000 g. 3,000 g − 1,650 g = [[n:1350|1,350~Count up from 1,650: 350 makes 2,000, then 1,000 more makes 3,000.]] g = [[n:1~1,000 g is 1 kg.]] kg [[n:350~The grams after the kilogram.]] g more.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div data-mod="beaker" data-beakers="2000:50:100:0" data-do="fill" data-t="1150" data-name="wow-bk" data-for="fill"></div>
  <div data-mod="weigh" data-kind="dial" data-max="3000" data-tick="50" data-inorder="1" data-items="bucket:500:bucket,water:1150:water" data-name="wow" data-for="on all"></div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Fill the beaker to 1 L, then 3 marks more: 1,050, 1,100, 1,150.", "The bucket weighs 500 g. The water weighs 1,150 g. Together: 1,650 g = 1 kg 650 g.", "From 1,650 g to 3,000 g: 350 makes 2,000, and 1,000 more makes 3,000. 1,350 g = 1 kg 350 g."]'>💡 Need a hint?</button></div>
  <div class="sb-hintbox"></div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  ''' + PROVE + r'''
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Look back at Job 7. Tell your four steps: what the question was, what your bar model showed, how you converted and solved, and your tidy answer.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="The question was … My bar model showed … I changed … to grams … My answer is …"></textarea><div class="sb-chips2">Remember to tell: <span>bar model</span><span>grams</span><span>1 kg 350 g</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! 3 × 1 m 10 cm = 3 × 110 cm = 330 cm. 500 cm − 330 cm = 170 cm = 1 m 70 cm.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Three Shelves</h3>
  <p>A board is 5 m long. Max cuts 3 shelves from it. Each shelf is 1 m 10 cm long. How much board is left?</p>
  <div class="sb-q">3 shelves use [[n:330~Each shelf is 110 cm. Multiply by 3.]] cm. The board left is [[n:1~Every 100 cm is 1 m.]] m [[n:70~500 − 330 = 170.]] cm.</div>
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
    <li><span class="bx"></span><span>I drew a bar model before I solved.</span></li>
    <li><span class="bx"></span><span>I converted to one unit before I added or subtracted.</span></li>
    <li><span class="bx"></span><span>I wrote my answers in tidy compound units.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Unit 11 Summative Assessment, then Lesson 3.12.01 · Circles</h3>
  <p>Next, you'll show what you know about measurement. Then Unit 12 begins with geometry: circles.</p>
</div>

<div class="sb-opti" data-slot="end-1">That's the last lesson in Chapter 11. Here's music Paris loved back then: the Dance of the Blessed Spirits, by Christoph Willibald Gluck. He wrote its flute tune for Paris in 1774. It's a very old recording, so you'll hear some crackle. Press play, and stop whenever you like.</div>
<div class="sb-card sb-listen" data-src="gluck-blessed-spirits.mp3">
  <img src="{{IMG:sb-mesures-row-plate.jpg}}" alt="Using the new measures, Paris, 1800" style="object-fit:cover;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>Dance of the Blessed Spirits</h3>
    <p style="margin:2px 0">A calm dance from Christoph Willibald Gluck's opera "Orfeo." For the Paris show in 1774, he gave it a long, gentle flute tune. Listen for the flute over the strings.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">"Orfeo ed Euridice," Dance of the Blessed Spirits, Christoph Willibald Gluck. New York Philharmonic, conducted by Arturo Toscanini, recorded in 1929 (HMV D 1784). Public domain, via Wikimedia Commons.</p>
  </div>
</div>
</section>

'''
FACTS = [('100 − 28', 72, '100 minus 28'), ('1,000 − 640', 360, '1,000 minus 640'), ('1,000 − 90', 910, '1,000 minus 90'), ('700 + 600', 1300, '700 plus 600'), ('430 + 570', 1000, '430 plus 570'),
         ('2 × 350', 700, '2 times 350'), ('3 × 200', 600, '3 times 200'), ('100 + 47', 147, '100 plus 47'), ('1,000 + 410', 1410, '1,000 plus 410'), ('4 × 25', 100, '4 times 25')]
BODY = BODY.replace('FACTS', '\n'.join('      <div class="fluency-item"><span class="fluency-q">%s =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%s"></div>' % f for f in FACTS))
open(sys.argv[2], 'w').write(fill(sys.argv[1])); print('wrote', sys.argv[2])
