/* ═══════════════════════════════════════════════════════════════
   OAO Grade 3 Math · Storybook layer engine (sb-)   v1 (Nov 2026)
   Shared by every G3 storybook lesson. Lesson content lives in the page;
   lesson settings in <script type="application/json" id="sb-data">.
   - tabs (Warm-Up · Lesson · Show What You Know), Lesson = 3 stations
   - jobs + progress (jobs finished, never tabs visited)
   - one step at a time (gated), answer checks with mistake hints, hint ladders
   - Opti: voice + read-along; key-word glossary tooltips with a voiced word
   - string sound (plucked, made in the page), music switch, listening corner
   - models: mono (Pythagoras' string), mono2, tiles, labelfix, sort, gather, circle, rect, strip, nl (number line), cmp (two wholes, same parts), sym (< > =), order (least to greatest, a tune), circ (circles + compass), ang (angles + set square)
   - saving (this device), journal (gather / copy / download / print), checklist
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var D = {}; try { D = JSON.parse(document.getElementById('sb-data').textContent); } catch (e) {}
  var KEY = D.key || 'g3sb', AUD = D.audioBase || 'audio/storybook/', IMG = D.imgBase || 'images/storybook/';
  var CREW = __CREW__;
  var CREWC = { atlas: '#1F8FB4', felix: '#1E8C5A', hazel: '#9A7A00', cora: '#C2601F' };
  var DCOL = { 1: '#0E1C42', 2: '#6B46C1', 3: '#B05E09', 4: '#8A6A00', 5: '#4E7A1A', 6: '#2F6FDE', 7: '#B03A2E', 8: '#A23B8C', 9: '#2E7D6B', 10: '#117E7E', 11: '#8C2F6E', 12: '#5B6478', 16: '#6D4C41', 20: '#3949AB' };
  var DNAME = { 2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth', 11: 'eleventh', 12: 'twelfth', 16: 'sixteenth', 20: 'twentieth' };
  function DPL(d) { return d === 2 ? 'halves' : DNAME[d] + 's'; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function NS(tag, attrs, parent) { var e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } if (parent) parent.appendChild(e); return e; }
  function frac(n, d) { return '<span class="fr"><span>' + n + '</span><span>' + d + '</span></span>'; }
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── saving (this device only) ───────────────────────────── */
  var ST = { vals: {}, steps: {}, jobs: {}, mods: {}, checks: {}, shown: {} };
  try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); for (var k in o) ST[k] = o[k]; } } catch (e) {}
  var saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(ST)); } catch (e) {} }, 120); }
  window.SB = { ST: ST, save: save, frac: frac, DCOL: DCOL };

  /* ── sound: a plucked string (Karplus–Strong), made in the page ── */
  var AC = null, VOL = null;
  function ac() { if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); VOL = AC.createGain(); VOL.gain.value = 0.55; VOL.connect(AC.destination); } if (AC.state === 'suspended') AC.resume(); return AC; }
  var KS = {};
  function pluck(freq, when) {
    var c = ac(); if (!c) return;
    var f = Math.round(freq * 10) / 10, buf = KS[f];
    if (!buf) {
      var sr = c.sampleRate, n = Math.max(2, Math.round(sr / f)), len = Math.floor(sr * 2.2), ring = new Float32Array(n), i;
      for (i = 0; i < n; i++) ring[i] = Math.random() * 2 - 1;
      for (i = 1; i < n; i++) ring[i] = 0.5 * (ring[i] + ring[i - 1]); // softer attack
      buf = c.createBuffer(1, len, sr); var d = buf.getChannelData(0), decay = 0.4985 + Math.min(0.0012, f / 400000);
      for (i = 0; i < len; i++) { var a = i % n, b = (i + 1) % n; d[i] = ring[a] * 0.6; ring[a] = decay * (ring[a] + ring[b]); }
      KS[f] = buf;
    }
    var s = c.createBufferSource(); s.buffer = buf; s.connect(VOL); s.start(c.currentTime + (when || 0));
  }
  SB.pluck = pluck;

  /* ── tabs ─────────────────────────────────────────────────── */
  var TABS = $$('.sb-tab');
  /* the book + EQ/objectives: open on the first tab; a slim bar to show/hide it on every later tab */
  var TOP = null, TOPBAR = null;
  (function () {
    var book = $('.sb-book'), intro = $('.sb-intro'); if (!book || !intro) return;
    TOP = el('div', 'sb-topwrap'); TOP.id = 'sb-topwrap'; book.parentNode.insertBefore(TOP, book); TOP.appendChild(book); TOP.appendChild(intro);
    var eq = $('.sb-eq h3', intro), chap = $('.sb-chap-t', book);
    TOPBAR = el('button', 'sb-topbar'); TOPBAR.type = 'button'; TOPBAR.setAttribute('aria-controls', 'sb-topwrap');
    TOPBAR.innerHTML = '<span class="ic">📖</span><span class="tx"><b>' + esc(chap ? chap.textContent : 'The book') + '</b><small>' + esc(eq ? eq.textContent : '') + ' · Today\'s objectives</small></span><span class="go"></span>';
    TOP.parentNode.insertBefore(TOPBAR, TOP);
    TOPBAR.addEventListener('click', function () { var t = ST.tab; ST.topOpen = ST.topOpen || {}; ST.topOpen[t] = !ST.topOpen[t]; save(); paintTop(); });
  })();
  function paintTop() {
    if (!TOP) return; var first = TABS[0] && ST.tab === TABS[0].dataset.tab, open = first || !!(ST.topOpen && ST.topOpen[ST.tab]);
    TOPBAR.hidden = first; TOP.hidden = !open; TOPBAR.setAttribute('aria-expanded', open); $('.go', TOPBAR).textContent = open ? 'Hide ▴' : 'Show ▾';
  }
  // height of what stays stuck at the top (progress strip + tab bar), so a new tab or station starts just under it
  function stickyH() { var h = 0, pr = $('.sb-prog'), tb = $('.sb-tabs'); if (pr) h += pr.offsetHeight; if (tb) h += tb.offsetHeight + 14; return h; }
  /* Back to the top (pilot feedback, Nov 2026). In Canvas the lesson sits in a tall iframe, so the CANVAS page is what
     scrolls; scrolling only inside the frame did nothing. So: scroll the frame, then scrollIntoView (browsers carry it up
     to the parent page), then ask Canvas itself (lti.scrollToTop). Tabs land at the very top of the lesson. */
  function toTop(node) {
    var t = node || document.body.firstElementChild || document.body;
    var y = node ? Math.max(0, node.getBoundingClientRect().top + window.scrollY - stickyH()) : 0;
    window.scrollTo({ top: y, behavior: 'instant' });
    if (node) node.style.scrollMarginTop = stickyH() + 'px';
    try { if (window.top !== window.self) t.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (e) {}
    try { if (window.parent !== window && !node) window.parent.postMessage(JSON.stringify({ subject: 'lti.scrollToTop' }), '*'); } catch (e) {}
  }
  SB.toTop = toTop;
  function switchTab(id, noScroll) {
    TABS.forEach(function (t) { var on = t.dataset.tab === id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $$('.sb-panel').forEach(function (p) { p.classList.toggle('on', p.id === 'tab-' + id); });
    ST.tab = id; save(); stopAllVoice(); paintTop();
    if (!noScroll) toTop();
    document.dispatchEvent(new CustomEvent('sb:tab', { detail: id }));
  }
  TABS.forEach(function (t, i) {
    t.addEventListener('click', function () { switchTab(t.dataset.tab); });
    t.addEventListener('keydown', function (e) { var k = e.key, j = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : -1; if (j < 0 || j >= TABS.length) return; TABS[j].focus(); switchTab(TABS[j].dataset.tab, true); });
  });
  $$('[data-go-tab]').forEach(function (b) { b.addEventListener('click', function () { switchTab(b.dataset.goTab); if (b.dataset.goSt) station(+b.dataset.goSt); }); });
  SB.switchTab = switchTab;

  /* ── stations (Lesson tab) ─────────────────────────────────── */
  var PSTEPS = $$('.sb-pstep'), STATIONS = $$('.sb-station');
  function station(n, scroll) {
    STATIONS.forEach(function (s) { s.classList.toggle('on', +s.dataset.st === n); });
    PSTEPS.forEach(function (p) { if (+p.dataset.st === n) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current'); });
    ST.st = n; save(); stopAllVoice();
    document.dispatchEvent(new CustomEvent('sb:station', { detail: n }));
    if (scroll) { var path = $('.sb-path'); if (path) toTop(path); }
  }
  PSTEPS.forEach(function (p) { p.addEventListener('click', function () { station(+p.dataset.st, true); }); });
  $$('[data-next-st]').forEach(function (b) { b.addEventListener('click', function () { station(+b.dataset.nextSt, true); }); });
  SB.station = station;

  /* ── answers ──────────────────────────────────────────────── */
  var ANS = $$('.sb-ans, .sb-write, .fluency-input');
  ANS.forEach(function (a, i) { if (!a.id) a.id = 'sb-a' + i; if (ST.vals[a.id] != null) a.value = ST.vals[a.id]; a.addEventListener('input', function () { ST.vals[a.id] = a.value; a.classList.remove('right', 'wrong'); save(); }); });
  function norm(v) { return String(v || '').toLowerCase().replace(/[‐-–—]/g, '-').replace(/\s+/g, ' ').trim(); }
  function isRight(a) { var v = norm(a.value); if (!v) return false; return (a.dataset.a || '').split('|').some(function (x) { return norm(x) === v; }); }
  function missHint(a) { var m = {}; try { m = JSON.parse(a.dataset.miss || '{}'); } catch (e) {} return m[norm(a.value)] || a.dataset.hint || ''; }
  // check every answer box inside a group; returns true when all are right
  function checkGroup(g, quiet) {
    var boxes = $$('.sb-ans', g), all = true, first = '', blank = false;
    boxes.forEach(function (a) { var ok = isRight(a); if (!a.value.trim()) { blank = true; all = false; a.classList.remove('right', 'wrong'); return; } a.classList.toggle('right', ok); a.classList.toggle('wrong', !ok); if (!ok) { all = false; if (!first) first = missHint(a); } });
    var fb = $('.sb-fb', g);
    if (fb && !quiet) { fb.className = 'sb-fb ' + (all ? 'ok' : 'no'); fb.innerHTML = all ? (g.dataset.ok || '✓ Yes!') : blank && !first ? 'Fill in every box, then check.' : (first || 'Not yet. Look at the model again and fix the red box.'); }
    return all;
  }
  SB.checkGroup = checkGroup;

  /* ── steps: one at a time ─────────────────────────────────── */
  // a step is done when its answer boxes are right AND every model it needs says so (data-need="mod")
  function stepOK(s) { var need = (s.dataset.need || '').split(' ').filter(Boolean); if (need.some(function (n) { return !(ST.steps[s.id + ':' + n]); })) return false; var boxes = $$('.sb-ans', s); return !boxes.length || boxes.every(isRight); }
  function stepsInit(box) {
    var steps = $$('.sb-step', box);
    steps.forEach(function (s, i) {
      if (!s.id) s.id = (box.closest('.sb-job') ? 'j' + box.closest('.sb-job').dataset.job : 'x') + '-s' + (i + 1);
      var top = el('div', 'sb-step-top'), dots = '';
      for (var k = 0; k < steps.length; k++) dots += '<i></i>';
      top.innerHTML = '<span class="sb-step-n">Step ' + (i + 1) + ' of ' + steps.length + '</span><span class="sb-dots">' + dots + '</span>';
      s.insertBefore(top, s.firstChild);
      var cb = $('.sb-btn.check', s);
      if (cb) cb.addEventListener('click', function () { var ok = checkGroup(s); if (!ok) return;
        var emptyW = $$('.sb-write[data-req]', s).filter(function (w) { return w.value.trim().length < 3; })[0];
        if (emptyW) { var f0 = $('.sb-fb', s); if (f0) { f0.className = 'sb-fb no'; f0.textContent = 'Write your answer in the box, then check.'; } emptyW.focus(); return; } if (!stepOK(s)) { var fb = $('.sb-fb', s); if (fb) { fb.className = 'sb-fb no'; fb.textContent = s.dataset.needMsg || 'Finish the model first.'; } return; } stepDone(s); });
    });
    refreshSteps(box);
  }
  function refreshSteps(box) {
    var steps = $$('.sb-step', box), open = true, cur = -1;
    steps.forEach(function (s, i) { if (cur < 0 && !ST.steps[s.id]) cur = i; });
    if (cur < 0) cur = steps.length - 1;
    steps.forEach(function (s, i) {
      var done = !!ST.steps[s.id];
      s.classList.toggle('open', open); s.classList.toggle('right', done);
      s.classList.toggle('now', i === cur); // only the step being worked on shows
      var nl = $('.sb-step-n', s); if (nl) nl.innerHTML = (i === cur && !done ? '👉 Do this now · ' : '') + 'Step ' + (i + 1) + ' of ' + steps.length;
      $$('.sb-dots i', s).forEach(function (d, k) { d.className = k < i ? 'd' : k === i ? 'on' : ''; });
      if (done && $$('.sb-ans', s).length) $$('.sb-ans', s).forEach(function (a) { if (isRight(a)) a.classList.add('right'); });
      open = open && done;
    });
    var job = box.closest('.sb-job');
    if (job && steps.length && steps.every(function (s) { return ST.steps[s.id]; })) jobDone(job.dataset.job);
    placeSteps(box);
    if (SB.cue) SB.cue(box);
    var lk = $('.sb-locked', box); if (lk) { var left = steps.filter(function (s) { return !ST.steps[s.id]; }).length; lk.textContent = left ? left + (left > 1 ? ' steps' : ' step') + ' to go. Each step opens when the one before is done.' : ''; }
  }
  // a job with several tools: the step list sits right above the tool the current step uses (data-for on the tool)
  function placeSteps(box) {
    var job = box.closest('.sb-job'), cur = $('.sb-step.now', box); if (!job || !cur) return;
    var need = (cur.dataset.need || '').split(' ').filter(Boolean); if (!need.length) return;
    var m = $$('[data-for]', job).filter(function (x) { return x.dataset.for.split(' ').some(function (f) { return need.indexOf(f) > -1; }); })[0];
    if (m && m.previousElementSibling !== box) m.parentNode.insertBefore(box, m);
  }
  function stepDone(s) {
    if (ST.steps[s.id]) return; ST.steps[s.id] = 1; save();
    var box = s.closest('.sb-steps'); refreshSteps(box);
    var nx = s.nextElementSibling; while (nx && !nx.classList.contains('sb-step')) nx = nx.nextElementSibling;
    if (nx) { nx.classList.add('sb-cue'); setTimeout(function () { nx.classList.remove('sb-cue'); }, 1600); var r = nx.getBoundingClientRect(); if (r.top > innerHeight - 80) window.scrollBy({ top: r.top - innerHeight / 2, behavior: reduced ? 'auto' : 'smooth' }); }
    document.dispatchEvent(new CustomEvent('sb:step', { detail: s.id }));
    if (nx && !ST.steps[nx.id] && !$('.sb-btn.check', nx) && stepOK(nx)) stepDone(nx);
  }
  // a model reports "my part of this step is done"
  function stepFor(node, name) { var s = node.closest('.sb-step'); if (s) return s; var j = node.closest('.sb-job'); return j ? $$('.sb-step', j).filter(function (x) { return (' ' + (x.dataset.need || '') + ' ').indexOf(' ' + name + ' ') > -1; })[0] : null; }
  function stepDoneFor(node, name) { var s = stepFor(node, name); return !!(s && ST.steps[s.id]); }
  SB.stepDoneFor = stepDoneFor;
  function flag(node, name, on) {
    var s = stepFor(node, name); if (!s) return; var k = s.id + ':' + name;
    if (on === false) { if (ST.steps[k]) { delete ST.steps[k]; save(); } return; }
    if (ST.steps[k]) return; ST.steps[k] = 1; save();
    if (s.classList.contains('open') && !$('.sb-btn.check', s) && stepOK(s)) stepDone(s);
  }
  SB.flag = flag;

  /* ── jobs + progress ──────────────────────────────────────── */
  var JOBS = $$('.sb-job');
  function jobDone(n) {
    var first = !ST.jobs[n]; ST.jobs[n] = 1; save(); paintJobs();
    if (first) document.dispatchEvent(new CustomEvent('sb:job', { detail: n }));
  }
  function paintJobs() {
    var done = JOBS.filter(function (j) { return ST.jobs[j.dataset.job]; }).length;
    JOBS.forEach(function (j) { var d = !!ST.jobs[j.dataset.job]; j.classList.toggle('done', d); var c = $('.sb-donechip', j); if (c) c.innerHTML = d ? '✓ Done' : ''; });
    $$('.sb-note[data-job]').forEach(function (n) { n.classList.toggle('done', !!ST.jobs[n.dataset.job]); });
    var bar = $('.sb-prog .bar i'), nn = $('.sb-prog .n'); if (bar) bar.style.width = (JOBS.length ? done / JOBS.length * 100 : 0) + '%'; if (nn) nn.textContent = done + ' of ' + JOBS.length + ' jobs';
    TABS.forEach(function (t) { var js = $$('#tab-' + t.dataset.tab + ' .sb-job'); t.classList.toggle('done', js.length > 0 && js.every(function (j) { return ST.jobs[j.dataset.job]; })); });
    PSTEPS.forEach(function (p) { var js = $$('.sb-station[data-st="' + p.dataset.st + '"] .sb-job'); p.classList.toggle('done', js.length > 0 && js.every(function (j) { return ST.jobs[j.dataset.job]; })); });
  }
  SB.jobDone = jobDone;
  // the card being worked on stands out
  document.addEventListener('focusin', function (e) { var j = e.target.closest && e.target.closest('.sb-job'); JOBS.forEach(function (x) { x.classList.toggle('sb-active', x === j); }); });
  document.addEventListener('pointerdown', function (e) { var j = e.target.closest && e.target.closest('.sb-job'); if (j) JOBS.forEach(function (x) { x.classList.toggle('sb-active', x === j); }); });

  /* ── hint ladders + Crew tips ─────────────────────────────── */
  $$('[data-hints]').forEach(function (b) {
    var H = []; try { H = JSON.parse(b.dataset.hints); } catch (e) {}
    var box = b.closest('.sb-help') ? b.closest('.sb-help').nextElementSibling : null; if (!box || !box.classList.contains('sb-hintbox')) { box = el('div', 'sb-hintbox'); (b.closest('.sb-help') || b).after(box); }
    var i = 0;
    b.addEventListener('click', function () { if (i < H.length) { box.innerHTML = H.slice(0, i + 1).map(function (h, k) { return '<div><b>Hint ' + (k + 1) + ':</b> ' + h + '</div>'; }).join(''); i++; } box.classList.add('open'); b.innerHTML = i < H.length ? '💡 Another hint' : '💡 That\'s every hint'; });
  });
  function crewImg(w) { return CREW[w] ? '<img alt="" src="' + CREW[w] + '">' : ''; }
  $$('.sb-tip[data-who]').forEach(function (t) { var w = t.dataset.who; t.style.setProperty('--c', CREWC[w]); t.innerHTML = crewImg(w) + '<div><span class="nm">' + w.charAt(0).toUpperCase() + w.slice(1) + '</span><div>' + t.innerHTML + '</div></div>'; });
  $$('.sb-mate[data-who]').forEach(function (t) { var w = t.dataset.who; t.style.setProperty('--c', CREWC[w]); t.innerHTML = crewImg(w) + '<div><b>' + w.charAt(0).toUpperCase() + w.slice(1) + '</b>' + t.innerHTML + '</div>'; });
  $$('[data-tip]').forEach(function (b) { var t = $(b.dataset.tip); if (!t) return; t.hidden = true; var w = t.dataset.who; if (w) b.style.setProperty('--c', CREWC[w]); b.addEventListener('click', function () { t.hidden = !t.hidden; b.setAttribute('aria-expanded', !t.hidden); }); });

  /* ── Opti: voice + read-along ─────────────────────────────── */
  var VOICES = [], clipA = null, clipBtn = null;
  function stopAllVoice() { VOICES.forEach(function (a) { if (!a.paused) a.pause(); }); if (clipA && !clipA.paused) { clipA.pause(); if (clipBtn) clipBtn.classList.remove('on'); } raStop(); }
  function src(name) { return (window.SB_AUDIO && window.SB_AUDIO[name]) || (AUD + name); }
  function playClip(name, btn) {
    if (clipA && !clipA.paused) { clipA.pause(); if (clipBtn) clipBtn.classList.remove('on'); if (clipBtn === btn) { clipBtn = null; return; } }
    VOICES.forEach(function (a) { if (!a.paused) a.pause(); });
    clipA = new Audio(src(name)); clipBtn = btn;
    if (btn) { btn.classList.add('on'); clipA.addEventListener('ended', function () { btn.classList.remove('on'); }); clipA.addEventListener('error', function () { btn.classList.remove('on'); btn.title = 'Sound not ready yet'; }); }
    clipA.play().catch(function () { if (btn) btn.classList.remove('on'); });
  }
  SB.playClip = playClip;
  var OWL = IMG + 'opti-owl.png'; if (window.SB_IMG && SB_IMG['opti-owl.png']) OWL = SB_IMG['opti-owl.png'];
  $$('.sb-opti[data-slot]').forEach(function (c) {
    var script = c.textContent.trim().replace(/\s+/g, ' '), toks = script.split(' '), cues = (D.cueWords || {})[c.dataset.slot];
    c.innerHTML = '<div class="perch"><img alt="Opti the owl" src="' + OWL + '"></div><div class="ob"><div class="on">Opti · your storyteller</div>' +
      '<div class="ctl"><button type="button" class="sb-btn sm play">▶ Listen to Opti</button><button type="button" class="sb-btn sm ghost ra" aria-expanded="false">📄 Read along</button><span class="sb-air" aria-hidden="true"><i></i><i></i><i></i> Opti is talking</span></div>' +
      '<div class="tr">' + toks.map(function (w, i) { return '<span data-w="' + i + '">' + esc(w) + '</span>'; }).join(' ') + '</div></div>';
    var b = $('.play', c), ra = $('.ra', c), tr = $('.tr', c), W = $$('[data-w]', tr), last = -1, raf = 0;
    function openTr(o) { tr.classList.toggle('open', o); ra.setAttribute('aria-expanded', o); ra.textContent = o ? '📄 Hide words' : '📄 Read along'; }
    ra.onclick = function () { openTr(!tr.classList.contains('open')); };
    function setWord(k) { if (k === last) return; last = k; W.forEach(function (w, i) { w.classList.toggle('said', i < k); w.classList.toggle('now', i === k); }); }
    var name = 'g3m-' + (D.lesson || '').replace(/\./g, '-') + '-' + c.dataset.slot + '.mp3', a = new Audio(); a.preload = 'none';
    a.addEventListener('error', function () { c.classList.add('no-audio'); openTr(true); });
    a.src = src(name);
    if (!(window.SB_AUDIO && window.SB_AUDIO[name]) && D.audioReady === false) { c.classList.add('no-audio'); openTr(true); }
    function frame() { if (a.duration) { if (cues && cues.length === W.length) { var t = a.currentTime, k = -1; for (var q = 0; q < cues.length; q++) if (cues[q] <= t + 0.05) k = q; setWord(k); } else setWord(Math.floor(a.currentTime / a.duration * W.length)); } if (!a.paused) raf = requestAnimationFrame(frame); }
    a.addEventListener('play', function () { VOICES.forEach(function (o) { if (o !== a && !o.paused) o.pause(); }); c.classList.add('playing'); b.textContent = '❚❚ Pause'; raf = requestAnimationFrame(frame); });
    a.addEventListener('pause', function () { c.classList.remove('playing'); cancelAnimationFrame(raf); if (!a.ended) b.textContent = '▶ Keep listening'; });
    a.addEventListener('ended', function () { c.classList.remove('playing'); cancelAnimationFrame(raf); setWord(W.length); b.textContent = '▶ Listen again'; });
    b.onclick = function () { musicDuck(); if (a.paused) { if (a.ended) { a.currentTime = 0; last = -1; setWord(-1); } a.play().catch(function () { c.classList.add('no-audio'); openTr(true); }); } else a.pause(); };
    VOICES.push(a);
    if (c.dataset.after && !ST.shown[c.dataset.slot]) c.hidden = true;
  });
  function showOpti(slot) { var c = $('.sb-opti[data-slot="' + slot + '"]'); if (!c) return; c.hidden = false; ST.shown[slot] = 1; save(); }
  SB.showOpti = showOpti;
  $$('[data-clip]').forEach(function (b) { b.addEventListener('click', function () { playClip(b.dataset.clip, b); }); });

  /* ── glossary: dotted words; tap/hover = meaning; key words have a 🔊 ── */
  (function glossary() {
    var G = D.glossary || []; if (!G.length) return;
    var map = {}, alts = [];
    G.forEach(function (g) { [g.t].concat(g.alt || []).forEach(function (w) { map[w.toLowerCase()] = g; alts.push(w); }); });
    alts.sort(function (x, y) { return y.length - x.length; });
    var re = new RegExp('\\b(' + alts.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+'); }).join('|') + ')(s|es)?\\b', 'gi');
    var SKIP = '.sb-video,button,textarea,input,select,label,a,script,style,svg,.sb-term,.sb-tipw,.sb-tab,.sb-pstep,.sb-jh,.sb-k,.sb-head,.sb-book,.sb-opti,.sb-note,.sb-step-top,.sb-journal,.sb-foot,h3,h4,h5,.fr,.sb-chips2,.sb-mate b,.nm';
    var tip = el('div', 'sb-tipw'); tip.setAttribute('role', 'tooltip'); tip.id = 'sb-tipw'; document.body.appendChild(tip);
    function find(w) { w = w.toLowerCase().replace(/\s+/g, ' '); return map[w] || map[w.replace(/(es|s)$/, '')] || map[w.replace(/s$/, '')]; }
    var seen = new WeakMap();
    function wrapIn(root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { var p = n.parentElement; if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT; re.lastIndex = 0; return re.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
      var list = []; while (walker.nextNode()) list.push(walker.currentNode);
      list.forEach(function (n) {
        var blk = n.parentElement.closest('.sb-card,.sb-step,.sb-ctx,p,li') || root, used = seen.get(blk) || {}; seen.set(blk, used);
        var txt = n.nodeValue, frag = document.createDocumentFragment(), lastI = 0, m; re.lastIndex = 0;
        while ((m = re.exec(txt))) { var g = find(m[0]); if (!g || used[g.t]) continue; used[g.t] = 1;
          if (m.index > lastI) frag.appendChild(document.createTextNode(txt.slice(lastI, m.index)));
          var sp = el('span', 'sb-term'); sp.textContent = m[0]; sp.tabIndex = 0; sp.dataset.t = g.t; sp.setAttribute('aria-describedby', 'sb-tipw'); frag.appendChild(sp); lastI = m.index + m[0].length; }
        if (!lastI) return; if (lastI < txt.length) frag.appendChild(document.createTextNode(txt.slice(lastI)));
        n.parentNode.replaceChild(frag, n);
      });
    }
    var cur = null, hideT = 0;
    function slug(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    function show(t) {
      var g = map[t.dataset.t.toLowerCase()]; if (!g) return; cur = t; clearTimeout(hideT);
      tip.innerHTML = '<div class="h"><b>' + esc(g.t) + '</b>' + (g.key ? '<button type="button" class="sb-say" aria-label="Hear the word ' + esc(g.t) + '">🔊</button>' : '') + '</div>' + esc(g.d);
      var s = $('.sb-say', tip); if (s) s.onclick = function () { playClip('words/g3m-word-' + slug(g.t) + '.mp3', s); };
      tip.classList.add('show');
      var r = t.getBoundingClientRect(), w = Math.min(300, innerWidth - 24); tip.style.width = w + 'px';
      var x = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)), h = tip.offsetHeight, above = r.top - h - 10 > 80;
      tip.style.left = x + 'px'; tip.style.top = (above ? r.top - h - 10 : r.bottom + 10) + 'px';
    }
    function hide() { clearTimeout(hideT); tip.classList.remove('show'); cur = null; }
    function hideSoon() { clearTimeout(hideT); hideT = setTimeout(function () { if (!tip.matches(':hover') && !tip.contains(document.activeElement)) hide(); }, 350); }
    tip.addEventListener('mouseenter', function () { clearTimeout(hideT); }); tip.addEventListener('mouseleave', hideSoon);
    document.addEventListener('mouseover', function (e) { var t = e.target.closest && e.target.closest('.sb-term'); if (t && t !== cur) show(t); });
    document.addEventListener('mouseout', function (e) { var t = e.target.closest && e.target.closest('.sb-term'); if (t && !(e.relatedTarget && (t.contains(e.relatedTarget) || tip.contains(e.relatedTarget)))) hideSoon(); });
    document.addEventListener('click', function (e) { if (tip.contains(e.target)) return; var t = e.target.closest && e.target.closest('.sb-term'); if (t) show(t); else hide(); });
    document.addEventListener('focusin', function (e) { if (e.target.classList && e.target.classList.contains('sb-term')) show(e.target); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
    window.addEventListener('scroll', hide, { passive: true });
    $$('.sb-panel, .sb-intro').forEach(wrapIn);
  })();

  /* ── music: a quiet switch + the listening corner ─────────── */
  var MUS = null, musicOn = false, musBtn = $('#sb-music');
  function musicEl() { if (!MUS) { MUS = new Audio(src(D.music || 'music.mp3')); MUS.preload = 'none'; } return MUS; }
  function musicDuck() { if (MUS && musicOn) { MUS.volume = 0.06; clearTimeout(musicDuck.t); musicDuck.t = setTimeout(function () { if (musicOn) MUS.volume = 0.16; }, 9000); } }
  if (musBtn) musBtn.addEventListener('click', function () { var m = musicEl(); musicOn = !musicOn; musBtn.setAttribute('aria-pressed', musicOn); musBtn.textContent = musicOn ? '🎵 Music: on' : '🎵 Music: off'; if (musicOn) { m.loop = true; m.volume = 0.16; m.play().catch(function () {}); } else m.pause(); });
  $$('.sb-listen').forEach(function (L) {
    var a = new Audio(src(L.dataset.src || D.music || 'music.mp3')); a.preload = 'none';
    var p = $('.play', L), s = $('.stop', L), bar = $('.meter i', L), t = $('.time', L);
    function fmt(x) { x = Math.max(0, Math.floor(x || 0)); return Math.floor(x / 60) + ':' + ('0' + x % 60).slice(-2); }
    a.addEventListener('timeupdate', function () { if (a.duration) { bar.style.width = (a.currentTime / a.duration * 100) + '%'; t.textContent = fmt(a.currentTime) + ' / ' + fmt(a.duration); } });
    a.addEventListener('ended', function () { p.textContent = '▶ Play again'; });
    p.onclick = function () { if (MUS && musicOn) { musicOn = false; MUS.pause(); if (musBtn) { musBtn.setAttribute('aria-pressed', false); musBtn.textContent = '🎵 Music: off'; } } stopAllVoice(); if (a.paused) { a.play(); p.textContent = '❚❚ Pause'; } else { a.pause(); p.textContent = '▶ Keep listening'; } };
    s.onclick = function () { a.pause(); a.currentTime = 0; bar.style.width = '0'; p.textContent = '▶ Play the music'; };
    document.addEventListener('sb:tab', function () { if (!a.paused) { a.pause(); p.textContent = '▶ Keep listening'; } });
  });

  /* ── produced videos stay hidden until the file is really there ── */
  $$('.sb-video video').forEach(function (v) { var w = v.closest('.sb-video'); function ok() { w.classList.add('ready'); } if (v.readyState > 0) ok(); v.addEventListener('loadedmetadata', ok); v.addEventListener('error', function () { w.classList.remove('ready'); }); });
  // a film made from Opti's note: the note steps aside while the film shows; its words sit under the film
  $$('.sb-video[data-slot="warm"]').forEach(function (w) {
    var n = w.previousElementSibling, cap = $('.cap', w); if (!n || !n.classList.contains('sb-opti') || !cap) return;
    var t = ($('.tr', n) || n).textContent.replace(/\s+/g, ' ').trim(), L0 = '📄 Read the film\'s words';
    var b = el('button', 'sb-btn sm ghost sb-filmwords', L0); b.type = 'button'; b.setAttribute('aria-expanded', 'false');
    var d = el('div', 'sb-filmtr'); d.hidden = true; d.textContent = t;
    b.addEventListener('click', function () { d.hidden = !d.hidden; b.setAttribute('aria-expanded', String(!d.hidden)); b.textContent = d.hidden ? L0 : '📄 Hide the words'; });
    cap.appendChild(b); w.appendChild(d);
  });

  /* ── header extras: standards popover, read aloud, motion ─── */
  $$('[data-pop]').forEach(function (b) { var p = $(b.dataset.pop); b.addEventListener('click', function () { var o = !p.classList.contains('open'); p.classList.toggle('open', o); b.setAttribute('aria-expanded', o); }); });
  var mot = $('#sb-motion'); if (mot) { if (ST.still) document.documentElement.classList.add('sb-still'); mot.setAttribute('aria-pressed', !ST.still); mot.textContent = ST.still ? '✨ Motion: off' : '✨ Motion: on'; mot.addEventListener('click', function () { ST.still = !ST.still; save(); document.documentElement.classList.toggle('sb-still', ST.still); mot.setAttribute('aria-pressed', !ST.still); mot.textContent = ST.still ? '✨ Motion: off' : '✨ Motion: on'; }); }
  /* Read aloud (pilot feedback, Nov 2026): reads everything a student can see on this tab (or this station), top to
     bottom, one sentence at a time (one long utterance gets cut off in Chrome). The part being read gets a gold outline.
     Fractions are said as fractions ("2 sevenths"), answer boxes as "blank". Opti's notes are skipped: they have their
     own Listen button. Press again to stop; a tab or station change stops it too. */
  var rd = $('#sb-read'), raTok = 0, raOn = false, raEl = null, raQ = null, raI = 0, raPaused = false, raBox = null, raRate = 0.92;
  var RA_ORD = { 2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth', 11: 'eleventh', 12: 'twelfth', 16: 'sixteenth', 20: 'twentieth' };
  function raMark(e) { if (raEl) raEl.classList.remove('sb-reading'); raEl = e; if (e) e.classList.add('sb-reading'); }
  function raFrac(f) {
    var k = [].filter.call(f.children, function (c) { return c.tagName !== 'I'; }), v = k.map(function (c) { return c.tagName === 'INPUT' ? (c.value.trim() || 'blank') : c.textContent.trim(); });
    if (v.length !== 2) return f.textContent;
    var n = +v[0], d = +v[1];
    if (RA_ORD[d] && n === Math.floor(n) && n > 0) return ' ' + n + ' ' + (d === 2 ? (n === 1 ? 'half' : 'halves') : RA_ORD[d] + (n === 1 ? '' : 's')) + ' ';
    return ' ' + v[0] + ' over ' + v[1] + ' ';
  }
  function raText(n) {
    if (n.nodeType === 3) return n.nodeValue;
    if (n.nodeType !== 1) return '';
    var tg = n.tagName, c = n.classList;
    if (tg === 'SCRIPT' || tg === 'STYLE' || tg === 'svg' || tg === 'SVG' || tg === 'BUTTON' || tg === 'TEXTAREA' || tg === 'SELECT' || tg === 'VIDEO' || tg === 'AUDIO' || tg === 'IMG') return '';
    if (n.getAttribute('aria-hidden') === 'true' || c.contains('sb-hand') || c.contains('sb-tipw')) return '';
    if (tg === 'INPUT') return n.type === 'checkbox' || n.type === 'radio' ? '' : ' ' + (n.value.trim() || 'blank') + ' ';
    if (c.contains('sb-frac') || c.contains('fr')) return raFrac(n);
    if (tg === 'BR') return '. ';
    if (c.contains('time') || ((tg === 'SMALL' || c.contains('sb-credit')) && /public[- ]domain|Wikimedia|Photo:/i.test(n.textContent))) return '';   /* timers, picture credits */
    var s = ''; for (var k = n.firstChild; k; k = k.nextSibling) { var x = raText(k); if (x && k.nodeType === 1 && k.tagName !== 'INPUT' && !/^inline/.test(getComputedStyle(k).display)) x = /^\s*(blank|\S+)\s*$/.test(x) && /blank/.test(x) ? ' ' + x + ' ' : ' . ' + x + ' . '; s += x; } return s;
  }
  function raClean(t) {
    return t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}▾▴■▶·]/gu, ' ')
      .replace(/(\d)\s*×\s*(?=[\d_?])/g, '$1 times ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus ')
      .replace(/_{2,}/g, ' blank ').replace(/\s+/g, ' ')
      .replace(/\b(\d[\d,]*) kg weight/g, '$1 kilogram weight').replace(/\b(\d[\d,]*) g weight/g, '$1 gram weight').replace(/\b(\d[\d,]*|blank) kg\b/g, function (x, n) { return n + ' kilogram' + (n === '1' ? '' : 's'); }).replace(/\b(\d[\d,]*|blank) g\b/g, function (x, n) { return n + ' gram' + (n === '1' ? '' : 's'); }).replace(/(kilograms?|grams?) = /g, '$1 equals ').replace(/\b(\d[\d,]*|blank) mL\b/g, function (x, n) { return n + ' milliliter' + (n === '1' ? '' : 's'); }).replace(/\b(\d[\d,]*|blank) L\b/g, function (x, n) { return n + ' liter' + (n === '1' ? '' : 's'); }).replace(/(\d+|blank) ?°F/g, '$1 degrees Fahrenheit').replace(/(\d+|blank) ?°C/g, '$1 degrees Celsius').replace(/(liters?|milliliters?) = /g, '$1 equals ').replace(/\b(\d[\d,]*|blank) km\b/g, function (x, n) { return n + ' kilometer' + (n === '1' ? '' : 's'); }).replace(/\b(\d[\d,]*|blank) (c?m)\b/g, function (x, n, u) { return n + ' ' + (u === 'cm' ? 'centimeter' : 'meter') + (n === '1' ? '' : 's'); }).replace(/(kilometers?|meters?|centimeters?) = /g, '$1 equals ')
      .replace(/(\d|blank|ths?|thirds?|half|halves) ([<>]) (?=\d|blank)/g, function (m, a, sg) { return a + (sg === '<' ? ' is less than ' : ' is greater than '); })
      .replace(/</g, ' the less than sign ').replace(/>/g, ' the greater than sign ').replace(/(\d|blank|ths?|thirds?|half|halves) = /g, '$1 equals ').replace(/ = /g, ' the equals sign ')
      .replace(/ \. (?=blank\b)/g, ' ').replace(/\bNo\. (?=\d)/g, 'Number ').replace(/(\s*\.)+(\s*[.!?:,])/g, '$2').replace(/([!?:,])\s*\./g, '$1').replace(/^[\s.]+/, '').replace(/\s+/g, ' ').trim();
  }
  function raQueue(root) {
    var SKIP = '.sb-opti, .sb-tabs, .sb-path, .sb-start, .sb-prog, .sb-head, .sb-donechip, .sb-locked, .sb-credit, .ar-grid, figcaption small, [hidden]';
    var BLOCK = 'p, li, h1, h2, h3, h4, h5, h6, figcaption, td, th, dt, dd, .sb-q, .sb-how, .sb-readout, .sb-fb, .sb-tip, .sb-hintbox, .sb-k, .sb-kind, .sb-jn, label, div';
    var items = [], w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false), nd, done = [];
    while ((nd = w.nextNode())) {
      var el0 = nd.nodeType === 1 ? nd : nd.parentElement; if (!el0) continue;
      if (nd.nodeType === 3 && !/\S/.test(nd.nodeValue)) continue;
      if (nd.nodeType === 1 && !(nd.tagName === 'INPUT' || nd.classList.contains('sb-frac') || nd.classList.contains('fr'))) continue;
      if (el0.closest(SKIP) || el0.closest('button, svg, textarea, select, [aria-hidden="true"]')) continue;
      /* the block must sit INSIDE this tab: a loose text node (the Math tools drawer, the fact check link) has its nearest
         div outside the tab, and reading that div read the whole page (live check, 11 Nov 2026) */
      var blk = el0.closest(BLOCK); if (!blk || blk === root || !root.contains(blk)) blk = el0 === root ? null : el0;
      if (!blk) { var lone = raClean(nd.nodeValue || ''); if (lone && /[A-Za-z0-9]/.test(lone)) items.push({ el: null, text: lone }); continue; }
      if (!blk.offsetParent) continue;
      if (done.indexOf(blk) >= 0) continue; done.push(blk);
      var t = raClean(raText(blk)); if (t && /[A-Za-z0-9]/.test(t)) items.push({ el: blk, text: t });
    }
    /* a block that sits inside another block we already read is a repeat */
    items = items.filter(function (it, i) { return !it.el || !items.some(function (o, j) { return j !== i && o.el && o.el !== it.el && o.el.contains(it.el); }); });
    var q = [];
    items.forEach(function (it) { (it.text.match(/[^.!?]+(?:[.!?](?=\S)[^.!?]*)*(?:[.!?]+["”’')\]]*(?:\s+|$)|$)/g) || [it.text]).forEach(function (s) { s = s.trim(); if (s) q.push({ el: it.el, text: s }); }); });
    return q;
  }
  /* The player (11 Nov 2026): the same controls as the 4th and 5th grade read-aloud. The 🔊 Read aloud chip opens a bar
     under the title and starts reading: Pause / Resume (resume starts the sentence it stopped in, because pause() is not
     reliable on Chromebooks and tablets), Stop, and a Speed menu. A tab or station change stops it and keeps the bar open. */
  function raUI(msg) {
    if (!raBox) return; var go = $('.ra-go', raBox), st = $('.ra-stop', raBox), s = $('.ra-status', raBox);
    go.textContent = raOn ? '⏸ Pause' : (raPaused ? '▶ Resume' : '▶ Listen'); st.disabled = !(raOn || raPaused);
    s.textContent = msg != null ? msg : (raOn && raQ ? 'Reading ' + Math.min(raI, raQ.length) + ' of ' + raQ.length : (raPaused ? 'Paused' : ''));
    raMiniSync();
  }
  /* Reading scrolls the page along, so the bar at the top leaves the screen. A small Pause / Stop pair rides on the part
     being read (placed in page coordinates, never position:fixed, so it also works in Canvas's tall frame). */
  var raMini = null;
  function raMiniSync() {
    var live = (raOn || raPaused) && raEl && raEl.isConnected;
    if (!live) { if (raMini) raMini.hidden = true; return; }
    if (!raMini) {
      raMini = document.createElement('div'); raMini.className = 'sb-ra-mini';
      raMini.innerHTML = '<button type="button" class="m-go"></button><button type="button" class="m-stop" aria-label="Stop reading">■ Stop</button>';
      document.body.appendChild(raMini);
      $('.m-go', raMini).addEventListener('click', function () { if (raOn) raPause(); else if (raPaused && raQ) raRun(); });
      $('.m-stop', raMini).addEventListener('click', function () { raStop(''); });
    }
    var g = $('.m-go', raMini); g.textContent = raOn ? '⏸ Pause' : '▶ Resume'; g.setAttribute('aria-label', raOn ? 'Pause reading' : 'Resume reading');
    raMini.hidden = false; var r = raEl.getBoundingClientRect(), w = raMini.offsetWidth || 150;
    raMini.style.top = Math.max(0, r.top + window.scrollY - 38) + 'px';
    raMini.style.left = Math.max(4, Math.min(r.right + window.scrollX - w, document.documentElement.clientWidth - w - 4)) + 'px';
  }
  function raStop(msg) { raTok++; if (window.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} } raOn = false; raPaused = false; raQ = null; raI = 0; raMark(null); raUI(typeof msg === 'string' ? msg : ''); }
  function raPause() { if (!raOn) return; raTok++; try { speechSynthesis.cancel(); } catch (e) {} raOn = false; raPaused = true; raI = Math.max(0, raI - 1); raUI(); }
  function raRun() {
    var tok = ++raTok; raOn = true; raPaused = false;
    (function next() {
      if (tok !== raTok) return;
      if (!raQ || raI >= raQ.length) { raStop('Finished reading this part.'); return; }
      var it = raQ[raI++]; raMark(it.el); raUI();
      try { var r = it.el.getBoundingClientRect(), vh = window.innerHeight; if (r.top < 60 || r.bottom > vh - 20) it.el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
      var u = new SpeechSynthesisUtterance(it.text); u.rate = raRate;
      u.onend = function () { if (tok === raTok) next(); };
      u.onerror = function (e) { if (tok !== raTok || (e && (e.error === 'canceled' || e.error === 'interrupted'))) return; next(); };
      speechSynthesis.speak(u);
    })();
  }
  function raStart() {
    var p = $('.sb-panel.on'), st = p && $('.sb-station.on', p), root = st || p; if (!root) return;
    stopAllVoice(); var q = raQueue(root); if (!q.length) { raUI('Nothing to read here yet.'); return; }
    raQ = q; raI = 0; raRun();
  }
  function raOpen(open) {
    if (!raBox) {
      raBox = document.createElement('div'); raBox.className = 'sb-ra'; raBox.id = 'sb-ra'; raBox.hidden = true;
      raBox.innerHTML = '<div class="ra-k">🔊 Read aloud · listen to this part of the lesson</div><div class="ra-row">' +
        '<button type="button" class="sb-btn sm ra-go">▶ Listen</button><button type="button" class="sb-btn sm ghost ra-stop" disabled>■ Stop</button>' +
        '<label class="ra-speed">Speed <select aria-label="Reading speed"><option value="0.75">Slower</option><option value="0.92" selected>Normal</option><option value="1.1">Faster</option></select></label>' +
        '<span class="ra-status" role="status" aria-live="polite"></span></div>' +
        '<p class="ra-note">It reads what is on this tab, from the top. Opti’s notes have their own Listen button.</p>';
      var hd = $('.sb-head'); hd.parentNode.insertBefore(raBox, hd.nextSibling);
      $('.ra-go', raBox).addEventListener('click', function () { if (raOn) raPause(); else if (raPaused && raQ) raRun(); else raStart(); });
      $('.ra-stop', raBox).addEventListener('click', function () { raStop(''); });
      $('select', raBox).addEventListener('change', function () { raRate = parseFloat(this.value) || 0.92; if (raOn) { raPause(); raRun(); } });
    }
    raBox.hidden = !open; rd.setAttribute('aria-expanded', open); rd.setAttribute('aria-controls', 'sb-ra');
    if (!open) raStop('');
  }
  if (rd) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) rd.hidden = true;   /* no button that does nothing */
    else rd.addEventListener('click', function () { var open = !raBox || raBox.hidden; raOpen(open); if (open) raStart(); });
    window.addEventListener('pagehide', function () { raStop(''); });
  }

  /* ═══════════════ MODELS ═══════════════ */
  var MODS = {};
  // redraw a model when its box gets much wider or narrower. The redraw waits a frame, so a
  // height change inside it never re-enters the observer ("ResizeObserver loop" error).
  function onWidth(box, fn) {
    if (!window.ResizeObserver) return; var last = box.clientWidth || -1, raf = 0;
    new ResizeObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { var w = box.clientWidth; if (w && Math.abs(w - last) > 30) { last = w; fn(); } }); }).observe(box);
  }
  function mstate(name, def) { if (!ST.mods[name]) ST.mods[name] = def; return ST.mods[name]; }
  // pointer drag helper (mouse, touch, pen); returns svg coordinates
  function svgPt(svg, e) { var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
  function drag(node, svg, onMove, onEnd, onTap) {
    var down = null;
    node.addEventListener('pointerdown', function (e) { e.preventDefault(); down = { x: e.clientX, y: e.clientY, moved: false }; node.setPointerCapture(e.pointerId); });
    node.addEventListener('pointermove', function (e) { if (!down) return; if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 6) down.moved = true; if (down.moved && onMove) onMove(svgPt(svg, e), e); });
    node.addEventListener('pointerup', function (e) { if (!down) return; var d = down; down = null; if (!d.moved) { if (onTap) onTap(e); } else if (onEnd) onEnd(svgPt(svg, e), e); });
    node.addEventListener('pointercancel', function () { down = null; if (onEnd) onEnd(null); });
  }

  /* ── mono: Pythagoras' string. Split it into equal parts by sliding bridges ── */
  // data-parts (n), data-name (save key). Steps flag: 'whole' (plucked the whole string), 'equal' (n equal parts).
  MODS.mono = function (box) {
    var n = +box.dataset.parts || 3, name = box.dataset.name || 'mono', S = mstate(name, { p: null, plucked: 0 });
    if (!S.p) { S.p = n === 3 ? [0.22, 0.81] : []; for (var q = S.p.length; q < n - 1; q++) S.p.push((q + 1) / n + 0.08); }
    var X0 = 70, X1 = 730, L = X1 - X0, Y = 96, F0 = 98;
    box.innerHTML = '<div class="sb-mono"><svg viewBox="0 0 800 210" role="group" aria-label="A string stretched over a long wooden box"></svg></div>' +
      '<div class="sb-mono-ctl"><button type="button" class="sb-btn sm ghost all">🔊 Pluck every part, one by one</button><span class="sb-mono-msg" aria-live="polite"></span></div>';
    var svg = $('svg', box), msg = $('.sb-mono-msg', box), allB = $('.all', box);
    var defs = NS('defs', {}, svg), gr = NS('linearGradient', { id: name + '-wood', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    NS('stop', { offset: 0, 'stop-color': '#C98F55' }, gr); NS('stop', { offset: 0.5, 'stop-color': '#A86A35' }, gr); NS('stop', { offset: 1, 'stop-color': '#7B4A22' }, gr);
    NS('rect', { x: 30, y: 112, width: 740, height: 62, rx: 10, fill: 'url(#' + name + '-wood)', stroke: '#5E3818', 'stroke-width': 2 }, svg);
    for (var g = 0; g < 5; g++) NS('path', { d: 'M40 ' + (124 + g * 10) + ' C 220 ' + (118 + g * 11) + ', 520 ' + (132 + g * 9) + ', 760 ' + (122 + g * 10), stroke: 'rgba(60,30,10,.18)', fill: 'none', 'stroke-width': 1.5 }, svg);
    NS('ellipse', { cx: 400, cy: 150, rx: 26, ry: 12, fill: '#3E220C', opacity: .7 }, svg);
    [X0, X1].forEach(function (x) { NS('rect', { x: x - 7, y: Y, width: 14, height: 18, rx: 2, fill: '#EDE3CC', stroke: '#8C7550' }, svg); });
    NS('text', { x: X0, y: 196, 'text-anchor': 'middle', 'font-size': 14, fill: '#5B4A2A', 'font-weight': 800, text: 'start' }, svg);
    NS('text', { x: X1, y: 196, 'text-anchor': 'middle', 'font-size': 14, fill: '#5B4A2A', 'font-weight': 800, text: 'end' }, svg);
    var segG = NS('g', {}, svg), brG = NS('g', {}, svg), labG = NS('g', {}, svg);
    var showBridges = false;
    function cuts() { return [0].concat(S.p.slice().sort(function (a, b) { return a - b; })).concat([1]); }
    function lens() { var c = cuts(), r = []; for (var i = 0; i < c.length - 1; i++) r.push(c[i + 1] - c[i]); return r; }
    function equal() { return lens().every(function (l) { return Math.abs(l - 1 / n) < 0.018; }); }
    function draw() { drawSegs(); drawBridges(); }
    function drawSegs() {
      segG.innerHTML = ''; labG.innerHTML = '';
      var c = showBridges ? cuts() : [0, 1];
      for (var i = 0; i < c.length - 1; i++) (function (i) {
        var xa = X0 + c[i] * L, xb = X0 + c[i + 1] * L, g = NS('g', { class: 'seg', tabindex: 0, role: 'button', 'aria-label': showBridges ? 'Pluck part ' + (i + 1) : 'Pluck the whole string' }, segG);
        NS('rect', { x: xa, y: Y - 26, width: xb - xa, height: 44, fill: 'transparent' }, g);
        var s = NS('path', { d: 'M' + xa + ' ' + Y + ' Q ' + (xa + xb) / 2 + ' ' + Y + ' ' + xb + ' ' + Y, stroke: '#D9B45A', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, g);
        NS('path', { d: 'M' + xa + ' ' + (Y - 1) + ' L' + xb + ' ' + (Y - 1), stroke: 'rgba(255,255,255,.55)', 'stroke-width': 1, fill: 'none', 'pointer-events': 'none' }, g);
        function hit() { pluckSeg(i, s, xa, xb); }
        g.addEventListener('click', hit); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(); } });
        if (showBridges) {
          NS('path', { d: 'M' + (xa + 4) + ' ' + (Y - 34) + ' Q ' + (xa + xb) / 2 + ' ' + (Y - 48) + ' ' + (xb - 4) + ' ' + (Y - 34), stroke: equal() ? '#1E7A4C' : '#8C7550', 'stroke-width': 2, fill: 'none' }, labG);
          NS('text', { x: (xa + xb) / 2, y: Y - 52, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: equal() ? '#1E7A4C' : '#5B4A2A', text: 'Part ' + (i + 1) }, labG);
        }
      })(i);
      if (!showBridges) NS('text', { x: 400, y: Y - 40, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 900, fill: '#5B4A2A', text: 'The whole string' }, labG);
    }
    function drawBridges() {
      brG.innerHTML = ''; if (!showBridges) return;
      S.p.forEach(function (p, k) {
        var x = X0 + p * L, b = NS('g', { class: 'bridge', tabindex: 0, role: 'slider', 'aria-label': 'Bridge ' + (k + 1), 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(p * 100) }, brG);
        NS('rect', { x: x - 22, y: Y - 8, width: 44, height: 40, fill: 'transparent' }, b);
        NS('path', { class: 'wedge', d: 'M' + (x - 12) + ' ' + (Y + 18) + ' L' + x + ' ' + (Y - 1) + ' L' + (x + 12) + ' ' + (Y + 18) + ' Z', fill: '#F3E6C4', stroke: '#6B4A12', 'stroke-width': 2 }, b);
        drag(b, svg, function (pt) { S.p[k] = Math.max(0.04, Math.min(0.96, (pt.x - X0) / L)); b.setAttribute('transform', 'translate(' + (X0 + S.p[k] * L - x) + ',0)'); drawSegs(); }, function () { settle(); }, null);
        b.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 0.005 : e.key === 'ArrowLeft' ? -0.005 : 0; if (!d) return; e.preventDefault(); S.p[k] = Math.max(0.04, Math.min(0.96, S.p[k] + d)); draw(); $$('.bridge', svg)[k].focus(); settle(); });
      });
    }
    function pluckSeg(i, path, xa, xb) {
      var l = (xb - xa) / L; pluck(F0 / l);
      if (!reduced && !document.documentElement.classList.contains('sb-still')) { var t0 = performance.now(); (function wob(t) { var k = (t - t0) / 700; if (k > 1) { path.setAttribute('d', 'M' + xa + ' ' + Y + ' Q ' + (xa + xb) / 2 + ' ' + Y + ' ' + xb + ' ' + Y); return; } var a = Math.sin(k * 40) * 9 * (1 - k); path.setAttribute('d', 'M' + xa + ' ' + Y + ' Q ' + (xa + xb) / 2 + ' ' + (Y + a) + ' ' + xb + ' ' + Y); requestAnimationFrame(wob); })(t0); }
      if (!showBridges) { S.plucked = 1; save(); flag(box, 'whole'); }
    }
    function settle() {
      if (equal()) { S.p = S.p.slice().sort(function (a, b) { return a - b; }).map(function (_, k) { return (k + 1) / n; }); draw(); msg.className = 'sb-mono-msg ok'; msg.textContent = 'All ' + n + ' parts are the same length. Pluck them: they sing the same note!'; flag(box, 'equal'); }
      else { draw(); msg.className = 'sb-mono-msg'; msg.textContent = 'The parts are not the same length yet. Pluck them and listen: their notes don\'t match.'; }
      save();
    }
    allB.onclick = function () { var c = showBridges ? cuts() : [0, 1]; for (var i = 0; i < c.length - 1; i++) (function (i) { setTimeout(function () { var segs = $$('.seg path:first-of-type', svg); var xa = X0 + c[i] * L, xb = X0 + c[i + 1] * L; pluckSeg(i, $$('.seg', svg)[i].querySelector('path'), xa, xb); }, i * 650); })(i); };
    function phase() { showBridges = stepDoneFor(box, 'whole'); allB.hidden = !showBridges; draw(); if (showBridges && stepDoneFor(box, 'equal')) { msg.className = 'sb-mono-msg ok'; msg.textContent = 'All ' + n + ' parts are the same length. They sing the same note.'; } else msg.textContent = ''; }
    document.addEventListener('sb:step', phase); phase();
  };

  /* ── mono2: two strings, long and short, already cut into equal parts; color some ── */
  MODS.mono2 = function (box) {
    var n = +box.dataset.parts || 5, want = +box.dataset.shade || 3, name = box.dataset.name || 'mono2', S = mstate(name, { a: [], b: [] });
    var W = [660, 360], X0 = 60, Ys = [70, 170];
    box.innerHTML = '<div class="sb-mono"><svg viewBox="0 0 780 230" role="group" aria-label="Two strings: a long one and a short one"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function draw() {
      svg.innerHTML = '';
      ['a', 'b'].forEach(function (k, s) {
        var y = Ys[s], w = W[s], seg = w / n;
        NS('rect', { x: X0 - 20, y: y + 10, width: w + 40, height: 34, rx: 8, fill: s ? '#B07A45' : '#A86A35', stroke: '#5E3818', 'stroke-width': 2 }, svg);
        NS('text', { x: X0 - 20, y: y - 22, 'font-size': 15, 'font-weight': 900, fill: '#5B4A2A', text: s ? 'Short string' : 'Long string' }, svg);
        for (var i = 0; i < n; i++) (function (i) {
          var xa = X0 + i * seg, on = S[k].indexOf(i) > -1, g = NS('g', { class: 'seg', tabindex: 0, role: 'button', 'aria-pressed': on, 'aria-label': (s ? 'Short' : 'Long') + ' string, part ' + (i + 1) }, svg);
          NS('rect', { x: xa + 2, y: y - 14, width: seg - 4, height: 22, rx: 5, fill: on ? DCOL[n] : '#fff', stroke: DCOL[n], 'stroke-width': 2 }, g);
          NS('line', { x1: xa, y1: y - 3, x2: xa + seg, y2: y - 3, stroke: on ? '#F3E6C4' : '#D9B45A', 'stroke-width': 3 }, g);
          function t() { var j = S[k].indexOf(i); if (j > -1) S[k].splice(j, 1); else S[k].push(i); pluck(98 / (seg / 660)); draw(); check(); save(); }
          g.addEventListener('click', t); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } });
        })(i);
        for (var j = 0; j <= n; j++) NS('path', { d: 'M' + (X0 + j * seg - 8) + ' ' + (y + 14) + ' L' + (X0 + j * seg) + ' ' + (y + 1) + ' L' + (X0 + j * seg + 8) + ' ' + (y + 14) + 'Z', fill: '#F3E6C4', stroke: '#6B4A12', 'stroke-width': 1.5, 'pointer-events': 'none' }, svg);
      });
    }
    function check() { out.innerHTML = 'Long string: <b>' + S.a.length + '</b> of ' + n + ' equal parts colored · Short string: <b>' + S.b.length + '</b> of ' + n + ' equal parts colored'; var ok = S.a.length === want && S.b.length === want; flag(box, 'shade', ok); if (ok) flag(box, 'shade'); }
    draw(); check();
  };

  /* ── tiles: the Math Tools Fraction Tiles. Fill the bar under the 1, then shade ── */
  // data-d (the right tile), data-tray "4,6,8", data-shade (how many to shade)
  MODS.tiles = function (box) {
    var d = +box.dataset.d, tray = (box.dataset.tray || String(d)).split(',').map(Number), want = +box.dataset.shade || 0, name = box.dataset.name || 'tiles';
    var S = mstate(name, { bt: [], sh: [] });
    var BW = 680, LX = 10, RH = 46, Y0 = 8, BY = Y0 + RH + 10, TY = BY + RH + 46;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 ' + (TY + 28 + RH) + '" role="group" aria-label="Fraction tiles"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function sum() { return S.bt.reduce(function (s, t) { return s + 1 / t; }, 0); }
    function shadePhase() { return stepDoneFor(box, 'full'); }
    function label(p, x, y, w, dd, onC) { var f = w >= 44 ? 15 : 12, g = NS('g', { 'pointer-events': 'none' }, p); NS('text', { x: x + w / 2, y: y + RH / 2 - 4, 'text-anchor': 'middle', 'font-size': f, 'font-weight': 900, fill: onC, text: '1' }, g); NS('line', { x1: x + w / 2 - 8, y1: y + RH / 2 + 1, x2: x + w / 2 + 8, y2: y + RH / 2 + 1, stroke: onC, 'stroke-width': 2 }, g); NS('text', { x: x + w / 2, y: y + RH / 2 + 4 + f, 'text-anchor': 'middle', 'font-size': f, 'font-weight': 900, fill: onC, text: String(dd) }, g); }
    function tile(p, x, y, w, dd, on) { var g = NS('g', { class: 'tile' }, p); NS('rect', { x: x + 1, y: y, width: w - 2, height: RH, rx: 6, fill: on ? DCOL[dd] : '#fff', stroke: DCOL[dd], 'stroke-width': 2 }, g); label(g, x, y, w, dd, on ? '#fff' : '#0E1C42'); return g; }
    function onBar(pt) { return pt && pt.y > BY - 30 && pt.y < BY + RH + 30; }
    function draw() {
      svg.innerHTML = ''; svg.setAttribute('viewBox', '0 0 700 ' + (shadePhase() ? BY + RH + 8 : TY + 28 + RH));
      var whole = NS('g', {}, svg); NS('rect', { x: LX + 1, y: Y0, width: BW - 2, height: RH, rx: 6, fill: '#0E1C42' }, whole); NS('text', { x: LX + BW / 2, y: Y0 + RH / 2 + 7, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: '#fff', text: '1 whole' }, whole);
      NS('rect', { x: LX, y: BY, width: BW, height: RH, rx: 6, fill: '#F6F7FB', stroke: '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
      var bx = LX, sp = shadePhase();
      S.bt.forEach(function (dd, i) {
        var w = BW / dd, on = sp && S.sh.indexOf(i) > -1, t = tile(svg, bx, BY, w, dd, sp ? on : true);
        t.setAttribute('tabindex', 0); t.setAttribute('role', 'button'); t.setAttribute('aria-label', sp ? 'Tile ' + (i + 1) + (on ? ', shaded' : ', not shaded') : 'Take away a one-' + DNAME[dd] + ' tile');
        if (sp) { if (!on) t.querySelector('rect').setAttribute('fill', '#fff'); }
        function act() { if (sp) { var j = S.sh.indexOf(i); if (j > -1) S.sh.splice(j, 1); else S.sh.push(i); } else { S.bt.splice(i, 1); S.sh = []; } save(); draw(); }
        drag(t, svg, null, function (pt) { if (!sp && !onBar(pt)) { S.bt.splice(i, 1); S.sh = []; save(); draw(); } }, act);
        t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        bx += w;
      });
      if (!sp) {
        NS('text', { x: LX, y: TY - 10, 'font-size': 13, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag a tile up to the empty bar' }, svg);
        var tx = LX;
        tray.forEach(function (dd) {
          var w = BW / dd, t = tile(svg, tx, TY, w, dd, false); t.setAttribute('tabindex', 0); t.setAttribute('role', 'button'); t.setAttribute('aria-label', 'Add a one-' + DNAME[dd] + ' tile');
          var ghost = null;
          drag(t, svg, function (pt) { if (!ghost) { ghost = tile(svg, 0, 0, w, dd, true); ghost.setAttribute('opacity', .8); ghost.style.pointerEvents = 'none'; } ghost.setAttribute('transform', 'translate(' + (pt.x - w / 2) + ',' + (pt.y - RH / 2) + ')'); },
            function (pt) { if (ghost) ghost.remove(); ghost = null; if (onBar(pt)) add(dd); }, function () { add(dd); });
          t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(dd); } });
          tx += w + 14;
        });
      }
      report();
    }
    function add(dd) { if (sum() + 1 / dd > 1 + 1e-9) { msg('That tile won\'t fit. The bar is as long as 1 whole.'); return; } S.bt.push(dd); S.sh = []; save(); draw(); }
    function msg(t) { out.innerHTML = t; }
    function report() {
      var s = sum(), full = Math.abs(s - 1) < 1e-9, same = S.bt.every(function (t) { return t === S.bt[0]; });
      if (shadePhase()) { msg('The bar is full: ' + S.bt.length + ' equal tiles make 1 whole. Shaded: <b>' + S.sh.length + '</b> one-' + DNAME[d] + (S.sh.length === 1 ? '' : 's') + ' of <b>' + S.bt.length + '</b> equal parts'); var ok = S.sh.length === want; flag(box, 'shade', ok); if (ok) flag(box, 'shade'); return; }
      if (!S.bt.length) msg('The bar is empty.');
      else if (full && same && S.bt[0] === d) { msg('<span style="color:#1E7A4C">The bar is full: <b>' + S.bt.length + '</b> equal tiles make 1 whole.</span>'); flag(box, 'full'); }
      else if (full && !same) msg('The bar is full, but the tiles are <b>not all the same size</b>. A fraction needs equal parts. Drag the odd tiles back down.');
      else if (full) msg('The bar is full with <b>' + S.bt.length + '</b> equal tiles. But look at the string: it has ' + d + ' equal parts. Drag these back and try the other tiles.');
      else if (!same) msg('These tiles are not all the same size. Use just one kind of tile.');
      else msg('<b>' + S.bt.length + '</b> tile' + (S.bt.length === 1 ? '' : 's') + ' on the bar. It is not full yet.');
    }
    document.addEventListener('sb:step', draw); draw();
  };

  /* ── labelfix: the label on an area model is wrong; drag the numbers where they belong ── */
  MODS.labelfix = function (box) {
    var n = +box.dataset.n || 9, sh = +box.dataset.shade || 2, cols = +box.dataset.cols || 3, rows = n / cols, name = box.dataset.name || 'labelfix', S = mstate(name, { top: '', bot: '' });
    var cs = 54;
    box.innerHTML = '<div class="sb-stage"><div class="sb-row" style="justify-content:center;gap:28px"><svg viewBox="0 0 ' + (cols * cs + 4) + ' ' + (rows * cs + 4) + '" style="width:' + (cols * cs + 4) + 'px;max-width:46%" role="img" aria-label="A square cut into ' + n + ' equal parts. ' + sh + ' are shaded."></svg>' +
      '<div><div style="font-weight:900;font-size:14px;color:#B23A2E;margin-bottom:4px">The old label</div><div class="sb-label bad"><b style="font-size:24px">' + n + '</b><i></i><b style="font-size:24px">' + sh + '</b></div></div>' +
      '<div><div style="font-weight:900;font-size:14px;color:#1E7A4C;margin-bottom:4px">Your new label</div><div class="sb-label"><span class="sb-slot" data-s="top" tabindex="0" role="button" aria-label="Top of the label"></span><i></i><span class="sb-slot" data-s="bot" tabindex="0" role="button" aria-label="Bottom of the label"></span></div></div></div>' +
      '<div class="sb-row" style="justify-content:center;margin-top:10px"><span style="font-weight:800;color:#5B6478">Drag a number into the new label:</span><span class="sb-chipnum" tabindex="0" role="button" data-v="' + sh + '">' + sh + '</span><span class="sb-chipnum" tabindex="0" role="button" data-v="' + n + '">' + n + '</span></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), sel = null;
    var order = [0, 4]; // shaded cells (not side by side on purpose)
    for (var i = 0; i < n; i++) { var r = Math.floor(i / cols), c = i % cols; NS('rect', { x: 2 + c * cs, y: 2 + r * cs, width: cs, height: cs, fill: order.indexOf(i) > -1 && sh === 2 ? DCOL[n] : (i < sh && sh !== 2 ? DCOL[n] : '#fff'), stroke: DCOL[n], 'stroke-width': 2 }, svg); }
    function paint() { $$('.sb-slot', box).forEach(function (s) { var v = S[s.dataset.s]; s.textContent = v; s.classList.remove('right', 'wrong'); if (v) s.classList.add((s.dataset.s === 'top' ? +v === sh : +v === n) ? 'right' : 'wrong'); }); var ok = +S.top === sh && +S.bot === n; flag(box, 'fixed', ok); if (ok) { flag(box, 'fixed'); out.innerHTML = '<span style="color:#1E7A4C">Fixed! ' + frac(sh, n) + ': ' + sh + ' parts shaded, out of ' + n + ' equal parts.</span>'; } else if (S.top && S.bot) out.textContent = 'Not yet. Which number tells how many equal parts make the whole? That one goes on the bottom.'; else out.textContent = ''; save(); }
    $$('.sb-chipnum', box).forEach(function (ch) {
      function pick() { sel = ch; $$('.sb-chipnum', box).forEach(function (x) { x.classList.toggle('sel', x === ch); }); }
      var down = null, ghost = null;
      ch.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY, m: false }; ch.setPointerCapture(e.pointerId); });
      ch.addEventListener('pointermove', function (e) { if (!down) return; if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 6) down.m = true; if (down.m) { ch.style.transform = 'translate(' + (e.clientX - down.x) + 'px,' + (e.clientY - down.y) + 'px)'; ch.style.zIndex = 5; } });
      ch.addEventListener('pointerup', function (e) { var d = down; down = null; ch.style.transform = ''; ch.style.zIndex = ''; if (!d) return; if (!d.m) { pick(); return; } ch.style.visibility = 'hidden'; var t = document.elementFromPoint(e.clientX, e.clientY); ch.style.visibility = ''; t = t && t.closest('.sb-slot'); if (t && box.contains(t)) { S[t.dataset.s] = ch.dataset.v; paint(); } });
      ch.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    $$('.sb-slot', box).forEach(function (s) { function put() { if (!sel) { out.textContent = 'First pick a number, then tap where it goes.'; return; } S[s.dataset.s] = sel.dataset.v; sel.classList.remove('sel'); sel = null; paint(); } s.addEventListener('click', put); s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); put(); } }); });
    paint();
  };

  /* ── sort: which shapes really show thirds? drag each into a tray ── */
  MODS.sort = function (box) {
    var name = box.dataset.name || 'sort', S = mstate(name, { put: {} });
    var col = DCOL[3];
    function circ(angles) { var s = '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="#fff" stroke="' + col + '" stroke-width="3"/>', a0 = -90; angles.forEach(function (a, i) { var a1 = a0 + a, r = 52, x0 = 60 + r * Math.cos(a0 * Math.PI / 180), y0 = 60 + r * Math.sin(a0 * Math.PI / 180), x1 = 60 + r * Math.cos(a1 * Math.PI / 180), y1 = 60 + r * Math.sin(a1 * Math.PI / 180); s += '<path d="M60 60 L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A52 52 0 ' + (a > 180 ? 1 : 0) + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'Z" fill="' + (i === 0 ? col : '#fff') + '" stroke="' + col + '" stroke-width="3"/>'; a0 = a1; }); return s + '</svg>'; }
    function rect(ws, vert) { var s = '<svg viewBox="0 0 120 120">', x = 6; ws.forEach(function (w, i) { var W = w * 108; s += vert ? '<rect x="6" y="' + x.toFixed(1) + '" width="108" height="' + W.toFixed(1) + '" fill="' + (i === 0 ? col : '#fff') + '" stroke="' + col + '" stroke-width="3"/>' : '<rect x="' + x.toFixed(1) + '" y="22" width="' + W.toFixed(1) + '" height="76" fill="' + (i === 0 ? col : '#fff') + '" stroke="' + col + '" stroke-width="3"/>'; x += W; }); return s + '</svg>'; }
    var SH = [
      { id: 'A', svg: circ([120, 120, 120]), ok: 'yes', why: '' },
      { id: 'B', svg: circ([200, 90, 70]), ok: 'no', why: 'Look at shape B. Is the shaded part the same size as the other two parts?' },
      { id: 'C', svg: rect([0.5, 0.25, 0.25]), ok: 'no', why: 'Look at shape C. The shaded part is bigger than the others.' },
      { id: 'D', svg: rect([1 / 3, 1 / 3, 1 / 3], true), ok: 'yes', why: '' }];
    box.innerHTML = '<div class="sb-stage"><div class="sb-sort"></div><div class="sb-bins"><div class="sb-bin" data-b="yes" tabindex="0" role="button"><h5>✓ Real thirds<br><small style="font-weight:700;color:#5B6478">3 equal parts</small></h5></div><div class="sb-bin" data-b="no" tabindex="0" role="button"><h5>✗ Not thirds<br><small style="font-weight:700;color:#5B6478">parts are not equal</small></h5></div></div></div><div class="sb-readout" aria-live="polite"></div>';
    var shelf = $('.sb-sort', box), out = $('.sb-readout', box), sel = null;
    function render() {
      shelf.innerHTML = ''; $$('.sb-bin', box).forEach(function (b) { $$('.sb-shape', b).forEach(function (x) { x.remove(); }); });
      SH.forEach(function (s) {
        var c = el('div', 'sb-shape', s.svg + 'Shape ' + s.id); c.tabIndex = 0; c.setAttribute('role', 'button'); c.dataset.id = s.id; c.setAttribute('aria-label', 'Shape ' + s.id);
        var where = S.put[s.id]; (where ? $('.sb-bin[data-b="' + where + '"]', box) : shelf).appendChild(c); if (where) c.classList.add('right');
        var down = null;
        c.addEventListener('pointerdown', function (e) { if (S.put[s.id]) return; down = { x: e.clientX, y: e.clientY, m: false }; c.setPointerCapture(e.pointerId); });
        c.addEventListener('pointermove', function (e) { if (!down) return; if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 6) down.m = true; if (down.m) { c.style.transform = 'translate(' + (e.clientX - down.x) + 'px,' + (e.clientY - down.y) + 'px)'; c.style.position = 'relative'; c.style.zIndex = 5; } });
        c.addEventListener('pointerup', function (e) { var d = down; down = null; c.style.transform = ''; c.style.zIndex = ''; if (!d) return; if (!d.m) { pick(c); return; } c.style.visibility = 'hidden'; var t = document.elementFromPoint(e.clientX, e.clientY); c.style.visibility = ''; t = t && t.closest('.sb-bin'); if (t) drop(s, t.dataset.b, c); });
        c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(c); } });
      });
      var done = SH.every(function (s) { return S.put[s.id]; }); if (done) { out.innerHTML = '<span style="color:#1E7A4C">All sorted. Only shapes with 3 <b>equal</b> parts show thirds.</span>'; flag(box, 'sorted'); }
    }
    function pick(c) { if (S.put[c.dataset.id]) return; sel = c; $$('.sb-shape', box).forEach(function (x) { x.classList.toggle('sel', x === c); }); out.textContent = 'Now tap the tray where Shape ' + c.dataset.id + ' belongs.'; }
    function drop(s, b, c) { if (s.ok === b) { S.put[s.id] = b; save(); out.textContent = ''; render(); } else { c.classList.add('wrong'); setTimeout(function () { c.classList.remove('wrong'); }, 450); out.textContent = s.ok === 'no' ? s.why : 'Look again: are all 3 parts of Shape ' + s.id + ' the same size? Then it shows thirds.'; } }
    $$('.sb-bin', box).forEach(function (b) { function go() { if (!sel) return; var s = SH.filter(function (x) { return x.id === sel.dataset.id; })[0]; drop(s, b.dataset.b, sel); sel = null; } b.addEventListener('click', go); b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
    render();
  };

  /* ── gather: shaded squares that are apart; slide them together ── */
  MODS.gather = function (box) {
    var cols = +box.dataset.cols || 4, rows = +box.dataset.rows || 3, n = cols * rows, name = box.dataset.name || 'gather';
    var S = mstate(name, { on: JSON.parse(box.dataset.start || '[1,6,8,11,4]') });
    var cs = 70; box.innerHTML = '<div class="sb-stage"><svg viewBox="0 0 ' + (cols * cs + 4) + ' ' + (rows * cs + 4) + '" style="max-width:340px;margin:0 auto" role="group" aria-label="A rectangle cut into ' + n + ' equal squares"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), sel = -1;
    function connected() { var on = S.on, seen = {}, st = [on[0]]; seen[on[0]] = 1; while (st.length) { var i = st.pop(), r = Math.floor(i / cols), c = i % cols; [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(function (q) { if (q[0] < 0 || q[1] < 0 || q[0] >= rows || q[1] >= cols) return; var j = q[0] * cols + q[1]; if (on.indexOf(j) > -1 && !seen[j]) { seen[j] = 1; st.push(j); } }); } return Object.keys(seen).length === on.length; }
    function cellAt(pt) { if (!pt) return -1; var c = Math.floor((pt.x - 2) / cs), r = Math.floor((pt.y - 2) / cs); return c < 0 || r < 0 || c >= cols || r >= rows ? -1 : r * cols + c; }
    function move(a, b) { var i = S.on.indexOf(a); if (i < 0 || b < 0 || S.on.indexOf(b) > -1) return false; S.on[i] = b; save(); return true; }
    function draw() {
      svg.innerHTML = '';
      for (var i = 0; i < n; i++) (function (i) {
        var r = Math.floor(i / cols), c = i % cols, on = S.on.indexOf(i) > -1, g = NS('g', { class: 'part', tabindex: 0, role: 'button', 'aria-label': 'Row ' + (r + 1) + ', column ' + (c + 1) + (on ? ', shaded' : ', empty') }, svg);
        NS('rect', { x: 2 + c * cs, y: 2 + r * cs, width: cs, height: cs, fill: on ? DCOL[12] : '#fff', stroke: DCOL[12], 'stroke-width': 2.5 }, g);
        if (i === sel) NS('rect', { x: 6 + c * cs, y: 6 + r * cs, width: cs - 8, height: cs - 8, fill: 'none', stroke: '#E9C46A', 'stroke-width': 5 }, g);
        function tap() { if (on) { sel = sel === i ? -1 : i; draw(); out.textContent = sel > -1 ? 'Now tap an empty square to move it there.' : ''; } else if (sel > -1) { move(sel, i); sel = -1; draw(); report(); } }
        if (on) drag(g, svg, null, function (pt) { if (move(i, cellAt(pt))) { draw(); report(); } }, tap); else g.addEventListener('click', tap);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
      })(i);
    }
    function report() { var ok = connected(); if (ok) { out.innerHTML = '<span style="color:#1E7A4C">All ' + S.on.length + ' shaded squares are together now.</span>'; flag(box, 'together'); } else out.textContent = 'Drag a shaded square next to another shaded one. Keep going until they all touch.'; }
    draw(); report();
  };

  /* ── circle: a round loaf in equal slices; drag the eaten slices to the plate ── */
  MODS.circle = function (box) {
    var n = +box.dataset.n || 10, want = +box.dataset.eat || 4, name = box.dataset.name || 'circle', S = mstate(name, { eaten: [] }), col = DCOL[n];
    box.innerHTML = '<div class="sb-stage"><svg viewBox="0 0 600 300" role="group" aria-label="A round loaf cut into ' + n + ' equal slices, and a plate"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), CX = 140, CY = 128, R = 106, PX = 450, PY = 120;
    function wedge(cx, cy, i, fill) { var a0 = (-90 + i * 360 / n) * Math.PI / 180, a1 = (-90 + (i + 1) * 360 / n) * Math.PI / 180; return 'M' + cx + ' ' + cy + ' L' + (cx + R * Math.cos(a0)).toFixed(1) + ' ' + (cy + R * Math.sin(a0)).toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R * Math.cos(a1)).toFixed(1) + ' ' + (cy + R * Math.sin(a1)).toFixed(1) + 'Z'; }
    function draw() {
      svg.innerHTML = '';
      NS('circle', { cx: CX, cy: CY, r: R + 4, fill: '#F1E4C6', stroke: '#C9A96A', 'stroke-width': 2 }, svg);
      NS('ellipse', { cx: PX, cy: PY + 8, rx: 128, ry: 116, fill: '#FFFFFF', stroke: '#B8A77F', 'stroke-width': 3 }, svg);
      NS('ellipse', { cx: PX, cy: PY + 8, rx: 112, ry: 100, fill: 'none', stroke: '#E4D8BF', 'stroke-width': 2 }, svg);
      NS('text', { x: PX, y: 290, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: '#5B4A2A', text: 'Plate: slices that were eaten' }, svg);
      NS('text', { x: CX, y: 290, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: '#5B4A2A', text: 'The loaf' }, svg);
      for (var i = 0; i < n; i++) (function (i) {
        var eaten = S.eaten.indexOf(i) > -1, cx = eaten ? PX : CX, cy = eaten ? PY + 8 : CY;
        if (eaten) NS('path', { d: wedge(CX, CY, i), fill: 'none', stroke: col, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, svg);
        var g = NS('g', { class: 'part', tabindex: 0, role: 'button', 'aria-label': 'Slice ' + (i + 1) + (eaten ? ', on the plate' : ', in the loaf') }, svg);
        NS('path', { d: wedge(cx, cy, i), fill: col, stroke: '#fff', 'stroke-width': 3 }, g);
        function tog() { var j = S.eaten.indexOf(i); if (j > -1) S.eaten.splice(j, 1); else S.eaten.push(i); save(); draw(); }
        drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - cx) + ',' + (pt.y - cy) + ')'); }, function (pt) { var onPlate = pt && pt.x > 320; if (pt && onPlate !== eaten) tog(); else draw(); }, tog);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
      })(i);
      var k = S.eaten.length; out.innerHTML = 'On the plate: <b>' + k + '</b> slice' + (k === 1 ? '' : 's') + ' · Still in the loaf: <b>' + (n - k) + '</b>';
      var ok = k === want; flag(box, 'eat', ok); if (ok) flag(box, 'eat');
    }
    draw();
  };

  /* ── rect: cut a board into equal strips (− +), then shade some ── */
  MODS.rect = function (box) {
    var want = +box.dataset.n, sh = +box.dataset.shade, name = box.dataset.name || 'rect', S = mstate(name, { n: 2, on: [] });
    box.innerHTML = '<div class="sb-stage"><div class="sb-row" style="margin-bottom:8px"><b>Equal parts:</b><button type="button" class="sb-btn sm ghost minus" aria-label="One fewer part">−</button><b class="cnt" style="font-size:22px;min-width:30px;text-align:center"></b><button type="button" class="sb-btn sm ghost plus" aria-label="One more part">+</button></div><svg viewBox="0 0 604 164" role="group" aria-label="A rectangle"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), col = function () { return DCOL[S.n] || '#5B6478'; };
    $('.minus', box).onclick = function () { if (S.n > 1) { S.n--; S.on = []; save(); draw(); } };
    $('.plus', box).onclick = function () { if (S.n < 12) { S.n++; S.on = []; save(); draw(); } };
    function draw() {
      $('.cnt', box).textContent = S.n; svg.innerHTML = ''; var w = 600 / S.n;
      for (var i = 0; i < S.n; i++) (function (i) { var on = S.on.indexOf(i) > -1, g = NS('g', { class: 'part', tabindex: 0, role: 'button', 'aria-label': 'Part ' + (i + 1) + (on ? ', shaded' : '') }, svg); NS('rect', { x: 2 + i * w, y: 2, width: w, height: 160, fill: on ? col() : '#fff', stroke: col(), 'stroke-width': 2.5 }, g);
        function t() { var j = S.on.indexOf(i); if (j > -1) S.on.splice(j, 1); else S.on.push(i); save(); draw(); } g.addEventListener('click', t); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } }); })(i);
      out.innerHTML = '<b>' + S.on.length + '</b> of <b>' + S.n + '</b> equal parts shaded';
      var srt = S.on.slice().sort(function (a, b) { return a - b; }), together = srt.length > 1 && srt.every(function (v, i) { return !i || v === srt[i - 1] + 1; });
      if (box.dataset.apart && S.n === want && S.on.length === sh && together) out.innerHTML += ' · <span style="color:#B23A2E">These are side by side. Paint 2 parts that are apart.</span>';
      var ok = S.n === want && S.on.length === sh && !(box.dataset.apart && together); flag(box, 'made', ok); if (ok) flag(box, 'made');
    }
    draw();
  };

  /* ── strip: equal-part strips to shade (two strips = two different ways) ── */
  MODS.strip = function (box) {
    var n = +box.dataset.n, sh = +box.dataset.shade, copies = +box.dataset.copies || 1, name = box.dataset.name || 'strip', S = mstate(name, { on: [] });
    while (S.on.length < copies) S.on.push([]);
    box.innerHTML = '<div class="sb-stage"><svg viewBox="0 0 604 ' + (copies * 70) + '" role="group" aria-label="Strips cut into ' + n + ' equal parts"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), col = DCOL[n];
    function draw() {
      svg.innerHTML = ''; var w = 600 / n;
      S.on.forEach(function (on, s) { if (copies > 1) NS('text', { x: 2, y: s * 70 + 12, 'font-size': 13, 'font-weight': 900, fill: '#5B6478', text: 'Strip ' + (s + 1) }, svg);
        for (var i = 0; i < n; i++) (function (i) { var o = on.indexOf(i) > -1, g = NS('g', { class: 'part', tabindex: 0, role: 'button', 'aria-label': 'Strip ' + (s + 1) + ', part ' + (i + 1) + (o ? ', shaded' : '') }, svg); NS('rect', { x: 2 + i * w, y: s * 70 + (copies > 1 ? 18 : 6), width: w, height: 46, fill: o ? col : '#fff', stroke: col, 'stroke-width': 2.5, rx: 2 }, g);
          function t() { var j = on.indexOf(i); if (j > -1) on.splice(j, 1); else on.push(i); save(); draw(); } g.addEventListener('click', t); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } }); })(i); });
      var counts = S.on.map(function (o) { return o.length; }), same = copies > 1 && S.on[0].slice().sort().join() === S.on[1].slice().sort().join();
      out.innerHTML = S.on.map(function (o, s) { return (copies > 1 ? 'Strip ' + (s + 1) + ': ' : '') + '<b>' + o.length + '</b> of ' + n + ' shaded'; }).join(' · ') + (same && counts[0] === sh ? ' · <span style="color:#B23A2E">Both strips look the same. Shade strip 2 a different way.</span>' : '');
      var ok = counts.every(function (c) { return c === sh; }) && !same; flag(box, 'shade', ok); if (ok) flag(box, 'shade');
    }
    draw();
  };

  /* ── nl: the number line (3.09.02). One model, several modes. ──
     data-mode: count (string → number line, tap bridges in order) · cut (add + drag tick marks, then place a dot)
       · ticks (− / + tick marks, count the spaces) · even (drag uneven ticks equal; pluck at the dot vs a friend's line)
       · labels (tap a tick: count the jumps from 0) · dots (put dots on targets, 0 to b) · strip (tiles above the line)
     data-n (equal parts in 1 whole), data-b (end number, default 1), data-target / data-targets "3,8,12" (numerators)
     Flags: count · cut · dot · fixed · even · same · fix · dots · shade */
  MODS.nl = function (box) {
    var mode = box.dataset.mode || 'cut', n = +box.dataset.n || 5, b = +box.dataset.b || 1, name = box.dataset.name || 'nl';
    var targets = (box.dataset.targets || box.dataset.target || '').split(',').filter(Boolean).map(Number);
    var col = DCOL[n] || '#1F2A44', NAVY = '#1F2A44', OK = '#1E7A4C', BAD = '#B23A2E';
    var X0 = 60, X1 = 740, LW = X1 - X0;
    function X(v) { return X0 + v / b * LW; }
    function V(x) { return (x - X0) / LW * b; }
    var still = function () { return reduced || document.documentElement.classList.contains('sb-still'); };
    function fr(g, x, y, nu, de, c, fs) { fs = fs || 16; var t = NS('g', { 'pointer-events': 'none' }, g); NS('text', { x: x, y: y, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 900, fill: c, text: String(nu) }, t); NS('line', { x1: x - fs * 0.55, y1: y + 5, x2: x + fs * 0.55, y2: y + 5, stroke: c, 'stroke-width': 2 }, t); NS('text', { x: x, y: y + fs + 6, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 900, fill: c, text: String(de) }, t); return t; }
    function txt(g, x, y, s, c, fs, anchor) { return NS('text', { x: x, y: y, 'text-anchor': anchor || 'middle', 'font-size': fs || 16, 'font-weight': 900, fill: c || NAVY, text: s, 'pointer-events': 'none' }, g); }
    function axis(g, y, opt) {
      opt = opt || {};
      NS('line', { x1: X0 - 18, y1: y, x2: X1 + 18, y2: y, stroke: NAVY, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      for (var w = 0; w <= b; w++) { NS('line', { x1: X(w), y1: y - 16, x2: X(w), y2: y + 16, stroke: NAVY, 'stroke-width': 3.5 }, g); if (!opt.noWholes) txt(g, X(w), y + 40, String(w), NAVY, 22); }
    }
    function arcs(g, y, k, c) { for (var i = 0; i < k; i++) { var xa = X(i / n), xb = X((i + 1) / n), h = Math.min(30, (xb - xa) * 0.55); NS('path', { d: 'M' + (xa + 3) + ' ' + (y - 6) + ' Q ' + (xa + xb) / 2 + ' ' + (y - 6 - h * 1.6) + ' ' + (xb - 3) + ' ' + (y - 6), stroke: c || col, 'stroke-width': 2.5, fill: 'none', 'pointer-events': 'none' }, g); } }
    function dot(g, x, y, c) { var d = NS('g', { class: 'nl-dot', tabindex: 0, role: 'slider' }, g); NS('circle', { cx: x, cy: y, r: 22, fill: 'transparent' }, d); NS('circle', { cx: x, cy: y, r: 11, fill: c || BAD, stroke: '#fff', 'stroke-width': 3 }, d); return d; }
    function snapK(x) { return Math.max(0, Math.min(n * b, Math.round(V(x) * n))); }
    var out;
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OK + '">' + h + '</span>' : h; }
    function shell(h, ctl) { box.innerHTML = '<div class="sb-stage sb-nl">' + (ctl || '') + '<svg viewBox="0 0 800 ' + h + '" role="group" aria-label="A number line"></svg></div><div class="sb-readout" aria-live="polite"></div>'; out = $('.sb-readout', box); return $('svg', box); }

    /* count: Pythagoras' string in n equal parts; tap the bridges left to right; each leaves a tick mark */
    if (mode === 'count') {
      var S = mstate(name, { k: 0 }), svg = shell(300), Y = 70, LY = 214;
      var draw = function () {
        svg.innerHTML = '';
        NS('rect', { x: 30, y: Y + 14, width: 740, height: 46, rx: 9, fill: '#A86A35', stroke: '#5E3818', 'stroke-width': 2 }, svg);
        for (var g2 = 0; g2 < 3; g2++) NS('path', { d: 'M40 ' + (Y + 26 + g2 * 10) + ' C 260 ' + (Y + 20 + g2 * 11) + ', 520 ' + (Y + 34 + g2 * 9) + ', 760 ' + (Y + 24 + g2 * 10), stroke: 'rgba(60,30,10,.2)', fill: 'none', 'stroke-width': 1.5 }, svg);
        NS('line', { x1: X0, y1: Y, x2: X1, y2: Y, stroke: '#D9B45A', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, svg);
        txt(svg, X0, Y - 26, S.k >= n ? '' : 'start', '#5B4A2A', 14);
        axis(svg, LY, { noWholes: true });
        if (S.k >= n) { txt(svg, X(0), LY + 40, '0', NAVY, 22); }
        for (var i = 1; i <= n; i++) (function (i) {
          var x = X(i / n), done = i <= S.k, br = NS('g', { class: 'bridge', tabindex: 0, role: 'button', 'aria-label': (i === n ? 'The end of the string' : 'Bridge ' + i) + (done ? ', counted' : '') }, svg);
          NS('rect', { x: x - 26, y: Y - 30, width: 52, height: 70, fill: 'transparent' }, br);
          NS('path', { d: 'M' + (x - 12) + ' ' + (Y + 18) + ' L' + x + ' ' + (Y - 1) + ' L' + (x + 12) + ' ' + (Y + 18) + ' Z', fill: done ? '#E9C46A' : '#F3E6C4', stroke: '#6B4A12', 'stroke-width': 2 }, br);
          if (i === S.k + 1 && !still()) NS('circle', { class: 'nl-pulse', cx: x, cy: Y + 6, r: 20, fill: 'none', stroke: '#E9C46A', 'stroke-width': 3 }, br);
          if (done) {
            NS('line', { x1: x, y1: Y + 62, x2: x, y2: LY - 18, stroke: '#C9BFA5', 'stroke-width': 1.5, 'stroke-dasharray': '4 5', 'pointer-events': 'none' }, svg);
            if (i < n) NS('line', { x1: x, y1: LY - 12, x2: x, y2: LY + 12, stroke: col, 'stroke-width': 3 }, svg);
            fr(svg, x, LY + 34, i, n, i === n ? OK : col, 16);
            if (i === n) txt(svg, x, LY + 82, '= 1', OK, 18);
          }
          function tap() {
            if (i <= S.k) { pluck(98 / (i / n)); return; }
            if (i !== S.k + 1) { msg('Count in order. Tap ' + (S.k ? 'the next bridge to the right.' : 'the first bridge on the left.')); return; }
            S.k = i; save(); pluck(98 / (i / n)); draw(); report();
          }
          br.addEventListener('click', tap); br.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
        })(i);
        arcs(svg, LY, S.k, col);
      };
      var report = function () {
        if (S.k >= n) { msg('<b>' + n + ' ' + DNAME[n] + 's</b> is the whole string: ' + frac(n, n) + ' = 1. The start is 0. Each bridge left a tick mark. The string is now a number line!', true); flag(box, 'count'); }
        else if (!S.k) msg('No bridges counted yet.');
        else msg('You counted <b>' + S.k + '</b> ' + DNAME[n] + (S.k > 1 ? 's' : '') + '.');
      };
      draw(); report(); return;
    }

    /* strip: fraction tiles sit on top of the number line; shade from the left */
    if (mode === 'strip') {
      var S2 = mstate(name, { k: 0 }), want = targets[0] || 0, sv = shell(270), RH = 46, TY = 64, LY2 = 196;
      var drawS = function () {
        sv.innerHTML = ''; var w = LW / n;
        NS('rect', { x: X0, y: 8, width: LW, height: RH, rx: 6, fill: '#0E1C42' }, sv); txt(sv, X0 + LW / 2, 8 + RH / 2 + 7, '1 whole', '#fff', 20);
        for (var i = 0; i < n; i++) (function (i) {
          var on = i < S2.k, g = NS('g', { class: 'tile', tabindex: 0, role: 'button', 'aria-label': 'Tile ' + (i + 1) + (on ? ', shaded' : '') }, sv), x = X0 + i * w;
          NS('rect', { x: x + 1, y: TY, width: w - 2, height: RH, rx: 5, fill: on ? col : '#fff', stroke: col, 'stroke-width': 2 }, g);
          var c = on ? '#fff' : '#0E1C42', f = w >= 44 ? 14 : 12; txt(g, x + w / 2, TY + RH / 2 - 4, '1', c, f); NS('line', { x1: x + w / 2 - 7, y1: TY + RH / 2 + 1, x2: x + w / 2 + 7, y2: TY + RH / 2 + 1, stroke: c, 'stroke-width': 2, 'pointer-events': 'none' }, g); txt(g, x + w / 2, TY + RH / 2 + 4 + f, String(n), c, f);
          function t() { S2.k = S2.k === i + 1 ? i : i + 1; save(); pluck(98 / Math.max(0.08, S2.k / n)); drawS(); }
          g.addEventListener('click', t); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } });
        })(i);
        for (var j = 0; j <= n; j++) NS('line', { x1: X(j / n), y1: TY + RH + 4, x2: X(j / n), y2: LY2 - 16, stroke: '#C9BFA5', 'stroke-width': 1.5, 'stroke-dasharray': '4 5', 'pointer-events': 'none' }, sv);
        axis(sv, LY2);
        for (var q = 1; q < n; q++) NS('line', { x1: X(q / n), y1: LY2 - 11, x2: X(q / n), y2: LY2 + 11, stroke: NAVY, 'stroke-width': 2.5 }, sv);
        if (S2.k) { NS('line', { x1: X(0), y1: LY2, x2: X(S2.k / n), y2: LY2, stroke: col, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: .85 }, sv); NS('circle', { cx: X(S2.k / n), cy: LY2, r: 10, fill: BAD, stroke: '#fff', 'stroke-width': 3 }, sv); }
        var ok = S2.k === want;
        if (!S2.k) msg('No tiles shaded yet.');
        else msg('Shaded: <b>' + S2.k + '</b> of ' + n + ' equal tiles. The dot on the line is <b>' + S2.k + '</b> jump' + (S2.k > 1 ? 's' : '') + ' from 0.', ok);
        flag(box, 'shade', ok); if (ok) flag(box, 'shade');
      };
      drawS(); return;
    }

    /* ticks: Mia wanted 10 equal parts. − / + tick marks; the spaces are counted above the line */
    if (mode === 'ticks') {
      var S3 = mstate(name, { m: +box.dataset.start || n }), st = shell(170, '<div class="sb-row" style="margin-bottom:6px"><b>Tick marks between 0 and 1:</b><button type="button" class="sb-btn sm ghost minus" aria-label="One fewer tick mark">−</button><b class="cnt" style="font-size:22px;min-width:30px;text-align:center"></b><button type="button" class="sb-btn sm ghost plus" aria-label="One more tick mark">+</button></div>'), LY3 = 96;
      $('.minus', box).onclick = function () { if (S3.m > 1) { S3.m--; save(); drawT(); } };
      $('.plus', box).onclick = function () { if (S3.m < 14) { S3.m++; save(); drawT(); } };
      var drawT = function () {
        $('.cnt', box).textContent = S3.m; st.innerHTML = ''; var sp = S3.m + 1;
        axis(st, LY3);
        for (var i = 1; i <= S3.m; i++) NS('line', { x1: X(i / sp), y1: LY3 - 12, x2: X(i / sp), y2: LY3 + 12, stroke: NAVY, 'stroke-width': 2.5 }, st);
        for (var s = 0; s < sp; s++) { var xa = X(s / sp), xb = X((s + 1) / sp); NS('rect', { x: xa + 2, y: LY3 - 40, width: xb - xa - 4, height: 22, rx: 4, fill: s % 2 ? '#F3EAD3' : '#E7F0F7', 'pointer-events': 'none' }, st); txt(st, (xa + xb) / 2, LY3 - 24, String(s + 1), '#5B6478', 13); }
        var ok = sp === n;
        msg('<b>' + S3.m + '</b> tick marks make <b>' + sp + '</b> equal spaces.' + (ok ? ' That\'s ' + n + ' equal parts: ' + DNAME[n] + 's!' : sp > n ? ' Mia wants ' + n + ' spaces. Too many!' : ' Mia wants ' + n + ' spaces.'), ok);
        flag(box, 'fixed', ok); if (ok) flag(box, 'fixed');
      };
      drawT(); return;
    }

    /* labels: Leo started counting at 0. Tap a tick mark to count the jumps from 0 */
    if (mode === 'labels') {
      X0 = 116; LW = X1 - X0;
      var S4 = mstate(name, { seen: [] }), sl = shell(200), LY4 = 92;
      var drawL = function () {
        sl.innerHTML = ''; axis(sl, LY4, { noWholes: true });
        txt(sl, X0 - 30, LY4 + 48, "Leo:", BAD, 14, 'end'); txt(sl, X0 - 30, LY4 + 98, 'Jumps:', OK, 14, 'end');
        for (var i = 0; i <= n; i++) (function (i) {
          var x = X(i / n), g = NS('g', { class: 'nl-tick', tabindex: 0, role: 'button', 'aria-label': (i === 0 ? 'The 0 mark' : i === n ? 'The 1 mark' : 'Tick mark ' + i) + '. Leo wrote ' + (i + 1) + ' ninths.' }, sl), on = S4.seen.indexOf(i) > -1;
          NS('rect', { x: x - 24, y: LY4 - 40, width: 48, height: 140, fill: 'transparent' }, g);
          if (i > 0 && i < n) NS('line', { x1: x, y1: LY4 - 12, x2: x, y2: LY4 + 12, stroke: NAVY, 'stroke-width': 2.5 }, g);
          if (i === 0 || i === n) txt(g, x, LY4 - 26, i ? '1' : '0', NAVY, 18);
          fr(g, x, LY4 + 32, i + 1, n, BAD, 14);
          if (on) { if (i === 0) txt(g, x, LY4 + 104, '0', OK, 18); else fr(g, x, LY4 + 84, i, n, OK, 14); }
          function t() { if (!on) { S4.seen.push(i); save(); } drawL(); var k = i; arcs(sl, LY4, k, OK); msg(i === 0 ? '0 is where you start. <b>0 jumps</b>, so nothing to count yet. Leo wrote ' + frac(1, n) + ' here. That\'s the mix-up!' : '<b>' + k + '</b> jump' + (k > 1 ? 's' : '') + ' from 0, so this mark is ' + frac(k, n) + '. Leo wrote ' + frac(k + 1, n) + '.'); report4(); }
          g.addEventListener('click', t); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } });
        })(i);
      };
      var report4 = function () { var ok = S4.seen.indexOf(0) > -1 && S4.seen.filter(function (v) { return v > 0; }).length >= 2; if (ok) flag(box, 'fix'); };
      drawL(); msg('No marks tapped yet.'); report4(); return;
    }

    /* even: uneven tick marks with a dot on the 4th; a friend's line below. Make it equal; pluck both. */
    if (mode === 'even') {
      var tgt = targets[0] || 4, start = JSON.parse(box.dataset.start || '[0.1,0.24,0.33,0.47,0.7,0.84]');
      var S5 = mstate(name, { p: start.slice(), a: 0, f: 0 }), se = shell(330, ''), YA = 92, YB = 256, dragging = -1;
      $('.sb-nl', box).insertAdjacentHTML('beforeend', '<div class="sb-row" style="justify-content:center;gap:10px;margin-top:6px"><button type="button" class="sb-btn sm ghost pa">🔊 Pluck at Ben\'s dot</button><button type="button" class="sb-btn sm ghost pf">🔊 Pluck at Ana\'s dot</button></div>');
      var even = function () { var p = S5.p.slice().sort(function (a, c) { return a - c; }); return p.every(function (v, i) { return Math.abs(v - (i + 1) / n) < 0.32 / n; }); };
      var isEven = function () { return S5.p.every(function (v, i) { return Math.abs(v - (i + 1) / n) < 1e-6; }); };
      var drawE = function () {
        se.innerHTML = '';
        txt(se, 20, 24, "Ben's line (drag the tick marks)", NAVY, 15, 'start');
        axis(se, YA); var p = S5.p;
        p.forEach(function (v, k) {
          var x = X(v), g = NS('g', { class: 'nl-tick drag', tabindex: 0, role: 'slider', 'aria-label': 'Tick mark ' + (k + 1), 'aria-valuenow': Math.round(v * 100) }, se);
          NS('rect', { x: x - 18, y: YA - 30, width: 36, height: 60, fill: 'transparent' }, g);
          NS('line', { x1: x, y1: YA - 14, x2: x, y2: YA + 14, stroke: dragging === k ? '#E9A23B' : NAVY, 'stroke-width': 4 }, g);
          NS('circle', { cx: x, cy: YA - 20, r: 5, fill: '#E9C46A', stroke: NAVY, 'stroke-width': 1.5 }, g);
          drag(g, se, function (pt) { dragging = k; var lo = k ? S5.p[k - 1] + 0.03 : 0.03, hi = k < S5.p.length - 1 ? S5.p[k + 1] - 0.03 : 0.97; S5.p[k] = Math.max(lo, Math.min(hi, V(pt.x))); g.setAttribute('transform', 'translate(' + (X(S5.p[k]) - x) + ',0)'); }, function () { dragging = -1; settleE(); }, null);
          g.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 0.01 : e.key === 'ArrowLeft' ? -0.01 : 0; if (!d) return; e.preventDefault(); S5.p[k] = Math.max(0.03, Math.min(0.97, S5.p[k] + d)); settleE(); $$('.nl-tick', se)[k] && $$('.nl-tick', se)[k].focus(); });
        });
        var pa = p[tgt - 1], xa = X(pa);
        NS('circle', { cx: xa, cy: YA, r: 10, fill: BAD, stroke: '#fff', 'stroke-width': 3, 'pointer-events': 'none' }, se);
        fr(se, xa, YA - 52, tgt, n, BAD, 15);
        // spaces: green when equal
        var cuts = [0].concat(p).concat([1]);
        for (var s = 0; s < cuts.length - 1; s++) { var ln = cuts[s + 1] - cuts[s]; NS('line', { x1: X(cuts[s]) + 4, y1: YA + 24, x2: X(cuts[s + 1]) - 4, y2: YA + 24, stroke: Math.abs(ln - 1 / n) < 0.32 / n ? OK : '#E0A79F', 'stroke-width': 4, 'stroke-linecap': 'round', 'pointer-events': 'none' }, se); }
        txt(se, 20, YB - 66, "Ana's line (already in equal " + DNAME[n] + 's)', NAVY, 15, 'start');
        axis(se, YB);
        for (var q = 1; q < n; q++) NS('line', { x1: X(q / n), y1: YB - 12, x2: X(q / n), y2: YB + 12, stroke: NAVY, 'stroke-width': 2.5 }, se);
        NS('circle', { cx: X(tgt / n), cy: YB, r: 10, fill: '#2F6FDE', stroke: '#fff', 'stroke-width': 3 }, se);
        fr(se, X(tgt / n), YB - 60, tgt, n, '#2F6FDE', 15);
        NS('line', { x1: xa, y1: YA + 30, x2: xa, y2: YB - 88, stroke: isEven() ? OK : '#E0A79F', 'stroke-width': 2, 'stroke-dasharray': '5 5', 'pointer-events': 'none' }, se);
      };
      var settleE = function () {
        if (!isEven() && even()) { S5.p = S5.p.map(function (_, k) { return (k + 1) / n; }); S5.a = 0; S5.f = 0; }
        save(); drawE(); reportE();
      };
      var reportE = function () {
        if (isEven()) { flag(box, 'even'); msg(S5.a && S5.f ? 'Same spot, same note! Both dots are ' + tgt + ' jumps of one-' + DNAME[n] + ' from 0.' : 'All 7 spaces are equal now. Ben\'s dot moved to the same spot as Ana\'s.', true); if (S5.a && S5.f) flag(box, 'same'); }
        else msg('Ben\'s spaces are not equal yet. Red bars are the wrong size.');
      };
      $('.pa', box).onclick = function () { pluck(98 / S5.p[tgt - 1]); if (isEven()) { S5.a = 1; save(); reportE(); } else msg('That was Ben\'s note.'); };
      $('.pf', box).onclick = function () { pluck(98 / (tgt / n)); if (isEven()) { S5.f = 1; save(); reportE(); } else msg('That was Ana\'s note. It does not match Ben\'s yet: his dot is in a different spot.'); };
      drawE(); reportE(); return;
    }

    /* cut + dots: tick marks you add and drag, then dots you place (snap to tick marks) */
    var S6 = mstate(name, mode === 'dots' ? { placed: [] } : { p: [], placed: [] }), H = 210, LY6 = 120;
    var sc = shell(H, mode === 'cut' ? '<div class="sb-row nl-ctl" style="margin-bottom:6px"><button type="button" class="sb-btn sm ghost add">＋ Add a tick mark</button><button type="button" class="sb-btn sm ghost rem">− Take one away</button><span class="nl-cnt" style="font-weight:800;color:#5B6478"></span></div>' : '');
    var cur = S6.cur == null ? 0 : S6.cur, drag6 = -1;
    function cutDone() { return mode === 'dots' || stepDoneFor(box, 'cut'); }
    function isEq() { return S6.p.length === n - 1 && S6.p.every(function (v, i) { return Math.abs(v - (i + 1) / n) < 1e-6; }); }
    function near() { var p = S6.p.slice().sort(function (a, c) { return a - c; }); return p.length === n - 1 && p.every(function (v, i) { return Math.abs(v - (i + 1) / n) < 0.3 / n; }); }
    if (mode === 'cut') {
      $('.add', box).onclick = function () { if (cutDone()) return; if (S6.p.length >= 14) return; var c = [0].concat(S6.p.slice().sort(function (a, d) { return a - d; })).concat([1]), best = 0, at = 0.5; for (var i = 0; i < c.length - 1; i++) if (c[i + 1] - c[i] > best) { best = c[i + 1] - c[i]; at = (c[i] + c[i + 1]) / 2; } S6.p.push(at); S6.p.sort(function (a, d) { return a - d; }); settle6(); };
      $('.rem', box).onclick = function () { if (cutDone() || !S6.p.length) return; S6.p.pop(); settle6(); };
    }
    function settle6() { if (!isEq() && near()) S6.p = S6.p.map(function (_, k) { return (k + 1) / n; }); save(); draw6(); report6(); }
    function draw6() {
      sc.innerHTML = ''; axis(sc, LY6);
      var cd = cutDone();
      if (mode === 'dots') { for (var q = 1; q < n * b; q++) if (q % n) NS('line', { x1: X(q / n), y1: LY6 - 11, x2: X(q / n), y2: LY6 + 11, stroke: NAVY, 'stroke-width': 2.5 }, sc); }
      else S6.p.forEach(function (v, k) {
        var x = X(v), g = NS('g', { class: 'nl-tick' + (cd ? '' : ' drag'), tabindex: cd ? -1 : 0, role: 'slider', 'aria-label': 'Tick mark ' + (k + 1) }, sc);
        NS('rect', { x: x - 16, y: LY6 - 30, width: 32, height: 60, fill: 'transparent' }, g);
        NS('line', { x1: x, y1: LY6 - 13, x2: x, y2: LY6 + 13, stroke: drag6 === k ? '#E9A23B' : NAVY, 'stroke-width': 3.5 }, g);
        if (!cd) {
          NS('circle', { cx: x, cy: LY6 - 20, r: 5, fill: '#E9C46A', stroke: NAVY, 'stroke-width': 1.5 }, g);
          drag(g, sc, function (pt) { drag6 = k; S6.p[k] = Math.max(0.02, Math.min(0.98, V(pt.x))); g.setAttribute('transform', 'translate(' + (X(S6.p[k]) - x) + ',0)'); }, function (pt) { drag6 = -1; if (pt && pt.y > LY6 + 60) S6.p.splice(k, 1); S6.p.sort(function (a, d) { return a - d; }); settle6(); }, null);
          g.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 0.01 : e.key === 'ArrowLeft' ? -0.01 : 0; if (!d) return; e.preventDefault(); S6.p[k] = Math.max(0.02, Math.min(0.98, S6.p[k] + d)); settle6(); var t = $$('.nl-tick', sc)[k]; if (t) t.focus(); });
        }
      });
      if (mode === 'cut' && !cd) { var c = [0].concat(S6.p.slice().sort(function (a, d) { return a - d; })).concat([1]); for (var s = 0; s < c.length - 1; s++) txt(sc, (X(c[s]) + X(c[s + 1])) / 2, LY6 - 40, String(s + 1), '#8C93A6', 13); }
      if (!cd) return;
      // dots
      S6.placed.forEach(function (k) { NS('circle', { cx: X(k / n), cy: LY6, r: 10, fill: OK, stroke: '#fff', 'stroke-width': 3 }, sc); fr(sc, X(k / n), LY6 - 58, k, n, OK, 15); });
      if (S6.placed.length >= targets.length) return;
      var x = X(cur / n); arcs(sc, LY6, cur, col);
      if (cur) txt(sc, x, LY6 + 74, cur + ' jump' + (cur > 1 ? 's' : ''), BAD, 14);
      // tap a spot on the line: the dot goes to the nearest mark
      var hit = NS('rect', { x: X0 - 20, y: LY6 - 30, width: LW + 40, height: 60, fill: 'transparent', class: 'nl-hit' }, sc);
      hit.addEventListener('click', function (e) { cur = snapK(svgPt(sc, e).x); S6.cur = cur; draw6(); check6(); });
      var d = dot(sc, x, LY6, BAD); d.setAttribute('aria-label', 'The dot. ' + cur + ' jumps from 0.');
      drag(d, sc, function (pt) { var k = snapK(pt.x); cur = k; S6.cur = cur; d.setAttribute('transform', 'translate(' + (X(k / n) - x) + ',0)'); }, function () { draw6(); check6(); }, null);
      d.addEventListener('keydown', function (e) { var dd = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!dd) return; e.preventDefault(); cur = Math.max(0, Math.min(n * b, cur + dd)); S6.cur = cur; draw6(); check6(); var nd = $('.nl-dot', sc); if (nd) nd.focus(); });
    }
    function check6() {
      save(); var t = targets[S6.placed.length];
      if (cur === t) { S6.placed.push(t); cur = 0; S6.cur = 0; pluck(98 / Math.max(0.1, t / n / Math.max(1, b))); save(); draw6(); }
      report6();
    }
    function report6() {
      var cd = cutDone();
      if (mode === 'cut') { var cnt = $('.nl-cnt', box); if (cnt) cnt.textContent = cd ? '' : S6.p.length + ' tick mark' + (S6.p.length === 1 ? '' : 's') + ' · ' + (S6.p.length + 1) + (S6.p.length ? ' spaces' : ' space'); $('.nl-ctl', box).hidden = cd; }
      if (mode === 'cut' && !cd) {
        if (isEq()) { msg('<b>' + (n - 1) + '</b> tick marks make <b>' + n + '</b> equal spaces. The line is cut into ' + DNAME[n] + 's!', true); flag(box, 'cut'); return; }
        flag(box, 'cut', false);
        var sp = S6.p.length + 1;
        msg(!S6.p.length ? 'No tick marks yet: 1 space.' : sp < n ? sp + ' spaces. That\'s not enough for ' + n + '.' : sp > n ? sp + ' spaces. That\'s too many for ' + n + '.' : n + ' spaces, but they are not all the same size yet.');
        return;
      }
      if (S6.placed.length >= targets.length) { msg(targets.length > 1 ? 'Every dot is on its spot.' : 'The dot is on ' + frac(targets[0], n) + ': ' + targets[0] + ' jumps from 0.', true); flag(box, 'dot'); flag(box, 'dots'); return; }
      var t = targets[S6.placed.length];
      msg((targets.length > 1 ? 'Next spot: ' + frac(t, n) + '.' : '') + (cur && cur !== t ? ' The dot is <b>' + cur + '</b> jump' + (cur > 1 ? 's' : '') + ' from 0. That is not ' + frac(t, n) + '.' : ''));
    }
    document.addEventListener('sb:step', function () { if (mode === 'cut') { draw6(); report6(); } });
    draw6(); report6();
  };

  /* ── HTML drag (cards): drag a card onto a target; a tap works too ── */
  function hdrag(node, onDrop, onTap) {
    var d = null;
    node.addEventListener('pointerdown', function (e) { if (e.button > 0) return; e.preventDefault(); d = { x: e.clientX, y: e.clientY, moved: false }; node.setPointerCapture(e.pointerId); });
    node.addEventListener('pointermove', function (e) { if (!d) return; var dx = e.clientX - d.x, dy = e.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 6) { d.moved = true; node.classList.add('dragging'); } if (d.moved) node.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; });
    node.addEventListener('pointerup', function (e) {
      if (!d) return; var m = d.moved; d = null; node.classList.remove('dragging'); node.style.transform = '';
      if (!m) { if (onTap) onTap(); return; }
      node.style.visibility = 'hidden'; var t = document.elementFromPoint(e.clientX, e.clientY); node.style.visibility = '';
      onDrop(t);
    });
    node.addEventListener('pointercancel', function () { d = null; node.classList.remove('dragging'); node.style.transform = ''; });
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (onTap) onTap(); } });
  }
  function fracHTML(t) { var p = String(t).split('/'); return p.length > 1 ? frac(p[0], p[1]) : esc(t); }
  var SYMW = { '<': 'is less than', '>': 'is greater than', '=': 'is equal to' };
  var SYMF = { '<': 'less-than', '>': 'greater-than', '=': 'equal-to' };

  /* ── cmp: two wholes cut into the same number of equal parts (3.09.03) ──
     data-kind tiles (Fraction Tiles bars; tap or drag along a bar to shade) · strings (two strings; slide each bridge, pluck the part)
     data-d, data-a / data-b (numerators to reach), data-lens "660,360" (strings of different lengths: fixed bridges, stretch the short one)
     data-rows "Top bar,Bottom bar". Flags: a · b · shade (tiles) · pluck (strings) · heard · match · same (lens) */
  MODS.cmp = function (box) {
    var kind = box.dataset.kind || 'tiles', A = +box.dataset.a, B = +box.dataset.b, name = box.dataset.name || 'cmp';
    // two denominators (3.09.04): data-da / data-db; else both rows use data-d
    var DD = [+(box.dataset.da || box.dataset.d), +(box.dataset.db || box.dataset.d)], d = DD[0], mixed = DD[0] !== DD[1];
    function pn(k, dn) { return k + ' ' + DNAME[dn] + (k === 1 ? '' : 's'); }
    var rows = (box.dataset.rows || (kind === 'tiles' ? 'Top bar,Bottom bar' : 'String A,String B')).split(',');
    var col = DCOL[d] || '#1F2A44', NAVY = '#0E1C42', OK = '#1E7A4C';
    var lens = box.dataset.lens ? box.dataset.lens.split(',').map(Number) : null;
    var S = mstate(name, kind === 'tiles' ? { k: [0, 0] } : lens ? { k: [A, B], w2: lens[1], pl: [0, 0], pl2: [0, 0] } : { k: [1, 1], pl: [0, 0] });
    box.innerHTML = '<div class="sb-stage sb-cmp"><svg role="group" aria-label="' + (mixed ? 'Two wholes: one cut into ' + DD[0] + ' equal parts, one cut into ' + DD[1] : 'Two wholes, each cut into ' + d + ' equal parts') + '"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OK + '">' + h + '</span>' : h; }
    function txt(g, x, y, s, c, fs, an) { return NS('text', { x: x, y: y, 'text-anchor': an || 'start', 'font-size': fs || 15, 'font-weight': 900, fill: c || NAVY, text: s, 'pointer-events': 'none' }, g); }
    function sfr(g, x, y, nu, de, c, fs) { fs = fs || 15; var t = NS('g', { 'pointer-events': 'none' }, g); txt(t, x, y, String(nu), c, fs, 'middle'); NS('line', { x1: x - fs * 0.55, y1: y + 5, x2: x + fs * 0.55, y2: y + 5, stroke: c, 'stroke-width': 2 }, t); txt(t, x, y + fs + 6, String(de), c, fs, 'middle'); return t; }

    if (kind === 'tiles') {
      var BW = 680, LX = 10, RH = 46, Y0 = 6, YS = [Y0 + RH + 34, Y0 + 2 * RH + 74];
      svg.setAttribute('viewBox', '0 0 700 ' + (YS[1] + RH + 6));
      var drawT = function () {
        svg.innerHTML = '';
        NS('rect', { x: LX + 1, y: Y0, width: BW - 2, height: RH, rx: 6, fill: NAVY }, svg); txt(svg, LX + BW / 2, Y0 + RH / 2 + 7, '1 whole', '#fff', 20, 'middle');
        [0, 1].forEach(function (r) {
          var dn = DD[r], col = DCOL[dn] || '#1F2A44', y = YS[r], w = BW / dn, row = NS('g', { class: 'cmp-row' }, svg);
          var lab = txt(svg, LX, y - 9, rows[r] + ' · ' + S.k[r] + ' shaded', '#5B6478', 13);
          for (var i = 0; i < dn; i++) (function (i) {
            var on = i < S.k[r], g = NS('g', { class: 'tile part', tabindex: 0, role: 'button', 'aria-label': rows[r] + ', tile ' + (i + 1) + (on ? ', shaded' : '') }, row);
            NS('rect', { x: LX + i * w + 1, y: y, width: w - 2, height: RH, rx: 6, fill: on ? col : '#fff', stroke: col, 'stroke-width': 2 }, g);
            var c = on ? '#fff' : NAVY, f = w >= 44 ? 15 : 12; txt(g, LX + i * w + w / 2, y + RH / 2 - 4, '1', c, f, 'middle'); NS('line', { x1: LX + i * w + w / 2 - 7, y1: y + RH / 2 + 1, x2: LX + i * w + w / 2 + 7, y2: y + RH / 2 + 1, stroke: c, 'stroke-width': 2, 'pointer-events': 'none' }, g); txt(g, LX + i * w + w / 2, y + RH / 2 + 4 + f, String(dn), c, f, 'middle');
            g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(r, S.k[r] === i + 1 ? i : i + 1); } });
          })(i);
          // tap a tile: shade it and every tile before it. Drag along the bar: shade up to your finger.
          var hit = NS('rect', { x: LX, y: y, width: BW, height: RH, fill: 'transparent', style: 'cursor:pointer' }, svg);
          function at(pt) { return Math.max(0, Math.min(dn, Math.ceil((pt.x - LX) / w))); }
          // recolor in place while dragging (redrawing would drop the pointer)
          function recolor() { [].forEach.call(row.children, function (g, i) { var on = i < S.k[r], c = on ? '#fff' : NAVY; g.querySelector('rect').setAttribute('fill', on ? col : '#fff'); [].forEach.call(g.querySelectorAll('text'), function (t) { t.setAttribute('fill', c); }); g.querySelector('line').setAttribute('stroke', c); }); lab.textContent = rows[r] + ' · ' + S.k[r] + ' shaded'; }
          drag(hit, svg, function (pt) { var k = at(pt); if (k !== S.k[r]) { S.k[r] = k; recolor(); } }, function () { drawT(); }, function (e) { var k = at(svgPt(svg, e)); set(r, S.k[r] === k ? k - 1 : k); });
        });
        report();
      };
      var set = function (r, k) { S.k[r] = Math.max(0, k); save(); drawT(); };
      var report = function () {
        save();
        var okA = S.k[0] === A, okB = S.k[1] === B;
        flag(box, 'a', okA); if (okA) flag(box, 'a'); flag(box, 'b', okB); if (okB) flag(box, 'b');
        if (okA && okB) { flag(box, 'shade'); var big = DD[0] < DD[1] ? 0 : 1; msg(mixed ? pn(A, DD[0]) + ' and ' + pn(B, DD[1]) + '. ' + (A === B ? 'The same number of tiles, but ' + DNAME[DD[big]] + ' tiles are bigger, so the ' + rows[big].toLowerCase() + ' shows more.' : 'Look at how much of each bar is shaded.') : pn(A, d) + ' and ' + pn(B, d) + '. Every tile is the same size, so count the shaded tiles.', true); return; }
        flag(box, 'shade', false);
        var r = !okA ? 0 : 1, want = r ? B : A, k = S.k[r];
        msg(k === 0 ? (okA ? rows[0] + ': <b>' + A + '</b> tile' + (A === 1 ? '' : 's') + ' shaded. ✓' : '') : rows[r] + ': <b>' + k + '</b> tile' + (k === 1 ? '' : 's') + ' shaded. ' + (k > want ? 'That is too many.' : 'That is not enough yet.'));
      };
      document.addEventListener('sb:step', drawT); drawT(); return;
    }

    /* strings */
    var X0 = 70, LW = 640, F0 = 98, K = 1, Ys = [70, 222], H = 330;
    function fit() { K = Math.max(1, Math.min(2.4, 740 / (box.clientWidth || 800))); Ys = [70 + (K - 1) * 10, 222 + (K - 1) * 70]; H = Ys[1] + 108 + (K - 1) * 40; svg.setAttribute('viewBox', '0 0 800 ' + H); }
    fit();
    function W(r) { return lens ? (r ? S.w2 : lens[0]) : LW; }
    var drawS = function () {
      fit(); svg.innerHTML = '';
      [0, 1].forEach(function (r) {
        var dn = DD[r], y = Ys[r], w = W(r), seg = w / dn, k = S.k[r], xb = X0 + k * seg;
        txt(svg, X0 - 40, y - 30 - 4 * K, rows[r], '#5B4A2A', 15 * K);
        NS('rect', { x: X0 - 30, y: y + 12, width: w + 60, height: 38, rx: 8, fill: r ? '#B07A45' : '#A86A35', stroke: '#5E3818', 'stroke-width': 2 }, svg);
        for (var q = 1; q < dn; q++) NS('circle', { cx: X0 + q * seg, cy: y + 31, r: 3.2, fill: '#F3E6C4', opacity: .85, 'pointer-events': 'none' }, svg);
        NS('rect', { x: X0 - 7, y: y - 2, width: 10, height: 16, rx: 2, fill: '#EDE3CC', stroke: '#8C7550' }, svg);
        NS('rect', { x: X0 + w - 3, y: y - 2, width: 10, height: 16, rx: 2, fill: '#EDE3CC', stroke: '#8C7550' }, svg);
        NS('line', { x1: xb, y1: y, x2: X0 + w, y2: y, stroke: '#B8A57A', 'stroke-width': 2, 'pointer-events': 'none' }, svg);
        // the part you pluck: from the start to the bridge
        var pg = NS('g', { class: 'seg', tabindex: 0, role: 'button', 'aria-label': 'Pluck ' + rows[r] + ': ' + pn(k, dn) }, svg);
        NS('rect', { x: X0, y: y - 24, width: Math.max(8, xb - X0), height: 40, fill: 'transparent' }, pg);
        var sp = NS('path', { d: 'M' + X0 + ' ' + y + ' L' + xb + ' ' + y, stroke: '#D9A21B', 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' }, pg);
        pg.addEventListener('click', function () { pl(r, sp, xb); }); pg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pl(r, sp, xb); } });
        // the bridge
        var bg = NS('g', { class: 'bridge' + (lens ? '' : ' drag'), tabindex: lens ? -1 : 0, role: 'slider', 'aria-label': rows[r] + ' bridge', 'aria-valuenow': k, 'aria-valuemin': 1, 'aria-valuemax': dn - 1 }, svg);
        NS('rect', { x: xb - 22 * K, y: y - 10 * K, width: 44 * K, height: 52 * K, fill: 'transparent' }, bg);
        NS('path', { d: 'M' + (xb - 12 * K) + ' ' + (y + 18 * K) + ' L' + xb + ' ' + (y - 1) + ' L' + (xb + 12 * K) + ' ' + (y + 18 * K) + ' Z', fill: '#F3E6C4', stroke: '#6B4A12', 'stroke-width': 2 }, bg);
        sfr(svg, xb, y + 56 + 16 * K, k, dn, '#5B4A2A', 15 * K);
        if (!lens) {
          drag(bg, svg, function (pt) { var nk = Math.max(1, Math.min(dn - 1, Math.round((pt.x - X0) / seg))); bg.setAttribute('transform', 'translate(' + (X0 + nk * seg - xb) + ',0)'); bg.__k = nk; }, function () { if (bg.__k) { S.k[r] = bg.__k; S.pl = [0, 0]; } save(); drawS(); report(); }, null);
          bg.addEventListener('keydown', function (e) { var dd = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!dd) return; e.preventDefault(); S.k[r] = Math.max(1, Math.min(dn - 1, S.k[r] + dd)); S.pl = [0, 0]; save(); drawS(); report(); var b2 = $$('.bridge', svg)[r]; if (b2) b2.focus(); });
        }
        // a shorter string can be stretched: drag its end
        if (lens && r === 1 && S.w2 < lens[0]) {
          var eg = NS('g', { class: 'bridge drag', tabindex: 0, role: 'slider', 'aria-label': 'End of ' + rows[r] + '. Drag it to make the string longer.' }, svg);
          NS('rect', { x: X0 + w + 2 - 24 * K, y: y - 20, width: 48 * K, height: 80, fill: 'transparent' }, eg);
          NS('circle', { cx: X0 + w + 2, cy: y + 31, r: 13 * K, fill: '#E9C46A', stroke: '#5E3818', 'stroke-width': 2 }, eg);
          NS('path', { d: 'M' + (X0 + w - 4) + ' ' + (y + 31) + ' l5 -5 v10 z M' + (X0 + w + 8) + ' ' + (y + 31) + ' l-5 -5 v10 z', fill: '#5E3818', transform: 'translate(0,0)' }, eg);
          drag(eg, svg, function (pt) { var nw = Math.max(lens[1], Math.min(lens[0], pt.x - X0)); eg.setAttribute('transform', 'translate(' + (nw - w) + ',0)'); eg.__w = nw; }, function () { if (eg.__w) { S.w2 = eg.__w; if (lens[0] - S.w2 < 30) S.w2 = lens[0]; } save(); drawS(); report(); }, null);
          eg.addEventListener('keydown', function (e) { var dd = e.key === 'ArrowRight' ? 20 : e.key === 'ArrowLeft' ? -20 : 0; if (!dd) return; e.preventDefault(); S.w2 = Math.max(lens[1], Math.min(lens[0], S.w2 + dd)); if (lens[0] - S.w2 < 30) S.w2 = lens[0]; save(); drawS(); report(); });
        }
      });
      report();
    };
    function matched() { return lens && S.w2 >= lens[0]; }
    function pl(r, path, xb) {
      var part = (xb - X0) / LW; pluck(F0 / Math.max(0.05, part));
      if (!reduced && !document.documentElement.classList.contains('sb-still')) { var t0 = performance.now(), y = Ys[r]; (function wob(t) { var q = (t - t0) / 700; if (q > 1) { path.setAttribute('d', 'M' + X0 + ' ' + y + ' L' + xb + ' ' + y); return; } var a = Math.sin(q * 40) * 8 * (1 - q); path.setAttribute('d', 'M' + X0 + ' ' + y + ' Q ' + (X0 + xb) / 2 + ' ' + (y + a) + ' ' + xb + ' ' + y); requestAnimationFrame(wob); })(t0); }
      if (lens) { (matched() ? S.pl2 : S.pl)[r] = 1; } else if (setOK()) S.pl[r] = 1;
      save(); report();
    }
    function setOK() { return S.k[0] === A && S.k[1] === B; }
    var report = function () {
      if (lens) {
        if (S.pl[0] && S.pl[1]) flag(box, 'heard');
        if (matched()) flag(box, 'match');
        if (matched() && S.pl2[0] && S.pl2[1]) { flag(box, 'same'); msg('Same whole, same note! Now both parts really are ' + A + ' ' + DNAME[d] + 's of the same whole.', true); return; }
        if (matched()) { msg('Now both strings are the same length: the same whole.', true); return; }
        msg(S.pl[0] && S.pl[1] ? 'Different notes! The long string\'s part is longer, even though both bridges are at ' + A + ' ' + DNAME[d] + 's.' : S.pl[0] || S.pl[1] ? 'You plucked one part.' : '');
        return;
      }
      var okA = S.k[0] === A, okB = S.k[1] === B;
      flag(box, 'a', okA); if (okA) flag(box, 'a'); flag(box, 'b', okB); if (okB) flag(box, 'b');
      if (okA && okB && S.pl[0] && S.pl[1]) { flag(box, 'pluck'); var va = A / DD[0], vb = B / DD[1], lo = vb > va ? 1 : 0; msg(Math.abs(va - vb) < 1e-9 ? 'Same length, same note: ' + pn(A, DD[0]) + ' and ' + pn(B, DD[1]) + ' are the same amount of string.' : rows[lo] + '\'s part is longer and sings lower: ' + pn(lo ? B : A, DD[lo]) + ' is more string than ' + pn(lo ? A : B, DD[1 - lo]) + '.', true); return; }
      if (okA && okB) { msg(S.pl[0] || S.pl[1] ? 'You plucked one part.' : 'Both bridges are in place.', true); return; }
      var r = !okA ? 0 : 1, want = r ? B : A;
      msg(rows[r] + '\'s bridge is at <b>' + S.k[r] + '</b> ' + DNAME[DD[r]] + (S.k[r] === 1 ? '' : 's') + '. ' + (S.k[r] > want ? 'That is too far.' : S.k[r] < want ? 'Not far enough yet.' : ''));
    };
    document.addEventListener('sb:step', drawS); onWidth(box, drawS); drawS();
  };

  /* ── sym: drag <, > or = between two fractions; the sentence reads it back ──
     data-a "5/12", data-b "11/12", data-ans "<", data-wrong ">" (a friend's symbol already in the slot), data-who "Mia". Flag: sym */
  MODS.sym = function (box) {
    var a = box.dataset.a, b = box.dataset.b, ans = box.dataset.ans, name = box.dataset.name || 'sym', who = box.dataset.who;
    var S = mstate(name, { v: box.dataset.wrong || '' });
    box.innerHTML = '<div class="sb-stage sb-sym"><div class="sym-row"><span class="sym-f">' + fracHTML(a) + '</span><span class="sym-slot" aria-label="The symbol between the fractions"></span><span class="sym-f">' + fracHTML(b) + '</span></div>' +
      '<div class="sym-cards" role="group" aria-label="Symbols to drag">' + ['<', '>', '='].map(function (s) { return '<button type="button" class="sym-card" data-s="' + esc(s) + '" aria-label="' + SYMW[s] + '">' + esc(s) + '</button>'; }).join('') + '</div></div><div class="sb-readout" aria-live="polite"></div>';
    var slot = $('.sym-slot', box), out = $('.sb-readout', box);
    function words(t) { var p = String(t).split('/'); return p.length > 1 ? frac(p[0], p[1]) : esc(t); }
    function paint(say) {
      var v = S.v, ok = v === ans, wrong = v && v === box.dataset.wrong && !ok;
      slot.className = 'sym-slot' + (v ? ' full' : '') + (v ? ok ? ' ok' : ' no' : '');
      slot.innerHTML = v ? '<span class="sym-in">' + esc(v) + '</span>' + (wrong && who ? '<small>' + esc(who) + '\'s</small>' : '') : '<small>drop here</small>';
      if (!v) { out.innerHTML = ''; flag(box, 'sym', false); return; }
      var sent = words(a) + ' ' + SYMW[v] + ' ' + words(b) + '.';
      if (ok) { out.innerHTML = '<span style="color:#1E7A4C">' + sent + ' ✓</span>'; flag(box, 'sym'); if (say) playClip('words/g3m-word-' + SYMF[v] + '.mp3'); }
      else { flag(box, 'sym', false); out.innerHTML = 'That says: ' + sent + ' ' + (v === '=' ? 'Equal means the same amount. These are not the same.' : ans === '=' ? 'These two are the same amount.' : 'The open side must face the greater ' + ((String(a) + String(b)).indexOf('/') > -1 ? 'fraction.' : 'amount.')); }
    }
    $$('.sym-card', box).forEach(function (c) {
      hdrag(c, function (t) { if (t && t.closest && t.closest('.sym-slot') === slot) { S.v = c.dataset.s; save(); paint(true); } }, function () { S.v = c.dataset.s; save(); paint(true); });
    });
    paint(false);
  };

  /* ── order: drag three fractions into order, least to greatest; play them as a tune ──
     data-d, data-nums "9,4,1", data-pre (start with the cards in the slots in that order), data-who "Leo". Flags: order · tune */
  MODS.order = function (box) {
    // data-fr "1/11,1/9,1/12" (mixed denominators, 3.09.04): cards are keyed by "n/d"; else data-d + data-nums (keyed by numerator)
    var FR = !!box.dataset.fr, d = +box.dataset.d || 0, name = box.dataset.name || 'order', who = box.dataset.who;
    var nums = FR ? box.dataset.fr.split(',') : box.dataset.nums.split(',').map(Number);
    function nOf(id) { return FR ? +String(id).split('/')[0] : id; }
    function dOf(id) { return FR ? +String(id).split('/')[1] : d; }
    function val(id) { return nOf(id) / dOf(id); }
    var S = mstate(name, { s: box.dataset.pre ? (FR ? box.dataset.pre.split(',') : nums.slice()) : [null, null, null], played: 0 });
    var sel = null;
    box.innerHTML = '<div class="sb-stage sb-order"><div class="ord-tray" aria-label="Fraction cards"></div><div class="ord-slots"></div>' +
      '<div class="sb-row"><button type="button" class="sb-btn sm ghost ord-play">🔊 Play the tune</button><span class="ord-who"></span></div></div><div class="sb-readout" aria-live="polite"></div>';
    var tray = $('.ord-tray', box), slots = $('.ord-slots', box), out = $('.sb-readout', box), playB = $('.ord-play', box);
    function card(id) {
      var n = nOf(id), d = dOf(id), col = DCOL[d] || '#1F2A44', w = 120, cw = w / d, sv = '<svg viewBox="0 0 ' + (w + 2) + ' 22" aria-hidden="true">';
      for (var i = 0; i < d; i++) sv += '<rect x="' + (1 + i * cw) + '" y="1" width="' + cw + '" height="20" fill="' + (i < n ? col : '#fff') + '" stroke="' + col + '" stroke-width="1.5"/>';
      sv += '</svg>';
      var c = el('button', 'ord-card', frac(n, d) + sv); c.type = 'button'; c.dataset.n = id; c.setAttribute('aria-label', n + ' ' + DNAME[d] + (n === 1 ? '' : 's')); return c;
    }
    function place(n, slotI) {
      var from = S.s.indexOf(n), there = S.s[slotI];
      if (from > -1) S.s[from] = there; S.s[slotI] = n; S.played = 0; sel = null; save(); draw();
    }
    function draw() {
      tray.innerHTML = ''; slots.innerHTML = '';
      nums.forEach(function (n) { if (S.s.indexOf(n) > -1) return; var c = card(n); tray.appendChild(c); wire(c, n); });
      tray.hidden = !tray.children.length;
      ['least', '', 'greatest'].forEach(function (lab, i) {
        var s = el('div', 'ord-slot'); s.dataset.i = i; s.innerHTML = '<small>' + (lab || '&nbsp;') + '</small>';
        if (S.s[i] != null) { var c = card(S.s[i]); s.appendChild(c); wire(c, S.s[i]); s.classList.add('full'); }
        s.addEventListener('click', function (e) { if (sel != null && !e.target.closest('.ord-card')) place(sel, i); });
        slots.appendChild(s); if (i < 2) slots.appendChild(el('span', 'ord-arrow', '→'));
      });
      if (sel != null) $$('.ord-card', box).forEach(function (c) { if (String(c.dataset.n) === String(sel)) c.classList.add('sel'); });
      $('.ord-who', box).textContent = who && S.s.join() === box.dataset.pre ? who + '\'s order' : '';
      report();
    }
    function wire(c, n) {
      hdrag(c, function (t) { var s = t && t.closest && t.closest('.ord-slot'); if (s && box.contains(s)) place(n, +s.dataset.i); },
        function () { if (sel == null || sel === n) { sel = sel === n ? null : n; draw(); return; } var si = S.s.indexOf(n); if (si > -1) place(sel, si); else { sel = n; draw(); } });
    }
    function right() { var s = S.s; return s.every(function (v) { return v != null; }) && val(s[0]) < val(s[1]) && val(s[1]) < val(s[2]); }
    playB.onclick = function () {
      if (S.s.some(function (v) { return v == null; })) { out.innerHTML = 'Put all 3 cards in the boxes first.'; return; }
      S.s.forEach(function (n, i) { setTimeout(function () { pluck(98 / val(n)); var c = $$('.ord-slot .ord-card', box)[i]; if (c) { c.classList.add('ring'); setTimeout(function () { c.classList.remove('ring'); }, 520); } }, i * 700); });
      setTimeout(function () { if (right()) { S.played = 1; save(); } else flag(box, 'try'); report(true); }, 2200);
    };
    function report(afterPlay) {
      var full = S.s.every(function (v) { return v != null; });
      if (right()) { flag(box, 'order'); if (S.played) flag(box, 'tune'); out.innerHTML = '<span style="color:#1E7A4C">' + (S.played ? 'Hear it? From least to greatest, each part is longer, so the notes step down.' : 'Least to greatest: ' + S.s.map(function (n) { return frac(nOf(n), dOf(n)); }).join(' , ') + '.') + '</span>'; return; }
      flag(box, 'order', false);
      if (!full) { out.innerHTML = ''; return; }
      out.innerHTML = afterPlay ? 'The notes did not step down each time. A smaller fraction is a shorter part, and a shorter part sings higher.' : '';
    }
    draw();
  };

  /* ── nl2: two number lines, one above the other, same length; one dot on each (3.09.04) ──
     data-n / data-n2 (denominators), data-ka / data-kb (jumps to reach), data-rows "Sevenths,Twelfths". Flags: top · bot · dots */
  MODS.nl2 = function (box) {
    var NN = [+box.dataset.n, +box.dataset.n2], KK = [+box.dataset.ka, +box.dataset.kb], name = box.dataset.name || 'nl2';
    var rows = (box.dataset.rows || (DNAME[NN[0]] + 's,' + DNAME[NN[1]] + 's')).split(','), NAVY = '#1F2A44', OK = '#1E7A4C', BAD = '#B23A2E';
    var S = mstate(name, { c: [0, 0], ok: [0, 0] }), X0 = 60, X1 = 740, LW = X1 - X0, Ys = [96, 236], K = 1;
    // phones: the same picture, drawn with bigger text and dots
    function fit() { K = Math.max(1, Math.min(2.2, 740 / (box.clientWidth || 800))); Ys = [50 + 46 * K, 50 + 46 * K + 90 + 50 * K]; svg.setAttribute('viewBox', '0 0 800 ' + Math.round(Ys[1] + 30 + 46 * K)); }
    box.innerHTML = '<div class="sb-stage sb-nl"><svg viewBox="0 0 800 320" role="group" aria-label="Two number lines from 0 to 1: ' + rows.join(' and ') + '"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function X(r, k) { return X0 + k / NN[r] * LW; }
    function txt(x, y, s, c, fs, an) { return NS('text', { x: x, y: y, 'text-anchor': an || 'middle', 'font-size': fs || 16, 'font-weight': 900, fill: c || NAVY, text: s, 'pointer-events': 'none' }, svg); }
    function fr(x, y, nu, de, c) { var f = 16 * K; txt(x, y, String(nu), c, f); NS('line', { x1: x - 9 * K, y1: y + 5 * K, x2: x + 9 * K, y2: y + 5 * K, stroke: c, 'stroke-width': 2, 'pointer-events': 'none' }, svg); txt(x, y + f + 6 * K, String(de), c, f); }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OK + '">' + h + '</span>' : h; }
    function draw() {
      fit(); svg.innerHTML = '';
      [0, 1].forEach(function (r) {
        var y = Ys[r], n = NN[r], col = DCOL[n] || NAVY, done = S.ok[r], k = done ? KK[r] : S.c[r];
        txt(X1 + 10, y - 34 - 14 * K, rows[r], col, 15 * K, 'end');
        NS('line', { x1: X0 - 18, y1: y, x2: X1 + 18, y2: y, stroke: NAVY, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
        [0, 1].forEach(function (w) { NS('line', { x1: X0 + w * LW, y1: y - 16, x2: X0 + w * LW, y2: y + 16, stroke: NAVY, 'stroke-width': 3.5 }, svg); txt(X0 + w * LW, y + 22 + 18 * K, String(w), NAVY, 20 * K); });
        for (var q = 1; q < n; q++) NS('line', { x1: X(r, q), y1: y - 11 * K, x2: X(r, q), y2: y + 11 * K, stroke: col, 'stroke-width': 2.5 }, svg);
        for (var i = 0; i < k; i++) { var xa = X(r, i), xb = X(r, i + 1), h = Math.min(30, (xb - xa) * 0.55); NS('path', { d: 'M' + (xa + 3) + ' ' + (y - 6) + ' Q ' + (xa + xb) / 2 + ' ' + (y - 6 - h * 1.6) + ' ' + (xb - 3) + ' ' + (y - 6), stroke: col, 'stroke-width': 2.5, fill: 'none', 'pointer-events': 'none' }, svg); }
        if (done) { NS('circle', { cx: X(r, k), cy: y, r: 10 * K, fill: OK, stroke: '#fff', 'stroke-width': 3 }, svg); fr(X(r, k), y + 14 + 16 * K, k, n, OK); return; }
        if (k) txt(X(r, k), y + 22 + 18 * K, k + ' jump' + (k > 1 ? 's' : ''), BAD, 14 * K);
        var hit = NS('rect', { x: X0 - 20, y: y - 30, width: LW + 40, height: 60, fill: 'transparent', class: 'nl-hit' }, svg);
        hit.addEventListener('click', function (e) { S.c[r] = snap(r, svgPt(svg, e).x); check(r); });
        var x = X(r, k), d = NS('g', { class: 'nl-dot', tabindex: 0, role: 'slider', 'aria-label': rows[r] + ' dot. ' + k + ' jumps from 0.' }, svg);
        NS('circle', { cx: x, cy: y, r: 22 * K, fill: 'transparent' }, d); NS('circle', { cx: x, cy: y, r: 11 * K, fill: BAD, stroke: '#fff', 'stroke-width': 3 }, d);
        drag(d, svg, function (pt) { var kk = snap(r, pt.x); S.c[r] = kk; d.setAttribute('transform', 'translate(' + (X(r, kk) - x) + ',0)'); }, function () { check(r); }, null);
        d.addEventListener('keydown', function (e) { var dd = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!dd) return; e.preventDefault(); S.c[r] = Math.max(0, Math.min(n, S.c[r] + dd)); check(r); var nd = $$('.nl-dot', svg)[0]; if (nd) nd.focus(); });
      });
      if (S.ok[0] && S.ok[1]) { var far = KK[0] / NN[0] > KK[1] / NN[1] ? 0 : 1, fx = X(far, KK[far]); NS('line', { x1: fx, y1: far ? Ys[0] + 14 : Ys[0] + 26 + 44 * K, x2: fx, y2: Ys[1] - 14, stroke: '#C9A227', 'stroke-width': 2, 'stroke-dasharray': '5 5', 'pointer-events': 'none' }, svg); }
    }
    function snap(r, x) { return Math.max(0, Math.min(NN[r], Math.round((x - X0) / LW * NN[r]))); }
    function check(r) { if (S.c[r] === KK[r]) { S.ok[r] = 1; pluck(98 / (KK[r] / NN[r])); } save(); draw(); report(r); }
    function report(r) {
      flag(box, 'top', !!S.ok[0]); if (S.ok[0]) flag(box, 'top'); flag(box, 'bot', !!S.ok[1]); if (S.ok[1]) flag(box, 'bot');
      if (S.ok[0] && S.ok[1] && KK[0] * NN[1] === KK[1] * NN[0]) { flag(box, 'dots'); msg('Both dots land on the same spot. ' + frac(KK[0], NN[0]) + ' and ' + frac(KK[1], NN[1]) + ' name the same amount.', true); return; }
      if (S.ok[0] && S.ok[1]) { var big = NN[0] < NN[1] ? 0 : 1; flag(box, 'dots'); msg('A one-' + DNAME[NN[big]] + ' jump is longer than a one-' + DNAME[NN[1 - big]] + ' jump. ' + KK[0] + ' long jumps go farther than ' + KK[0] + ' short jumps.', true); return; }
      var c = r == null ? -1 : r;
      if (c === 1 && box.dataset.same && !S.ok[1] && S.c[1]) { msg('The ' + rows[1].toLowerCase() + ' dot is <b>' + S.c[1] + '</b> jump' + (S.c[1] > 1 ? 's' : '') + ' from 0. It is not under the top dot yet.'); return; }
      if (c > -1 && !S.ok[c] && S.c[c]) { msg('The ' + rows[c].toLowerCase() + ' dot is <b>' + S.c[c] + '</b> jump' + (S.c[c] > 1 ? 's' : '') + ' from 0. That is not ' + frac(KK[c], NN[c]) + '.'); return; }
      msg(S.ok[0] ? 'The top dot is on ' + frac(KK[0], NN[0]) + '. ✓' : '');
    }
    onWidth(box, draw);
    draw(); report();
  };

  /* ── pipes: Pythagoras' pipes. Cut a pipe into equal pieces; blow one piece (3.09.04) ──
     data-mode pair (two same-length pipes: data-da, data-db, data-rows) · climb (one pipe: data-from, data-to; add a cut, blow each time)
     Flags pair: a · b · blow   ·  climb: climb */
  var PAC = null;
  function blowTone(freq) {
    var c = ac(); if (!c) return; var t = c.currentTime, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = freq; o2.type = 'sine'; o2.frequency.value = freq * 2; f.type = 'lowpass'; f.frequency.value = freq * 4;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.08); g.gain.setValueAtTime(0.45, t + 0.7); g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    var g2 = c.createGain(); g2.gain.value = 0.18; o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(VOL);
    // a little breath at the start
    var len = Math.floor(c.sampleRate * 0.25), nb = c.createBuffer(1, len, c.sampleRate), dd = nb.getChannelData(0); for (var i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.25;
    var ns = c.createBufferSource(), nf = c.createBiquadFilter(); ns.buffer = nb; nf.type = 'bandpass'; nf.frequency.value = freq * 2; ns.connect(nf); nf.connect(VOL);
    o.start(t); o2.start(t); ns.start(t); o.stop(t + 1.3); o2.stop(t + 1.3);
  }
  MODS.pipes = function (box) {
    var mode = box.dataset.mode || 'pair', name = box.dataset.name || 'pipes', F0 = 55, MAX = 12;
    var climb = mode === 'climb', from = +box.dataset.from || 9, to = +box.dataset.to || 12;
    var DD = [+box.dataset.da || 9, +box.dataset.db || 12], rows = (box.dataset.rows || (climb ? 'The pipe' : 'Top pipe,Bottom pipe')).split(',');
    var S = mstate(name, climb ? { n: [from], heard: {} } : { n: [1, 1], bl: [0, 0] }), R = climb ? [0] : [0, 1];
    box.innerHTML = '<div class="sb-stage sb-pipes">' + R.map(function (r) { return '<div class="pp-row" data-r="' + r + '"><div class="sb-row pp-ctl"><b class="pp-name">' + esc(rows[r]) + '</b><button type="button" class="sb-btn sm ghost pp-less" aria-label="One piece fewer">−</button><span class="pp-cnt" aria-live="polite"></span><button type="button" class="sb-btn sm pp-more">✂ Cut one more piece</button></div><svg viewBox="0 0 800 136" role="group" aria-label="' + esc(rows[r]) + '"></svg></div>'; }).join('') +
      (climb ? '<div class="pp-notes"><svg viewBox="0 0 800 190" role="img" aria-label="The notes you heard, from low to high"></svg></div>' : '') + '</div><div class="sb-readout" aria-live="polite"></div>';
    var out = $('.sb-readout', box), X0 = 40, LW = 720, Y = 46, H = 36, GAP = 6, K = 1;
    function fit() { K = Math.max(1, Math.min(2.2, 740 / (box.clientWidth || 800))); H = 36 * K; Y = 14 + 16 * K + H / 2; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    var still = function () { return reduced || document.documentElement.classList.contains('sb-still'); };
    function draw(r) {
      fit(); var wrap = $('.pp-row[data-r="' + r + '"]', box), svg = $('svg', wrap), n = S.n[r], pw = (LW - GAP * (n - 1)) / n;
      svg.setAttribute('viewBox', '0 0 800 ' + Math.round(Y + H / 2 + 14 + 54 * K));
      $('.pp-cnt', wrap).textContent = n === 1 ? '1 whole pipe' : n + ' equal pieces';
      $('.pp-less', wrap).disabled = n <= (climb ? from : 1); $('.pp-more', wrap).disabled = n >= (climb ? to : MAX);
      svg.innerHTML = '';
      var defs = NS('defs', {}, svg), gr = NS('linearGradient', { id: name + '-br' + r, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      NS('stop', { offset: '0', 'stop-color': '#E8C27A' }, gr); NS('stop', { offset: '.45', 'stop-color': '#C1923F' }, gr); NS('stop', { offset: '1', 'stop-color': '#8A5F22' }, gr);
      for (var i = 0; i < n; i++) (function (i) {
        var x = X0 + i * (pw + GAP), g = NS('g', { class: 'part pp-piece', tabindex: 0, role: 'button', 'aria-label': n === 1 ? 'Blow the whole pipe' : 'Blow piece ' + (i + 1) + ': one ' + DNAME[n] }, svg);
        NS('rect', { x: x, y: Y - H / 2, width: pw, height: H, rx: 6, fill: 'url(#' + name + '-br' + r + ')', stroke: '#5E3B10', 'stroke-width': 2 }, g);
        NS('ellipse', { cx: x + 5, cy: Y, rx: 3.5, ry: H / 2 - 4, fill: '#3A250A', opacity: .55 }, g);
        if (i === 0) NS('rect', { x: x + 3, y: Y - H / 2 + 3, width: pw - 6, height: H - 6, rx: 4, fill: 'none', stroke: '#FFF3C4', 'stroke-width': 2.5, 'pointer-events': 'none' }, g);
        function hit() { blow(r, g, x, pw); }
        g.addEventListener('click', hit); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(); } });
      })(i);
      // the label sits under the first piece, never on it
      var lx = X0 + (n === 1 ? LW / 2 : pw / 2);
      var B = Y + H / 2, f = 16 * K;
      if (n === 1) NS('text', { x: lx, y: B + 8 + f, 'text-anchor': 'middle', 'font-size': 17 * K, 'font-weight': 900, fill: '#0E1C42', text: '1 whole' }, svg);
      else { var c = DCOL[n] || '#0E1C42'; NS('path', { d: 'M' + X0 + ' ' + (B + 6) + ' v6 h' + pw + ' v-6', stroke: c, 'stroke-width': 2, fill: 'none' }, svg);
        NS('text', { x: lx, y: B + 14 + f, 'text-anchor': 'middle', 'font-size': f, 'font-weight': 900, fill: c, text: '1' }, svg); NS('line', { x1: lx - 9 * K, y1: B + 19 + f, x2: lx + 9 * K, y2: B + 19 + f, stroke: c, 'stroke-width': 2 }, svg); NS('text', { x: lx, y: B + 24 + 2 * f, 'text-anchor': 'middle', 'font-size': f, 'font-weight': 900, fill: c, text: String(n) }, svg); }
    }
    function blow(r, g, x, pw) {
      var n = S.n[r]; blowTone(F0 * n);
      if (!still()) { var svg = g.ownerSVGElement, p = NS('g', { 'pointer-events': 'none' }, svg); for (var k = 0; k < 3; k++) NS('path', { d: 'M' + (x + pw / 2 - 14 + k * 14) + ' ' + (Y - H / 2 - 4) + ' q -6 -9 0 -18', stroke: '#9FB4D8', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, p); g.classList.add('pp-on'); setTimeout(function () { p.remove(); g.classList.remove('pp-on'); }, 700); }
      if (climb) { S.heard[n] = 1; save(); notes(); report(); return; }
      if (n === DD[r]) S.bl[r] = 1; save(); report();
    }
    function notes() {
      var svg = $('.pp-notes svg', box); if (!svg) return; svg.innerHTML = ''; fit();
      var step = 26 * K, base = 44 + 4 * step, f = 15 * K; svg.setAttribute('viewBox', '0 0 800 ' + Math.round(base + 26 * K + 2 * f + 6));
      NS('text', { x: 20, y: 22 * K, 'font-size': 14 * K, 'font-weight': 800, fill: '#5B6478', text: 'Notes you heard' }, svg);
      NS('path', { d: 'M40 ' + base + ' V' + (base - 3 * step - 10) + ' m-7 10 l7 -10 l7 10', stroke: '#B8AE95', 'stroke-width': 2, fill: 'none' }, svg); NS('text', { x: 54, y: base - 3 * step, 'font-size': 13 * K, 'font-weight': 800, fill: '#8C8270', text: 'higher' }, svg);
      var pts = [];
      for (var n = from; n <= to; n++) { if (!S.heard[n]) continue; var i = n - from, x = 170 + i * 170, y = base - i * step, c = DCOL[n] || '#0E1C42'; pts.push([x, y]);
        NS('circle', { cx: x, cy: y, r: 10 * K, fill: c }, svg); NS('text', { x: x, y: y + 12 * K + f, 'text-anchor': 'middle', 'font-size': f, 'font-weight': 900, fill: c, text: '1' }, svg); NS('line', { x1: x - 8 * K, y1: y + 17 * K + f, x2: x + 8 * K, y2: y + 17 * K + f, stroke: c, 'stroke-width': 2 }, svg); NS('text', { x: x, y: y + 22 * K + 2 * f, 'text-anchor': 'middle', 'font-size': f, 'font-weight': 900, fill: c, text: String(n) }, svg); }
      for (var k = 1; k < pts.length; k++) if (pts[k][0] - pts[k - 1][0] < 180) NS('line', { x1: pts[k - 1][0] + 12 * K, y1: pts[k - 1][1] - 4, x2: pts[k][0] - 12 * K, y2: pts[k][1] + 4, stroke: '#C9A227', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, svg);
    }
    function report() {
      if (climb) {
        var all = true; for (var n = from; n <= to; n++) if (!S.heard[n]) all = false;
        if (all) { flag(box, 'climb'); msg('Every new cut made each piece shorter, and the note climbed higher. More equal pieces means smaller pieces: one-' + DNAME[to] + ' is the smallest.', true); return; }
        var miss = []; for (var m2 = from; m2 < S.n[0]; m2++) if (!S.heard[m2]) miss.push(m2);
        msg(!S.heard[S.n[0]] ? 'The pipe is cut into ' + S.n[0] + ' equal pieces. Tap the first piece to hear one-' + DNAME[S.n[0]] + '.' :
          miss.length ? 'You skipped one-' + DNAME[miss[0]] + '. Press − until the pipe has ' + miss[0] + ' pieces, then tap the first piece.' :
          'You heard one-' + DNAME[S.n[0]] + '. ' + (S.n[0] < to ? 'Now press ✂ Cut one more piece.' : ''));
        return;
      }
      var ok = [S.n[0] === DD[0], S.n[1] === DD[1]];
      flag(box, 'a', ok[0]); if (ok[0]) flag(box, 'a'); flag(box, 'b', ok[1]); if (ok[1]) flag(box, 'b');
      if (ok[0] && ok[1] && S.bl[0] && S.bl[1]) { var big = DD[0] < DD[1] ? 0 : 1; flag(box, 'blow'); msg('The one-' + DNAME[DD[1 - big]] + ' piece is shorter, so it whistles higher. The one-' + DNAME[DD[big]] + ' piece is longer.', true); return; }
      flag(box, 'blow', false);
      var r = !ok[0] ? 0 : !ok[1] ? 1 : -1;
      if (r < 0) { msg(S.bl[0] || S.bl[1] ? 'You blew one piece.' : 'Both pipes are cut.', true); return; }
      var n = S.n[r], w = DD[r];
      msg(rows[r] + ': ' + (n === 1 ? 'not cut yet.' : '<b>' + n + '</b> equal pieces. ' + (n > w ? 'That is too many.' : 'Not enough yet.')));
    }
    R.forEach(function (r) {
      var wrap = $('.pp-row[data-r="' + r + '"]', box);
      $('.pp-more', wrap).onclick = function () { if (S.n[r] >= (climb ? to : MAX)) return; S.n[r]++; if (!climb) S.bl[r] = 0; save(); draw(r); report(); };
      $('.pp-less', wrap).onclick = function () { if (S.n[r] <= (climb ? from : 1)) return; S.n[r]--; if (!climb) S.bl[r] = 0; save(); draw(r); report(); };
      draw(r);
    });
    if (climb) notes(); report();
    onWidth(box, function () { R.forEach(draw); notes(); });
  };

  /* ═══ Unit 10 (Bach's measures): tiles that sound for their length ═══
     A measure is 1 whole. Every tile plays a bowed-string tone that lasts exactly as long as the tile is long.
     beat (3.10.01 Think) · fixstrip · group · split · measure                                                  */
  var MEAS = 3.2;   // seconds for one whole measure
  function bowTone(freq, dur, when, vol) {
    var c = ac(); if (!c) return; var t = c.currentTime + (when || 0), o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth'; o.frequency.value = freq; o2.type = 'triangle'; o2.frequency.value = freq * 1.003; f.type = 'lowpass'; f.frequency.value = Math.min(4000, freq * 3.2);
    var v = vol || 0.22, end = t + Math.max(0.08, dur - 0.04);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.03); g.gain.setValueAtTime(v * 0.85, end - 0.02); g.gain.linearRampToValueAtTime(0, end + 0.05);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(VOL); o.start(t); o2.start(t); o.stop(end + 0.08); o2.stop(end + 0.08);
  }
  var HZ = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880 };
  // one tile, drawn like the Math Tools fraction tiles (white label on a shaded tile)
  function ftile(p, x, y, w, h, dd, on, cls) {
    var g = NS('g', { class: cls || 'tile' }, p), f = w >= 44 ? 15 : 12, c = on ? '#fff' : '#0E1C42';
    NS('rect', { x: x + 1, y: y, width: Math.max(2, w - 2), height: h, rx: 6, fill: on ? DCOL[dd] : '#fff', stroke: DCOL[dd], 'stroke-width': 2 }, g);
    if (w >= 22) { var lg = NS('g', { 'pointer-events': 'none' }, g); NS('text', { x: x + w / 2, y: y + h / 2 - 4, 'text-anchor': 'middle', 'font-size': f, 'font-weight': 900, fill: c, text: '1' }, lg); NS('line', { x1: x + w / 2 - 8, y1: y + h / 2 + 1, x2: x + w / 2 + 8, y2: y + h / 2 + 1, stroke: c, 'stroke-width': 2 }, lg); NS('text', { x: x + w / 2, y: y + h / 2 + 4 + f, 'text-anchor': 'middle', 'font-size': f, 'font-weight': 900, fill: c, text: String(dd) }, lg); }
    return g;
  }
  function wholeBar(svg, x, y, w, h, label) { NS('rect', { x: x + 1, y: y, width: w - 2, height: h, rx: 6, fill: '#0E1C42' }, svg); NS('text', { x: x + w / 2, y: y + h / 2 + 7, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 900, fill: '#fff', text: label || '1 whole', 'pointer-events': 'none' }, svg); }
  function playhead(svg, x0, w, y0, y1, secs) {
    var ln = NS('line', { x1: x0, y1: y0, x2: x0, y2: y1, stroke: '#C9A227', 'stroke-width': 4, 'pointer-events': 'none' }, svg), t0 = performance.now();
    (function step() { var p = (performance.now() - t0) / 1000 / secs; if (p >= 1 || !ln.isConnected) { ln.remove(); return; } ln.setAttribute('x1', x0 + p * w); ln.setAttribute('x2', x0 + p * w); requestAnimationFrame(step); })();
  }

  /* beat: two players share one measure. data-a = top row (comma list of denominators, e.g. "3,3"), data-d = tray tile.
     Flags: build (bottom row ends on the same beat as the top row), play (pressed Play with both rows ending together) */
  MODS.beat = function (box) {
    var A = box.dataset.a.split(',').map(Number), d = +box.dataset.d, name = box.dataset.name || 'beat', S = mstate(name, { n: 0, played: 0 });
    var aLen = A.reduce(function (s, t) { return s + 1 / t; }, 0), need = Math.round(aLen * d), BW = 680, LX = 10, RH = 46, Y0 = 8, YA = Y0 + RH + 34, YB = YA + RH + 34, TY = YB + RH + 50;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 ' + (TY + RH + 10) + '" role="group" aria-label="One measure shared by two players"></svg></div><div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn bt-play">▶ Play both rows</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), pb = $('.bt-play', box), busy = false;
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function draw() {
      svg.innerHTML = ''; wholeBar(svg, LX, Y0, BW, RH, '1 whole measure');
      NS('text', { x: LX, y: YA - 8, 'font-size': 14, 'font-weight': 900, fill: '#5B6478', text: 'TOP PLAYER' }, svg);
      var x = LX; A.forEach(function (t) { ftile(svg, x, YA, BW / t, RH, t, true, 'tile bt-a'); x += BW / t; });
      NS('text', { x: LX, y: YB - 8, 'font-size': 14, 'font-weight': 900, fill: '#5B6478', text: 'BOTTOM PLAYER · tap a tile to take it away' }, svg);
      NS('rect', { x: LX, y: YB, width: BW, height: RH, rx: 6, fill: '#F6F7FB', stroke: '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
      NS('line', { x1: LX + aLen * BW, y1: YA - 4, x2: LX + aLen * BW, y2: YB + RH + 4, stroke: '#C9A227', 'stroke-width': 2, 'stroke-dasharray': '5 5', 'pointer-events': 'none' }, svg);
      x = LX;
      for (var i = 0; i < S.n; i++) { (function () { var t = ftile(svg, x, YB, BW / d, RH, d, true, 'tile bt-b'); t.setAttribute('tabindex', 0); t.setAttribute('role', 'button'); t.setAttribute('aria-label', 'Take away a one-' + DNAME[d] + ' tile'); function rm() { S.n = Math.max(0, S.n - 1); S.played = 0; save(); draw(); } t.addEventListener('click', rm); t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rm(); } }); })(); x += BW / d; }
      NS('text', { x: LX, y: TY - 10, 'font-size': 13, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag or tap to add a one-' + DNAME[d] + ' tile' }, svg);
      var tr = ftile(svg, LX, TY, BW / d, RH, d, false, 'tile bt-tray'); tr.setAttribute('tabindex', 0); tr.setAttribute('role', 'button'); tr.setAttribute('aria-label', 'Add a one-' + DNAME[d] + ' tile');
      var ghost = null;
      drag(tr, svg, function (pt) { if (!ghost) { ghost = ftile(svg, 0, 0, BW / d, RH, d, true); ghost.setAttribute('opacity', .8); ghost.style.pointerEvents = 'none'; } ghost.setAttribute('transform', 'translate(' + (pt.x - BW / d / 2) + ',' + (pt.y - RH / 2) + ')'); },
        function (pt) { if (ghost) ghost.remove(); ghost = null; if (pt && pt.y > YB - 30 && pt.y < YB + RH + 30) add(); }, add);
      tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(); } });
      report();
    }
    function add() { if (S.n >= d) { msg('The row is as long as 1 whole measure. It can\'t hold more.'); return; } S.n++; S.played = 0; save(); pluck(HZ.G4); draw(); }
    function report() {
      var ok = S.n === need; flag(box, 'build', ok); if (ok) flag(box, 'build');
      if (S.played && ok) { flag(box, 'play'); msg('Both rows ended on the same beat. The bottom row has <b>' + S.n + '</b> one-' + DNAME[d] + ' tiles.', true); return; }
      if (!S.n) msg('The bottom row is empty.');
      else if (S.n < need) msg('Bottom row: <b>' + S.n + '</b> one-' + DNAME[d] + ' tile' + (S.n > 1 ? 's' : '') + '. It ends before the gold line.');
      else if (S.n > need) msg('Bottom row: <b>' + S.n + '</b> tiles. It ends after the gold line. Take some away.');
      else msg('Bottom row: <b>' + S.n + '</b> one-' + DNAME[d] + ' tiles. It ends right on the gold line. Press ▶ Play both rows to hear it.', true);
    }
    pb.addEventListener('click', function () {
      if (busy) return; busy = true; musicDuck(); var x = 0;
      A.forEach(function (t, i) { bowTone(i % 2 ? HZ.D5 : HZ.G4, MEAS / t, x); x += MEAS / t; });
      for (var i = 0; i < S.n; i++) bowTone(i % 2 ? HZ.B4 : HZ.D4, MEAS / d, i * MEAS / d, 0.16);
      playhead(svg, LX, BW, YA - 6, YB + RH + 6, MEAS);
      setTimeout(function () { busy = false; S.played = 1; save(); report(); if (S.n !== need) msg(S.n < need ? 'The bottom player stopped first. Add more tiles.' : 'The bottom player kept going after the top player stopped. Take some tiles away.'); }, MEAS * 1000 + 150);
    });
    document.addEventListener('sb:step', report); draw();
  };

  /* fixstrip: two strips should show the same amount, but the bottom one is the wrong length and cut unevenly.
     data-ta / data-da (top: shaded / parts), data-tb / data-db (bottom). Flags: whole (stretched to 1 whole), equal (re-cut evenly) */
  MODS.fixstrip = function (box) {
    var ta = +box.dataset.ta, da = +box.dataset.da, tb = +box.dataset.tb, db = +box.dataset.db, name = box.dataset.name || 'fixstrip', S = mstate(name, { whole: 0, equal: 0 });
    var BW = 680, LX = 10, RH = 46, Y0 = 8, YA = Y0 + RH + 34, YB = YA + RH + 40, SHORT = 0.78;
    // uneven cut points (fractions of the bar) for the "before" strip
    var UNEVEN = [0.07, 0.19, 0.27, 0.41, 0.5, 0.58, 0.71, 0.83, 0.9].slice(0, db - 1);
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 ' + (YB + RH + 40) + '" role="group" aria-label="Two strips to compare"></svg></div><div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn fx-cut">✂ Re-cut into ' + db + ' equal parts</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), cut = $('.fx-cut', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function strip(y, len, cuts, shaded, dd) {
      var pts = [0].concat(cuts, [1]);
      for (var i = 0; i + 1 < pts.length; i++) { var x = LX + pts[i] * len, w = (pts[i + 1] - pts[i]) * len; NS('rect', { x: x + 1, y: y, width: Math.max(2, w - 2), height: RH, rx: 5, fill: i < shaded ? DCOL[dd] : '#fff', stroke: DCOL[dd], 'stroke-width': 2, 'pointer-events': 'none' }, svg); }
    }
    function draw() {
      svg.innerHTML = ''; wholeBar(svg, LX, Y0, BW, RH);
      NS('line', { x1: LX + BW, y1: Y0, x2: LX + BW, y2: YB + RH + 12, stroke: '#0E1C42', 'stroke-width': 2, 'stroke-dasharray': '6 5', 'pointer-events': 'none' }, svg);
      NS('text', { x: LX, y: YA - 8, 'font-size': 14, 'font-weight': 900, fill: DCOL[da], text: ta + ' of ' + da + ' equal parts' }, svg);
      var ec = []; for (var q = 1; q < da; q++) ec.push(q / da); strip(YA, BW, ec, ta, da);
      var len = S.whole ? BW : BW * SHORT, cuts = []; if (S.equal) for (q = 1; q < db; q++) cuts.push(q / db); else cuts = UNEVEN;
      NS('text', { x: LX, y: YB - 8, 'font-size': 14, 'font-weight': 900, fill: DCOL[db], text: tb + ' of ' + db + ' parts' + (S.equal ? ' (equal)' : ' (not equal!)') }, svg);
      strip(YB, len, cuts, tb, db);
      if (!S.whole) {
        var h = NS('g', { class: 'fx-end', tabindex: 0, role: 'button', 'aria-label': 'Stretch the bottom strip to 1 whole' }, svg);
        NS('rect', { x: LX + len - 10, y: YB - 8, width: 22, height: RH + 16, rx: 6, fill: '#C9A227', stroke: '#6B4A12', 'stroke-width': 2 }, h);
        NS('text', { x: LX + len + 1, y: YB + RH / 2 + 6, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: '#3A2A12', text: '↔', 'pointer-events': 'none' }, h);
        var stretch = function () { S.whole = 1; save(); pluck(HZ.G4); draw(); };
        drag(h, svg, function (pt) { h.setAttribute('transform', 'translate(' + Math.max(0, Math.min(BW - len, pt.x - (LX + len))) + ',0)'); }, function (pt) { if (pt && pt.x > LX + BW - 40) stretch(); else draw(); }, stretch);
        h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stretch(); } });
      }
      if (S.whole && S.equal) { var gx = LX + ta / da * BW; NS('line', { x1: gx, y1: YA - 4, x2: gx, y2: YB + RH + 4, stroke: '#C9A227', 'stroke-width': 3, 'stroke-dasharray': '5 5', 'pointer-events': 'none' }, svg); }
      cut.disabled = !S.whole || !!S.equal;
      report();
    }
    cut.addEventListener('click', function () { if (!S.whole) { msg('First make the bottom strip 1 whole: drag its gold end to the dashed line.'); return; } S.equal = 1; save(); pluck(HZ.D5); draw(); });
    function report() {
      flag(box, 'whole', !!S.whole); if (S.whole) flag(box, 'whole'); flag(box, 'equal', !!S.equal); if (S.equal) flag(box, 'equal');
      if (S.whole && S.equal) msg('Same whole, equal parts. Now the shaded parts end at the same place.', true);
      else if (S.whole) msg('Now the strip is 1 whole long. But its parts are still not equal.');
      else msg('The bottom strip is <b>shorter</b> than 1 whole, and its parts are <b>not equal</b>.');
    }
    document.addEventListener('sb:step', report); draw();
  };

  /* group: a strip of tenths (data-d) with some shaded (data-sh). Tap cut marks to make them thick group lines.
     data-size = parts per group. Flag: group (thick lines exactly every data-size parts) */
  MODS.group = function (box) {
    var d = +box.dataset.d, sh = +box.dataset.sh, k = +box.dataset.size, name = box.dataset.name || 'group', S = mstate(name, { g: [] });
    var BW = 680, LX = 10, RH = 56, Y0 = 8, YS = Y0 + RH + 40, big = d / k;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 ' + (YS + RH + 70) + '" role="group" aria-label="A strip in ' + DNAME[d] + 's. Tap the lines to group the parts."></svg></div><div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn ghost gp-clear">↺ Clear my lines</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function good() { if (S.g.length !== big - 1) return false; for (var q = 1; q < big; q++) if (S.g.indexOf(q * k) < 0) return false; return true; }
    function draw() {
      svg.innerHTML = ''; wholeBar(svg, LX, Y0, BW, 46);
      var w = BW / d, ok = good();
      for (var i = 0; i < d; i++) { var on = i < sh; NS('rect', { x: LX + i * w + 1, y: YS, width: w - 2, height: RH, rx: 4, fill: on ? DCOL[d] : '#fff', stroke: DCOL[d], 'stroke-width': 2, 'pointer-events': 'none' }, svg); }
      for (var q = 1; q < d; q++) { (function (q) {
        var x = LX + q * w, thick = S.g.indexOf(q) > -1, gl = NS('g', { class: 'gp-line', tabindex: 0, role: 'button', 'aria-pressed': thick, 'aria-label': 'Line after part ' + q + (thick ? ', group line' : '') }, svg);
        NS('rect', { x: x - 12, y: YS - 16, width: 24, height: RH + 32, fill: 'transparent' }, gl);
        NS('line', { x1: x, y1: YS - (thick ? 12 : 0), x2: x, y2: YS + RH + (thick ? 12 : 0), stroke: thick ? '#0E1C42' : 'transparent', 'stroke-width': thick ? 7 : 0, 'stroke-linecap': 'round' }, gl);
        if (!thick) NS('circle', { cx: x, cy: YS - 12, r: 5, fill: '#C9A227' }, gl);
        function tog() { var j = S.g.indexOf(q); if (j > -1) S.g.splice(j, 1); else S.g.push(q); save(); pluck(thick ? HZ.D4 : HZ.G4); draw(); }
        gl.addEventListener('click', tog); gl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
      })(q); }
      if (ok) for (var b = 0; b < big; b++) { var cx = LX + (b + .5) * BW / big, c = b < sh / k ? '#1E7A4C' : '#5B6478'; NS('text', { x: cx, y: YS + RH + 30, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: c, text: '1', 'pointer-events': 'none' }, svg); NS('line', { x1: cx - 9, y1: YS + RH + 35, x2: cx + 9, y2: YS + RH + 35, stroke: c, 'stroke-width': 2 }, svg); NS('text', { x: cx, y: YS + RH + 54, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: c, text: String(big), 'pointer-events': 'none' }, svg); }
      report();
    }
    $('.gp-clear', box).addEventListener('click', function () { S.g = []; save(); draw(); });
    function report() {
      var ok = good(); flag(box, 'group', ok); if (ok) flag(box, 'group');
      if (ok) { msg('Every group holds ' + k + ' ' + DNAME[d] + 's. Now there are <b>' + big + '</b> bigger equal parts.', true); return; }
      var gs = S.g.slice().sort(function (a, b) { return a - b; }), last = 0, bad = false; gs.concat([d]).forEach(function (p) { if (p - last !== k) bad = true; last = p; });
      if (!S.g.length) msg('No group lines yet.');
      else if (bad) msg('The groups are not the same size. Each group must hold <b>' + k + '</b> ' + DNAME[d] + 's.');
      else msg('Keep going.');
    }
    document.addEventListener('sb:step', report); draw();
  };

  /* split: a strip of data-d parts with data-sh shaded. Buttons split every piece in 2 or 3. Flag: split (split in data-by) */
  MODS.split = function (box) {
    var d = +box.dataset.d, sh = +box.dataset.sh, by = +box.dataset.by || 2, name = box.dataset.name || 'split', S = mstate(name, { m: 1 });
    var BW = 680, LX = 10, RH = 56, Y0 = 8, YS = Y0 + RH + 30;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 ' + (YS + RH + 14) + '" role="group" aria-label="A strip to split"></svg></div><div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn sp-2">✂ Split every piece in 2</button><button type="button" class="sb-btn sp-3">✂ Split every piece in 3</button><button type="button" class="sb-btn ghost sp-0">↺ Start over</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function draw() {
      svg.innerHTML = ''; wholeBar(svg, LX, Y0, BW, 46);
      var n = d * S.m, w = BW / n, on = sh * S.m, col = DCOL[n] || DCOL[d];
      for (var i = 0; i < n; i++) NS('rect', { x: LX + i * w + 1, y: YS, width: w - 2, height: RH, rx: 4, fill: i < on ? col : '#fff', stroke: col, 'stroke-width': 2, 'pointer-events': 'none' }, svg);
      for (var j = 1; j < d; j++) NS('line', { x1: LX + j * BW / d, y1: YS - 6, x2: LX + j * BW / d, y2: YS + RH + 6, stroke: '#0E1C42', 'stroke-width': S.m > 1 ? 3 : 0, 'pointer-events': 'none' }, svg);
      $('.sp-2', box).disabled = $('.sp-3', box).disabled = S.m > 1;
      report();
    }
    function cut(m) { S.m = m; save(); pluck(HZ.D5); draw(); }
    $('.sp-2', box).addEventListener('click', function () { cut(2); }); $('.sp-3', box).addEventListener('click', function () { cut(3); }); $('.sp-0', box).addEventListener('click', function () { cut(1); });
    function report() {
      var n = d * S.m, ok = S.m === by; flag(box, 'split', ok); if (ok) flag(box, 'split');
      if (S.m === 1) msg('<b>' + sh + '</b> of <b>' + d + '</b> equal parts are shaded.');
      else if (ok) msg('Every piece is split in ' + by + '. Now there are <b>' + n + '</b> equal parts. The shaded part is the same length as before.', true);
      else msg('Every piece is split in ' + S.m + '. That makes ' + n + ' equal parts. Press ↺ Start over and split every piece in ' + by + '.');
    }
    document.addEventListener('sb:step', report); draw();
  };

  /* measure: fill one measure with half, quarter and eighth notes (tiles), then play it over the start of
     Bach's Prelude in C (BWV 846), made in the page. Flags: full (exactly 1 whole), play (played a full measure) */
  MODS.measure = function (box) {
    var TR = [2, 4, 8], NOTE = { 2: 'half note', 4: 'quarter note', 8: 'eighth note' }, name = box.dataset.name || 'measure', S = mstate(name, { bt: [], played: 0 });
    var BW = 680, LX = 10, RH = 46, Y0 = 8, YB = Y0 + RH + 34, TY = YB + RH + 54;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 ' + (TY + RH + 34) + '" role="group" aria-label="Fill one measure of music"></svg></div><div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn ms-play">▶ Play my measure with Bach</button><button type="button" class="sb-btn ghost ms-clear">↺ Empty the measure</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), busy = false;
    function sum() { return S.bt.reduce(function (s, t) { return s + 1 / t; }, 0); }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function draw() {
      svg.innerHTML = ''; wholeBar(svg, LX, Y0, BW, RH, '1 whole measure');
      NS('text', { x: LX, y: YB - 8, 'font-size': 14, 'font-weight': 900, fill: '#5B6478', text: 'MY MEASURE · tap a tile to take it away' }, svg);
      NS('rect', { x: LX, y: YB, width: BW, height: RH, rx: 6, fill: '#F6F7FB', stroke: '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
      var x = LX; S.bt.forEach(function (t, i) { var g = ftile(svg, x, YB, BW / t, RH, t, true, 'tile ms-t'); g.dataset.i = i; g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Take away this ' + NOTE[t]); function rm() { S.bt.splice(i, 1); S.played = 0; save(); draw(); } g.addEventListener('click', rm); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rm(); } }); x += BW / t; });
      NS('text', { x: LX, y: TY - 10, 'font-size': 13, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag or tap a note tile to add it' }, svg);
      var tx = LX;
      TR.forEach(function (t) {
        var w = BW / t, g = ftile(svg, tx, TY, w, RH, t, false, 'tile ms-tray'); g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Add a ' + NOTE[t] + ', one-' + DNAME[t] + ' of the measure');
        NS('text', { x: tx + w / 2, y: TY + RH + 20, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#3A2A12', text: NOTE[t], 'pointer-events': 'none' }, svg);
        var ghost = null;
        drag(g, svg, function (pt) { if (!ghost) { ghost = ftile(svg, 0, 0, w, RH, t, true); ghost.setAttribute('opacity', .8); ghost.style.pointerEvents = 'none'; } ghost.setAttribute('transform', 'translate(' + (pt.x - w / 2) + ',' + (pt.y - RH / 2) + ')'); },
          function (pt) { if (ghost) ghost.remove(); ghost = null; if (pt && pt.y > YB - 30 && pt.y < YB + RH + 30) add(t); }, function () { add(t); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(t); } });
        tx += w + 12;
      });
      report();
    }
    function add(t) { if (sum() + 1 / t > 1 + 1e-9) { msg('That note won\'t fit. The measure is only 1 whole long.'); return; } S.bt.push(t); S.played = 0; save(); bowTone(HZ.G4, MEAS / t * 0.5, 0, 0.14); draw(); }
    $('.ms-clear', box).addEventListener('click', function () { S.bt = []; S.played = 0; save(); draw(); });
    // two measures of the Prelude in C: C major, then D minor over C (sixteenth notes)
    var BACH = [['C4', 'E4', 'G4', 'C5', 'E5', 'G4', 'C5', 'E5'], ['C4', 'D4', 'A4', 'D5', 'F5', 'A4', 'D5', 'F5']], MEL = [['E5', 'G5', 'C5', 'E5', 'G5', 'C5', 'E5', 'G5'], ['F5', 'A5', 'D5', 'F5', 'A5', 'D5', 'F5', 'A5']];
    $('.ms-play', box).addEventListener('click', function () {
      if (busy) return; if (Math.abs(sum() - 1) > 1e-9) { msg('Fill the measure first. It must be exactly 1 whole.'); return; }
      busy = true; musicDuck(); var M = 2.4;
      for (var m = 0; m < 2; m++) {
        for (var s = 0; s < 16; s++) pluck(HZ[BACH[m][s % 8]], m * M + s * M / 16);
        var x = 0; S.bt.forEach(function (t, i) { bowTone(HZ[MEL[m][i % 8]], M / t, m * M + x, 0.2); x += M / t; });
      }
      playhead(svg, LX, BW, YB - 6, YB + RH + 6, M); setTimeout(function () { playhead(svg, LX, BW, YB - 6, YB + RH + 6, M); }, M * 1000);
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, 2 * M * 1000 + 150);
    });
    function report() {
      var s = sum(), full = Math.abs(s - 1) < 1e-9; flag(box, 'full', full); if (full) flag(box, 'full');
      if (full && S.played) { flag(box, 'play'); var c = {}; S.bt.forEach(function (t) { c[t] = (c[t] || 0) + 1; }); msg('Your measure: ' + Object.keys(c).map(function (t) { return c[t] + ' ' + NOTE[t] + (c[t] > 1 ? 's' : ''); }).join(', ') + '. It fills exactly 1 whole.' + (Object.keys(c).length < 2 ? ' Tip: for Problem 2, empty the measure and mix two kinds of notes.' : ''), true); return; }
      if (!S.bt.length) msg('The measure is empty.');
      else if (full) msg('The measure is full: exactly 1 whole. Press ▶ Play my measure with Bach.', true);
      else msg('The measure is not full yet.');
    }
    document.addEventListener('sb:step', report); draw();
  };

  /* stack (3.10.02 Think): one measure cut several ways. data-d "4,8,12" (row denominators), data-k (shaded in the first row, fixed).
     Tap a tile in a lower row to shade up to it. Flags: r1, r2 … (row i shaded to the gold line) */
  MODS.stack = function (box) {
    var D = box.dataset.d.split(',').map(Number), k = +box.dataset.k, name = box.dataset.name || 'stack', S = mstate(name, { k: D.map(function (d, i) { return i ? 0 : k; }) });
    S.k[0] = k; var BW = 680, LX = 10, RH = 46, Y0 = 8, GAP = 34, gx = LX + BW * k / D[0];
    var YS = D.map(function (d, i) { return Y0 + RH + GAP + i * (RH + GAP); }), H = YS[YS.length - 1] + RH + 12;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 ' + H + '" role="group" aria-label="One measure cut ' + D.length + ' ways"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function can(i) { return (k * D[i]) % D[0] === 0; }
    function good(i) { return can(i) ? S.k[i] * D[0] === k * D[i] : S.k[i] > 0; }
    function draw() {
      svg.innerHTML = ''; wholeBar(svg, LX, Y0, BW, RH, '1 whole measure');
      D.forEach(function (d, r) {
        var y = YS[r], w = BW / d;
        NS('text', { x: LX, y: y - 9, 'font-size': 13, 'font-weight': 900, fill: '#5B6478', text: DPL(d).toUpperCase() + (r ? ' · tap a tile to shade up to it' : ' · already shaded'), 'pointer-events': 'none' }, svg);
        for (var i = 0; i < d; i++) (function (i) {
          var g = ftile(svg, LX + i * w, y, w, RH, d, i < S.k[r], 'tile part st-r' + r);
          if (!r) return;
          g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', DPL(d) + ' row, tile ' + (i + 1) + (i < S.k[r] ? ', shaded' : ''));
          function set() { S.k[r] = S.k[r] === i + 1 ? i : i + 1; save(); pluck(HZ.G4); draw(); }
          g.addEventListener('click', set); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } });
        })(i);
      });
      YS.forEach(function (y) { NS('line', { x1: gx, y1: y - 4, x2: gx, y2: y + RH + 4, stroke: '#C9A227', 'stroke-width': 3, 'stroke-dasharray': '5 5', 'pointer-events': 'none' }, svg); });
      report();
    }
    function report() {
      var all = true;
      D.forEach(function (d, r) { if (!r) return; var ok = good(r); flag(box, 'r' + r, ok); if (ok) flag(box, 'r' + r); else all = false; });
      var bad = D.map(function (d, r) { return r && S.k[r] && can(r) && !good(r) ? r : 0; }).filter(Boolean)[0];
      var tried = D.map(function (d, r) { return r && S.k[r] && !can(r) ? r : 0; }).filter(Boolean);
      var no = tried.map(function (r) { var lo = Math.floor(k * D[r] / D[0]), nm = DNAME[D[r]]; var pl = DPL(D[r]); return (lo ? lo + ' ' + (lo > 1 ? pl + ' stop' : nm + ' stops') + ' before the gold line and ' : '') + (lo + 1) + ' ' + (lo + 1 > 1 ? pl + ' go' : nm + ' goes') + ' past it. ' + pl.charAt(0).toUpperCase() + pl.slice(1) + ' can\'t show this amount.'; }).join(' ');
      if (all && tried.length) msg(no + ' The other ' + (D.length - 1 - tried.length > 1 ? 'rows line' : 'row lines') + ' up right on the gold line.', true);
      else if (all) msg('Every row is shaded right up to the gold line. Same amount, three names.', true);
      else if (no && !bad) msg(no + ' Try the next row.');
      else if (bad) msg('The ' + DNAME[D[bad]] + 's row stops ' + (S.k[bad] * D[0] < k * D[bad] ? 'before' : 'after') + ' the gold line.');
      else msg('Shade each row up to the gold line.');
    }
    document.addEventListener('sb:step', report); draw();
  };

  /* arrows (3.10.02): curved ×n arrows from a/b to a new fraction. Drag a tag (×2 … ×5) onto the top or bottom arrow (or tap a tag).
     data-a, data-b, data-by (the right tag), data-c (show this new denominator), data-first "bot" (a tap fills the bottom arrow first),
     data-who (a student's wrong pair, e.g. "1,3": ×1 on top, ×3 on the bottom, shown first). Flags: top · bot */
  MODS.arrows = function (box) {
    var a = +box.dataset.a, b = +box.dataset.b, by = +box.dataset.by, c = box.dataset.c, name = box.dataset.name || 'arrows', first = box.dataset.first || 'top';
    var S = mstate(name, { t: 0, u: 0 }), TAGS = [2, 3, 4, 5], dv = box.dataset.op === 'div', OP = dv ? '÷' : '×';
    function arc(down) { return '<svg class="ar-arc' + (down ? ' dn' : '') + '" viewBox="0 0 160 40" aria-hidden="true"><path d="' + (down ? 'M8 4 Q80 44 150 6' : 'M8 36 Q80 -4 150 34') + '" fill="none" stroke="#0E1C42" stroke-width="3"/><path d="' + (down ? 'M150 6 l-12 2 l6 9 z' : 'M150 34 l-12 -2 l6 -9 z') + '" fill="#0E1C42"/></svg>'; }
    box.innerHTML = '<div class="sb-stage sb-arrows"><div class="ar-grid">' +
      '<div class="ar-f">' + frac(a, b) + '</div>' +
      '<div class="ar-mid"><div class="ar-slot top" data-k="t" aria-label="The arrow over the numerators"></div>' + arc(0) + '<div class="ar-eq">=</div>' + arc(1) + '<div class="ar-slot bot" data-k="u" aria-label="The arrow under the denominators"></div></div>' +
      '<div class="ar-f new">' + frac('?', c || '?') + '</div></div>' +
      '<div class="sym-cards ar-cards" role="group" aria-label="Tags to drag">' + TAGS.map(function (t) { return '<button type="button" class="sym-card ar-card" data-t="' + t + '" aria-label="' + (dv ? 'divided by ' : 'times ') + t + '">' + OP + t + '</button>'; }).join('') + '</div></div><div class="sb-readout" aria-live="polite"></div>';
    var out = $('.sb-readout', box), slots = { t: $('.ar-slot.top', box), u: $('.ar-slot.bot', box) };
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function paint() {
      ['t', 'u'].forEach(function (k) { var v = S[k], s = slots[k], ok = v === by; s.className = 'ar-slot ' + (k === 't' ? 'top' : 'bot') + (v ? ' full ' + (ok ? 'ok' : 'no') : ''); s.innerHTML = v ? '<span>' + OP + v + '</span>' : '<small>drop here</small>'; });
      var t = S.t, u = S.u; flag(box, 'top', t === by); if (t === by) flag(box, 'top'); flag(box, 'bot', u === by); if (u === by) flag(box, 'bot');
      if (dv) {
        if (t && u && t !== u) msg('÷' + t + ' on the numerator but ÷' + u + ' on the denominator. Different numbers change the amount. Use the same tag on both arrows.');
        else if (t === by && u === by) msg('÷' + by + ' on the numerator and ÷' + by + ' on the denominator. Every ' + by + ' parts group into 1 bigger part. Same amount, simpler name.', true);
        else if ((t && a % t) || (u && b % u)) { var z = t && a % t ? [t, a] : [u, b]; msg(z[1] + ' can\'t be split into groups of ' + z[0] + ' with none left over. Try another tag.'); }
        else if (c && u && b / u !== +c) msg(b + ' ÷ ' + u + ' = ' + (b / u) + ', not ' + c + '. Try another tag.');
        else if (t && u) msg('÷' + t + ' on both arrows makes an equal fraction, but not the one this job asks for. Try another tag.');
        else if (t || u) msg('Now put the same tag on the other arrow.');
        else msg('Both arrows are empty.');
        return;
      }
      if (t && u && t !== u) msg('×' + t + ' on the numerator but ×' + u + ' on the denominator. Different numbers change the amount. Use the same tag on both arrows.');
      else if (t === by && u === by) msg('×' + by + ' on the numerator and ×' + by + ' on the denominator. Every part is split into ' + by + '. Same amount, new name.', true);
      else if (c && u && u * b !== +c) msg(b + ' × ' + u + ' = ' + (b * u) + ', not ' + c + '. Try another tag.');
      else if (t && u) msg('×' + t + ' on both arrows makes an equivalent fraction, but not the one this job asks for. Try another tag.');
      else if (t || u) msg('Now put the same tag on the other arrow.');
      else msg('Both arrows are empty.');
    }
    function put(k, v) { S[k] = v; save(); pluck(v === by ? HZ.D5 : HZ.D4); paint(); }
    $$('.ar-card', box).forEach(function (card) {
      var v = +card.dataset.t;
      hdrag(card, function (t) { var s = t && t.closest && t.closest('.ar-slot'); if (s && box.contains(s)) put(s.dataset.k, v); },
        function () { var o = first === 'bot' ? ['u', 't'] : ['t', 'u'], k = !S[o[0]] ? o[0] : !S[o[1]] ? o[1] : o[0]; put(k, v); });
    });
    ['t', 'u'].forEach(function (k) { slots[k].setAttribute('tabindex', 0); slots[k].setAttribute('role', 'button'); slots[k].addEventListener('click', function () { if (S[k]) { S[k] = 0; save(); paint(); } }); });
    document.addEventListener('sb:step', paint); paint();
  };

  /* ttwin (3.10.02 wow): the times-table window. Two rows of the times table (data-a row on top, data-b row below), data-cols columns.
     Tap a column (or drag the gold window) to move the window there; every column it lands on is kept as a new name for a/b.
     A number line shows each name landing on the same spot. ▶ Play: each name is one measure over the opening bass of Bach's Aria.
     Flags: names (data-need names kept, the start column does not count), play */
  MODS.ttwin = function (box) {
    var a = +box.dataset.a, b = +box.dataset.b, N0 = +box.dataset.cols || 10, need = +box.dataset.need || 3, name = box.dataset.name || 'ttwin', S = mstate(name, { c: 1, kept: [], played: 0 });
    var N, LX, CW, VW, Y0 = 34, RH = 44, NLY = Y0 + 2 * RH + 96, H = NLY + 74;
    // narrow screens: fewer, bigger columns (the row labels sit above the table)
    function layout() { var narrow = (box.clientWidth || 700) < 560; N = narrow ? 6 : N0; VW = narrow ? 420 : 700; LX = narrow ? 64 : 150; CW = narrow ? 58 : 54; S.c = Math.min(S.c, N); }
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 ' + H + '" role="group" aria-label="Two rows of the times table, with a gold window around one column"></svg></div><div class="tt-kept" aria-live="polite"></div><div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn tt-play">▶ Play my names with Bach</button><button type="button" class="sb-btn ghost tt-clear">↺ Start over</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), kp = $('.tt-kept', box), busy = false;
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function cx(c) { return LX + (c - 0.5) * CW; }
    function move(c, keep) { c = Math.max(1, Math.min(N, c)); S.c = c; if (keep && c > 1 && S.kept.indexOf(c) < 0) { S.kept.push(c); S.played = 0; bowTone(HZ.G4, 0.25, 0, 0.12); } save(); draw(); }
    function draw() {
      layout(); svg.innerHTML = ''; svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + H); var narrow = VW < 700;
      NS('text', { x: LX - 10, y: Y0 - 12, 'text-anchor': 'end', 'font-size': 13, 'font-weight': 900, fill: '#5B6478', text: 'times', 'pointer-events': 'none' }, svg);
      [[a, 'numerator row', 'tops'], [b, 'denominator row', 'bottoms']].forEach(function (rw, r) {
        var y = Y0 + r * RH;
        NS('text', { x: LX - 10, y: y + 20, 'text-anchor': 'end', 'font-size': 15, 'font-weight': 900, fill: r ? DCOL[b] || '#1F2A44' : '#B03A2E', text: rw[0] + ' ×', 'pointer-events': 'none' }, svg);
        NS('text', { x: LX - 10, y: y + 36, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 800, fill: '#5B6478', text: narrow ? rw[2] : rw[1], 'pointer-events': 'none' }, svg);
      });
      for (var c = 1; c <= N; c++) (function (c) {
        var x = cx(c), kept = S.kept.indexOf(c) > -1 || c === 1, g = NS('g', { class: 'tt-col', tabindex: 0, role: 'button', 'aria-label': 'Column times ' + c + ': ' + (a * c) + ' over ' + (b * c) }, svg);
        NS('rect', { x: x - CW / 2 + 2, y: Y0 - 28, width: CW - 4, height: 2 * RH + 32, rx: 8, fill: kept ? '#FFF6D8' : '#F6F7FB', stroke: '#DDE2EE', 'stroke-width': 1.5 }, g);
        NS('text', { x: x, y: Y0 - 10, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 900, fill: '#5B6478', text: '×' + c }, g);
        NS('text', { x: x, y: Y0 + 26, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 900, fill: '#B03A2E', text: String(a * c) }, g);
        NS('line', { x1: x - 14, y1: Y0 + RH - 2, x2: x + 14, y2: Y0 + RH - 2, stroke: '#0E1C42', 'stroke-width': 2 }, g);
        NS('text', { x: x, y: Y0 + RH + 26, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 900, fill: DCOL[b] || '#1F2A44', text: String(b * c) }, g);
        g.addEventListener('click', function () { move(c, true); }); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); move(c, true); } });
      })(c);
      var w = NS('g', { class: 'tt-win', tabindex: 0, role: 'slider', 'aria-label': 'The gold window', 'aria-valuemin': 1, 'aria-valuemax': N, 'aria-valuenow': S.c }, svg);
      NS('rect', { x: cx(S.c) - CW / 2, y: Y0 - 30, width: CW, height: 2 * RH + 36, rx: 10, fill: 'transparent', stroke: '#C9A227', 'stroke-width': 5 }, w);
      NS('rect', { x: cx(S.c) - 18, y: Y0 + 2 * RH + 8, width: 36, height: 18, rx: 6, fill: '#C9A227' }, w);
      NS('text', { x: cx(S.c), y: Y0 + 2 * RH + 22, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 900, fill: '#3A2A12', text: '↔', 'pointer-events': 'none' }, w);
      drag(w, svg, function (pt) { w.setAttribute('transform', 'translate(' + Math.max(LX - cx(S.c) + CW / 2, Math.min(LX + N * CW - cx(S.c) - CW / 2, pt.x - cx(S.c))) + ',0)'); }, function (pt) { if (pt) move(Math.round((pt.x - LX) / CW + 0.5), true); else draw(); });
      w.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); move(S.c + 1, true); } if (e.key === 'ArrowLeft') { e.preventDefault(); move(S.c - 1, false); } });
      // number line: 0 to 1, ticks for the window's denominator, a dot on a/b
      var n = b * S.c, NX = narrow ? 30 : 50, NW = VW - 2 * NX, px = NX + NW * a / b;
      NS('line', { x1: NX, y1: NLY, x2: NX + NW, y2: NLY, stroke: '#1F2A44', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
      for (var q = 0; q <= n; q++) { var tx = NX + q * NW / n, big = q === 0 || q === n; NS('line', { x1: tx, y1: NLY - (big ? 13 : 8), x2: tx, y2: NLY + (big ? 13 : 8), stroke: big ? '#1F2A44' : DCOL[n] || '#5B6478', 'stroke-width': big ? 3 : 2 }, svg); }
      NS('text', { x: NX, y: NLY + 34, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: '#1F2A44', text: '0' }, svg);
      NS('text', { x: NX + NW, y: NLY + 34, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: '#1F2A44', text: '1' }, svg);
      NS('circle', { cx: px, cy: NLY, r: 9, fill: '#1E7A4C', stroke: '#fff', 'stroke-width': 3 }, svg);
      NS('text', { x: px, y: NLY + 30, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 900, fill: '#1E7A4C', text: String(a * S.c) }, svg);
      NS('line', { x1: px - 10, y1: NLY + 36, x2: px + 10, y2: NLY + 36, stroke: '#1E7A4C', 'stroke-width': 2 }, svg);
      NS('text', { x: px, y: NLY + 54, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 900, fill: '#1E7A4C', text: String(n) }, svg);
      NS('text', { x: NX - (narrow ? 20 : 40), y: NLY - 18, 'font-size': 12, 'font-weight': 800, fill: '#5B6478', text: 'NUMBER LINE · ' + n + ' equal jumps', 'pointer-events': 'none' }, svg);
      report();
    }
    function report() {
      kp.innerHTML = '<b>My names:</b> ' + frac(a, b) + S.kept.map(function (c) { return ' = ' + frac(a * c, b * c); }).join('') + (S.kept.length < need ? ' <span class="tt-left">(' + (need - S.kept.length) + ' more to find)</span>' : '');
      var ok = S.kept.length >= need; flag(box, 'names', ok); if (ok) flag(box, 'names');
      if (ok && S.played) { flag(box, 'play'); msg('Every name ended on the same beat, and every dot landed on the same spot.', true); return; }
      if (ok) msg('You found ' + S.kept.length + ' new names. Press ▶ Play my names with Bach.', true);
      else msg('The window is on the ×' + S.c + ' column: ' + frac(a * S.c, b * S.c) + '. Every column is a new name for ' + frac(a, b) + '.');
    }
    // the opening bass of Bach's Aria (Goldberg Variations): G, F sharp, E, D
    var BASS = [196.0, 185.0, 164.81, 146.83], TUNE = [392.0, 493.88, 587.33, 783.99, 587.33, 493.88];
    $('.tt-play', box).addEventListener('click', function () {
      if (busy) return; if (S.kept.length < need) { msg('Find ' + need + ' new names first.'); return; }
      busy = true; musicDuck(); var M = 2.6, list = [1].concat(S.kept.slice(0, 3));
      list.forEach(function (c, m) {
        var k = a * c, n = b * c; bowTone(BASS[m % 4], M * 0.96, m * M, 0.18);
        for (var i = 0; i < k; i++) bowTone(TUNE[i % TUNE.length], M / n, m * M + i * M / n, 0.15);
        setTimeout(function () { S.c = c; draw(); }, m * M * 1000);
      });
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, list.length * M * 1000 + 150);
    });
    $('.tt-clear', box).addEventListener('click', function () { S.c = 1; S.kept = []; S.played = 0; save(); draw(); });
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };


  /* trade (3.10.03 wow): one measure of small shaded tiles (data-d, data-k of them; the rest of the measure is a rest).
     Drag a bigger tile from the tray onto the measure (or tap it): if every shaded tile groups evenly into that size, the whole
     row trades at once and the old row is kept above as a step of the staircase. ▶ Play: every row, one measure each, every tile
     a note as long as it is wide. data-sizes "8,4,2,1" (tray). Flags: t<size> (reached that size), whole (one tile fills the
     measure), simple (no bigger tray tile fits any more), play (played after the last trade) */
  MODS.trade = function (box) {
    var d = +box.dataset.d, k = +box.dataset.k, P = box.dataset.pre || '', name = box.dataset.name || 'trade', SZ = (box.dataset.sizes || '8,4,2,1').split(',').map(Number);
    var S = mstate(name, { rows: [d], played: 0 }), BW = 680, VW = 700, LX = 10, RH = 46, Y0 = 8, GAP = 22, busy = false;
    // narrow screens: a narrower drawing so the small tiles stay big enough to read
    function layout() { var nar = (box.clientWidth || 700) < 560; VW = nar ? 420 : 700; BW = VW - 20; }
    function cur() { return S.rows[S.rows.length - 1]; }
    function cnt(sz) { return k * sz / d; }
    function nm(sz, n) { return sz === 1 ? (n === 1 ? '1 whole' : n + ' wholes') : n + ' ' + (n === 1 ? DNAME[sz] : DPL(sz)); }
    function fits(sz) { var c = cur(); return sz < c && Number.isInteger(cnt(sz)) && Number.isInteger((d - k) * sz / d); }
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg role="group" aria-label="One measure of tiles to trade for bigger tiles"></svg></div><div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn tr-play">▶ Play every row</button><button type="button" class="sb-btn ghost tr-clear">↺ Start over</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function rowY(i) { return Y0 + RH + GAP + 14 + i * (RH + GAP); }
    function draw() {
      layout(); var nR = S.rows.length, MY = rowY(nR - 1), TY = MY + RH + 58, H = TY + RH + 34;
      svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + H); svg.innerHTML = '';
      wholeBar(svg, LX, Y0, BW, RH, '1 whole measure');
      S.rows.forEach(function (sz, i) {
        var y = rowY(i), w = BW / sz, n = cnt(sz), last = i === nR - 1, rest = (d - k) * sz / d;
        NS('text', { x: LX, y: y - 6, 'font-size': 13, 'font-weight': 900, fill: last ? '#0E1C42' : '#8A93A8', text: (last ? 'THE MEASURE NOW · ' : '') + nm(sz, n) + (k < d ? ' played' : ''), 'pointer-events': 'none' }, svg);
        var g = NS('g', { opacity: last ? 1 : 0.55, class: last ? 'tr-row' : '' }, svg);
        for (var j = 0; j < n; j++) { if (sz === 1) { NS('rect', { x: LX + 1, y: y, width: BW - 2, height: RH, rx: 6, fill: '#0E1C42' }, g); NS('text', { x: LX + BW / 2, y: y + RH / 2 + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 900, fill: '#fff', text: '1 whole note', 'pointer-events': 'none' }, g); } else ftile(g, LX + j * w, y, w, RH, sz, true, 'tile'); }
        for (var q = 0; q < rest; q++) { var x = LX + (n + q) * w; NS('rect', { x: x + 1, y: y, width: w - 2, height: RH, rx: 6, fill: '#F6F7FB', stroke: '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g); NS('text', { x: x + w / 2, y: y + RH / 2 + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#8A93A8', text: 'rest', 'pointer-events': 'none' }, g); }
      });
      NS('text', { x: LX, y: TY - 10, 'font-size': 13, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag a bigger tile onto the measure', 'pointer-events': 'none' }, svg);
      var tx = LX, tw = Math.min(150, (BW - 12 * (SZ.length - 1)) / SZ.length);
      SZ.forEach(function (sz) {
        var w = Math.min(BW / sz, tw), g = ftile(svg, tx, TY, w, RH, sz, false, 'tile tr-tray'); g.dataset.t = sz;
        g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Trade for ' + (sz === 1 ? 'the 1 whole tile' : DNAME[sz] + ' tiles'));
        if (sz === 1) { var lab = $$('text', g); lab.forEach(function (t) { t.remove(); }); $$('line', g).forEach(function (t) { t.remove(); }); NS('text', { x: tx + w / 2, y: TY + RH / 2 + 6, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 900, fill: '#0E1C42', text: '1 whole', 'pointer-events': 'none' }, g); }
        var ghost = null, y0 = MY;
        drag(g, svg, function (pt) { if (!ghost) { ghost = ftile(svg, 0, 0, w, RH, sz, true); ghost.setAttribute('opacity', .8); ghost.style.pointerEvents = 'none'; } ghost.setAttribute('transform', 'translate(' + (pt.x - w / 2) + ',' + (pt.y - RH / 2) + ')'); },
          function (pt) { if (ghost) ghost.remove(); ghost = null; if (pt && pt.y > y0 - 40 && pt.y < y0 + RH + 40) trade(sz); else if (pt) msg('Drop the tile on the measure.'); }, function () { trade(sz); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trade(sz); } });
        tx += w + 12;
      });
      report();
    }
    function trade(sz) {
      if (busy) return; var c = cur(), n = cnt(c);
      if (sz >= c) { msg('That tile is not bigger than the ' + DPL(c) + ' in the measure.'); pluck(HZ.D4); return; }
      if (!fits(sz)) { var g = c / sz; msg('The ' + n + ' ' + DPL(c) + ' can\'t all go into groups of ' + g + '. ' + (n % g ? (n % g) + ' would be left over' : 'The rest wouldn\'t fit') + ', so ' + (sz === 1 ? 'the 1 whole tile' : DNAME[sz] + ' tiles') + ' won\'t fit.'); S.tried = sz; save(); pluck(HZ.D4); return; }
      S.rows.push(sz); S.played = 0; save(); bowTone(HZ.G4, 0.5, 0, 0.14); draw();
    }
    // the hymn line in long notes, the quick line in short notes (a made-up tune; every row ends on the same beat)
    var TUNE = [392.0, 440.0, 493.88, 523.25, 587.33, 523.25, 493.88, 440.0];
    $('.tr-play', box).addEventListener('click', function () {
      if (busy) return; busy = true; musicDuck(); var M = 2.4;
      S.rows.forEach(function (sz, m) {
        var n = cnt(sz); bowTone(130.81, M * 0.97, m * M, 0.12);
        for (var i = 0; i < n; i++) bowTone(TUNE[(i * 16 / sz) % 8 | 0], M / sz, m * M + i * M / sz, 0.17);
        setTimeout(function () { var y = rowY(m); playhead(svg, LX, BW, y - 4, y + RH + 4, M); }, m * M * 1000);
      });
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, S.rows.length * M * 1000 + 150);
    });
    $('.tr-clear', box).addEventListener('click', function () { S.rows = [d]; S.played = 0; S.tried = 0; save(); draw(); });
    onWidth(box, draw);
    function report() {
      var c = cur(), n = cnt(c), stuck = !SZ.some(fits);
      SZ.forEach(function (sz) { if (S.rows.indexOf(sz) > -1) flag(box, P + 't' + sz); });
      if (S.rows.length > 1) flag(box, P + 'traded'); if (c === 1) flag(box, P + 'whole'); if (stuck) flag(box, P + 'simple'); if (stuck && S.played) flag(box, P + 'play');
      if (c === 1 && k === d) msg('One tile fills the whole measure: ' + d + ' ' + DNAME[d] + 's = 1 whole. Fewer notes, longer notes.' + (S.played ? '' : ' Press ▶ Play every row.'), true);
      else if (stuck) msg('Now the measure has ' + nm(c, n) + '. No bigger tile fits: ' + n + ' ' + (n === 1 ? DNAME[c] : DPL(c)) + ' can\'t all go into equal groups. That is the simplest form.' + (S.played ? '' : ' Press ▶ Play every row.'), true);
      else if (S.rows.length > 1) msg('Traded! Now the measure has ' + nm(c, n) + '. Same length as before, fewer tiles.', true);
      else msg('The measure has ' + n + ' ' + DNAME[d] + 's' + (k < d ? ' played and a rest' : '') + '.');
    }
    document.addEventListener('sb:step', report); draw();
  };

  /* ── recut: two tile bars with different denominators (one measure, two parts). Cut every piece of one bar
     into n (✂ buttons) to make a common denominator, then count. data-da, data-ka, data-db, data-kb (shaded),
     data-rows "Right hand,Left hand", data-cut "a"|"b" (the bar the buttons cut), data-by (the right cut),
     data-opts "2,3,4" (one button each), data-play "1" (▶ Play both parts: two held notes; after the right cut,
     every shaded piece is its own short note). Flags: cut · heard (played before cutting) · heard2 (after) ── */
  MODS.recut = function (box) {
    var DD = [+box.dataset.da, +box.dataset.db], KK = [+box.dataset.ka, +box.dataset.kb], ci = box.dataset.cut === 'b' ? 1 : 0;
    var by = +box.dataset.by || 2, opts = (box.dataset.opts || '2,3').split(',').map(Number), name = box.dataset.name || 'recut', play = box.dataset.play === '1';
    var rows = (box.dataset.rows || 'Top bar,Bottom bar').split(','), S = mstate(name, { m: 1, h: 0, h2: 0 });
    var BW = 680, LX = 10, RH = 50, Y0 = 6, YS = [86, 172], NAVY = '#0E1C42', busy = false, narrow = false;
    function fit() { narrow = (box.clientWidth || 800) < 560; RH = narrow ? 84 : 50; YS = narrow ? [Y0 + 46 + 44, Y0 + 46 + 44 + 84 + 48] : [Y0 + 46 + 34, Y0 + 46 + 34 + 50 + 36]; svg.setAttribute('viewBox', '0 0 700 ' + (YS[1] + RH + 10)); }
    function nm(n) { return DNAME[n] ? DPL(n) : n + ' equal parts'; }
    var cn = DNAME[DD[ci]] || ('1/' + DD[ci]);
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 260" role="group" aria-label="One measure, two parts: ' + rows[0] + ' in ' + nm(DD[0]) + ' and ' + rows[1] + ' in ' + nm(DD[1]) + '"></svg></div>' +
      '<div class="sb-row" style="margin-top:6px">' + (play ? '<button type="button" class="sb-btn rc-play">▶ Play both parts</button>' : '') +
      '<span class="rc-cuts" style="display:inline-flex;flex-wrap:wrap;gap:inherit">' + opts.map(function (o) { return '<button type="button" class="sb-btn rc-cut" data-m="' + o + '">✂ Cut each ' + cn + ' into ' + o + '</button>'; }).join('') + '</span>' +
      '<button type="button" class="sb-btn ghost rc-0">↺ Start over</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function nOf(r) { return r === ci ? DD[r] * S.m : DD[r]; }
    function kOf(r) { return r === ci ? KK[r] * S.m : KK[r]; }
    function draw() {
      fit(); svg.innerHTML = ''; wholeBar(svg, LX, Y0, BW, 46, '1 whole measure');
      [0, 1].forEach(function (r) {
        var n = nOf(r), k = kOf(r), y = YS[r], w = BW / n, col = DCOL[n] || DCOL[DD[r]];
        NS('text', { x: LX, y: y - 10, 'font-size': narrow ? 24 : 13, 'font-weight': 900, fill: '#5B6478', text: rows[r].toUpperCase(), 'pointer-events': 'none' }, svg);
        var g = NS('g', { class: 'rc-row', 'aria-label': rows[r] + ': ' + k + ' of ' + n + ' equal parts shaded' }, svg);
        for (var i = 0; i < n; i++) { var t = ftile(g, LX + i * w, y, w, RH, n, i < k, 'tile'); if (!DCOL[n]) [].forEach.call(t.querySelectorAll('rect'), function (q) { q.setAttribute('stroke', col); if (i < k) q.setAttribute('fill', col); }); if (narrow && n > 10 && t.querySelector('g')) t.querySelector('g').remove(); }
        if (r === ci && S.m > 1) for (var j = 1; j < DD[r]; j++) NS('line', { x1: LX + j * BW / DD[r], y1: y - 6, x2: LX + j * BW / DD[r], y2: y + RH + 6, stroke: NAVY, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
        var ex = LX + BW * k / n; NS('line', { x1: ex, y1: y - 4, x2: ex, y2: y + RH + 4, stroke: '#C9A227', 'stroke-width': 3, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
      });
      $$('.rc-cut', box).forEach(function (b) { b.disabled = S.m > 1; });
      report();
    }
    function cut(m) { S.m = m; save(); pluck(HZ.D5); draw(); }
    $$('.rc-cut', box).forEach(function (b) { b.addEventListener('click', function () { cut(+b.dataset.m); }); });
    $('.rc-0', box).addEventListener('click', function () { cut(1); });
    if (play) $('.rc-play', box).addEventListener('click', function () {
      if (busy) return; busy = true; musicDuck(); var M = MEAS, ok = S.m === by, F = [HZ.E5, HZ.C4];
      [0, 1].forEach(function (r) {
        var n = nOf(r), k = kOf(r);
        if (ok) for (var i = 0; i < k; i++) pluck(F[r], i * M / n);
        else bowTone(F[r], M * k / n, 0, 0.18);
      });
      playhead(svg, LX, BW, YS[0] - 6, YS[1] + RH + 6, M);
      setTimeout(function () { busy = false; if (ok) S.h2 = 1; else S.h = 1; save(); report(); }, M * 1000 + 200);
    });
    function report() {
      var ok = S.m === by, n = [nOf(0), nOf(1)];
      flag(box, 'cut', ok); if (ok) flag(box, 'cut');
      if (S.h) flag(box, 'heard'); if (S.h2 && ok) flag(box, 'heard2');
      if (S.m === 1) { msg(S.h && play ? 'Which note kept ringing after the other one stopped?' : 'The pieces are different sizes: ' + nm(DD[0]) + ' and ' + nm(DD[1]) + '. Counting them would not be fair yet.'); return; }
      if (ok) { msg('Every ' + cn + ' is cut into ' + by + '. Now both parts are cut into ' + nm(n[0]) + '. The shaded parts did not change.' + (S.h2 ? ' Each tap was one piece.' : ''), true); return; }
      msg('Now the ' + rows[ci].toLowerCase() + ' bar has ' + n[ci] + ' equal parts, but the ' + rows[1 - ci].toLowerCase() + ' bar has ' + n[1 - ci] + '. The pieces still don\'t match.');
    }
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };

  /* ── bench: cups as tile bars (data-fr "2/9,5/7,9/10", data-rows "Cup A,Cup B,Cup C"); buttons show the halfway
     line (½) and the missing pieces. data-btns "half,gap". Flags: half · gap ── */
  MODS.bench = function (box) {
    var FR = box.dataset.fr.split(',').map(function (s) { var p = s.split('/'); return [+p[0], +p[1]]; }), rows = (box.dataset.rows || '').split(','), name = box.dataset.name || 'bench';
    var btns = (box.dataset.btns || 'half,gap').split(','), S = mstate(name, { half: 0, gap: 0 });
    var BW = 680, LX = 10, RH = 46, GAPY = 40, narrow = false, NAVY = '#0E1C42', RED = '#B23A2E';
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 200" role="group" aria-label="' + FR.length + ' cups of coffee as fraction tiles"></svg></div>' +
      '<div class="sb-row" style="margin-top:6px">' + (btns.indexOf('half') > -1 ? '<button type="button" class="sb-btn bn-half">½ Show the halfway line</button>' : '') +
      (btns.indexOf('gap') > -1 ? '<button type="button" class="sb-btn bn-gap">Show the missing pieces</button>' : '') + '</div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function nm(k, d) { return k + ' ' + (k === 1 ? DNAME[d] : DPL(d)); }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; RH = narrow ? 76 : 46; GAPY = narrow ? 70 : 44;
      var Y0 = 8, H = Y0 + FR.length * (RH + GAPY) + 30; svg.setAttribute('viewBox', '0 0 700 ' + H); svg.innerHTML = '';
      FR.forEach(function (f, r) {
        var k = f[0], d = f[1], y = Y0 + r * (RH + GAPY) + GAPY - 8, w = BW / d;
        NS('text', { x: LX, y: y - 10, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: (rows[r] || '').toUpperCase(), 'pointer-events': 'none' }, svg);
        var g = NS('g', { 'aria-label': (rows[r] || 'Cup') + ': ' + nm(k, d) + ' full' }, svg);
        for (var i = 0; i < d; i++) { var t = ftile(g, LX + i * w, y, w, RH, d, i < k, 'tile'); if (narrow && d > 10 && t.querySelector('g')) t.querySelector('g').remove(); }
        if (S.gap && k < d) {
          NS('rect', { x: LX + k * w - 1, y: y - 5, width: (d - k) * w + 2, height: RH + 10, rx: 8, fill: 'none', stroke: RED, 'stroke-width': 3, 'stroke-dasharray': '7 5', 'pointer-events': 'none' }, svg);
          NS('text', { x: LX + BW, y: y - 10, 'text-anchor': 'end', 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: RED, text: 'missing ' + nm(d - k, d), 'pointer-events': 'none' }, svg);
        }
      });
      if (S.half) { var hx = LX + BW / 2; NS('line', { x1: hx, y1: 4, x2: hx, y2: H - 22, stroke: '#C9A227', 'stroke-width': 1.5, 'pointer-events': 'none' }, svg);
        FR.forEach(function (f, r) { var y = Y0 + r * (RH + GAPY) + GAPY - 8; NS('line', { x1: hx, y1: y - GAPY + 14, x2: hx, y2: y - 2, stroke: '#C9A227', 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); NS('line', { x1: hx, y1: y + RH + 2, x2: hx, y2: y + RH + 14, stroke: '#C9A227', 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); });
        NS('text', { x: hx, y: H - 4, 'text-anchor': 'middle', 'font-size': narrow ? 24 : 16, 'font-weight': 900, fill: '#8A6A00', text: 'one-half', 'pointer-events': 'none' }, svg); }
      var hb = $('.bn-half', box), gb = $('.bn-gap', box); if (hb) hb.disabled = !!S.half; if (gb) gb.disabled = !!S.gap;
      report();
    }
    function report() {
      if (S.half) flag(box, 'half'); if (S.gap) flag(box, 'gap');
      msg(S.half && S.gap ? 'The gold line is halfway. The red boxes show what each cup is missing.' : S.half ? 'The gold line is the halfway point of every cup.' : S.gap ? 'The red boxes show what each cup is missing.' : 'Each cup is one whole.', S.half || S.gap);
    }
    var hb = $('.bn-half', box), gb = $('.bn-gap', box);
    if (hb) hb.addEventListener('click', function () { S.half = 1; save(); pluck(HZ.G4); draw(); });
    if (gb) gb.addEventListener('click', function () { S.gap = 1; save(); pluck(HZ.E4); draw(); });
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };

  /* ── halfsort: drag fraction cards (data-cards "1/6,5/9,…") to the left of one-half (less) or the right (more);
     a wrong drop says why and the card goes back. Then Play: every cup, least to greatest, as a held note.
     Flags: sorted · play ── */
  MODS.halfsort = function (box) {
    var C = box.dataset.cards.split(','), name = box.dataset.name || 'halfsort', S = mstate(name, { z: {}, played: 0 }), busy = false, sel = null;
    function val(c) { var p = c.split('/'); return p[0] / p[1]; }
    function words(c) { var p = c.split('/'); return p[0] + ' ' + (+p[0] === 1 ? DNAME[+p[1]] : DPL(+p[1])); }
    function half(d) { return d % 2 ? (d - 1) / 2 + ' and a half' : String(d / 2); }
    function mini(c) { var p = c.split('/'), k = +p[0], d = +p[1], w = 96 / d, s = '<svg viewBox="0 0 100 18" width="100" height="18" aria-hidden="true" style="display:block;margin:4px auto 0">'; for (var i = 0; i < d; i++) s += '<rect x="' + (2 + i * w) + '" y="2" width="' + (w - 1) + '" height="14" rx="2" fill="' + (i < k ? DCOL[d] : '#fff') + '" stroke="' + DCOL[d] + '" stroke-width="1.2"/>'; return s + '<line x1="50" y1="0" x2="50" y2="18" stroke="#C9A227" stroke-width="2" stroke-dasharray="3 2"/></svg>'; }
    var zs = 'flex:1 1 45%;min-height:120px;border:3px dashed #AEB6CC;border-radius:16px;padding:10px;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start;justify-content:center;background:#F6F7FB';
    box.innerHTML = '<div class="sb-stage" style="padding:12px"><div style="position:relative;height:46px;border-radius:8px;background:#0E1C42;color:#fff;font-weight:900;display:flex;align-items:center;justify-content:flex-start;padding-left:18px">1 whole cup<span style="position:absolute;left:50%;top:-6px;bottom:-6px;border-left:4px dashed #C9A227"></span></div>' +
      '<div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap"><div class="hs-zone" data-z="lo" style="' + zs + '" role="group" aria-label="Less than one-half"><b class="hs-zl" style="flex:1 1 100%;text-align:center;color:#5B6478">Less than one-half</b></div>' +
      '<div class="hs-zone" data-z="hi" style="' + zs + '" role="group" aria-label="More than one-half"><b class="hs-zl" style="flex:1 1 100%;text-align:center;color:#5B6478">More than one-half</b></div></div>' +
      '<div class="hs-tray" role="group" aria-label="Cups to sort" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:12px;min-height:20px"></div></div>' +
      '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn hs-play">▶ Play the cups</button><button type="button" class="sb-btn ghost hs-0">↺ Start over</button></div><div class="sb-readout" aria-live="polite"></div>';
    var tray = $('.hs-tray', box), out = $('.sb-readout', box), Z = { lo: $('.hs-zone[data-z="lo"]', box), hi: $('.hs-zone[data-z="hi"]', box) };
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function want(c) { return val(c) < 0.5 ? 'lo' : 'hi'; }
    function put(c, z) {
      if (want(c) !== z) { var p = c.split('/'); pluck(HZ.D4); sel = null; draw(); msg('Not that side. Half of ' + p[1] + ' is ' + half(+p[1]) + '. ' + p[0] + ' is ' + (z === 'lo' ? 'more' : 'less') + ' than that, so ' + words(c) + ' goes on the ' + (z === 'lo' ? 'right' : 'left') + '.'); return; }
      S.z[c] = z; save(); pluck(z === 'lo' ? HZ.E4 : HZ.A4); sel = null; draw(true);
    }
    function draw(said) {
      $$('.ord-card', box).forEach(function (n) { n.remove(); });
      C.forEach(function (c) {
        var b = el('button', 'ord-card hs-card', '<span style="font-size:22px">' + fracHTML(c) + '</span>' + mini(c)); b.type = 'button'; b.dataset.c = c; b.setAttribute('aria-label', words(c)); b.style.padding = '6px 8px';
        if (sel === c) b.style.outline = '4px solid #C9A227';
        (S.z[c] ? Z[S.z[c]] : tray).appendChild(b);
        if (S.z[c]) { b.disabled = true; b.style.cursor = 'default'; b.style.borderColor = '#1E7A4C'; return; }
        hdrag(b, function (t) { var z = t && t.closest && t.closest('.hs-zone'); if (z && box.contains(z)) put(c, z.dataset.z); }, function () { sel = sel === c ? null : c; draw(); });
      });
      report(said);
    }
    [Z.lo, Z.hi].forEach(function (z) { z.addEventListener('click', function (e) { if (sel && !e.target.closest('.hs-card')) put(sel, z.dataset.z); }); });
    $('.hs-0', box).addEventListener('click', function () { S.z = {}; S.played = 0; sel = null; save(); draw(); });
    $('.hs-play', box).addEventListener('click', function () {
      if (busy) return; if (Object.keys(S.z).length < C.length) { msg('Sort every cup first.'); return; }
      busy = true; musicDuck(); var order = C.slice().sort(function (a, b) { return val(a) - val(b); }), t = 0, F = [HZ.C4, HZ.D4, HZ.E4, HZ.G4, HZ.A4, HZ.C5, HZ.D5, HZ.E5];
      order.forEach(function (c, i) { var dur = 2.4 * val(c); bowTone(F[i % F.length], dur, t, 0.18); t += dur + 0.15; });
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, t * 1000 + 200);
    });
    function report(said) {
      var n = Object.keys(S.z).length, all = n === C.length;
      flag(box, 'sorted', all); if (all) flag(box, 'sorted');
      if (all && S.played) { flag(box, 'play'); msg('Least to greatest: every note was a little longer than the one before.', true); return; }
      if (all) { msg('Every cup is sorted.', true); return; }
      if (said) { msg('Yes! ' + n + ' of ' + C.length + ' cups sorted.', true); return; }
      if (!n && !sel) msg(''); else if (sel) msg('You picked ' + words(sel) + '. Which side does it go on?');
    }
    document.addEventListener('sb:step', function () { report(); }); draw();
  };

  /* ── addsub (3.10.06): one bar of same-size tiles. data-d (denominator), data-ops "+5,+9,-3" (or "cut,-4"),
     data-start (tiles already there), data-label (the whole bar's label), data-what ("notes"). Each op is a part:
     add tiles from the tray (drag or tap), take tiles away (tap a tile; it turns into a dashed outline with an ✕),
     or ✂ cut 1 whole into equal tiles. Flags: f1, f2, … (that part is done) ── */
  MODS.addsub = function (box) {
    var d = +box.dataset.d, OPS = box.dataset.ops.split(','), name = box.dataset.name || 'addsub', st0 = +box.dataset.start || 0, lab = box.dataset.label || '1 whole';
    var S = mstate(name, { n: null, x: {} }); if (!S.n) { S.n = []; for (var q = 0; q < st0; q++) S.n.push(-1); }
    var hasAdd = OPS.some(function (o) { return o[0] === '+'; }), hasCut = OPS.indexOf('cut') > -1;
    var BW = 680, LX = 10, RH = 52, Y0 = 8, BY = 0, TY = 0, narrow = false, PH = ['#C9A227', '#B23A2E', '#6B46C1'];
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 220" role="group" aria-label="Fraction tiles in ' + DPL(d) + '"></svg></div>' +
      (hasCut ? '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn as-cut">✂ Cut 1 whole into ' + DPL(d) + '</button></div>' : '') + '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), cutB = $('.as-cut', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function nm(k) { return k + ' ' + (k === 1 ? DNAME[d] : DPL(d)); }
    function cur() { for (var i = 0; i < OPS.length; i++) if (!stepDoneFor(box, 'f' + (i + 1))) return i; return OPS.length; }
    function want(i) { return OPS[i] === 'cut' ? d : Math.abs(+OPS[i]); }
    function got(i) { if (OPS[i] === 'cut') return S.n.length; if (OPS[i][0] === '+') return S.n.filter(function (p) { return p === i; }).length; var c = 0; for (var k in S.x) if (S.x[k] === i) c++; return c + ((S.cx || {})[i] || 0); }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; RH = narrow ? 80 : 52; BY = Y0 + RH + (narrow ? 40 : 30); TY = BY + RH + (narrow ? 64 : 48);
      var c = cur(), trayOn = c < OPS.length && OPS[c][0] === '+', H = trayOn ? TY + RH + 12 : BY + RH + 12;
      svg.setAttribute('viewBox', '0 0 700 ' + H); svg.innerHTML = '';
      wholeBar(svg, LX, Y0, BW, RH, lab);
      NS('rect', { x: LX, y: BY, width: BW, height: RH, rx: 6, fill: '#F6F7FB', stroke: '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
      var w = BW / d, noLab = narrow && d > 10;
      if (hasCut && !S.n.length) { var wb = NS('g', { 'pointer-events': 'none' }, svg); NS('rect', { x: LX + 1, y: BY, width: BW - 2, height: RH, rx: 6, fill: '#3A4A78' }, wb); NS('text', { x: LX + BW / 2, y: BY + RH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 26 : 19, 'font-weight': 900, fill: '#fff', text: '1 whole, not cut yet' }, wb); }
      S.n.forEach(function (p, i) {
        var tk = S.x[i] != null, g;
        if (tk) {
          g = NS('g', { class: 'tile as-t taken' }, svg);
          NS('rect', { x: LX + i * w + 1, y: BY, width: w - 2, height: RH, rx: 6, fill: '#fff', stroke: DCOL[d], 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
          NS('text', { x: LX + i * w + w / 2, y: BY + RH / 2 + 9, 'text-anchor': 'middle', 'font-size': narrow ? 34 : 26, 'font-weight': 900, fill: OPS.slice(0, S.x[i]).some(function (o) { return o[0] === '-'; }) ? '#6B46C1' : '#B23A2E', text: '✕', 'pointer-events': 'none' }, g);
        } else {
          g = ftile(svg, LX + i * w, BY, w, RH, d, true, 'tile as-t');
          if (p > 0 || (st0 && p === 0)) { g.querySelector('rect').setAttribute('fill-opacity', '0.5'); $$('text,line', g).forEach(function (t) { t.setAttribute('fill', '#0E1C42'); t.setAttribute('stroke', '#0E1C42'); }); }
          if (noLab && g.querySelector('g')) g.querySelector('g').remove();
        }
        g.dataset.i = i; g.setAttribute('tabindex', 0); g.setAttribute('role', 'button');
        g.setAttribute('aria-label', 'Tile ' + (i + 1) + (tk ? ', taken away' : ''));
        function act() { tap(i); }
        g.addEventListener('click', act); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      });
      for (var j = 1; j < d && noLab; j++) NS('line', { x1: LX + j * w, y1: BY + RH + 2, x2: LX + j * w, y2: BY + RH + 10, stroke: '#AEB6CC', 'stroke-width': 2, 'pointer-events': 'none' }, svg);
      if (trayOn) {
        NS('text', { x: LX, y: TY - 12, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag or tap a one-' + DNAME[d] + ' tile', 'pointer-events': 'none' }, svg);
        var tw = Math.max(w, narrow ? 90 : 60), tr = ftile(svg, LX, TY, tw, RH, d, false, 'tile as-tray'); tr.setAttribute('tabindex', 0); tr.setAttribute('role', 'button'); tr.setAttribute('aria-label', 'Add a one-' + DNAME[d] + ' tile');
        var ghost = null;
        drag(tr, svg, function (pt) { if (!ghost) { ghost = ftile(svg, 0, 0, w, RH, d, true); ghost.setAttribute('opacity', .8); ghost.style.pointerEvents = 'none'; } ghost.setAttribute('transform', 'translate(' + (pt.x - w / 2) + ',' + (pt.y - RH / 2) + ')'); },
          function (pt) { if (ghost) ghost.remove(); ghost = null; if (pt && pt.y > BY - 40 && pt.y < BY + RH + 40) add(); }, add);
        tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(); } });
      }
      if (cutB) cutB.disabled = S.n.length > 0;
      report();
    }
    function add() {
      var c = cur(); if (c >= OPS.length || OPS[c][0] !== '+') return;
      if (!got(c) && Object.keys(S.x).length) { var keep = []; S.cx = S.cx || {}; S.n.forEach(function (p, i) { if (S.x[i] != null) S.cx[S.x[i]] = (S.cx[S.x[i]] || 0) + 1; else keep.push(p); }); S.n = keep; S.x = {}; }
      if (S.n.length >= d) { msg('The bar is full. It can only hold 1 whole.'); return; }
      if (got(c) >= want(c)) { msg('That is all ' + want(c) + '. Count again: you need ' + nm(want(c)) + ' in this part.'); return; }
      S.n.push(c); save(); pluck(HZ.G4); draw();
    }
    function tap(i) {
      var c = cur(); if (c >= OPS.length) return;
      var op = OPS[c];
      if (op[0] === '+') { if (S.n[i] === c && i === S.n.length - 1) { S.n.pop(); save(); draw(); } else msg('Drag a tile from the tray to add one. Tap your last new tile to take it back.'); return; }
      if (op[0] === '-') {
        if (S.x[i] != null) { if (S.x[i] === c) { delete S.x[i]; save(); draw(); } return; }
        if (got(c) >= want(c)) { msg('You took away ' + nm(want(c)) + ' already. Tap an ✕ tile to put it back.'); return; }
        S.x[i] = c; save(); pluck(HZ.D4); draw(); return;
      }
      msg('Press ✂ Cut 1 whole into ' + DPL(d) + ' first.');
    }
    if (cutB) cutB.addEventListener('click', function () { if (S.n.length) return; for (var k = 0; k < d; k++) S.n.push(-1); save(); pluck(HZ.C5); draw(); });
    function report() {
      var c = cur(), done = [];
      OPS.forEach(function (op, i) { var ok = got(i) === want(i); flag(box, 'f' + (i + 1), ok); if (ok && i <= c) flag(box, 'f' + (i + 1)); });
      c = cur();
      var left = S.n.length - Object.keys(S.x).length, base = st0 ? nm(st0) + ' to start' : '';
      if (c >= OPS.length) { msg('Done. Count the shaded tiles to check your answer.', true); return; }
      var op = OPS[c], g = got(c);
      if (op === 'cut') msg('1 whole is one big piece. Cut it into ' + DPL(d) + '.');
      else if (op[0] === '+') msg(c === 0 && !st0 ? 'Tiles added: <b>' + g + '</b>' : 'New tiles added: <b>' + g + '</b> (the lighter ones)');
      else msg('Tiles taken away: <b>' + g + '</b>');
    }
    var lastC = -1; document.addEventListener('sb:step', function () { var c = cur(); if (c !== lastC) { lastC = c; draw(); } else report(); }); onWidth(box, draw); draw(); lastC = cur();
  };

  /* ── mfill (3.10.06 Measure Filler): data-d 16, data-m "13,11,9" (sixteenths already written in each measure).
     Drag (or tap the tray, then tap a measure) to add one-sixteenth tiles; tap a new tile to take it back.
     Flags: all (every measure is exactly 1 whole) · play ── */
  MODS.mfill = function (box) {
    var d = +box.dataset.d || 16, M = box.dataset.m.split(',').map(Number), name = box.dataset.name || 'mfill', S = mstate(name, { a: M.map(function () { return 0; }), played: 0 }), busy = false, sel = false;
    var BW = 680, LX = 10, RH = 50, GAPY = 46, narrow = false, Y = [], TY = 0;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 300" role="group" aria-label="' + M.length + ' measures to fill"></svg></div>' +
      '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn mf-play">▶ Play the measures</button><button type="button" class="sb-btn ghost mf-0">↺ Start over</button></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function full(r) { return M[r] + S.a[r] === d; }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; RH = narrow ? 76 : 50; GAPY = narrow ? 70 : 46;
      Y = M.map(function (m, r) { return 8 + r * (RH + GAPY) + GAPY - 10; }); TY = Y[M.length - 1] + RH + (narrow ? 70 : 52);
      svg.setAttribute('viewBox', '0 0 700 ' + (TY + RH + 12)); svg.innerHTML = '';
      var w = BW / d;
      M.forEach(function (m, r) {
        var y = Y[r];
        NS('text', { x: LX, y: y - 12, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: full(r) ? '#1E7A4C' : '#5B6478', text: 'MEASURE ' + (r + 1) + (full(r) ? ' · full ✓' : ''), 'pointer-events': 'none' }, svg);
        var bg = NS('rect', { class: 'mf-row', x: LX, y: y, width: BW, height: RH, rx: 6, fill: sel ? '#FFF7DC' : '#F6F7FB', stroke: sel ? '#C9A227' : '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
        bg.dataset.r = r;
        for (var i = 0; i < m + S.a[r]; i++) (function (i) {
          var neu = i >= m, g = ftile(svg, LX + i * w, y, w, RH, d, true, 'tile' + (neu ? ' mf-new' : ''));
          if (narrow && g.querySelector('g')) g.querySelector('g').remove();
          if (!neu) { g.querySelector('rect').setAttribute('fill', '#4A3426'); return; }
          g.querySelector('rect').setAttribute('fill-opacity', '0.55');
          g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Measure ' + (r + 1) + ': take back this sixteenth');
          function rm() { if (i === m + S.a[r] - 1) { S.a[r]--; S.played = 0; save(); draw(); } }
          g.addEventListener('click', rm); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rm(); } });
        })(i);
      });
      NS('text', { x: LX, y: TY - 12, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag a one-sixteenth tile into a measure', 'pointer-events': 'none' }, svg);
      var tw = narrow ? 90 : 60, tr = ftile(svg, LX, TY, tw, RH, d, sel, 'tile mf-tray'); tr.setAttribute('tabindex', 0); tr.setAttribute('role', 'button'); tr.setAttribute('aria-label', 'A one-sixteenth tile. Tap it, then tap a measure.');
      var ghost = null;
      drag(tr, svg, function (pt) { if (!ghost) { ghost = ftile(svg, 0, 0, w, RH, d, true); ghost.setAttribute('opacity', .8); ghost.style.pointerEvents = 'none'; } ghost.setAttribute('transform', 'translate(' + (pt.x - w / 2) + ',' + (pt.y - RH / 2) + ')'); },
        function (pt) { if (ghost) ghost.remove(); ghost = null; if (!pt) return; for (var r = 0; r < M.length; r++) if (pt.y > Y[r] - 24 && pt.y < Y[r] + RH + 24) { add(r); return; } },
        function () { sel = !sel; draw(); if (sel) msg('Now tap the measure where it goes.'); });
      tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); var r = M.findIndex(function (m, k) { return !full(k); }); if (r > -1) add(r); } });
      report();
    }
    function add(r) { if (full(r)) { draw(); msg('Measure ' + (r + 1) + ' is full: ' + d + ' sixteenths make 1 whole. It can\'t hold more.'); return; } S.a[r]++; S.played = 0; save(); pluck(HZ.G4 * (1 + 0.06 * r)); draw(); }
    svg.addEventListener('click', function (e) { if (!sel) return; var pt = svgPt(svg, e); for (var r = 0; r < M.length; r++) if (pt.y > Y[r] - 10 && pt.y < Y[r] + RH + 10) { sel = false; add(r); return; } });
    $('.mf-0', box).addEventListener('click', function () { S.a = M.map(function () { return 0; }); S.played = 0; sel = false; save(); draw(); });
    var MEL = ['G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'G4', 'D4'], NEW = ['D5', 'E5', 'D5', 'B4', 'G5', 'E5', 'D5', 'B4'];
    $('.mf-play', box).addEventListener('click', function () {
      if (busy) return; if (!M.every(function (m, r) { return full(r); })) { msg('Fill every measure first. Each one must be exactly 1 whole.'); return; }
      busy = true; musicDuck(); var Mt = 2.4, dt = Mt / d;
      M.forEach(function (m, r) { for (var i = 0; i < d; i++) pluck(HZ[(i < m ? MEL : NEW)[i % 8]], r * Mt + i * dt); });
      M.forEach(function (m, r) { setTimeout(function () { playhead(svg, LX, BW, Y[r] - 4, Y[r] + RH + 4, Mt); }, r * Mt * 1000); });
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, M.length * Mt * 1000 + 150);
    });
    function report() {
      var all = M.every(function (m, r) { return full(r); }); flag(box, 'all', all); if (all) flag(box, 'all');
      if (all && S.played) { flag(box, 'play'); msg('Every measure is exactly 1 whole, so the music keeps a steady beat.', true); return; }
      if (all) { msg('Every measure is full: ' + d + ' sixteenths each.', true); return; }
      var n = M.filter(function (m, r) { return full(r); }).length; if (!sel) msg(n ? n + ' of ' + M.length + ' measures ' + (n === 1 ? 'is' : 'are') + ' full.' : 'The dark notes are already written. Fill the empty space in each measure.');
    }
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };

  /* ── gap (3.10.07 "how much more"): two bars of the same tiles lined up under 1 whole.
     data-d, data-a (top bar, the bigger amount), data-b (bottom bar), data-rows "Bass part,Flute part", data-label
     (the navy whole's label). Drag (or tap) gap tiles from the tray onto the bottom bar until it ends where the top
     bar ends; tap the last gap tile to take it back. Flag: fill (bottom + gap tiles = top) ── */
  MODS.gap = function (box) {
    var d = +box.dataset.d, A = +box.dataset.a, B = +box.dataset.b, name = box.dataset.name || 'gap', lab = box.dataset.label || '1 whole';
    var rows = (box.dataset.rows || 'Top bar,Bottom bar').split(','), S = mstate(name, { g: 0 });
    var BW = 680, LX = 10, RH = 50, Y0 = 8, YA = 0, YB = 0, TY = 0, narrow = false;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 300" role="group" aria-label="Two bars in ' + DPL(d) + ' lined up"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function nm(k) { return k + ' ' + (k === 1 ? DNAME[d] : DPL(d)); }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; RH = narrow ? 76 : 50;
      var LH = narrow ? 34 : 24; YA = Y0 + RH + LH + 8; YB = YA + RH + LH + 8; TY = YB + RH + LH + 22;
      var full = B + S.g >= A, H = full ? YB + RH + 14 : TY + RH + 12;
      svg.setAttribute('viewBox', '0 0 700 ' + H); svg.innerHTML = '';
      wholeBar(svg, LX, Y0, BW, RH, lab);
      var w = BW / d, noLab = narrow && d > 10;
      [[YA, A, 0, rows[0]], [YB, B, S.g, rows[1]]].forEach(function (r, k) {
        var y = r[0];
        NS('text', { x: LX, y: y - 8, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: r[3].toUpperCase(), 'pointer-events': 'none' }, svg);
        NS('rect', { x: LX, y: y, width: BW, height: RH, rx: 6, fill: '#F6F7FB', stroke: '#AEB6CC', 'stroke-width': 2, 'stroke-dasharray': '6 5', 'pointer-events': 'none' }, svg);
        for (var i = 0; i < r[1]; i++) { var t = ftile(svg, LX + i * w, y, w, RH, d, true, 'tile'); t.style.pointerEvents = 'none'; if (noLab && t.querySelector('g')) t.querySelector('g').remove(); }
        for (var j = 0; j < r[2]; j++) (function (j) {
          var x = LX + (B + j) * w, g = NS('g', { class: 'tile gp-new', tabindex: 0, role: 'button', 'aria-label': 'Gap tile ' + (j + 1) + (j === S.g - 1 ? ', tap to take it back' : '') }, svg);
          NS('rect', { x: x + 1, y: y, width: w - 2, height: RH, rx: 6, fill: '#FFF3C4', stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }, g);
          NS('text', { x: x + w / 2, y: y + RH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 26 : 18, 'font-weight': 900, fill: '#8A6A00', text: String(j + 1), 'pointer-events': 'none' }, g);
          function rm() { if (j === S.g - 1) { S.g--; save(); pluck(HZ.D4); draw(); } }
          g.addEventListener('click', rm); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rm(); } });
        })(j);
      });
      var ex = LX + A * w;
      NS('line', { x1: ex, y1: YA - 4, x2: ex, y2: YB + RH + 6, stroke: '#C9A227', 'stroke-width': 3, 'stroke-dasharray': '6 5', 'pointer-events': 'none' }, svg);
      if (!full) {
        NS('text', { x: LX, y: TY - 12, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: 'TRAY · drag or tap a gap tile', 'pointer-events': 'none' }, svg);
        var tw = Math.max(w, narrow ? 90 : 60), tr = NS('g', { class: 'tile gp-tray', tabindex: 0, role: 'button', 'aria-label': 'Add a gap tile to the ' + rows[1].toLowerCase() }, svg);
        NS('rect', { x: LX + 1, y: TY, width: tw - 2, height: RH, rx: 6, fill: '#FFF3C4', stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 3' }, tr);
        NS('text', { x: LX + tw / 2, y: TY + RH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 24 : 16, 'font-weight': 900, fill: '#8A6A00', text: '1/' + d, 'pointer-events': 'none' }, tr);
        var ghost = null;
        drag(tr, svg, function (pt) { if (!ghost) { ghost = NS('rect', { width: w - 2, height: RH, rx: 6, fill: '#FFF3C4', stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 3', opacity: .85, 'pointer-events': 'none' }, svg); } ghost.setAttribute('x', pt.x - w / 2); ghost.setAttribute('y', pt.y - RH / 2); },
          function (pt) { if (ghost) ghost.remove(); ghost = null; if (pt && pt.y > YB - 40 && pt.y < YB + RH + 40) add(); }, add);
        tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(); } });
      }
      report();
    }
    function add() {
      if (B + S.g >= A) { msg('That would go past the end of the ' + rows[0].toLowerCase() + '. The gap stops where the ' + rows[0].toLowerCase() + ' ends.'); return; }
      S.g++; save(); pluck(HZ.G4 * (1 + 0.04 * S.g)); draw();
    }
    function report() {
      var ok = B + S.g === A; flag(box, 'fill', ok); if (ok) flag(box, 'fill');
      if (ok) { msg('The two bars end at the same place. The gap is <b>' + nm(S.g) + '</b>.', true); return; }
      msg(S.g ? 'Gap tiles: <b>' + S.g + '</b>. Keep going until the ' + rows[1].toLowerCase() + ' ends at the gold line.' : 'The ' + rows[1].toLowerCase() + ' is shorter. Fill the gap up to the gold line.');
    }
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };

  /* ── storyb (3.10.07 Story Builder): the student writes a take-away story of their own.
     Chips: clue (left · how much more), thing (candle · ribbon · bread · water: a take-away and a how-much-more starter each), unit (data-units "7,11").
     Then tap a tile in the top bar (first amount, at least 2) and in the bottom bar (second amount, less than the first).
     The page shows a story starter, sets the answer boxes in the step marked .stb-solve (data-a = first − second),
     and ▶ Play my story plays the first amount, then what is taken, then what is left.
     Flags: clue · thing · unit · a · b · play ── */
  MODS.storyb = function (box) {
    var name = box.dataset.name || 'storyb', UN = (box.dataset.units || '7,11').split(',').map(Number);
    var S = mstate(name, { clue: '', thing: '', d: 0, a: 0, b: 0, played: 0 }), busy = false;
    var CLUES = [['left', 'How much is left?'], ['more', 'How much more?']];
    var THINGS = {
      candle: ['🕯️ candle', 'candle', 'A candle is {A} of a foot tall. It burns {B} of a foot. <b>How much of the candle is left?</b>', 'One candle is {A} of a foot tall. Another candle is {B} of a foot tall. <b>How much taller is the first candle?</b>'],
      ribbon: ['🎀 ribbon', 'ribbon', 'Lena has {A} of a meter of ribbon. She cuts off {B} of a meter. <b>How much ribbon is left?</b>', 'Lena\'s ribbon is {A} of a meter long. Hans\'s ribbon is {B} of a meter long. <b>How much longer is Lena\'s ribbon?</b>'],
      bread: ['🍞 bread', 'loaf of bread', 'There is {A} of a loaf of bread. The singers eat {B} of the loaf. <b>How much bread is left?</b>', 'Lena has {A} of a loaf. Hans has {B} of a loaf. <b>How much more bread does Lena have?</b>'],
      water: ['💧 water', 'jug of water', 'A jug is {A} full of water. The players drink {B} of the jug. <b>How much water is left?</b>', 'One jug is {A} full. Another jug is {B} full. <b>How much more water is in the first jug?</b>'] };
    var job = box.closest('.sb-job');
    box.innerHTML = '<div class="stb-pick"><div class="sb-row stb-clue"><b>Clue word:</b> ' + CLUES.map(function (c) { return '<button type="button" class="sb-btn ghost" data-v="' + c[0] + '" aria-label="Clue word: ' + c[1] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
      '<div class="sb-row stb-thing"><b>Story thing:</b> ' + Object.keys(THINGS).map(function (k) { return '<button type="button" class="sb-btn ghost" data-v="' + k + '" aria-label="Story thing: ' + THINGS[k][1] + '">' + THINGS[k][0] + '</button>'; }).join('') + '</div>' +
      '<div class="sb-row stb-unit"><b>Unit:</b> ' + UN.map(function (u) { return '<button type="button" class="sb-btn ghost" data-v="' + u + '" aria-label="Unit: ' + DPL(u) + '">' + DPL(u) + '</button>'; }).join('') + '</div></div>' +
      '<div class="sb-stage sb-tiles" style="margin-top:8px"><svg viewBox="0 0 700 200" role="group" aria-label="Two bars for your story"></svg></div>' +
      '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn stb-play">▶ Play my story</button></div><div class="stb-frame" aria-live="polite"></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), frame = $('.stb-frame', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function frs(k, d) { return '<span class="fr"><span>' + k + '</span><span>' + d + '</span></span>'; }
    function chips() {
      [['.stb-clue', S.clue], ['.stb-thing', S.thing], ['.stb-unit', String(S.d || '')]].forEach(function (c) {
        $$(c[0] + ' button', box).forEach(function (b) { var on = b.dataset.v === c[1]; b.classList.toggle('ghost', !on); b.setAttribute('aria-pressed', on); });
      });
    }
    $$('.stb-pick button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var row = b.parentNode.className;
        if (/clue/.test(row)) S.clue = b.dataset.v; else if (/thing/.test(row)) S.thing = b.dataset.v;
        else { var nd = +b.dataset.v; if (nd !== S.d) { S.d = nd; S.a = 0; S.b = 0; S.played = 0; } }
        save(); pluck(HZ.C5); draw();
      });
    });
    var BW = 680, LX = 10, RH = 50, YA = 0, YB = 0, narrow = false;
    function draw() {
      chips(); narrow = (box.clientWidth || 800) < 560; RH = narrow ? 76 : 50;
      var LH = narrow ? 34 : 24; YA = LH + 6; YB = YA + RH + LH + 14;
      svg.setAttribute('viewBox', '0 0 700 ' + (YB + RH + 12)); svg.innerHTML = '';
      var d = S.d;
      if (!d) { NS('text', { x: 350, y: YA + RH / 2 + 6, 'text-anchor': 'middle', 'font-size': narrow ? 26 : 17, 'font-weight': 800, fill: '#5B6478', text: 'Pick a unit to get your two bars.' }, svg); }
      else {
        var w = BW / d;
        [['a', YA, 'FIRST AMOUNT (top bar)', 'Top bar tile '], ['b', YB, 'SECOND AMOUNT (bottom bar)', 'Bottom bar tile ']].forEach(function (r) {
          var k = r[0], y = r[1];
          NS('text', { x: LX, y: y - 8, 'font-size': narrow ? 24 : 14, 'font-weight': 900, fill: '#5B6478', text: r[2] + (S[k] ? ' · ' + S[k] + ' ' + (S[k] === 1 ? DNAME[d] : DPL(d)) : ''), 'pointer-events': 'none' }, svg);
          for (var i = 0; i < d; i++) (function (i) {
            var on = i < S[k], t = ftile(svg, LX + i * w, y, w, RH, d, on, 'tile');
            if (narrow && d > 10 && t.querySelector('g')) t.querySelector('g').remove();
            t.setAttribute('tabindex', 0); t.setAttribute('role', 'button'); t.setAttribute('aria-label', r[3] + (i + 1));
            function set() { setAmt(k, i + 1); }
            t.addEventListener('click', set); t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(); } });
          })(i);
        });
      }
      report();
    }
    function setAmt(k, n) {
      var d = S.d;
      if (k === 'a') { if (n === d) { msg('Leave room: pick less than 1 whole, so there is something to take away from.'); return; } if (n < 2) { msg('Pick at least 2 ' + DPL(d) + ', so you can take some away and still have some left.'); return; } S.a = n; if (S.b >= S.a) S.b = 0; }
      else { if (!S.a) { msg('Set the top bar first.'); return; } if (n >= S.a) { msg('The bottom bar must be <b>shorter</b> than the top bar. Pick fewer than ' + S.a + ' ' + DPL(d) + '.'); return; } S.b = n; }
      S.played = 0; save(); pluck(HZ.G4 * (1 + 0.05 * n)); draw();
    }
    function story() {
      var T = THINGS[S.thing], d = S.d; if (!T || !d || !S.a || !S.b || !S.clue) return '';
      return T[S.clue === 'left' ? 2 : 3].replace('{A}', frs(S.a, d)).replace('{B}', frs(S.b, d));
    }
    function setAns() {
      var sv = job && $('.stb-solve', job); if (!sv) return;
      var ins = $$('.sb-ans', sv), ok = S.a && S.b && S.d;
      if (ins[0]) { ins[0].dataset.a = ok ? String(S.a - S.b) : '?'; ins[0].dataset.hint = ok ? 'Take the second amount away from the first: ' + S.a + ' − ' + S.b + '.' : 'Build both bars first.'; }
      if (ins[1]) { ins[1].dataset.a = ok ? String(S.d) : '?'; ins[1].dataset.hint = ok ? 'The unit stays ' + DPL(S.d) + ', so the denominator stays ' + S.d + '.' : 'Build both bars first.'; }
    }
    $('.stb-play', box).addEventListener('click', function () {
      if (busy) return; if (!(S.a && S.b && S.d)) { msg('Build both bars first.'); return; }
      busy = true; musicDuck(); var dt = 0.22, N = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B4', 'C5'], t = 0;
      for (var i = 0; i < S.a; i++) pluck(HZ[N[i % N.length]], t + i * dt); t += S.a * dt + 0.35;
      for (var j = 0; j < S.b; j++) pluck(HZ.D4, t + j * dt); t += S.b * dt + 0.35;
      for (var q = 0; q < S.a - S.b; q++) pluck(HZ[N[q % N.length]] * 2, t + q * dt); t += (S.a - S.b) * dt;
      setTimeout(function () { busy = false; S.played = 1; save(); report(); }, t * 1000 + 150);
    });
    function report() {
      flag(box, 'clue', !!S.clue); if (S.clue) flag(box, 'clue');
      flag(box, 'thing', !!S.thing); if (S.thing) flag(box, 'thing');
      flag(box, 'unit', !!S.d); if (S.d) flag(box, 'unit');
      flag(box, 'a', !!S.a); if (S.a) flag(box, 'a');
      flag(box, 'b', !!S.b); if (S.b) flag(box, 'b');
      if (S.played && S.a && S.b) flag(box, 'play');
      setAns();
      var st = story(); frame.innerHTML = st ? '<div class="sb-card" style="margin:8px 0 0;background:#FFFBEF"><span class="sb-k">Your story starter</span><p style="margin:4px 0 0">' + st + '</p></div>' : '';
      if (!S.clue) msg('Pick a clue word.'); else if (!S.thing) msg('Pick a thing for your story.'); else if (!S.d) msg('Pick a unit.');
      else if (!S.a) msg('Tap a tile in the top bar to set the first amount.'); else if (!S.b) msg('Tap a tile in the bottom bar to set the second amount.');
      else msg(S.played ? (S.clue === 'left' ? 'You heard the first amount, then the part taken away (low notes), then what is left.' : 'You heard the first amount, then the second amount (low notes), then the gap.') : 'Your story is ready. Write it in your own words.', true);
    }
    document.addEventListener('sb:step', report); onWidth(box, draw); draw();
  };

  /* ── mstick (3.11.01 meters and centimeters). data-mode lay | show | start | cut, data-len (object, cm),
     data-obj (cloth · board · rope · table · quill · cord · ribbon), data-label (the object's name on screen).
     lay: drag (or tap) the meter stick onto the object, then the 60 cm ruler onto the rest. Flags: stick, ruler.
     start: data-r (ruler length, cm), data-s (where the object starts); drag it (or arrow keys) so it starts at 0. Flag: zero.
     cut: data-t "108,141"; drag the ribbon's end (or arrow keys); flags cut1, cut2… when the end sits on that target
     while its step is open. The marble meter shows the length both ways once the step .ms-sayN after it is done. ── */
  MODS.mstick = function (box) {
    var mode = box.dataset.mode || 'lay', L = +box.dataset.len || 100, obj = box.dataset.obj || 'cloth', name = box.dataset.name || 'mstick';
    var lab = box.dataset.label || obj, R = +box.dataset.r || 25, T = (box.dataset.t || '').split(',').filter(Boolean).map(Number);
    var S = mstate(name, mode === 'start' ? { s: +box.dataset.s || 1 } : mode === 'cut' ? { len: 60, k: 0 } : { st: 0, ru: 0 });
    if (mode === 'show') { S = { st: 1, ru: 1 }; }
    var RU = 60, X0 = 14, BW = 672, narrow = false;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 260" role="group" aria-label="' + (mode === 'start' ? 'A ruler and a ' + lab : mode === 'cut' ? 'A marble meter, a ruler and a ribbon' : 'A ' + lab + ', a meter stick and a centimeter ruler') + '"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    var FILL = { cloth: '#F3E7C9', board: '#B07A45', rope: '#C9A46A', table: '#8B5A2B', quill: '#F7F3EA', cord: '#2F6FDE', ribbon: '#6B46C1' };
    function objBar(x, y, w, h) {
      var g = NS('g', {}, svg), c = FILL[obj] || '#C9A46A';
      if (obj === 'quill') {
        NS('rect', { x: x, y: y - 4, width: w, height: h + 8, fill: 'transparent' }, g);   // easy to grab
        NS('path', { d: 'M' + x + ' ' + (y + h / 2) + ' L' + (x + w * 0.18) + ' ' + (y + h * 0.42) + ' Q' + (x + w * 0.6) + ' ' + (y - h * 0.1) + ' ' + (x + w) + ' ' + (y + h * 0.2) + ' Q' + (x + w * 0.62) + ' ' + (y + h * 1.0) + ' ' + (x + w * 0.18) + ' ' + (y + h * 0.58) + ' Z', fill: c, stroke: '#7A6A4F', 'stroke-width': 2 }, g);
        NS('line', { x1: x, y1: y + h / 2, x2: x + w * 0.96, y2: y + h * 0.26, stroke: '#7A6A4F', 'stroke-width': 2 }, g);
        return g;
      }
      NS('rect', { x: x, y: y, width: w, height: h, rx: obj === 'rope' || obj === 'cord' || obj === 'ribbon' ? h / 2 : 4, fill: c, stroke: obj === 'cloth' ? '#B79A5B' : '#5A3A1A', 'stroke-width': 2 }, g);
      if (obj === 'cloth') for (var i = 1; i * 26 < w; i++) NS('text', { x: x + i * 26 - 6, y: y + h / 2 + 6, 'font-size': 15, fill: '#6B46C1', opacity: .55, text: '⚜', 'pointer-events': 'none' }, g);
      if (obj === 'board' || obj === 'table') for (var j = 1; j < 4; j++) NS('line', { x1: x + 4, y1: y + j * h / 4, x2: x + w - 4, y2: y + j * h / 4 + (j % 2 ? 2 : -2), stroke: '#6E4524', 'stroke-width': 1.2, opacity: .5 }, g);
      if (obj === 'rope') for (var q = 0; q * 12 < w; q++) NS('line', { x1: x + q * 12, y1: y + 2, x2: x + q * 12 + 10, y2: y + h - 2, stroke: '#8A6A3A', 'stroke-width': 2, opacity: .6 }, g);
      return g;
    }
    // a stick of `cm` centimeters starting at value v0 (labels v0…v0+cm), drawn at x, y with k px per cm
    function stick(g, x, y, cm, k, v0, kind, endLab) {
      var h = narrow ? 62 : 40, marble = kind === 'marble';
      NS('rect', { x: x, y: y, width: cm * k, height: h, rx: 3, fill: marble ? '#ECE7DE' : kind === 'meter' ? '#F6DE94' : '#EAF3FF', stroke: marble ? '#9A938A' : kind === 'meter' ? '#B8902A' : '#8FB2DA', 'stroke-width': 2 }, g);
      if (marble) { NS('path', { d: 'M' + (x + 10) + ' ' + (y + h - 6) + ' q' + (cm * k * 0.2) + ' -' + (h * 0.5) + ' ' + (cm * k * 0.45) + ' -' + (h * 0.2) + ' t' + (cm * k * 0.5) + ' -' + (h * 0.3), fill: 'none', stroke: '#C9C2B6', 'stroke-width': 2 }, g); }
      for (var i = 0; i <= cm; i++) {
        var v = v0 + i, big = v % 10 === 0, mid = v % 5 === 0, xx = x + i * k;
        NS('line', { x1: xx, y1: y, x2: xx, y2: y + (big ? h * 0.5 : mid ? h * 0.34 : h * 0.2), stroke: marble ? '#5E5850' : '#1F2A44', 'stroke-width': big ? 1.8 : 1 }, g);
        if (big && (i > 0 || v === 0) && (i < cm || endLab || (kind !== 'meter' && kind !== 'marble'))) NS('text', { x: xx, y: y + h - 5, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: marble ? '#5E5850' : '#0E1C42', text: String(v), 'pointer-events': 'none' }, g);
      }
      return h;
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var LH = narrow ? 30 : 16, OH = narrow ? 56 : 34;
      if (mode === 'start') {
        var k = BW / (R + 1), yO = 8 + LH + 4, yR = yO + OH + 10;
        NS('text', { x: X0, y: 8 + LH - 6, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: lab.toUpperCase() + ' · DRAG IT', 'pointer-events': 'none' }, svg);
        var rh = stick(NS('g', {}, svg), X0, yR, R, k, 0, R > 60 ? 'meter' : 'ruler', true);
        NS('text', { x: X0, y: yR + rh + LH + 4, 'font-size': narrow ? 20 : 13, 'font-weight': 800, fill: '#5B6478', text: R > 60 ? 'METER STICK · 1 METER' : 'CENTIMETER RULER', 'pointer-events': 'none' }, svg);
        var g = objBar(X0 + S.s * k, yO, L * k, OH); g.setAttribute('class', 'drag ms-obj'); g.setAttribute('tabindex', 0); g.setAttribute('role', 'button');
        g.setAttribute('aria-label', 'The ' + lab + '. Its left end is on ' + S.s + '. Use the arrow keys to move it.');
        NS('line', { x1: X0 + S.s * k, y1: yO - 4, x2: X0 + S.s * k, y2: yR + rh, stroke: S.s ? '#B23A2E' : '#1E7A4C', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
        var gx0 = 0;
        drag(g, svg, function (pt) { if (!gx0) gx0 = pt.x - (X0 + S.s * k); g.setAttribute('transform', 'translate(' + (pt.x - gx0 - (X0 + S.s * k)) + ',0)'); },
          function (pt) { if (pt) { S.s = Math.max(0, Math.min(R - L, Math.round((pt.x - gx0 - X0) / k))); save(); pluck(HZ.G4); } gx0 = 0; draw(); },
          function () { });
        g.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0; if (!dv) return; e.preventDefault(); S.s = Math.max(0, Math.min(R - L, S.s + dv)); save(); draw(); var n = $('.ms-obj', svg); if (n) n.focus(); });
        svg.setAttribute('viewBox', '0 0 700 ' + (yR + rh + LH + 12));
        flag(box, 'zero', S.s === 0); if (S.s === 0) flag(box, 'zero');
        msg(S.s === 0 ? 'The left end is on <b>0</b>.' : 'The left end is on <b>' + S.s + '</b>, not on 0.', S.s === 0);
        return;
      }
      if (mode === 'cut') {
        var kc = BW / 165, yRb = 8 + LH + 6, yS = yRb + OH + 12, gS = NS('g', {}, svg);
        var sh = stick(gS, X0, yS, 100, kc, 0, 'marble'); stick(gS, X0 + 100 * kc, yS, RU, kc, 0, 'ruler');
        NS('text', { x: X0 + 50 * kc, y: yS + sh + (narrow ? 30 : 22), 'text-anchor': 'middle', 'font-size': narrow ? 24 : 17, 'font-weight': 900, fill: '#5E5850', 'letter-spacing': 4, text: 'MÈTRE', 'pointer-events': 'none' }, svg);
        NS('text', { x: X0 + 130 * kc, y: yS + sh + (narrow ? 30 : 22), 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: '#1D4FA8', text: 'CENTIMETER RULER', 'pointer-events': 'none' }, svg);
        NS('text', { x: X0, y: 8 + LH - 6, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: 'RIBBON · DRAG ITS END', 'pointer-events': 'none' }, svg);
        var rib = objBar(X0, yRb, S.len * kc, OH).querySelector('rect'), len0 = S.len;
        var ex = X0 + S.len * kc, kn = NS('g', { class: 'drag ms-end', tabindex: 0, role: 'slider', 'aria-label': 'End of the ribbon', 'aria-valuemin': 1, 'aria-valuemax': 160, 'aria-valuenow': S.len }, svg);
        NS('circle', { cx: ex, cy: yRb + OH / 2, r: narrow ? 24 : 17, fill: '#fff', stroke: '#6B46C1', 'stroke-width': 4 }, kn);
        NS('text', { x: ex, y: yRb + OH / 2 + 6, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 900, fill: '#6B46C1', text: '✂', 'pointer-events': 'none' }, kn);
        var gl = NS('line', { x1: ex, y1: yRb + OH, x2: ex, y2: yS + sh, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
        var H = yS + sh + (narrow ? 40 : 30), say = 0;
        for (var t = 0; t < T.length; t++) { var sy = $('.ms-say' + (t + 1), box.closest('.sb-job') || document); if (sy && sy.classList.contains('right')) say = t + 1; }
        if (say) {
          var tv = T[say - 1], both = Math.floor(tv / 100) + ' m ' + (tv % 100) + ' cm = ' + tv + ' cm', bg = NS('g', { class: 'ms-both' }, svg);
          NS('rect', { x: X0 + 8 * kc, y: H, width: 84 * kc, height: narrow ? 44 : 34, rx: 8, fill: '#FFFBEF', stroke: '#C9A227', 'stroke-width': 2 }, bg);
          NS('text', { x: X0 + 50 * kc, y: H + (narrow ? 30 : 23), 'text-anchor': 'middle', 'font-size': narrow ? 24 : 18, 'font-weight': 900, fill: '#0E1C42', text: '✓ ' + both, 'pointer-events': 'none' }, bg);
          H += narrow ? 52 : 42;
        }
        svg.setAttribute('viewBox', '0 0 700 ' + H);
        // while dragging, only move the ribbon end (a redraw mid-drag would drop the pointer)
        drag(kn, svg, function (pt) { var v = Math.max(1, Math.min(160, Math.round((pt.x - X0) / kc))); if (v === S.len) return; S.len = v; rib.setAttribute('width', v * kc); kn.setAttribute('transform', 'translate(' + ((v - len0) * kc) + ',0)'); gl.setAttribute('x1', X0 + v * kc); gl.setAttribute('x2', X0 + v * kc); },
          function () { save(); pluck(HZ.G4); draw(); check(); }, function () { });
        kn.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0; if (!dv) return; e.preventDefault(); S.len = Math.max(1, Math.min(160, S.len + dv)); save(); draw(); check(); var n = $('.ms-end', svg); if (n) n.focus(); });
        check(true); return;
      }
      // lay / show
      var kl = BW / 165, yO2 = 8 + LH + 4, yT = yO2 + OH + 10, th = narrow ? 62 : 40, yTray = yT + th + LH + (narrow ? 40 : 26);
      NS('text', { x: X0, y: 8 + LH - 6, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: lab.toUpperCase(), 'pointer-events': 'none' }, svg);
      objBar(X0, yO2, L * kl, OH);
      var endx = X0 + L * kl;
      NS('line', { x1: endx, y1: yO2 - 4, x2: endx, y2: yT + th + 6, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
      var tray = !(S.st && S.ru);
      if (tray && mode !== 'show') NS('text', { x: X0, y: yTray - 8, 'font-size': narrow ? 20 : 13, 'font-weight': 900, fill: '#5B6478', text: 'TOOLS · drag or tap', 'pointer-events': 'none' }, svg);
      var ms = NS('g', { class: S.st ? '' : 'drag', tabindex: S.st ? -1 : 0, role: 'button', 'aria-label': 'Meter stick' }, svg);
      stick(ms, S.st ? X0 : X0, S.st ? yT : yTray, 100, kl, 0, 'meter');
      NS('text', { x: X0 + 50 * kl, y: (S.st ? yT : yTray) + th + (narrow ? 26 : 15), 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: '#5A4300', text: 'METER STICK · 1 m', 'pointer-events': 'none' }, svg);
      var rx = S.ru ? X0 + 100 * kl : X0 + 104 * kl, ru = NS('g', { class: S.ru ? '' : 'drag', tabindex: S.ru ? -1 : 0, role: 'button', 'aria-label': 'Centimeter ruler' }, svg);
      stick(ru, rx, S.ru ? yT : yTray, RU, kl, 0, 'ruler');
      NS('text', { x: rx + 30 * kl, y: (S.ru ? yT : yTray) + th + (narrow ? 26 : 15), 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: '#1D4FA8', text: 'CENTIMETER RULER', 'pointer-events': 'none' }, svg);
      svg.setAttribute('viewBox', '0 0 700 ' + ((tray && mode !== 'show') ? yTray + th + LH + 14 : yT + th + LH + 14));
      if (mode === 'show') { ms.removeAttribute('tabindex'); ru.removeAttribute('tabindex'); ms.removeAttribute('role'); ru.removeAttribute('role'); msg(''); return; }
      function place(which) {
        if (which === 'ru' && !S.st) { msg('Put the meter stick on first. Start at the left end of the ' + lab + '.'); return; }
        S[which] = 1; save(); pluck(which === 'st' ? HZ.D4 : HZ.G4); draw();
      }
      [[ms, 'st'], [ru, 'ru']].forEach(function (p) {
        if (S[p[1]]) return; var node = p[0], gx = 0, gy = 0, bx = p[1] === 'st' ? X0 : rx;
        drag(node, svg, function (pt) { if (!gx) { gx = pt.x - bx; gy = pt.y - yTray; } node.setAttribute('transform', 'translate(' + (pt.x - gx - bx) + ',' + (pt.y - gy - yTray) + ')'); },
          function (pt) { gx = 0; if (pt && pt.y < yTray) place(p[1]); else draw(); }, function () { place(p[1]); });
        node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(p[1]); } });
      });
      flag(box, 'stick', !!S.st); if (S.st) flag(box, 'stick');
      flag(box, 'ruler', !!(S.st && S.ru)); if (S.st && S.ru) flag(box, 'ruler');
      msg(!S.st ? 'Nothing is measured yet. The ' + lab + ' ends at the gold line.' : !S.ru ? 'The meter stick covers 1 meter. Some ' + lab + ' is left over past it.' : 'Both tools are down. The gold line shows where the ' + lab + ' ends on the ruler.', !!(S.st && S.ru));
    }
    function check(quiet) {
      if (mode !== 'cut') return;
      for (var t = 0; t < T.length; t++) {
        var nmF = 'cut' + (t + 1), st = stepFor(box, nmF);
        if (!quiet && st && st.classList.contains('now') && !st.classList.contains('right') && S.len === T[t]) { flag(box, nmF); if (!quiet) msg('✓ Cut! The ribbon ends right on the mark you wanted.', true); return; }
      }
      if (!quiet) msg(S.len > 100 ? 'The ribbon is longer than the marble meter.' : 'The ribbon is not as long as the marble meter.');
      else if (!out.innerHTML) msg(S.len > 100 ? 'The ribbon is longer than the marble meter.' : 'The ribbon is not as long as the marble meter.');
    }
    document.addEventListener('sb:step', function () { if (mode === 'cut') draw(); });
    onWidth(box, draw); draw();
  };

  /* ── cutm (3.11.02 subtracting from meters). data-m (meters on the roll), data-orders "m:c,m:c".
     Tap a whole meter to hand it over · ✂ Break a meter opens one meter into 100 cm · drag the scissors to cut.
     Flags (one order): meters, break, cut. Flags (more orders): meters1, break1, cut1, cut2…  ── */
  MODS.cutm = function (box) {
    var M = +box.dataset.m || 9, name = box.dataset.name || 'cutm';
    var O = (box.dataset.orders || '0:50').split(',').map(function (p) { var q = p.split(':'); return { m: +q[0] || 0, c: +q[1] || 0 }; });
    var multi = O.length > 1, G = [], T = [], gs = 0, ts = 0;
    O.forEach(function (o) { gs += o.m; ts += o.c; G.push(gs); T.push(ts); });
    function nm(base, i) { return multi ? base + (i + 1) : base; }
    var S = mstate(name, { g: 0, b: 0, c: 0, d: 0 });
    var X0 = 14, BW = 672, narrow = false;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 300" role="group" aria-label="A ribbon roll of ' + M + ' whole meters"></svg></div>' +
      '<div class="sb-row cm-tools" style="margin-top:6px"><button type="button" class="sb-btn cm-break" aria-label="Break a meter">✂ Break a meter</button></div>' +
      '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), bb = $('.cm-break', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function cur() { return Math.min(S.d, O.length - 1); }
    function allDone() { return S.d >= O.length; }
    function give() {
      if (allDone()) return;
      var i = cur();
      if (S.g >= G[i]) { if (!S.b) { brk(); return; } msg('This order needs no more whole meters. Keep them on the roll.'); return; }
      if (S.g + S.b >= M) return;
      S.g++; save(); pluck(HZ.D4); draw();
      msg('You handed over ' + (S.g === 1 ? '1 whole meter.' : S.g + ' whole meters.'));
    }
    function brk() {
      if (allDone()) return;
      var i = cur();
      if (S.b) { msg('One meter is already open. Cut from it.'); return; }
      if (S.g < G[i]) { msg('Hand over the whole meters first.'); return; }
      if (S.g >= M) return;
      S.b = 1; save(); pluck(HZ.G4); draw();
      msg('One meter is now 100 centimeters.');
    }
    bb.addEventListener('click', brk);
    function cutTo(v) {
      var i = cur(), lock = S.d ? T[S.d - 1] : 0, before = S.c;
      v = Math.max(lock, Math.min(100, v)); S.c = v;
      var piece = S.c - lock;
      if (S.c === T[i] && S.g >= G[i]) { S.d = i + 1; save(); pluck(HZ.C5); draw(); msg('✓ Cut! That piece is ' + piece + ' cm, just what the order asked for.', true); return; }
      save(); if (v !== before) pluck(HZ.E4); draw();
      msg(piece ? 'That piece is ' + piece + ' cm. The order asks for ' + O[i].c + ' cm.' : 'Drag the scissors along the open meter.');
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var LH = narrow ? 30 : 16, BH = narrow ? 64 : 42, FS = narrow ? 22 : 13, i = cur(), lock = S.d ? T[S.d - 1] : 0;
      var yRow = 8 + LH + 6, gap = 4, u = (BW - gap * (M - 1)) / M, next = null;
      NS('text', { x: X0, y: 8 + LH - 4, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: 'RIBBON ROLL · ' + M + ' WHOLE METERS', 'pointer-events': 'none' }, svg);
      // order of blocks, left to right: handed over, the open meter, whole meters still on the roll
      var bx = 0;
      for (var n = 0; n < M; n++) {
        var x = X0 + n * (u + gap), kind = n < S.g ? 'gone' : (n === S.g && S.b) ? 'open' : 'roll';
        if (kind === 'open') bx = x;
        var g = NS('g', {}, svg);
        if (kind === 'gone') {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#F1ECFA', stroke: '#6B46C1', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#6B46C1', text: u > (narrow ? 150 : 60) ? 'handed over' : '✓', 'pointer-events': 'none' }, g);
        } else if (kind === 'open') {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#EAF3FF', stroke: '#8FB2DA', 'stroke-width': 2 }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#1D4FA8', text: u > (narrow ? 90 : 60) ? 'open' : '✂', 'pointer-events': 'none' }, g);
        } else {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#F6DE94', stroke: '#B8902A', 'stroke-width': 2 }, g);
          for (var tk = 1; tk < 10; tk++) NS('line', { x1: x + tk * u / 10, y1: yRow, x2: x + tk * u / 10, y2: yRow + (tk === 5 ? BH * .3 : BH * .18), stroke: '#8A6A00', 'stroke-width': 1, 'pointer-events': 'none' }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 15, 'font-weight': 900, fill: '#5A4300', text: '1 m', 'pointer-events': 'none' }, g);
          var can = !allDone() && S.g < G[i];
          g.setAttribute('class', 'cm-m' + (can && !next ? ' cm-next' : ''));
          g.setAttribute('role', 'button'); g.setAttribute('tabindex', can ? 0 : -1);
          g.setAttribute('aria-label', 'Whole meter on the roll' + (can ? '. Tap to hand it over.' : ''));
          if (can) { g.style.cursor = 'pointer'; if (!next) next = g; }
          drag(g, svg, null, function () { }, give);
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); give(); } });
        }
      }
      var H = yRow + BH + (narrow ? 14 : 10);
      bb.disabled = !!S.b || allDone();
      bb.classList.toggle('cm-next', !next && !S.b && !allDone());
      if (!next && !S.b && !allDone()) next = bb;
      if (S.b) {
        // the open meter, drawn large: 100 centimeters with a mark for every one
        var yS = H + (narrow ? 70 : 48), k = BW / 100, sh = narrow ? 66 : 46;
        NS('polygon', { points: bx + ',' + (yRow + BH) + ' ' + (bx + u) + ',' + (yRow + BH) + ' ' + (X0 + BW) + ',' + yS + ' ' + X0 + ',' + yS, fill: '#8FB2DA', opacity: .18, 'pointer-events': 'none' }, svg);
        NS('text', { x: X0, y: yS - (narrow ? 44 : 30), 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: 'THE OPEN METER · 100 CENTIMETERS', 'pointer-events': 'none' }, svg);
        NS('rect', { x: X0, y: yS, width: BW, height: sh, rx: 3, fill: '#EAF3FF', stroke: '#8FB2DA', 'stroke-width': 2 }, svg);
        for (var o = 0; o < S.d && o < O.length; o++) {
          var a = o ? T[o - 1] : 0, w = T[o] - a;
          if (w > 0) { NS('rect', { x: X0 + a * k, y: yS, width: w * k, height: sh, fill: multi && o < S.d - 1 ? '#C7B6EE' : '#B9A6E8', stroke: '#6B46C1', 'stroke-width': 1.5 }, svg); }
        }
        var shade = NS('rect', { class: 'cm-shade', x: X0 + lock * k, y: yS, width: Math.max(0, (S.c - lock) * k), height: sh, fill: '#6B46C1', opacity: .55, 'pointer-events': 'none' }, svg);
        for (var c = 0; c <= 100; c++) {
          var big = c % 10 === 0, mid = c % 5 === 0, xx = X0 + c * k;
          NS('line', { x1: xx, y1: yS, x2: xx, y2: yS + (big ? sh * .5 : mid ? sh * .34 : sh * .2), stroke: '#1F2A44', 'stroke-width': big ? 1.8 : 1, 'pointer-events': 'none' }, svg);
          if (big && (!narrow || c % 20 === 0)) NS('text', { x: xx, y: yS + sh - 5, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 12, 'font-weight': 800, fill: '#0E1C42', text: String(c), 'pointer-events': 'none' }, svg);
        }
        for (var p = 0; p < S.d && p < O.length; p++) {
          var a2 = p ? T[p - 1] : 0;
          if (T[p] - a2 >= (narrow ? 14 : 8)) NS('text', { x: X0 + (a2 + T[p]) / 2 * k, y: yS + sh + (narrow ? 26 : 16), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#6B46C1', text: multi ? 'order ' + (p + 1) : 'cut off', 'pointer-events': 'none' }, svg);
        }
        var ex = X0 + S.c * k, ky = yS - (narrow ? 26 : 18);
        var gl = NS('line', { x1: ex, y1: ky, x2: ex, y2: yS + sh + 4, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
        H = yS + sh + (narrow ? 36 : 24);
        if (!allDone()) {
          var kn = NS('g', { class: 'drag cm-sc' + (!next ? ' cm-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'End of the cut. Drag the scissors.', 'aria-valuemin': lock, 'aria-valuemax': 100, 'aria-valuenow': S.c }, svg);
          NS('circle', { cx: ex, cy: ky, r: narrow ? 24 : 17, fill: '#fff', stroke: '#6B46C1', 'stroke-width': 4 }, kn);
          NS('text', { x: ex, y: ky + 6, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 16, 'font-weight': 900, fill: '#6B46C1', text: '✂', 'pointer-events': 'none' }, kn);
          var c0 = S.c, live = S.c;
          drag(kn, svg, function (pt) {
            var v = Math.max(lock, Math.min(100, Math.round((pt.x - X0) / k))); if (v === live) return; live = v;
            kn.setAttribute('transform', 'translate(' + ((v - c0) * k) + ',0)'); gl.setAttribute('x1', X0 + v * k); gl.setAttribute('x2', X0 + v * k);
            shade.setAttribute('width', Math.max(0, (v - lock) * k));
          }, function (pt) { if (pt) cutTo(live); else draw(); }, function () { });
          kn.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0; if (!dv) return; e.preventDefault(); cutTo(S.c + dv); var nn = $('.cm-sc', svg); if (nn) nn.focus(); });
        }
      }
      svg.setAttribute('viewBox', '0 0 700 ' + H);
      // flags: what is done stays done
      O.forEach(function (od, j) {
        if (od.m && S.g >= G[j]) flag(box, nm('meters', j));
        if (j === 0 && S.b) flag(box, nm('break', j));
        if (S.d > j) flag(box, nm('cut', j));
      });
      if (!out.innerHTML) msg(allDone() ? '✓ Every order is cut.' : 'The roll has ' + M + ' whole meters.', allDone());
    }
    onWidth(box, draw); draw();
  };

  /* ── kmroad (3.11.03 kilometers). data-mode build | show | route. See tools/storybook/patch1103.py. ── */
  MODS.kmroad = function (box) {
    var mode = box.dataset.mode || 'build', name = box.dataset.name || 'kmroad', MAX = +box.dataset.max || 3000;
    var T = (box.dataset.t || '').split(',').filter(Boolean).map(Number), multi = T.length > 1;
    var X0 = 20, BW = 660, narrow = false;
    var S = mstate(name, mode === 'route' ? { st: 0 } : { len: 0, d: 0 });
    function fm(m) { var k = Math.floor(m / 1000), r = m % 1000; return k ? k + ' km' + (r ? ' ' + r + ' m' : '') : m + ' m'; }
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 200" role="group" aria-label="' + (mode === 'route' ? 'A winding road and a straight path' : 'A road built from 100 meter pieces') + '"></svg></div>' +
      (mode === 'route' ? '<div class="sb-row" style="margin-top:6px"><button type="button" class="sb-btn kr-go" aria-label="Lay the road out straight">↔ Lay the road out straight</button></div>' : '') +
      '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    // a laid road from 0 to len on a scale of k px per m at (x, y): gold 1 km bars, then 100 m pieces
    function road(g, x, y, len, k, h) {
      var km = Math.floor(len / 1000), rest = len - km * 1000, i, fs = narrow ? 20 : 12;
      for (i = 0; i < km; i++) {
        NS('rect', { x: x + i * 1000 * k, y: y, width: 1000 * k, height: h, rx: 4, fill: '#F6DE94', stroke: '#B8902A', 'stroke-width': 2 }, g);
        NS('text', { x: x + (i + 0.5) * 1000 * k, y: y + h / 2 + fs * 0.38, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5A4300', text: '1 km', 'pointer-events': 'none' }, g);
      }
      var p = 0;
      for (var m = 0; m < rest; m += 100, p++) {
        var w = Math.min(100, rest - m) * k;
        NS('rect', { x: x + (km * 1000 + m) * k, y: y + 2, width: w, height: h - 4, rx: 2, fill: p % 2 ? '#C9D3E6' : '#DCE4F2', stroke: '#7B8DB0', 'stroke-width': 1.5 }, g);
        if (100 * k > (narrow ? 70 : 34) && w >= 100 * k) NS('text', { x: x + (km * 1000 + m + 50) * k, y: y + h / 2 + 4, 'text-anchor': 'middle', 'font-size': narrow ? 15 : 10, 'font-weight': 800, fill: '#33415E', text: '100 m', 'pointer-events': 'none' }, g);
      }
    }
    // the ruler under a road: a tick every 100 m, a km stone at every 1,000 m
    function scale(g, x, y, max, k) {
      NS('line', { x1: x, y1: y, x2: x + max * k, y2: y, stroke: '#5B6478', 'stroke-width': 2 }, g);
      for (var m = 0; m <= max; m += 100) {
        var big = m % 1000 === 0, xx = x + m * k;
        NS('line', { x1: xx, y1: y, x2: xx, y2: y + (big ? 12 : 6), stroke: '#5B6478', 'stroke-width': big ? 2 : 1 }, g);
        if (big) {
          NS('rect', { x: xx - (narrow ? 26 : 18), y: y + 14, width: narrow ? 52 : 36, height: narrow ? 30 : 20, rx: 6, fill: '#EDEAE3', stroke: '#9A938A', 'stroke-width': 1.5 }, g);
          NS('text', { x: xx, y: y + (narrow ? 36 : 28), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 11, 'font-weight': 900, fill: '#3F3A33', text: m / 1000 + ' km', 'pointer-events': 'none' }, g);
        }
      }
      return narrow ? 50 : 38;
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var RH = narrow ? 56 : 34, FS = narrow ? 22 : 14;
      if (mode === 'show') {
        var R = (box.dataset.roads || '900,1020').split(',').map(Number), labs = (box.dataset.labs || 'Road A|Road B').split('|');
        var ks = BW / MAX, y = 8;
        R.forEach(function (len, i) {
          NS('text', { x: X0, y: y + FS, 'font-size': FS, 'font-weight': 900, fill: '#5B6478', text: (labs[i] || '').toUpperCase(), 'pointer-events': 'none' }, svg);
          y += FS + 6; road(NS('g', {}, svg), X0, y, len, ks, RH);
          NS('line', { x1: X0 + len * ks, y1: y - 4, x2: X0 + len * ks, y2: y + RH + 4, stroke: '#C9A227', 'stroke-width': 3, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
          y += RH + 12;
        });
        y += scale(NS('g', {}, svg), X0, y, MAX, ks);
        svg.setAttribute('viewBox', '0 0 700 ' + (y + 6)); msg(''); return;
      }
      if (mode === 'route') {
        var legs = (box.dataset.legs || '900,500,900,500').split(',').map(Number), dir = +box.dataset.direct || 2100;
        var P = [[40, 190], [210, 50], [350, 150], [500, 50], [660, 190]], tot = legs.reduce(function (a, b) { return a + b; }, 0);
        NS('line', { x1: P[0][0], y1: P[0][1], x2: P[4][0], y2: P[4][1], stroke: '#1D4FA8', 'stroke-width': 4, 'stroke-dasharray': '10 8' }, svg);
        NS('text', { x: 350, y: P[0][1] + (narrow ? 36 : 26), 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: 'straight path · ' + fm(dir), 'pointer-events': 'none' }, svg);
        NS('polyline', { points: P.map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: '#8A6A3A', 'stroke-width': narrow ? 14 : 10, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
        NS('polyline', { points: P.map(function (p) { return p.join(','); }).join(' '), fill: 'none', stroke: '#E9D9B5', 'stroke-width': narrow ? 4 : 3, 'stroke-dasharray': '8 8' }, svg);
        for (var i = 0; i < 4; i++) {
          var mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2, w = narrow ? 92 : 64;
          NS('rect', { x: mx - w / 2, y: my - (narrow ? 18 : 13), width: w, height: narrow ? 34 : 24, rx: 8, fill: '#fff', stroke: '#8A6A3A', 'stroke-width': 2 }, svg);
          NS('text', { x: mx, y: my + (narrow ? 8 : 5), 'text-anchor': 'middle', 'font-size': narrow ? 20 : 13, 'font-weight': 900, fill: '#5A3A1A', text: legs[i] + ' m', 'pointer-events': 'none' }, svg);
        }
        [[P[0], 'START'], [P[4], 'END']].forEach(function (q) {
          NS('circle', { cx: q[0][0], cy: q[0][1], r: narrow ? 14 : 10, fill: '#0E1C42' }, svg);
          NS('text', { x: q[0][0], y: q[0][1] - (narrow ? 22 : 16), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#0E1C42', text: q[1], 'pointer-events': 'none' }, svg);
        });
        var H = 236 + (narrow ? 12 : 0), bt = $('.kr-go', box);
        if (S.st) {
          var kk = BW / MAX, yy = H + 10, g2 = NS('g', {}, svg);
          NS('text', { x: X0, y: yy + FS, 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: 'STRAIGHT PATH', 'pointer-events': 'none' }, g2);
          yy += FS + 6; NS('rect', { x: X0, y: yy, width: dir * kk, height: RH * 0.7, rx: 4, fill: '#EAF3FF', stroke: '#1D4FA8', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g2);
          yy += RH * 0.7 + 12;
          NS('text', { x: X0, y: yy + FS, 'font-size': FS, 'font-weight': 900, fill: '#5A3A1A', text: 'THE ROAD, LAID OUT STRAIGHT', 'pointer-events': 'none' }, g2);
          yy += FS + 6; var x = X0;
          legs.forEach(function (L, j) { NS('rect', { x: x, y: yy, width: L * kk, height: RH * 0.7, rx: 3, fill: j % 2 ? '#C9A46A' : '#DDBE84', stroke: '#8A6A3A', 'stroke-width': 1.5 }, g2); NS('text', { x: x + L * kk / 2, y: yy + RH * 0.35 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#3A2A12', text: L + ' m', 'pointer-events': 'none' }, g2); x += L * kk; });
          yy += RH * 0.7 + 10; yy += scale(g2, X0, yy, MAX, kk); H = yy + 6;
          bt.disabled = true; flag(box, 'straight');
          msg('Both are laid out on the same scale now.', true);
        } else if (!out.innerHTML) msg('The road bends. The straight path does not.');
        svg.setAttribute('viewBox', '0 0 700 ' + H);
        return;
      }
      // build
      var k = BW / MAX, yR = 8 + (narrow ? 70 : 46), g = NS('g', {}, svg), lock = multi ? (S.d ? T[S.d - 1] : 0) : (S.d ? S.len : 0);
      NS('rect', { x: X0, y: yR, width: BW, height: RH, rx: 4, fill: '#F4F1EA', stroke: '#D8D2C4', 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, g);
      road(g, X0, yR, S.len, k, RH);
      T.forEach(function (t, i) {
        var tx = X0 + t * k, done = multi ? S.d > i : S.d > 0;
        NS('line', { x1: tx, y1: yR - (narrow ? 34 : 24), x2: tx, y2: yR + RH + 4, stroke: done ? '#1E7A4C' : '#B23A2E', 'stroke-width': 3, 'pointer-events': 'none' }, svg);
        NS('path', { d: 'M' + tx + ' ' + (yR - (narrow ? 34 : 24)) + ' l' + (narrow ? 26 : 18) + ' ' + (narrow ? 8 : 6) + ' l-' + (narrow ? 26 : 18) + ' ' + (narrow ? 8 : 6) + ' z', fill: done ? '#1E7A4C' : '#B23A2E', 'pointer-events': 'none' }, svg);
        NS('text', { x: tx, y: yR - (narrow ? 40 : 30), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#3A2A12', text: multi ? 'STOP ' + (i + 1) : (box.dataset.goal || 'GOAL'), 'pointer-events': 'none' }, svg);
      });
      var H2 = yR + RH + 8; H2 += scale(NS('g', {}, svg), X0, H2, MAX, k);
      svg.setAttribute('viewBox', '0 0 700 ' + (H2 + 6));
      var allDone = multi ? S.d >= T.length : S.d > 0;
      if (!allDone) {
        var ex = X0 + S.len * k, kn = NS('g', { class: 'drag kr-end', tabindex: 0, role: 'slider', 'aria-label': 'End of the road. Drag to build it.', 'aria-valuemin': lock, 'aria-valuemax': MAX, 'aria-valuenow': S.len }, svg);
        NS('circle', { cx: ex, cy: yR + RH / 2, r: narrow ? 26 : 18, fill: '#fff', stroke: '#0E1C42', 'stroke-width': 4 }, kn);
        NS('text', { x: ex, y: yR + RH / 2 + 6, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 16, 'font-weight': 900, fill: '#0E1C42', text: '▶', 'pointer-events': 'none' }, kn);
        var l0 = S.len, live = S.len, ghost = NS('rect', { x: X0 + S.len * k, y: yR + 2, width: 0, height: RH - 4, fill: '#7B8DB0', opacity: .35, 'pointer-events': 'none' }, svg);
        svg.insertBefore(ghost, kn);
        drag(kn, svg, function (pt) {
          var v = Math.max(lock, Math.min(MAX, Math.round((pt.x - X0) / k / 100) * 100)); if (v === live) return; live = v;
          kn.setAttribute('transform', 'translate(' + ((v - l0) * k) + ',0)');
          ghost.setAttribute('x', X0 + Math.min(v, l0) * k); ghost.setAttribute('width', Math.abs(v - l0) * k);
        }, function (pt) { if (pt) setLen(live); else draw(); }, function () { });
        kn.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -100 : e.key === 'ArrowRight' ? 100 : 0; if (!dv) return; e.preventDefault(); setLen(Math.max(lock, Math.min(MAX, S.len + dv))); var n = $('.kr-end', svg); if (n) n.focus(); });
      }
      if (multi) { for (var j = 0; j < S.d; j++) flag(box, 'stop' + (j + 1)); } else if (S.d) flag(box, 'road');
      if (!out.innerHTML) msg(allDone ? (multi ? '✓ The message reached every stop.' : '✓ The road reaches the ' + (box.dataset.goal || 'goal').toLowerCase() + '.') : 'The road starts at 0. Each piece is 100 m.', allDone);
    }
    function setLen(v) {
      var before = S.len; S.len = v;
      var crossed = Math.floor(v / 1000) > Math.floor(before / 1000);
      if (multi) {
        var t = T[S.d];
        if (v === t) { S.d++; save(); pluck(HZ.C5); draw(); msg('✓ The message reached stop ' + S.d + '.', true); return; }
      } else if (v === T[0]) { S.d = 1; save(); pluck(HZ.C5); draw(); msg('✓ The road reaches the ' + (box.dataset.goal || 'goal').toLowerCase() + '.', true); return; }
      save(); if (v !== before) pluck(crossed ? HZ.G4 : HZ.E4); draw();
      var tgt = multi ? T[S.d] : T[0];
      msg(crossed ? 'Ten pieces of 100 m just joined into 1 km!' : v > tgt ? 'The road goes past the ' + (multi ? 'stop' : (box.dataset.goal || 'goal').toLowerCase()) + '.' : 'The road has not reached the ' + (multi ? 'stop' : (box.dataset.goal || 'goal').toLowerCase()) + ' yet.');
    }
    if (mode === 'route') $('.kr-go', box).addEventListener('click', function () { if (S.st) return; S.st = 1; save(); pluck(HZ.G4); out.innerHTML = ''; draw(); });
    onWidth(box, draw); draw();
  };

  /* ── cutkm (3.11.04 subtracting from kilometers). data-km, data-orders "km:m,km:m". See tools/storybook/patch1104.py. ── */
  MODS.cutkm = function (box) {
    var M = +box.dataset.km || 6, name = box.dataset.name || 'cutkm';
    var O = (box.dataset.orders || '0:500').split(',').map(function (p) { var q = p.split(':'); return { k: +q[0] || 0, m: +q[1] || 0 }; });
    var multi = O.length > 1, G = [], T = [], gs = 0, ts = 0;
    O.forEach(function (o) { gs += o.k; ts += o.m; G.push(gs); T.push(ts); });
    function nm(base, i) { return multi ? base + (i + 1) : base; }
    function f(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    var S = mstate(name, { g: 0, b: 0, c: 0, d: 0 });
    var X0 = 14, BW = 672, narrow = false;
    box.innerHTML = '<div class="sb-stage sb-tiles"><svg viewBox="0 0 700 300" role="group" aria-label="A road of ' + M + ' whole kilometers"></svg></div>' +
      '<div class="sb-row ck-tools" style="margin-top:6px"><button type="button" class="sb-btn ck-break" aria-label="Break a kilometer">✂ Break a kilometer</button></div>' +
      '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), bb = $('.ck-break', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function cur() { return Math.min(S.d, O.length - 1); }
    function allDone() { return S.d >= O.length; }
    function give() {
      if (allDone()) return;
      var i = cur();
      if (S.g >= G[i]) { if (!S.b) { brk(); return; } msg('This part needs no more whole kilometers. Keep them on the road.'); return; }
      if (S.g + S.b >= M) return;
      S.g++; save(); pluck(HZ.D4); draw();
      msg('You took away ' + (S.g === 1 ? '1 whole kilometer.' : S.g + ' whole kilometers.'));
    }
    function brk() {
      if (allDone()) return;
      var i = cur();
      if (S.b) { msg('One kilometer is already open. Cut from it.'); return; }
      if (S.g < G[i]) { msg('Take away the whole kilometers first.'); return; }
      if (S.g >= M) return;
      S.b = 1; save(); pluck(HZ.G4); draw();
      msg('One kilometer is now 1,000 meters.');
    }
    bb.addEventListener('click', brk);
    function cutTo(v) {
      var i = cur(), lock = S.d ? T[S.d - 1] : 0, before = S.c;
      v = Math.max(lock, Math.min(1000, Math.round(v / 10) * 10)); S.c = v;
      var piece = S.c - lock;
      if (S.c === T[i] && S.g >= G[i]) { S.d = i + 1; save(); pluck(HZ.C5); draw(); msg('✓ Cut! That part is ' + f(piece) + ' m, just what you needed.', true); return; }
      save(); if (v !== before) pluck(HZ.E4); draw();
      msg(piece ? 'That part is ' + f(piece) + ' m. You need ' + f(O[i].m) + ' m.' : 'Drag the marker along the open kilometer.');
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var LH = narrow ? 30 : 16, BH = narrow ? 64 : 42, FS = narrow ? 22 : 13, i = cur(), lock = S.d ? T[S.d - 1] : 0;
      var yRow = 8 + LH + 6, gap = 4, u = (BW - gap * (M - 1)) / M, next = null;
      NS('text', { x: X0, y: 8 + LH - 4, 'font-size': narrow ? 22 : 14, 'font-weight': 900, fill: '#5B6478', text: 'ROAD · ' + M + ' WHOLE KILOMETERS', 'pointer-events': 'none' }, svg);
      // left to right: taken away, the open kilometer, whole kilometers still on the road
      var bx = 0;
      for (var n = 0; n < M; n++) {
        var x = X0 + n * (u + gap), kind = n < S.g ? 'gone' : (n === S.g && S.b) ? 'open' : 'road';
        if (kind === 'open') bx = x;
        var g = NS('g', {}, svg);
        if (kind === 'gone') {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#F1ECFA', stroke: '#6B46C1', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#6B46C1', text: u > (narrow ? 150 : 70) ? 'taken away' : '✓', 'pointer-events': 'none' }, g);
        } else if (kind === 'open') {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#EAF3FF', stroke: '#8FB2DA', 'stroke-width': 2 }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 5, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#1D4FA8', text: u > (narrow ? 90 : 60) ? 'open' : '✂', 'pointer-events': 'none' }, g);
        } else {
          NS('rect', { x: x, y: yRow, width: u, height: BH, rx: 4, fill: '#F6DE94', stroke: '#B8902A', 'stroke-width': 2 }, g);
          for (var tk = 1; tk < 10; tk++) NS('line', { x1: x + tk * u / 10, y1: yRow, x2: x + tk * u / 10, y2: yRow + (tk === 5 ? BH * .3 : BH * .18), stroke: '#8A6A00', 'stroke-width': 1, 'pointer-events': 'none' }, g);
          NS('text', { x: x + u / 2, y: yRow + BH / 2 + 7, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 15, 'font-weight': 900, fill: '#5A4300', text: '1 km', 'pointer-events': 'none' }, g);
          var can = !allDone() && S.g < G[i];
          g.setAttribute('class', 'ck-k' + (can && !next ? ' ck-next' : ''));
          g.setAttribute('role', 'button'); g.setAttribute('tabindex', can ? 0 : -1);
          g.setAttribute('aria-label', 'Whole kilometer on the road' + (can ? '. Tap to take it away.' : ''));
          if (can) { g.style.cursor = 'pointer'; if (!next) next = g; }
          drag(g, svg, null, function () { }, give);
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); give(); } });
        }
      }
      var H = yRow + BH + (narrow ? 14 : 10);
      bb.disabled = !!S.b || allDone();
      bb.classList.toggle('ck-next', !next && !S.b && !allDone());
      if (!next && !S.b && !allDone()) next = bb;
      if (S.b) {
        // the open kilometer, drawn large: 1,000 meters, a mark every 10 m, a number every 100 m
        var yS = H + (narrow ? 70 : 48), k = BW / 1000, sh = narrow ? 66 : 46;
        NS('polygon', { points: bx + ',' + (yRow + BH) + ' ' + (bx + u) + ',' + (yRow + BH) + ' ' + (X0 + BW) + ',' + yS + ' ' + X0 + ',' + yS, fill: '#8FB2DA', opacity: .18, 'pointer-events': 'none' }, svg);
        NS('text', { x: X0, y: yS - (narrow ? 44 : 30), 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: 'THE OPEN KILOMETER · 1,000 METERS', 'pointer-events': 'none' }, svg);
        NS('rect', { x: X0, y: yS, width: BW, height: sh, rx: 3, fill: '#EAF3FF', stroke: '#8FB2DA', 'stroke-width': 2 }, svg);
        for (var o = 0; o < S.d && o < O.length; o++) {
          var a = o ? T[o - 1] : 0, w = T[o] - a;
          if (w > 0) { NS('rect', { x: X0 + a * k, y: yS, width: w * k, height: sh, fill: multi && o < S.d - 1 ? '#C7B6EE' : '#B9A6E8', stroke: '#6B46C1', 'stroke-width': 1.5 }, svg); }
        }
        var shade = NS('rect', { class: 'ck-shade', x: X0 + lock * k, y: yS, width: Math.max(0, (S.c - lock) * k), height: sh, fill: '#6B46C1', opacity: .55, 'pointer-events': 'none' }, svg);
        for (var c = 0; c <= 1000; c += 10) {
          var big = c % 100 === 0, mid = c % 50 === 0, xx = X0 + c * k;
          NS('line', { x1: xx, y1: yS, x2: xx, y2: yS + (big ? sh * .5 : mid ? sh * .34 : sh * .2), stroke: '#1F2A44', 'stroke-width': big ? 1.8 : 1, 'pointer-events': 'none' }, svg);
          if (big && (!narrow || c % 200 === 0)) NS('text', { x: c === 1000 ? xx + 4 : xx, y: yS + sh - 5, 'text-anchor': c === 1000 ? 'end' : 'middle', 'font-size': narrow ? 20 : 11, 'font-weight': 800, fill: '#0E1C42', text: f(c), 'pointer-events': 'none' }, svg);
        }
        for (var p = 0; p < S.d && p < O.length; p++) {
          var a2 = p ? T[p - 1] : 0;
          if (T[p] - a2 >= (narrow ? 140 : 80)) NS('text', { x: X0 + (a2 + T[p]) / 2 * k, y: yS + sh + (narrow ? 26 : 16), 'text-anchor': 'middle', 'font-size': narrow ? 18 : 12, 'font-weight': 900, fill: '#6B46C1', text: multi ? 'part ' + (p + 1) : 'cut off', 'pointer-events': 'none' }, svg);
        }
        var ex = X0 + S.c * k, ky = yS - (narrow ? 26 : 18);
        var gl = NS('line', { x1: ex, y1: ky, x2: ex, y2: yS + sh + 4, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
        H = yS + sh + (narrow ? 36 : 24);
        if (!allDone()) {
          var kn = NS('g', { class: 'drag ck-sc' + (!next ? ' ck-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'End of the cut. Drag the marker.', 'aria-valuemin': lock, 'aria-valuemax': 1000, 'aria-valuenow': S.c }, svg);
          NS('circle', { cx: ex, cy: ky, r: narrow ? 24 : 17, fill: '#fff', stroke: '#6B46C1', 'stroke-width': 4 }, kn);
          NS('text', { x: ex, y: ky + 6, 'text-anchor': 'middle', 'font-size': narrow ? 22 : 16, 'font-weight': 900, fill: '#6B46C1', text: '✂', 'pointer-events': 'none' }, kn);
          var c0 = S.c, live = S.c;
          drag(kn, svg, function (pt) {
            var v = Math.max(lock, Math.min(1000, Math.round((pt.x - X0) / k / 10) * 10)); if (v === live) return; live = v;
            kn.setAttribute('transform', 'translate(' + ((v - c0) * k) + ',0)'); gl.setAttribute('x1', X0 + v * k); gl.setAttribute('x2', X0 + v * k);
            shade.setAttribute('width', Math.max(0, (v - lock) * k));
          }, function (pt) { if (pt) cutTo(live); else draw(); }, function () { });
          kn.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowLeft' ? -10 : e.key === 'ArrowRight' ? 10 : 0; if (!dv) return; e.preventDefault(); cutTo(S.c + dv); var nn = $('.ck-sc', svg); if (nn) nn.focus(); });
        }
      }
      svg.setAttribute('viewBox', '0 0 700 ' + H);
      // flags: what is done stays done
      O.forEach(function (od, j) {
        if (od.k && S.g >= G[j]) flag(box, nm('km', j));
        if (j === 0 && S.b) flag(box, nm('break', j));
        if (S.d > j) flag(box, nm('cut', j));
      });
      if (!out.innerHTML) msg(allDone() ? (multi ? '✓ Both parts are cut.' : '✓ The part is cut.') : 'The road has ' + M + ' whole kilometers.', allDone());
    }
    onWidth(box, draw); draw();
  };

  /* ── beaker (3.11.05 liters and milliliters). See tools/storybook/patch1105.py. ── */
  MODS.beaker = function (box) {
    var name = box.dataset.name || 'beaker', DO = ' ' + (box.dataset.do || '') + ' ', T = +box.dataset.t || 0;
    var B = (box.dataset.beakers || '1000:50:100:0').split(',').map(function (p) { var q = p.split(':'); return { cap: +q[0], tk: +q[1], lab: +q[2], v0: +q[3], liq: q[4] || 'water' }; });
    var bt = (box.dataset.bottles || '0:tap').split(':'), NB = +bt[0] || 0, BM = bt[1] || 'tap', two = B.length > 1;
    var S = mstate(name, { v: B.map(function (b) { return b.v0; }), p: -1, f: [], poured: [] });
    while (S.f.length < NB) S.f.push(0);
    function f(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    var LET = ['A', 'B'], narrow = false;
    box.innerHTML = '<div class="sb-stage sb-bk"><svg viewBox="0 0 700 330" role="group" aria-label="' + (two ? 'Two beakers' : 'A beaker') + (NB ? ' and ' + NB + ' empty 1 liter bottle' + (NB > 1 ? 's' : '') : '') + '"></svg></div>' +
      (BM === 'pour' && NB ? '<div class="sb-row bk-tools" style="margin-top:6px">' + B.map(function (b, i) { return '<button type="button" class="sb-btn bk-pour" data-i="' + i + '" aria-label="Pour beaker ' + LET[i] + ' into the bottle">⤵ Pour beaker ' + (two ? LET[i] + ' ' : '') + 'into the bottle</button>'; }).join('') + '</div>' : '') +
      '<div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function full(i) { return S.f[i] >= 1000; }
    function pour(i) {
      if (S.v[i] <= 0) { msg('Beaker ' + (two ? LET[i] + ' ' : '') + 'is empty.'); return; }
      var j = S.f.findIndex(function (x) { return x < 1000; });
      if (j < 0) { msg('Every bottle is full.'); return; }
      var room = 1000 - S.f[j], go = Math.min(room, S.v[i]); S.f[j] += go; S.v[i] -= go; S.poured[i] = 1; save(); pluck(full(j) ? HZ.C5 : HZ.E4); draw();
      msg(full(j) && S.v[i] ? 'The bottle is full. Some is still in the beaker.' : full(j) ? 'The bottle is full, and the beaker is empty.' : 'The beaker is empty. The bottle is not full yet.', full(j));
    }
    $$('.bk-pour', box).forEach(function (b) { b.addEventListener('click', function () { pour(+b.dataset.i); }); });
    function tapBottle(j) {
      if (BM !== 'tap' || full(j)) return;
      S.f[j] = 1000; save(); pluck(HZ.G4); draw();
      var n = S.f.filter(function (x) { return x >= 1000; }).length;
      msg(n === 1 ? '1 bottle is full.' : n + ' bottles are full.', n === NB);
    }
    function setFill(v) {
      var b = B[0]; v = Math.max(0, Math.min(b.cap, Math.round(v / b.tk) * b.tk)); var was = S.v[0]; S.v[0] = v; save(); if (v !== was) pluck(HZ.E4); draw();
      msg(v === T ? '✓ The beaker is filled to the mark you need.' : v ? 'Drag the top of the water. Stop at the mark the step tells you.' : 'The beaker is empty. Drag up to fill it.', v === T);
    }
    function setPtr(m) {
      var b = B[0]; m = Math.max(0, Math.min(b.cap / b.tk, m)); S.p = m;
      var at = m * b.tk === S.v[0]; if (at) S.rd = 1; save(); pluck(HZ.D4); draw();
      msg(at ? '✓ The pointer is at the top of the ' + (b.liq === 'milk' ? 'milk' : 'water') + '. It is ' + m + ' mark' + (m === 1 ? '' : 's') + ' up.' : 'The pointer is ' + m + ' mark' + (m === 1 ? '' : 's') + ' up.', at);
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var FS = narrow ? 22 : 13, bw = narrow ? 120 : 112, bh = narrow ? 360 : 250, y0 = narrow ? 52 : 40, yB = y0 + bh, next = null;
      var gx = []; B.forEach(function (b, i) { gx.push((narrow ? 92 : 78) + i * (bw + (narrow ? 112 : 100))); });
      B.forEach(function (b, i) {
        var x = gx[i], col = b.liq === 'milk' ? ['#EFE3C2', '#9C8650'] : ['#9CC8EE', '#3B7DC4'];
        function Y(v) { return yB - v / b.cap * bh; }
        var LB = b.lab; while (bh / (b.cap / LB) < FS * 1.15) LB *= 2;
        NS('text', { x: x + bw / 2, y: y0 - (narrow ? 22 : 16), 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#5B6478', text: (two ? (narrow ? LET[i] + ' · ' : 'BEAKER ' + LET[i] + ' · ') : 'BEAKER · ') + f(b.cap) + ' mL', 'pointer-events': 'none' }, svg);
        NS('path', { d: 'M' + (x - 6) + ' ' + (y0 - 4) + ' L' + x + ' ' + y0 + ' L' + x + ' ' + (yB - 8) + ' Q' + x + ' ' + yB + ' ' + (x + 8) + ' ' + yB + ' L' + (x + bw - 8) + ' ' + yB + ' Q' + (x + bw) + ' ' + yB + ' ' + (x + bw) + ' ' + (yB - 8) + ' L' + (x + bw) + ' ' + y0, fill: '#F7FAFD', stroke: '#5B6478', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
        if (S.v[i] > 0) {
          var wy = Y(S.v[i]);
          NS('path', { class: 'bk-liq', d: 'M' + (x + 1.5) + ' ' + wy + ' L' + (x + bw - 1.5) + ' ' + wy + ' L' + (x + bw - 1.5) + ' ' + (yB - 8) + ' Q' + (x + bw - 1.5) + ' ' + (yB - 1.5) + ' ' + (x + bw - 8) + ' ' + (yB - 1.5) + ' L' + (x + 8) + ' ' + (yB - 1.5) + ' Q' + (x + 1.5) + ' ' + (yB - 1.5) + ' ' + (x + 1.5) + ' ' + (yB - 8) + ' Z', fill: col[0], 'pointer-events': 'none' }, svg);
          NS('line', { x1: x + 1.5, y1: wy, x2: x + bw - 1.5, y2: wy, stroke: col[1], 'stroke-width': 2.5, 'pointer-events': 'none' }, svg);
        }
        for (var m = b.tk; m <= b.cap; m += b.tk) {
          var big = m % b.lab === 0, yy = Y(m);
          NS('line', { x1: x, y1: yy, x2: x + (big ? 26 : 13), y2: yy, stroke: '#1F2A44', 'stroke-width': big ? 2 : 1.2, 'pointer-events': 'none' }, svg);
          if (m % LB === 0) NS('text', { x: x - 10, y: yy + FS * .36, 'text-anchor': 'end', 'font-size': FS, 'font-weight': 800, fill: '#0E1C42', text: f(m), 'pointer-events': 'none' }, svg);
        }
        NS('text', { x: x - 10, y: yB + FS * .36, 'text-anchor': 'end', 'font-size': FS, 'font-weight': 800, fill: '#0E1C42', text: '0', 'pointer-events': 'none' }, svg);
        if (i === 0 && DO.indexOf(' read ') > -1 && !S.poured[0]) {
          var pm = S.p < 0 ? 0 : S.p, py = Y(pm * b.tk), hit = NS('rect', { x: x - 2, y: y0, width: 40, height: bh, fill: 'transparent', style: 'cursor:pointer' }, svg);
          for (var lm = 1; lm <= pm; lm++) NS('line', { x1: x, y1: Y(lm * b.tk), x2: x + (lm * b.tk % b.lab === 0 ? 26 : 13), y2: Y(lm * b.tk), stroke: '#C9A227', 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
          var pg = NS('g', { class: 'drag bk-ptr' + (pm * b.tk !== S.v[0] ? ' bk-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'Gold pointer on the marks. Drag it up.', 'aria-valuemin': 0, 'aria-valuemax': b.cap / b.tk, 'aria-valuenow': pm }, svg);
          var r = narrow ? 17 : 13;
          NS('rect', { x: x, y: py - r - 2, width: bw + 2 * r + 8, height: 2 * r + 4, fill: 'transparent', style: 'cursor:grab' }, pg);
          NS('path', { d: 'M' + (x + bw + 4) + ' ' + py + ' l' + (2 * r) + ' ' + (-r) + ' l0 ' + (2 * r) + ' Z', fill: '#C9A227', stroke: '#8A6A00', 'stroke-width': 1.5 }, pg);
          NS('line', { x1: x, y1: py, x2: x + bw + 4, y2: py, stroke: '#C9A227', 'stroke-width': 2, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, pg);
          if (pm) NS('text', { x: x + bw + 2 * r + 10, y: py + FS * .36, 'font-size': FS, 'font-weight': 900, fill: '#8A6A00', text: pm + ' mark' + (pm === 1 ? '' : 's') + ' up', 'pointer-events': 'none' }, svg);
          if (!next && pm * b.tk !== S.v[0]) next = pg;
          var p0 = pm, live = pm;
          drag(pg, svg, function (pt) { var v = Math.max(0, Math.min(b.cap / b.tk, Math.round((yB - pt.y) / bh * b.cap / b.tk))); if (v === live) return; live = v; pg.setAttribute('transform', 'translate(0,' + (Y(v * b.tk) - Y(p0 * b.tk)) + ')'); }, function (pt) { if (pt) setPtr(live); else draw(); }, function () { });
          drag(hit, svg, null, function () { }, function (e) { setPtr(Math.round((yB - svgPt(svg, e).y) / bh * b.cap / b.tk)); });
          pg.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0; if (!dv) return; e.preventDefault(); setPtr((S.p < 0 ? 0 : S.p) + dv); var nn = $('.bk-ptr', svg); if (nn) nn.focus(); });
        }
        if (i === 0 && DO.indexOf(' fill ') > -1 && (DO.indexOf(' read ') < 0 || S.rd)) {
          var fy = Y(S.v[0]), fg = NS('g', { class: 'drag bk-fill' + (S.v[0] !== T ? ' bk-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'Top of the water. Drag it up or down.', 'aria-valuemin': 0, 'aria-valuemax': b.cap, 'aria-valuenow': S.v[0] }, svg);
          var hr = narrow ? 20 : 15;
          NS('rect', { x: x + bw / 2 - 2 * hr, y: fy - hr, width: 4 * hr, height: 2 * hr, rx: hr, fill: '#fff', stroke: '#3B7DC4', 'stroke-width': 3 }, fg);
          NS('text', { x: x + bw / 2, y: fy + FS * .36, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: '↕', 'pointer-events': 'none' }, fg);
          if (!next && S.v[0] !== T) next = fg;
          var v0 = S.v[0], lv = S.v[0];
          drag(fg, svg, function (pt) { var v = Math.max(0, Math.min(b.cap, Math.round((yB - pt.y) / bh * b.cap / b.tk) * b.tk)); if (v === lv) return; lv = v; fg.setAttribute('transform', 'translate(0,' + (Y(v) - Y(v0)) + ')'); }, function (pt) { if (pt) setFill(lv); else draw(); }, function () { });
          fg.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowUp' ? b.tk : e.key === 'ArrowDown' ? -b.tk : 0; if (!dv) return; e.preventDefault(); setFill(S.v[0] + dv); var nn = $('.bk-fill', svg); if (nn) nn.focus(); });
        }
      });
      // 1 L bottles
      var bx0 = gx[B.length - 1] + bw + (narrow ? 120 : 110), room = 700 - 12 - bx0, sp = NB ? Math.min(narrow ? 150 : 104, room / NB) : 0, ow = Math.min(narrow ? 92 : 64, sp - 10), bodyH = narrow ? 230 : 160, by = yB;
      if (NB > 3 && narrow) { sp = room / Math.min(NB, 3); ow = Math.min(ow, sp - 10); }
      for (var j = 0; j < NB; j++) {
        var rowN = narrow && NB > 3 ? Math.floor(j / 3) : 0, cx = bx0 + (narrow && NB > 3 ? j % 3 : j) * sp + sp / 2, yb = narrow && NB > 3 ? (rowN ? yB : yB - bodyH / 2 - 60) : by;
        var bh2 = narrow && NB > 3 ? bodyH * .55 : bodyH, nk = ow * .38, top = yb - bh2, g = NS('g', {}, svg);
        NS('path', { d: 'M' + (cx - ow / 2) + ' ' + (yb - 10) + ' L' + (cx - ow / 2) + ' ' + (top + 18) + ' Q' + (cx - ow / 2) + ' ' + top + ' ' + (cx - nk / 2) + ' ' + (top - 8) + ' L' + (cx - nk / 2) + ' ' + (top - 34) + ' L' + (cx + nk / 2) + ' ' + (top - 34) + ' L' + (cx + nk / 2) + ' ' + (top - 8) + ' Q' + (cx + ow / 2) + ' ' + top + ' ' + (cx + ow / 2) + ' ' + (top + 18) + ' L' + (cx + ow / 2) + ' ' + (yb - 10) + ' Q' + (cx + ow / 2) + ' ' + yb + ' ' + (cx + ow / 2 - 10) + ' ' + yb + ' L' + (cx - ow / 2 + 10) + ' ' + yb + ' Q' + (cx - ow / 2) + ' ' + yb + ' ' + (cx - ow / 2) + ' ' + (yb - 10), fill: '#F3FAF5', stroke: '#4C7A5A', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
        if (S.f[j] > 0) {
          var lh = (bh2 - 6) * Math.min(1, S.f[j] / 1000), liq = B.some(function (b) { return b.liq === 'milk'; }) ? '#EFE3C2' : '#9CC8EE';
          NS('rect', { x: cx - ow / 2 + 2, y: yb - 2 - lh, width: ow - 4, height: lh, rx: 6, fill: liq, stroke: liq === '#EFE3C2' ? '#9C8650' : '#3B7DC4', 'stroke-width': 1.5, 'pointer-events': 'none' }, g);
          if (full(j)) NS('text', { x: cx, y: yb - bh2 / 2 + FS * .36, 'text-anchor': 'middle', 'font-size': narrow ? 18 : 11.5, 'font-weight': 900, fill: '#0E1C42', text: '1,000 mL', 'pointer-events': 'none' }, g);
        }
        NS('rect', { x: cx - ow * .36, y: top + 12, width: ow * .72, height: FS + 8, rx: 4, fill: '#fff', stroke: '#4C7A5A', 'stroke-width': 1.5, 'pointer-events': 'none' }, g);
        NS('text', { x: cx, y: top + 12 + FS * .98, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#2E5B3C', text: '1 L', 'pointer-events': 'none' }, g);
        if (BM === 'tap') {
          var can = !full(j);
          var first = can && S.f.findIndex(function (x) { return x < 1000; }) === j;
          g.setAttribute('class', 'bk-bot' + (first ? ' bk-next' : '')); g.setAttribute('role', 'button'); g.setAttribute('tabindex', can ? 0 : -1);
          g.setAttribute('aria-label', '1 liter bottle' + (can ? ', empty. Tap to fill it.' : ', full.'));
          if (can) { g.style.cursor = 'pointer'; if (!next) next = g; }
          (function (jj) { drag(g, svg, null, function () { }, function () { tapBottle(jj); }); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapBottle(jj); } }); })(j);
        }
      }
      $$('.bk-pour', box).forEach(function (pb) { var i = +pb.dataset.i, need = !S.poured[i] && (i === 0 || S.poured[i - 1]); pb.disabled = S.v[i] <= 0 || S.f.every(function (x) { return x >= 1000; }); pb.classList.toggle('bk-next', need && !pb.disabled); });
      svg.setAttribute('viewBox', '0 0 700 ' + (yB + (narrow ? 26 : 18)));
      // flags: what is done stays done
      var b0 = B[0];
      if (DO.indexOf(' read ') > -1 && S.p >= 0 && S.p * b0.tk === S.v[0]) flag(box, 'marks');
      if (DO.indexOf(' fill ') > -1 && T && S.v[0] === T) flag(box, 'fill');
      if (NB && BM === 'tap' && S.f.every(function (x) { return x >= 1000; })) flag(box, 'b');
      B.forEach(function (b, i) { if (S.poured[i]) flag(box, two ? 'pour' + (i + 1) : 'pour'); });
      if (!out.innerHTML) msg(DO.indexOf(' read ') > -1 ? 'Drag the gold pointer up the marks.' : NB && BM === 'tap' ? 'Each bottle holds 1 liter.' : DO.indexOf(' fill ') > -1 ? 'Drag the top of the water.' : NB ? 'The bottle is empty. It holds 1 liter.' : '');
    }
    onWidth(box, draw); draw();
  };

  /* ── thermo (3.11.05 reading a thermometer, °F and °C on one tube). See tools/storybook/patch1105.py. ── */
  MODS.thermo = function (box) {
    var name = box.dataset.name || 'thermo', DO = ' ' + (box.dataset.do || 'read') + ' ', T = +box.dataset.t || 0, LO = 30, HI = 110;
    var S = mstate(name, { f: +box.dataset.f || 70, p: -1 });
    box.innerHTML = '<div class="sb-stage sb-th"><svg viewBox="0 0 700 460" role="group" aria-label="A thermometer with degrees Fahrenheit on the left and degrees Celsius on the right"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), narrow = false;
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function setP(v) { v = Math.max(LO, Math.min(HI, Math.round(v / 2) * 2)); S.p = v; if (v === S.f) S.r = 1; save(); pluck(HZ.D4); draw(); msg(v === S.f ? '✓ The pointer is at the top of the red line.' : 'Keep going. Stop at the top of the red line.', v === S.f); }
    function setF(v) { v = Math.max(LO, Math.min(HI, Math.round(v / 2) * 2)); var was = S.f; S.f = v; S.p = v; save(); if (v !== was) pluck(v > was ? HZ.G4 : HZ.D4); draw(); msg(v === T ? '✓ The red line is at the temperature you need.' : v > was ? 'Warmer: the red line went up.' : v < was ? 'Cooler: the red line went down.' : '', v === T); }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var FS = narrow ? 22 : 14, cx = 350, tw = narrow ? 34 : 26, yT = 40, yL = narrow ? 560 : 400, H = yL - yT, next = null;
      function Y(F) { return yL - (F - LO) / (HI - LO) * H; }
      NS('text', { x: cx - 120, y: 24, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#B23A2E', text: '°F', 'pointer-events': 'none' }, svg);
      NS('text', { x: cx + 120, y: 24, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#1D4FA8', text: '°C', 'pointer-events': 'none' }, svg);
      NS('rect', { x: cx - tw / 2, y: yT - 14, width: tw, height: H + 30, rx: tw / 2, fill: '#F7FAFD', stroke: '#5B6478', 'stroke-width': 3 }, svg);
      NS('circle', { cx: cx, cy: yL + 34, r: tw * 1.05, fill: '#D9473A', stroke: '#5B6478', 'stroke-width': 3 }, svg);
      NS('rect', { x: cx - tw / 2 + 7, y: Y(S.f), width: tw - 14, height: yL + 34 - Y(S.f), fill: '#D9473A', 'pointer-events': 'none' }, svg);
      for (var F = LO; F <= HI; F += 2) { var big = F % 10 === 0, y = Y(F); NS('line', { x1: cx - tw / 2 - (big ? 34 : 18), y1: y, x2: cx - tw / 2 - 2, y2: y, stroke: '#1F2A44', 'stroke-width': big ? 2 : 1.2, 'pointer-events': 'none' }, svg); if (big) NS('text', { x: cx - tw / 2 - 42, y: y + FS * .36, 'text-anchor': 'end', 'font-size': FS, 'font-weight': 800, fill: '#0E1C42', text: F, 'pointer-events': 'none' }, svg); }
      for (var C = -1; C <= 43; C++) { var yc = Y(C * 9 / 5 + 32), bc = C % 10 === 0; NS('line', { x1: cx + tw / 2 + 2, y1: yc, x2: cx + tw / 2 + (bc ? 34 : C % 5 === 0 ? 24 : 16), y2: yc, stroke: '#1F2A44', 'stroke-width': bc ? 2 : 1.2, 'pointer-events': 'none' }, svg); if (bc) NS('text', { x: cx + tw / 2 + 42, y: yc + FS * .36, 'font-size': FS, 'font-weight': 800, fill: '#0E1C42', text: C, 'pointer-events': 'none' }, svg); }
      if (DO.indexOf(' read ') > -1) {
        var pv = S.p < 0 ? LO : S.p, py = Y(pv), r = narrow ? 17 : 13;
        var pg = NS('g', { class: 'drag th-ptr' + (pv !== S.f ? ' th-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'Gold pointer. Drag it up the marks.', 'aria-valuemin': LO, 'aria-valuemax': HI, 'aria-valuenow': pv }, svg);
        // the line skips the two columns of numbers, so it never runs through a label
        [[cx - 190, cx - tw / 2 - 46 - FS * 1.9], [cx - tw / 2 - 38, cx + tw / 2 + 38], [cx + tw / 2 + 46 + FS * 1.3, cx + 190]].forEach(function (sg) { NS('line', { x1: sg[0], y1: py, x2: sg[1], y2: py, stroke: '#C9A227', 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, pg); });
        NS('path', { d: 'M' + (cx - 192) + ' ' + py + ' l' + (-2 * r) + ' ' + (-r) + ' l0 ' + (2 * r) + ' Z', fill: '#C9A227', stroke: '#8A6A00', 'stroke-width': 1.5 }, pg);
        NS('rect', { x: cx - 200 - 2 * r, y: py - r - 4, width: 390 + 2 * r, height: 2 * r + 8, fill: 'transparent', style: 'cursor:grab' }, pg);
        if (pv !== S.f && !next) next = pg;
        var p0 = pv, live = pv;
        drag(pg, svg, function (pt) { var v = Math.max(LO, Math.min(HI, Math.round((LO + (yL - pt.y) / H * (HI - LO)) / 2) * 2)); if (v === live) return; live = v; pg.setAttribute('transform', 'translate(0,' + (Y(v) - Y(p0)) + ')'); }, function (pt) { if (pt) setP(live); else draw(); }, function () { });
        pg.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowUp' ? 2 : e.key === 'ArrowDown' ? -2 : 0; if (!dv) return; e.preventDefault(); setP((S.p < 0 ? LO : S.p) + dv); var nn = $('.th-ptr', svg); if (nn) nn.focus(); });
      }
      if (DO.indexOf(' drag ') > -1 && (DO.indexOf(' read ') < 0 || S.r)) {
        var hy = Y(S.f), hr = narrow ? 20 : 15, hg = NS('g', { class: 'drag th-top' + (S.f !== T ? ' th-next' : ''), tabindex: 0, role: 'slider', 'aria-label': 'Top of the red line. Drag it up or down.', 'aria-valuemin': LO, 'aria-valuemax': HI, 'aria-valuenow': S.f }, svg);
        NS('circle', { cx: cx, cy: hy, r: hr, fill: '#fff', stroke: '#B23A2E', 'stroke-width': 4 }, hg);
        NS('text', { x: cx, y: hy + FS * .36, 'text-anchor': 'middle', 'font-size': FS, 'font-weight': 900, fill: '#B23A2E', text: '↕', 'pointer-events': 'none' }, hg);
        if (S.f !== T && !next) next = hg;
        var f0 = S.f, lf = S.f;
        drag(hg, svg, function (pt) { var v = Math.max(LO, Math.min(HI, Math.round((LO + (yL - pt.y) / H * (HI - LO)) / 2) * 2)); if (v === lf) return; lf = v; hg.setAttribute('transform', 'translate(0,' + (Y(v) - Y(f0)) + ')'); }, function (pt) { if (pt) setF(lf); else draw(); }, function () { });
        hg.addEventListener('keydown', function (e) { var dv = e.key === 'ArrowUp' ? 2 : e.key === 'ArrowDown' ? -2 : 0; if (!dv) return; e.preventDefault(); setF(S.f + dv); var nn = $('.th-top', svg); if (nn) nn.focus(); });
      }
      svg.setAttribute('viewBox', '0 0 700 ' + (yL + 34 + tw * 1.05 + 10));
      if (DO.indexOf(' read ') > -1 && S.r) flag(box, 'read');
      if (T && S.f === T && (S.r || DO.indexOf(' read ') < 0)) flag(box, 'temp');
      if (!out.innerHTML) msg(DO.indexOf(' read ') > -1 && S.p !== S.f ? 'Drag the gold pointer up to the top of the red line.' : '');
    }
    onWidth(box, draw); draw();
  };

  /* ── weigh (3.11.06 kilograms and grams): dial scale, weight mat, balance. See tools/storybook/patch1106.py. ── */
  MODS.weigh = function (box) {
    var name = box.dataset.name || 'weigh', K = box.dataset.kind || 'dial', T = +box.dataset.t || 0, CMP = !!box.dataset.compare;
    var MX = +box.dataset.max || 2000, TK = +box.dataset.tick || 100;
    var IT = (box.dataset.items || '').split(',').filter(Boolean).map(function (p) { var q = p.split(':'); return { n: q[0], g: +q[1], l: q[2] || q[0] }; });
    var WT = (box.dataset.weights || '').split(',').filter(Boolean).map(Number);
    var S = mstate(name, { on: K === 'balance' && !CMP && IT.length ? [0] : [], w: [] });
    function f(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function wl(g) { return g >= 1000 ? (g / 1000) + ' kg' : g + ' g'; }
    var narrow = false;
    box.innerHTML = '<div class="sb-stage sb-wg"><svg viewBox="0 0 700 460" role="group" aria-label="' + (K === 'dial' ? 'A scale with a dial' : K === 'mat' ? 'A weight mat' : 'A balance with two pans') + '"></svg></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box);
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:#1E7A4C">' + h + '</span>' : h; }
    function itemsOn() { return S.on.map(function (i) { return IT[i]; }); }
    function sumW() { return S.w.reduce(function (a, b) { return a + b; }, 0); }
    function load() { return itemsOn().reduce(function (a, it) { return a + it.g; }, 0) + (K === 'balance' ? 0 : sumW()); }
    function leftG() { return CMP ? (S.on.indexOf(0) > -1 ? IT[0].g : 0) : (IT[0] ? IT[0].g : 0); }
    function rightG() { return CMP ? (S.on.indexOf(1) > -1 ? IT[1].g : 0) : sumW(); }
    function addW(g) {
      if (K === 'dial' && load() + g > MX) { msg('That is too heavy for this scale.'); return; }
      S.w.push(g); save(); pluck(g >= 500 ? HZ.C4 : g >= 100 ? HZ.E4 : HZ.G4); after();
    }
    function remW(i) { S.w.splice(i, 1); save(); pluck(HZ.D4); after(); }
    function putItem(i) {
      if (S.on.indexOf(i) > -1) return;
      if (CMP && i === 1 && S.on.indexOf(0) < 0) { msg('Put ' + IT[0].l + ' on the left pan first.'); return; }
      if (box.dataset.inorder && i > 0 && S.on.indexOf(i - 1) < 0) { msg('Put the ' + IT[i - 1].l + ' on the scale first.'); return; }
      S.on.push(i); save(); pluck(HZ.C4); after();
    }
    function after() { draw(); say(); }
    function say() {
      if (K === 'balance') {
        if (CMP) { msg(S.on.length < 2 ? (S.on.length ? IT[0].l + ' is on the left pan.' : 'Put each bag on a pan.') : 'The pan with ' + (IT[0].g > IT[1].g ? IT[0].l : IT[1].l) + ' went down.', S.on.length === 2); return; }
        var L = leftG(), R = rightG();
        msg(!R ? 'The box is on the left pan. Add weights to the right pan.' : R === L ? '✓ The pans are level.' : R < L ? 'The right pan is still too light. Add more.' : 'Too heavy! Tap a weight on the right pan to take it off.', R === L);
        return;
      }
      if (K === 'dial') { var n = S.w.length; msg(itemsOn().length ? (itemsOn().length > 1 ? 'The ' + itemsOn().map(function (x) { return x.l; }).join(' and the ') + ' are' : 'The ' + itemsOn()[0].l + (/s$/.test(itemsOn()[0].l) ? ' are' : ' is')) + ' on the scale. Read the dial.' : n ? 'Weights on the scale: ' + S.w.slice().sort(function (a, b) { return b - a; }).map(wl).join(', ') + '.' : 'Nothing is on the scale yet.', T ? load() === T : itemsOn().length > 0); return; }
      var cnt = {}; S.w.forEach(function (g) { cnt[g] = (cnt[g] || 0) + 1; });
      msg(S.w.length ? 'On the mat: ' + Object.keys(cnt).map(Number).sort(function (a, b) { return b - a; }).map(function (g) { return cnt[g] + ' × ' + wl(g); }).join(', ') + '.' : 'The mat is empty.', T && load() === T);
    }
    // a weight: gold kilogram, brass grams; size by mass
    function weight(g, x, y, s, parent) {
      var k = g >= 1000, h = (k ? 54 : g >= 500 ? 46 : g >= 200 ? 40 : g >= 100 ? 34 : g >= 50 ? 30 : 26) * s, w = (k ? 56 : g >= 500 ? 48 : g >= 200 ? 42 : g >= 100 ? 36 : g >= 50 ? 32 : 28) * s;
      var gg = NS('g', {}, parent);
      NS('rect', { x: x - w / 2, y: y - h, width: w, height: h, rx: 6 * s, fill: k ? '#E2B33C' : '#C9A36A', stroke: k ? '#8A6A00' : '#7A5A2A', 'stroke-width': 2 }, gg);
      NS('rect', { x: x - w * 0.18, y: y - h - 8 * s, width: w * 0.36, height: 9 * s, rx: 3, fill: k ? '#C99A2A' : '#A9844E', stroke: k ? '#8A6A00' : '#7A5A2A', 'stroke-width': 1.5 }, gg);
      NS('text', { x: x, y: y - h / 2 + 5 * s, 'text-anchor': 'middle', 'font-size': (k ? 15 : 12) * s, 'font-weight': 900, fill: '#3A2A12', text: wl(g), 'pointer-events': 'none' }, gg);
      return { g: gg, w: w, h: h };
    }
    function item(it, x, y, s, parent, hide) {
      var gg = NS('g', {}, parent), w = 92 * s, h = 70 * s;
      if (it.n === 'jar') {
        NS('path', { d: 'M' + (x - w / 2 + 8) + ' ' + (y - h) + ' L' + (x + w / 2 - 8) + ' ' + (y - h) + ' L' + (x + w / 2) + ' ' + (y - 10) + ' Q' + (x + w / 2) + ' ' + y + ' ' + (x + w / 2 - 10) + ' ' + y + ' L' + (x - w / 2 + 10) + ' ' + y + ' Q' + (x - w / 2) + ' ' + y + ' ' + (x - w / 2) + ' ' + (y - 10) + ' Z', fill: '#DCEBF8', stroke: '#5B6478', 'stroke-width': 2.5 }, gg);
        NS('rect', { x: x - w / 2 + 3, y: y - h * 0.72, width: w - 6, height: h * 0.72 - 3, rx: 6, fill: '#9CC8EE' }, gg);
      } else if (it.n === 'bucket') {
        NS('path', { d: 'M' + (x - w / 2) + ' ' + (y - h) + ' L' + (x + w / 2) + ' ' + (y - h) + ' L' + (x + w / 2 - 12) + ' ' + y + ' L' + (x - w / 2 + 12) + ' ' + y + ' Z', fill: '#C9CFDA', stroke: '#5B6478', 'stroke-width': 2.5 }, gg);
        NS('path', { d: 'M' + (x - w / 2 + 6) + ' ' + (y - h) + ' Q' + x + ' ' + (y - h - 34 * s) + ' ' + (x + w / 2 - 6) + ' ' + (y - h), fill: 'none', stroke: '#5B6478', 'stroke-width': 3 }, gg);
      } else if (it.n === 'water') {
        NS('path', { d: 'M' + (x - w / 2 + 10) + ' ' + (y - h) + ' L' + (x + w / 2 - 10) + ' ' + (y - h) + ' L' + (x + w / 2 - 4) + ' ' + y + ' L' + (x - w / 2 + 4) + ' ' + y + ' Z', fill: '#F7FAFD', stroke: '#5B6478', 'stroke-width': 2.5 }, gg);
        NS('rect', { x: x - w / 2 + 8, y: y - h * 0.78, width: w - 16, height: h * 0.78 - 2, fill: '#9CC8EE' }, gg);
      } else if (it.n === 'box') {
        NS('rect', { x: x - w / 2, y: y - h, width: w, height: h, rx: 4, fill: '#C49A6C', stroke: '#7A5A2A', 'stroke-width': 2.5 }, gg);
        NS('line', { x1: x - w / 2, y1: y - h * 0.7, x2: x + w / 2, y2: y - h * 0.7, stroke: '#7A5A2A', 'stroke-width': 2 }, gg);
      } else {
        NS('path', { d: 'M' + (x - w / 2 + 6) + ' ' + y + ' Q' + (x - w / 2 - 4) + ' ' + (y - h * 0.6) + ' ' + (x - w * 0.28) + ' ' + (y - h) + ' L' + (x + w * 0.28) + ' ' + (y - h) + ' Q' + (x + w / 2 + 4) + ' ' + (y - h * 0.6) + ' ' + (x + w / 2 - 6) + ' ' + y + ' Z', fill: '#E8D9B5', stroke: '#8A6A3A', 'stroke-width': 2.5 }, gg);
      }
      NS('text', { x: x, y: y - h * 0.3, 'text-anchor': 'middle', 'font-size': 15 * s, 'font-weight': 900, fill: '#3A2A12', text: hide ? it.l + ' ?' : it.l, 'pointer-events': 'none' }, gg);
      return gg;
    }
    function dropOn(node, target, cb) {
      var p0 = null;
      drag(node, svg, function (pt) { if (!p0) p0 = pt; node.setAttribute('transform', 'translate(' + (pt.x - p0.x) + ',' + (pt.y - p0.y) + ')'); },
        function (pt) { if (pt && pt.x > target[0] && pt.x < target[2] && pt.y > target[1] && pt.y < target[3]) cb(); else draw(); },
        function () { cb(); });
      node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cb(); } });
    }
    function draw() {
      narrow = (box.clientWidth || 800) < 560; svg.innerHTML = '';
      var s = narrow ? 1.45 : 1, FS = narrow ? 22 : 14, next = null, target, H;
      if (K === 'dial') {
        var py = narrow ? 128 : 92, r = narrow ? 150 : 118, cx = 350, cy = py + 40 + r, A0 = -150, A1 = 150, tot = load();
        function ang(g) { return (A0 + (A1 - A0) * Math.min(1, g / MX)) * Math.PI / 180; }
        var pw = 2 * r + 40;
        NS('rect', { x: cx - 16, y: py + 10, width: 32, height: 24, fill: '#AEB6CC' }, svg);
        NS('rect', { x: cx - r - 26, y: cy - r - 16, width: 2 * r + 52, height: 2 * r + 46, rx: 22, fill: '#E9EEF5', stroke: '#5B6478', 'stroke-width': 3 }, svg);
        NS('rect', { x: cx - pw / 2, y: py, width: pw, height: 14, rx: 5, fill: '#8C96A8', stroke: '#5B6478', 'stroke-width': 2 }, svg);
        NS('circle', { cx: cx, cy: cy, r: r, fill: '#fff', stroke: '#1F2A44', 'stroke-width': 3 }, svg);
        for (var m = 0; m <= MX; m += TK) {
          var a = ang(m), big = m % 1000 === 0, mid = m % 500 === 0, l = big ? 24 : mid ? 17 : 10;
          NS('line', { x1: cx + Math.sin(a) * r, y1: cy - Math.cos(a) * r, x2: cx + Math.sin(a) * (r - l), y2: cy - Math.cos(a) * (r - l), stroke: '#1F2A44', 'stroke-width': big ? 3 : mid ? 2.2 : 1.3, 'pointer-events': 'none' }, svg);
          if (big) NS('text', { x: cx + Math.sin(a) * (r - 44 * s / 1.2), y: cy - Math.cos(a) * (r - 44 * s / 1.2) + FS * 0.36, 'text-anchor': 'middle', 'font-size': FS + 2, 'font-weight': 900, fill: '#0E1C42', text: m ? (m / 1000) + ' kg' : '0', 'pointer-events': 'none' }, svg);
        }
        var pa = ang(tot);
        NS('line', { class: 'wg-ptr', x1: cx, y1: cy, x2: cx + Math.sin(pa) * (r - 14), y2: cy - Math.cos(pa) * (r - 14), stroke: '#C0392B', 'stroke-width': 4, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        NS('circle', { cx: cx, cy: cy, r: 8, fill: '#C0392B' }, svg);
        target = [cx - pw / 2 - 20, 0, cx + pw / 2 + 20, cy + r + 30];
        // what is on the platform
        var xx = cx - (itemsOn().length ? 0 : 0);
        var ion = itemsOn(), iw = 104 * s * 0.9; ion.forEach(function (it, j) { item(it, cx + (j - (ion.length - 1) / 2) * iw, py, s * 0.9, svg); });
        if (!itemsOn().length && S.w.length) {
          var sp = 0; S.w.forEach(function (g) { sp += weight(g, 0, 0, s * 0.8, NS('g', {}, null)).w + 6; });
          var x0 = cx - sp / 2;
          S.w.forEach(function (g, i) { var tmp = weight(g, 0, 0, s * 0.8, NS('g', {}, null)); var wg = weight(g, x0 + tmp.w / 2, py, s * 0.8, svg); x0 += tmp.w + 6;
            wg.g.setAttribute('class', 'wg-on'); wg.g.setAttribute('role', 'button'); wg.g.setAttribute('tabindex', 0); wg.g.setAttribute('aria-label', wl(g) + ' weight on the scale. Tap to take it off.'); wg.g.style.cursor = 'pointer';
            drag(wg.g, svg, null, function () { }, function () { remW(i); }); });
        }
        H = cy + r + 34;
      } else if (K === 'mat') {
        var my = 40, mh = narrow ? 230 : 170;
        NS('rect', { x: 20, y: my, width: 660, height: mh, rx: 14, fill: '#EFE6D2', stroke: '#B8A27A', 'stroke-width': 3 }, svg);
        NS('text', { x: 36, y: my + 26, 'font-size': FS, 'font-weight': 900, fill: '#7A6440', text: 'WEIGHT MAT', 'pointer-events': 'none' }, svg);
        var sorted = S.w.map(function (g, i) { return [g, i]; }).sort(function (a, b) { return b[0] - a[0]; }), x1 = 60, row = 0, ys = my + mh - 16;
        sorted.forEach(function (p) {
          var tmp = weight(p[0], 0, 0, s * 0.85, NS('g', {}, null)); if (x1 + tmp.w > 670) { x1 = 60; row++; }
          var wg = weight(p[0], x1 + tmp.w / 2, ys - row * (tmp.h + 20) * 1.0, s * 0.85, svg); x1 += tmp.w + 8;
          wg.g.setAttribute('class', 'wg-on'); wg.g.setAttribute('role', 'button'); wg.g.setAttribute('tabindex', 0); wg.g.setAttribute('aria-label', wl(p[0]) + ' weight on the mat. Tap to take it off.'); wg.g.style.cursor = 'pointer';
          drag(wg.g, svg, null, function () { }, function () { remW(p[1]); });
        });
        target = [0, 0, 700, my + mh + 20]; H = my + mh + 20;
      } else {
        var px = 350, pyv = narrow ? 70 : 60, arm = narrow ? 230 : 210, L = leftG(), R = rightG(), d = R - L;
        var tilt = (CMP ? S.on.length < 2 : !R && !L) ? 0 : d === 0 ? 0 : (d > 0 ? 1 : -1) * Math.min(9, 3 + Math.abs(d) / 60);
        var tr = tilt * Math.PI / 180, ly = pyv - Math.sin(tr) * arm, ry = pyv + Math.sin(tr) * arm, lx = px - Math.cos(tr) * arm, rx = px + Math.cos(tr) * arm;
        NS('rect', { x: px - 12, y: pyv, width: 24, height: narrow ? 300 : 230, fill: '#8C96A8', stroke: '#5B6478', 'stroke-width': 2 }, svg);
        NS('rect', { x: px - 90, y: pyv + (narrow ? 296 : 226), width: 180, height: 16, rx: 6, fill: '#5B6478' }, svg);
        NS('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: '#3A2A12', 'stroke-width': 8, 'stroke-linecap': 'round' }, svg);
        NS('circle', { cx: px, cy: pyv, r: 10, fill: '#C9A227', stroke: '#6B4A12', 'stroke-width': 2 }, svg);
        NS('path', { d: 'M' + (px - 8) + ' ' + (pyv - 30) + ' L' + (px + 8) + ' ' + (pyv - 30) + ' L' + px + ' ' + (pyv - 10) + ' Z', fill: d === 0 && (R || L) ? '#1E7A4C' : '#B23A2E' }, svg);
        var drop = narrow ? 120 : 100, pw2 = narrow ? 210 : 180;
        [[lx, ly, 'L'], [rx, ry, 'R']].forEach(function (p) {
          NS('line', { x1: p[0], y1: p[1], x2: p[0] - pw2 / 2 + 10, y2: p[1] + drop, stroke: '#5B6478', 'stroke-width': 2 }, svg);
          NS('line', { x1: p[0], y1: p[1], x2: p[0] + pw2 / 2 - 10, y2: p[1] + drop, stroke: '#5B6478', 'stroke-width': 2 }, svg);
          NS('path', { d: 'M' + (p[0] - pw2 / 2) + ' ' + (p[1] + drop) + ' Q' + p[0] + ' ' + (p[1] + drop + 26) + ' ' + (p[0] + pw2 / 2) + ' ' + (p[1] + drop) + ' Z', fill: '#D7DEEA', stroke: '#5B6478', 'stroke-width': 3 }, svg);
          NS('text', { x: p[0], y: p[1] + drop + 50 * s, 'text-anchor': 'middle', 'font-size': FS - 1, 'font-weight': 800, fill: '#5B6478', text: p[2] === 'L' ? 'LEFT PAN' : 'RIGHT PAN', 'pointer-events': 'none' }, svg);
        });
        if (CMP) { S.on.forEach(function (i) { var px2 = i === 0 ? lx : rx, py2 = (i === 0 ? ly : ry) + drop; item(IT[i], px2, py2, s * 0.85, svg); }); target = S.on.indexOf(0) < 0 ? [lx - pw2 / 2 - 30, 0, lx + pw2 / 2 + 30, ly + drop + 60] : [rx - pw2 / 2 - 30, 0, rx + pw2 / 2 + 30, ry + drop + 60]; }
        else {
          if (IT[0]) item(IT[0], lx, ly + drop, s * 0.85, svg, true);
          var tw = 0, ws = S.w.map(function (g) { var t0 = weight(g, 0, 0, s * 0.72, NS('g', {}, null)); tw += t0.w + 4; return t0; }), xx2 = rx - Math.min(tw, pw2 + 40) / 2, row2 = 0, start = xx2;
          S.w.forEach(function (g, i) { if (xx2 + ws[i].w > rx + pw2 / 2 + 20) { xx2 = start; row2++; } var wg = weight(g, xx2 + ws[i].w / 2, ry + drop - row2 * 46 * s, s * 0.72, svg); xx2 += ws[i].w + 4;
            wg.g.setAttribute('class', 'wg-on'); wg.g.setAttribute('role', 'button'); wg.g.setAttribute('tabindex', 0); wg.g.setAttribute('aria-label', wl(g) + ' weight on the right pan. Tap to take it off.'); wg.g.style.cursor = 'pointer';
            drag(wg.g, svg, null, function () { }, function () { remW(i); }); });
          target = [rx - pw2 / 2 - 40, 0, rx + pw2 / 2 + 40, ry + drop + 70];
        }
        H = pyv + (narrow ? 330 : 256);
      }
      // the tray: things to weigh and weights, under the tool
      var ty = H + 16, th = narrow ? 130 : 96;
      NS('rect', { x: 20, y: ty, width: 660, height: th, rx: 12, fill: '#F7F2E6', stroke: '#D9C79F', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
      NS('text', { x: 34, y: ty + 20 * s, 'font-size': FS - 2, 'font-weight': 900, fill: '#8A6A3A', text: 'TRAY · DRAG OR TAP', 'pointer-events': 'none' }, svg);
      var tx = 50, base = ty + th - 14;
      IT.forEach(function (it, i) {
        if (S.on.indexOf(i) > -1 || (K === 'balance' && !CMP)) return;
        var g = item(it, tx + 46 * s, base, s * 0.85, svg); tx += 110 * s;
        var need = box.dataset.inorder ? (i === 0 || S.on.indexOf(i - 1) > -1) : !CMP || (i === 0 ? S.on.indexOf(0) < 0 : S.on.indexOf(0) > -1);
        g.setAttribute('class', 'wg-item' + (need && !next ? ' wg-next' : '')); g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', it.l + '. Drag it onto the ' + (K === 'balance' ? (i === 0 ? 'left' : 'right') + ' pan' : 'scale') + '.'); g.style.cursor = 'grab';
        if (need && !next) next = g;
        dropOn(g, target, function () { putItem(i); });
      });
      WT.forEach(function (gv) {
        var tmp = weight(gv, 0, 0, s * 0.85, NS('g', {}, null)); if (tx + tmp.w > 680) return;
        var wg = weight(gv, tx + tmp.w / 2, base, s * 0.85, svg); tx += tmp.w + 14 * s;
        wg.g.setAttribute('class', 'wg-w'); wg.g.setAttribute('data-g', gv); wg.g.setAttribute('role', 'button'); wg.g.setAttribute('tabindex', 0); wg.g.setAttribute('aria-label', 'Add a ' + wl(gv) + ' weight'); wg.g.style.cursor = 'grab';
        dropOn(wg.g, target, function () { addW(gv); });
      });
      svg.setAttribute('viewBox', '0 0 700 ' + (ty + th + 8));
      // flags
      if (K === 'dial' && IT.length && itemsOn().length) flag(box, 'on');
      if (K === 'dial' && IT.length && itemsOn().length === IT.length) flag(box, 'all');
      if ((K === 'dial' || K === 'mat') && T && load() === T) flag(box, 'w');
      if (K === 'balance' && CMP) { if (S.on.indexOf(0) > -1) flag(box, 'a'); if (S.on.length === 2) flag(box, 'tip'); }
      if (K === 'balance' && !CMP && sumW() && sumW() === leftG()) flag(box, 'level');
      if (!out.innerHTML) say();
    }
    onWidth(box, draw); draw();
  };

  /* ── bar (3.11.07 word problems): drag the labels onto a bar model. data-whole, data-parts "label:size;…". Flag: bar ── */
  MODS.bar = function (box) {
    var name = box.dataset.name || 'bar', W = box.dataset.whole || '?';
    var P = (box.dataset.parts || '').split(';').filter(Boolean).map(function (p) { var i = p.lastIndexOf(':'); return { l: p.slice(0, i), s: +p.slice(i + 1) || 1 }; });
    var L = [{ k: 'w', l: W }].concat(P.map(function (p, i) { return { k: 'p' + i, l: p.l }; }));
    var ORD = L.map(function (c, i) { return i; }); ORD.push(ORD.shift()); if (ORD.length > 2) ORD.reverse();
    var S = mstate(name, { at: {} }), sel = null;
    var COL = ['#2F6FDE', '#2E7D6B', '#B05E09', '#6B46C1'];
    box.innerHTML = '<div class="sb-stage sb-bm"><div class="bm-wrap">' +
      '<div class="bm-top"><span class="bm-slot" data-k="w" role="button" tabindex="0" aria-label="The whole: drop a label here"></span><span class="bm-brace" aria-hidden="true"></span></div>' +
      '<div class="bm-bar">' + P.map(function (p, i) { return '<div class="bm-seg" style="flex:' + p.s + ';background:' + COL[i % 4] + '"><span class="bm-slot" data-k="p' + i + '" role="button" tabindex="0" aria-label="Part ' + (i + 1) + ': drop a label here"></span></div>'; }).join('') + '</div>' +
      '</div><div class="bm-chips" role="group" aria-label="Labels to drag">' + ORD.map(function (i) { var c = L[i]; return '<button type="button" class="bm-chip" data-k="' + c.k + '">' + esc(c.l) + '</button>'; }).join('') + '</div></div>' +
      '<div class="sb-readout" aria-live="polite"></div>';
    var out = $('.sb-readout', box);
    function why(c, k) {
      if (c === 'w') return 'That is the whole amount. It goes on top, over the whole bar.';
      if (k === 'w') return c && L.filter(function (x) { return x.k === c; })[0].l === '?' ? 'The ? is a part we don\'t know yet. The top already tells the whole.' : 'That is only one part. The top is for the whole amount.';
      return L.filter(function (x) { return x.k === c; })[0].l === '?' ? 'The ? is the part we don\'t know yet. Which piece of the bar is missing?' : 'Look at the sizes. A longer piece of the bar is a bigger amount.';
    }
    function place(c, k) {
      if (S.at[k]) return;
      if (c !== k) { out.innerHTML = why(c, k); pluck(HZ.D4); return; }
      S.at[k] = 1; save(); pluck(HZ.C5); sel = null; paint();
    }
    function paint() {
      $$('.bm-slot', box).forEach(function (s) { var k = s.dataset.k, l = L.filter(function (x) { return x.k === k; })[0]; s.className = 'bm-slot' + (S.at[k] ? ' full' : '') + (sel && !S.at[k] ? ' open' : ''); s.innerHTML = S.at[k] ? esc(l.l) : '<small>drop here</small>'; });
      $$('.bm-chip', box).forEach(function (c) { c.hidden = !!S.at[c.dataset.k]; c.classList.toggle('sel', c.dataset.k === sel); c.classList.toggle('bm-next', !S.at[c.dataset.k] && !$('.bm-chip:not([hidden]).bm-next', box)); });
      var n = L.filter(function (c) { return S.at[c.k]; }).length;
      if (n === L.length) { out.innerHTML = '<span style="color:#1E7A4C">✓ The bar model is ready: ' + (W === '?' ? 'the parts are known, the whole is ?' : P.some(function (p) { return p.l === '?'; }) ? 'the whole is known, one part is ?' : 'every amount is on it') + '.</span>'; flag(box, 'bar'); }
      else if (!out.innerHTML || n) out.innerHTML = n ? 'Placed ' + n + ' of ' + L.length + ' labels.' : '';
    }
    $$('.bm-chip', box).forEach(function (c) {
      hdrag(c, function (t) { var s = t && t.closest && t.closest('.bm-slot'); if (s && box.contains(s)) place(c.dataset.k, s.dataset.k); },
        function () { sel = sel === c.dataset.k ? null : c.dataset.k; out.innerHTML = sel ? 'Now tap the spot on the bar model where it goes.' : ''; paint(); });
    });
    $$('.bm-slot', box).forEach(function (s) {
      function go() { if (sel) place(sel, s.dataset.k); }
      s.addEventListener('click', go); s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    paint();
  };

  /* ── circ (3.12.01 circles): paper circle, parts, a compass. data-do fold | parts | ben | chord | compass. See patch1201.py ── */
  MODS.circ = function (box) {
    var name = box.dataset.name || 'circ', DO = box.dataset.do || 'fold', U = box.dataset.u || 'cm', R = +box.dataset.r || 11, T = +box.dataset.t || R;
    var GIV = (box.dataset.given || '').split(':'), EUC = !!box.dataset.euclid, MX = +box.dataset.max || Math.max(T + 6, 20);
    var S = mstate(name, { f: 0, c: 0, m: 0, at: {}, a: DO === 'ben' ? 90 : DO === 'chord' ? null : 0, r: 1, sw: 0, d: 0, mv: 0, sw2: 0, d2: 0, x: 0 });
    var GOLD = '#C9A227', NAVY = '#0E1C42', PAPER = '#FBF6EA', EDGE = '#8A6A2E', GREEN = '#1E7A4C', RED = '#B23A2E', BLUE = '#1E8C5A', VIO = '#6B46C1';
    box.innerHTML = '<div class="sb-stage sb-ci"><div class="ci-btns"></div><svg viewBox="0 0 700 460" role="group"></svg><div class="bm-chips ci-chips"></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.ci-btns', box), chips = $('.ci-chips', box), sel = null, busy = false, F = 1;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + GREEN + '">' + h + '</span>' : h; }
    function P(cx, cy, r, deg) { var a = deg * Math.PI / 180; return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }; }
    function ang(cx, cy, p) { var a = Math.atan2(cy - p.y, p.x - cx) * 180 / Math.PI; return (a + 360) % 360; }
    function pill(x, y, t, col, cls) { var g = NS('g', { class: cls || '', 'pointer-events': 'none' }, svg), w = (String(t).length * 9.5 + 18) * F, h = 30 * F; x = Math.max(w / 2 + 10, Math.min(690 - w / 2, x)); NS('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: '#fff', stroke: col || NAVY, 'stroke-width': 2 }, g); NS('text', { x: x, y: y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, 'font-weight': 900, fill: col || NAVY, text: t }, g); return g; }
    function disc(cx, cy, r) { NS('circle', { cx: cx, cy: cy, r: r, fill: PAPER, stroke: EDGE, 'stroke-width': 3 }, svg); }
    function dot(x, y, col, rr) { return NS('circle', { cx: x, cy: y, r: rr || 6, fill: col || NAVY, 'pointer-events': 'none' }, svg); }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    var CX = 350, CY = 230, PR = 165;

    /* fold: find the center by folding */
    function drawFold(folding) {
      svg.innerHTML = ''; btns.innerHTML = ''; svg.setAttribute('viewBox', F > 1 ? '0 -55 700 570' : '0 0 700 460'); svg.setAttribute('aria-label', 'A paper circle' + (S.f ? ' with ' + S.f + ' fold line' + (S.f > 1 ? 's' : '') : '') + (S.c ? '. The center is marked' : ''));
      var C1 = 0, C2 = 62;
      if (folding) {
        var base = folding === 1 ? C1 : C2, a1 = P(CX, CY, PR, base), a2 = P(CX, CY, PR, base + 180);
        NS('circle', { cx: CX, cy: CY, r: PR, fill: 'none', stroke: '#D8C9A3', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, svg);
        NS('path', { d: 'M' + a1.x + ' ' + a1.y + ' A' + PR + ' ' + PR + ' 0 0 1 ' + a2.x + ' ' + a2.y + ' Z', fill: '#EFE3C4', stroke: EDGE, 'stroke-width': 3 }, svg);
        NS('line', { x1: a1.x, y1: a1.y, x2: a2.x, y2: a2.y, stroke: EDGE, 'stroke-width': 3 }, svg);
        return;
      }
      disc(CX, CY, PR);
      [C1, C2].slice(0, S.f).forEach(function (b) { var a = P(CX, CY, PR, b), c = P(CX, CY, PR, b + 180); NS('line', { x1: a.x, y1: a.y, x2: c.x, y2: c.y, stroke: '#B79A5C', 'stroke-width': 2.5, 'stroke-dasharray': '7 6', 'pointer-events': 'none' }, svg); });
      var EDOTS = [118, 208, 302];
      if (S.c) {
        dot(CX, CY, NAVY, 7);
        EDOTS.forEach(function (d, i) {
          var e = P(CX, CY, PR, d); if (i < S.m) { NS('line', { x1: CX, y1: CY, x2: e.x, y2: e.y, stroke: BLUE, 'stroke-width': 4, 'pointer-events': 'none' }, svg); var lp = P(CX, CY, PR + 44 * F, d); pill(lp.x, lp.y, R + ' ' + U, BLUE); }
          dot(e.x, e.y, i < S.m ? BLUE : GOLD, 8);
        });
      }
      if (S.f >= 2 && !S.c) {
        var hit = NS('rect', { x: CX - PR, y: CY - PR, width: 2 * PR, height: 2 * PR, fill: 'transparent', class: 'ci-tapc', role: 'button', tabindex: 0, 'aria-label': 'The paper circle. Tap where the two folds cross.', style: 'cursor:pointer' }, svg);
        hit.addEventListener('click', function (e) { var p = svgPt(svg, e), d = Math.hypot(p.x - CX, p.y - CY); if (d < 22 * F) { S.c = 1; save(); pluck(HZ.C5); flag(box, 'center'); drawFold(); msg('✓ Found it! The two folds cross at the center of the circle.', true); } else { pluck(HZ.D4); msg('That spot is not where the two folds cross. Look for the point that is on both dashed lines.'); } });
        hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.c = 1; save(); flag(box, 'center'); drawFold(); msg('✓ Found it! The two folds cross at the center of the circle.', true); } });
      }
      var b1 = btn('📄 Fold in half', 'ci-fold' + (S.f === 0 ? ' ci-next' : ''), function () { doFold(1); }, S.f !== 0 || busy);
      var b2 = btn('📄 Fold a different way', 'ci-fold2' + (S.f === 1 ? ' ci-next' : ''), function () { doFold(2); }, S.f !== 1 || busy);
      var b3 = btn('📏 Measure to the next dot', 'ci-meas' + (S.c && S.m < 3 ? ' ci-next' : ''), function () { if (S.m >= 3) return; S.m++; save(); pluck(HZ.E4 + S.m * 40); drawFold(); if (S.m === 3) { flag(box, 'measured'); msg('✓ All 3 lines from the center to the edge are ' + R + ' ' + U + '.', true); } else msg('This line from the center to the edge is ' + R + ' ' + U + '.'); }, !S.c || S.m >= 3);
      if (S.f >= 1) flag(box, 'fold1'); if (S.f >= 2) flag(box, 'fold2'); if (S.c) flag(box, 'center'); if (S.m >= 3) flag(box, 'measured');
    }
    function doFold(n) {
      if (busy || S.f !== n - 1) return; busy = true; pluck(HZ.G4); drawFold(n);
      setTimeout(function () { busy = false; S.f = n; save(); drawFold(); msg(n === 1 ? 'Folded in half and opened again. The fold left a line.' : 'Now there are two fold lines. They cross at one point.'); }, reduced ? 60 : 700);
    }

    /* parts: drag the labels onto the circle */
    var PARTS = { center: { d: 'The center is one point: the dot in the middle.' }, radius: { d: 'A radius goes from the center to the edge.' }, diameter: { d: 'A diameter goes all the way across, through the center.' } };
    function drawParts() {
      svg.innerHTML = ''; svg.setAttribute('viewBox', '0 0 700 460'); svg.setAttribute('aria-label', 'A circle with a dot in the middle, one line from the dot to the edge, and one line all the way across. Three spots for labels.');
      disc(CX, CY, PR - 10); var r = PR - 10, ra = P(CX, CY, r, 58), d1 = P(CX, CY, r, 165), d2 = P(CX, CY, r, 345);
      NS('line', { x1: d1.x, y1: d1.y, x2: d2.x, y2: d2.y, stroke: VIO, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
      NS('line', { x1: CX, y1: CY, x2: ra.x, y2: ra.y, stroke: BLUE, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
      dot(CX, CY, NAVY, 8);
      var SW = 124 * (F > 1 ? 1.6 : 1), SH = 40 * (F > 1 ? 1.5 : 1), SP = { center: { x: Math.max(95, SW / 2 + 8), y: F > 1 ? 36 : 70, to: { x: CX, y: CY } }, radius: { x: Math.min(600, 692 - SW / 2), y: F > 1 ? 36 : 70, to: P(CX, CY, r * .6, 58) }, diameter: { x: Math.min(610, 692 - SW / 2), y: F > 1 ? 424 : 400, to: P(CX, CY, r * .75, 345) } };
      Object.keys(SP).forEach(function (k) {
        var s = SP[k]; NS('line', { x1: s.x, y1: s.y, x2: s.to.x, y2: s.to.y, stroke: '#8792A8', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', 'pointer-events': 'none' }, svg);
        NS('circle', { cx: s.to.x, cy: s.to.y, r: 4, fill: '#8792A8', 'pointer-events': 'none' }, svg);
        var g = NS('g', { class: 'ci-slot' + (S.at[k] ? ' full' : sel ? ' open' : ''), 'data-k': k, role: 'button', tabindex: 0, 'aria-label': S.at[k] ? k : 'Empty label spot' }, svg);
        NS('rect', { x: s.x - SW / 2, y: s.y - SH / 2, width: SW, height: SH, rx: 12, fill: S.at[k] ? '#E8F5EE' : '#fff', stroke: S.at[k] ? GREEN : sel ? GOLD : '#8792A8', 'stroke-width': 2.5, 'stroke-dasharray': S.at[k] ? '' : '6 4' }, g);
        NS('text', { x: s.x, y: s.y + 6 * F, 'text-anchor': 'middle', 'font-size': (S.at[k] ? 19 : 14) * F, 'font-weight': 900, fill: S.at[k] ? GREEN : '#8792A8', text: S.at[k] ? k : 'drop here', 'pointer-events': 'none' }, g);
        function go() { if (sel) place(sel, k); }
        g.addEventListener('click', go); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      chips.innerHTML = ''; var first = true;
      ['diameter', 'center', 'radius'].forEach(function (k) {
        if (S.at[k]) return; var c = el('button', 'bm-chip ci-chip' + (first ? ' ci-next' : '') + (sel === k ? ' sel' : ''), k); first = false; c.type = 'button'; c.dataset.k = k; chips.appendChild(c);
        hdrag(c, function (t) { var s = t && t.closest && t.closest('.ci-slot'); if (s && box.contains(s)) place(k, s.getAttribute('data-k')); }, function () { sel = sel === k ? null : k; msg(sel ? 'Now tap the spot where "' + k + '" goes.' : ''); drawParts(); });
      });
      if (Object.keys(PARTS).every(function (k) { return S.at[k]; })) flag(box, 'labels');
    }
    function place(c, k) {
      if (S.at[k]) return;
      if (c !== k) { pluck(HZ.D4); msg('Not that spot. ' + PARTS[c].d); return; }
      S.at[k] = 1; sel = null; save(); pluck(HZ.C5); drawParts();
      if (Object.keys(PARTS).every(function (x) { return S.at[x]; })) msg('✓ Every label is on its part.', true); else msg('✓ Yes. ' + PARTS[k].d, true);
    }

    /* ben + chord: drag the end of a line around the circle */
    var A0 = 0, CH0 = 205;
    function chordLen(a) { var d = Math.abs(((a - CH0) % 360 + 360) % 360); d = Math.min(d, 360 - d); return { d: d, len: 2 * R * Math.sin(d * Math.PI / 360) }; }
    function drawLine() {
      svg.innerHTML = ''; svg.setAttribute('viewBox', '0 0 700 470');
      var r = PR - 10; disc(CX, CY, r);
      if (DO === 'chord' && S.a == null) { var want = +box.dataset.len || 20, dd = 2 * Math.asin(want / (2 * R)) * 180 / Math.PI; S.a = (CH0 - dd + 360) % 360; save(); }
      var a = S.a, done = DO === 'ben' ? Math.abs(a - 180) < .01 : chordLen(a).d > 179.9, e = P(CX, CY, r, a);
      if (DO === 'ben') {
        svg.setAttribute('aria-label', 'A circle with one radius drawn to the right, and a second radius you can turn.' + (done ? ' The two radii make one straight line.' : ''));
        var f = P(CX, CY, r, A0); NS('line', { x1: CX, y1: CY, x2: f.x, y2: f.y, stroke: BLUE, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
        var lf = P(CX, CY, r + 46 * F, A0); pill(lf.x - 6, lf.y - 36 * F - 4, R + ' ' + U, BLUE);
        NS('line', { x1: CX, y1: CY, x2: e.x, y2: e.y, stroke: done ? VIO : BLUE, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
        if (done) { var le = P(CX, CY, r + 46 * F, a); pill(le.x + 6, le.y - 36 * F - 4, R + ' ' + U, BLUE); }
        dot(CX, CY, NAVY, 7);
      } else {
        svg.setAttribute('aria-label', 'A circle with a line across it. One end of the line can move around the edge.' + (done ? ' The line goes through the center.' : ''));
        var s0 = P(CX, CY, r, CH0), m0 = +box.dataset.len || 20, a0 = (CH0 - 2 * Math.asin(m0 / (2 * R)) * 180 / Math.PI + 360) % 360, e0 = P(CX, CY, r, a0);
        if (Math.abs(a0 - a) > .5) NS('line', { x1: s0.x, y1: s0.y, x2: e0.x, y2: e0.y, stroke: '#A8B0C2', 'stroke-width': 3, 'stroke-dasharray': '7 6', 'pointer-events': 'none' }, svg);
        NS('line', { x1: s0.x, y1: s0.y, x2: e.x, y2: e.y, stroke: done ? VIO : RED, 'stroke-width': 5, 'pointer-events': 'none' }, svg);
        dot(s0.x, s0.y, RED, 8); dot(CX, CY, NAVY, 7);
      }
      var h = NS('g', { class: 'drag ci-end' + (done ? '' : ' ci-next'), tabindex: 0, role: 'slider', 'aria-label': (DO === 'ben' ? 'End of the second radius' : 'Moving end of the line') + '. Drag it around the edge.', 'aria-valuenow': Math.round(a) }, svg);
      NS('circle', { cx: e.x, cy: e.y, r: 18 * F, fill: '#fff', stroke: done ? GOLD : NAVY, 'stroke-width': 4 }, h); NS('circle', { cx: e.x, cy: e.y, r: 6, fill: done ? GOLD : NAVY }, h);
      var live = a;
      drag(h, svg, function (pt) { live = ang(CX, CY, pt); var q = P(CX, CY, r, live); h.setAttribute('transform', 'translate(' + (q.x - e.x) + ',' + (q.y - e.y) + ')'); }, function (pt) { if (pt) setA(live); else drawLine(); });
      h.addEventListener('keydown', function (ev) { var k = ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? 5 : ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? -5 : 0; if (!k) return; ev.preventDefault(); setA(S.a + k); var n = $('.ci-end', svg); if (n) n.focus(); });
      if (done) flag(box, DO === 'ben' ? 'line' : 'through');
    }
    function setA(v) {
      v = (v % 360 + 360) % 360;
      if (DO === 'ben') { if (Math.abs(v - 180) < 7) v = 180; if (v < 6 || v > 354) v = v < 6 ? 6 : 354; S.a = v; save(); pluck(v === 180 ? HZ.C5 : HZ.D4); drawLine(); msg(v === 180 ? '✓ The two radii make one straight line through the center. That line is a diameter: ' + R + ' ' + U + ' + ' + R + ' ' + U + '.' : 'The two radii meet at the center, but they bend. They are not one straight line yet.', v === 180); return; }
      var c = chordLen(v); if (c.d > 174) { v = (CH0 + 180) % 360; c = chordLen(v); } if (c.d < 8) { v = (CH0 + (v > CH0 || v < CH0 - 180 ? 8 : -8) + 360) % 360; c = chordLen(v); }
      S.a = v; save(); var through = c.d > 179.9, L = Math.round(c.len); pluck(through ? HZ.C5 : 200 + L * 12); drawLine();
      msg(through ? '✓ Now the line goes through the center. It is the longest line across the circle: ' + 2 * R + ' ' + U + '. That is the diameter.' : 'This line is about ' + L + ' ' + U + ' long. It misses the center.', through);
    }

    /* compass: open it on the grid, then swing the pencil around */
    var K = 1, PX = 0, PY = 0, B = null;
    function layout() {
      if (EUC) { K = Math.min(600 / (3 * T + 6), 330 / (2 * T + 4)); PX = 350 - K * T * .5; PY = 60 + K * (T + 2); }
      else if (GIV[0]) { var gr = GIV[0] === 'd' ? +GIV[1] / 2 : +GIV[1], tw = 2 * T + 4 + 2 * gr; K = Math.min(620 / (tw + 4), 330 / (2 * Math.max(T, gr) + 4)); PX = 40 + K * (T + 2); PY = 60 + K * (Math.max(T, gr) + 2); B = { x: PX + K * (T + 4 + gr), y: PY, r: gr }; }
      else { K = Math.min(300 / (MX + 1), 360 / (2 * T + 4)); PX = 350 - K * (MX / 2 - T * .4); PY = 60 + K * (T + 2); }
    }
    function drawCompass() {
      layout(); svg.innerHTML = ''; btns.innerHTML = '';
      var H = PY + K * (T + 2) + 70 + 46 * (F - 1); svg.setAttribute('viewBox', '0 0 700 ' + Math.round(H));
      var C = EUC && S.mv ? { x: PX + K * T, y: PY } : { x: PX, y: PY }, rr = K * S.r;
      svg.setAttribute('aria-label', 'A compass on paper with a centimeter ruler.' + (S.d ? ' Circle A is drawn.' : '') + (S.d2 ? ' Circle B is drawn.' : ''));
      NS('rect', { x: 8, y: 8, width: 684, height: H - 16, rx: 12, fill: '#fff', stroke: '#DCE2EE', 'stroke-width': 2, 'pointer-events': 'none' }, svg);
      // grid paper like the Compass tool on the tools site: each square is 1 cm (a darker line every 5)
      if (K >= 5) { var gx0 = PX - Math.floor((PX - 12) / K) * K, gy0 = PY - Math.floor((PY - 12) / K) * K, ii = 0;
        for (var gx = gx0, gi = -Math.floor((PX - 12) / K); gx <= 690; gx += K, gi++) NS('line', { x1: gx, y1: 12, x2: gx, y2: H - 12, stroke: gi % 5 === 0 ? '#B9C3D6' : '#DCE2EE', 'stroke-width': 1, 'pointer-events': 'none' }, svg);
        for (var gy = gy0, gj = -Math.floor((PY - 12) / K); gy <= H - 12; gy += K, gj++) NS('line', { x1: 12, y1: gy, x2: 688, y2: gy, stroke: gj % 5 === 0 ? '#B9C3D6' : '#DCE2EE', 'stroke-width': 1, 'pointer-events': 'none' }, svg); }
      NS('text', { x: 680, y: H - 18, 'text-anchor': 'end', 'font-size': 13 * F, 'font-weight': 800, fill: '#5B6478', text: 'Each square is 1 ' + U + '. Dark lines every 5 ' + U + '.', 'pointer-events': 'none' }, svg);
      if (B) { NS('circle', { cx: B.x, cy: B.y, r: K * B.r, fill: 'none', stroke: '#6B46C1', 'stroke-width': 4, 'pointer-events': 'none' }, svg); NS('line', { x1: B.x - K * B.r, y1: B.y, x2: B.x + K * B.r, y2: B.y, stroke: '#6B46C1', 'stroke-width': 3, 'pointer-events': 'none' }, svg); dot(B.x, B.y, '#6B46C1', 5); pill(B.x, B.y + K * B.r + 26 * F, 'B: diameter ' + GIV[1] + ' ' + U, '#6B46C1'); }
      // circle A (drawn or in progress)
      function arcD(cx, cy, r, sw) { if (!sw) return ''; var a = P(cx, cy, r, 0), b = P(cx, cy, r, sw); return 'M' + a.x + ' ' + a.y + ' A' + r + ' ' + r + ' 0 ' + (Math.abs(sw) > 180 ? 1 : 0) + ' ' + (sw > 0 ? 0 : 1) + ' ' + b.x + ' ' + b.y; }
      function arc(cx, cy, r, sw, col) { if (Math.abs(sw) >= 359.5) return NS('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: col, 'stroke-width': 4, 'pointer-events': 'none' }, svg); return NS('path', { d: arcD(cx, cy, r, sw), fill: 'none', stroke: col, 'stroke-width': 4, 'pointer-events': 'none' }, svg); }
      var RF = {}; RF.arcA = arc(PX, PY, K * (S.d ? T : S.r), S.d ? 360 : S.sw, NAVY);
      if (S.d) { dot(PX, PY, NAVY, 5); if (!EUC) { var re = P(PX, PY, K * T, 35); NS('line', { x1: PX, y1: PY, x2: re.x, y2: re.y, stroke: '#1E8C5A', 'stroke-width': 4, 'pointer-events': 'none' }, svg); } pill(PX, PY - K * T - 26 * F, (GIV[0] || EUC ? 'A: ' : '') + 'radius ' + T + ' ' + U, '#1E8C5A'); }
      if (EUC && S.mv) { RF.arcB = arc(C.x, C.y, K * T, S.d2 ? 360 : S.sw2, RED); dot(C.x, C.y, RED, 5); if (S.d2) pill(C.x + K * T * .55, PY + K * T + 26 * F, 'B: radius ' + T + ' ' + U, RED); }
      if (EUC && S.d2) {
        var X = { x: PX + K * T / 2, y: PY - K * T * Math.sqrt(3) / 2 };
        if (S.x) { NS('line', { x1: X.x, y1: X.y, x2: PX, y2: PY, stroke: BLUE, 'stroke-width': 5, 'pointer-events': 'none' }, svg); NS('line', { x1: X.x, y1: X.y, x2: C.x, y2: C.y, stroke: RED, 'stroke-width': 5, 'pointer-events': 'none' }, svg); NS('line', { x1: PX, y1: PY, x2: C.x, y2: C.y, stroke: NAVY, 'stroke-width': 3, 'stroke-dasharray': '7 5', 'pointer-events': 'none' }, svg); dot(X.x, X.y, NAVY, 7); dot(PX, PY, BLUE, 6); dot(C.x, C.y, RED, 6); }
        else { var xg = NS('g', { class: 'ci-cross ci-next', role: 'button', tabindex: 0, 'aria-label': 'Top point where the circles cross', style: 'cursor:pointer' }, svg); NS('circle', { cx: X.x, cy: X.y, r: 22 * F, fill: 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 3 }, xg); NS('circle', { cx: X.x, cy: X.y, r: 6, fill: GOLD }, xg); function cx() { S.x = 1; save(); pluck(HZ.C5); flag(box, 'cross'); drawCompass(); msg('✓ Lines go from the top crossing point to both centers. A dashed line joins the two centers.', true); } xg.addEventListener('click', cx); xg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cx(); } }); }
      }
      // the compass itself
      var drawing2 = EUC && S.d && S.mv, piv = drawing2 ? C : { x: PX, y: PY }, pa = drawing2 ? S.sw2 : S.d ? 0 : S.sw, pen = P(piv.x, piv.y, K * (S.d ? T : S.r), pa);
      if (!(EUC ? S.d2 : S.d)) {
        var mid = { x: (piv.x + pen.x) / 2, y: (piv.y + pen.y) / 2 }, len = Math.hypot(pen.x - piv.x, pen.y - piv.y) || 1, nx = -(pen.y - piv.y) / len, ny = (pen.x - piv.x) / len; if (ny > 0) { nx = -nx; ny = -ny; }
        var hl = Math.max(70, 150 - len * .25), hg = { x: mid.x + nx * hl, y: mid.y + ny * hl };
        RF.l1 = NS('line', { x1: hg.x, y1: hg.y, x2: piv.x, y2: piv.y, stroke: '#5B6478', opacity: .85, 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        RF.l2 = NS('line', { x1: hg.x, y1: hg.y, x2: pen.x, y2: pen.y, stroke: '#6B46C1', opacity: .85, 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        RF.hc = NS('circle', { cx: hg.x, cy: hg.y, r: 10, fill: NAVY, 'pointer-events': 'none' }, svg);
        RF.dl = NS('line', { x1: piv.x, y1: piv.y, x2: pen.x, y2: pen.y, stroke: '#E3B505', 'stroke-width': 2, 'stroke-dasharray': '4 4', 'pointer-events': 'none' }, svg);
        // the point leg (drags onto circle A's edge in Euclid mode)
        var canMove = EUC && S.d && !S.mv, pg = NS('g', canMove ? { class: 'drag ci-pt ci-next', tabindex: 0, role: 'slider', 'aria-label': 'Compass point. Drag it onto the gold dot on the edge of circle A.' } : { 'pointer-events': 'none' }, svg);
        NS('circle', { cx: piv.x, cy: piv.y, r: 14, fill: 'rgba(91,100,120,.25)', stroke: '#5B6478', 'stroke-width': 2 }, pg); NS('circle', { cx: piv.x, cy: piv.y, r: 3, fill: NAVY }, pg);
        if (canMove) {
          NS('circle', { cx: piv.x, cy: piv.y, r: 18 * F, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, pg);
          var tgt = { x: PX + K * T, y: PY }; NS('circle', { cx: tgt.x, cy: tgt.y, r: 12, fill: 'rgba(201,162,39,.35)', stroke: GOLD, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
          drag(pg, svg, function (pt) { pg.setAttribute('transform', 'translate(' + (pt.x - piv.x) + ',' + (pt.y - piv.y) + ')'); }, function (pt) { if (pt && Math.hypot(pt.x - tgt.x, pt.y - tgt.y) < 30) { S.mv = 1; save(); pluck(HZ.C5); flag(box, 'moved'); drawCompass(); msg('✓ The compass point sits on the edge of circle A. The compass is still open ' + T + ' ' + U + '.', true); } else { if (pt) { pluck(HZ.D4); msg('Not on the gold dot yet. The gold dot is on the edge of circle A.'); } drawCompass(); } });
          pg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.mv = 1; save(); flag(box, 'moved'); drawCompass(); } });
        }
        // the pencil leg
        var ready = drawing2 || (S.d === 0 && S.r === T), g = NS('g', { class: 'drag ci-pen' + (canMove ? '' : ' ci-next'), tabindex: canMove ? -1 : 0, role: 'slider', 'aria-label': ready ? 'Pencil. Drag it all the way around.' : 'Pencil. Drag it away from the point to open the compass.', 'aria-valuenow': ready ? Math.round(Math.abs(drawing2 ? S.sw2 : S.sw)) : S.r }, svg);
        if (canMove) g.setAttribute('pointer-events', 'none');
        NS('circle', { cx: pen.x, cy: pen.y, r: 16 * F, fill: '#F5C518', stroke: NAVY, 'stroke-width': 2.5 }, g);
        NS('text', { x: pen.x, y: pen.y + 5, 'text-anchor': 'middle', 'font-size': 14, text: '✏', 'pointer-events': 'none' }, g);
        if (!canMove) {
          var startR = S.r, last = null;
          // while dragging, only move the pencil, the legs and the arc (a full redraw would drop the drag)
          function live(rad, pa) {
            var q = P(piv.x, piv.y, rad, pa), m2 = { x: (piv.x + q.x) / 2, y: (piv.y + q.y) / 2 }, L2 = Math.hypot(q.x - piv.x, q.y - piv.y) || 1, ux = -(q.y - piv.y) / L2, uy = (q.x - piv.x) / L2; if (uy > 0) { ux = -ux; uy = -uy; }
            var h2 = Math.max(70, 150 - L2 * .25), H2 = { x: m2.x + ux * h2, y: m2.y + uy * h2 };
            [RF.l1, RF.l2].forEach(function (l) { l.setAttribute('x1', H2.x); l.setAttribute('y1', H2.y); }); RF.l2.setAttribute('x2', q.x); RF.l2.setAttribute('y2', q.y); RF.dl.setAttribute('x2', q.x); RF.dl.setAttribute('y2', q.y); RF.hc.setAttribute('cx', H2.x); RF.hc.setAttribute('cy', H2.y);
            g.setAttribute('transform', 'translate(' + (q.x - pen.x) + ',' + (q.y - pen.y) + ')');
            var ap = drawing2 ? RF.arcB : RF.arcA; if (ap && ap.tagName === 'path') ap.setAttribute('d', arcD(piv.x, piv.y, rad, drawing2 ? S.sw2 : S.sw));
          }
          drag(g, svg, function (pt) {
            if (!ready) { var v = Math.max(1, Math.min(MX, Math.round((pt.x - PX) / K))); if (v !== S.r) { S.r = v; pluck(180 + v * 10); live(K * v, 0); msg('The compass is open ' + v + ' ' + U + '.'); } return; }
            var a = ang(piv.x, piv.y, pt); if (last == null) last = (((drawing2 ? S.sw2 : S.sw) % 360) + 360) % 360; var d = ((a - last + 540) % 360) - 180; if (Math.abs(d) > 60) return; last = a;
            if (sweep(d, true)) return; live(K * T, drawing2 ? S.sw2 : S.sw);
          }, function () { if (!ready) setR(S.r); else { last = null; drawCompass(); } }, function () { if (ready) auto(); });
          g.addEventListener('keydown', function (e) { var k = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0; if (!k) return; e.preventDefault(); if (!ready) setR(S.r + k); else sweep(k * 30); var n = $('.ci-pen', svg); if (n) n.focus(); });
        }
      }
      if (S.r === T || S.d) flag(box, 'open'); if (S.d) flag(box, 'drawn'); if (S.mv) flag(box, 'moved'); if (S.d2) flag(box, 'drawn2'); if (S.x) flag(box, 'cross');
    }
    function setR(v) { if (S.d) return; S.r = Math.max(1, Math.min(MX, v)); S.sw = 0; save(); drawCompass(); var ok = S.r === T; if (ok) pluck(HZ.C5); msg(ok ? '✓ The compass is open ' + T + ' ' + U + '. That is the radius.' : 'The compass is open ' + S.r + ' ' + U + '.', ok); if (ok) flag(box, 'open'); }
    function sweep(d, live) {
      var two = EUC && S.d && S.mv, k = two ? 'sw2' : 'sw'; if (two ? S.d2 : S.d) return;
      S[k] += d; if (Math.abs(S[k]) >= 358) { S[k] = 360; if (two) S.d2 = 1; else S.d = 1; save(); pluck(HZ.C5); drawCompass(); msg(two ? '✓ Circle B is drawn. Its radius is ' + T + ' ' + U + ' too.' : '✓ A whole circle! Every point on it is ' + T + ' ' + U + ' from the center.', true); return true; }
      save(); if (!live) drawCompass(); return false;
    }
    function auto() { if (busy) return; busy = true; (function tick() { var two = EUC && S.d && S.mv; if (two ? S.d2 : S.d) { busy = false; return; } sweep(12); setTimeout(tick, reduced ? 0 : 30); })(); }

    function draw() { sizeF(); if (DO === 'fold') drawFold(); else if (DO === 'parts') drawParts(); else if (DO === 'compass') drawCompass(); else drawLine(); }
    onWidth(box, draw); draw();
  };

  /* ── ang (3.12.02 angles, 3.12.03 right angles): angle-maker strips, labels, the set square check, the folded papyrus checker. data-do open | parts | ben | turn | meet | own | euclid | fold | corners | look | cross | perp | posts. See patch1202.py, patch1203.py ── */
  MODS.ang = function (box) {
    var name = box.dataset.name || 'ang', DO = box.dataset.do || 'open', ANS = box.dataset.ans || '';
    var NAVY = '#0E1C42', GRN = '#1E8C5A', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#8792A8', SQF = '#D9F0E3';
    var DEF = { fold: { f: 0, on: 0, c: '', seed: 1 }, corners: { chk: {}, mk: {}, last: -1, ex: 0, ey: 0 }, look: { on: 0, c: '' }, cross: { t: {}, last: -1 }, perp: { a: 52, on: 0, rot: 0 }, posts: { a: 70, b: 106, h: 0 }, open: { a: 6 }, parts: { at: {}, sq: 0, c: '' }, ben: { len: 130, laid: 0 }, turn: { on: 0, rot: 0, c: '' },
      meet: { ex: 0, ey: 0, met: 0, v: 0 }, own: { a: 40, sq: 0, at: {} }, euclid: { s: 55, eq: 0, ln: 0 } };
    var S = mstate(name, JSON.parse(JSON.stringify(DEF[DO] || {})));
    box.innerHTML = '<div class="sb-stage sb-an"><div class="an-btns"></div><svg viewBox="0 0 700 420" role="group"></svg><div class="bm-chips an-chips"></div><div class="an-sort" hidden></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), chips = $('.an-chips', box), sortB = $('.an-sort', box), F = 1, sel = null;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function P(v, deg, r) { var a = deg * Math.PI / 180; return { x: v.x + r * Math.cos(a), y: v.y - r * Math.sin(a) }; }
    function angTo(v, p) { var a = Math.atan2(v.y - p.y, p.x - v.x) * 180 / Math.PI; return (a + 360) % 360; }
    function line(a, b, col, w, extra) { var o = { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: col, 'stroke-width': w || 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }; for (var k in (extra || {})) o[k] = extra[k]; return NS('line', o, svg); }
    function arcD(v, r, a0, a1) { var p = P(v, a0, r), q = P(v, a1, r); return 'M' + p.x + ' ' + p.y + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 0 ' + q.x + ' ' + q.y; }
    function mark(v, b, a, col, r) {
      if (a === 90) { var s = 24, p1 = P(v, b, s), p2 = P(p1, b + 90, s), p3 = P(v, b + 90, s); return NS('polyline', { points: [p1, p2, p3].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: 'none', stroke: col, 'stroke-width': 3, 'pointer-events': 'none' }, svg); }
      if (a <= 0) return null; return NS('path', { d: arcD(v, r || 46, b, b + a), fill: 'none', stroke: col, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
    }
    function dot(v, col, r) { return NS('circle', { cx: v.x, cy: v.y, r: r || 6, fill: col || NAVY, 'pointer-events': 'none' }, svg); }
    function brad(v) { NS('circle', { cx: v.x, cy: v.y, r: 10, fill: GOLD, stroke: NAVY, 'stroke-width': 2, 'pointer-events': 'none' }, svg); dot(v, NAVY, 4); }
    function pill(x, y, t, col) { var w = (String(t).length * 9.5 + 18) * F, h = 30 * F; x = Math.max(w / 2 + 6, Math.min(694 - w / 2, x)); var g = NS('g', { 'pointer-events': 'none' }, svg); NS('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: '#fff', stroke: col || NAVY, 'stroke-width': 2 }, g); NS('text', { x: x, y: y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, 'font-weight': 900, fill: col || NAVY, text: t }, g); return g; }
    function paper(h, grid) { NS('rect', { x: 4, y: 4, width: 692, height: h - 8, rx: 12, fill: '#fff', stroke: '#DCE2EE', 'stroke-width': 2, 'pointer-events': 'none' }, svg); if (grid) { for (var x = 24; x < 696; x += 20) line({ x: x, y: 6 }, { x: x, y: h - 6 }, '#E6EAF3', 1); for (var y = 24; y < h - 4; y += 20) line({ x: 6, y: y }, { x: 694, y: y }, '#E6EAF3', 1); } }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function snapA(a, lo) { if (Math.abs(a - 90) <= 5) return 90; if (a >= 175) return 180; return Math.max(lo || 4, Math.round(a)); }
    function cls(a) { return a < 90 ? 'less' : a === 90 ? 'right' : a < 180 ? 'greater' : 'straight'; }
    var WORD = { less: 'less than a right angle', right: 'a right angle', greater: 'greater than a right angle', straight: 'a straight angle' };
    // the set square, as on the tools site: mint 45-degree triangle, square corner at c, legs along rot and rot + 90
    function setsq(c, rot, size, hi, extra) {
      var g = NS('g', extra || { 'pointer-events': 'none' }, svg), p1 = P(c, rot, size), p2 = P(c, rot + 90, size);
      NS('polygon', { points: [c, p1, p2].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: SQF, 'fill-opacity': .75, stroke: hi ? NAVY : GRAY, 'stroke-width': hi ? 2.5 : 1.5 }, g);
      var m1 = P(c, rot, 14), m2 = P(m1, rot + 90, 14), m3 = P(c, rot + 90, 14);
      NS('polyline', { points: [m1, m2, m3].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: 'none', stroke: GRAY, 'stroke-width': 1.5 }, g);
      return g;
    }
    function handle(p, col, cls, label, ring) {
      var g = NS('g', { class: 'drag ' + cls, tabindex: 0, role: 'slider', 'aria-label': label }, svg);
      NS('circle', { cx: p.x, cy: p.y, r: 26 * F, fill: 'transparent' }, g);
      if (ring) NS('circle', { cx: p.x, cy: p.y, r: 21 * F, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, g);
      NS('circle', { cx: p.x, cy: p.y, r: 15 * F, fill: col, stroke: '#fff', 'stroke-width': 3 }, g);
      return g;
    }
    function keys(g, fn) { g.addEventListener('keydown', function (e) { var k = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? -1 : 0; if (!k) return; e.preventDefault(); fn(k); }); }
    function refocus(c) { var n = $('.' + c, svg); if (n) n.focus(); }

    /* the card that names the angle (parts, turn) */
    var CARDS = ['less', 'right', 'greater'];
    function sortRow(show) {
      sortB.hidden = !show; if (!show) return;
      var ok = S.c && S.c === ANS;
      sortB.innerHTML = '<div class="an-sline"><span>This angle is</span><span class="an-slot' + (S.c ? ok ? ' ok' : ' no' : '') + '" tabindex="0" role="button" aria-label="Box for the card">' + (S.c ? esc(WORD[S.c]) : 'drop a card here') + '</span></div><div class="bm-chips an-cards" role="group" aria-label="Cards to drag"></div>';
      var tray = $('.an-cards', sortB);
      CARDS.forEach(function (k) { var c = el('button', 'bm-chip an-card', esc(WORD[k])); c.type = 'button'; c.dataset.k = k; tray.appendChild(c);
        hdrag(c, function (t) { if (t && t.closest && t.closest('.an-slot')) pick(k); }, function () { pick(k); }); });
    }
    var WHY = {
      less: { right: 'A right angle fits the square corner exactly, with each ray on an edge. Here the green ray is not on the edge.', greater: 'If it were greater, the green ray would stick out past the set square. Look where the green ray is.' },
      right: { less: 'If it were less, the green ray would hide under the set square. Here both rays lie right on its edges.', greater: 'If it were greater, a ray would stick out past the set square. Here both rays lie right on its edges.' },
      greater: { less: 'If it were less, the green ray would hide under the set square. Look where the green ray is.', right: 'A right angle fits the square corner exactly. Here the green ray sticks out past it.' } };
    function pick(k) {
      S.c = k; save(); sortRow(true);
      if (k === ANS) { pluck(HZ.C5); flag(box, 'sorted'); msg('✓ Yes. This angle is ' + WORD[k] + '.', true); if (DO === 'fold') draw(); }
      else { pluck(HZ.D4); flag(box, 'sorted', false); msg('Not that card. ' + ((WHY[ANS] || {})[k] || '')); }
    }

    /* label slots and chips (parts, own) */
    function labels(slots, show) {
      // slots: [{k:'vertex'|'ray-a'|'ray-b', x, y, to:{x,y}}]
      var SW = 110 * (F > 1 ? 1.6 : 1), SH = 38 * (F > 1 ? 1.5 : 1);
      slots.forEach(function (s) {
        s.x = Math.max(SW / 2 + 8, Math.min(692 - SW / 2, s.x));
        line({ x: s.x, y: s.y }, s.to, GRAY, 1.5, { 'stroke-dasharray': '4 4', 'stroke-linecap': 'butt' }); NS('circle', { cx: s.to.x, cy: s.to.y, r: 4, fill: GRAY, 'pointer-events': 'none' }, svg);
        var full = S.at[s.k], kind = s.k === 'vertex' ? 'vertex' : 'ray';
        var g = NS('g', { class: 'an-lslot', 'data-k': s.k, role: 'button', tabindex: show && !full ? 0 : -1, 'aria-label': full ? kind : 'Empty label spot' }, svg);
        NS('rect', { x: s.x - SW / 2, y: s.y - SH / 2, width: SW, height: SH, rx: 12, fill: full ? '#E8F5EE' : '#fff', stroke: full ? OKG : sel ? GOLD : GRAY, 'stroke-width': 2.5, 'stroke-dasharray': full ? '' : '6 4' }, g);
        NS('text', { x: s.x, y: s.y + 6 * F, 'text-anchor': 'middle', 'font-size': (full ? 19 : 14) * F, 'font-weight': 900, fill: full ? OKG : GRAY, text: full ? kind : 'drop here', 'pointer-events': 'none' }, g);
        function go() { if (sel) place(sel, s.k); }
        g.addEventListener('click', go); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      chips.innerHTML = ''; if (!show) return;
      var left = ['vertex', 'ray', 'ray'].filter(function (k, i) { return k === 'vertex' ? !S.at.vertex : (i === 1 ? !(S.at['ray-a'] && S.at['ray-b']) : !(S.at['ray-a'] || S.at['ray-b'])); });
      left.forEach(function (k, i) {
        var c = el('button', 'bm-chip an-chip' + (i === 0 ? ' an-next' : '') + (sel === k ? ' sel' : ''), k); c.type = 'button'; c.dataset.k = k; chips.appendChild(c);
        hdrag(c, function (t) { var s = t && t.closest && t.closest('.an-lslot'); if (s && box.contains(s)) place(k, s.getAttribute('data-k')); }, function () { sel = sel === k ? null : k; msg(sel ? 'Now tap the spot where "' + k + '" goes.' : ''); draw(); });
      });
      if (S.at.vertex && S.at['ray-a'] && S.at['ray-b']) flag(box, 'labels');
    }
    function place(c, k) {
      if (S.at[k]) return; var kind = k === 'vertex' ? 'vertex' : 'ray';
      if (c !== kind) { pluck(HZ.D4); msg(c === 'vertex' ? 'Not that spot. The vertex is the one point where the two rays meet.' : 'Not that spot. A ray is one of the two straight sides. It starts at the vertex.'); return; }
      S.at[k] = 1; sel = null; save(); pluck(HZ.C5); draw();
      if (S.at.vertex && S.at['ray-a'] && S.at['ray-b']) { flag(box, 'labels'); msg('✓ Every label is on its part: one vertex and two rays.', true); }
      else msg(kind === 'vertex' ? '✓ Yes. The vertex is the point where the two rays meet.' : '✓ Yes. A ray is one side of the angle. It starts at the vertex.', true);
    }

    /* a ray you open by dragging its round green handle (open, own) */
    function opener(V, b, L1, L2, lo, onRel, w) {
      line(V, P(V, b, L1), NAVY, w || 5); var e = P(V, b + S.a, L2), rl = line(V, e, GRN, w || 5), mk = S.a === 90 ? mark(V, b, 90, GRN) : null, ap = S.a === 90 ? null : NS('path', { d: arcD(V, 46, b, b + S.a), fill: 'none', stroke: GRN, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      if (DO === 'open') brad(V); else dot(V, NAVY, 6);
      var h = handle(e, GRN, 'an-h', 'The round green handle on the green ' + (DO === 'open' ? 'strip' : 'ray') + '. Drag it to open or close the angle.'), live = S.a;
      h.setAttribute('aria-valuenow', S.a);
      drag(h, svg, function (pt) {
        var a = (angTo(V, pt) - b + 360) % 360; if (a > 180) a = a > 270 ? lo : 180; live = Math.max(lo, a);
        var q = P(V, b + live, L2); rl.setAttribute('x2', q.x); rl.setAttribute('y2', q.y); h.setAttribute('transform', 'translate(' + (q.x - e.x) + ',' + (q.y - e.y) + ')');
        if (mk) { mk.remove(); mk = null; } if (!ap) ap = NS('path', { fill: 'none', stroke: GRN, 'stroke-width': 3, 'pointer-events': 'none' }, svg); ap.setAttribute('d', arcD(V, 46, b, b + live));
      }, function (pt) { if (pt) onRel(snapA(live, lo)); else draw(); });
      keys(h, function (k) { onRel(snapA(S.a + k * 5, lo)); refocus('an-h'); });
    }

    /* ── open (Think) ── */
    function drawOpen() {
      svg.setAttribute('viewBox', '0 0 700 400'); var V = { x: 350, y: 330 };
      setsq(V, 0, 175, false, { 'pointer-events': 'none', opacity: .55 });
      opener(V, 0, 270, 270, 4, setOpen, 9);
      svg.setAttribute('aria-label', 'Two strips pinned together at one end. A set square sits behind them. The strips are ' + (S.a === 180 ? 'open to one straight line.' : 'open ' + WORD[cls(S.a)] + '.'));
      if (S.a >= 10 && S.a < 90) flag(box, 'little'); if (S.a === 90) flag(box, 'right'); if (S.a === 180) flag(box, 'straight');
    }
    var OPENMSG = { less: 'The strips are open a little. The opening between them is the angle. It is smaller than the square corner.', right: '✓ The strips fit the square corner of the set square exactly. That is a right angle.', greater: 'The opening is wider than the square corner now.', straight: '✓ The two strips make one straight line. That is a straight angle.' };
    function setOpen(a) {
      S.a = a; save(); var c = cls(a); pluck(c === 'right' || c === 'straight' ? HZ.C5 : 220 + a * 2); draw();
      msg(a < 10 ? 'The strips are almost closed. Open them a little more.' : OPENMSG[c], c === 'right' || c === 'straight');
      if (a >= 10 && a < 90) flag(box, 'little');
    }

    /* ── parts (Your Turn) ── */
    var PB = +box.dataset.b || 20, PA = +box.dataset.a || 60;
    function drawParts() {
      var H = F > 1 ? 470 : 430; svg.setAttribute('viewBox', '0 0 700 ' + H); var V = { x: 175, y: 345 };
      var e1 = P(V, PB, 230), e2 = P(V, PB + PA, 185);
      line(V, e1, NAVY); line(V, e2, GRN); mark(V, PB, PA, GRN); dot(V, NAVY, 7);
      var all = S.at.vertex && S.at['ray-a'] && S.at['ray-b'];
      labels([{ k: 'vertex', x: 110, y: H - 32, to: V }, { k: 'ray-a', x: 600, y: H - 32, to: P(V, PB, 170) }, { k: 'ray-b', x: 450, y: 50 * F, to: P(V, PB + PA, 140) }], !all);
      // the set square appears once the labels are on
      if (all) {
        var C = S.sq ? V : { x: 425, y: H - 28 }, rot = S.sq ? PB : 0;
        var g = setsq(C, rot, 260, !S.sq, S.sq ? { 'pointer-events': 'none' } : { class: 'drag an-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag it so its square corner sits on the vertex.' });
        // keep the angle on top of the set square
        line(V, e1, NAVY); line(V, e2, GRN); mark(V, PB, PA, GRN); dot(V, NAVY, 7);
        if (!S.sq) {
          drag(g, svg, function (pt) { if (!g._o) g._o = { x: pt.x, y: pt.y }; g.setAttribute('transform', 'translate(' + (pt.x - g._o.x) + ',' + (pt.y - g._o.y) + ')'); }, function (pt) {
            var o = g._o; g._o = null; if (!pt || !o) { draw(); return; } var cx = C.x + pt.x - o.x, cy = C.y + pt.y - o.y;
            if (Math.hypot(cx - V.x, cy - V.y) < 55 * F) checkOn(); else { pluck(HZ.D4); draw(); msg('Drop the set square so its square corner lands on the vertex dot.'); } });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); checkOn(); } });
        }
      }
      sortRow(all && S.sq);
      svg.setAttribute('aria-label', 'An angle: a navy ray and a green ray meet at a dot.' + (S.sq ? ' The set square sits on the vertex with one edge on the navy ray.' : ''));
      if (S.sq) flag(box, 'checked'); if (S.c === ANS && S.sq) flag(box, 'sorted');
    }
    function checkOn() { S.sq = 1; save(); pluck(HZ.C5); draw(); flag(box, 'checked'); msg('✓ The square corner is on the vertex, and one edge lies on the navy ray. Now look at the green ray.', true); }

    /* ── ben: P and Q ── */
    var BB = 8;
    function drawBen() {
      svg.setAttribute('viewBox', '0 0 700 420'); var V1 = { x: 150, y: 350 }, V2 = S.laid ? V1 : { x: 500, y: 350 };
      line(V1, P(V1, BB, 250), NAVY); line(V1, P(V1, BB + 48, 270), GRN); mark(V1, BB, 48, GRN, 56); dot(V1, NAVY, 7);
      NS('text', { x: V1.x - 30 * F, y: V1.y + 8 * F, 'text-anchor': 'middle', 'font-size': 22 * F, 'font-weight': 900, fill: GRN, text: 'P', 'pointer-events': 'none' }, svg);
      var g = NS('g', S.laid ? { 'pointer-events': 'none', opacity: .9 } : {}, svg), e2 = P(V2, BB + 110, S.len);
      function L(a, b, c, w, x) { var o = { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: c, 'stroke-width': w || 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }; for (var k in (x || {})) o[k] = x[k]; return NS('line', o, g); }
      L(V2, P(V2, BB, 150), NAVY, S.laid ? 4 : 5, S.laid ? { 'stroke-dasharray': '8 6' } : {}); var rl = L(V2, e2, RED);
      NS('path', { d: arcD(V2, S.laid ? 70 : 52, BB, BB + 110), fill: 'none', stroke: RED, 'stroke-width': 3, 'pointer-events': 'none' }, g);
      if (!S.laid) NS('text', { x: V2.x - 30 * F, y: V2.y + 8 * F, 'text-anchor': 'middle', 'font-size': 22 * F, 'font-weight': 900, fill: RED, text: 'Q', 'pointer-events': 'none' }, g);
      else NS('text', { x: P(V1, BB + 110, Math.min(S.len, 160) * .6).x - 24 * F, y: P(V1, BB + 110, Math.min(S.len, 160) * .6).y, 'text-anchor': 'middle', 'font-size': 22 * F, 'font-weight': 900, fill: RED, text: 'Q', 'pointer-events': 'none' }, svg);
      if (!S.laid) {
        // Q's vertex handle (gold ring): drag the whole angle Q
        var vh = NS('g', { class: 'drag an-qv', tabindex: 0, role: 'slider', 'aria-label': "Angle Q's vertex. Drag it onto angle P's vertex." }, svg);
        NS('circle', { cx: V2.x, cy: V2.y, r: 24 * F, fill: 'transparent' }, vh); NS('circle', { cx: V2.x, cy: V2.y, r: 15 * F, fill: 'none', stroke: GOLD, 'stroke-width': 3 }, vh);
        drag(vh, svg, function (pt) { var t = 'translate(' + (pt.x - V2.x) + ',' + (pt.y - V2.y) + ')'; g.setAttribute('transform', t); vh.setAttribute('transform', t); }, function (pt) {
          if (pt && Math.hypot(pt.x - V1.x, pt.y - V1.y) < 50 * F) { S.laid = 1; save(); pluck(HZ.C5); draw(); flag(box, 'laid'); msg("✓ The vertices match, and the bottom rays line up. Now compare the openings: look at the green ray and the red ray.", true); }
          else { if (pt) { pluck(HZ.D4); msg("Drop angle Q's vertex right on angle P's vertex, the dot at the left."); } draw(); } });
        vh.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.laid = 1; save(); draw(); flag(box, 'laid'); } });
        // the end of Q's red ray: drag it out along the ray
        var eh = handle(e2, RED, 'an-end', "End of angle Q's red ray. Drag it to make the ray longer."), live = S.len, dir = BB + 110;
        drag(eh, svg, function (pt) { var dx = pt.x - V2.x, dy = V2.y - pt.y, a = dir * Math.PI / 180; live = Math.max(80, Math.min(240, dx * Math.cos(a) + dy * Math.sin(a))); var q = P(V2, dir, live); rl.setAttribute('x2', q.x); rl.setAttribute('y2', q.y); eh.setAttribute('transform', 'translate(' + (q.x - e2.x) + ',' + (q.y - e2.y) + ')'); }, function (pt) { if (pt) setLen(live); else draw(); });
        keys(eh, function (k) { setLen(S.len + k * 20); refocus('an-end'); });
      }
      dot(V2, NAVY, 7);
      svg.setAttribute('aria-label', 'Angle P has long rays and a small opening. Angle Q has short rays and a wide opening.' + (S.laid ? ' Angle Q now sits on angle P, vertex on vertex.' : ''));
      if (S.len >= 190) flag(box, 'stretched'); if (S.laid) flag(box, 'laid');
    }
    function setLen(v) { S.len = Math.max(80, Math.min(240, Math.round(v))); save(); pluck(200 + S.len); draw(); if (S.len >= 190) { flag(box, 'stretched'); msg("✓ Angle Q's red ray is much longer now, but the opening did not change. Angle Q is still the same size.", true); } else msg('The red ray is a little longer. Drag it much longer.'); }

    /* ── turn: Mia's turned right angle ── */
    var TB = +box.dataset.b || 30;
    function drawTurn() {
      var H = 430; svg.setAttribute('viewBox', '0 0 700 ' + H); var V = { x: 265, y: 330 }, SZ = 175;
      var C = S.on ? V : { x: 470, y: 380 }, fits = S.on && S.rot === TB;
      var g = setsq(C, S.rot, SZ, !S.on, S.on ? { 'pointer-events': 'none' } : { class: 'drag an-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag it so its square corner sits on the vertex.' });
      line(V, P(V, TB, 240), NAVY); line(V, P(V, TB + 90, 220), GRN); dot(V, NAVY, 7);
      if (fits) mark(V, TB, 90, GRN);
      // the round turn handle, just past the long edge
      var hp = P(C, S.rot + 45, SZ * .707 + 30), rh = NS('g', { class: 'drag an-rot', tabindex: 0, role: 'slider', 'aria-label': 'Round turn handle of the set square. Drag it around to turn the set square.' }, svg);
      NS('circle', { cx: hp.x, cy: hp.y, r: 24 * F, fill: 'transparent' }, rh); NS('circle', { cx: hp.x, cy: hp.y, r: 16 * F, fill: '#fff', stroke: GRAY, 'stroke-width': 3 }, rh); NS('text', { x: hp.x, y: hp.y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, fill: NAVY, text: '⟳', 'pointer-events': 'none' }, rh);
      var lr = S.rot;
      drag(rh, svg, function (pt) { lr = ((Math.round((angTo(C, pt) - 45) / 15) * 15) % 360 + 360) % 360; g.setAttribute('transform', 'rotate(' + (S.rot - lr) + ' ' + C.x + ' ' + C.y + ')'); var q = P(C, lr + 45, SZ * .707 + 30); rh.setAttribute('transform', 'translate(' + (q.x - hp.x) + ',' + (q.y - hp.y) + ')'); }, function (pt) { if (pt) setRot(lr); else draw(); });
      keys(rh, function (k) { setRot(S.rot + k * 15); refocus('an-rot'); });
      btns.innerHTML = ''; btn('↺ Turn', 'sm ghost an-tl', function () { setRot(S.rot + 15); }); btn('↻ Turn', 'sm ghost an-tr', function () { setRot(S.rot - 15); });
      if (!S.on) {
        drag(g, svg, function (pt) { if (!g._o) g._o = { x: pt.x, y: pt.y }; g.setAttribute('transform', 'translate(' + (pt.x - g._o.x) + ',' + (pt.y - g._o.y) + ')'); }, function (pt) {
          var o = g._o; g._o = null; if (!pt || !o) { draw(); return; } var cx = C.x + pt.x - o.x, cy = C.y + pt.y - o.y;
          if (Math.hypot(cx - V.x, cy - V.y) < 55 * F) { S.on = 1; save(); pluck(HZ.C5); draw(); flag(box, 'on'); fitMsg(); } else { pluck(HZ.D4); draw(); msg('Drop the set square so its square corner lands on the vertex dot.'); } });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.on = 1; save(); draw(); flag(box, 'on'); fitMsg(); } });
      }
      sortRow(fits);
      svg.setAttribute('aria-label', "Mia's angle: a navy ray and a green ray, turned so neither ray lies flat." + (S.on ? ' The set square sits on the vertex.' : '') + (fits ? ' It fits exactly.' : ''));
      if (S.on) flag(box, 'on'); if (fits) flag(box, 'fits'); if (fits && S.c === ANS) flag(box, 'sorted');
    }
    function setRot(r) { S.rot = ((r % 360) + 360) % 360; save(); pluck(S.on && S.rot === TB ? HZ.C5 : HZ.E4); draw(); fitMsg(); }
    function fitMsg() { if (!S.on) { msg('The set square turned. Now drag it so its square corner sits on the vertex.'); return; } if (S.rot === TB) { flag(box, 'fits'); msg('✓ The set square fits exactly. Both rays lie right along its edges.', true); } else msg('The square corner is on the vertex, but the edges do not line up with both rays yet. Turn the set square.'); }

    /* ── meet: Kai's sticks ── */
    function drawMeet() {
      svg.setAttribute('viewBox', '0 0 700 400'); var V = { x: 215, y: 320 }, FE = P(V, 68, 270), E0 = { x: V.x + 70, y: V.y - 75 };
      var E = S.met ? V : (S.ex ? { x: S.ex, y: S.ey } : E0);
      line(V, P(V, -4, 380), NAVY, 7); var gl = line(FE, E, GRN, 7);
      if (S.met) { mark(V, -4, 72, GRN); dot(V, NAVY, 7); }
      else {
        dot(V, NAVY, 5);
        var h = handle(E, GRN, 'an-e', 'Loose end of the green stick. Drag it onto the end of the navy stick.'), live = E;
        drag(h, svg, function (pt) { live = pt; gl.setAttribute('x2', pt.x); gl.setAttribute('y2', pt.y); h.setAttribute('transform', 'translate(' + (pt.x - E.x) + ',' + (pt.y - E.y) + ')'); }, function (pt) {
          if (!pt) { draw(); return; } if (Math.hypot(pt.x - V.x, pt.y - V.y) < 38 * F) { S.met = 1; save(); pluck(HZ.C5); draw(); flag(box, 'met'); msg('✓ Now the two sticks meet at one point. They make an angle.', true); }
          else { S.ex = Math.max(30, Math.min(670, pt.x)); S.ey = Math.max(30, Math.min(370, pt.y)); save(); pluck(HZ.D4); draw(); msg('The sticks still do not touch. Drag the green end onto the end of the navy stick.'); } });
        h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.met = 1; save(); draw(); flag(box, 'met'); } });
      }
      if (S.met && !S.v) {
        var t = NS('g', { class: 'an-v', role: 'button', tabindex: 0, 'aria-label': 'The point where the sticks meet', style: 'cursor:pointer' }, svg);
        NS('circle', { cx: V.x, cy: V.y, r: 22 * F, fill: 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 3 }, t); NS('circle', { cx: V.x, cy: V.y, r: 6, fill: GOLD }, t);
        function tap() { S.v = 1; save(); pluck(HZ.C5); draw(); flag(box, 'vertex'); msg('✓ That point is the vertex, where the two sides meet.', true); }
        t.addEventListener('click', tap); t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
      }
      if (S.v) pill(V.x, V.y + 42 * F, 'vertex', NAVY);
      svg.setAttribute('aria-label', S.met ? 'A navy stick and a green stick meet at one point.' : 'A navy stick and a green stick. They do not touch: there is a gap between them.');
      if (S.met) flag(box, 'met'); if (S.v) flag(box, 'vertex');
    }

    /* ── own: make an angle greater than a right angle on grid paper ── */
    function drawOwn() {
      var H = F > 1 ? 470 : 430; svg.setAttribute('viewBox', '0 0 700 ' + H); paper(H, true); var V = { x: 330, y: H - 110 };
      var g = S.a > 90 && S.a < 180;
      if (S.sq) setsq(V, 0, 170, false);
      opener(V, 0, 300, 230, 10, setOwn);
      btns.innerHTML = ''; btn('📐 Check with the square corner', 'an-chk', function () { S.sq = 1; save(); draw(); ownMsg(true); }, S.sq && g);
      var ready = S.sq && g;
      if (ready || S.at.vertex || S.at['ray-a'] || S.at['ray-b']) labels([{ k: 'vertex', x: V.x - 150, y: H - 34, to: V }, { k: 'ray-a', x: 600, y: H - 34, to: P(V, 0, 240) }, { k: 'ray-b', x: Math.min(560, Math.max(100, P(V, S.a, 160).x)), y: 44 * F, to: P(V, S.a, 170) }], ready && !(S.at.vertex && S.at['ray-a'] && S.at['ray-b']));
      svg.setAttribute('aria-label', 'Grid paper with an angle you can open. It is ' + WORD[cls(S.a)] + '.');
      if (g) flag(box, 'greater'); else flag(box, 'greater', false); if (ready) flag(box, 'checked');
    }
    function ownMsg(chk) {
      var c = cls(S.a);
      if (!S.sq) { msg(c === 'greater' ? 'Your angle is open wider than a square corner. Check it with the square corner.' : c === 'straight' ? 'That is a straight line: a straight angle. Close it a little.' : c === 'right' ? 'That is a square corner. Open it a little wider.' : 'That opening is small. Open it wider.'); return; }
      if (c === 'greater') { pluck(HZ.C5); flag(box, 'checked'); msg('✓ The green ray sticks out past the set square. Your angle is greater than a right angle.', true); }
      else msg(c === 'less' ? 'The green ray hides under the set square. That angle is less than a right angle. Open it wider.' : c === 'right' ? 'The green ray lies right on the edge of the set square. That is a right angle. Open it a little wider.' : 'The two rays make one straight line. That is a straight angle. Close it a little.');
    }
    function setOwn(a) { S.a = a; save(); pluck(a === 90 ? HZ.C5 : 220 + a * 2); draw(); ownMsg(); }

    /* ── euclid: one line standing on a straight line ── */
    function drawEuclid() {
      svg.setAttribute('viewBox', '0 0 700 380'); var V = { x: 350, y: 300 }, s = S.s;
      line({ x: 60, y: V.y }, { x: 640, y: V.y }, NAVY, 5);
      if (s === 90) { mark(V, 0, 90, GRN); mark(V, 90, 90, RED); }
      else { NS('path', { d: arcD(V, 52, 0, s), fill: 'none', stroke: GRN, 'stroke-width': 4, 'pointer-events': 'none' }, svg); NS('path', { d: arcD(V, 68, s, 180), fill: 'none', stroke: RED, 'stroke-width': 4, 'pointer-events': 'none' }, svg); }
      var e = P(V, s, 240), rl = line(V, e, NAVY, 5); dot(V, NAVY, 7);
      var gp = P(V, s / 2, 96), rp = P(V, (s + 180) / 2, 112);
      NS('text', { x: gp.x, y: gp.y + 7, 'text-anchor': 'middle', 'font-size': 18 * F, 'font-weight': 900, fill: GRN, text: 'green', 'pointer-events': 'none' }, svg);
      NS('text', { x: rp.x, y: rp.y + 7, 'text-anchor': 'middle', 'font-size': 18 * F, 'font-weight': 900, fill: RED, text: 'red', 'pointer-events': 'none' }, svg);
      var h = handle(e, GOLD, 'an-h', 'The gold handle on the standing line. Drag it to lean the line left or right.'), live = s;
      drag(h, svg, function (pt) { var a = angTo(V, pt); if (a > 180) a = a > 270 ? 6 : 174; live = Math.max(6, Math.min(174, a)); var q = P(V, live, 240); rl.setAttribute('x2', q.x); rl.setAttribute('y2', q.y); h.setAttribute('transform', 'translate(' + (q.x - e.x) + ',' + (q.y - e.y) + ')'); }, function (pt) { if (pt) setS(live); else draw(); });
      keys(h, function (k) { setS(S.s + k * 5); refocus('an-h'); });
      svg.setAttribute('aria-label', 'A straight line with one line standing on it. The green angle is on the right and the red angle is on the left.' + (s === 90 ? ' Both have square corner marks.' : ''));
      if (S.eq) flag(box, 'equal'); if (S.ln) flag(box, 'lean');
    }
    function setS(v) {
      v = Math.round(v); if (Math.abs(v - 90) <= 5) v = 90; S.s = Math.max(6, Math.min(174, v));
      if (S.s === 90) { S.eq = 1; save(); pluck(HZ.C5); draw(); flag(box, 'equal'); msg('✓ The green angle and the red angle are the same size. Euclid says each one is a right angle.', true); return; }
      if (S.eq && S.s >= 100) { S.ln = 1; save(); pluck(HZ.E5); draw(); flag(box, 'lean'); msg('✓ The red angle is less than a right angle now. Look at the green angle.', true); return; }
      save(); pluck(HZ.D4); draw(); msg(S.eq ? (S.s < 90 ? 'Now the green angle is the small one. Lean the line the other way, to the left.' : 'Lean it a little more to the left.') : 'The two angles are not the same size yet. Keep moving the line.');
    }


    /* ══ 3.12.03 right angles (patch1203): the folded papyrus checker ══ */
    var PAP = '#EFE0BC', PAPE = '#8C7550', PAPD = '#6B4A12';
    if (DO === 'fold') WHY = { right: { less: 'If it were less, the set square would stick out past one of your folded edges. Here both edges lie right on top of each other.', greater: 'If it were greater, your folded paper would stick out past the set square. Here both edges lie right on top of each other.' } };
    if (DO === 'look') WHY = { greater: { less: 'If it were less, the green side would hide under the checker. Here there is a gap between them.', right: 'A right angle fits the checker exactly. Here there is a gap between the checker and the green side.' } };
    // bumpy radius for a torn scrap: r(theta) in degrees, seeded
    function bump(seed) { var s = seed || 1; return function (t) { var a = t * Math.PI / 180; return 1 + .10 * Math.sin(3 * a + s * 1.7) + .07 * Math.sin(5 * a + s * 2.9) + .05 * Math.sin(8 * a + s * .6) + .03 * Math.sin(13 * a + s); }; }
    function ptsD(ps, close) { return ps.map(function (p, i) { return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join(' ') + (close ? ' Z' : ''); }
    // the folded checker: square corner at c, straight edges along rot and rot + 90, a torn edge between them
    function checker(c, rot, size, extra, seed) {
      var g = NS('g', extra || { 'pointer-events': 'none' }, svg), R = bump(seed || 3), ps = [c], k;
      for (k = 0; k <= 90; k += 3) { var q = k === 0 || k === 90 ? 1 : (.92 + .16 * (R(k * 4) - .9)); ps.push(P(c, rot + k, size * q)); }
      NS('path', { d: ptsD(ps, true), fill: PAP, 'fill-opacity': .93, stroke: PAPE, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g);
      g.appendChild(line(c, P(c, rot, size), PAPD, 3)); g.appendChild(line(c, P(c, rot + 90, size), PAPD, 3));
      var m1 = P(c, rot, 13), m2 = P(m1, rot + 90, 13), m3 = P(c, rot + 90, 13);
      NS('polyline', { points: [m1, m2, m3].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: 'none', stroke: PAPE, 'stroke-width': 1.5 }, g);
      return g;
    }
    function sqMark(V, b, col) { var m = mark(V, b, 90, col || GRN); if (m) m.setAttribute('stroke-width', 3.5); return m; }
    // drag a whole group; onDrop gets the drop point of the group's anchor (or null)
    function dragGroup(g, anchor, onDrop) {
      drag(g, svg, function (pt) { if (!g._o) g._o = { x: pt.x, y: pt.y }; g.setAttribute('transform', 'translate(' + (pt.x - g._o.x) + ',' + (pt.y - g._o.y) + ')'); },
        function (pt) { var o = g._o; g._o = null; if (!pt || !o) { draw(); return; } onDrop({ x: anchor.x + pt.x - o.x, y: anchor.y + pt.y - o.y }); });
    }
    function wrongBeep(t) { pluck(HZ.D4); msg(t); }

    /* ── fold (Think) ── */
    function drawFold() {
      var H = F > 1 ? 460 : 420; svg.setAttribute('viewBox', '0 0 700 ' + H); var R = bump(S.seed), C = { x: 350, y: 250 }, RAD = 140, ps = [], k;
      btns.innerHTML = '';
      if (S.f === 0) {
        for (k = 0; k < 360; k += 4) ps.push(P(C, k, RAD * R(k)));
        NS('path', { d: ptsD(ps, true), fill: PAP, stroke: PAPE, 'stroke-width': 2 }, svg);
        line(P(C, 180, RAD * 1.25), P(C, 0, RAD * 1.25), GRAY, 2, { 'stroke-dasharray': '7 6' });
        NS('text', { x: C.x + RAD * 1.25 + 8, y: C.y + 5, 'font-size': 15 * F, 'font-weight': 800, fill: GRAY, text: 'fold here', 'pointer-events': 'none' }, svg);
        btn('✋ Fold 1: fold the scrap in half', 'an-f1', function () { S.f = 1; save(); pluck(HZ.E4); draw(); flag(box, 'fold1'); msg('✓ The fold made one straight edge, even though the scrap had bumpy edges.', true); });
      } else if (S.f === 1) {
        // folded in half: the top half, as wide as both halves together, with a straight bottom edge
        for (k = 0; k <= 180; k += 3) ps.push(P(C, k, RAD * Math.max(R(k), R(360 - k))));
        NS('path', { d: ptsD(ps, true), fill: PAP, stroke: PAPE, 'stroke-width': 2 }, svg);
        line(P(C, 180, RAD * R(180)), P(C, 0, RAD * Math.max(R(0), R(360))), NAVY, 5);
        line({ x: C.x, y: C.y + 22 }, { x: C.x, y: C.y - RAD * 1.3 }, GRAY, 2, { 'stroke-dasharray': '7 6' });
        NS('text', { x: C.x + 8, y: C.y - RAD * 1.3 + 4, 'font-size': 15 * F, 'font-weight': 800, fill: GRAY, text: 'fold here', 'pointer-events': 'none' }, svg);
        pill(C.x + RAD * .55, C.y + 30 * F, 'straight edge', NAVY);
        btn('✋ Fold 2: fold the straight edge onto itself', 'an-f2', function () { S.f = 2; save(); pluck(HZ.G4); draw(); flag(box, 'fold2'); msg('✓ The straight edge folded onto itself. Look at the new corner.', true); });
      } else {
        // folded twice: a quarter, square corner at the bottom left
        var SQ = { x: 530, y: H - 70 }, at = S.on ? SQ : { x: 150, y: H - 90 }, sz = 150;
        setsq(SQ, 0, 170, false);
        var g = checker(at, 0, sz, S.on ? { 'pointer-events': 'none' } : { class: 'drag an-ck', tabindex: 0, role: 'slider', 'aria-label': 'Your folded corner. Drag it onto the square corner of the set square.' }, S.seed);
        if (!S.on) { NS('circle', { cx: at.x, cy: at.y, r: 9, fill: GOLD, 'pointer-events': 'none' }, g); pill(at.x + 70, at.y + 40 * F > H - 6 ? H - 22 : at.y + 34 * F, 'your folded corner', PAPD); }
        else { sqMark(SQ, 0, GRN); pill(SQ.x + 85, SQ.y - 200 > 30 ? SQ.y - 205 : 30, 'corner on corner, edge on edge', OKG); }
        if (!S.on) {
          dragGroup(g, at, function (p) { if (Math.hypot(p.x - SQ.x, p.y - SQ.y) < 60 * F) fitOn(); else { wrongBeep('Drop your folded corner right on the square corner of the set square, the corner at the bottom left.'); draw(); } });
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fitOn(); } });
        }
        if (S.c === ANS) btn('🔄 Tear a new scrap and fold it again', 'ghost sm an-new', function () { S.seed = (S.seed % 7) + 1; S.f = 0; S.on = 0; save(); draw(); msg('A new scrap, with different bumpy edges. Fold it twice again.'); });
      }
      sortRow(S.f === 2 && S.on);
      svg.setAttribute('aria-label', ['A torn scrap of papyrus with bumpy edges.', 'The scrap folded in half. The fold is one straight edge.', 'The scrap folded twice. It has one square corner.' + (S.on ? ' It sits on the square corner of the set square and fits exactly.' : '')][S.f]);
      if (S.f >= 1) flag(box, 'fold1'); if (S.f >= 2) flag(box, 'fold2'); if (S.on) flag(box, 'fit'); if (S.on && S.c === ANS) flag(box, 'sorted');
    }
    function fitOn() { S.on = 1; save(); pluck(HZ.C5); draw(); flag(box, 'fit'); msg('✓ It fits exactly: corner on corner, and both straight edges lie on the edges of the set square.', true); }

    /* ── corners: check every corner of a shape, then mark the right angles ── */
    var PTS = (box.dataset.pts || '').split(';').filter(Boolean).map(function (s) { var a = s.split(','); return { x: +a[0], y: +a[1] }; });
    var LET = 'ABCDEFGH';
    function cornerInfo(i) {
      var n = PTS.length, V = PTS[i], nx = PTS[(i + 1) % n], pv = PTS[(i + n - 1) % n], b = angTo(V, nx), d = (angTo(V, pv) - b + 360) % 360;
      var a = d <= 180 ? d : 360 - d, rot = d <= 180 ? b : b - 90;
      return { V: V, a: a, rot: rot, free: d <= 180 ? b + 90 : b - 90, kind: Math.abs(a - 90) < 1.5 ? 'right' : a < 90 ? 'less' : 'greater', other: d <= 180 ? b + a : b - a };
    }
    var CMSG = { right: 'fits exactly. Both sides lie along its edges. It is a right angle.', less: 'is smaller: the second side hides under the checker. It is less than a right angle.', greater: 'is wider: there is a gap between the checker and the second side. It is greater than a right angle.' };
    function drawCorners() {
      svg.setAttribute('viewBox', '0 0 700 420'); var n = PTS.length, allC = true, i;
      NS('polygon', { points: PTS.map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: '#FBF6EA', stroke: 'none', 'pointer-events': 'none' }, svg);
      for (i = 0; i < n; i++) line(PTS[i], PTS[(i + 1) % n], NAVY, 5);
      for (i = 0; i < n; i++) { if (!S.chk[i]) allC = false; if (S.mk[i]) { var ci = cornerInfo(i); sqMark(ci.V, ci.rot, GRN); } }
      // the checker: in the tray, or on the last corner checked
      var tray = { x: 585, y: 395 }, li = S.last >= 0 && !allC ? cornerInfo(S.last) : null, at = li ? li.V : tray;
      if (li && li.kind === 'greater') NS('path', { d: 'M' + li.V.x + ' ' + li.V.y + ' L' + P(li.V, li.free, 70).x + ' ' + P(li.V, li.free, 70).y + ' L' + P(li.V, li.other, 70).x + ' ' + P(li.V, li.other, 70).y + ' Z', fill: 'rgba(178,58,46,.22)', stroke: 'none', 'pointer-events': 'none' }, svg);
      // corner letters and tap spots
      for (i = 0; i < n; i++) (function (i) {
        var c = cornerInfo(i), lp = P(c.V, c.rot + 45 + 180, 32 * F), done = S.chk[i];
        NS('text', { x: lp.x, y: lp.y + 7 * F, 'text-anchor': 'middle', 'font-size': 21 * F, 'font-weight': 900, fill: done ? (c.kind === 'right' ? OKG : NAVY) : NAVY, text: LET[i], 'pointer-events': 'none' }, svg);
        var t = NS('g', { class: 'rk-v' + (done ? ' done' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'Corner ' + LET[i] + (done ? ', checked: ' + WORD[c.kind] : '') + (S.mk[i] ? ', marked' : '') }, svg);
        NS('circle', { cx: c.V.x, cy: c.V.y, r: 22 * F, fill: 'transparent' }, t);
        NS('circle', { cx: c.V.x, cy: c.V.y, r: 7, fill: done ? (c.kind === 'right' ? OKG : RED) : GOLD, stroke: '#fff', 'stroke-width': 2 }, t);
        function go() { if (allC) markIt(i); else checkIt(i); }
        t.addEventListener('click', go); t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      })(i);
      // the checker goes on top, so on a phone a press on it never lands on a corner's tap spot
      var g = allC ? null : checker(at, li ? li.rot : 0, 72, { class: 'drag rk-ck', tabindex: 0, role: 'slider', 'aria-label': 'The folded checker. Drag it onto a corner of the shape.' }, 3);
      if (li && li.kind === 'less') line(li.V, P(li.V, li.other, 72), NAVY, 3, { 'stroke-dasharray': '5 5', opacity: .6 });
      if (g && !li) pill(tray.x - 70 * F, tray.y - 12, 'checker', PAPD);
      if (g) {
        dragGroup(g, at, function (p) { var best = -1, bd = 1e9; PTS.forEach(function (q, k) { var d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = k; } }); if (bd < 60 * F) checkIt(best); else { wrongBeep('Drop the checker so its square corner lands right on a corner of the shape.'); draw(); } });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); for (var k = 0; k < n; k++) if (!S.chk[k]) { checkIt(k); return; } } });
      }
      svg.setAttribute('aria-label', 'A shape with ' + n + ' corners, ' + LET.slice(0, n).split('').join(', ') + '.' + (allC ? ' Every corner is checked.' : ''));
      if (allC) flag(box, 'checked'); if (allC && marksOK()) flag(box, 'marked');
    }
    function marksOK() { for (var i = 0; i < PTS.length; i++) if (!!S.mk[i] !== (cornerInfo(i).kind === 'right')) return false; return true; }
    function checkIt(i) {
      var c = cornerInfo(i); S.chk[i] = 1; S.last = i; save(); pluck(c.kind === 'right' ? HZ.C5 : c.kind === 'less' ? HZ.E4 : HZ.G4); draw();
      var left = 0; for (var k = 0; k < PTS.length; k++) if (!S.chk[k]) left++;
      msg((c.kind === 'right' ? '✓ ' : '') + 'Corner ' + LET[i] + ' ' + CMSG[c.kind] + (left ? ' ' + left + (left === 1 ? ' corner' : ' corners') + ' left to check.' : ' Every corner is checked.'), c.kind === 'right');
      if (!left) flag(box, 'checked');
    }
    function markIt(i) {
      var c = cornerInfo(i);
      if (S.mk[i]) { delete S.mk[i]; save(); draw(); msg('Corner ' + LET[i] + ': mark taken off.'); flag(box, 'marked', false); return; }
      if (c.kind !== 'right') { wrongBeep('Corner ' + LET[i] + ' is ' + WORD[c.kind] + '. Only right angles get the small square.'); return; }
      S.mk[i] = 1; save(); pluck(HZ.C5); draw();
      if (marksOK()) { flag(box, 'marked'); msg('✓ Every right angle has its small square, and no other corner does.', true); }
      else msg('✓ Corner ' + LET[i] + ' is marked with a small square.', true);
    }

    /* ── look: a corner that looks square ── */
    var LB = +box.dataset.b || 12, LA = +box.dataset.a || 100;
    function drawLook() {
      var H = 420; svg.setAttribute('viewBox', '0 0 700 ' + H); var V = { x: 250, y: 330 }, tray = { x: 560, y: 380 };
      NS('polygon', { points: [V, P(V, LB, 300), P(P(V, LB, 300), LB + LA, 220), P(V, LB + LA, 220)].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: '#F4EEE2', stroke: 'none', 'pointer-events': 'none' }, svg);
      line(V, P(V, LB, 300), NAVY); line(V, P(V, LB + LA, 260), GRN); dot(V, NAVY, 7);
      if (S.on) {
        NS('path', { d: 'M' + V.x + ' ' + V.y + ' L' + P(V, LB + 90, 150).x + ' ' + P(V, LB + 90, 150).y + ' L' + P(V, LB + LA, 150).x + ' ' + P(V, LB + LA, 150).y + ' Z', fill: 'rgba(178,58,46,.28)', stroke: 'none', 'pointer-events': 'none' }, svg);
        checker(V, LB, 150, { 'pointer-events': 'none' }, 5); line(V, P(V, LB + LA, 260), GRN); dot(V, NAVY, 7);
        var gp = P(V, LB + 90 + (LA - 90) / 2, 190); pill(gp.x - 40, gp.y - 10, 'gap', RED);
      } else {
        var g = checker(tray, 0, 110, { class: 'drag an-ck', tabindex: 0, role: 'slider', 'aria-label': 'The folded checker. Drag it so its square corner sits on the vertex.' }, 5);
        dragGroup(g, tray, function (p) { if (Math.hypot(p.x - V.x, p.y - V.y) < 60 * F) lookOn(); else { wrongBeep('Drop the checker so its square corner lands on the vertex dot.'); draw(); } });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lookOn(); } });
      }
      sortRow(!!S.on);
      svg.setAttribute('aria-label', "The corner of Ben's tile: a navy side and a green side." + (S.on ? ' The checker sits on the corner with one edge on the navy side. There is a gap between the checker and the green side.' : ''));
      if (S.on) flag(box, 'on'); if (S.on && S.c === ANS) flag(box, 'sorted');
    }
    function lookOn() { S.on = 1; save(); pluck(HZ.G4); draw(); flag(box, 'on'); msg('The checker sits on the vertex, with one edge on the navy side. Look between the checker and the green side.'); }

    /* ── cross: two streets cross ── */
    var XB = +box.dataset.b || 20, XA = +box.dataset.a || 90;
    function drawCross() {
      var H = 420; svg.setAttribute('viewBox', '0 0 700 ' + H); var V = { x: 350, y: 210 }, dirs = [XB, XB + XA, XB + 180, XB + XA + 180], i, cnt = 0;
      [[XB, XB + 180, 'Street 1'], [XB + XA, XB + XA + 180, 'Street 2']].forEach(function (s) { line(P(V, s[0], 330), P(V, s[1], 330), '#E8D9B5', 46 * (F > 1 ? 1.2 : 1), { 'stroke-linecap': 'butt' }); });
      line(P(V, XB, 330), P(V, XB + 180, 330), NAVY, 5); line(P(V, XB + XA, 330), P(V, XB + XA + 180, 330), GRN, 5);
      var l1 = P(V, XB, 250), l2 = P(V, XB + XA, 175);
      pill(l1.x, l1.y + 34 * F, 'Street 1', NAVY); pill(l2.x + 60 * F, l2.y, 'Street 2', GRN);
      for (i = 0; i < 4; i++) (function (i) {
        var b = dirs[i], done = S.t[i];
        if (done) { cnt++; if (S.last === i) checker(V, b, 70, { 'pointer-events': 'none', opacity: .7 }, 2 + i); sqMark(V, b, OKG); }
        var tp = P(V, b + 45, F > 1 ? 125 : 92), t = NS('g', { class: 'rk-q' + (done ? ' done' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'Corner ' + (i + 1) + ' at the crossing' + (done ? ', a right angle' : '') }, svg);
        NS('circle', { cx: tp.x, cy: tp.y, r: 30 * F, fill: done ? 'rgba(30,122,76,.12)' : 'rgba(201,162,39,.18)', stroke: done ? OKG : GOLD, 'stroke-width': 2.5, 'stroke-dasharray': done ? '' : '6 4' }, t);
        NS('text', { x: tp.x, y: tp.y + 7 * F, 'text-anchor': 'middle', 'font-size': 20 * F, 'font-weight': 900, fill: done ? OKG : NAVY, text: done ? '✓' : String(i + 1), 'pointer-events': 'none' }, t);
        function go() { if (S.t[i]) return; S.t[i] = 1; S.last = i; save(); pluck(HZ.C5 + i * 40); draw(); var c = 0; for (var k = 0; k < 4; k++) if (S.t[k]) c++; if (c === 4) { flag(box, 'four'); msg('✓ All four corners at the crossing are right angles.', true); } else msg('✓ Corner ' + (i + 1) + ' fits the checker: a right angle. Check the other corners too.', true); }
        t.addEventListener('click', go); t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      })(i);
      dot(V, NAVY, 7);
      svg.setAttribute('aria-label', 'Two streets cross at one point and make four corners.' + (cnt ? ' ' + cnt + ' of them checked: right angles.' : ''));
      if (cnt === 4) flag(box, 'four');
    }

    /* ── perp: stand a line on a slanted road, then check it ── */
    var RB = +box.dataset.b || 30;
    function drawPerp() {
      var H = F > 1 ? 470 : 440; svg.setAttribute('viewBox', '0 0 700 ' + H); paper(H, false); var V = { x: 330, y: H - 150 };
      var ok = S.a === 90, C = S.on ? V : { x: 120, y: 110 }, fits = S.on && ok && (S.rot === ((RB % 360) + 360) % 360 || S.rot === ((RB + 90) % 360 + 360) % 360);
      if (ok) { var g2 = setsq(C, S.rot, 150, !S.on, S.on ? { 'pointer-events': 'none' } : { class: 'drag an-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag it so its square corner sits on the dot.' }); }
      line(P(V, RB + 180, 320), P(V, RB, 320), NAVY, 6); var rp = P(V, RB, 250); pill(rp.x, rp.y + 30 * F, 'the road', NAVY);
      var e = P(V, RB + S.a, 210), gl = line(V, e, GRN, 5);
      if (ok) sqMark(V, RB, GRN); else NS('path', { d: arcD(V, 40, RB, RB + S.a), fill: 'none', stroke: GRN, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      dot(V, NAVY, 7);
      if (!S.on) {
        var h = handle(e, GRN, 'an-h', 'The round green handle on the new line. Drag it to stand the line up or lean it.'), live = S.a;
        drag(h, svg, function (pt) { var a = (angTo(V, pt) - RB + 360) % 360; if (a > 180) a = a > 270 ? 10 : 170; live = Math.max(10, Math.min(170, a)); var q = P(V, RB + live, 210); gl.setAttribute('x2', q.x); gl.setAttribute('y2', q.y); h.setAttribute('transform', 'translate(' + (q.x - e.x) + ',' + (q.y - e.y) + ')'); }, function (pt) { if (pt) setPerp(live); else draw(); });
        keys(h, function (k) { setPerp(S.a + k * 4); refocus('an-h'); });
      }
      btns.innerHTML = '';
      if (ok) {
        var hp = P(C, S.rot + 45, 150 * .707 + 30), rh = NS('g', { class: 'drag an-rot', tabindex: 0, role: 'slider', 'aria-label': 'Round turn handle of the set square. Drag it around to turn the set square.' }, svg);
        NS('circle', { cx: hp.x, cy: hp.y, r: 24 * F, fill: 'transparent' }, rh); NS('circle', { cx: hp.x, cy: hp.y, r: 16 * F, fill: '#fff', stroke: GRAY, 'stroke-width': 3 }, rh); NS('text', { x: hp.x, y: hp.y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, fill: NAVY, text: '⟳', 'pointer-events': 'none' }, rh);
        var lr = S.rot;
        drag(rh, svg, function (pt) { lr = ((Math.round((angTo(C, pt) - 45) / 15) * 15) % 360 + 360) % 360; g2.setAttribute('transform', 'rotate(' + (S.rot - lr) + ' ' + C.x + ' ' + C.y + ')'); var q = P(C, lr + 45, 150 * .707 + 30); rh.setAttribute('transform', 'translate(' + (q.x - hp.x) + ',' + (q.y - hp.y) + ')'); }, function (pt) { if (pt) setPRot(lr); else draw(); });
        keys(rh, function (k) { setPRot(S.rot + k * 15); refocus('an-rot'); });
        btn('↺ Turn', 'sm ghost an-tl', function () { setPRot(S.rot + 15); }); btn('↻ Turn', 'sm ghost an-tr', function () { setPRot(S.rot - 15); });
        if (!S.on) {
          dragGroup(g2, C, function (p) { if (Math.hypot(p.x - V.x, p.y - V.y) < 55 * F) { S.on = 1; save(); pluck(HZ.C5); draw(); flag(box, 'on'); perpFit(); } else { wrongBeep('Drop the set square so its square corner lands on the dot.'); draw(); } });
          g2.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); S.on = 1; save(); draw(); flag(box, 'on'); perpFit(); } });
        }
      }
      svg.setAttribute('aria-label', 'A slanted road with a dot on it, and a green line from the dot. ' + (ok ? 'The green line stands at a right angle to the road.' : 'The green line leans.') + (S.on ? ' The set square sits on the dot.' : '') + (fits ? ' It fits exactly.' : ''));
      if (ok) flag(box, 'stood'); else flag(box, 'stood', false); if (S.on) flag(box, 'on'); if (fits) flag(box, 'checked');
    }
    function setPerp(a) { a = Math.round(a); if (Math.abs(a - 90) <= 4) a = 90; S.a = Math.max(10, Math.min(170, a)); save(); pluck(S.a === 90 ? HZ.C5 : 220 + S.a * 2); draw(); msg(S.a === 90 ? '✓ The green line stands at a right angle to the road. The two lines are perpendicular.' : S.a < 90 ? 'The green line leans toward the right side of the road. Stand it up more.' : 'The green line leans toward the left side of the road. Stand it up more.', S.a === 90); }
    function setPRot(r) { S.rot = ((r % 360) + 360) % 360; save(); pluck(HZ.E4); draw(); if (S.on) perpFit(); else msg('The set square turned. Now drag it so its square corner sits on the dot.'); }
    function perpFit() { var r1 = ((RB % 360) + 360) % 360, r2 = (r1 + 90) % 360; if (S.rot === r1 || S.rot === r2) { flag(box, 'checked'); pluck(HZ.C5); msg('✓ The set square fits exactly: one edge on the road, one edge on your line. They are perpendicular.', true); } else msg('The square corner is on the dot, but its edges do not line up with the road and your line yet. Turn the set square.'); }

    /* ── posts: Euclid's posts (Book I, Prop. 28) ── */
    function drawPosts() {
      var H = F > 1 ? 500 : 440; svg.setAttribute('viewBox', '0 0 700 ' + H); var G = H - (F > 1 ? 100 : 60), A0 = { x: 250, y: G }, B0 = { x: 450, y: G }, L = [170, 250, 330][S.h] || 170;
      NS('rect', { x: 4, y: G, width: 692, height: H - G - 4, fill: '#E8D9B5', 'pointer-events': 'none' }, svg);
      line({ x: 30, y: G }, { x: 670, y: G }, NAVY, 5);
      var up = S.a === 90 && S.b === 90;
      // dotted lines show where each post points, up to the top
      [[A0, S.a, NAVY, 'A', 'an-pa'], [B0, S.b, GRN, 'B', 'an-pb']].forEach(function (q) {
        var far = P(q[0], q[1], 700); line(q[0], far, q[2], 2, { 'stroke-dasharray': '3 7', opacity: .45 });
      });
      if (up) for (var y = 1; y <= S.h + 1; y++) { var yy = G - y * (L / (S.h + 2)); line({ x: A0.x + 6, y: yy }, { x: B0.x - 6, y: yy }, GOLD, 2.5, { 'stroke-dasharray': '7 5' }); }
      if (up && S.h > 0) pill(350, G - L - 26 * F, 'the same gap all the way up', GOLD);
      [[A0, 'a', NAVY, 'A'], [B0, 'b', GRN, 'B']].forEach(function (q) {
        var V = q[0], k = q[1], a = S[k], e = P(V, a, L), ln = line(V, e, q[2], 9);
        if (a === 90) { sqMark(V, 0, q[2]); }
        dot(V, NAVY, 7); NS('text', { x: V.x, y: G + 34 * F, 'text-anchor': 'middle', 'font-size': 20 * F, 'font-weight': 900, fill: q[2], text: 'post ' + q[3], 'pointer-events': 'none' }, svg);
        var h = handle(e, q[2], 'an-p' + k, 'The round handle at the top of post ' + q[3] + '. Drag it to stand the post up or lean it.'), live = a;
        drag(h, svg, function (pt) { var aa = angTo(V, pt); if (aa > 180) aa = aa > 270 ? 20 : 160; live = Math.max(20, Math.min(160, aa)); var p2 = P(V, live, L); ln.setAttribute('x2', p2.x); ln.setAttribute('y2', p2.y); h.setAttribute('transform', 'translate(' + (p2.x - e.x) + ',' + (p2.y - e.y) + ')'); }, function (pt) { if (pt) setPost(k, live); else draw(); });
        keys(h, function (d) { setPost(k, S[k] + d * 4); refocus('an-p' + k); });
      });
      btns.innerHTML = ''; btn('⬆ Make them taller', 'an-tall', function () { if (!up) return; S.h = Math.min(2, S.h + 1); save(); pluck(HZ.C5 + S.h * 60); draw(); if (S.h >= 2) { flag(box, 'tall'); msg('✓ The posts are much taller now. The gap between them is the same at the bottom, in the middle, and at the top.', true); } else msg('Taller! Look at the gap between the posts. Make them taller again.'); }, !up || S.h >= 2);
      svg.setAttribute('aria-label', 'Two posts stand on the ground. Post A ' + (S.a === 90 ? 'stands at a right angle.' : 'leans.') + ' Post B ' + (S.b === 90 ? 'stands at a right angle.' : 'leans.') + (up ? ' The gap between them is the same all the way up.' : ''));
      if (S.a === 90) flag(box, 'a'); if (S.b === 90) flag(box, 'b'); if (S.h >= 2) flag(box, 'tall');
    }
    function setPost(k, v) {
      v = Math.round(v); if (Math.abs(v - 90) <= 4) v = 90; var was = S[k]; S[k] = Math.max(20, Math.min(160, v)); if (S[k] !== 90 && S.h) S.h = 0; save(); pluck(S[k] === 90 ? HZ.C5 : 220 + S[k] * 2); draw();
      var nm = k === 'a' ? 'Post A' : 'Post B';
      if (S[k] === 90) { flag(box, k); msg('✓ ' + nm + ' stands at a right angle on the ground. See its small square?', true); }
      else msg(nm + ' leans. Follow its dotted line: it heads ' + ((k === 'a') === (S[k] < 90) ? 'toward' : 'away from') + ' the other post. Stand it straight up.');
    }
    function draw() { sizeF(); svg.innerHTML = ''; ({ open: drawOpen, parts: drawParts, ben: drawBen, turn: drawTurn, meet: drawMeet, own: drawOwn, euclid: drawEuclid, fold: drawFold, corners: drawCorners, look: drawLook, cross: drawCross, perp: drawPerp, posts: drawPosts }[DO] || drawOpen)(); }
    onWidth(box, draw); draw();
    if (DO === 'own') ownMsg(); else if (DO === 'open' && S.a > 6) msg(OPENMSG[cls(S.a)], S.a === 90 || S.a === 180);
  };

  /* ── tri (3.12.04 triangles): Cuisenaire rods + geoboard, Math Tools look. data-do close | cant | try | band | gap | curve | right. See patch1204.py ── */
  MODS.tri = function (box) {
    var name = box.dataset.name || 'tri', DO = box.dataset.do || 'close', ANS = box.dataset.ans || 'not';
    var NAVY = '#0E1C42', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#5B6478', PIN = '#6B7280', LINE = '#D9DEEA', SQF = '#D9F0E3';
    var BAND = ['#6B46C1', '#23915A', '#D2453B', '#2F6FDE', '#F08A24'];
    var ROD = [null, ['#F7F5EE', NAVY], ['#E03C31', '#fff'], ['#7BC043', '#fff'], ['#8E44AD', '#fff'], ['#F4D03F', NAVY], ['#1E7B34', '#fff'], ['#2C2C2C', '#fff'], ['#8B5A2B', '#fff'], ['#2E86DE', '#fff'], ['#F08A24', '#fff']];
    var RNAME = [null, 'white', 'red', 'light green', 'purple', 'yellow', 'dark green', 'black', 'brown', 'blue', 'orange'];
    var DEF = { close: { L: 0, R: 0, sd: {} }, cant: { L: 0, R: 0 }, 'try': { t: 0, tr: {} }, band: { p: [], k: 0, sd: {}, vt: {} }, gap: { c: '', k: 0 }, curve: { c: '', f: 0, x: 0 }, right: { p: [], k: 0, on: 0 } };
    var S = mstate(name, JSON.parse(JSON.stringify(DEF[DO] || {})));
    var ROD_MODE = DO === 'close' || DO === 'cant' || DO === 'try';
    box.innerHTML = '<div class="sb-stage sb-an sb-tri"><div class="an-btns"></div><svg viewBox="0 0 700 420" role="group"></svg>' + (ROD_MODE ? '<div class="tr-tray" role="group" aria-label="Rods to drag"></div>' : '') + '<div class="bm-chips an-chips"></div><div class="an-sort" hidden></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), chips = $('.an-chips', box), sortB = $('.an-sort', box), tray = $('.tr-tray', box), F = 1;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function P(v, deg, r) { var a = deg * Math.PI / 180; return { x: v.x + r * Math.cos(a), y: v.y - r * Math.sin(a) }; }
    function line(a, b, col, w, extra) { var o = { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: col, 'stroke-width': w || 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }; for (var k in (extra || {})) o[k] = extra[k]; return NS('line', o, svg); }
    function pill(x, y, t, col) { var w = (String(t).length * 9.5 + 18) * F, h = 30 * F; x = Math.max(w / 2 + 6, Math.min(694 - w / 2, x)); var g = NS('g', { 'pointer-events': 'none' }, svg); NS('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: '#fff', stroke: col || NAVY, 'stroke-width': 2 }, g); NS('text', { x: x, y: y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, 'font-weight': 900, fill: col || NAVY, text: t }, g); return g; }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function tapK(g, fn) { g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }
    function bad(t) { pluck(HZ.D4); msg(t); }
    // a tap area along a side: a rotated bar (a plain line has no area for taps or tests)
    function bar(A, B, w, fill, g) { var dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2, kx = dx / L * 6, ky = dy / L * 6; return NS('polygon', { points: [[A.x + nx + kx, A.y + ny + ky], [B.x + nx - kx, B.y + ny - ky], [B.x - nx - kx, B.y - ny - ky], [A.x - nx + kx, A.y - ny + ky]].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: fill }, g); }

    /* ══ Cuisenaire rods ══ */
    var U = 56;
    // one rod from A to B (its length is n units), drawn like the Math Tools rods: flat color, thin dark edge, its number
    function rod(A, B, n, extra) {
      var g = NS('g', extra || { 'pointer-events': 'none' }, svg), T = 24 * (F > 1 ? 1.6 : 1), dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy * T / 2, ny = ux * T / 2;
      NS('polygon', { points: [[A.x + nx, A.y + ny], [B.x + nx, B.y + ny], [B.x - nx, B.y - ny], [A.x - nx, A.y - ny]].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: ROD[n][0], stroke: 'rgba(0,0,0,.45)', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g);
      var ang = Math.atan2(dy, dx) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
      var m = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }, t = NS('text', { x: m.x, y: m.y + 6, 'text-anchor': 'middle', 'font-size': 16 * (F > 1 ? 1.6 : 1), 'font-weight': 800, fill: ROD[n][1], text: String(n) }, g);
      t.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ' ' + m.x.toFixed(1) + ' ' + m.y.toFixed(1) + ')');
      return g;
    }
    function ring(p, side, filled) {
      var g = NS('g', { class: 'tr-ring' + (filled ? ' on' : ''), 'data-side': side, 'pointer-events': filled ? 'none' : 'all' }, svg);
      NS('circle', { cx: p.x, cy: p.y, r: 30 * F, fill: 'transparent' }, g);
      if (!filled) NS('circle', { cx: p.x, cy: p.y, r: 17 * F, fill: 'rgba(201,162,39,.18)', stroke: GOLD, 'stroke-width': 3, 'stroke-dasharray': '5 4' }, g);
      return g;
    }
    // where the two free ends meet: a on the left end A, b on the right end B, base c (all in units)
    function apex(A, c, a, b) { var x = (a * a - b * b + c * c) / (2 * c), h2 = a * a - x * x; return h2 > 0.01 ? { x: A.x + x * U, y: A.y - Math.sqrt(h2) * U } : null; }
    function trayRods(list, used, onPut) {
      if (!tray) return; tray.innerHTML = '';
      list.forEach(function (n) {
        var b = el('button', 'tr-rod' + (used[n] ? ' used' : ''), String(n)); b.type = 'button'; b.dataset.n = n;
        b.style.width = (n * 26 + 10) + 'px'; b.style.background = ROD[n][0]; b.style.color = ROD[n][1];
        b.setAttribute('aria-label', 'The ' + RNAME[n] + ' ' + n + ' rod. Drag it onto a gold ring, or tap it.');
        if (used[n] && DO !== 'try') { b.disabled = true; }
        hdrag(b, function (t) { var r = t && t.closest && t.closest('.tr-ring'); if (r) onPut(n, r.dataset.side); else bad('Drop the rod right on a gold ring, at the end of the long rod.'); }, function () { onPut(n, null); });
        tray.appendChild(b);
      });
    }
    function base(A, n) { var B = { x: A.x + n * U, y: A.y }; rod(A, B, n); return B; }

    /* ── close (Think) and cant (Kai) ── */
    var BASE = +box.dataset.base || 9, TR = (box.dataset.rods || '4,7').split(',').map(Number);
    function drawJoin() {
      svg.setAttribute('viewBox', '0 0 700 420'); var A = { x: (700 - BASE * U) / 2, y: 330 }, B = base(A, BASE), a = S.L, b = S.R, top = a && b ? apex(A, BASE, a, b) : null;
      if (a && !b) { var pa = P(A, 62, a * U); rod(A, pa, a); }
      if (b && !a) { var pb = P(B, 118, b * U); rod(B, pb, b); }
      if (a && b && top) {
        rod(A, top, a); rod(B, top, b);
        if (DO === 'close') {
          var sides = [[A, B, 'b'], [A, top, 'l'], [B, top, 'r']];
          sides.forEach(function (s) {
            var on = S.sd[s[2]], g = NS('g', { class: 'tr-side' + (on ? ' done' : ''), role: 'button', tabindex: 0, 'aria-label': 'A side of the shape' + (on ? ', counted' : '') }, svg);
            bar(s[0], s[1], 40 * F, on ? 'rgba(30,122,76,.3)' : 'rgba(255,255,255,.01)', g);
            tapK(g, function () { S.sd[s[2]] = 1; save(); pluck(HZ.C5); draw(); var n = Object.keys(S.sd).length; if (n >= 3) { flag(box, 'sides'); msg('✓ 3 sides. Each rod is one straight side.', true); } else msg('Side ' + n + '. Tap the other sides too.'); });
          });
          [A, B, top].forEach(function (v) { NS('circle', { cx: v.x, cy: v.y, r: 7, fill: NAVY, 'pointer-events': 'none' }, svg); });
        }
      }
      if (a && b && !top) {
        // the two short rods can't reach: lay them flat toward each other and show the gap
        var ea = { x: A.x + a * U, y: A.y - 34 }, eb = { x: B.x - b * U, y: B.y - 34 }, A2 = { x: A.x, y: A.y - 34 }, B2 = { x: B.x, y: B.y - 34 };
        rod(A2, ea, a); rod(B2, eb, b);
        line({ x: ea.x, y: ea.y - 26 }, { x: eb.x, y: eb.y - 26 }, GOLD, 4); line({ x: ea.x, y: ea.y - 34 }, { x: ea.x, y: ea.y - 18 }, GOLD, 4); line({ x: eb.x, y: eb.y - 34 }, { x: eb.x, y: eb.y - 18 }, GOLD, 4);
        pill((ea.x + eb.x) / 2, ea.y - 58 * F, 'gap', GOLD);
        NS('path', { d: 'M' + (A.x + a * U) + ' ' + A.y + ' A' + a * U + ' ' + a * U + ' 0 0 0 ' + (A.x) + ' ' + (A.y - a * U), fill: 'none', stroke: GRAY, 'stroke-width': 1.5, 'stroke-dasharray': '6 6', 'pointer-events': 'none' }, svg);
        NS('path', { d: 'M' + (B.x) + ' ' + (B.y - b * U) + ' A' + b * U + ' ' + b * U + ' 0 0 0 ' + (B.x - b * U) + ' ' + B.y, fill: 'none', stroke: GRAY, 'stroke-width': 1.5, 'stroke-dasharray': '6 6', 'pointer-events': 'none' }, svg);
      }
      if (!a) ring(A, 'L'); if (!b) ring(B, 'R');
      if (!(a && b)) pill(350, 380 + 4 * F, 'the ' + RNAME[BASE] + ' ' + BASE + ' rod', GRAY);
      trayRods(TR, { 4: 0 }, put);
      if (tray) $$('.tr-rod', tray).forEach(function (r) { var n = +r.dataset.n; if (n === S.L || n === S.R) { r.disabled = true; r.classList.add('used'); } });
      svg.setAttribute('aria-label', 'A ' + RNAME[BASE] + ' ' + BASE + ' rod lies flat.' + (a ? ' A ' + a + ' rod is on its left end.' : '') + (b ? ' A ' + b + ' rod is on its right end.' : '') + (a && b ? (top ? ' The rods meet at the top. The shape is closed.' : ' The rods cannot reach each other. There is a gap.') : ''));
      if (a) flag(box, 'left'); if (b) flag(box, 'right'); if (a && b && top) flag(box, 'closed'); if (a && b && !top) flag(box, 'tried');
      if (DO === 'close' && Object.keys(S.sd).length >= 3) flag(box, 'sides');
    }
    function put(n, side) {
      if (n === S.L || n === S.R) return;
      if (!side) side = !S.L ? 'L' : 'R';
      if (side === 'L' && S.L) side = 'R'; if (side === 'R' && S.R) side = 'L';
      S[side] = n; save(); pluck(HZ.E4 + n * 20); draw();
      if (S.L && S.R) {
        var A = { x: 0, y: 0 }, ok = apex(A, BASE, S.L, S.R);
        if (ok) msg('✓ The rods meet at the top. Three straight sides, end to end, with no gaps: the shape is closed.', true);
        else msg('The ' + S.L + ' rod and the ' + S.R + ' rod swing toward each other, but they can\'t reach. Together they make ' + (S.L + S.R) + ', and the long rod is ' + BASE + '. There is a gap, so the shape can\'t close.');
      } else msg('The ' + RNAME[n] + ' ' + n + ' rod is on. Now put the other rod on the other ring.');
    }

    /* ── try (the Wow, Euclid I.20) ── */
    var LEFT = +box.dataset.left || 3;
    function kindOf(t) { var c = BASE, a = LEFT; return t > Math.abs(c - a) && t < c + a ? 'yes' : (t === Math.abs(c - a) || t === c + a) ? 'flat' : 'short'; }
    function drawTry() {
      svg.setAttribute('viewBox', '0 0 700 420'); U = 50; var A = { x: 210, y: 330 }, B = base(A, BASE), t = S.t;
      if (!t) { rod(A, P(A, 70, LEFT * U), LEFT); ring(B, 'R'); }
      else {
        var k = kindOf(t);
        if (k === 'yes') { var top = apex(A, BASE, LEFT, t); rod(A, top, LEFT); rod(B, top, t); pill(350, 60 * F, 'it closes: a triangle', OKG); }
        else if (k === 'flat') {
          if (t === BASE + LEFT) { var L2 = { x: A.x - LEFT * U, y: A.y - 30 }; rod({ x: A.x, y: A.y - 30 }, L2, LEFT); rod({ x: B.x, y: B.y - 60 }, { x: B.x - t * U, y: B.y - 60 }, t); }
          else { rod({ x: A.x, y: A.y - 30 }, { x: A.x + LEFT * U, y: A.y - 30 }, LEFT); rod({ x: B.x, y: B.y - 30 }, { x: B.x - t * U, y: B.y - 30 }, t); }
          pill(350, 60 * F, 'it lies flat: no triangle', RED);
        } else {
          var ea = { x: A.x + LEFT * U, y: A.y - 30 }, eb = { x: B.x - t * U, y: B.y - 30 };
          rod({ x: A.x, y: A.y - 30 }, ea, LEFT); rod({ x: B.x, y: B.y - 30 }, eb, t);
          line({ x: ea.x, y: ea.y - 24 }, { x: eb.x, y: eb.y - 24 }, GOLD, 4); pill((ea.x + eb.x) / 2, ea.y - 50 * F, 'gap', GOLD);
          pill(350, 60 * F, 'it can\'t reach: no triangle', RED);
        }
        btn('↩ Take the ' + t + ' rod off', 'ghost sm tr-off', function () { S.t = 0; save(); draw(); msg('Pick another rod for the third side.'); });
      }
      var all = []; for (var n = 1; n <= 10; n++) all.push(n);
      trayRods(all, S.tr, function (n) { S.t = n; S.tr[n] = kindOf(n); save(); pluck(kindOf(n) === 'yes' ? HZ.C5 : HZ.D4); draw(); var k = kindOf(n);
        msg(k === 'yes' ? '✓ The ' + n + ' rod closes the shape: a triangle.' : k === 'flat' ? 'The ' + n + ' rod makes the rods lie flat in one straight line. No triangle.' : 'The ' + n + ' rod is too short. The ends can\'t reach. No triangle.', k === 'yes'); });
      chips.innerHTML = '<span class="tr-res none">' + Object.keys(S.tr).length + ' of 10 rods tried</span>' + all.filter(function (n) { return S.tr[n]; }).map(function (n) { var k = S.tr[n]; return '<span class="tr-res ' + k + '">' + n + ': ' + (k === 'yes' ? '✓ closes' : k === 'flat' ? 'flat' : 'can\'t reach') + '</span>'; }).join('');
      var cnt = Object.keys(S.tr).length;
      svg.setAttribute('aria-label', 'A black 7 rod lies flat. A light green 3 rod is on its left end.' + (t ? ' The ' + t + ' rod is on the right end.' : '') + ' You have tried ' + cnt + ' of 10 rods.');
      if (cnt >= 10) flag(box, 'all');
    }

    /* ══ geoboard: 11 x 11 pins, like the Math Tools Geoboard ══ */
    var N = 11, GB = 440, MG = 30;
    function sp() { return (GB - 2 * MG) / (N - 1); }
    function GP(q) { return { x: 130 + MG + q[0] * sp(), y: 10 + MG + q[1] * sp() }; }
    function board() {
      svg.setAttribute('viewBox', '0 0 700 460');
      NS('rect', { x: 132, y: 12, width: GB - 4, height: GB - 4, rx: 22, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
    }
    function pins(onTap, hi) {
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) (function (x, y) {
        var c = GP([x, y]), g = NS('g', onTap ? { class: 'tr-pin', 'data-p': x + ',' + y, role: 'button', tabindex: -1, 'aria-label': 'Pin ' + (x + 1) + ', ' + (y + 1) } : { 'pointer-events': 'none' }, svg);
        if (onTap) NS('circle', { cx: c.x, cy: c.y, r: sp() * 0.48, fill: 'transparent' }, g);
        if (hi && hi[0] === x && hi[1] === y) NS('circle', { cx: c.x, cy: c.y, r: 11, fill: 'none', stroke: BAND[0], 'stroke-width': 3 }, g);
        NS('circle', { cx: c.x, cy: c.y, r: 5, fill: PIN, stroke: '#fff', 'stroke-width': 1.5 }, g);
        if (onTap) tapK(g, function () { onTap([x, y]); });
      })(x, y);
    }
    function poly(ps) { return ps.map(function (q) { var p = GP(q); return p.x + ',' + p.y; }).join(' '); }
    function bandShape(ps, closed, col) { return NS(closed ? 'polygon' : 'polyline', { points: poly(ps), fill: closed ? col : 'none', 'fill-opacity': .14, stroke: col, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); }
    function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }
    function cross(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
    function sqAt(q, a, c, col) { var Q = GP(q), A = GP(a), C = GP(c), la = Math.hypot(A.x - Q.x, A.y - Q.y), lc = Math.hypot(C.x - Q.x, C.y - Q.y), s = 14;
      var u = { x: (A.x - Q.x) / la * s, y: (A.y - Q.y) / la * s }, v = { x: (C.x - Q.x) / lc * s, y: (C.y - Q.y) / lc * s };
      NS('polyline', { points: [[Q.x + u.x, Q.y + u.y], [Q.x + u.x + v.x, Q.y + u.y + v.y], [Q.x + v.x, Q.y + v.y]].map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: 'none', stroke: col || NAVY, 'stroke-width': 2.5, 'pointer-events': 'none' }, svg); }
    function isRight(q, a, c) { return (a[0] - q[0]) * (c[0] - q[0]) + (a[1] - q[1]) * (c[1] - q[1]) === 0; }
    function L2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }
    // hook pins into a band: tap pins, then tap the first pin to close it
    function hook(q, after) {
      if (S.k) return;
      if (S.p.length && same(S.p[0], q)) {
        if (S.p.length < 3) { bad('Hook the band on 3 pins before you close it.'); return; }
        if (S.p.length > 3) { bad('A triangle needs exactly 3 pins. Press Start over and use 3 pins.'); return; }
        if (cross(S.p[0], S.p[1], S.p[2]) === 0) { bad('Those 3 pins are in one straight line, so the band lies flat. Press Start over and pick 3 pins that are not in a line.'); return; }
        S.k = 1; save(); pluck(HZ.C5); draw(); after(); return;
      }
      if (S.p.some(function (r) { return same(r, q); })) { bad('That pin is already in the band.'); return; }
      if (S.p.length >= 3) { bad('You have 3 pins. Now tap the first pin to close the band.'); return; }
      S.p.push(q); save(); pluck(HZ.E4 + S.p.length * 40); draw();
      msg(S.p.length < 3 ? 'Pin ' + S.p.length + ' is hooked. Tap the next pin.' : '3 pins. Now tap the first pin (the one with the ring) to close the band.');
    }
    function startOver() { S.p = []; S.k = 0; if (S.sd) S.sd = {}; if (S.vt) S.vt = {}; S.on = 0; save(); draw(); msg('The band is off. Tap a pin to start.'); }

    /* ── band (Your Turn) ── */
    function drawBand() {
      board(); btns.innerHTML = '';
      if (S.p.length) bandShape(S.k ? S.p : S.p, !!S.k, BAND[0]);
      pins(S.k ? null : function (q) { hook(q, function () { msg('✓ The band is closed: a triangle. Now tap each side.', true); flag(box, 'closed'); }); }, S.p[0]);
      if (S.k) {
        S.p.forEach(function (q, i) {
          var a = GP(q), b = GP(S.p[(i + 1) % 3]), on = S.sd[i], g = NS('g', { class: 'tr-side' + (on ? ' done' : ''), role: 'button', tabindex: 0, 'aria-label': 'Side ' + (i + 1) + (on ? ', counted' : '') }, svg);
          bar(a, b, 26 * F, on ? 'rgba(30,122,76,.5)' : 'rgba(255,255,255,.01)', g);
          tapK(g, function () { S.sd[i] = 1; save(); pluck(HZ.C5); draw(); var n = Object.keys(S.sd).length; if (n >= 3) { flag(box, 'sides'); msg('✓ 3 sides, all straight. Now tap each vertex.', true); } else msg('Side ' + n + '. Tap another side.'); });
        });
        if (Object.keys(S.sd).length >= 3) S.p.forEach(function (q, i) {
          var c = GP(q), on = S.vt[i], g = NS('g', { class: 'tr-vt' + (on ? ' done' : ''), role: 'button', tabindex: 0, 'aria-label': 'Vertex ' + (i + 1) + (on ? ', counted' : '') }, svg);
          NS('circle', { cx: c.x, cy: c.y, r: 22, fill: 'transparent' }, g); NS('circle', { cx: c.x, cy: c.y, r: on ? 11 : 9, fill: on ? OKG : GOLD, stroke: '#fff', 'stroke-width': 2 }, g);
          tapK(g, function () { S.vt[i] = 1; save(); pluck(HZ.G4); draw(); var n = Object.keys(S.vt).length; if (n >= 3) { flag(box, 'verts'); msg('✓ 3 vertices. Each vertex has an angle, so a triangle has 3 angles too.', true); } else msg('Vertex ' + n + '. Find another one.'); });
        });
      }
      btn('↩ Start over', 'ghost sm tr-redo', startOver, !S.p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins.' + (S.k ? ' A band makes a triangle.' : S.p.length ? ' The band is on ' + S.p.length + ' pins.' : ''));
      if (S.k) flag(box, 'closed'); if (Object.keys(S.sd).length >= 3) flag(box, 'sides'); if (Object.keys(S.vt).length >= 3) flag(box, 'verts');
    }

    /* the card (gap, curve) */
    var WORDS = { yes: 'a triangle', not: 'not a triangle' };
    function sortRow(show, lead) {
      sortB.hidden = !show; if (!show) return; var ok = S.c && S.c === ANS;
      sortB.innerHTML = '<div class="an-sline"><span>' + lead + '</span><span class="an-slot' + (S.c ? ok ? ' ok' : ' no' : '') + '" tabindex="0" role="button" aria-label="Box for the card">' + (S.c ? esc(WORDS[S.c]) : 'drop a card here') + '</span></div><div class="bm-chips an-cards" role="group" aria-label="Cards to drag"></div>';
      var tr = $('.an-cards', sortB);
      ['yes', 'not'].forEach(function (k) { var c = el('button', 'bm-chip an-card', esc(WORDS[k])); c.type = 'button'; c.dataset.k = k; tr.appendChild(c); hdrag(c, function (t) { if (t && t.closest && t.closest('.an-slot')) pick(k); }, function () { pick(k); }); });
    }
    var WHYC = { gap: 'Look where the band ends. Does it get back to the pin where it started?', curve: 'A triangle\'s sides are all straight. Look at the side on the bottom.' };
    function pick(k) { S.c = k; save(); draw(); if (k === ANS) { pluck(HZ.C5); flag(box, 'sorted'); msg('✓ Right. It is not a triangle yet.', true); } else { pluck(HZ.D4); flag(box, 'sorted', false); msg('Not that card. ' + WHYC[DO]); } }

    /* ── gap (Ben) ── */
    var GPTS = [[1, 8], [5, 1], [9, 8], [2, 8]];
    function drawGap() {
      board(); btns.innerHTML = '';
      if (S.k) bandShape(GPTS.slice(0, 3), true, BAND[2]);
      else {
        bandShape(GPTS, false, BAND[2]); pins(null);
        var s = GP(GPTS[0]), e = GP(GPTS[3]);
        line({ x: e.x, y: e.y + 22 }, { x: s.x, y: s.y + 22 }, GOLD, 3); line({ x: e.x, y: e.y + 14 }, { x: e.x, y: e.y + 30 }, GOLD, 3); line({ x: s.x, y: s.y + 14 }, { x: s.x, y: s.y + 30 }, GOLD, 3);
        pill((s.x + e.x) / 2, s.y + 52, 'gap', GOLD);
        if (S.c === ANS) {
          var h = NS('g', { class: 'drag tr-end', tabindex: 0, role: 'slider', 'aria-label': 'The loose end of the band. Drag it onto the pin where the band starts.' }, svg);
          NS('circle', { cx: e.x, cy: e.y, r: 26 * F, fill: 'transparent' }, h); NS('circle', { cx: e.x, cy: e.y, r: 13 * F, fill: BAND[2], stroke: '#fff', 'stroke-width': 3 }, h);
          drag(h, svg, function (pt) { h.setAttribute('transform', 'translate(' + (pt.x - e.x) + ',' + (pt.y - e.y) + ')'); }, function (pt) { if (pt && Math.hypot(pt.x - s.x, pt.y - s.y) < 26 * F) closeGap(); else { bad('Drop the loose end right on the first pin, where the band starts.'); draw(); } }, function () {});
          h.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); closeGap(); } });
        }
      }
      if (S.k) pins(null);
      sortRow(!S.k, 'Ben\'s shape is');
      svg.setAttribute('aria-label', S.k ? 'The band is closed: a triangle with 3 straight sides.' : 'A band with 3 straight sides. Its loose end stops one pin before the pin where it started, so there is a gap.');
      if (S.c === ANS) flag(box, 'sorted'); if (S.k) flag(box, 'closed');
    }
    function closeGap() { S.k = 1; save(); pluck(HZ.C5); draw(); flag(box, 'closed'); msg('✓ Now the band gets back to where it started. The shape is closed: a triangle.', true); }

    /* ── curve (Mia) ── */
    var CP = [[1, 8], [5, 1], [9, 8]];
    function drawCurve() {
      board(); btns.innerHTML = ''; pins(null);
      var a = GP(CP[0]), b = GP(CP[1]), c = GP(CP[2]);
      line(a, b, BAND[1], 5); line(b, c, BAND[1], 5);
      if (S.x) line(c, a, BAND[1], 5);
      else {
        var d = 'M' + c.x + ' ' + c.y + ' Q ' + ((a.x + c.x) / 2) + ' ' + (c.y + 120) + ' ' + a.x + ' ' + a.y;
        NS('path', { d: d, fill: 'none', stroke: S.f ? RED : BAND[1], 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        if (S.c === ANS) {
          var g = NS('g', { class: 'tr-cv', role: 'button', tabindex: 0, 'aria-label': 'The bottom side' }, svg);
          NS('path', { d: d, fill: 'none', stroke: 'transparent', 'stroke-width': 34 }, g);
          var g2 = NS('g', { class: 'tr-st', role: 'button', tabindex: 0, 'aria-label': 'A straight side' }, svg);
          NS('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: 'transparent', 'stroke-width': 30 }, g2);
          tapK(g2, function () { bad('That side is straight. Find the side that bends.'); });
          tapK(g, function () { S.f = 1; save(); pluck(HZ.C5); draw(); flag(box, 'found'); msg('✓ That side is curved, not straight. A triangle\'s 3 sides are all straight.', true); });
        }
        if (S.f) btn('📏 Swap in a straight band', 'tr-fix', function () { S.x = 1; save(); pluck(HZ.G4); draw(); flag(box, 'fixed'); msg('✓ Now all 3 sides are straight, and they meet with no gaps. It is a triangle.', true); });
      }
      sortRow(!S.f, 'Mia\'s shape is');
      svg.setAttribute('aria-label', S.x ? 'A triangle with 3 straight sides.' : 'A shape with 2 straight sides and 1 curved side at the bottom.');
      if (S.c === ANS) flag(box, 'sorted'); if (S.f) flag(box, 'found'); if (S.x) flag(box, 'fixed');
    }

    /* ── right (On your own) ── */
    var LEGS = (box.dataset.legs || '3,5').split(',').map(Number);
    function rightAt() { if (!S.k) return -1; for (var i = 0; i < 3; i++) { var q = S.p[i], a = S.p[(i + 2) % 3], c = S.p[(i + 1) % 3]; if (isRight(q, a, c)) { var l = [L2(q, a), L2(q, c)].sort(function (x, y) { return x - y; }); if (l[0] === LEGS[0] * LEGS[0] && l[1] === LEGS[1] * LEGS[1]) return i; return -2; } } return -3; }
    function drawRight() {
      board(); btns.innerHTML = '';
      if (S.p.length) bandShape(S.p, !!S.k, BAND[3]);
      pins(S.k ? null : function (q) { hook(q, checkMade); }, S.p[0]);
      var ri = rightAt();
      if (ri >= 0) {
        var q = S.p[ri], a = S.p[(ri + 2) % 3], c = S.p[(ri + 1) % 3], Q = GP(q);
        if (S.on) { sqAt(q, a, c, OKG); var A = GP(a), ang = Math.atan2(-(A.y - Q.y), A.x - Q.x) * 180 / Math.PI, C = GP(c), angc = Math.atan2(-(C.y - Q.y), C.x - Q.x) * 180 / Math.PI, d = ((angc - ang) + 360) % 360, rot = d === 90 ? ang : angc;
          var p1 = P(Q, rot, 120), p2 = P(Q, rot + 90, 120); NS('polygon', { points: [Q, p1, p2].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: SQF, 'fill-opacity': .7, stroke: NAVY, 'stroke-width': 2, 'pointer-events': 'none' }, svg);
          pill(570, 40 * F, 'it fits: a square corner', OKG); }
        else {
          var home = { x: 610, y: 420 }, g = NS('g', { class: 'drag tr-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag its square corner onto the square corner of your triangle.' }, svg);
          NS('polygon', { points: [home, P(home, 0, 80), P(home, 90, 80)].map(function (p) { return p.x + ',' + p.y; }).join(' '), fill: SQF, 'fill-opacity': .85, stroke: '#8792A8', 'stroke-width': 2 }, g);
          NS('circle', { cx: home.x, cy: home.y, r: 30, fill: 'transparent' }, g);
          drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - home.x) + ',' + (pt.y - home.y) + ')'); }, function (pt) { if (pt && Math.hypot(pt.x - Q.x, pt.y - Q.y) < 34 * F) sqOn(); else { bad('Drop the set square so its square corner lands on the square corner of your triangle.'); draw(); } }, function () {});
          g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); sqOn(); } });
          pill(610, 445, 'set square', GRAY);
        }
      }
      btn('↩ Start over', 'ghost sm tr-redo', startOver, !S.p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins.' + (S.k ? ' A band makes a triangle' + (ri >= 0 ? ' with a square corner.' : '.') : ''));
      if (ri >= 0) flag(box, 'made'); if (S.on) flag(box, 'checked');
    }
    function checkMade() { var ri = rightAt(); if (ri >= 0) { flag(box, 'made'); msg('✓ A triangle with a square corner, and its two short sides are ' + LEGS[0] + ' and ' + LEGS[1] + ' pin spaces. Now check the corner with the set square.', true); }
      else if (ri === -2) { flag(box, 'made', false); msg('It has a square corner, but the two sides at that corner are not ' + LEGS[0] + ' and ' + LEGS[1] + ' pin spaces long. Count the spaces between pins, not the pins. Press Start over and try again.'); }
      else { flag(box, 'made', false); msg('That is a triangle, but none of its corners is a square corner. Try going straight across and straight up or down from one pin. Press Start over.'); } }
    function sqOn() { S.on = 1; save(); pluck(HZ.C5); draw(); flag(box, 'checked'); msg('✓ The set square fits the corner exactly. Your triangle has a right angle.', true); }

    function draw() { sizeF(); svg.innerHTML = ''; btns.innerHTML = ''; ({ close: drawJoin, cant: drawJoin, 'try': drawTry, band: drawBand, gap: drawGap, curve: drawCurve, right: drawRight }[DO] || drawJoin)(); }
    onWidth(box, draw); draw();
  };

  /* ── tns (3.12.05 properties of triangles): rods, geoboard, set square, tick marks, name cards. data-do rsort | corner | name | make | match. See patch1205.py ── */
  MODS.tns = function (box) {
    var name = box.dataset.name || 'tns', DO = box.dataset.do || 'corner', FREE = !!box.dataset.free, TICKS = !!box.dataset.ticks || DO === 'name' || DO === 'make' || DO === 'match';
    var NAVY = '#0E1C42', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#5B6478', PIN = '#6B7280', LINE = '#D9DEEA', SQF = '#D9F0E3', ORG = '#C26A0A';
    var BAND = ['#6B46C1', '#23915A', '#D2453B', '#2F6FDE', '#F08A24'], BYRNE = ['#C8102E', '#E8B10E', '#1F4E9C'];
    var ROD = [null, ['#F7F5EE', NAVY], ['#E03C31', '#fff'], ['#7BC043', '#fff'], ['#8E44AD', '#fff'], ['#F4D03F', NAVY], ['#1E7B34', '#fff'], ['#2C2C2C', '#fff'], ['#8B5A2B', '#fff'], ['#2E86DE', '#fff'], ['#F08A24', '#fff']];
    var RNAME = [null, 'white', 'red', 'light green', 'purple', 'yellow', 'dark green', 'black', 'brown', 'blue', 'orange'];
    var SN = ['equilateral', 'isosceles', 'scalene'], AN = ['acute', 'right', 'obtuse'];
    var TRIS = box.dataset.tris ? JSON.parse(box.dataset.tris) : [], ORIG = JSON.parse(JSON.stringify(TRIS)), FH = 470;
    function layoutFree() { if (!FREE) return; if (F > 1) { FH = ORIG.length * 390 + 110; ORIG.forEach(function (o, t) { var xs = o.p.map(function (q) { return q[0]; }), ys = o.p.map(function (q) { return q[1]; }), cx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, by = Math.max.apply(null, ys); TRIS[t].p = o.p.map(function (q) { return [350 + (q[0] - cx) * 2, 70 + t * 390 + 300 - (by - q[1]) * 2]; }); }); } else { FH = 470; ORIG.forEach(function (o, t) { TRIS[t].p = o.p.map(function (q) { return q.slice(); }); }); } }
    var CARDS = (box.dataset.cards || '').split(',').filter(Boolean);
    var S = mstate(name, DO === 'rsort' ? { g: {} } : { p: [], k: 0, ck: {}, nm: {} });
    if (!S.ck) S.ck = {}; if (!S.nm) S.nm = {}; if (!S.p) S.p = [];
    box.innerHTML = '<div class="sb-stage sb-an sb-tns"><div class="an-btns"></div>' + (DO === 'rsort' ? '<div class="tn-rtray" role="group" aria-label="Rod triangles to sort"></div><div class="tn-groups" role="group" aria-label="Groups"></div>' : '<svg viewBox="0 0 700 460" role="group"></svg><div class="tn-names"></div><div class="bm-chips tn-cards" role="group" aria-label="Name cards to drag"></div>') + '</div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), namesB = $('.tn-names', box), cardsB = $('.tn-cards', box), F = 1, SEL = null;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function bad(t) { pluck(HZ.D4); msg(t); }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function tapK(g, fn) { g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }
    function P(v, deg, r) { var a = deg * Math.PI / 180; return { x: v.x + r * Math.cos(a), y: v.y - r * Math.sin(a) }; }
    function pill(x, y, t, col) { var w = (String(t).length * 9.5 + 18) * F, h = 30 * F; x = Math.max(w / 2 + 6, Math.min(694 - w / 2, x)); var g = NS('g', { 'pointer-events': 'none' }, svg); NS('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill: '#fff', stroke: col || NAVY, 'stroke-width': 2 }, g); NS('text', { x: x, y: y + 6 * F, 'text-anchor': 'middle', 'font-size': 17 * F, 'font-weight': 900, fill: col || NAVY, text: t }, g); return g; }
    function pts(a) { return a.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '); }

    /* ── shape math (pins are whole numbers, so lengths compare exactly; pixels get a small tolerance) ── */
    function d2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }
    function eqv(a, b) { return FREE ? Math.abs(Math.sqrt(a) - Math.sqrt(b)) < 1.5 : a === b; }
    function sides(p) { return p.map(function (q, i) { return d2(q, p[(i + 1) % p.length]); }); }
    function eqCount(p) { var s = sides(p), e = (eqv(s[0], s[1]) ? 1 : 0) + (eqv(s[1], s[2]) ? 1 : 0) + (eqv(s[0], s[2]) ? 1 : 0); return e === 3 ? 3 : e === 1 ? 2 : 0; }
    function sideName(p) { var c = eqCount(p); return c === 3 ? 'equilateral' : c === 2 ? 'isosceles' : 'scalene'; }
    function kindAt(p, i) { var n = p.length, q = p[i], a = p[(i + n - 1) % n], c = p[(i + 1) % n], dot = (a[0] - q[0]) * (c[0] - q[0]) + (a[1] - q[1]) * (c[1] - q[1]);
      if (FREE) { var cs = dot / Math.sqrt(d2(a, q) * d2(c, q)); return Math.abs(cs) < 0.02 ? 'square' : cs > 0 ? 'smaller' : 'bigger'; }
      return dot === 0 ? 'square' : dot > 0 ? 'smaller' : 'bigger'; }
    function angName(p) { var k = p.map(function (_, i) { return kindAt(p, i); }); return k.indexOf('square') > -1 ? 'right' : k.indexOf('bigger') > -1 ? 'obtuse' : 'acute'; }
    function cross(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
    function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }

    /* ── geoboard (Math Tools look) or a plain mat for pixel shapes ── */
    var N = 11, GB = 440, MG = 30;
    function sp() { return (GB - 2 * MG) / (N - 1); }
    function GP(q) { return FREE ? { x: q[0], y: q[1] } : { x: 130 + MG + q[0] * sp(), y: 10 + MG + q[1] * sp() }; }
    function board() {
      if (FREE) { svg.setAttribute('viewBox', '0 0 700 ' + FH); NS('rect', { x: 4, y: 4, width: 692, height: FH - 8, rx: 18, fill: '#FBF6EA', stroke: '#E6DCC4', 'stroke-width': 2, 'pointer-events': 'none' }, svg); return; }
      svg.setAttribute('viewBox', '0 0 700 460');
      NS('rect', { x: 132, y: 12, width: GB - 4, height: GB - 4, rx: 22, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
    }
    function pins(onTap, hi) {
      if (FREE) return;
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) (function (x, y) {
        var c = GP([x, y]), g = NS('g', onTap ? { class: 'tr-pin', 'data-p': x + ',' + y, role: 'button', tabindex: -1, 'aria-label': 'Pin ' + (x + 1) + ', ' + (y + 1) } : { 'pointer-events': 'none' }, svg);
        if (onTap) NS('circle', { cx: c.x, cy: c.y, r: sp() * 0.48, fill: 'transparent' }, g);
        if (hi && hi[0] === x && hi[1] === y) NS('circle', { cx: c.x, cy: c.y, r: 11, fill: 'none', stroke: BAND[0], 'stroke-width': 3 }, g);
        NS('circle', { cx: c.x, cy: c.y, r: 5, fill: PIN, stroke: '#fff', 'stroke-width': 1.5 }, g);
        if (onTap) tapK(g, function () { onTap([x, y]); });
      })(x, y);
    }
    function shape(p, closed, col, byrne) {
      var ps = p.map(GP);
      if (byrne) { NS('polygon', { points: pts(ps), fill: col, 'fill-opacity': .1, stroke: 'none', 'pointer-events': 'none' }, svg); ps.forEach(function (a, i) { var b = ps[(i + 1) % ps.length]; NS('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: BYRNE[i % 3], 'stroke-width': 6, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); }); return; }
      NS(closed ? 'polygon' : 'polyline', { points: pts(ps), fill: closed ? col : 'none', 'fill-opacity': .14, stroke: col, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
    }
    // tick marks: equal sides get the same number of marks; sides with no match get 1, 2 and 3 so no two look alike
    function ticks(p) {
      var s = sides(p), marks = [0, 0, 0], c = eqCount(p);
      if (c === 3) marks = [1, 1, 1];
      else if (c === 2) { var m = eqv(s[0], s[1]) ? [0, 1, 2] : eqv(s[1], s[2]) ? [1, 2, 0] : [0, 2, 1]; marks[m[0]] = 1; marks[m[1]] = 1; marks[m[2]] = 2; }
      else { var o = [0, 1, 2].sort(function (a, b) { return s[a] - s[b]; }); marks[o[0]] = 1; marks[o[1]] = 2; marks[o[2]] = 3; }
      p.forEach(function (q, i) {
        var A = GP(q), B = GP(p[(i + 1) % 3]), dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, m = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        for (var t = 0; t < marks[i]; t++) { var off = (t - (marks[i] - 1) / 2) * 9; NS('line', { x1: m.x + ux * off - nx * 10, y1: m.y + uy * off - ny * 10, x2: m.x + ux * off + nx * 10, y2: m.y + uy * off + ny * 10, stroke: NAVY, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); }
      });
    }

    /* ── the set square on a corner ── */
    var KW = { square: 'a square corner', smaller: 'smaller than a square corner', bigger: 'bigger than a square corner' };
    var KC = { square: OKG, smaller: ORG, bigger: RED };
    function cornerMark(p, i, k) {
      var n = p.length, Q = GP(p[i]), A = GP(p[(i + n - 1) % n]), C = GP(p[(i + 1) % n]);
      var la = Math.hypot(A.x - Q.x, A.y - Q.y), lc = Math.hypot(C.x - Q.x, C.y - Q.y), u = { x: (A.x - Q.x) / la, y: (A.y - Q.y) / la }, v = { x: (C.x - Q.x) / lc, y: (C.y - Q.y) / lc };
      if (k === 'square') { var s = 14; NS('polyline', { points: pts([{ x: Q.x + u.x * s, y: Q.y + u.y * s }, { x: Q.x + (u.x + v.x) * s, y: Q.y + (u.y + v.y) * s }, { x: Q.x + v.x * s, y: Q.y + v.y * s }]), fill: 'none', stroke: OKG, 'stroke-width': 3, 'pointer-events': 'none' }, svg); return; }
      var r = 20, a1 = Math.atan2(u.y, u.x), a2 = Math.atan2(v.y, v.x), da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      NS('path', { d: 'M' + (Q.x + r * Math.cos(a1)).toFixed(1) + ' ' + (Q.y + r * Math.sin(a1)).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 ' + (da > 0 ? 1 : 0) + ' ' + (Q.x + r * Math.cos(a2)).toFixed(1) + ' ' + (Q.y + r * Math.sin(a2)).toFixed(1), fill: 'none', stroke: KC[k], 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
    }
    // the set square laid on a corner: its square corner on the vertex, one edge along a side
    function squareOn(p, i) {
      var n = p.length, Q = GP(p[i]), A = GP(p[(i + n - 1) % n]), C = GP(p[(i + 1) % n]), la = Math.hypot(A.x - Q.x, A.y - Q.y), u = { x: (A.x - Q.x) / la, y: (A.y - Q.y) / la };
      var w1 = { x: -u.y, y: u.x }, w2 = { x: u.y, y: -u.x }, cx = C.x - Q.x, cy = C.y - Q.y, w = (w1.x * cx + w1.y * cy) >= (w2.x * cx + w2.y * cy) ? w1 : w2, L = 92;
      NS('polygon', { points: pts([Q, { x: Q.x + u.x * L, y: Q.y + u.y * L }, { x: Q.x + w.x * L, y: Q.y + w.y * L }]), fill: SQF, 'fill-opacity': .72, stroke: NAVY, 'stroke-width': 2, 'pointer-events': 'none' }, svg);
    }
    function allChecked(t) { var p = TRIS[t].p; for (var i = 0; i < p.length; i++) if (!S.ck[t + ':' + i]) return false; return true; }
    function corners(list, onCheck) {
      // tap areas on every corner + one draggable set square
      list.forEach(function (o) {
        o.p.forEach(function (q, i) {
          var key = o.t + ':' + i, c = GP(q), g = NS('g', { class: 'tn-cn' + (S.ck[key] ? ' done' : ''), 'data-k': key, role: 'button', tabindex: 0, 'aria-label': 'A corner' + (S.ck[key] ? ': ' + KW[S.ck[key]] : ', not checked yet') }, svg);
          NS('circle', { cx: c.x, cy: c.y, r: 24 * F, fill: 'transparent' }, g);
          if (!S.ck[key]) NS('circle', { cx: c.x, cy: c.y, r: 9, fill: 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, g);
          tapK(g, function () { onCheck(o.t, i); });
        });
      });
      var home = FREE ? { x: 606, y: FH - 34 } : { x: 610, y: 430 }, g = NS('g', { class: 'drag tn-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag its square corner onto a corner of a triangle.' }, svg);
      NS('polygon', { points: pts([home, P(home, 0, 72), P(home, 90, 72)]), fill: SQF, 'fill-opacity': .9, stroke: '#8792A8', 'stroke-width': 2 }, g);
      NS('circle', { cx: home.x, cy: home.y, r: 30, fill: 'transparent' }, g);
      NS('text', { x: home.x + 36, y: home.y + 20, 'text-anchor': 'middle', 'font-size': 13 * F, 'font-weight': 800, fill: GRAY, text: 'set square', 'pointer-events': 'none' }, g);
      drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - home.x) + ',' + (pt.y - home.y) + ')'); }, function (pt) {
        var best = null, bd = 1e9; list.forEach(function (o) { o.p.forEach(function (q, i) { var c = GP(q), dd = pt ? Math.hypot(pt.x - c.x, pt.y - c.y) : 1e9; if (dd < bd) { bd = dd; best = [o.t, i]; } }); });
        if (best && bd < 40 * F) onCheck(best[0], best[1]); else { bad('Drop the set square so its square corner lands right on a corner of the triangle.'); draw(); }
      }, function () {});
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); var nx = null; list.some(function (o) { return o.p.some(function (q, i) { if (!S.ck[o.t + ':' + i]) { nx = [o.t, i]; return true; } }); }); if (nx) onCheck(nx[0], nx[1]); } });
    }
    var LAST = null;
    function check(t, i) {
      var p = shapeOf(t), k = kindAt(p, i); S.ck[t + ':' + i] = k; LAST = [t, i]; save(); pluck(k === 'square' ? HZ.C5 : k === 'bigger' ? HZ.E4 : HZ.G4); draw();
      var lab = TRIS[t] && TRIS[t].lab ? 'Triangle ' + TRIS[t].lab + ': ' : '';
      msg(lab + 'this corner is <b style="color:' + KC[k] + '">' + KW[k] + '</b>.' + (k === 'square' ? ' The set square fits exactly.' : k === 'bigger' ? ' The sides open wider than the set square.' : ' The sides fit inside the set square.'), k === 'square');
      after();
    }
    function shapeOf(t) { return t === 'u' ? S.p : TRIS[t].p; }

    /* ── name boxes + cards ── */
    var KIND = {}; SN.forEach(function (n) { KIND[n] = 's'; }); AN.forEach(function (n) { KIND[n] = 'a'; });
    function want(t, k) { var p = shapeOf(t); return k === 's' ? sideName(p) : angName(p); }
    function rowsOf() { var r = []; if (DO === 'name' || DO === 'make') { if (S.k) r.push({ t: 'u', lab: 'Your triangle', ask: DO === 'name' ? 's' : 'sa' }); } else TRIS.forEach(function (o, t) { if (o.ask || o.pre) r.push({ t: t, lab: o.lab ? 'Triangle ' + o.lab : (o.who || 'The triangle'), ask: o.ask || '', pre: o.pre || {} }); }); return r; }
    function used(card) { for (var k in S.nm) if (S.nm[k] === card) return true; return false; }
    function namesUI() {
      if (!namesB) return; var rows = rowsOf(); namesB.innerHTML = ''; cardsB.innerHTML = '';
      if (!rows.length) { cardsB.hidden = true; return; } cardsB.hidden = false;
      rows.forEach(function (r) {
        var line = el('div', 'tn-row'); line.appendChild(el('span', 'tn-lab', esc(r.lab)));
        ['s', 'a'].forEach(function (k) {
          var pre = r.pre && r.pre[k], ask = r.ask.indexOf(k) > -1; if (!pre && !ask) return;
          var key = r.t + ':' + k, v = pre || S.nm[key], sl = el('span', 'tn-slot' + (pre ? ' pre' : v ? ' ok' : ''), v ? esc(v) : (k === 's' ? 'name for the sides' : 'name for the angles'));
          sl.dataset.key = key; sl.dataset.k = k; sl.tabIndex = v ? -1 : 0; sl.setAttribute('role', 'button'); sl.setAttribute('aria-label', (k === 's' ? 'Box for the sides name' : 'Box for the angles name') + (v ? ': ' + v : ''));
          if (!v) tapK(sl, function () { if (SEL) put(SEL, sl); else bad('First pick a name card, then tap this box. Or drag a card onto the box.'); });
          line.appendChild(sl);
        });
        namesB.appendChild(line);
      });
      CARDS.forEach(function (c) {
        var b = el('button', 'bm-chip an-card tn-card' + (used(c) ? ' used' : '') + (SEL === c ? ' sel' : ''), esc(c)); b.type = 'button'; b.dataset.c = c; if (used(c)) b.disabled = true;
        hdrag(b, function (t) { var sl = t && t.closest && t.closest('.tn-slot'); if (sl && !sl.classList.contains('ok') && !sl.classList.contains('pre')) put(c, sl); else bad('Drop the card right on an empty name box.'); }, function () { SEL = SEL === c ? null : c; namesUI(); if (SEL) msg('Now tap the box where <b>' + esc(c) + '</b> goes.'); });
        cardsB.appendChild(b);
      });
    }
    var WHYS = { equilateral: 'Equilateral means all 3 sides are the same length.', isosceles: 'Isosceles means at least 2 sides are the same length.', scalene: 'Scalene means no sides are the same length.', acute: 'Acute means all 3 angles are smaller than a square corner.', right: 'Right means one angle is a square corner.', obtuse: 'Obtuse means one angle is bigger than a square corner.' };
    function put(c, sl) {
      SEL = null; var key = sl.dataset.key, k = sl.dataset.k, t = key.split(':')[0]; t = t === 'u' ? 'u' : +t;
      if (KIND[c] !== k) { bad('<b>' + esc(c) + '</b> tells about the ' + (KIND[c] === 's' ? 'sides' : 'angles') + '. This box needs a name for the ' + (k === 's' ? 'sides' : 'angles') + '.'); namesUI(); return; }
      var p = shapeOf(t);
      if (k === 'a') { var n = p.length, all = true; for (var i = 0; i < n; i++) if (!S.ck[t + ':' + i]) all = false; if (!all) { bad('Check every corner of this triangle with the set square first. Then you will know its angle name.'); namesUI(); return; } }
      var w = want(t, k);
      if (c === w) { S.nm[key] = c; LAST = null; save(); pluck(HZ.C5); draw(); msg('✓ <b>' + esc(c) + '</b>. ' + WHYS[c], true); after(); return; }
      if (DO === 'match' && c === 'isosceles' && w === 'equilateral') { bad('True, it has at least 2 equal sides! But use each name once. There is a more exact name for a triangle whose 3 sides are all the same.'); namesUI(); return; }
      var hint = k === 's' ? 'Count the tick marks. Sides with the same marks are the same length.' : 'Look at the corners you checked with the set square.';
      bad('Not <b>' + esc(c) + '</b>. ' + WHYS[c] + ' ' + hint); namesUI();
    }
    function namedAll() { var rows = rowsOf(); if (!rows.length) return false; return rows.every(function (r) { return ['s', 'a'].every(function (k) { return r.ask.indexOf(k) < 0 || S.nm[r.t + ':' + k]; }); }); }

    /* ── band triangles (name, make) ── */
    var RULE_S = box.dataset.side != null ? +box.dataset.side : -1, RULE_A = box.dataset.ang || '';
    function ruleOK(p) { var c = eqCount(p); if (RULE_S === 2 && c !== 2) return 's'; if (RULE_S === 0 && c !== 0) return 's'; if (RULE_A && angName(p) !== RULE_A) return 'a'; return ''; }
    function keyCorner(p) { for (var i = 0; i < 3; i++) { var k = kindAt(p, i); if (RULE_A === 'obtuse' && k === 'bigger') return i; if (RULE_A === 'right' && k === 'square') return i; } return -1; }
    function hook(q) {
      if (S.k) return;
      if (S.p.length && same(S.p[0], q)) {
        if (S.p.length < 3) { bad('Hook the band on 3 pins before you close it.'); return; }
        if (cross(S.p[0], S.p[1], S.p[2]) === 0) { bad('Those 3 pins are in one straight line, so the band lies flat. Press Start over and pick 3 pins that are not in a line.'); return; }
        var why = ruleOK(S.p);
        if (why) { S.k = 1; S.bad = why; save(); pluck(HZ.D4); draw(); flag(box, 'made', false);
          if (why === 's') msg(RULE_S === 2 ? 'That is a triangle, but look at the tick marks: ' + (eqCount(S.p) === 0 ? 'all 3 sides are different lengths.' : 'they do not show exactly 2 equal sides.') + ' Try going the same number of pin spaces left and right from a top pin. Press Start over.' : 'That is a triangle, but the tick marks show ' + eqCount(S.p) + ' sides that are the same length. Make every side a different length. Press Start over.');
          else msg('That is a triangle, but none of its corners is ' + (RULE_A === 'obtuse' ? 'bigger than a square corner. Try making it long and flat, with its top pin close to one end.' : RULE_A === 'right' ? 'a square corner.' : 'right.') + ' Press Start over.');
          return; }
        S.k = 1; S.bad = ''; save(); pluck(HZ.C5); draw(); flag(box, 'made');
        msg(DO === 'name' ? '✓ A triangle with exactly 2 sides the same length. The tick marks show which ones.' : '✓ A triangle with no sides the same length (look at the tick marks) and one wide corner. Now check that wide corner with the set square.', true); after(); return;
      }
      if (S.p.some(function (r) { return same(r, q); })) { bad('That pin is already in the band.'); return; }
      if (S.p.length >= 3) { bad('You have 3 pins. Now tap the first pin to close the band.'); return; }
      S.p.push(q); save(); pluck(HZ.E4 + S.p.length * 40); draw();
      msg(S.p.length < 3 ? 'Pin ' + S.p.length + ' is hooked. Tap the next pin.' : '3 pins. Now tap the first pin (the one with the ring) to close the band.');
    }
    function startOver() { S.p = []; S.k = 0; S.bad = ''; S.ck = {}; S.nm = {}; save(); draw(); flag(box, 'made', false); msg('The band is off. Tap a pin to start.'); }

    /* ── rsort (Think): rod triangles into groups ── */
    var GRP = [['all', 'All 3 the same'], ['two', '2 the same'], ['none', 'None the same']];
    function rodTri(ls) {
      // a closed triangle of three rods: base ls[0], left ls[1], right ls[2] (in units), drawn like the Math Tools rods
      var u = 15, c = ls[0], a = ls[1], b = ls[2], x = (a * a - b * b + c * c) / (2 * c), h = Math.sqrt(Math.max(0, a * a - x * x)), W = c * u + 36, H = h * u + 40;
      var A = { x: 18, y: H - 16 }, B = { x: 18 + c * u, y: H - 16 }, T = { x: 18 + x * u, y: H - 16 - h * u };
      function r(P1, P2, n) { var dx = P2.x - P1.x, dy = P2.y - P1.y, L = Math.hypot(dx, dy), nx = -dy / L * 6, ny = dx / L * 6, ang = Math.atan2(dy, dx) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180; var m = { x: (P1.x + P2.x) / 2, y: (P1.y + P2.y) / 2 };
        return '<polygon points="' + pts([{ x: P1.x + nx, y: P1.y + ny }, { x: P2.x + nx, y: P2.y + ny }, { x: P2.x - nx, y: P2.y - ny }, { x: P1.x - nx, y: P1.y - ny }]) + '" fill="' + ROD[n][0] + '" stroke="rgba(0,0,0,.45)" stroke-width="1.2" stroke-linejoin="round"/><text x="' + m.x.toFixed(1) + '" y="' + (m.y + 4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="800" fill="' + ROD[n][1] + '" transform="rotate(' + ang.toFixed(1) + ' ' + m.x.toFixed(1) + ' ' + m.y.toFixed(1) + ')">' + n + '</text>'; }
      return '<svg viewBox="0 0 ' + W.toFixed(0) + ' ' + H.toFixed(0) + '" aria-hidden="true">' + r(A, T, a) + r(B, T, b) + r(A, B, c) + '</svg>';
    }
    function groupOf(ls) { var u = {}; ls.forEach(function (n) { u[n] = (u[n] || 0) + 1; }); var m = Math.max.apply(null, Object.keys(u).map(function (k) { return u[k]; })); return m === 3 ? 'all' : m === 2 ? 'two' : 'none'; }
    function rodWords(ls) { return ls.map(function (n) { return RNAME[n] + ' ' + n; }).join(', '); }
    function drawSort() {
      var RS = (box.dataset.rods || '5-7-9,7-7-7,9-9-4').split(',').map(function (s) { var a = s.split('-').map(Number); return [a[2], a[0], a[1]]; });
      var trayB = $('.tn-rtray', box), grpB = $('.tn-groups', box); trayB.innerHTML = ''; grpB.innerHTML = '';
      GRP.forEach(function (g) {
        var gb = el('div', 'tn-grp', '<div class="tn-gh">' + g[1] + '</div><div class="tn-gin"></div>'); gb.dataset.g = g[0]; gb.tabIndex = 0; gb.setAttribute('role', 'button'); gb.setAttribute('aria-label', 'Group: ' + g[1]);
        RS.forEach(function (ls, i) { if (S.g[i] === g[0]) $('.tn-gin', gb).appendChild(el('div', 'tn-rt in', rodTri(ls))); });
        tapK(gb, function () { if (SEL != null) drop(SEL, g[0]); else bad('First pick a rod triangle, then tap its group. Or drag the triangle onto a group.'); });
        grpB.appendChild(gb);
      });
      RS.forEach(function (ls, i) {
        if (S.g[i]) return;
        var b = el('button', 'tn-rt' + (SEL === i ? ' sel' : ''), rodTri(ls)); b.type = 'button'; b.dataset.i = i; b.setAttribute('aria-label', 'A triangle made of the ' + rodWords(ls) + ' rods. Drag it onto a group, or tap it and then tap a group.');
        hdrag(b, function (t) { var g = t && t.closest && t.closest('.tn-grp'); if (g) drop(i, g.dataset.g); else bad('Drop the triangle right on one of the three groups.'); }, function () { SEL = SEL === i ? null : i; draw(); if (SEL != null) msg('Now tap the group where this triangle goes.'); });
        trayB.appendChild(b);
      });
      if (!trayB.children.length) trayB.appendChild(el('p', 'tn-done', '✓ All three triangles are sorted.'));
      function drop(i, g) {
        SEL = null; var ls = RS[i], w = groupOf(ls);
        if (g === w) { S.g[i] = g; save(); pluck(HZ.C5); draw(); msg('✓ The ' + rodWords(ls) + ' rods: ' + (w === 'all' ? 'all 3 rods are the same length.' : w === 'two' ? '2 rods are the same length, and 1 is different.' : 'no two rods are the same length.'), true);
          if (Object.keys(S.g).length >= RS.length) { flag(box, 'sorted'); msg('✓ All sorted: one triangle in each group. Each group gets its own name next.', true); } return; }
        bad('Look at the numbers on the rods: ' + ls.join(', ') + '. How many of them are the same?'); draw();
      }
      if (Object.keys(S.g).length >= RS.length) flag(box, 'sorted');
    }

    /* ── draw each mode ── */
    function drawCorner() {
      board(); pins(null);
      TRIS.forEach(function (o, t) {
        shape(o.p, true, o.col || BAND[t % BAND.length], DO === 'match');
        if (TICKS && o.p.length === 3) ticks(o.p);
        if (o.lab) { var ys = o.p.map(function (q) { return GP(q).y; }), xs = o.p.map(function (q) { return GP(q).x; }); pill((Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, Math.min.apply(null, ys) - 22 * F, o.lab, NAVY); }
        o.p.forEach(function (q, i) { if (S.ck[t + ':' + i]) cornerMark(o.p, i, S.ck[t + ':' + i]); });
      });
      if (LAST && TRIS[LAST[0]]) squareOn(TRIS[LAST[0]].p, LAST[1]);
      corners(TRIS.map(function (o, t) { return { t: t, p: o.p }; }), check);
      svg.setAttribute('aria-label', (FREE ? 'Three triangles drawn in red, yellow and blue.' : 'A geoboard with 11 rows of 11 pins.') + ' ' + TRIS.length + (TRIS.length === 1 ? ' shape.' : ' shapes.') + ' The set square waits at the bottom right.');
      namesUI();
    }
    function drawBand() {
      board(); btns.innerHTML = '';
      if (S.p.length) shape(S.p, !!S.k, S.bad ? RED : BAND[DO === 'make' ? 3 : 0]);
      pins(S.k ? null : hook, S.p[0]);
      if (S.k) {
        ticks(S.p);
        if (!S.bad) {
          S.p.forEach(function (q, i) { if (S.ck['u:' + i]) cornerMark(S.p, i, S.ck['u:' + i]); });
          if (LAST && LAST[0] === 'u') squareOn(S.p, LAST[1]);
          if (DO === 'make') corners([{ t: 'u', p: S.p }], check);
        }
      }
      btn('↩ Start over', 'ghost sm tr-redo', startOver, !S.p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins.' + (S.k ? ' A band makes a triangle.' : S.p.length ? ' The band is on ' + S.p.length + ' pins.' : ''));
      namesUI();
    }
    function after() {
      if (DO === 'corner' || DO === 'match') { if (TRIS.every(function (o, t) { return allChecked(t); })) flag(box, 'checked'); }
      if ((DO === 'name' || DO === 'make') && S.k && !S.bad) flag(box, 'made');
      if (DO === 'make' && S.k && !S.bad) { var kc = keyCorner(S.p); if (kc > -1 && S.ck['u:' + kc]) flag(box, 'checked'); }
      if (namedAll()) { flag(box, 'named'); if (DO !== 'rsort') msg('✓ Every name is in the right box.', true); }
    }
    function draw() { sizeF(); layoutFree(); if (svg) svg.innerHTML = ''; if (btns) btns.innerHTML = ''; ({ rsort: drawSort, corner: drawCorner, match: drawCorner, name: drawBand, make: drawBand }[DO] || drawCorner)(); }
    onWidth(box, draw); draw();
    // restore flags after a reload
    if (DO !== 'rsort') { if (DO === 'corner' || DO === 'match') { if (TRIS.every(function (o, t) { return allChecked(t); })) flag(box, 'checked'); }
      if ((DO === 'name' || DO === 'make') && S.k && !S.bad) flag(box, 'made'); if (DO === 'make' && S.k && !S.bad) { var kc0 = keyCorner(S.p); if (kc0 > -1 && S.ck['u:' + kc0]) flag(box, 'checked'); } if (namedAll()) flag(box, 'named'); }
  };

  /* ── quad (3.12.06 properties of quadrilaterals): geoboard, set square, tick + arrow marks, name cards. data-do reshape | check | make | isrect | qsort | tree. See patch1206.py ── */
  /* ── symm: lines of symmetry + the compass (3.12.07) ──────────────────────
     data-do fold    · a paper shape with dashed candidate fold lines; tap one to fold it over.
                       data-shape "x,y x,y …" (stage coordinates), data-lines "x,y x,y|x,y x,y|…".
                       Flags: tried (every line folded), found (at least one matched).
     data-do mirror  · half a shape on a geoboard, left of a dashed line; tap pins to build the
                       other half. data-half "5,1 1,5 …" (pins), data-axis "5". Flag: built.
     data-do compass · a compass on a centimeter ruler. Drag the pencil leg to set the opening,
                       then press Draw. data-radii "3,1" → flags r3, r1. data-cards → flag card.
     data-do euclid  · Euclid's first problem: two circles of the same size, the fold line through
                       their crossings, and the triangle. Flags: cset, ca, cb, fline.
     Note: MODS.sym is already the <, > and = model, so this one is MODS.symm. */
  MODS.symm = function (box) {
    var name = box.dataset.name || 'symm', DO = box.dataset.do || 'fold';
    var NAVY = '#0E1C42', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#5B6478', PIN = '#6B7280', LINE = '#D9DEEA', PAPER = '#FBF6EA', PUR = '#6B46C1', ORG = '#C26A0A', STEEL = '#8792A8';
    var DEF = { fold: { t: {}, last: -1 }, mirror: { p: [] }, compass: { r: 3, drew: [], nm: '' }, euclid: { set: 0, a: 0, b: 0, x: {}, line: 0 } };
    var S = mstate(name, JSON.parse(JSON.stringify(DEF[DO] || {})));
    box.innerHTML = '<div class="sb-stage sb-an sb-quad"><div class="an-btns"></div><svg viewBox="0 0 700 460" role="group"></svg><div class="qd-chips"></div><div class="qd-names"></div><div class="bm-chips qd-cards" role="group" aria-label="Cards to drag"></div></div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), chips = $('.qd-chips', box), namesB = $('.qd-names', box), cardsB = $('.qd-cards', box), F = 1, SEL = null;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function bad(t) { pluck(HZ.D4); msg(t); }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function tapK(g, fn) { g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }
    function pts(a) { return a.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
    function nums(s) { return (s || '').trim().split(/\s+/).map(function (q) { return q.split(',').map(Number); }); }

    /* ── reflect a point across the line through A and B ── */
    function refl(p, A, B) {
      var dx = B[0] - A[0], dy = B[1] - A[1], L = dx * dx + dy * dy || 1;
      var t = ((p[0] - A[0]) * dx + (p[1] - A[1]) * dy) / L, f = [A[0] + t * dx, A[1] + t * dy];
      return [2 * f[0] - p[0], 2 * f[1] - p[1]];
    }
    function near(a, b) { return Math.abs(a[0] - b[0]) < 1.5 && Math.abs(a[1] - b[1]) < 1.5; }
    function isLineOfSym(shape, A, B) {
      return shape.every(function (p) { var r = refl(p, A, B); return shape.some(function (q) { return near(r, q); }); });
    }

    /* ══ fold ══ */
    var SHAPE = nums(box.dataset.shape || '260,60 380,60 365,110 330,160 330,200 375,250 390,330 320,370 250,330 265,250 310,200 310,160 275,110');
    var LINES = (box.dataset.lines || '320,30 320,400').split('|').map(function (s) { return nums(s); });
    function drawFold() {
      svg.setAttribute('viewBox', '0 0 640 420');
      NS('rect', { x: 8, y: 8, width: 624, height: 404, rx: 20, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      NS('polygon', { points: pts(SHAPE), fill: PAPER, stroke: NAVY, 'stroke-width': 4.5, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg);
      // the fold that is showing now: a fold flips ONE half over, so the mirrored copy is clipped to the
      // far side of the line. What lands outside the shape is the part that sticks out.
      if (S.last > -1 && S.t[S.last] != null) {
        var L = LINES[S.last], ok = S.t[S.last] === 1, img = SHAPE.map(function (p) { return refl(p, L[0], L[1]); });
        var dx = L[1][0] - L[0][0], dy = L[1][1] - L[0][1], LN = Math.hypot(dx, dy) || 1, ux = dx / LN, uy = dy / LN, nx = -uy, ny = ux, BIG = 1600;
        // which side is "far"? the side the first vertex of the shape is NOT on
        var s0 = (SHAPE[0][0] - L[0][0]) * nx + (SHAPE[0][1] - L[0][1]) * ny, sgn = s0 >= 0 ? 1 : -1;
        var mid = [(L[0][0] + L[1][0]) / 2, (L[0][1] + L[1][1]) / 2];
        var half = [[mid[0] - ux * BIG, mid[1] - uy * BIG], [mid[0] + ux * BIG, mid[1] + uy * BIG],
                    [mid[0] + ux * BIG + nx * BIG * sgn, mid[1] + uy * BIG + ny * BIG * sgn], [mid[0] - ux * BIG + nx * BIG * sgn, mid[1] - uy * BIG + ny * BIG * sgn]];
        var defs = NS('defs', {}, svg), cp = NS('clipPath', { id: name + '-fold' }, defs);
        NS('polygon', { points: pts(half) }, cp);
        var g = NS('g', { 'clip-path': 'url(#' + name + '-fold)', 'pointer-events': 'none' }, svg);
        NS('polygon', { points: pts(img), fill: ok ? 'rgba(30,122,76,.22)' : 'rgba(178,58,46,.22)', stroke: ok ? OKG : RED, 'stroke-width': 4.5, 'stroke-dasharray': ok ? '' : '10 7', 'stroke-linejoin': 'round' }, g);
      }
      LINES.forEach(function (L, i) {
        var done = S.t[i] != null, col = !done ? GRAY : S.t[i] ? OKG : RED;
        var g = NS('g', { class: 'sf-line' + (done ? ' done' : '') + (S.last === i ? ' sel' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'Fold line ' + (i + 1) + (done ? (S.t[i] ? ': the halves match' : ': the halves do not match') : ', not folded yet') }, svg);
        // the hit area is a polygon, not a thick line: a line's box can be flat, and a flat box is not clickable
        var dx = L[1][0] - L[0][0], dy = L[1][1] - L[0][1], LN = Math.hypot(dx, dy) || 1, w = 15 * F, nx = -dy / LN * w, ny = dx / LN * w;
        NS('polygon', { points: pts([[L[0][0] + nx, L[0][1] + ny], [L[1][0] + nx, L[1][1] + ny], [L[1][0] - nx, L[1][1] - ny], [L[0][0] - nx, L[0][1] - ny]]), fill: 'transparent' }, g);
        NS('line', { x1: L[0][0], y1: L[0][1], x2: L[1][0], y2: L[1][1], stroke: col, 'stroke-width': 3.5, 'stroke-dasharray': '9 7', 'stroke-linecap': 'round', 'pointer-events': 'none' }, g);
        tapK(g, function () { doFold(i); });
      });
      var n = Object.keys(S.t).length, got = Object.keys(S.t).filter(function (k) { return S.t[k] === 1; }).length;
      chips.innerHTML = '<span class="tr-res none">' + n + ' of ' + LINES.length + ' folds tried</span>' +
        LINES.map(function (L, i) { return S.t[i] == null ? '' : '<span class="tr-res ' + (S.t[i] ? 'yes' : 'no') + '">Fold ' + (i + 1) + (S.t[i] ? ' ✓ matches' : ' ✗ no match') + '</span>'; }).join('');
      btn('↩ Unfold', 'ghost sm tr-redo', function () { S.last = -1; save(); draw(); msg('The paper is flat again. Tap another dashed line to fold it.'); }, S.last < 0);
      svg.setAttribute('aria-label', 'A paper shape with ' + LINES.length + ' dashed fold lines. ' + n + ' folds tried, ' + got + ' matched.');
      if (n >= LINES.length) flag(box, 'tried');
      if (got) flag(box, 'found');
    }
    function doFold(i) {
      var L = LINES[i], ok = isLineOfSym(SHAPE, L[0], L[1]);
      S.t[i] = ok ? 1 : 0; S.last = i; save(); pluck(ok ? HZ.C5 : HZ.D4); draw();
      msg(ok ? '✓ The two halves match exactly, with nothing sticking out. This fold is a <b>line of symmetry</b>.'
             : 'The folded half does not match. Part of it sticks out past the edge, so this fold is <b>not</b> a line of symmetry.', ok);
      var n = Object.keys(S.t).length;
      if (n >= LINES.length) { var got = Object.keys(S.t).filter(function (k) { return S.t[k] === 1; }).length;
        msg((got ? '✓ ' : '') + 'You tried every fold. ' + (got === 0 ? 'Not one of them made the halves match, so this shape has no line of symmetry.' : got === 1 ? 'Only one fold made the halves match.' : got + ' folds made the halves match.'), got > 0); }
    }

    /* ── geoboard (same pins as the Geoboard tool) ── */
    var N = 11, GB = 440, MG = 30;
    function sp() { return (GB - 2 * MG) / (N - 1); }
    function GP(q) { return { x: 130 + MG + q[0] * sp(), y: 10 + MG + q[1] * sp() }; }
    function board() { svg.setAttribute('viewBox', '0 0 700 460'); NS('rect', { x: 132, y: 12, width: GB - 4, height: GB - 4, rx: 22, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg); }

    /* ══ mirror ══ */
    var HALF = nums(box.dataset.half || '5,1 1,5 3,5 3,9 5,9'), AX = +(box.dataset.axis || 5);
    function mir(q) { return [2 * AX - q[0], q[1]]; }
    var TARG = HALF.map(mir).filter(function (q) { return q[0] !== AX; }).filter(function (q, i, a) { return a.findIndex(function (r) { return r[0] === q[0] && r[1] === q[1]; }) === i; });
    function has(list, q) { return list.some(function (r) { return r[0] === q[0] && r[1] === q[1]; }); }
    function drawMirror() {
      board();
      var top = GP([AX, 0]), bot = GP([AX, N - 1]);
      NS('line', { x1: top.x, y1: top.y - 14, x2: bot.x, y2: bot.y + 14, stroke: GOLD, 'stroke-width': 3.5, 'stroke-dasharray': '9 7', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      var done = TARG.every(function (q) { return has(S.p, q); });
      if (done) {
        var full = HALF.concat(HALF.map(mir).reverse().filter(function (q) { return q[0] !== AX; }));
        NS('polygon', { points: full.map(GP).map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '), fill: PUR, 'fill-opacity': .14, stroke: PUR, 'stroke-width': 5, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg);
      } else {
        NS('polyline', { points: HALF.map(GP).map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '), fill: 'none', stroke: PUR, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      }
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) (function (x, y) {
        var c = GP([x, y]), on = has(S.p, [x, y]);
        var g = NS('g', { class: 'tr-pin' + (on ? ' done' : ''), 'data-p': x + ',' + y, role: 'button', tabindex: -1, 'aria-label': 'Pin ' + (x + 1) + ', ' + (y + 1) + (on ? ', part of the mirror half' : '') }, svg);
        NS('circle', { cx: c.x, cy: c.y, r: sp() * 0.48, fill: 'transparent' }, g);
        NS('circle', { cx: c.x, cy: c.y, r: on ? 9 : 5, fill: on ? PUR : PIN, stroke: '#fff', 'stroke-width': on ? 3 : 1.5 }, g);
        tapK(g, function () { tapPin([x, y]); });
      })(x, y);
      chips.innerHTML = '<span class="tr-res none">' + S.p.length + ' of ' + TARG.length + ' corners placed</span>';
      btn('↩ Start over', 'ghost sm tr-redo', function () { S.p = []; save(); flag(box, 'built', false); draw(); msg('The mirror half is clear. Tap a pin to start again.'); }, !S.p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins. Half a shape is on the left of a dashed line. ' + S.p.length + ' of ' + TARG.length + ' mirror corners placed.');
      if (done) flag(box, 'built');
    }
    function tapPin(q) {
      if (has(S.p, q)) { msg('That pin is already part of the mirror half.'); return; }
      if (q[0] === AX) { bad('That pin is on the dashed line. The mirror half is on the other side of the line.'); return; }
      if (q[0] < AX) { bad('That pin is on the half that is already there. Build the other half, on the right of the dashed line.'); return; }
      if (!has(TARG, q)) { bad('Not that pin. Count how far a corner sits from the dashed line, then count the same number of steps on the other side.'); return; }
      S.p.push(q); save(); pluck(HZ.C5 + S.p.length * 30); draw();
      var left = TARG.length - S.p.length;
      msg(left ? '✓ That corner is the same number of steps from the line as its partner. ' + left + ' more to place.' : '✓ Both halves match exactly now. The dashed line is a line of symmetry.', true);
    }

    /* ══ compass ══ */
    var RAD = (box.dataset.radii || '3,1').split(',').map(Number), CM = 42, NX = 180, NY = 320;
    var CARDS = (box.dataset.cards || '').split(',').filter(Boolean);
    function drawCompass() {
      svg.setAttribute('viewBox', '0 0 700 460');
      NS('rect', { x: 8, y: 8, width: 684, height: 444, rx: 20, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      // the circles already drawn stay on the paper
      S.drew.forEach(function (r) {
        NS('circle', { cx: NX, cy: NY, r: r * CM, fill: 'none', stroke: NAVY, 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
        NS('line', { x1: NX - r * CM, y1: NY, x2: NX + r * CM, y2: NY, stroke: STEEL, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', 'pointer-events': 'none' }, svg);
      });
      // the ruler, with 0 right under the needle
      var ry = 92;
      NS('rect', { x: NX - 18, y: ry, width: 10 * CM + 36, height: 44, rx: 8, fill: '#F6EFDC', stroke: '#C9B280', 'stroke-width': 2.5, 'pointer-events': 'none' }, svg);
      for (var c = 0; c <= 10; c++) {
        NS('line', { x1: NX + c * CM, y1: ry, x2: NX + c * CM, y2: ry + (c % 5 === 0 ? 22 : 14), stroke: NAVY, 'stroke-width': c % 5 === 0 ? 2.5 : 1.5, 'pointer-events': 'none' }, svg);
        if (c % 1 === 0) NS('text', { x: NX + c * CM, y: ry + 38, 'text-anchor': 'middle', 'font-size': 13 * F, 'font-weight': 800, fill: GRAY, text: String(c), 'pointer-events': 'none' }, svg);
      }
      NS('text', { x: NX + 10 * CM + 30, y: ry + 28, 'text-anchor': 'start', 'font-size': 13 * F, 'font-weight': 800, fill: GRAY, text: 'cm', 'pointer-events': 'none' }, svg);
      // the compass itself: needle leg at NX, pencil leg r cm away
      var px = NX + S.r * CM, hx = (NX + px) / 2, hy = ry + 62;
      NS('line', { x1: hx, y1: hy, x2: NX, y2: NY, stroke: STEEL, 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      NS('line', { x1: hx, y1: hy, x2: px, y2: NY, stroke: STEEL, 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      NS('circle', { cx: hx, cy: hy, r: 11, fill: '#C9CFDC', stroke: NAVY, 'stroke-width': 2.5, 'pointer-events': 'none' }, svg);
      NS('circle', { cx: NX, cy: NY, r: 6, fill: NAVY, 'pointer-events': 'none' }, svg);
      NS('text', { x: NX, y: NY + 30, 'text-anchor': 'middle', 'font-size': 14 * F, 'font-weight': 800, fill: GRAY, text: 'needle point', 'pointer-events': 'none' }, svg);
      var g = NS('g', { class: 'drag sf-pen', tabindex: 0, role: 'slider', 'aria-valuenow': S.r, 'aria-valuemin': 1, 'aria-valuemax': 8, 'aria-label': 'The pencil leg of the compass. Drag it to set the opening. Now ' + S.r + ' centimeters.' }, svg);
      NS('circle', { cx: px, cy: NY, r: 26 * F, fill: 'transparent' }, g);
      NS('polygon', { points: pts([[px, NY], [px - 9, NY - 26], [px + 9, NY - 26]]), fill: '#E8B64C', stroke: NAVY, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
      NS('text', { x: px, y: NY + 54, 'text-anchor': 'middle', 'font-size': 14 * F, 'font-weight': 800, fill: ORG, text: 'pencil', 'pointer-events': 'none' }, g);
      drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - px) + ',0)'); }, function (pt) {
        if (!pt) { draw(); return; }
        var r = Math.round((pt.x - NX) / CM);
        if (r < 1 || r > 8) { bad('Open the compass between 1 cm and 8 cm on the ruler.'); draw(); return; }
        setR(r);
      }, function () {});
      g.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setR(Math.min(8, S.r + 1)); } if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setR(Math.max(1, S.r - 1)); } });
      btn('✏️ Draw the circle', '', function () {
        if (S.drew.indexOf(S.r) > -1) { bad('You already drew a circle with that opening. Set a different opening first.'); return; }
        S.drew.push(S.r); save(); pluck(HZ.C5); draw();
        msg('✓ The needle stayed in one place and the pencil went all the way round, so every point on the circle is <b>' + S.r + ' cm</b> from the needle. That is the radius. The dashed line goes right across the middle.', true);
        RAD.forEach(function (r) { if (S.drew.indexOf(r) > -1) flag(box, 'r' + r); });
      });
      btn('↩ Clear the paper', 'ghost sm tr-redo', function () { S.drew = []; save(); RAD.forEach(function (r) { flag(box, 'r' + r, false); }); draw(); msg('The paper is clear. Set the opening and draw again.'); }, !S.drew.length);
      chips.innerHTML = '<span class="tr-res none">opening: ' + S.r + ' cm</span>' + S.drew.map(function (r) { return '<span class="tr-res yes">circle drawn: radius ' + r + ' cm</span>'; }).join('');
      svg.setAttribute('aria-label', 'A compass standing on paper next to a centimeter ruler. The opening is ' + S.r + ' centimeters. ' + S.drew.length + ' circles drawn.');
      RAD.forEach(function (r) { if (S.drew.indexOf(r) > -1) flag(box, 'r' + r); });
      cardUI();
    }
    function setR(r) { S.r = r; save(); pluck(HZ.E4 + r * 30); draw(); msg('The compass is open ' + r + ' cm. Press ✏️ Draw the circle.'); }
    function cardUI() {
      namesB.innerHTML = ''; cardsB.innerHTML = '';
      if (!CARDS.length) { cardsB.hidden = true; return; }
      cardsB.hidden = false;
      var line = el('div', 'tn-row'); line.appendChild(el('span', 'tn-lab', 'Open the compass wider and you draw:'));
      var sl = el('span', 'tn-slot' + (S.nm ? ' ok' : ''), S.nm ? esc(S.nm) : 'drop a card here'); sl.tabIndex = S.nm ? -1 : 0; sl.setAttribute('role', 'button'); sl.setAttribute('aria-label', 'Box for the card' + (S.nm ? ': ' + S.nm : ''));
      if (!S.nm) tapK(sl, function () { if (SEL) put(SEL); else bad('First pick a card, then tap this box. Or drag a card onto the box.'); });
      line.appendChild(sl); namesB.appendChild(line);
      CARDS.forEach(function (c) {
        var b = el('button', 'bm-chip an-card tn-card qd-card' + (SEL === c ? ' sel' : '') + (S.nm === c ? ' used' : ''), esc(c)); b.type = 'button'; b.dataset.c = c; if (S.nm) b.disabled = true;
        hdrag(b, function (t) { if (t && t.closest && t.closest('.tn-slot') && !S.nm) put(c); else bad('Drop the card right on the box.'); }, function () { SEL = SEL === c ? null : c; draw(); if (SEL) msg('Now tap the box.'); });
        cardsB.appendChild(b);
      });
      function put(c) {
        SEL = null;
        if (S.drew.length < 2) { bad('Draw both circles first. Then you can see what a wider opening does.'); draw(); return; }
        if (c === CARDS[0]) { S.nm = c; save(); pluck(HZ.C5); draw(); flag(box, 'card'); msg('✓ A wider opening puts the pencil farther from the needle, so the circle is bigger all the way round.', true); return; }
        bad('Look at your two circles. The one you drew with the wider opening is the bigger one.'); draw();
      }
    }

    /* ══ euclid ══ */
    var EA = [250, 300], EB = [410, 300], ER = 160, EH = ER * Math.sqrt(3) / 2;
    var XP = [[(EA[0] + EB[0]) / 2, 300 - EH], [(EA[0] + EB[0]) / 2, 300 + EH]];
    function drawEuclid() {
      svg.setAttribute('viewBox', '0 0 700 480');
      NS('rect', { x: 8, y: 8, width: 684, height: 464, rx: 20, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
      if (S.a) NS('circle', { cx: EA[0], cy: EA[1], r: ER, fill: 'none', stroke: '#2F6FDE', 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
      if (S.b) NS('circle', { cx: EB[0], cy: EB[1], r: ER, fill: 'none', stroke: '#D2453B', 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
      if (S.line) {
        NS('line', { x1: XP[0][0], y1: XP[0][1] - 40, x2: XP[1][0], y2: XP[1][1] + 40, stroke: GOLD, 'stroke-width': 3.5, 'stroke-dasharray': '9 7', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        NS('polygon', { points: pts([EA, EB, XP[0]]), fill: PUR, 'fill-opacity': .14, stroke: PUR, 'stroke-width': 4.5, 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg);
        [[EA, EB], [EB, XP[0]], [XP[0], EA]].forEach(function (s) {
          // not at the exact midpoint: on side A–B that is where the fold line crosses, and the mark would hide in it
          var t = 0.38, mx = s[0][0] + (s[1][0] - s[0][0]) * t, my = s[0][1] + (s[1][1] - s[0][1]) * t, dx = s[1][0] - s[0][0], dy = s[1][1] - s[0][1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
          NS('line', { x1: mx - nx * 10, y1: my - ny * 10, x2: mx + nx * 10, y2: my + ny * 10, stroke: NAVY, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
        });
      }
      NS('line', { x1: EA[0], y1: EA[1], x2: EB[0], y2: EB[1], stroke: NAVY, 'stroke-width': 5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg);
      [[EA, 'A'], [EB, 'B']].forEach(function (p) {
        NS('circle', { cx: p[0][0], cy: p[0][1], r: 7, fill: NAVY, 'pointer-events': 'none' }, svg);
        NS('text', { x: p[0][0], y: p[0][1] + 32, 'text-anchor': 'middle', 'font-size': 18 * F, 'font-weight': 900, fill: NAVY, text: p[1], 'pointer-events': 'none' }, svg);
      });
      if (S.a && S.b && !S.line) XP.forEach(function (c, i) {
        var g = NS('g', { class: 'sf-x' + (S.x[i] ? ' done' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'A point where the two circles cross' + (S.x[i] ? ', tapped' : ', not tapped yet') }, svg);
        NS('circle', { cx: c[0], cy: c[1], r: 24 * F, fill: 'transparent' }, g);
        NS('circle', { cx: c[0], cy: c[1], r: S.x[i] ? 9 : 10, fill: S.x[i] ? GOLD : 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 3, 'stroke-dasharray': S.x[i] ? '' : '4 3' }, g);
        tapK(g, function () { tapX(i); });
      });
      btn('📏 Open the compass from A to B', '', function () { S.set = 1; save(); pluck(HZ.C5); flag(box, 'cset'); draw(); msg('✓ The compass is open exactly as wide as the line from A to B. Keep it open.', true); }, !!S.set);
      btn('✏️ Draw the circle around A', '', function () { if (!S.set) { bad('Open the compass from A to B first.'); return; } S.a = 1; save(); pluck(HZ.E5); flag(box, 'ca'); draw(); msg('✓ The needle sat on A and the pencil went all the way round. Every point on the blue circle is as far from A as B is.', true); }, !S.set || !!S.a);
      btn('✏️ Draw the circle around B', '', function () { if (!S.a) { bad('Draw the circle around A first.'); return; } S.b = 1; save(); pluck(HZ.G5); flag(box, 'cb'); draw(); msg('✓ Two circles the same size. Now tap the two places where they cross.', true); }, !S.a || !!S.b);
      btn('↩ Start over', 'ghost sm tr-redo', function () { S.set = 0; S.a = 0; S.b = 0; S.x = {}; S.line = 0; save(); ['cset', 'ca', 'cb', 'fline'].forEach(function (k) { flag(box, k, false); }); draw(); msg('The paper is clear. Open the compass from A to B to start again.'); }, !S.set);
      chips.innerHTML = '<span class="tr-res ' + (S.set ? 'yes' : 'none') + '">compass open A to B</span><span class="tr-res ' + (S.a ? 'yes' : 'none') + '">circle around A</span><span class="tr-res ' + (S.b ? 'yes' : 'none') + '">circle around B</span><span class="tr-res ' + (S.line ? 'yes' : 'none') + '">fold line</span>';
      svg.setAttribute('aria-label', 'A line from A to B' + (S.a ? ', a circle around A' : '') + (S.b ? ', a circle around B' : '') + (S.line ? ', a dashed fold line through the two crossings, and a triangle with a tick mark on each side' : '') + '.');
      ['cset', 'ca', 'cb'].forEach(function (k, i) { if ([S.set, S.a, S.b][i]) flag(box, k); });
      if (S.line) flag(box, 'fline');
    }
    function tapX(i) {
      if (S.x[i]) { msg('You tapped that crossing already. Tap the other one.'); return; }
      S.x[i] = 1; save(); pluck(HZ.C5); draw();
      if (Object.keys(S.x).length < 2) { msg('✓ One crossing. Tap the other one too.', true); return; }
      S.line = 1; save(); flag(box, 'fline'); draw();
      msg('✓ The dashed line joins the two crossings. Fold the picture along it: the blue circle lands on the red one and A lands on B, so the whole picture matches. The three sides of the triangle have one tick mark each.', true);
    }

    // a redraw replaces every node in the svg, so remember what had keyboard focus and give it back
    function focusKey() { var a = document.activeElement; if (!a || !svg.contains(a)) return null; return (a.getAttribute('class') || '') + '|' + (a.dataset ? (a.dataset.i == null ? '' : a.dataset.i) : ''); }
    function refocus(k) { if (!k) return; var cls = k.split('|')[0].split(' ')[0], i = k.split('|')[1];
      var n = $$('.' + cls, svg).filter(function (e) { return i === '' || e.dataset.i === i; })[0]; if (n && n.focus) n.focus(); }
    function draw() { var k = focusKey(); sizeF(); svg.innerHTML = ''; btns.innerHTML = ''; chips.innerHTML = ''; if (DO !== 'compass') { namesB.innerHTML = ''; cardsB.innerHTML = ''; cardsB.hidden = true; }
      ({ fold: drawFold, mirror: drawMirror, compass: drawCompass, euclid: drawEuclid }[DO] || drawFold)(); refocus(k); }
    onWidth(box, draw); draw();
  };

  MODS.quad = function (box) {
    var name = box.dataset.name || 'quad', DO = box.dataset.do || 'check';
    var NAVY = '#0E1C42', OKG = '#1E7A4C', RED = '#B23A2E', GOLD = '#C9A227', GRAY = '#5B6478', PIN = '#6B7280', LINE = '#D9DEEA', SQF = '#D9F0E3', ORG = '#C26A0A';
    var BAND = ['#6B46C1', '#23915A', '#D2453B', '#2F6FDE', '#F08A24'];
    var Q0 = box.dataset.quad ? JSON.parse(box.dataset.quad) : [[2, 3], [8, 3], [8, 7], [2, 7]];
    var RULE = box.dataset.rule || '', NEED = box.dataset.need || '', COL = box.dataset.col || BAND[DO === 'make' ? 3 : 0];
    var CARDS = (box.dataset.cards || 'quadrilateral,trapezoid,parallelogram,rectangle,rhombus,square').split(',');
    var DEF = { reshape: { p: Q0.map(function (q) { return q.slice(); }), seen: {}, sel: -1 }, check: { pr: [], ck: {}, nm: '', s1: -1 }, make: { p: [], k: 0, pr: [], ck: {}, nm: '', s1: -1 }, isrect: { ck: {}, v: '' }, qsort: { g: {} }, tree: { at: {}, tap: {} } };
    var S = mstate(name, JSON.parse(JSON.stringify(DEF[DO] || {})));
    var HTMLMODE = DO === 'qsort' || DO === 'tree';
    box.innerHTML = '<div class="sb-stage sb-an sb-quad"><div class="an-btns"></div>' + (HTMLMODE ? '<div class="qd-tray" role="group" aria-label="Cards to drag"></div><div class="qd-area"></div>' : '<svg viewBox="0 0 700 460" role="group"></svg><div class="qd-chips"></div><div class="qd-names"></div><div class="bm-chips qd-cards" role="group" aria-label="Name cards to drag"></div>') + '</div><div class="sb-readout" aria-live="polite"></div>';
    var svg = $('svg', box), out = $('.sb-readout', box), btns = $('.an-btns', box), chips = $('.qd-chips', box), namesB = $('.qd-names', box), cardsB = $('.qd-cards', box), F = 1, SEL = null, LAST = -1;
    function sizeF() { F = (box.clientWidth || 800) < 560 ? 1.8 : 1; }
    function msg(h, ok) { out.innerHTML = ok ? '<span style="color:' + OKG + '">' + h + '</span>' : h; }
    function bad(t) { pluck(HZ.D4); msg(t); }
    function btn(label, cls, fn, dis) { var b = el('button', 'sb-btn ' + (cls || ''), label); b.type = 'button'; b.disabled = !!dis; b.addEventListener('click', fn); btns.appendChild(b); return b; }
    function tapK(g, fn) { g.addEventListener('click', fn); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); }
    function P(v, deg, r) { var a = deg * Math.PI / 180; return { x: v.x + r * Math.cos(a), y: v.y - r * Math.sin(a) }; }
    function pts(a) { return a.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '); }
    function bar(A, B, w, fill, g) { var dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2, kx = dx / L * 8, ky = dy / L * 8; return NS('polygon', { points: [[A.x + nx + kx, A.y + ny + ky], [B.x + nx - kx, B.y + ny - ky], [B.x - nx - kx, B.y - ny - ky], [A.x - nx + kx, A.y - ny + ky]].map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: fill }, g); }

    /* ── shape math (whole-number pins: exact) ── */
    function d2(a, b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }
    function vec(p, i) { var a = p[i], b = p[(i + 1) % p.length]; return [b[0] - a[0], b[1] - a[1]]; }
    function isPar(p, i, j) { var u = vec(p, i), v = vec(p, j); return u[0] * v[1] - u[1] * v[0] === 0; }
    function parPairs(p) { var r = []; if (isPar(p, 0, 2)) r.push([0, 2]); if (isPar(p, 1, 3)) r.push([1, 3]); return r; }
    function kindAt(p, i) { var n = p.length, q = p[i], a = p[(i + n - 1) % n], c = p[(i + 1) % n], dot = (a[0] - q[0]) * (c[0] - q[0]) + (a[1] - q[1]) * (c[1] - q[1]); return dot === 0 ? 'square' : dot > 0 ? 'smaller' : 'bigger'; }
    function allSq(p) { for (var i = 0; i < 4; i++) if (kindAt(p, i) !== 'square') return false; return true; }
    function allEq(p) { var s = p.map(function (q, i) { return d2(q, p[(i + 1) % 4]); }); return s[0] === s[1] && s[1] === s[2] && s[2] === s[3]; }
    function best(p) { var n = parPairs(p).length; if (n === 2) { var r = allSq(p), h = allEq(p); return r && h ? 'square' : r ? 'rectangle' : h ? 'rhombus' : 'parallelogram'; } return n === 1 ? 'trapezoid' : 'quadrilateral'; }
    var FAM = { quadrilateral: ['quadrilateral'], trapezoid: ['quadrilateral', 'trapezoid'], parallelogram: ['quadrilateral', 'trapezoid', 'parallelogram'], rectangle: ['quadrilateral', 'trapezoid', 'parallelogram', 'rectangle'], rhombus: ['quadrilateral', 'trapezoid', 'parallelogram', 'rhombus'], square: ['quadrilateral', 'trapezoid', 'parallelogram', 'rectangle', 'rhombus', 'square'] };
    function cross(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
    function segX(a, b, c, d) { var d1 = cross(c, d, a), d2_ = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d); return ((d1 > 0 && d2_ < 0) || (d1 < 0 && d2_ > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)); }
    function badQuad(p) {
      for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) if (p[i][0] === p[j][0] && p[i][1] === p[j][1]) return 'Two corners are on the same pin. Use 4 different pins.';
      for (var k = 0; k < 4; k++) if (cross(p[(k + 3) % 4], p[k], p[(k + 1) % 4]) === 0) return 'Three corners are in one straight line, so that side is not a corner. The shape only has 3 sides. Try a different pin.';
      if (segX(p[0], p[1], p[2], p[3]) || segX(p[1], p[2], p[3], p[0])) return 'The band crosses over itself. That makes two triangles, not one 4-sided shape. Try a different pin.';
      return '';
    }
    function same(a, b) { return a[0] === b[0] && a[1] === b[1]; }

    /* ── geoboard ── */
    var N = 11, GB = 440, MG = 30;
    function sp() { return (GB - 2 * MG) / (N - 1); }
    function GP(q) { return { x: 130 + MG + q[0] * sp(), y: 10 + MG + q[1] * sp() }; }
    function board() { svg.setAttribute('viewBox', '0 0 700 460'); NS('rect', { x: 132, y: 12, width: GB - 4, height: GB - 4, rx: 22, fill: '#EEF0F6', stroke: LINE, 'stroke-width': 3, 'pointer-events': 'none' }, svg); }
    function pins(onTap, hi) {
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) (function (x, y) {
        var c = GP([x, y]), g = NS('g', onTap ? { class: 'tr-pin', 'data-p': x + ',' + y, role: 'button', tabindex: -1, 'aria-label': 'Pin ' + (x + 1) + ', ' + (y + 1) } : { 'pointer-events': 'none' }, svg);
        if (onTap) NS('circle', { cx: c.x, cy: c.y, r: sp() * 0.48, fill: 'transparent' }, g);
        if (hi && hi[0] === x && hi[1] === y) NS('circle', { cx: c.x, cy: c.y, r: 11, fill: 'none', stroke: BAND[0], 'stroke-width': 3 }, g);
        NS('circle', { cx: c.x, cy: c.y, r: 5, fill: PIN, stroke: '#fff', 'stroke-width': 1.5 }, g);
        if (onTap) tapK(g, function () { onTap([x, y]); });
      })(x, y);
    }
    function band(p, closed, col) { NS(closed ? 'polygon' : 'polyline', { points: pts(p.map(GP)), fill: closed ? col : 'none', 'fill-opacity': .14, stroke: col, 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); }
    // tick marks: sides of the same length share a mark count (1, then 2); a side with no match gets none
    function ticks(p) {
      var s = p.map(function (q, i) { return d2(q, p[(i + 1) % 4]); }), grp = {}, marks = [0, 0, 0, 0], k = 0;
      s.forEach(function (v, i) { (grp[v] = grp[v] || []).push(i); });
      Object.keys(grp).forEach(function (v) { if (grp[v].length > 1) { k++; grp[v].forEach(function (i) { marks[i] = k; }); } });
      p.forEach(function (q, i) { if (!marks[i]) return; var A = GP(q), B = GP(p[(i + 1) % 4]), dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, m = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        for (var t = 0; t < marks[i]; t++) { var off = (t - (marks[i] - 1) / 2) * 9; NS('line', { x1: m.x + ux * off - nx * 10, y1: m.y + uy * off - ny * 10, x2: m.x + ux * off + nx * 10, y2: m.y + uy * off + ny * 10, stroke: NAVY, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'pointer-events': 'none' }, svg); } });
    }
    // arrow marks on a parallel pair: one chevron for the first pair, two for the second, all pointing the same way
    function arrows(p, pair, n) {
      var ref = vec(p, pair[0]);
      pair.forEach(function (i) { var A = GP(p[i]), B = GP(p[(i + 1) % 4]), v = vec(p, i); if (v[0] * ref[0] + v[1] * ref[1] < 0) { var t = A; A = B; B = t; }
        var dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, m = { x: (A.x + B.x) / 2 + ux * 36, y: (A.y + B.y) / 2 + uy * 36 };
        for (var c = 0; c < n; c++) { var o = c * 10, tip = { x: m.x + ux * o, y: m.y + uy * o }; NS('polyline', { points: pts([{ x: tip.x - ux * 10 - nx * 8, y: tip.y - uy * 10 - ny * 8 }, tip, { x: tip.x - ux * 10 + nx * 8, y: tip.y - uy * 10 + ny * 8 }]), fill: 'none', stroke: ORG, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg); } });
    }

    /* ── set square on corners ── */
    var KW = { square: 'a square corner', smaller: 'smaller than a square corner', bigger: 'bigger than a square corner' }, KC = { square: OKG, smaller: ORG, bigger: RED };
    function cornerMark(p, i, k) {
      var n = p.length, Q = GP(p[i]), A = GP(p[(i + n - 1) % n]), C = GP(p[(i + 1) % n]), la = Math.hypot(A.x - Q.x, A.y - Q.y), lc = Math.hypot(C.x - Q.x, C.y - Q.y), u = { x: (A.x - Q.x) / la, y: (A.y - Q.y) / la }, v = { x: (C.x - Q.x) / lc, y: (C.y - Q.y) / lc };
      if (k === 'square') { var s = 14; NS('polyline', { points: pts([{ x: Q.x + u.x * s, y: Q.y + u.y * s }, { x: Q.x + (u.x + v.x) * s, y: Q.y + (u.y + v.y) * s }, { x: Q.x + v.x * s, y: Q.y + v.y * s }]), fill: 'none', stroke: OKG, 'stroke-width': 3, 'pointer-events': 'none' }, svg); return; }
      var r = 20, a1 = Math.atan2(u.y, u.x), a2 = Math.atan2(v.y, v.x), da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      NS('path', { d: 'M' + (Q.x + r * Math.cos(a1)).toFixed(1) + ' ' + (Q.y + r * Math.sin(a1)).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 ' + (da > 0 ? 1 : 0) + ' ' + (Q.x + r * Math.cos(a2)).toFixed(1) + ' ' + (Q.y + r * Math.sin(a2)).toFixed(1), fill: 'none', stroke: KC[k], 'stroke-width': 3.5, 'pointer-events': 'none' }, svg);
    }
    function squareOn(p, i) {
      var n = p.length, Q = GP(p[i]), A = GP(p[(i + n - 1) % n]), C = GP(p[(i + 1) % n]), la = Math.hypot(A.x - Q.x, A.y - Q.y), u = { x: (A.x - Q.x) / la, y: (A.y - Q.y) / la };
      var w1 = { x: -u.y, y: u.x }, w2 = { x: u.y, y: -u.x }, cx = C.x - Q.x, cy = C.y - Q.y, w = (w1.x * cx + w1.y * cy) >= (w2.x * cx + w2.y * cy) ? w1 : w2, L = 92;
      NS('polygon', { points: pts([Q, { x: Q.x + u.x * L, y: Q.y + u.y * L }, { x: Q.x + w.x * L, y: Q.y + w.y * L }]), fill: SQF, 'fill-opacity': .72, stroke: NAVY, 'stroke-width': 2, 'pointer-events': 'none' }, svg);
    }
    function corners(p, onCheck) {
      p.forEach(function (q, i) {
        var c = GP(q), on = S.ck[i], g = NS('g', { class: 'tn-cn' + (on ? ' done' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'A corner' + (on ? ': ' + KW[on] : ', not checked yet') }, svg);
        NS('circle', { cx: c.x, cy: c.y, r: 24 * F, fill: 'transparent' }, g);
        if (!on) NS('circle', { cx: c.x, cy: c.y, r: 9, fill: 'rgba(201,162,39,.25)', stroke: GOLD, 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, g);
        tapK(g, function () { onCheck(i); });
      });
      var home = { x: 610, y: 430 }, g = NS('g', { class: 'drag tn-sq', tabindex: 0, role: 'slider', 'aria-label': 'The set square. Drag its square corner onto a corner of the shape.' }, svg);
      NS('polygon', { points: pts([home, P(home, 0, 72), P(home, 90, 72)]), fill: SQF, 'fill-opacity': .9, stroke: '#8792A8', 'stroke-width': 2 }, g);
      NS('circle', { cx: home.x, cy: home.y, r: 30, fill: 'transparent' }, g);
      NS('text', { x: home.x + 36, y: home.y + 20, 'text-anchor': 'middle', 'font-size': 13 * F, 'font-weight': 800, fill: GRAY, text: 'set square', 'pointer-events': 'none' }, g);
      drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - home.x) + ',' + (pt.y - home.y) + ')'); }, function (pt) {
        var bi = -1, bd = 1e9; p.forEach(function (q, i) { var c = GP(q), dd = pt ? Math.hypot(pt.x - c.x, pt.y - c.y) : 1e9; if (dd < bd) { bd = dd; bi = i; } });
        if (bi > -1 && bd < 40 * F) onCheck(bi); else { bad('Drop the set square so its square corner lands right on a corner of the shape.'); draw(); }
      }, function () {});
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); for (var i = 0; i < p.length; i++) if (!S.ck[i]) { onCheck(i); return; } } });
    }
    function checkCorner(p, i) { var k = kindAt(p, i); S.ck[i] = k; LAST = i; save(); pluck(k === 'square' ? HZ.C5 : k === 'bigger' ? HZ.E4 : HZ.G4); draw();
      var n = Object.keys(S.ck).length; msg('This corner is <b style="color:' + KC[k] + '">' + KW[k] + '</b>. ' + (n < p.length ? n + ' of ' + p.length + ' corners checked.' : 'All ' + p.length + ' corners checked.'), k === 'square'); after(); }
    function allCk(p) { for (var i = 0; i < p.length; i++) if (!S.ck[i]) return false; return true; }

    /* ── tap two sides to test if they are parallel ── */
    function sideTaps(p) {
      p.forEach(function (q, i) {
        var A = GP(q), B = GP(p[(i + 1) % 4]), inPair = S.pr.some(function (pp) { return pp.indexOf(i) > -1; }), g = NS('g', { class: 'qd-side' + (inPair ? ' done' : '') + (S.s1 === i ? ' sel' : ''), 'data-i': i, role: 'button', tabindex: 0, 'aria-label': 'Side ' + (i + 1) + (inPair ? ', in a parallel pair' : '') }, svg);
        bar(A, B, 30 * F, S.s1 === i ? 'rgba(201,162,39,.45)' : 'rgba(255,255,255,.01)', g);
        tapK(g, function () { tapSide(p, i); });
      });
    }
    function tapSide(p, i) {
      if (S.pr.some(function (pp) { return pp.indexOf(i) > -1; })) { msg('That side is already in a parallel pair. Look at the other sides.'); return; }
      if (S.s1 < 0 || S.s1 === i) { S.s1 = S.s1 === i ? -1 : i; save(); draw(); if (S.s1 > -1) msg('Now tap the side you think goes the same way as this one.'); return; }
      var a = S.s1, b = i; S.s1 = -1;
      if (isPar(p, a, b)) { S.pr.push([a, b]); save(); pluck(HZ.C5); draw(); var all = parPairs(p).length; msg('✓ Parallel: those two sides go the same way and never meet. The arrow marks show the pair.' + (S.pr.length >= all ? ' That is every parallel pair.' : ' Look for another pair.'), true); after(); }
      else { save(); draw(); bad('Not parallel. If you made those two sides longer, they would meet. Parallel sides go the same way, like train tracks.'); }
    }
    function parDone(p) { return S.pr.length >= parPairs(p).length; }

    /* ── the name box ── */
    var WHY = { quadrilateral: 'A quadrilateral has 4 straight sides.', trapezoid: 'A trapezoid has at least 1 pair of parallel sides.', parallelogram: 'A parallelogram has 2 pairs of parallel sides.', rectangle: 'A rectangle has 4 square corners.', rhombus: 'A rhombus has 4 equal sides.', square: 'A square has 4 equal sides and 4 square corners.' };
    function nameUI(p, ready, why) {
      namesB.innerHTML = ''; cardsB.innerHTML = ''; if (!p) { cardsB.hidden = true; return; } cardsB.hidden = false;
      var line = el('div', 'tn-row'); line.appendChild(el('span', 'tn-lab', 'The name that tells the most:'));
      var sl = el('span', 'tn-slot' + (S.nm ? ' ok' : ''), S.nm ? esc(S.nm) : 'drop a name card here'); sl.tabIndex = S.nm ? -1 : 0; sl.setAttribute('role', 'button'); sl.setAttribute('aria-label', 'Box for the name' + (S.nm ? ': ' + S.nm : ''));
      if (!S.nm) tapK(sl, function () { if (SEL) put(SEL); else bad('First pick a name card, then tap this box. Or drag a card onto the box.'); });
      line.appendChild(sl); namesB.appendChild(line);
      CARDS.forEach(function (c) { var b = el('button', 'bm-chip an-card tn-card qd-card' + (SEL === c ? ' sel' : '') + (S.nm === c ? ' used' : ''), esc(c)); b.type = 'button'; b.dataset.c = c; if (S.nm) b.disabled = true;
        hdrag(b, function (t) { if (t && t.closest && t.closest('.tn-slot') && !S.nm) put(c); else bad('Drop the card right on the name box.'); }, function () { SEL = SEL === c ? null : c; draw(); if (SEL) msg('Now tap the name box.'); });
        cardsB.appendChild(b); });
      function put(c) { SEL = null; if (!ready()) { bad(why); draw(); return; } var w = best(p);
        if (c === w) { S.nm = c; LAST = -1; save(); pluck(HZ.C5); draw(); msg('✓ <b>' + esc(c) + '</b>. ' + WHY[c], true); after(); return; }
        if (FAM[w].indexOf(c) > -1) { bad('True, it is a ' + esc(c) + '! But there is a name that tells more about it. ' + WHY[c]); draw(); return; }
        bad('Not a ' + esc(c) + '. ' + WHY[c] + ' Look at the arrow marks, the tick marks and the corners.'); draw(); }
    }

    /* ══ modes ══ */
    function drawReshape() {
      board(); var p = S.p;
      band(p, true, COL);
      pins(function (q) { if (S.sel < 0) return; moveTo(S.sel, q); }, null);
      p.forEach(function (q, i) {
        var c = GP(q), g = NS('g', { class: 'drag qd-h' + (S.sel === i ? ' sel' : ''), 'data-i': i, tabindex: 0, role: 'slider', 'aria-label': 'Corner ' + (i + 1) + ' of the band. Drag it to another pin, or tap it and then tap a pin.' }, svg);
        NS('circle', { cx: c.x, cy: c.y, r: 24 * F, fill: 'transparent' }, g); NS('circle', { cx: c.x, cy: c.y, r: (S.sel === i ? 14 : 11) * F, fill: S.sel === i ? GOLD : COL, stroke: '#fff', 'stroke-width': 3 }, g);
        drag(g, svg, function (pt) { g.setAttribute('transform', 'translate(' + (pt.x - c.x) + ',' + (pt.y - c.y) + ')'); }, function (pt) {
          if (!pt) { draw(); return; } var x = Math.round((pt.x - 130 - MG) / sp()), y = Math.round((pt.y - 10 - MG) / sp());
          if (x < 0 || y < 0 || x > 10 || y > 10) { bad('Drop the corner on a pin.'); draw(); return; } moveTo(i, [x, y]); }, function () { if (S.sel > -1 && S.sel !== i) { moveTo(S.sel, S.p[i]); return; } S.sel = S.sel === i ? -1 : i; save(); draw(); if (S.sel > -1) msg('Now tap the pin where this corner should go.'); });
      });
      var n = Object.keys(S.seen).length;
      chips.innerHTML = '<span class="tr-res none">' + Math.min(n, 3) + ' of 3 new shapes</span>' + Object.keys(S.seen).slice(0, 6).map(function (k, j) { return '<span class="tr-res yes">Shape ' + (j + 1) + ' ✓</span>'; }).join('');
      btn('↩ Back to the rectangle', 'ghost sm tr-redo', function () { S.p = Q0.map(function (q) { return q.slice(); }); S.sel = -1; save(); draw(); msg('The band is a rectangle again. Your shapes still count.'); }, false);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins. A band with 4 corners. ' + n + ' new shapes made.');
      if (n >= 3) flag(box, 'made3');
    }
    function moveTo(i, q) {
      var p = S.p.map(function (r) { return r.slice(); }); p[i] = q.slice(); S.sel = -1;
      var why = badQuad(p); if (why) { save(); bad(why); draw(); return; }
      S.p = p; var key = p.map(function (r) { return r.join(','); }).slice().sort().join('|'), orig = Q0.map(function (r) { return r.join(','); }).slice().sort().join('|'), fresh = key !== orig && !S.seen[key];
      if (fresh) S.seen[key] = 1; save(); pluck(HZ.C5); draw(); var n = Object.keys(S.seen).length;
      msg(fresh ? '✓ A new shape: still 4 straight sides, 4 corners, and no gaps. ' + (n >= 3 ? 'That is 3 new shapes!' : 'Make ' + (3 - n) + ' more.') : 'You made that shape already, or it is the first rectangle. Move a corner somewhere new.', fresh);
      if (n >= 3) flag(box, 'made3');
    }
    function drawCheck() {
      board(); pins(null); var p = Q0; band(p, true, COL); ticks(p);
      S.pr.forEach(function (pp, j) { arrows(p, pp, j + 1); });
      p.forEach(function (q, i) { if (S.ck[i]) cornerMark(p, i, S.ck[i]); });
      if (LAST > -1) squareOn(p, LAST);
      sideTaps(p); corners(p, function (i) { checkCorner(p, i); });
      svg.setAttribute('aria-label', 'A 4-sided shape on a geoboard. Tick marks show sides of the same length.');
      if (DO === 'check') nameUI(p, function () { return parDone(p) && allCk(p); }, 'First find every parallel pair and check every corner. Then you will know the best name.');
    }
    function hook(q) {
      if (S.k) return;
      if (S.p.length && same(S.p[0], q)) {
        if (S.p.length < 4) { bad('Hook the band on 4 pins before you close it.'); return; }
        var why = badQuad(S.p); if (why) { bad(why.replace('Try a different pin.', 'Press Start over.')); return; }
        S.k = 1; var r = ruleBad(S.p); S.bad = r; save(); pluck(r ? HZ.D4 : HZ.C5); draw();
        if (r) { flag(box, 'made', false); msg(r); return; }
        flag(box, 'made'); msg(RULE === 'one-pair' ? '✓ A 4-sided shape with exactly 1 pair of parallel sides. Now tap the two sides that are parallel.' : '✓ A rectangle that is not a square: 2 long sides and 2 short sides. Now check every corner with the set square.', true); after(); return;
      }
      if (S.p.some(function (r) { return same(r, q); })) { bad('That pin is already in the band.'); return; }
      if (S.p.length >= 4) { bad('You have 4 pins. Now tap the first pin to close the band.'); return; }
      S.p.push(q); save(); pluck(HZ.E4 + S.p.length * 40); draw();
      msg(S.p.length < 4 ? 'Pin ' + S.p.length + ' is hooked. Tap the next pin.' : '4 pins. Now tap the first pin (the one with the ring) to close the band.');
    }
    function ruleBad(p) {
      var n = parPairs(p).length;
      if (RULE === 'one-pair') return n === 1 ? '' : n === 2 ? 'That shape has 2 pairs of parallel sides, so it is a parallelogram. Make only 1 pair go the same way: try a top side shorter than the bottom side. Press Start over.' : 'None of its sides are parallel. Make the top side and the bottom side go the same way, straight across. Press Start over.';
      if (RULE === 'rect-not-square') { if (!allSq(p)) return 'That shape does not have 4 square corners. Go straight across and straight up and down from pin to pin. Press Start over.'; if (allEq(p)) return 'That is a square: all 4 sides are the same length. Make 2 sides longer than the other 2. Press Start over.'; return ''; }
      return '';
    }
    function startOver() { S.p = []; S.k = 0; S.bad = ''; S.pr = []; S.ck = {}; S.nm = ''; S.s1 = -1; LAST = -1; save(); draw(); flag(box, 'made', false); msg('The band is off. Tap a pin to start.'); }
    function drawMake() {
      board(); var p = S.p;
      if (p.length) band(p, !!S.k, S.bad ? RED : COL);
      pins(S.k ? null : hook, p[0]);
      if (S.k && !S.bad) {
        ticks(p); S.pr.forEach(function (pp, j) { arrows(p, pp, j + 1); });
        p.forEach(function (q, i) { if (S.ck[i]) cornerMark(p, i, S.ck[i]); }); if (LAST > -1) squareOn(p, LAST);
        if (NEED.indexOf('par') > -1) sideTaps(p);
        if (NEED.indexOf('ck') > -1) corners(p, function (i) { checkCorner(p, i); });
      }
      btn('↩ Start over', 'ghost sm tr-redo', startOver, !p.length);
      svg.setAttribute('aria-label', 'A geoboard with 11 rows of 11 pins.' + (S.k ? ' A band makes a 4-sided shape.' : p.length ? ' The band is on ' + p.length + ' pins.' : ''));
      nameUI(S.k && !S.bad ? p : null, function () { return (NEED.indexOf('par') < 0 || parDone(p)) && (NEED.indexOf('ck') < 0 || allCk(p)); }, NEED.indexOf('par') > -1 ? 'First tap the two sides that are parallel.' : 'First check every corner with the set square.');
    }
    function drawIsRect() {
      board(); pins(null); var p = Q0; band(p, true, COL); ticks(p);
      p.forEach(function (q, i) { if (S.ck[i]) cornerMark(p, i, S.ck[i]); }); if (LAST > -1) squareOn(p, LAST);
      corners(p, function (i) { checkCorner(p, i); });
      svg.setAttribute('aria-label', 'Ben\'s square on a geoboard. Tick marks show 4 equal sides.');
      namesB.innerHTML = ''; cardsB.innerHTML = ''; var V = { yes: 'Yes, it is a rectangle', no: 'No, it is not a rectangle' };
      var line = el('div', 'tn-row'); line.appendChild(el('span', 'tn-lab', 'Is Ben\'s square a rectangle?'));
      var sl = el('span', 'tn-slot' + (S.v ? ' ok' : ''), S.v ? esc(V[S.v]) : 'drop a card here'); sl.tabIndex = 0; sl.setAttribute('role', 'button'); sl.setAttribute('aria-label', 'Box for the card');
      if (!S.v) tapK(sl, function () { if (SEL) vput(SEL); else bad('First pick a card, then tap this box.'); });
      line.appendChild(sl); namesB.appendChild(line);
      ['yes', 'no'].forEach(function (k) { var b = el('button', 'bm-chip an-card tn-card qd-card' + (SEL === k ? ' sel' : ''), esc(V[k])); b.type = 'button'; b.dataset.c = k; if (S.v) b.disabled = true;
        hdrag(b, function (t) { if (t && t.closest && t.closest('.tn-slot') && !S.v) vput(k); else bad('Drop the card right on the box.'); }, function () { SEL = SEL === k ? null : k; draw(); });
        cardsB.appendChild(b); });
      function vput(k) { SEL = null; if (!allCk(p)) { bad('Check all 4 corners with the set square first.'); draw(); return; }
        if (k === 'yes') { S.v = 'yes'; LAST = -1; save(); pluck(HZ.C5); draw(); flag(box, 'sorted'); msg('✓ Yes! It has 4 square corners, so it is a rectangle. Its 4 equal sides make it a square, too.', true); }
        else { bad('Look at the corners you checked: all 4 are square corners. A rectangle is any 4-sided shape with 4 square corners.'); draw(); } }
    }
    /* qsort (Mia) */
    var QS = [{ k: 'dart', yes: true, d: 'M20 110 L70 15 L120 110 L70 75 Z', why: 'It looks pointy, but count: 4 straight sides, 4 corners, no gaps. A dart shape is a quadrilateral.' },
              { k: 'curve', yes: false, d: 'M20 110 L20 25 L120 25 L120 110 Q70 70 20 110', why: 'One side is curved. A quadrilateral has 4 straight sides.' },
              { k: 'gap', yes: false, d: 'M30 110 L20 25 L120 25 L120 110 L55 110', why: 'The sides don\'t all meet: there is a gap. A quadrilateral is closed.' },
              { k: 'five', yes: false, d: 'M20 110 L20 50 L70 15 L120 50 L120 110 Z', why: 'Count the sides: there are 5. A quadrilateral has exactly 4.' }];
    function qsvg(o) { return '<svg viewBox="0 0 140 125" aria-hidden="true"><path d="' + o.d + '" fill="' + (/Z$/.test(o.d) ? 'rgba(47,111,222,.14)' : 'none') + '" stroke="#2F6FDE" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></svg>'; }
    function drawSort() {
      var tray = $('.qd-tray', box), area = $('.qd-area', box); tray.innerHTML = ''; area.innerHTML = '<div class="qd-groups"></div>'; var gb = $('.qd-groups', area);
      [['yes', 'Quadrilateral'], ['no', 'Not a quadrilateral']].forEach(function (g) {
        var d = el('div', 'tn-grp qd-grp', '<div class="tn-gh">' + g[1] + '</div><div class="tn-gin"></div>'); d.dataset.g = g[0]; d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', 'Group: ' + g[1]);
        QS.forEach(function (o, i) { if (S.g[i] === g[0]) $('.tn-gin', d).appendChild(el('div', 'tn-rt in', qsvg(o))); });
        tapK(d, function () { if (SEL != null) drop(SEL, g[0]); else bad('First pick a shape, then tap its group. Or drag the shape onto a group.'); });
        gb.appendChild(d);
      });
      QS.forEach(function (o, i) { if (S.g[i]) return; var b = el('button', 'tn-rt' + (SEL === i ? ' sel' : ''), qsvg(o)); b.type = 'button'; b.dataset.k = o.k; b.setAttribute('aria-label', { dart: 'A pointy dart shape.', curve: 'A shape with one curved side.', gap: 'A shape whose sides do not all meet.', five: 'A house shape with a pointed top.' }[o.k] + ' Drag it onto a group, or tap it and then tap a group.');
        hdrag(b, function (t) { var g = t && t.closest && t.closest('.qd-grp'); if (g) drop(i, g.dataset.g); else bad('Drop the shape right on one of the two groups.'); }, function () { SEL = SEL === i ? null : i; draw(); if (SEL != null) msg('Now tap the group where this shape goes.'); });
        tray.appendChild(b); });
      if (!tray.children.length) tray.appendChild(el('p', 'tn-done', '✓ All four shapes are sorted.'));
      function drop(i, g) { SEL = null; var o = QS[i], ok = (g === 'yes') === o.yes;
        if (ok) { S.g[i] = g; save(); pluck(HZ.C5); draw(); msg('✓ ' + o.why, true); if (Object.keys(S.g).length >= QS.length) { flag(box, 'sorted'); msg('✓ All sorted. Only the dart is a quadrilateral: 4 straight sides, closed. The others each break a rule.', true); } return; }
        bad(o.yes ? 'Look again. Count its sides and check for gaps or curves. ' + 'Does it break any rule?' : 'Look again. ' + o.why); draw(); }
      if (Object.keys(S.g).length >= QS.length) flag(box, 'sorted');
    }
    /* tree (Wow) */
    var TREE = ['quadrilateral', 'trapezoid', 'parallelogram', 'rectangle', 'rhombus', 'square'];
    var TP = { quadrilateral: 'M15 95 L55 20 L120 70 L60 70 Z', trapezoid: 'M15 95 L125 95 L95 30 L40 30 Z', parallelogram: 'M10 90 L95 90 L130 30 L45 30 Z', rectangle: 'M15 30 L125 30 L125 90 L15 90 Z', rhombus: 'M70 10 L120 60 L70 110 L20 60 Z', square: 'M30 15 L110 15 L110 95 L30 95 Z' };
    var TO = ['rhombus', 'quadrilateral', 'square', 'trapezoid', 'rectangle', 'parallelogram'];
    function tsvg(k) { return '<svg viewBox="0 0 140 120" aria-hidden="true"><path d="' + TP[k] + '" fill="rgba(107,70,193,.14)" stroke="#6B46C1" stroke-width="5" stroke-linejoin="round"/></svg>'; }
    function drawTree() {
      var tray = $('.qd-tray', box), area = $('.qd-area', box); tray.innerHTML = ''; var placed = Object.keys(S.at).length >= TREE.length;
      area.innerHTML = '<div class="qd-tree"><div class="qd-tr r1"></div><div class="qd-arr">↓</div><div class="qd-tr r2"></div><div class="qd-arr">↓</div><div class="qd-tr r3"></div><div class="qd-arr">↙ ↘</div><div class="qd-tr r4"></div><div class="qd-arr">↘ ↙</div><div class="qd-tr r5"></div></div>';
      var rows = { quadrilateral: 'r1', trapezoid: 'r2', parallelogram: 'r3', rectangle: 'r4', rhombus: 'r4', square: 'r5' };
      TREE.forEach(function (k) {
        var on = S.at[k], d = el('div', 'tn-grp qd-node' + (on ? ' ok' : '') + (S.tap[k] ? ' tap' : ''), '<div class="tn-gh">' + k + '</div><div class="tn-gin">' + (on ? '<div class="tn-rt in">' + tsvg(k) + '</div>' : '<span class="qd-ph">drop a shape</span>') + '</div>');
        d.dataset.k = k; d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', (placed ? 'Name: ' + k + (S.tap[k] ? ', fits the square' : '') : 'Spot on the tree: ' + k + (on ? ', filled' : '')));
        tapK(d, function () { if (placed) { if (!S.tap[k]) { S.tap[k] = 1; save(); pluck(HZ.C5 + Object.keys(S.tap).length * 30); draw(); var n = Object.keys(S.tap).length; msg(n >= TREE.length ? '✓ All 6 names fit the square! It is a quadrilateral, a trapezoid, a parallelogram, a rectangle, a rhombus and a square. That makes it the most special 4-sided shape.' : '✓ A square is a ' + k + ', too. ' + n + ' of 6 names. Are there more?', true); if (n >= TREE.length) flag(box, 'all'); } return; }
          if (SEL) drop(SEL, k); else bad('First pick a shape card, then tap its spot on the tree. Or drag the card onto the tree.'); });
        $('.' + rows[k], area).appendChild(d);
      });
      TO.forEach(function (k) { if (S.at[k]) return; var b = el('button', 'tn-rt qd-tc' + (SEL === k ? ' sel' : ''), tsvg(k)); b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-label', 'A shape card. Drag it to its spot on the family tree.');
        hdrag(b, function (t) { var g = t && t.closest && t.closest('.qd-node'); if (g) drop(k, g.dataset.k); else bad('Drop the card right on a spot on the tree.'); }, function () { SEL = SEL === k ? null : k; draw(); if (SEL) msg('Now tap the spot on the tree where this shape goes.'); });
        tray.appendChild(b); });
      if (!tray.children.length) tray.appendChild(el('p', 'tn-done', placed ? 'Now tap every name on the tree that fits a square.' : ''));
      function drop(k, spot) { SEL = null;
        if (S.at[spot]) { bad('That spot is already filled.'); draw(); return; }
        if (k === spot) { S.at[spot] = 1; save(); pluck(HZ.C5); draw(); msg('✓ ' + WHY[k] + (Object.keys(S.at).length >= TREE.length ? ' The tree is full!' : ''), true); if (Object.keys(S.at).length >= TREE.length) flag(box, 'placed'); return; }
        var hint = FAM[k].indexOf(spot) > -1 ? 'True, that shape is a ' + spot + '. But it belongs lower on the tree, where the name tells more.' : 'That shape is not a ' + spot + '. ' + WHY[spot];
        bad(hint + ' Check its sides and corners.'); draw(); }
      if (placed) flag(box, 'placed'); if (Object.keys(S.tap).length >= TREE.length) flag(box, 'all');
    }
    function after() {
      if (DO === 'check') { if (parDone(Q0)) flag(box, 'par'); if (allCk(Q0)) flag(box, 'checked'); if (S.nm) flag(box, 'named'); }
      if (DO === 'make' && S.k && !S.bad) { flag(box, 'made'); if (parDone(S.p) && S.pr.length) flag(box, 'par'); if (allCk(S.p)) flag(box, 'checked'); if (S.nm) flag(box, 'named'); }
      if (DO === 'isrect') { if (allCk(Q0)) flag(box, 'checked'); if (S.v) flag(box, 'sorted'); }
    }
    function draw() { sizeF(); if (svg) svg.innerHTML = ''; if (btns) btns.innerHTML = ''; if (chips) chips.innerHTML = ''; ({ reshape: drawReshape, check: drawCheck, make: drawMake, isrect: drawIsRect, qsort: drawSort, tree: drawTree }[DO] || drawCheck)(); }
    onWidth(box, draw); draw(); after();
  };

  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod]; if (f) try { f(b); } catch (e) { console.error('model', b.dataset.mod, e); } });
  $$('.sb-job').forEach(function (j) { if ($('.sb-steps', j)) $$('.sb-how', j).forEach(function (h) { h.hidden = true; }); });
  // instructions never sit under a tool: a job's step list goes right above its model
  $$('.sb-job').forEach(function (j) { var st = $('.sb-steps', j), m = $('[data-mod]', j); if (!st || !m || st.contains(m)) return; if (m.compareDocumentPosition(st) & Node.DOCUMENT_POSITION_FOLLOWING) m.parentNode.insertBefore(st, m); });
  $$('.sb-steps').forEach(stepsInit);

  /* payoffs: open when a job is done */
  function payoffs() { $$('.sb-payoff[data-after-job]').forEach(function (p) { p.classList.toggle('open', !!ST.jobs[p.dataset.afterJob]); }); $$('.sb-opti[data-after]').forEach(function (o) { if (ST.jobs[o.dataset.after]) { o.hidden = false; } }); }
  document.addEventListener('sb:job', payoffs);

  /* fact warm-up: answers save; a blank check doesn't score; fix and check again */
  $$('[data-fluency-check]').forEach(function (b) {
    b.addEventListener('click', function () { var box = b.closest('.fluency-box'), ins = $$('.fluency-input', box), right = 0, filled = 0; ins.forEach(function (i) { if (!i.value.trim()) { i.classList.remove('right', 'wrong'); return; } filled++; var ok = i.value.trim() === i.dataset.answer; i.classList.toggle('right', ok); i.classList.toggle('wrong', !ok); if (ok) right++; }); var fb = $('.sb-fb', box); fb.className = 'sb-fb ' + (right === ins.length ? 'ok' : 'no'); fb.textContent = !filled ? 'Type your answers first.' : right === ins.length ? '✓ All ' + right + ' right!' : right + ' of ' + ins.length + ' right. Fix the red ones and check again.'; ST.checks.fluency = right + '/' + ins.length; save(); });
  });

  /* simple groups outside steps (warm-up review, bonus) */
  $$('.sb-qgroup').forEach(function (g) { var b = $('.sb-btn.check', g); if (b) b.addEventListener('click', function () { var ok = checkGroup(g); if (ok && g.dataset.done) { ST.checks[g.dataset.done] = 1; save(); } }); if (g.dataset.done && ST.checks[g.dataset.done]) checkGroup(g, true); });

  /* checklist */
  $$('.sb-check li').forEach(function (li, i) { li.setAttribute('role', 'checkbox'); li.tabIndex = 0; var k = 'cl' + i; li.setAttribute('aria-checked', !!ST.checks[k]); li.querySelector('.bx').textContent = ST.checks[k] ? '✓' : '';
    function t() { ST.checks[k] = !ST.checks[k]; li.setAttribute('aria-checked', ST.checks[k]); li.querySelector('.bx').textContent = ST.checks[k] ? '✓' : ''; save(); } li.addEventListener('click', t); li.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); t(); } }); });

  /* journal: everything in one place */
  function gather() {
    var lines = [(D.title || 'Lesson') + ' · ' + (D.lesson || ''), ''];
    JOBS.forEach(function (j) {
      lines.push('JOB ' + j.dataset.job + ': ' + ($('h3', j) ? $('h3', j).textContent : '') + (ST.jobs[j.dataset.job] ? '  (done)' : ''));
      $$('.sb-q, .sb-write', j).forEach(function (q) {
        if (q.classList.contains('sb-write')) { lines.push('  ' + (q.dataset.label || 'Writing') + ': ' + (q.value.trim() || '(blank)')); return; }
        var t = q.cloneNode(true); $$('input', t).forEach(function (i, k) { var v = $$('input', q)[k].value.trim(); i.replaceWith(document.createTextNode('[' + (v || ' ') + ']')); }); $$('.sb-frac', t).forEach(function (f) { var ins = f.textContent.match(/\[[^\]]*\]/g) || []; f.replaceWith(document.createTextNode(ins.join('/'))); }); $$('button,.sb-fb', t).forEach(function (b) { b.remove(); });
        var s = t.textContent.replace(/\s+/g, ' ').trim(); if (s) lines.push('  ' + s);
      });
      lines.push('');
    });
    var fl = ST.checks.fluency; lines.unshift('Fact warm-up: ' + (fl || 'not checked')); return lines.join('\n');
  }
  var gO = $('#sb-journal-out');
  $$('[data-journal]').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.dataset.journal, txt = gather(); if (gO) gO.value = txt;
      if (a === 'copy') { (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { b.textContent = '✓ Copied'; setTimeout(function () { b.textContent = '📋 Copy'; }, 1800); }).catch(function () { if (gO) { gO.select(); try { document.execCommand('copy'); b.textContent = '✓ Copied'; } catch (e) {} } }); }
      if (a === 'download') { var bl = new Blob([txt], { type: 'text/plain' }), u = URL.createObjectURL(bl), l = document.createElement('a'); l.href = u; l.download = (D.key || 'math') + '-journal.txt'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }
      if (a === 'print') window.print();
    });
  });

  /* ── click cues + "How this works" (pilot feedback, Nov 2026) ──────────────
     Students weren't sure what to click. Three cues, the same on every lesson:
     1. a little hand inside every button (CSS: .sb-btn::after, .sb-tool::after) = "this is a button";
     2. a bouncing 👆 on the part of the tool the current step uses; it goes away on the first touch;
     3. "❓ How this works": the how-to video (shown only once the mp4 exists) + a Show-me-around tour.
     Canvas keeps the lesson in a tall iframe, so nothing here uses position:fixed (it would land at the
     bottom of the lesson); the hand, the tour ring and the bubble sit next to what they point at. */
  var HAND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2.6a1.5 1.5 0 0 1 3 0V10h.6V8.2a1.5 1.5 0 0 1 3 0V10h.6V9.2a1.5 1.5 0 0 1 3 0v1.5h.3a1.4 1.4 0 0 1 2.8 0V16c0 3.6-2.6 6-6 6h-1.6c-2.2 0-3.8-.9-5-2.7l-4.1-5.5a1.6 1.6 0 0 1 2.5-2L9 14.6V2.6z"/></svg>';
  var DRAGWORDS = /\b(drag|slide|move|pour|put)\b/i;
  function vis(n) { if (n.closest('.sb-hand')) return false; var r = n.getBoundingClientRect(); return r.width > 4 && r.height > 4 && !n.closest('[hidden]'); }
  function words(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  // where the hand goes: data-cue (a selector, or "text:Some words" to match a part's label), then a
  // "Press <button>" in the step, then the first thing to drag (drag/slide/move steps) or to tap
  function cueTarget(step, model) {
    var txt = ($('h4', step) ? $('h4', step).textContent + '. ' : '') + ($('p', step) ? $('p', step).textContent : step.textContent);
    var sel = step.dataset.cue, all = $$('[tabindex="0"], button, [role=slider], [role=button]', model).filter(vis);
    function byLabel(w) { w = words(w); return all.filter(function (n) { return words(n.getAttribute('aria-label') || n.textContent).indexOf(w) > -1; }); }
    if (sel) { var c = sel.indexOf('text:') === 0 ? byLabel(sel.slice(5)) : $$(sel, model).filter(vis); return c[0] || null; }
    var pm = txt.match(/\bPress\s+(?:the\s+)?(.+?)(?=\s+(?:next to|to|until|and|then|once|again)\b|[.,]|$)/i);
    if (pm) { var hits = byLabel(pm[1]).filter(function (n) { return n.matches('button, [role=button]'); }); if (hits.length) return /\bbottom\b/i.test(txt) ? hits[hits.length - 1] : hits[0]; }
    // "Tap the 5th tile in the top bar" → that tile
    var tm = txt.match(/\bTap the (\d+)(?:st|nd|rd|th)? tile in the (\w+)/i) || txt.match(/\bTap the (first) tile in the (\w+)/i);
    if (tm) { var k = tm[1].toLowerCase() === 'first' ? '1' : tm[1], t1 = byLabel(tm[2] + ' bar tile ' + k).concat(byLabel(tm[2] + ' tile ' + k)); if (t1.length) return t1[0]; }
    // a step that starts with a sound verb: the part to pluck / blow
    var vm = ($('p', step) ? $('p', step).textContent : txt).match(/^\s*(Pluck|Blow)\b/i);
    if (vm) { var v1 = byLabel(vm[1]); if (v1.length) return v1[0]; }
    // the thing the step names (never a single symbol or card: that would give away the answer)
    var NOUN = [[/\bsymbol\b/i, '.sym-cards'], [/\bcards?\b/i, '.ord-tray'], [/\bknob\b/i, '[aria-label^="End of"]'], [/\bdot\b/i, '.nl-dot'], [/\bbridges?\b/i, '.bridge'], [/\btick marks?\b/i, '.nl-tick.drag']];
    for (var q = 0; q < NOUN.length; q++) if (NOUN[q][0].test(txt)) { var nn = $$(NOUN[q][1], model).filter(vis); if (nn.length) return /\bbottom\b/i.test(txt) && nn.length > 1 ? nn[nn.length - 1] : nn[0]; }
    var list = DRAGWORDS.test(txt) ?
      ['[role=slider]', '.drag', '[data-src]', '[aria-label^="Add"]', '.sb-chipnum', '.sb-shape', '.sym-card', '.ord-card', '.pp-piece', '[tabindex="0"]', 'button'] :
      ['[role=button][tabindex="0"]', '.part', '.seg', '[tabindex="0"]', 'button'];
    if (DRAGWORDS.test(txt) && /\bbottom\b/i.test(txt)) { var sl = $$('[role=slider]', model).filter(vis); if (sl.length > 1) return sl.filter(function (n) { return /bottom|short|second|tenths|twelfths/i.test(n.getAttribute('aria-label') || ''); })[0] || sl[sl.length - 1]; }
    for (var i = 0; i < list.length; i++) { var hit = $$(list[i], model).filter(vis)[0]; if (hit) return hit; }
    return null;
  }
  function placeHand(h) {
    var m = h.parentNode, t = h._t; if (!m || !t || !t.isConnected) { h.hidden = true; return; }
    var mr = m.getBoundingClientRect(), r = t.getBoundingClientRect();
    if (!mr.width || !r.width) { h.hidden = true; return; }
    h.hidden = false; h.style.left = (r.left - mr.left + r.width / 2 - 6) + 'px'; h.style.top = (r.top - mr.top + r.height / 2) + 'px';
  }
  function cue(box) {
    var job = box.closest('.sb-job'); if (!job) return;
    $$('.sb-hand', job).forEach(function (h) { if (h._gone) h._gone(); else h.remove(); });
    var step = $('.sb-step.now:not(.right)', box); if (!step || !(step.dataset.need || step.dataset.cue)) return;
    var need = (step.dataset.need || '').split(' ').filter(Boolean);
    var model = $$('[data-for]', job).filter(function (x) { return x.dataset.for.split(' ').some(function (f) { return need.indexOf(f) > -1; }); })[0] || $('[data-mod]', job);
    if (!model) return;
    if (getComputedStyle(model).position === 'static') model.style.position = 'relative';
    var h = el('span', 'sb-hand' + (DRAGWORDS.test(step.textContent) ? ' drag' : ''), HAND);
    h.setAttribute('aria-hidden', 'true'); model.appendChild(h);
    function find() { if (!h.isConnected) return; h._t = cueTarget(step, model); placeHand(h); h.dataset.step = step.id; h.dataset.t = h._t ? (h._t.getAttribute('aria-label') || words(h._t.textContent) || h._t.getAttribute('class') || '') : ''; }
    requestAnimationFrame(find); setTimeout(find, 350);
    // the model may redraw for the new step (new bridges, new tiles): look again when it changes
    var mt = 0, mo = window.MutationObserver ? new MutationObserver(function (ms) { if (ms.every(function (m) { return m.target === h || h.contains(m.target) || [].slice.call(m.addedNodes).concat([].slice.call(m.removedNodes)).every(function (x) { return x === h; }); })) return; clearTimeout(mt); mt = setTimeout(find, 120); }) : null;
    if (mo) mo.observe(model, { childList: true, subtree: true });
    function gone() { h.remove(); if (mo) mo.disconnect(); model.removeEventListener('pointerdown', gone, true); model.removeEventListener('keydown', gone, true); }
    model.addEventListener('pointerdown', gone, true); model.addEventListener('keydown', gone, true);
    h._find = find; h._gone = gone;
  }
  SB.cue = cue;
  function recue() { $$('.sb-hand').forEach(function (h) { if (h._find) h._find(); }); }
  document.addEventListener('sb:tab', function () { requestAnimationFrame(recue); });
  document.addEventListener('sb:station', function () { requestAnimationFrame(recue); });
  window.addEventListener('resize', function () { requestAnimationFrame(recue); });
  window.addEventListener('load', recue);
  $$('.sb-steps').forEach(cue);

  /* ❓ How this works: a chip in the header opens a small panel (video when it exists + the tour) */
  (function howTo() {
    /* "Start here" drawer at the very top of every storybook lesson, right under the title, on every tab
       (Bethany, 10 Nov 2026): inside are the how-to video and 🧭 Show me around. It is open the first time a
       student comes to a storybook lesson; after they close it, it stays closed (this device) until they open it.
       The video spot shows only once the mp4 loads. */
    var head = $('.sb-head'); if (!head) return;
    var VID = D.howtoVideo === false ? '' : (D.howtoVideo || 'assets/video/g3math-howto.mp4');
    var dr = el('details', 'sb-start'); dr.id = 'sb-start';
    dr.innerHTML = '<summary><span class="ic">🧭</span><span class="tx"><b>Start here: How this lesson works</b><small>Watch Opti show you what to click (1 minute)</small></span><span class="go"></span></summary>' +
      '<div class="in"><div class="hv" hidden><video controls playsinline preload="metadata"></video></div>' +
      '<p class="ht" hidden>Take a quick tour. Opti shows you what to click.</p>' +
      '<div class="sb-row"><button type="button" class="sb-btn gold tour-go">🧭 Show me around</button><button type="button" class="sb-btn ghost close">Close and start the lesson</button></div></div>';
    head.parentNode.insertBefore(dr, head.nextSibling);
    var closed = false; try { closed = localStorage.getItem('g3sb-start-closed') === '1'; } catch (e) {}
    dr.open = !closed;
    var go = $('.go', dr); function paint() { go.textContent = dr.open ? 'Hide ▴' : 'Open ▾'; }
    paint();
    var v = $('video', dr), hv = $('.hv', dr), ht = $('.ht', dr);
    if (VID) { v.addEventListener('loadedmetadata', function () { hv.hidden = false; ht.hidden = true; }); v.addEventListener('error', function () { hv.hidden = true; ht.hidden = false; }); v.poster = VID.replace(/\.mp4$/, '.jpg'); v.src = VID; }
    else { ht.hidden = false; $('small', dr).textContent = 'Take a quick tour with Opti'; }
    dr.addEventListener('toggle', function () { paint(); if (!dr.open && !v.paused) v.pause(); try { localStorage.setItem('g3sb-start-closed', dr.open ? '0' : '1'); } catch (e) {} });
    v.addEventListener('play', function () { stopAllVoice(); });
    document.addEventListener('sb:tab', function () { if (!v.paused) v.pause(); });
    $('.tour-go', dr).addEventListener('click', function () { if (!v.paused) v.pause(); dr.open = false; tour(); });
    $('.close', dr).addEventListener('click', function () { dr.open = false; var p = $('.sb-panel.on'); toTop(); });
  })();

  /* the tour: a ring around one thing at a time, Opti's note right under it */
  function tour() {
    switchTab(TABS[0].dataset.tab, true);
    var P = $('.sb-panel.on') || document;
    function vis(sel) { return $$(sel, P).concat($$(sel)).filter(function (n) { var r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; })[0]; }
    var S = [
      ['.sb-tabs', 'Your lesson has 3 parts. Do them in order: <b>Warm-Up</b>, then <b>Lesson</b>, then <b>Show What You Know</b>.'],
      ['.sb-opti .ctl', 'Press <b>▶ Listen to Opti</b> to hear me read. Press <b>📄 Read along</b> to see the words.'],
      ['.sb-btn.check', 'See the little hand on this button? <b>A hand means you can press it.</b>'],
      ['.sb-term', 'A word with <b>dots under it</b> is a key word. Tap it to see what it means.'],
      ['.sb-step.now', 'The <b>gold box</b> tells you what to do now. Do one step at a time. The next step opens when you finish.'],
      ['.sb-hand', 'The <b>bouncing hand</b> shows you where to tap or drag first.'],
      ['.sb-job .sb-help', 'Stuck? Press <b>💡 Need a hint</b>. A friend from the Math Crew can give you a tip, too.'],
      ['.sb-next', 'Done with this part? Press <b>Next</b>. The page goes back to the top for you.'],
      ['.sb-prog', 'This bar fills up as you finish your jobs. You are ready. Let\'s go!']
    ].map(function (s) { return { n: vis(s[0]), t: s[1] }; }).filter(function (s) { return s.n; });
    // walk down the page in order (the progress bar, stuck at the top, goes last)
    var last = S.pop(); S.sort(function (a, b) { return a.n.compareDocumentPosition(b.n) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; }); S.push(last);
    if (!S.length) return;
    var ring = el('div', 'sb-ring'), tip = el('div', 'sb-tourtip'); ring.setAttribute('aria-hidden', 'true');
    tip.setAttribute('role', 'dialog'); tip.setAttribute('aria-label', 'Lesson tour');
    document.body.appendChild(ring); document.body.appendChild(tip);
    var i = 0, OWL2 = OWL;
    function go(k) {
      i = k; var s = S[i], n = s.n, pad = 8, stuck = /sticky|fixed/.test(getComputedStyle(n).position);
      // a sticky bar: bring its own place in the page to the middle (not where it is stuck right now)
      if (stuck) { var ps = n.style.position; n.style.position = 'relative'; n.scrollIntoView({ block: 'center', behavior: 'instant' }); n.style.position = ps; }
      else n.scrollIntoView({ block: 'center', behavior: 'instant' });
      var r = n.getBoundingClientRect(), y = r.top + window.scrollY, x = r.left + window.scrollX;
      ring.style.cssText = 'left:' + (x - pad) + 'px;top:' + (y - pad) + 'px;width:' + (r.width + pad * 2) + 'px;height:' + (r.height + pad * 2) + 'px';
      tip.innerHTML = '<img alt="" src="' + OWL2 + '"><div class="tx"><div class="nn">Opti · ' + (i + 1) + ' of ' + S.length + '</div><p>' + s.t + '</p>' +
        '<div class="sb-row">' + (i ? '<button type="button" class="sb-btn ghost sm bk">← Back</button>' : '') +
        '<button type="button" class="sb-btn sm nx">' + (i < S.length - 1 ? 'Next →' : '✓ Done') + '</button>' +
        '<button type="button" class="sb-btn ghost sm sk">' + (i < S.length - 1 ? 'Skip tour' : '') + '</button></div></div>';
      if (i === S.length - 1) $('.sk', tip).remove();
      var below = y + r.height + pad + 14, w = Math.min(420, document.documentElement.clientWidth - 24);
      tip.style.width = w + 'px';
      tip.style.left = Math.max(12, Math.min(x, document.documentElement.clientWidth - w - 12)) + 'px';
      tip.style.top = below + 'px';
      var th = tip.offsetHeight, docH = document.documentElement.scrollHeight;
      if (below + th > Math.min(docH, window.scrollY + innerHeight) && y - pad - 14 - th > 0) tip.style.top = (y - pad - 14 - th) + 'px';
      try { tip.scrollIntoView({ block: 'nearest', behavior: 'instant' }); } catch (e) {}
      $('.nx', tip).onclick = function () { if (i < S.length - 1) go(i + 1); else end(); };
      if ($('.bk', tip)) $('.bk', tip).onclick = function () { go(i - 1); };
      if ($('.sk', tip)) $('.sk', tip).onclick = end;
      $('.nx', tip).focus({ preventScroll: true });
    }
    function key(e) { if (e.key === 'Escape') end(); }
    function end() { ring.remove(); tip.remove(); document.removeEventListener('keydown', key); toTop(); }
    document.addEventListener('keydown', key);
    go(0);
  }
  SB.tour = tour;

  /* start */
  paintJobs(); payoffs();
  switchTab(ST.tab && $('#tab-' + ST.tab) ? ST.tab : (TABS[0] && TABS[0].dataset.tab), true);
  if (STATIONS.length) station(ST.st || 1);
  window.addEventListener('load', function () { if (location.hash === '#reset') { localStorage.removeItem(KEY); location.hash = ''; location.reload(); } });
})();
