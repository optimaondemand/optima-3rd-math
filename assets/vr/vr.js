/* G3 Math VR · Field Trip engine (ported from the G3 science kit). No week words: everything comes from window.VR (built from week.json). */
(function () {
  var V = window.VR || {}, G = V.game || {}, PRE = V.pre || 'g3math-vr';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function load() { try { return JSON.parse(localStorage.getItem(PRE) || '{}'); } catch (e) { return {}; } }
  var st = load();
  st.steps = st.steps || []; st.g = st.g || { r: 0, s: 0, a: 0, b: 0, done: [] }; st.w = st.w || ['', ''];
  function save() { try { localStorage.setItem(PRE, JSON.stringify(st)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function words(s) { return (String(s).replace(/___/g, ' ').match(/[A-Za-z0-9’']+/g) || []).length; }

  /* details pill */
  var db = $('#wl-details-btn'), dd = $('#wl-details');
  if (db && dd) db.addEventListener('click', function () { var o = dd.classList.toggle('open'); db.setAttribute('aria-expanded', o); });

  /* audio */
  var audio = null, playing = null;
  $$('.vr-play').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = b.getAttribute('data-clip');
      if (audio) { audio.pause(); }
      $$('.vr-play').forEach(function (x) { x.classList.remove('on'); });
      if (playing === b) { playing = null; return; }
      audio = new Audio(V.clips[c]); playing = b; b.classList.add('on');
      audio.onended = function () { b.classList.remove('on'); playing = null; };
      audio.play().catch(function () { b.classList.remove('on'); });
    });
  });

  /* teacher video: shown only when the file exists */
  if (V.video && window.fetch) {
    fetch(V.video, { method: 'HEAD' }).then(function (r) {
      if (r.ok) { var w = $('#vr-video'); $('video', w).src = V.video; w.hidden = false; }
    }).catch(function () {});
  }

  /* path toggle */
  function showPath(id) {
    $$('.vr-path').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-path') === id); });
    $$('.vr-pane').forEach(function (p) { p.classList.toggle('on', p.id === id); });
    st.path = id; save();
  }
  $$('.vr-path').forEach(function (b) {
    b.addEventListener('click', function () {
      showPath(b.getAttribute('data-path'));
      var p = $('#' + b.getAttribute('data-path')); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  if (st.path) showPath(st.path);

  /* checklist */
  var steps = $$('.vr-step');
  function paintSteps() {
    var n = 0;
    steps.forEach(function (s, i) {
      var d = !!st.steps[i]; if (d) n++;
      s.classList.toggle('done', d);
      var b = $('.vr-chk', s); b.textContent = d ? '✓' : ''; b.setAttribute('aria-pressed', d);
    });
    var t = $('#vr-prog-t'), bar = $('#vr-prog-b');
    if (t) t.textContent = n + ' of ' + steps.length + ' steps done';
    if (bar) bar.style.width = (100 * n / steps.length) + '%';
    var sent = $('#vr-sent'); if (sent) sent.checked = !!st.sent;
    var bd = $('#vr-badge'); if (bd) bd.classList.toggle('on', n === steps.length && !!st.sent);
  }
  steps.forEach(function (s, i) {
    $('.vr-chk', s).addEventListener('click', function () { st.steps[i] = !st.steps[i]; save(); paintSteps(); });
  });
  var sent = $('#vr-sent');
  if (sent) sent.addEventListener('change', function () {
    st.sent = sent.checked;
    if (sent.checked) steps.forEach(function (s, i) { st.steps[i] = true; });
    save(); paintSteps();
  });
  paintSteps();

  /* help drawer: load the video and images only when opened */
  var help = $('#vr-help');
  if (help) help.addEventListener('toggle', function () {
    if (!help.open) return;
    var f = $('iframe[data-src]', help); if (f && !f.src) f.src = f.getAttribute('data-src');
  });

  /* ---------- Postcard Day: pie builder (game type "pies") ----------
     Each round: Step 1 build plate A, Step 2 build plate B, Step 3 put the sign between them.
     Tap a slice or drag it onto the plate; drag or tap a sign card into the slot. One step shows at a time. */
  var game = $('#vr-game'), R = G.rounds || [], NS = 'http://www.w3.org/2000/svg';
  function fname(n, d) { var w = (G.names || {})[d] || [d + 'th', d + 'ths']; return n + ' ' + (n === 1 ? w[0] : w[1]); }
  function wedge(cx, cy, r, a0, a1) {
    var x0 = cx + r * Math.sin(a0), y0 = cy - r * Math.cos(a0), x1 = cx + r * Math.sin(a1), y1 = cy - r * Math.cos(a1);
    return 'M' + cx + ' ' + cy + ' L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z';
  }
  function plateSVG(n, d, live) {
    var c = (G.colors || {})[d] || '#5B6478', h = '<svg viewBox="0 0 180 180" class="pg-svg" aria-hidden="true">' +
      '<circle cx="90" cy="90" r="86" fill="#fff" stroke="#d8d2e6" stroke-width="3"/><circle cx="90" cy="90" r="72" fill="#F7F5FC" stroke="#cfc8e0" stroke-dasharray="4 4"/>';
    for (var i = 0; i < d; i++) {
      var a0 = 2 * Math.PI * i / d, a1 = 2 * Math.PI * (i + 1) / d;
      if (i < n) h += '<path d="' + wedge(90, 90, 72, a0, a1) + '" fill="' + c + '" stroke="#fff" stroke-width="2"' + (live && i === n - 1 ? ' class="pg-new"' : '') + '/>';
      else h += '<line x1="90" y1="90" x2="' + (90 + 72 * Math.sin(a0)).toFixed(1) + '" y2="' + (90 - 72 * Math.cos(a0)).toFixed(1) + '" stroke="#e2dcef" stroke-width="1.5"/>';
    }
    return h + '</svg>';
  }
  function sliceSVG(d) {
    var c = (G.colors || {})[d] || '#5B6478';
    return '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="' + wedge(40, 62, 54, -Math.PI / d, Math.PI / d) + '" fill="' + c + '" stroke="#fff" stroke-width="2"/></svg>';
  }
  function frac(n, d) { return '<span class="pg-frac"><b>' + n + '</b><i></i><b>' + d + '</b></span>'; }
  function gameDone() { return st.g.r >= R.length; }
  function render() {
    var g = st.g;
    if (gameDone()) {
      game.innerHTML = '<div class="pg-sum">' + R.map(function (r) {
        return '<div class="pg-mini">' + plateSVG(r.a.n, r.a.d) + '<span class="pg-sign">' + esc(r.sign) + '</span>' + plateSVG(r.b.n, r.b.d) + '</div>';
      }).join('') + '</div><div class="vr-fb ok">' + esc(R.length + ' pairs of pies are done. Now write your postcard.') + '</div>';
      $('#vr-write').hidden = false; checkStamp(); return;
    }
    $('#vr-write').hidden = true;
    var r = R[g.r], stepNo = g.r * 3 + g.s + 1, total = R.length * 3, side = g.s === 0 ? 'a' : 'b', P = r[side];
    var instr = g.s < 2
      ? 'Put ' + fname(P.n, P.d) + ' on <b>Plate ' + (g.s === 0 ? 'A' : 'B') + '</b>.'
      : 'Which sign goes between the pies? Drag it into the box, or tap it.';
    var h = '<div class="vr-gstep">Step ' + stepNo + ' of ' + total + ' · ' + esc(r.title) + '</div>' +
      '<div class="pg-do">👉 ' + instr + '</div><div class="pg-table">' +
      '<div class="pg-plate' + (g.s === 0 ? ' live' : '') + '" data-side="a"><div class="pg-lab">Plate A</div>' + plateSVG(g.a, r.a.d, g.s === 0) + (g.s > 0 ? frac(r.a.n, r.a.d) : '') + '</div>' +
      '<div class="pg-slot' + (g.s === 2 ? ' live' : '') + '" id="pg-slot" aria-label="Sign box">' + (g.s === 2 ? '?' : '') + '</div>' +
      '<div class="pg-plate' + (g.s === 1 ? ' live' : '') + '" data-side="b"><div class="pg-lab">Plate B</div>' + plateSVG(g.s >= 1 ? g.b : 0, r.b.d, g.s === 1) + (g.s > 1 ? frac(r.b.n, r.b.d) : '') + '</div></div>';
    if (g.s < 2) {
      h += '<div class="pg-tray"><button type="button" class="pg-slice" id="pg-slice" aria-label="' + esc(G.piece) + ': one ' + esc(fname(1, P.d).replace(/^1 /, '')) + '">' + sliceSVG(P.d) +
        '<span>' + esc(G.piece) + '</span></button><button type="button" class="pg-undo" id="pg-undo">' + esc(G.undo) + '</button></div>';
    } else {
      h += '<div class="pg-tray">' + ['<', '>', '='].map(function (s) { return '<button type="button" class="pg-card" data-s="' + esc(s) + '" aria-label="' + esc(G.signWords[s]) + '">' + esc(s) + '</button>'; }).join('') + '</div>';
    }
    h += '<div class="vr-fb" id="vr-fb" aria-live="polite"></div>';
    game.innerHTML = h;
    var fb = $('#vr-fb');
    function say(cls, t) { fb.className = 'vr-fb ' + cls; fb.textContent = t; }
    if (g.s < 2) {
      var key = side, plate = $('.pg-plate.live', game);
      var add = function () {
        if (g[key] >= P.d) { say('no', 'The plate is full. That is a whole pie.'); return; }
        g[key]++; save(); paintPlate();
      };
      var paintPlate = function () {
        plate.querySelector('svg').outerHTML = plateSVG(g[key], P.d, true);
        var c = g[key];
        if (c === P.n) {
          say('ok', 'Plate ' + key.toUpperCase() + ' shows ' + fname(c, P.d) + '.');
          setTimeout(function () { if (g[key] === P.n && g.s === (key === 'a' ? 0 : 1)) { g.s++; save(); render(); } }, 900);
        } else if (c > P.n) say('no', 'That is ' + fname(c, P.d) + '. Take one off.');
        else say('', fname(c, P.d) + ' so far.');
      };
      $('#pg-slice').addEventListener('click', function (e) { if (!dragMoved) add(); });
      $('#pg-undo').addEventListener('click', function () { if (g[key] > 0) { g[key]--; save(); paintPlate(); } });
      plate.addEventListener('click', add);
      dragify($('#pg-slice'), function (x, y) { return hit(plate, x, y); }, add);
    } else {
      var slot = $('#pg-slot');
      var pick = function (s) {
        slot.textContent = s;
        var said = fname(r.a.n, r.a.d) + ' ' + G.signWords[s] + ' ' + fname(r.b.n, r.b.d) + '.';
        if (s === r.sign) {
          slot.classList.remove('no'); slot.classList.add('ok'); say('ok', said + ' ' + r.ok);
          g.done[g.r] = s; setTimeout(function () { g.r++; g.s = 0; g.a = 0; g.b = 0; save(); render(); }, 2600);
          $$('.pg-card', game).forEach(function (b) { b.disabled = true; });
        } else {
          slot.classList.remove('no'); void slot.offsetWidth; slot.classList.add('no');
          say('no', 'That says ' + said + ' ' + r.miss);
        }
      };
      $$('.pg-card', game).forEach(function (b) {
        b.addEventListener('click', function () { if (!dragMoved) pick(b.getAttribute('data-s')); });
        dragify(b, function (x, y) { return hit(slot, x, y); }, function () { pick(b.getAttribute('data-s')); });
      });
    }
  }
  function hit(el, x, y) { var r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
  var dragMoved = false;
  function dragify(el, over, drop) {
    el.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      var sx = e.clientX, sy = e.clientY, ghost = null; dragMoved = false;
      function mv(ev) {
        var dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!ghost && Math.abs(dx) + Math.abs(dy) > 8) {
          dragMoved = true; ghost = el.cloneNode(true); ghost.className += ' pg-ghost'; ghost.removeAttribute('id');
          document.body.appendChild(ghost);
        }
        if (ghost) { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; ev.preventDefault(); }
      }
      function up(ev) {
        document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up);
        if (ghost) { ghost.remove(); if (over(ev.clientX, ev.clientY)) drop(); setTimeout(function () { dragMoved = false; }, 0); }
      }
      document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
    });
  }
  /* writing */
  var tas = $$('#vr-write textarea');
  var last = tas[0];
  tas.forEach(function (t, i) {
    t.value = st.w[i] || '';
    t.addEventListener('focus', function () { last = t; });
    t.addEventListener('input', function () { st.w[i] = t.value; save(); count(); });
  });
  $$('#vr-write .vr-chips button').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = last || tas[0]; if (!t) return;
      t.value = (t.value && !/\s$/.test(t.value) ? t.value + ' ' : t.value) + b.textContent;
      t.dispatchEvent(new Event('input')); t.focus();
    });
  });
  function total() { return tas.reduce(function (a, t) { return a + words(t.value); }, 0); }
  function eachStarted() { return tas.every(function (t) { return words(t.value) >= 4; }); }
  function count() {
    var n = total(), c = $('#vr-count');
    if (c) { c.textContent = n >= G.min ? (eachStarted() ? n + ' words ✓' : n + ' words · finish both sentences') : n + ' of ' + G.min + ' words'; c.classList.toggle('ok', n >= G.min && eachStarted()); }
    checkStamp();
  }
  function studioDone() { return gameDone() && total() >= G.min && eachStarted(); }
  function checkStamp() { var s = $('#vr-stamp'); if (s) s.classList.toggle('on', studioDone()); }

  /* first name with a kind filter */
  var BAD = /(stupid|dumb|idiot|hate|kill|poop|butt|fart|ugly|loser|sex|damn|hell|crap|shit|fuck|bitch|ass\b)/i;
  var nm = $('#vr-name'), nmMsg = $('#vr-name-msg');
  if (nm) {
    nm.value = st.name || '';
    nm.addEventListener('input', function () {
      var v = nm.value.trim();
      if (BAD.test(v) || /[^A-Za-zÀ-ÿ' -]/.test(v)) { nmMsg.textContent = 'Please type just your first name.'; }
      else { nmMsg.textContent = ''; st.name = v; save(); }
    });
  }

  /* PDF */
  var pdf = $('#vr-pdf');
  if (pdf) pdf.addEventListener('click', function () {
    var name = (st.name || '').trim();
    if (!name) { nmMsg.textContent = 'Type your first name first.'; nm.focus(); return; }
    var rows = R.map(function (r, i) {
      var d = st.g.done[i];
      return '<tr><td>' + esc(r.title) + '</td><td>' + esc(fname(r.a.n, r.a.d)) + '</td><td>' + (d ? esc(d) : '<i>not done yet</i>') + '</td><td>' + esc(fname(r.b.n, r.b.d)) + '</td></tr>';
    }).join('');
    var sents = tas.map(function (t, i) { return '<p><b>' + esc(G.frames[i]) + '</b><br>' + (t.value ? esc(t.value) : '<i>(not written yet)</i>') + '</p>'; }).join('');
    var h = '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(V.canvas) + ' · ' + esc(name) + '</title><style>body{font:16px/1.5 Arial,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#222}h1{font-size:22px;margin:4px 0}.k{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6B46C1}table{border-collapse:collapse;width:100%}th{background:#4B2E9A;color:#fff;text-align:left;padding:5px 8px;font-size:13px}td{border:1px solid #ddd;padding:6px 8px}.st{display:inline-block;border:3px solid #1B4332;color:#1B4332;font-weight:900;letter-spacing:2px;padding:3px 12px;border-radius:8px;transform:rotate(-3deg);text-transform:uppercase}@media print{button{display:none}}</style></head><body>' +
      '<div class="k">Optima Academy Online · 3rd Grade Math · Week ' + V.week + '</div><h1>' + esc(V.canvas) + ' (Postcard Day)</h1>' +
      '<p><b>Name:</b> ' + esc(name) + ' &nbsp; <b>Date:</b> ' + new Date().toLocaleDateString() + '</p>' +
      '<h2>My pies</h2><table><tr><th>Pair</th><th>Plate A</th><th>Sign</th><th>Plate B</th></tr>' + rows + '</table>' +
      '<h2>My postcard (' + total() + ' words)</h2>' + sents + (studioDone() ? '<div class="st">' + esc(V.stamp) + '</div>' : '') +
      '<p style="margin-top:24px"><button onclick="print()">🖨 Print or save as PDF</button></p></body></html>';
    var w = null; try { w = window.open('', '_blank'); } catch (e) {}
    if (w && w.document) { w.document.open(); w.document.write(h); w.document.close(); setTimeout(function () { try { w.print(); } catch (e) {} }, 400); }
    else {
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([h], { type: 'text/html' }));
      a.download = 'week-' + V.week + '-vr-postcard-' + name.replace(/\s+/g, '-') + '.html'; document.body.appendChild(a); a.click(); a.remove();
    }
  });

  if (game) render();
  count();
  window.VR_TEST = { state: st, render: render, fname: fname };
})();
