# 3.10.04 layer change: new `recut` model (two tile bars with different denominators; cut one bar's pieces
# into n to make a common denominator; optional two-voice Play for the Duet). Run on the ORIGINAL files:
#   python tools/storybook/patch1004.py tools/storybook/sb.src.js assets/storybook/sb.js
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── recut: two tile bars with different denominators (one measure, two parts). Cut every piece of one bar
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

'''
for p in sys.argv[1:]:
    s = open(p).read()
    if 'MODS.recut' in s: print(p, 'already patched'); continue
    assert s.count(MARK) == 1, p
    s = s.replace(MARK, MOD + MARK)
    open(p, 'w').write(s); print(p, 'patched')
