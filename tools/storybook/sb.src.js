/* ═══════════════════════════════════════════════════════════════
   OAO Grade 3 Math · Storybook layer engine (sb-)   v1 (Nov 2026)
   Shared by every G3 storybook lesson. Lesson content lives in the page;
   lesson settings in <script type="application/json" id="sb-data">.
   - tabs (Warm-Up · Lesson · Show What You Know), Lesson = 3 stations
   - jobs + progress (jobs finished, never tabs visited)
   - one step at a time (gated), answer checks with mistake hints, hint ladders
   - Opti: voice + read-along; key-word glossary tooltips with a voiced word
   - string sound (plucked, made in the page), music switch, listening corner
   - models: mono (Pythagoras' string), mono2, tiles, labelfix, sort, gather, circle, rect, strip
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
  function switchTab(id, noScroll) {
    TABS.forEach(function (t) { var on = t.dataset.tab === id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $$('.sb-panel').forEach(function (p) { p.classList.toggle('on', p.id === 'tab-' + id); });
    ST.tab = id; save(); stopAllVoice(); paintTop();
    if (!noScroll) { var pan = $('#tab-' + id); if (pan) window.scrollTo({ top: Math.max(0, pan.getBoundingClientRect().top + window.scrollY - stickyH()), behavior: 'instant' }); }
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
    if (scroll) { var path = $('.sb-path'); if (path) window.scrollTo({ top: Math.max(0, path.getBoundingClientRect().top + window.scrollY - stickyH()), behavior: 'instant' }); }
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
    var steps = $$('.sb-step', box), open = true;
    steps.forEach(function (s, i) {
      var done = !!ST.steps[s.id];
      s.classList.toggle('open', open); s.classList.toggle('right', done);
      $$('.sb-dots i', s).forEach(function (d, k) { d.className = k < i ? 'd' : k === i ? 'on' : ''; });
      if (done && $$('.sb-ans', s).length) $$('.sb-ans', s).forEach(function (a) { if (isRight(a)) a.classList.add('right'); });
      open = open && done;
    });
    var job = box.closest('.sb-job');
    if (job && steps.length && steps.every(function (s) { return ST.steps[s.id]; })) jobDone(job.dataset.job);
    var lk = $('.sb-locked', box); if (lk) { var left = steps.filter(function (s) { return !ST.steps[s.id]; }).length; lk.textContent = left ? left + (left > 1 ? ' steps' : ' step') + ' to go. Each step opens when the one before is done.' : ''; }
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
    var a = new Audio(src(D.music || 'music.mp3')); a.preload = 'none';
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
    function phase() { showBridges = stepDoneFor(box, 'whole'); allB.hidden = !showBridges; draw(); if (showBridges && stepDoneFor(box, 'equal')) { msg.className = 'sb-mono-msg ok'; msg.textContent = 'All ' + n + ' parts are the same length. They sing the same note.'; } else if (showBridges) msg.textContent = 'Slide the two bridges. Then pluck each part and listen.'; else msg.textContent = 'Tap the string to pluck it.'; }
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
      if (!S.bt.length) msg('The bar is empty. Drag tiles from the tray to cover it.');
      else if (full && same && S.bt[0] === d) { msg('<span style="color:#1E7A4C">The bar is full: <b>' + S.bt.length + '</b> equal tiles make 1 whole.</span>'); flag(box, 'full'); }
      else if (full && !same) msg('The bar is full, but the tiles are <b>not all the same size</b>. A fraction needs equal parts. Drag the odd tiles back down.');
      else if (full) msg('The bar is full with <b>' + S.bt.length + '</b> equal tiles. But look at the string: it has ' + d + ' equal parts. Drag these back and try the other tiles.');
      else if (!same) msg('These tiles are not all the same size. Use just one kind of tile.');
      else msg('<b>' + S.bt.length + '</b> tile' + (S.bt.length === 1 ? '' : 's') + ' on the bar. Keep going until the bar is as long as 1 whole.');
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

  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod]; if (f) try { f(b); } catch (e) { console.error('model', b.dataset.mod, e); } });
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

  /* start */
  paintJobs(); payoffs();
  switchTab(ST.tab && $('#tab-' + ST.tab) ? ST.tab : (TABS[0] && TABS[0].dataset.tab), true);
  if (STATIONS.length) station(ST.st || 1);
  window.addEventListener('load', function () { if (location.hash === '#reset') { localStorage.removeItem(KEY); location.hash = ''; location.reload(); } });
})();
