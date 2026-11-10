/* ═══════════════════════════════════════════════════════════════
   OAO Grade 3 Math · Storybook layer engine (sb-)   v1 (Nov 2026)
   Shared by every G3 storybook lesson. Lesson content lives in the page;
   lesson settings in <script type="application/json" id="sb-data">.
   - tabs (Warm-Up · Lesson · Show What You Know), Lesson = 3 stations
   - jobs + progress (jobs finished, never tabs visited)
   - one step at a time (gated), answer checks with mistake hints, hint ladders
   - Opti: voice + read-along; key-word glossary tooltips with a voiced word
   - string sound (plucked, made in the page), music switch, listening corner
   - models: mono (Pythagoras' string), mono2, tiles, labelfix, sort, gather, circle, rect, strip, nl (number line), cmp (two wholes, same parts), sym (< > =), order (least to greatest, a tune)
   - saving (this device), journal (gather / copy / download / print), checklist
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var D = {}; try { D = JSON.parse(document.getElementById('sb-data').textContent); } catch (e) {}
  var KEY = D.key || 'g3sb', AUD = D.audioBase || 'audio/storybook/', IMG = D.imgBase || 'images/storybook/';
  var CREW = __CREW__;
  var CREWC = { atlas: '#1F8FB4', felix: '#1E8C5A', hazel: '#9A7A00', cora: '#C2601F' };
  var DCOL = { 1: '#0E1C42', 2: '#6B46C1', 3: '#B05E09', 4: '#8A6A00', 5: '#4E7A1A', 6: '#2F6FDE', 7: '#B03A2E', 8: '#A23B8C', 9: '#2E7D6B', 10: '#117E7E', 11: '#8C2F6E', 12: '#5B6478' };
  var DNAME = { 2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth', 11: 'eleventh', 12: 'twelfth' };
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
  function stopAllVoice() { VOICES.forEach(function (a) { if (!a.paused) a.pause(); }); if (clipA && !clipA.paused) { clipA.pause(); if (clipBtn) clipBtn.classList.remove('on'); } if (window.speechSynthesis) speechSynthesis.cancel(); }
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

  /* ── header extras: standards popover, read aloud, motion ─── */
  $$('[data-pop]').forEach(function (b) { var p = $(b.dataset.pop); b.addEventListener('click', function () { var o = !p.classList.contains('open'); p.classList.toggle('open', o); b.setAttribute('aria-expanded', o); }); });
  var mot = $('#sb-motion'); if (mot) { if (ST.still) document.documentElement.classList.add('sb-still'); mot.setAttribute('aria-pressed', !ST.still); mot.textContent = ST.still ? '✨ Motion: off' : '✨ Motion: on'; mot.addEventListener('click', function () { ST.still = !ST.still; save(); document.documentElement.classList.toggle('sb-still', ST.still); mot.setAttribute('aria-pressed', !ST.still); mot.textContent = ST.still ? '✨ Motion: off' : '✨ Motion: on'; }); }
  var rd = $('#sb-read');
  if (rd) rd.addEventListener('click', function () {
    if (!window.speechSynthesis) return; if (speechSynthesis.speaking) { speechSynthesis.cancel(); rd.textContent = '🔊 Read aloud'; return; }
    var p = $('.sb-panel.on'), st = p && $('.sb-station.on', p), root = st || p; if (!root) return;
    var txt = $$('.sb-story, .sb-ctx p, .sb-step.open h4, .sb-step.open p, .sb-card > p', root).filter(function (x) { return x.offsetParent; }).map(function (x) { return x.textContent; }).join(' ');
    var u = new SpeechSynthesisUtterance(txt); u.rate = 0.92; u.onend = function () { rd.textContent = '🔊 Read aloud'; }; speechSynthesis.speak(u); rd.textContent = '■ Stop reading';
  });

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
      else { flag(box, 'sym', false); out.innerHTML = 'That says: ' + sent + ' ' + (v === '=' ? 'Equal means the same amount. These are not the same.' : ans === '=' ? 'These two are the same amount.' : 'The open side must face the greater fraction.'); }
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
      if (S.ok[0] && S.ok[1]) { var big = NN[0] < NN[1] ? 0 : 1; flag(box, 'dots'); msg('A one-' + DNAME[NN[big]] + ' jump is longer than a one-' + DNAME[NN[1 - big]] + ' jump. ' + KK[0] + ' long jumps go farther than ' + KK[0] + ' short jumps.', true); return; }
      var c = r == null ? -1 : r;
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
        msg(S.heard[S.n[0]] ? 'You heard one-' + DNAME[S.n[0]] + '. ' + (S.n[0] < to ? 'Now cut one more piece.' : '') : 'The pipe is cut into ' + S.n[0] + ' equal pieces.');
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
  function cueTarget(step, model) {
    var sel = step.dataset.cue;
    if (sel) return $(sel, model);
    var list = DRAGWORDS.test(step.textContent) ?
      ['[role=slider]', '.drag', '[data-src]', '[aria-label^="Add"]', '.sb-chipnum', '.sb-shape', '.sym-card', '.ord-card', '.pp-piece', '[tabindex="0"]', 'button'] :
      ['[role=button][tabindex="0"]', '.part', '.seg', '[tabindex="0"]', 'button'];
    for (var i = 0; i < list.length; i++) {
      var hit = $$(list[i], model).filter(function (n) { var r = n.getBoundingClientRect(); return r.width > 4 && r.height > 4 && !n.closest('[hidden]'); })[0];
      if (hit) return hit;
    }
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
    $$('.sb-hand', job).forEach(function (h) { h.remove(); });
    var step = $('.sb-step.now:not(.right)', box); if (!step || !(step.dataset.need || step.dataset.cue)) return;
    var need = (step.dataset.need || '').split(' ').filter(Boolean);
    var model = $$('[data-for]', job).filter(function (x) { return x.dataset.for.split(' ').some(function (f) { return need.indexOf(f) > -1; }); })[0] || $('[data-mod]', job);
    if (!model) return;
    if (getComputedStyle(model).position === 'static') model.style.position = 'relative';
    var h = el('span', 'sb-hand' + (DRAGWORDS.test(step.textContent) ? ' drag' : ''), HAND);
    h.setAttribute('aria-hidden', 'true'); model.appendChild(h);
    function find() { h._t = cueTarget(step, model); placeHand(h); }
    requestAnimationFrame(find);
    function gone() { h.remove(); model.removeEventListener('pointerdown', gone, true); model.removeEventListener('keydown', gone, true); }
    model.addEventListener('pointerdown', gone, true); model.addEventListener('keydown', gone, true);
    h._find = find;
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
    /* The how-to video sits at the very top of the Warm-Up on every storybook lesson (Bethany, 10 Nov 2026),
       with Show me around under it. It shows only once the mp4 loads (no empty video spot). The ❓ chip in the
       header brings any student back to it from any tab. */
    var chips = $('.sb-chips'), first = $('.sb-panel'); if (!chips || !first) return;
    var VID = D.howtoVideo === false ? '' : (D.howtoVideo || 'assets/video/g3math-howto.mp4');
    var card = el('div', 'sb-card sb-howcard');
    card.innerHTML = '<span class="sb-k">Start here</span><h3>How this lesson works</h3>' +
      '<p class="ht">Watch Opti show you what to click. It takes about 1 minute.</p>' +
      '<div class="hv" hidden><video controls playsinline preload="metadata"></video></div>' +
      '<div class="sb-row"><button type="button" class="sb-btn gold sm tour-go">🧭 Show me around</button></div>';
    first.insertBefore(card, first.firstChild);
    var v = $('video', card), hv = $('.hv', card);
    if (VID) { v.addEventListener('loadedmetadata', function () { hv.hidden = false; }); v.addEventListener('error', function () { hv.hidden = true; $('.ht', card).textContent = 'Take a quick tour. Opti shows you what to click.'; }); v.poster = VID.replace(/\.mp4$/, '.jpg'); v.src = VID; }
    else $('.ht', card).textContent = 'Take a quick tour. Opti shows you what to click.';
    v.addEventListener('play', function () { stopAllVoice(); });
    document.addEventListener('sb:tab', function () { if (!v.paused) v.pause(); });
    $('.tour-go', card).addEventListener('click', function () { if (!v.paused) v.pause(); tour(); });
    var chip = el('button', 'sb-chip sb-howchip', '❓ How this works'); chip.type = 'button';
    chips.appendChild(chip);
    chip.addEventListener('click', function () { switchTab(TABS[0].dataset.tab, true); toTop(card); card.classList.add('sb-cue'); setTimeout(function () { card.classList.remove('sb-cue'); }, 1600); });
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
