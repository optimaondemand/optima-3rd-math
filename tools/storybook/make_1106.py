# builds src/lesson-3-11-06.html (3.11.06 Kilograms and Grams, Chapter 11 "The Meter of Paris", Lesson 6:
# weighing water for the gram; Lavoisier, 1790s). Story stays on the Warm-Up. The Lesson and Show What You Know tabs
# are plain math: a dial scale, a weight mat and a balance. Standalone:
#   python3 make_1106.py <lesson-3-11-05.src.html> <out.html>
import sys, re, math
NAVY, BLUE, GREEN, GOLD, RED = '#0E1C42', '#1D4FA8', '#2E5B3C', '#C9A227', '#C0392B'

def c(n): return '{:,}'.format(n)
def svgw(W, H, aria, body): return '<svg viewBox="0 0 %d %d" role="img" aria-label="%s" style="display:block;width:100%%;max-width:%dpx;margin:6px 0">%s</svg>' % (W, H, aria, W, body)

def dial(cx, cy, r, mx, tk, g, title=None):
    # a static dial scale like the weigh kit: numbers at each kilogram, long marks every 500 g, red pointer at g
    o = ['<rect x="%d" y="%d" width="%d" height="%d" rx="18" fill="#E9EEF5" stroke="#5B6478" stroke-width="3"/>' % (cx - r - 20, cy - r - 20, 2 * r + 40, 2 * r + 56),
         '<circle cx="%d" cy="%d" r="%d" fill="#fff" stroke="#1F2A44" stroke-width="3"/>' % (cx, cy, r)]
    def ang(v): return math.radians(-150 + 300 * min(1, v / mx))
    m = 0
    while m <= mx:
        a = ang(m); big = m % 1000 == 0; mid = m % 500 == 0; l = 18 if big else 13 if mid else 8
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#1F2A44" stroke-width="%s"/>' % (cx + math.sin(a) * r, cy - math.cos(a) * r, cx + math.sin(a) * (r - l), cy - math.cos(a) * (r - l), 2.6 if big else 1.8 if mid else 1.1))
        if big: o.append('<text x="%.1f" y="%.1f" text-anchor="middle" font-size="13" font-weight="900" fill="%s">%s</text>' % (cx + math.sin(a) * (r - 32), cy - math.cos(a) * (r - 32) + 5, NAVY, '%d kg' % (m // 1000) if m else '0'))
        m += tk
    a = ang(g)
    o.append('<line x1="%d" y1="%d" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="3.5" stroke-linecap="round"/><circle cx="%d" cy="%d" r="6" fill="%s"/>' % (cx, cy, cx + math.sin(a) * (r - 12), cy - math.cos(a) * (r - 12), RED, cx, cy, RED))
    o.append('<rect x="%d" y="%d" width="%d" height="10" rx="4" fill="#8C96A8" stroke="#5B6478" stroke-width="2"/>' % (cx - r - 10, cy + r + 30, 2 * r + 20))
    if title: o.append('<text x="%d" y="%d" text-anchor="middle" font-size="13" font-weight="900" fill="#5B6478">%s</text>' % (cx, cy - r - 28, title))
    return ''.join(o)

def weight(g, x, y, s=1.0):
    k = g >= 1000
    h = (54 if k else 46 if g >= 500 else 40 if g >= 200 else 34 if g >= 100 else 30 if g >= 50 else 26) * s
    w = (56 if k else 48 if g >= 500 else 42 if g >= 200 else 36 if g >= 100 else 32 if g >= 50 else 28) * s
    lab = '%d kg' % (g // 1000) if k else '%d g' % g
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="5" fill="%s" stroke="%s" stroke-width="2"/>' % (x - w / 2, y - h, w, h, '#E2B33C' if k else '#C9A36A', '#8A6A00' if k else '#7A5A2A') +
            '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="3" fill="%s"/>' % (x - w * .18, y - h - 7 * s, w * .36, 8 * s, '#C99A2A' if k else '#A9844E') +
            '<text x="%.1f" y="%.1f" text-anchor="middle" font-size="%.1f" font-weight="900" fill="#3A2A12">%s</text>' % (x, y - h / 2 + 5, (14 if k else 11) * s, lab)), w

def balance(left_label, right_weights, W=520):
    px, py, arm = W / 2, 50, 170
    o = ['<rect x="%d" y="%d" width="18" height="170" fill="#8C96A8" stroke="#5B6478" stroke-width="2"/>' % (px - 9, py),
         '<rect x="%d" y="%d" width="140" height="12" rx="5" fill="#5B6478"/>' % (px - 70, py + 166),
         '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#3A2A12" stroke-width="7" stroke-linecap="round"/>' % (px - arm, py, px + arm, py),
         '<circle cx="%d" cy="%d" r="8" fill="%s"/>' % (px, py, GOLD), '<path d="M%d %d L%d %d L%d %d Z" fill="#1E7A4C"/>' % (px - 7, py - 26, px + 7, py - 26, px, py - 9)]
    for x in (px - arm, px + arm):
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#5B6478" stroke-width="2"/><line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#5B6478" stroke-width="2"/>' % (x, py, x - 70, py + 90, x, py, x + 70, py + 90))
        o.append('<path d="M%d %d Q%d %d %d %d Z" fill="#D7DEEA" stroke="#5B6478" stroke-width="3"/>' % (x - 80, py + 90, x, py + 112, x + 80, py + 90))
    lx = px - arm
    o.append('<rect x="%d" y="%d" width="76" height="56" rx="4" fill="#C49A6C" stroke="#7A5A2A" stroke-width="2.5"/><text x="%d" y="%d" text-anchor="middle" font-size="14" font-weight="900" fill="#3A2A12">%s</text>' % (lx - 38, py + 34, lx, py + 68, left_label))
    tot = sum(weight(g, 0, 0, .8)[1] + 4 for g in right_weights); x0 = px + arm - tot / 2
    for g in right_weights:
        s, w = weight(g, 0, 0, .8); s, w = weight(g, x0 + w / 2, py + 90, .8); o.append(s); x0 += w + 4
    return ''.join(o)

EQ = svgw(520, 300, 'A dial scale with its pointer at 1 kilogram, next to a level balance.',
          dial(140, 130, 100, 2000, 100, 1000) + '<g transform="translate(250,40)">' + balance('box', [500, 200, 200, 100], 260).replace('x2="300"', 'x2="300"') + '</g>')
LEARN = svgw(520, 290, 'A dial scale with its pointer one kilogram and seven small marks past zero.', dial(260, 140, 115, 2000, 100, 1700, 'SCALE · MARKS EVERY 100 g'))
THINKPAY = svgw(520, 290, 'The dial scale with its pointer one kilogram and nine marks past zero.', dial(260, 140, 115, 2000, 100, 1900))
PROVE = svgw(520, 250, 'The balance from Job 7, level: the box on the left pan, a 500 g, a 200 g and a 20 g weight on the right pan.', balance('box', [500, 200, 20]))

def fill(tpl):
    s = open(tpl).read()
    head = s[:s.index('<!-- the open book -->')]
    tail = s[s.index('<footer'):]
    head = head.replace('Liters and Milliliters · Grade 3 Math Lesson 3.11.05', 'Kilograms and Grams · Grade 3 Math Lesson 3.11.06')
    head = head.replace('<h1 class="sb-title">Liters and Milliliters</h1>', '<h1 class="sb-title">Kilograms and Grams</h1>')
    head = head.replace('Lesson 3.11.05 · Unit 11 · Lesson 5', 'Lesson 3.11.06 · Unit 11 · Lesson 6')
    head = re.sub(r'<div class="sb-pop" id="sb-std">.*?</div>', '<div class="sb-pop" id="sb-std"><b>MA.3.M.1.1</b> Select and use appropriate tools to measure the length of an object, the volume of liquid within a beaker and temperature on a thermometer.<br><b>MA.3.M.1.2</b> Solve real-world problems involving any of the four operations with whole-number lengths, masses, weights, temperatures or liquid volumes.<br><small>Today: read a dial scale by finding what each mark is worth, see 1,000 grams make 1 kilogram, write weights in kilograms and grams, and compare weights on a balance. Dimensions Math 3B, Chapter 11, Lesson 6 · Kilograms and Grams</small></div>', head, flags=re.S)
    tail = re.sub(r'Lesson 3\.11\.05 · Unit 11<br><span[^>]*>.*?</span>', 'Lesson 3.11.06 · Unit 11<br><span style="font-size:12px">Art: Jacques-Louis David, "Antoine-Laurent Lavoisier and His Wife (Marie-Anne-Pierrette Paulze)" (1788), The Metropolitan Museum of Art, CC0, via Wikimedia Commons. Music: Mozart, Eine kleine Nachtmusik (Serenade No. 13, K. 525), Romanze, Musopen, public domain, via Wikimedia Commons.</span>', tail, flags=re.S)
    return head + BODY + tail

BODY = r'''<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 11">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-lavoisier-plate.jpg}}" alt="A painting. A man in a dark coat sits at a table with a red cloth, writing with a feather pen. A woman in a white dress leans on his shoulder. Glass and brass tools stand on the table."><figcaption>Antoine Lavoisier and Marie-Anne Lavoisier, painted in 1788</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 11</div>
      <div class="sb-chap-t">The Meter of Paris</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Paris, France · about 230 years ago</p>
      <div class="sb-chap-l">Lesson 6 · Kilograms and Grams</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How many grams make a kilogram?</h3>
    ''' + EQ + r'''
    <p style="margin:4px 0 0">Read the marks on a scale, or level a balance. 1,000 grams make 1 kilogram.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Read</b> a scale: find what each mark is worth, then count.</li>
      <li><b>Change</b> kilograms and grams: 1 kg = 1,000 g.</li>
      <li><b>Compare</b> weights on a balance and in grams.</li>
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

<div class="sb-opti" data-slot="warm-1">Hoo! It's France in the 1790s. Scientists want new weights that are the same everywhere. Antoine Lavoisier, a chemist with a very careful balance, helps plan them. The idea is simple. A gram is the weight of a tiny cube of water, one centimeter on each side. A thousand grams make a kilogram. Look at an old painting of Lavoisier at his table of glass and brass tools. Today you'll weigh things in kilograms and grams.</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-11-06-warm.jpg" src="assets/video/g3math-11-06-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Chapter 11: Weighing Water</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why Lavoisier?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>This real painting was made in Paris in 1788 by the artist Jacques-Louis David. It shows the chemist Antoine Lavoisier and Marie-Anne Lavoisier, who worked with him. She drew his science tools and helped with his notes. On the table are the glass and brass tools he used to measure gases and water.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-lavoisier-full.jpg}}" alt="The whole painting: a woman in a white dress stands beside a man seated at a table with a red cloth. Tall glass tools with brass tops stand on the table, and a large glass globe lies on the floor." style="object-fit:contain;background:#FBF6EA"><figcaption>Antoine Lavoisier and Marie-Anne Lavoisier.<small>Jacques-Louis David, 1788 (The Metropolitan Museum of Art). CC0, via Wikimedia Commons.</small></figcaption></figure>
    <figure class="sb-fig"><img src="{{IMG:sb-lavoisier-detail.jpg}}" alt="A close-up of the table: a tall glass jar with a brass top and tap, a thin glass tube, and a glass bell jar." style="object-fit:contain;background:#FBF6EA"><figcaption>Glass and brass tools on the table.<small>Detail of the same painting.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">In the 1790s, France made new measures that would be the same everywhere. Lavoisier was known for weighing things very carefully, and he was one of the scientists who planned the new weights. They tied the weights to water. A gram is the weight of water that fills a tiny cube, 1 centimeter on each side. A thousand of those cubes of water weigh 1 kilogram.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> 1 kilogram is 1,000 grams. A scale has marks, so you can read how many grams something weighs.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-11-06 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-11-06</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to kilograms and grams! Warm up with thousands and adding gram weights. Then put a jar of water on a scale and read the dial.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Thousands and Gram Weights</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">Today you'll count by thousands and add up gram weights. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
FACTS
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! Each liter is 1,000 milliliters, so 8 L 70 mL = 8,000 mL + 70 mL = 8,070 mL.">
  <span class="sb-k">Remember from Lesson 3.11.05</span>
  <h3>Liters into milliliters</h3>
  <div class="sb-q">1 L = [[n:1000|1,000~One liter fills with a thousand milliliters.]] mL</div>
  <div class="sb-q">8 L 70 mL = [[n:8070|8,070~8 L is 8,000 mL. Add the 70 mL. Keep the zero in the hundreds place.]] mL</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: The Jar of Water</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">Lavoisier's helpers fill a jar with water and set it on a scale. Read the dial to find how heavy it is. Then write it in kilograms and grams.</div>
  <p class="sb-story">Lavoisier's helpers fill a big jar with water. How heavy is it?</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A scale with a round dial. The numbers on the dial are kilograms. The jar waits in the tray below. When it is on the platform, the red pointer turns.</p></div>
  <div data-mod="weigh" data-kind="dial" data-max="2000" data-tick="100" data-items="jar:1900:jar" data-name="think" data-for="on"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="on" data-cue=".wg-item"><h4>Weigh the jar</h4><p>Drag the jar onto the scale.</p></div>
    <div class="sb-step"><h4>What is each mark worth?</h4>
      <div class="sb-q">From 0 to 1 kg there are [[n:10~Count the small spaces from 0 to the 1 kg mark.]] small marks. 1 kg is 1,000 g, so each mark is [[n:100~1,000 split into 10 equal jumps.]] g.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Read the dial</h4>
      <div class="sb-q">The pointer passed 1 kg and went [[n:9~Count the marks from the 1 kg number to the red pointer.]] more marks.</div>
      <div class="sb-q">The jar weighs [[n:1900|1,900~1,000 g and 9 marks of 100 g.]] g = [[n:1~One whole kilogram.]] kg [[n:900~The grams past 1 kg.]] g</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Tell how</h4>
      <label class="sb-write-l" for="w-think">Tell how you read the scale.</label>
      <textarea class="sb-write" id="w-think" data-req data-label="The Jar of Water" placeholder="Each mark is … The pointer passed … So the jar weighs …"></textarea>
      <div class="sb-chips2">Remember to tell: <span>each mark</span><span>1 kg</span><span>1,000 g</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Count the small spaces between 0 and 1 kg. That many marks share 1,000 g.", "There are 10 marks, so each is 100 g. The pointer is 9 marks past 1 kg.", "1,000 g + 900 g = 1,900 g. That is 1 kg 900 g."]'>💡 Need a hint?</button>{{TOOL:scale-dial}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Hazel has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="hazel">I start at the last number the pointer passed. Then I count on by the marks.</div>
  <div class="sb-payoff" data-after-job="1">
    <div class="sb-art" style="margin:0"><div>''' + THINKPAY + r'''</div></div>
    <p style="margin:8px 0 0"><b>1 kg 900 g of water.</b> The pointer passed 1 kilogram and went 9 more marks of 100 g.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">You did it! The pointer passed one kilogram and went nine more marks. Each mark is one hundred grams, so the jar weighs one thousand nine hundred grams. That's one kilogram nine hundred grams.</div>
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
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. First, Claire shows how to read a scale and make a kilogram. Next, we fix some mix-ups. Then you work on your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Make a Kilogram</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>1,000 grams make 1 kilogram</h3>
    ''' + LEARN + r'''
    <ol class="sb-steps4">
      <li><b>Find what each mark is worth.</b> Count the small marks from 0 to 1 kg. If there are 10, each mark is 1,000 g ÷ 10 = 100 g.</li>
      <li><b>Read the pointer.</b> Start at the last number it passed and count on by the marks.</li>
      <li><b>Make a kilogram.</b> 300 g + 500 g + 200 g = 1,000 g = 1 kg.</li>
      <li><b>Kilograms and grams.</b> The pointer passes 1 kg and goes 7 more marks: 1,700 g = 1 kg 700 g.</li>
      <li><b>Back to grams.</b> 1 kg 700 g = 1,000 g + 700 g = 1,700 g.</li>
      <li><b>Watch the zeros.</b> 7 kg 60 g = 7,000 g + 60 g = 7,060 g. Not 760, and not 7,600.</li>
    </ol>
    <p style="margin:6px 0 0"><b>Key idea:</b> kilometers and meters, liters and milliliters, kilograms and grams: each big unit is made of 1,000 small units. To compare two weights, write both in grams first. The <b>mass</b> of a thing is how heavy it is.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to weigh and compare</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>I find what one mark is worth before I count.</span></div>
      <div class="sb-mate" data-who="felix"><span>I make 1 kilogram with gram weights: 500 + 200 + 200 + 100.</span></div>
      <div class="sb-mate" data-who="hazel"><span>I count on from the last kilogram the pointer passed.</span></div>
      <div class="sb-mate" data-who="cora"><span>I write both weights in grams before I compare them.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: Build It on the Scale</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Put a <b>1 kg</b> weight, a <b>500 g</b> weight, a <b>100 g</b> weight and a <b>50 g</b> weight on the scale. How heavy is that in all?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A scale with a round dial and a tray of weights. The gold weight is 1 kilogram. Tap a weight on the scale to take it off.</p></div>
    <div data-mod="weigh" data-kind="dial" data-max="2000" data-tick="50" data-weights="1000,500,200,100,50" data-t="1650" data-name="yt" data-for="w"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="w" data-cue=".wg-w"><h4>Put the weights on</h4><p>Drag the 1 kg, 500 g, 100 g and 50 g weights onto the scale.</p></div>
      <div class="sb-step"><h4>How heavy in all?</h4>
        <div class="sb-q">1 kg + 500 g + 100 g + 50 g = [[n:1~The gold weight.]] kg [[n:650~500 + 100 + 50.]] g</div>
        <div class="sb-q">In grams: 1,000 g + 650 g = [[n:1650|1,650~1 thousand, 6 hundreds, 5 tens.]] g</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Drag each of the four weights into the scale. If you added a wrong one, tap it to take it off.", "500 + 100 + 50 = 650. The gold weight is 1 kg.", "1 kg 650 g = 1,000 g + 650 g = 1,650 g."]'>💡 Need a hint?</button>{{TOOL:scale-dial}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="felix">I add the gram weights first. Then I put the kilograms in front.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. Here's a clue. One kilogram is one thousand grams. Write both weights in grams before you compare them.</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Kai Loses a Zero</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A sack of rice weighs <b>8 kg 20 g</b>. Kai writes, "That's 820 g."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>An empty weight mat and a tray of weights. The gold weights are 1 kilogram each. Tap a weight on the mat to take it off.</p></div>
    <div data-mod="weigh" data-kind="mat" data-weights="1000,500,200,100,50,20,10" data-t="8020" data-name="kai" data-for="w"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="w" data-cue='.wg-w[data-g="1000"]'><h4>Build 8 kg 20 g</h4><p>Drag 8 gold 1 kg weights and a 20 g weight onto the mat.</p></div>
      <div class="sb-step"><h4>Change it to grams</h4>
        <div class="sb-q">8 kilogram weights = [[n:8000|8,000~Each gold weight is 1,000 g.]] g</div>
        <div class="sb-q">8 kg 20 g = 8,000 g + 20 g = [[n:8020|8,020~8 thousands, 0 hundreds, 2 tens.]] g</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Kai</h4><label class="sb-write-l" for="w-kai">Tell Kai why 820 g is much too light, and where the zero goes.</label><textarea class="sb-write" id="w-kai" data-req data-label="Help Kai" placeholder="8 kg is … so the answer needs a 0 in the …"></textarea><div class="sb-chips2">Remember to tell: <span>8,000 g</span><span>the zero</span><span>hundreds place</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Kai wrote 8 and 20 side by side. But 8 kg is 8 thousand grams.", "8,000 g + 20 g. There are no hundreds, so the hundreds place gets a 0.", "8 kg 20 g = 8,020 g."]'>💡 Need a hint?</button>{{TOOL:bond-g}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="cora">I write the kilograms as thousands first: 8,000. Then I add the grams into the right places.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Leo Uses 100</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A pumpkin weighs <b>6 kg 300 g</b>. Leo says, "That's 600 + 300 = 900 g."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>An empty weight mat and a tray of weights. The gold weights are 1 kilogram each.</p></div>
    <div data-mod="weigh" data-kind="mat" data-weights="1000,500,200,100,50,20,10" data-t="6300" data-name="leo" data-for="w"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="w" data-cue='.wg-w[data-g="1000"]'><h4>Build 6 kg 300 g</h4><p>Drag 6 gold 1 kg weights onto the mat, then gram weights that make 300 g.</p></div>
      <div class="sb-step"><h4>Change it to grams</h4>
        <div class="sb-q">Each gold weight is [[n:1000|1,000~1 kilogram in grams.]] g, so 6 of them are [[n:6000|6,000~6 thousands.]] g.</div>
        <div class="sb-q">6 kg 300 g = 6,000 g + 300 g = [[n:6300|6,300~6 thousands and 3 hundreds.]] g</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Leo</h4><label class="sb-write-l" for="w-leo">Tell Leo why 100 is the wrong number for a kilogram.</label><textarea class="sb-write" id="w-leo" data-req data-label="Help Leo" placeholder="A meter is 100 centimeters, but a kilogram is …"></textarea><div class="sb-chips2">Remember to tell: <span>1 kg = 1,000 g</span><span>6,000 g</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Leo counted each kilogram as 100 g, like a meter in centimeters. A kilogram is bigger.", "6 gold weights = 6 × 1,000 g = 6,000 g.", "6,000 g + 300 g = 6,300 g."]'>💡 Need a hint?</button><button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="atlas">Kilometer, liter, kilogram: every one of them is 1,000 small units. Only the meter breaks into 100.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Juno Picks the Bigger Number</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Bag A weighs <b>1,700 g</b>. Bag B weighs <b>1 kg 850 g</b>. Juno says, "Bag A is heavier, because 1,700 is a bigger number than 1."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A balance with two pans, and the two bags in the tray. The heavier side of a balance goes down.</p></div>
    <div data-mod="weigh" data-kind="balance" data-compare="1" data-items="bag:1700:Bag A,bag:1850:Bag B" data-name="juno" data-for="a tip"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="a" data-cue=".wg-item.wg-next"><h4>Bag A on the left</h4><p>Drag Bag A onto the left pan.</p></div>
      <div class="sb-step" data-need="tip" data-cue=".wg-item.wg-next"><h4>Bag B on the right</h4><p>Drag Bag B onto the right pan. Watch which side goes down.</p></div>
      <div class="sb-step"><h4>Both in grams</h4>
        <div class="sb-q">Bag B: 1 kg 850 g = [[n:1850|1,850~1,000 g + 850 g.]] g. Bag A: 1,700 g.</div>
        <div class="sb-q">Bag [[w:B|bag B~Which bag made its pan go down?]] is heavier, by 1,850 − 1,700 = [[n:150~Count up from 1,700 to 1,850.]] g.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Juno</h4><label class="sb-write-l" for="w-juno">Tell Juno what to do before she compares two weights.</label><textarea class="sb-write" id="w-juno" data-req data-label="Help Juno" placeholder="First write both weights in … Then …"></textarea><div class="sb-chips2">Remember to tell: <span>grams</span><span>1 kg = 1,000 g</span><span>1,850 g</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Juno compared 1,700 with the 1 in 1 kg. But that 1 is a whole kilogram.", "1 kg 850 g = 1,850 g. Now both are in grams.", "1,850 g is more than 1,700 g, by 150 g. Bag B is heavier."]'>💡 Need a hint?</button><button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="cora">I never compare kilograms with grams. I change them to the same unit first.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn to work on your own. Find what each mark on the dial is worth. Then change kilograms to grams.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>On Your Own: A New Scale</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">This scale has more marks than the first one. Weigh the bag of beans. Then change a big weight into grams.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A scale with a round dial and a bag of beans in the tray. Look closely: this dial has more small marks between 0 and 1 kg.</p></div>
    <div data-mod="weigh" data-kind="dial" data-max="2000" data-tick="50" data-items="bag:1150:beans" data-name="own" data-for="on"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="on" data-cue=".wg-item"><h4>Weigh the beans</h4><p>Drag the bag of beans onto the scale.</p></div>
      <div class="sb-step"><h4>What is each mark worth?</h4>
        <div class="sb-q">From 0 to 1 kg there are [[n:20~Count the small spaces from 0 to the 1 kg number.]] small marks, so each mark is [[n:50~1,000 split into 20 equal jumps.]] g.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Read the dial</h4>
        <div class="sb-q">The pointer is [[n:3~Count the marks from 1 kg to the pointer.]] marks past 1 kg. The beans weigh [[n:1150|1,150~1,000 g and 3 marks of 50 g.]] g = [[n:1~One whole kilogram.]] kg [[n:150~The grams past 1 kg.]] g</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>A big weight in grams</h4>
        <div class="sb-q">A box of books weighs 9 kg 5 g. That is [[n:9005|9,005~9 kg is 9,000 g. The 5 goes in the ones place.]] g.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Tell how you know</h4><label class="sb-write-l" for="w-own">Tell how you found what each mark on this dial is worth.</label><textarea class="sb-write" id="w-own" data-req data-label="A New Scale" placeholder="From 0 to 1 kg I counted … so each mark is …"></textarea><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["This dial has 20 small marks from 0 to 1 kg, not 10. Each one is 1,000 ÷ 20 = 50 g.", "The pointer is 3 marks past 1 kg: 50, 100, 150. So the beans weigh 1,150 g.", "1,150 g = 1 kg 150 g. And 9 kg 5 g = 9,000 g + 5 g = 9,005 g."]'>💡 Need a hint?</button>{{TOOL:scale-dial}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! A box sits on one side of a balance. Add weights to the other side until the two sides are level. Then you'll know how heavy the box is.</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>Balance the Box</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">A box sits on the left pan. How heavy is it? Then, how many more grams would make it weigh 1 kilogram?</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A balance with a box on the left pan and a tray of gram weights. When both sides weigh the same, the beam is level and the arrow turns green. Tap a weight on the pan to take it off.</p></div>
  <div data-mod="weigh" data-kind="balance" data-items="box:720:box" data-weights="500,200,100,50,20,10" data-name="wow" data-for="level"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="level" data-cue=".wg-w"><h4>Problem 1 · Level the pans</h4><p>Drag weights onto the right pan until the two pans are level.</p></div>
    <div class="sb-step"><h4>Problem 1 · How heavy is the box?</h4>
      <div class="sb-q">The pans are level, so the box weighs the same as the weights: [[n:720~Add up the weights on the right pan.]] g.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Problem 2 · Up to 1 kilogram</h4>
      <div class="sb-q">1 kg = 1,000 g. 1,000 g − 720 g = [[n:280~Count up from 720: 80 makes 800, then 200 more makes 1,000.]] g more would make the box weigh 1 kg.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Start with the biggest weight. If the right pan goes down too far, take that weight off and try a smaller one.", "500 g + 200 g + 20 g makes the pans level. That is 720 g.", "From 720 to 1,000: 80 more makes 800, and 200 more makes 1,000. 80 + 200 = 280 g."]'>💡 Need a hint?</button></div>
  <div class="sb-hintbox"></div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  ''' + PROVE + r'''
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 3 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Look back at Job 7. Tell how you found the box's weight with the balance. Then tell how you found the grams that would make 1 kilogram.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="I put … on the right pan until … The box weighs … To make 1 kg, I …"></textarea><div class="sb-chips2">Remember to tell: <span>level</span><span>the weights</span><span>1,000 g</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! 6 kg is 6,000 g. Add the 7 g: 6,007 g. The zeros hold the hundreds and tens places.">
  <span class="sb-k">Bonus · optional</span>
  <h3>Just a Few Grams More</h3>
  <p>A bucket of sand weighs 6 kg 7 g. How many grams is that?</p>
  <div class="sb-q">6 kg 7 g = [[n:6007|6,007~6 kilograms are 6,000 g. The 7 goes in the ones place.]] g</div>
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
    <li><span class="bx"></span><span>I found what each mark on a scale is worth before I counted.</span></li>
    <li><span class="bx"></span><span>I wrote weights in kilograms and grams, and in grams.</span></li>
    <li><span class="bx"></span><span>I wrote both weights in grams before I compared them.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.11.07 · Word Problems</h3>
  <p>Next time, you'll use meters, liters, kilograms and degrees to solve story problems.</p>
</div>

<div class="sb-opti" data-slot="end-1">Here's music from the same years as Lavoisier's painting. It's the Romance from A Little Night Music, by Wolfgang Amadeus Mozart, written in 1787. Listen to the tune and the strings, nicely balanced, like a scale with level pans. Press play, and stop whenever you like.</div>
<div class="sb-card sb-listen" data-src="mozart-k525-romanze.mp3">
  <img src="{{IMG:sb-lavoisier-plate.jpg}}" alt="Antoine Lavoisier and Marie-Anne Lavoisier, painted in 1788" style="object-fit:cover;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>A Little Night Music</h3>
    <p style="margin:2px 0">The Romance, the slow part of "Eine kleine Nachtmusik" by Wolfgang Amadeus Mozart, written in Vienna in 1787. Four kinds of string players share one gentle tune.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Serenade No. 13 in G major, K. 525, "Eine kleine Nachtmusik," Romanze, Wolfgang Amadeus Mozart (1787). Musopen. Public domain, via Wikimedia Commons.</p>
  </div>
</div>
</section>

'''
FACTS = [('7 × 1,000', 7000, '7 times 1,000'), ('8 × 1,000', 8000, '8 times 1,000'), ('1,000 + 70', 1070, '1,000 plus 70'), ('6,000 + 900', 6900, '6,000 plus 900'), ('9,000 + 60', 9060, '9,000 plus 60'),
         ('1,000 − 400', 600, '1,000 minus 400'), ('500 + 200 + 200', 900, '500 plus 200 plus 200'), ('200 + 50 + 50', 300, '200 plus 50 plus 50'), ('1,000 − 10', 990, '1,000 minus 10'), ('100 × 10', 1000, '100 times 10')]
BODY = BODY.replace('FACTS', '\n'.join('      <div class="fluency-item"><span class="fluency-q">%s =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%s"></div>' % f for f in FACTS))
open(sys.argv[2], 'w').write(fill(sys.argv[1])); print('wrote', sys.argv[2])
