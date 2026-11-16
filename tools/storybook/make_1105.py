# builds src/lesson-3-11-05.html (3.11.05 Liters and Milliliters, Chapter 11 "The Meter of Paris", Lesson 5:
# the new liter at the market, Paris 1795). Story stays on the Warm-Up. The Lesson and Show What You Know tabs are
# plain math: beakers, 1 L bottles and a thermometer. Standalone (no other make_ file needed):
#   python3 make_1105.py <lesson-3-11-04.src.html> <out.html>
import sys, re
NAVY, BLUE, GREEN, GOLD = '#0E1C42', '#1D4FA8', '#2E5B3C', '#C9A227'

def c(n): return '{:,}'.format(n)
def svgw(W, H, aria, body): return '<svg viewBox="0 0 %d %d" role="img" aria-label="%s" style="display:block;width:100%%;max-width:%dpx;margin:6px 0">%s</svg>' % (W, H, aria, W, body)

def beaker(x, cap, tk, lab, v, y0=34, h=170, w=90, liq='water', title=None):
    # a static beaker drawn like the beaker kit: marks on the left edge, numbers outside the glass
    o = []; yB = y0 + h; col = ('#EFE3C2', '#9C8650') if liq == 'milk' else ('#9CC8EE', '#3B7DC4')
    Y = lambda m: yB - m / cap * h
    o.append('<text x="%.1f" y="%d" text-anchor="middle" font-size="12" font-weight="900" fill="#5B6478">%s</text>' % (x + w / 2, y0 - 14, title or 'BEAKER · %s mL' % c(cap)))
    o.append('<path d="M%d %d L%d %d L%d %d Q%d %d %d %d L%d %d Q%d %d %d %d L%d %d" fill="#F7FAFD" stroke="#5B6478" stroke-width="3" stroke-linejoin="round"/>' % (x - 6, y0 - 4, x, y0, x, yB - 8, x, yB, x + 8, yB, x + w - 8, yB, x + w, yB, x + w, yB - 8, x + w, y0))
    if v:
        wy = Y(v)
        o.append('<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f Z" fill="%s"/>' % (x + 1.5, wy, x + w - 1.5, wy, x + w - 1.5, yB - 8, x + w - 1.5, yB - 1.5, x + w - 8, yB - 1.5, x + 8, yB - 1.5, x + 1.5, yB - 1.5, x + 1.5, yB - 8, col[0]))
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2.5"/>' % (x + 1.5, wy, x + w - 1.5, wy, col[1]))
    LB = lab
    while h / (cap / LB) < 15: LB *= 2
    m = tk
    while m <= cap:
        big = m % lab == 0; yy = Y(m)
        o.append('<line x1="%d" y1="%.1f" x2="%d" y2="%.1f" stroke="#1F2A44" stroke-width="%s"/>' % (x, yy, x + (22 if big else 11), yy, 2 if big else 1.2))
        if m % LB == 0: o.append('<text x="%d" y="%.1f" text-anchor="end" font-size="12" font-weight="800" fill="%s">%s</text>' % (x - 8, yy + 4.3, NAVY, c(m)))
        m += tk
    o.append('<text x="%d" y="%.1f" text-anchor="end" font-size="12" font-weight="800" fill="%s">0</text>' % (x - 8, yB + 4.3, NAVY))
    return ''.join(o)

def bottle(cx, yb, fill, ow=56, bh=130, liq='water', lab=True):
    nk = ow * .38; top = yb - bh; o = []
    o.append('<path d="M%.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f L%.1f %.1f Q%.1f %.1f %.1f %.1f" fill="#F3FAF5" stroke="#4C7A5A" stroke-width="3" stroke-linejoin="round"/>' % (
        cx - ow / 2, yb - 10, cx - ow / 2, top + 18, cx - ow / 2, top, cx - nk / 2, top - 8, cx - nk / 2, top - 30, cx + nk / 2, top - 30, cx + nk / 2, top - 8, cx + ow / 2, top, cx + ow / 2, top + 18, cx + ow / 2, yb - 10, cx + ow / 2, yb, cx + ow / 2 - 10, yb, cx - ow / 2 + 10, yb, cx - ow / 2, yb, cx - ow / 2, yb - 10))
    if fill:
        lh = (bh - 6) * min(1, fill / 1000); col = ('#EFE3C2', '#9C8650') if liq == 'milk' else ('#9CC8EE', '#3B7DC4')
        o.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="6" fill="%s" stroke="%s" stroke-width="1.5"/>' % (cx - ow / 2 + 2, yb - 2 - lh, ow - 4, lh, col[0], col[1]))
        if fill >= 1000 and lab: o.append('<text x="%.1f" y="%.1f" text-anchor="middle" font-size="10.5" font-weight="900" fill="%s">1,000 mL</text>' % (cx, yb - bh / 2 + 5, NAVY))
    o.append('<rect x="%.1f" y="%.1f" width="%.1f" height="20" rx="4" fill="#fff" stroke="#4C7A5A" stroke-width="1.5"/><text x="%.1f" y="%.1f" text-anchor="middle" font-size="13" font-weight="900" fill="%s">1 L</text>' % (cx - ow * .36, top + 10, ow * .72, cx, top + 25, GREEN))
    return ''.join(o)

def arrow(x1, x2, y, lab=''):
    return '<path d="M%d %d L%d %d" stroke="%s" stroke-width="3" fill="none"/><path d="M%d %d l-10 -6 l0 12 Z" fill="%s"/>%s' % (x1, y, x2 - 10, y, BLUE, x2, y, BLUE, ('<text x="%d" y="%d" text-anchor="middle" font-size="13" font-weight="900" fill="%s">%s</text>' % ((x1 + x2) / 2, y - 10, BLUE, lab)) if lab else '')

EQ = svgw(520, 230, 'A beaker filled to its top mark, 1,000 milliliters, and an arrow to a full 1 liter bottle.',
          beaker(70, 1000, 50, 100, 1000) + arrow(190, 300, 120, 'pour') + bottle(370, 204, 1000))
LEARN = svgw(640, 230, 'A beaker with 1,350 milliliters. An arrow to a full 1 liter bottle, and the beaker now has 350 milliliters left.',
          beaker(60, 2000, 50, 100, 1350) + arrow(180, 260, 120, 'pour 1,000 mL') + bottle(320, 204, 1000) + beaker(440, 2000, 50, 100, 350, title='LEFT IN THE BEAKER'))
THINKPAY = svgw(520, 230, 'One full 1 liter bottle of milk, and a beaker with 850 milliliters of milk left.',
          bottle(110, 204, 1000, liq='milk') + beaker(260, 2000, 50, 100, 850, liq='milk', title='LEFT IN THE BEAKER'))
OWNB = svgw(660, 190, 'Six full 1 liter bottles and a small beaker with 90 milliliters.',
          ''.join(bottle(46 + i * 70, 176, 1000, ow=50, bh=110) for i in range(6)) + beaker(520, 100, 10, 20, 90, y0=40, h=136, w=80))
PROVE = svgw(520, 230, 'The bottle from Job 7, full with 1,000 milliliters, and beaker B with 550 milliliters left.',
          bottle(110, 204, 1000) + beaker(260, 1000, 50, 100, 550, title='BEAKER B · LEFT'))

def fill(tpl):
    s = open(tpl).read()
    head = s[:s.index('<!-- the open book -->')]
    tail = s[s.index('<footer'):]
    head = head.replace('Subtracting from Kilometers · Grade 3 Math Lesson 3.11.04', 'Liters and Milliliters · Grade 3 Math Lesson 3.11.05')
    head = head.replace('<h1 class="sb-title">Subtracting from Kilometers</h1>', '<h1 class="sb-title">Liters and Milliliters</h1>')
    head = head.replace('Lesson 3.11.04 · Unit 11 · Lesson 4', 'Lesson 3.11.05 · Unit 11 · Lesson 5')
    head = re.sub(r'<div class="sb-pop" id="sb-std">.*?</div>', '<div class="sb-pop" id="sb-std"><b>MA.3.M.1.1</b> Select and use appropriate tools to measure the length of an object, the volume of liquid within a beaker and temperature on a thermometer.<br><small>Today: read beakers in milliliters by finding what each mark is worth, see 1,000 milliliters fill 1 liter, write amounts in liters and milliliters, and read a thermometer in degrees Fahrenheit and Celsius. Dimensions Math 3B, Chapter 11, Lesson 5 · Liters and Milliliters</small></div>', head, flags=re.S)
    tail = re.sub(r'Lesson 3\.11\.04 · Unit 11<br><span[^>]*>.*?</span>', 'Lesson 3.11.05 · Unit 11<br><span style="font-size:12px">Art: "Usage des Nouvelles Mesures," panel 1, "le Litre (pour la Pinte)," engraved by Labrousse after Jean-Pierre Delion, Paris (1800), public domain, via Wikimedia Commons. Music: Handel, Water Music, Suite in F major, HWV 348, Air, from an old 78 rpm record (The Open Source Audio Collection: 78 RPMs &amp; Cylinder Recordings), CC BY-SA 3.0, via Wikimedia Commons.</span>', tail, flags=re.S)
    return head + BODY + tail

BODY = r'''<!-- the open book -->
<div class="sb-book" aria-label="Opti's storybook, open to Chapter 11">
  <div class="sb-book-in">
    <div class="sb-pg">
      <figure class="sb-plate"><img src="{{IMG:sb-litre-plate.jpg}}" alt="An old black-and-white print. A young man in a long apron pours from a metal jug into a funnel."><figcaption>Pouring with the new liter, a print from 1800</figcaption></figure>
    </div>
    <div class="sb-pg r">
      <div class="sb-chap">Chapter 11</div>
      <div class="sb-chap-t">The Meter of Paris</div>
      <div class="sb-orn" aria-hidden="true"></div>
      <p class="sb-chap-s">Paris, France · about 230 years ago</p>
      <div class="sb-chap-l">Lesson 5 · Liters and Milliliters</div>
    </div>
  </div>
  <img class="sb-owl" src="{{IMG:opti-owl.png}}" alt="Opti the owl, sitting on the open book">
</div>

<div class="sb-intro">
  <div class="sb-card sb-eq">
    <span class="sb-k">Essential Question</span>
    <h3>How many milliliters fill a liter?</h3>
    ''' + EQ + r'''
    <p style="margin:4px 0 0">Read the marks on a beaker. When the water reaches 1,000 milliliters, it fills a 1 liter bottle.</p>
  </div>
  <div class="sb-card sb-obj">
    <span class="sb-k">Today's Objectives</span>
    <h3>You will…</h3>
    <ul>
      <li><b>Read</b> a beaker: find what each mark is worth, then count.</li>
      <li><b>Change</b> liters and milliliters: 1 L = 1,000 mL.</li>
      <li><b>Read</b> a thermometer in degrees.</li>
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

<div class="sb-opti" data-slot="warm-1">Hoo! It's Paris in 1795. France has a brand-new way to measure milk, water and juice. It's called the liter. Shopkeepers put away their old pint pots and pour with new liter measures instead. In this old picture, a man pours through a funnel to fill a bottle. Today you'll read the marks on a beaker and see how milliliters fill a liter.</div>

<div class="sb-video pq-vslot" data-slot="warm">
  <video controls preload="metadata" playsinline poster="assets/video/g3math-11-05-warm.jpg" src="assets/video/g3math-11-05-warm.mp4"></video>
  <div class="cap">🎬 Opti Opens Chapter 11: The New Liter</div>
</div>

<div class="sb-card">
  <span class="sb-k">From the book</span>
  <h3>Why the liter measure?</h3>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>This real print was made in Paris in 1800 to show people how to use the new measures. It has six small pictures. This is picture 1. Its label says "le Litre (pour la Pinte)": the liter, in place of the old pint.</p></div>
  <div class="sb-art">
    <figure class="sb-fig"><img src="{{IMG:sb-litre-panel.jpg}}" alt="An old black-and-white print. A young man in a long apron stands by a small table. He pours from a metal jug through a funnel into a bottle. Another metal cup sits on the table." style="object-fit:contain;background:#FBF6EA"><figcaption>Picture 1: the liter.<small>"Usage des Nouvelles Mesures," engraved by Labrousse after Jean-Pierre Delion, Paris, 1800 (Bibliothèque nationale de France). Public domain, via Wikimedia Commons.</small></figcaption></figure>
    <figure class="sb-fig"><img src="{{IMG:sb-litre-detail.jpg}}" alt="A close-up of the print: a hand tips a metal jug into a funnel set in the neck of a bottle." style="object-fit:contain;background:#FBF6EA"><figcaption>The jug, the funnel and the bottle.<small>Detail of the same print.</small></figcaption></figure>
  </div>
  <p style="margin:6px 0 0">Before the 1790s, a pint of milk in one French town was not the same size as a pint in the next town. In 1795, France made new measures that would be the same everywhere. The new unit for liquids was the liter. A liter is the space inside a box 10 centimeters long, 10 centimeters wide and 10 centimeters tall. It is a little more than the old Paris pint, so sellers had to get used to new measures.</p>
  <p style="margin:6px 0 0"><b>Today's math:</b> a liter is made of 1,000 milliliters. A beaker has marks so you can read how many milliliters are in it.</p>
</div>

<div class="video-placeholder-wrap">
<!-- slot: g3math-11-05 -->
<div class="video-placeholder-inner"><div class="vp-label">🎬 Welcome Video</div><div class="vp-slot">g3math-11-05</div><div class="vp-notes"><b>Teacher recording notes:</b> Welcome to liters and milliliters! Warm up with thousands and counting by fifties. Then read a beaker of milk and pour it into a liter bottle.</div></div>
</div>

<div class="fluency-box">
  <div class="fluency-head"><div class="fluency-head-icon">✍️</div><div><div class="fluency-head-label">FACT WARM-UP</div><div class="fluency-head-title">Today's Helpers: Thousands and Fifties</div></div></div>
  <div class="fluency-body">
    <p class="fluency-instructions">Today you'll count by thousands and by fifties a lot. Type each answer, then check. You can fix any answer and check again.</p>
    <div class="fluency-grid" id="fluencyGrid">
FACTS
    </div>
    <div class="sb-help"><button type="button" class="sb-btn check" data-fluency-check>Check my answers</button></div>
    <div class="sb-fb" aria-live="polite"></div>
  </div>
</div>

<div class="sb-card sb-qgroup" data-done="review" data-ok="✓ Yes! Each kilometer is 1,000 meters, so 5 km 80 m = 5,000 m + 80 m = 5,080 m.">
  <span class="sb-k">Remember from Lesson 3.11.03</span>
  <h3>Kilometers into meters</h3>
  <div class="sb-q">1 km = [[n:1000|1,000~One kilometer is ten hundreds of meters.]] m</div>
  <div class="sb-q">5 km 80 m = [[n:5080|5,080~5 km is 5,000 m. Add the 80 m. Keep the zero in the hundreds place.]] m</div>
  <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div>
  <div class="sb-fb" aria-live="polite"></div>
</div>

<!-- JOB 1 · THINK -->
<section class="sb-card sb-job" data-job="1">
  <div class="sb-jh"><span class="sb-jn">JOB 1</span><div><h3>Think: The Milk Seller's Jug</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
  <div class="sb-opti" data-slot="think-1">A milk seller has a big jug of milk. She pours it into a beaker to measure it. Read the marks to find how much milk there is. Then pour it into liter bottles.</div>
  <p class="sb-story">A milk seller in Paris pours her jug of milk into a big beaker. How much milk is there? Then she pours it into a <b>1 liter</b> bottle.</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A beaker that holds 2,000 milliliters, with milk in it. The numbers on the side go up by 100. The gold pointer helps you count the small marks. Next to it is an empty bottle that holds 1 liter.</p></div>
  <div data-mod="beaker" data-beakers="2000:50:100:1850:milk" data-do="read" data-bottles="1:pour" data-name="think" data-for="marks pour"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="marks" data-cue=".bk-ptr"><h4>Count the marks</h4><p>Drag the gold pointer up the marks to the top of the milk.</p></div>
    <div class="sb-step"><h4>Read the beaker</h4>
      <div class="sb-q">From 0 to 100 there are 2 small marks. So each small mark is [[n:50~100 split into 2 equal jumps.]] mL.</div>
      <div class="sb-q">The milk is at [[n:1850|1,850~Find the last number below the milk, 1,800. Then count on by 50.]] mL.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step" data-need="pour" data-cue=".bk-pour.bk-next"><h4>Pour into the bottle</h4><p>Press ⤵ Pour beaker into the bottle.</p></div>
    <div class="sb-step"><h4>Liters and milliliters</h4>
      <div class="sb-q">The bottle is full: that is 1 liter. The beaker still has [[n:850~1,850 − 1,000. The bottle took 1,000 mL.]] mL.</div>
      <div class="sb-q">1,850 mL = [[n:1~One full bottle.]] L [[n:850~The milk still in the beaker.]] mL</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Tell how</h4>
      <label class="sb-write-l" for="w-think">Tell how you found how much milk there is.</label>
      <textarea class="sb-write" id="w-think" data-req data-label="The Milk Seller's Jug" placeholder="Each mark is … The milk is at … One bottle took … so …"></textarea>
      <div class="sb-chips2">Remember to tell: <span>each mark</span><span>1,000 mL</span><span>1 liter</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Look at two numbers next to each other, like 100 and 200. How many small marks make that jump of 100?", "Each small mark is 50 mL. The last number below the milk is 1,800. One more mark is 1,850.", "1,000 mL fill the bottle. 1,850 − 1,000 = 850 mL stay in the beaker. So 1,850 mL = 1 L 850 mL."]'>💡 Need a hint?</button>{{TOOL:beaker-2l}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-1">💬 Hazel has a tip</button></div>
  <div class="sb-hintbox"></div>
  <div class="sb-tip" id="tip-1" data-who="hazel">Two little marks make 100, so I count by fifties from the last number under the milk.</div>
  <div class="sb-payoff" data-after-job="1">
    <div class="sb-art" style="margin:0"><div>''' + THINKPAY + r'''</div></div>
    <p style="margin:8px 0 0"><b>1 L 850 mL of milk.</b> 1,000 mL filled the 1 liter bottle, and 850 mL stayed in the beaker.</p>
  </div>
  <div class="sb-opti" data-slot="think-done" data-after="1">You did it! The beaker showed one thousand eight hundred fifty milliliters. One thousand filled a liter bottle, and eight hundred fifty were left. So the seller has one liter eight hundred fifty milliliters of milk.</div>
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
  <div class="sb-opti" data-slot="learn-1">Welcome to the Lesson. First, Claire shows how to read a beaker and fill a liter. Next, we fix some mix-ups. Then you work on your own.</div>

  <div class="sb-video pq-vslot" data-slot="learn">
    {{LEARNVIDEO}}
    <div class="cap">🎬 Fill a Liter</div>
  </div>

  <div class="sb-card">
    <span class="sb-k">Learn</span>
    <h3>1,000 milliliters fill 1 liter</h3>
    ''' + LEARN + r'''
    <ol class="sb-steps4">
      <li><b>Find what each mark is worth.</b> Look at two numbers next to each other, like 100 and 200. Count the small marks between them. If 2 marks make 100, each mark is 50 mL.</li>
      <li><b>Read the top of the water.</b> Start at the last number below the water and count on by the marks.</li>
      <li><b>Fill a liter.</b> 1,000 mL fill a 1 liter bottle. 1 L = 1,000 mL.</li>
      <li><b>Liters and milliliters.</b> 1,350 mL: 1,000 mL fill a bottle, and 350 mL are left. 1,350 mL = 1 L 350 mL.</li>
      <li><b>Back to milliliters.</b> 1 L 350 mL = 1,000 mL + 350 mL = 1,350 mL.</li>
      <li><b>Watch the zeros.</b> 6 L 40 mL = 6,000 mL + 40 mL = 6,040 mL. Not 640, and not 6,400.</li>
    </ol>
    <p style="margin:6px 0 0"><b>Key idea:</b> liters and milliliters work just like kilometers and meters. 1,000 small units make 1 big unit. The top number on a beaker tells its <b>capacity</b>, how much it can hold. The top of the water tells how much is in it now.</p>
  </div>

  <div class="sb-card">
    <span class="sb-k">The Math Crew</span>
    <h3>Four ways to read and change liquid amounts</h3>
    <div class="sb-crew">
      <div class="sb-mate" data-who="atlas"><span>I find what one mark is worth before I count.</span></div>
      <div class="sb-mate" data-who="felix"><span>I fill a bottle with 1,000 mL. Every full bottle is 1 liter.</span></div>
      <div class="sb-mate" data-who="hazel"><span>I count on by the marks from the last number under the water.</span></div>
      <div class="sb-mate" data-who="cora"><span>I write the liters as thousands, like 6 L is 6,000 mL. Then I add the rest.</span></div>
    </div>
    <label class="sb-write-l" for="w-crew">Which Crew way helps you most? Why?</label>
    <textarea class="sb-write" id="w-crew" data-label="Which Crew way helps me most" placeholder="I like… because…"></textarea>
  </div>

  <!-- JOB 2 · YOUR TURN -->
  <section class="sb-card sb-job" data-job="2">
    <div class="sb-jh"><span class="sb-jn">JOB 2</span><div><h3>Your Turn: A Liter and Then Some</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Fill a <b>1 liter</b> bottle. Then fill the beaker to <b>900 mL</b>. How many milliliters is that in all?</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>An empty beaker that holds 1,000 mL, and an empty bottle that holds 1 liter. Tap the bottle to fill it. Drag the top of the water to fill the beaker.</p></div>
    <div data-mod="beaker" data-beakers="1000:50:100:0" data-do="fill" data-t="900" data-bottles="1:tap" data-name="yt" data-for="b fill"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="b" data-cue=".bk-bot.bk-next"><h4>Fill the bottle</h4><p>Tap the 1 L bottle to fill it.</p></div>
      <div class="sb-step" data-need="fill" data-cue=".bk-fill"><h4>Fill the beaker to 900 mL</h4><p>Drag the top of the water up to the 900 mark.</p></div>
      <div class="sb-step"><h4>How much in all?</h4>
        <div class="sb-q">The full bottle is 1 L = [[n:1000|1,000~Read the full bottle.]] mL.</div>
        <div class="sb-q">1 L 900 mL = 1,000 mL + 900 mL = [[n:1900|1,900~1 thousand and 9 hundreds.]] mL</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="sym"><h4>Compare</h4><p>Drag the right symbol into the box.</p></div>
      <div class="sb-step"><h4>Why?</h4>
        <div class="sb-q">1,090 mL is 1 L [[n:90~1,090 − 1,000.]] mL. Both have 1 liter, and 900 mL is more than 90 mL.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="sym" data-a="1 L 900 mL" data-b="1,090 mL" data-ans=">" data-wrong="<" data-name="yt-sym" data-for="sym"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["The full bottle holds 1 liter. That is 1,000 mL.", "1,000 mL + 900 mL = 1,900 mL.", "1,900 mL is more than 1,090 mL, so 1 L 900 mL > 1,090 mL."]'>💡 Need a hint?</button>{{TOOL:beaker-50}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-2">💬 Cora has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-2" data-who="cora">To compare, I write both amounts in milliliters first. Then I look at the thousands, then the hundreds.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="2">Next station: Practice together →</button></div>
</div>

<!-- STATION 2 -->
<div class="sb-station" data-st="2">
  <div class="sb-opti" data-slot="practice-1">Each job has a mix-up kids often make. Here's a clue. Before you count, find what each little mark is worth. And one liter is one thousand milliliters, just like a kilometer is one thousand meters.</div>

  <!-- JOB 3 -->
  <section class="sb-card sb-job" data-job="3">
    <div class="sb-jh"><span class="sb-jn">JOB 3</span><div><h3>Kai Counts by Hundreds</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Kai reads this beaker. He says, "The water is 9 marks up, so it is 900 mL."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A beaker that holds 1,000 mL. Its numbers go up by 200, not by 100. The gold pointer helps you count the small marks.</p></div>
    <div data-mod="beaker" data-beakers="1000:50:200:450" data-do="read" data-name="kai" data-for="marks"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="marks" data-cue=".bk-ptr"><h4>Count the marks</h4><p>Drag the gold pointer up the marks to the top of the water.</p></div>
      <div class="sb-step"><h4>What is one mark worth?</h4>
        <div class="sb-q">From 0 to 200 there are [[n:4~Count the small marks from 0 up to the 200 line.]] small marks. So each mark is 200 ÷ 4 = [[n:50~200 split into 4 equal jumps.]] mL.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Read it right</h4>
        <div class="sb-q">9 marks of 50 mL: 9 × 50 = [[n:450~Count by 50s nine times: 50, 100, 150 …]] mL. The water is at [[n:450~The same amount.]] mL.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Kai</h4><label class="sb-write-l" for="w-kai">Tell Kai what each mark is worth, and how you know.</label><textarea class="sb-write" id="w-kai" data-req data-label="Help Kai" placeholder="Each mark is not 100. From 0 to 200 there are … so …"></textarea><div class="sb-chips2">Remember to tell: <span>each mark</span><span>50 mL</span><span>count by 50s</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Kai counted each small mark as 100 mL. Check: how many marks fit between 0 and 200?", "4 marks make 200, so each mark is 50 mL.", "9 marks × 50 mL = 450 mL. The 400 line is 8 marks up, and one more mark is 450."]'>💡 Need a hint?</button>{{TOOL:beaker-50}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-3">💬 Atlas has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-3" data-who="atlas">Every beaker can count by a different number. I check two labels first, then I count.</div>
  </section>

  <!-- JOB 4 -->
  <section class="sb-card sb-job" data-job="4">
    <div class="sb-jh"><span class="sb-jn">JOB 4</span><div><h3>Leo Uses 100</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">A big jug holds <b>5 L 60 mL</b> of juice. Leo says, "That's 500 + 60 = 560 mL."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Five empty bottles that each hold 1 liter, and a small beaker that holds 100 mL. Its marks go up by 10 mL.</p></div>
    <div data-mod="beaker" data-beakers="100:10:20:0" data-do="fill" data-t="60" data-bottles="5:tap" data-name="leo" data-for="b fill"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="b" data-cue=".bk-bot.bk-next"><h4>Fill 5 liter bottles</h4><p>Tap each 1 L bottle to fill it.</p></div>
      <div class="sb-step" data-need="fill" data-cue=".bk-fill"><h4>Fill the beaker to 60 mL</h4><p>Drag the top of the water up to the 60 mark.</p></div>
      <div class="sb-step"><h4>How much in all?</h4>
        <div class="sb-q">Each full bottle holds [[n:1000|1,000~Read a full bottle.]] mL. 5 bottles hold [[n:5000|5,000~5 thousands.]] mL.</div>
        <div class="sb-q">5 L 60 mL = 5,000 mL + 60 mL = [[n:5060|5,060~5 thousands, 0 hundreds, 6 tens.]] mL</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Leo</h4><label class="sb-write-l" for="w-leo">Tell Leo why 100 is the wrong number for a liter.</label><textarea class="sb-write" id="w-leo" data-req data-label="Help Leo" placeholder="A meter is 100 centimeters, but a liter is …"></textarea><div class="sb-chips2">Remember to tell: <span>1 L = 1,000 mL</span><span>5,000 mL</span><span>the zero</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Leo counted each liter as 100 mL, like a meter in centimeters. A liter is bigger.", "Each liter is 1,000 mL, so 5 liters are 5,000 mL.", "5,000 mL + 60 mL = 5,060 mL. The 0 holds the hundreds place."]'>💡 Need a hint?</button>{{TOOL:bond-ml}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-4">💬 Felix has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-4" data-who="felix">I say it before I start: 1 liter is 1,000 milliliters. Then I can't mix it up with centimeters.</div>
  </section>

  <!-- JOB 5 -->
  <section class="sb-card sb-job" data-job="5">
    <div class="sb-jh"><span class="sb-jn">JOB 5</span><div><h3>Juno Reads the Top Number</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Juno looks at this beaker and says, "It has 500 mL of water."</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A beaker that holds 500 mL when it is full. Its numbers go up by 100. There is some water in it.</p></div>
    <div data-mod="beaker" data-beakers="500:50:100:300" data-do="read fill" data-t="500" data-name="juno" data-for="marks fill"></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="marks" data-cue=".bk-ptr"><h4>Count the marks</h4><p>Drag the gold pointer up the marks to the top of the water.</p></div>
      <div class="sb-step"><h4>How much water is in it?</h4>
        <div class="sb-q">The water is at [[n:300~Read the number at the top of the water.]] mL.</div>
        <div class="sb-q">The top number, 500 mL, is how much the beaker can hold. That is its [[w:capacity~The word for how much a container can hold.]].</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="fill" data-cue=".bk-fill"><h4>Fill it to the top</h4><p>Drag the top of the water up to the 500 mark.</p></div>
      <div class="sb-step"><h4>How much did you pour in?</h4>
        <div class="sb-q">500 mL − 300 mL = [[n:200~Count the marks you filled: each one is 50 mL.]] mL more filled it up.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Help Juno</h4><label class="sb-write-l" for="w-juno">Tell Juno what the top number means, and where to read the water.</label><textarea class="sb-write" id="w-juno" data-req data-label="Help Juno" placeholder="The top number tells … To read the water, look …"></textarea><div class="sb-chips2">Remember to tell: <span>capacity</span><span>top of the water</span><span>300 mL</span></div><div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-locked"></div>
    </div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Juno read the number at the very top of the glass. Look at where the water stops instead.", "The water stops at the 300 line. 500 mL is the capacity: how much the beaker can hold.", "To fill it, you need 500 − 300 = 200 mL more."]'>💡 Need a hint?</button>{{TOOL:beaker-50}}<button type="button" class="sb-btn ghost sb-tipbtn" data-tip="#tip-5">💬 Hazel has a tip</button></div>
    <div class="sb-hintbox"></div>
    <div class="sb-tip" id="tip-5" data-who="hazel">I put my eyes level with the top of the water. That's the number I read.</div>
  </section>
  <div class="sb-next"><button type="button" class="sb-btn gold" data-next-st="3">Next station: On your own →</button></div>
</div>

<!-- STATION 3 -->
<div class="sb-station" data-st="3">
  <div class="sb-opti" data-slot="own-1">Your turn to work on your own. Read the beaker carefully. Then read a thermometer. It has marks too, and they tell how hot or cold it is.</div>

  <!-- JOB 6 -->
  <section class="sb-card sb-job" data-job="6">
    <div class="sb-jh"><span class="sb-jn">JOB 6</span><div><h3>On Your Own: A Beaker and a Thermometer</h3><span class="sb-kind">🔨 Do · ✏️ Write</span></div><span class="sb-donechip"></span></div>
    <p class="sb-story">Read a beaker and write the amount in liters and milliliters. Change liters to milliliters. Then read a thermometer, and make it show a cooler morning.</p>
    <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>A beaker that holds 2,000 mL. Its numbers go up by 200. Below it is a thermometer. A thermometer shows temperature, how hot or cold it is. The left side counts degrees Fahrenheit (°F), and the right side counts degrees Celsius (°C).</p></div>
    <div class="sb-steps">
      <div class="sb-step" data-need="marks" data-cue=".bk-ptr"><h4>Read the beaker</h4><p>Drag the gold pointer up the marks to the top of the water.</p></div>
      <div class="sb-step"><h4>Liters and milliliters</h4>
        <div class="sb-q">The water is at [[n:1050|1,050~The last number below the water is 1,000. Each mark is 50 mL.]] mL = [[n:1~One thousand milliliters make 1 liter.]] L [[n:50~What is left after the 1,000.]] mL</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step"><h4>Six bottles and a little more</h4>
        ''' + OWNB + r'''
        <div class="sb-q">6 L 90 mL = [[n:6090|6,090~6 liters are 6,000 mL. Add the 90 mL. Keep the zero in the hundreds place.]] mL</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="read" data-cue=".th-ptr"><h4>Read the thermometer</h4><p>Drag the gold pointer up to the top of the red line.</p></div>
      <div class="sb-step"><h4>How warm is it?</h4>
        <div class="sb-q">On the °F side, the marks go up by 2. The red line is at [[n:86~The last number below the red line is 80. Count up by 2s.]] °F.</div>
        <div class="sb-q">On the °C side, the red line is at [[n:30~Read the number on the right side, level with the top of the red line.]] °C.</div>
        <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
      <div class="sb-step" data-need="temp" data-cue=".th-top"><h4>A cooler morning</h4><p>Drag the top of the red line down to 64 °F.</p></div>
      <div class="sb-locked"></div>
    </div>
    <div data-mod="beaker" data-beakers="2000:50:200:1050" data-do="read" data-name="own-bk" data-for="marks"></div>
    <div data-mod="thermo" data-f="86" data-do="read drag" data-t="64" data-name="own-th" data-for="read temp"></div>
    <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Each beaker mark is 50 mL. The water is one mark above the 1,000 line.", "1,050 mL = 1 L 50 mL. 6 L 90 mL = 6,000 mL + 90 mL = 6,090 mL.", "On the thermometer, each °F mark is 2 degrees: 80, 82, 84, 86. To show 64 °F, go down to the 60 line, then up 2 marks."]'>💡 Need a hint?</button>{{TOOL:beaker-2l}}</div>
    <div class="sb-hintbox"></div>
  </section>

  <div class="sb-next"><button type="button" class="sb-btn gold" data-go-tab="swyk">Next: Show What You Know →</button></div>
</div>
</section>

<!-- ══════════════ SHOW WHAT YOU KNOW ══════════════ -->
<section class="sb-panel tab-panel" id="tab-swyk" role="tabpanel">
<div class="sb-opti" data-slot="swyk-1">Last stop! Pour two beakers into one liter bottle. The bottle fills up before the second beaker is empty. Then say how much there is in liters and milliliters.</div>

<!-- JOB 7 -->
<section class="sb-card sb-job" data-job="7">
  <div class="sb-jh"><span class="sb-jn">JOB 7</span><div><h3>One Bottle, Two Beakers</h3><span class="sb-kind">🔨 Do</span></div><span class="sb-donechip"></span></div>
  <p class="sb-story">Beaker A has <b>950 mL</b>. Beaker B has <b>600 mL</b>. Pour them, one at a time, into an empty <b>1 liter</b> bottle. How much is there in all?</p>
  <div class="sb-ctx"><div class="sb-ctx-h">👀 What am I looking at?</div><p>Two beakers that each hold 1,000 mL, and one empty bottle that holds 1 liter. Each ⤵ Pour button pours one beaker into the bottle until the bottle is full or the beaker is empty.</p></div>
  <div data-mod="beaker" data-beakers="1000:50:100:950,1000:50:100:600" data-bottles="1:pour" data-name="wow" data-for="pour1 pour2"></div>
  <div class="sb-steps">
    <div class="sb-step" data-need="pour1" data-cue=".bk-pour[data-i='0']"><h4>Problem 1 · Pour beaker A</h4><p>Press ⤵ Pour beaker A into the bottle.</p></div>
    <div class="sb-step"><h4>Problem 1 · Is the bottle full?</h4>
      <div class="sb-q">The bottle has 950 mL. It needs [[n:50~1,000 − 950. Count up from 950.]] mL more to make 1,000 mL.</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step" data-need="pour2" data-cue=".bk-pour[data-i='1']"><h4>Problem 2 · Pour beaker B</h4><p>Press ⤵ Pour beaker B into the bottle.</p></div>
    <div class="sb-step"><h4>Problem 2 · How much in all?</h4>
      <div class="sb-q">Beaker B gave 50 mL to fill the bottle. It still has 600 − 50 = [[n:550~600 − 50.]] mL.</div>
      <div class="sb-q">In all: [[n:1~The full bottle.]] L [[n:550~What is still in beaker B.]] mL</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-step"><h4>Problem 3 · All in milliliters</h4>
      <div class="sb-q">950 mL + 600 mL = [[n:1550|1,550~950 + 50 = 1,000, and 550 more.]] mL. Does it match 1 L 550 mL? It should!</div>
      <div class="sb-help"><button type="button" class="sb-btn check">Check</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
  <div class="sb-help"><button type="button" class="sb-btn ghost" data-hints='["Beaker A has 950 mL. That is not enough to fill a 1,000 mL bottle.", "The bottle needs 50 mL more. Beaker B gives 50 mL and keeps 550 mL.", "1 full bottle + 550 mL = 1 L 550 mL = 1,550 mL."]'>💡 Need a hint?</button></div>
  <div class="sb-hintbox"></div>
</section>

<!-- JOB 8 -->
<section class="sb-card sb-job" data-job="8">
  <div class="sb-jh"><span class="sb-jn">JOB 8</span><div><h3>Prove It</h3><span class="sb-kind">✏️ Write</span></div><span class="sb-donechip"></span></div>
  ''' + PROVE + r'''
  <div class="sb-steps">
    <div class="sb-step"><h4>Problem 4 · Prove It</h4>
      <label class="sb-write-l" for="w-prove">Look back at Job 7. Tell how you found 1 L 550 mL, step by step. Then tell how to write it in milliliters.</label><textarea class="sb-write" id="w-prove" data-req data-label="Prove It" placeholder="First I poured … The bottle needed … Beaker B still had … In milliliters, that is …"></textarea><div class="sb-chips2">Remember to tell: <span>1,000 mL fill 1 L</span><span>what was left</span><span>milliliters</span></div>
      <div class="sb-help"><button type="button" class="sb-btn check">Done</button></div><div class="sb-fb" aria-live="polite"></div></div>
    <div class="sb-locked"></div>
  </div>
</section>

<div class="sb-card sb-qgroup" data-done="bonus" data-ok="✓ Yes! 8 L is 8,000 mL. Add the 5 mL: 8,005 mL. The zeros hold the hundreds and tens places.">
  <span class="sb-k">Bonus · optional</span>
  <h3>A Tiny Bit More</h3>
  <p>A water tank holds 8 L 5 mL. How many milliliters is that?</p>
  <div class="sb-q">8 L 5 mL = [[n:8005|8,005~8 liters are 8,000 mL. The 5 goes in the ones place.]] mL</div>
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
    <li><span class="bx"></span><span>I found what each mark is worth before I counted.</span></li>
    <li><span class="bx"></span><span>I wrote amounts in liters and milliliters, and in milliliters.</span></li>
    <li><span class="bx"></span><span>I read a thermometer.</span></li>
    <li><span class="bx"></span><span>I tried the Bonus. <span class="opt">(optional)</span></span></li>
  </ul>
</div>

<div class="sb-card">
  <span class="sb-k">Coming up next</span>
  <h3>Lesson 3.11.06 · Kilograms and Grams</h3>
  <p>Next time, you'll weigh things on a scale, in kilograms and grams.</p>
</div>

<div class="sb-opti" data-slot="end-1">Here's music about water. George Frideric Handel wrote the Water Music for a king's boat ride on a river in London, in 1717. This part is the Air. It's calm and flowing, like water poured slowly. It's a very old recording, so you'll hear some crackle. Press play, and stop whenever you like.</div>
<div class="sb-card sb-listen" data-src="handel-water-music-air.mp3">
  <img src="{{IMG:sb-litre-plate.jpg}}" alt="Pouring with the new liter, a print from 1800" style="object-fit:cover;background:#FBF6EA">
  <div style="flex:1">
    <span class="sb-k">Listening corner</span>
    <h3>The Water Music</h3>
    <p style="margin:2px 0">A calm, flowing part called the Air, from music George Frideric Handel wrote in 1717 for King George I's boat trip on the River Thames in London. The musicians played on a boat that floated next to the king's.</p>
    <div class="meter"><i></i></div><div class="sb-row"><button type="button" class="sb-btn play">▶ Play the music</button><button type="button" class="sb-btn ghost stop">■ Stop</button><span class="time" style="font-weight:800;color:#5B6478">0:00</span></div>
    <p class="sb-credits">Water Music, Suite in F major, HWV 348, Air, George Frideric Handel (1717). An old 78 rpm recording from The Open Source Audio Collection (78 RPMs &amp; Cylinder Recordings). CC BY-SA 3.0, via Wikimedia Commons.</p>
  </div>
</div>
</section>

'''
FACTS = [('6 × 1,000', 6000, '6 times 1,000'), ('9 × 1,000', 9000, '9 times 1,000'), ('1,000 + 350', 1350, '1,000 plus 350'), ('8,000 + 600', 8600, '8,000 plus 600'), ('7,000 + 60', 7060, '7,000 plus 60'),
         ('1,000 − 100', 900, '1,000 minus 100'), ('1,000 − 600', 400, '1,000 minus 600'), ('50 × 4', 200, '50 times 4'), ('50 × 6', 300, '50 times 6'), ('50 × 10', 500, '50 times 10')]
BODY = BODY.replace('FACTS', '\n'.join('      <div class="fluency-item"><span class="fluency-q">%s =</span><input class="fluency-input" data-answer="%d" inputmode="numeric" autocomplete="off" aria-label="%s"></div>' % f for f in FACTS))
open(sys.argv[2], 'w').write(fill(sys.argv[1])); print('wrote', sys.argv[2])
