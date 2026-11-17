# patch1107: 3.11.07 Word Problems. Run after patch1106 on sb.src.js, assets/storybook/sb.js and assets/storybook/sb.css.
#   python3 patch1107.py tools/storybook/sb.src.js assets/storybook/sb.js assets/storybook/sb.css
# 1. New model `bar` (bar model, the Bar Model tool's look): a whole bar split into parts, a brace on top for the whole.
#    data-whole "6 m 20 cm" (or "?"), data-parts "2 m 55 cm:255;1 m 70 cm:170;?:195" (label:size, size only sets the width),
#    data-name. Label chips sit in a tray (every label, shuffled by a fixed order). Drag a chip onto the brace or a part
#    (or tap a chip, then tap a spot). A chip on the wrong spot goes back to the tray with a reason. Flag `bar` when all are placed.
# 2. `weigh` dial: several items stand side by side on the platform; new item shapes `bucket` and `water`;
#    data-inorder makes the items go on in tray order; flag `all` when every item is on.
import sys
MARK = "  $$('[data-mod]').forEach(function (b) { var f = MODS[b.dataset.mod];"
MOD = r'''  /* ── bar (3.11.07 word problems): drag the labels onto a bar model. data-whole, data-parts "label:size;…". Flag: bar ── */
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

'''
W_OLD = "        itemsOn().forEach(function (it) { item(it, cx, py, s * 0.9, svg); });"
W_NEW = "        var ion = itemsOn(), iw = 104 * s * 0.9; ion.forEach(function (it, j) { item(it, cx + (j - (ion.length - 1) / 2) * iw, py, s * 0.9, svg); });"
B_OLD = "      } else if (it.n === 'box') {"
B_NEW = ("      } else if (it.n === 'bucket') {\n"
         "        NS('path', { d: 'M' + (x - w / 2) + ' ' + (y - h) + ' L' + (x + w / 2) + ' ' + (y - h) + ' L' + (x + w / 2 - 12) + ' ' + y + ' L' + (x - w / 2 + 12) + ' ' + y + ' Z', fill: '#C9CFDA', stroke: '#5B6478', 'stroke-width': 2.5 }, gg);\n"
         "        NS('path', { d: 'M' + (x - w / 2 + 6) + ' ' + (y - h) + ' Q' + x + ' ' + (y - h - 34 * s) + ' ' + (x + w / 2 - 6) + ' ' + (y - h), fill: 'none', stroke: '#5B6478', 'stroke-width': 3 }, gg);\n"
         "      } else if (it.n === 'water') {\n"
         "        NS('path', { d: 'M' + (x - w / 2 + 10) + ' ' + (y - h) + ' L' + (x + w / 2 - 10) + ' ' + (y - h) + ' L' + (x + w / 2 - 4) + ' ' + y + ' L' + (x - w / 2 + 4) + ' ' + y + ' Z', fill: '#F7FAFD', stroke: '#5B6478', 'stroke-width': 2.5 }, gg);\n"
         "        NS('rect', { x: x - w / 2 + 8, y: y - h * 0.78, width: w - 16, height: h * 0.78 - 2, fill: '#9CC8EE' }, gg);\n"
         "      } else if (it.n === 'box') {")
P_OLD = "      if (CMP && i === 1 && S.on.indexOf(0) < 0) { msg('Put ' + IT[0].l + ' on the left pan first.'); return; }"
P_NEW = P_OLD + "\n      if (box.dataset.inorder && i > 0 && S.on.indexOf(i - 1) < 0) { msg('Put the ' + IT[i - 1].l + ' on the scale first.'); return; }"
N_OLD = "        var need = !CMP || (i === 0 ? S.on.indexOf(0) < 0 : S.on.indexOf(0) > -1);"
N_NEW = "        var need = box.dataset.inorder ? (i === 0 || S.on.indexOf(i - 1) > -1) : !CMP || (i === 0 ? S.on.indexOf(0) < 0 : S.on.indexOf(0) > -1);"
M_OLD = "msg(itemsOn().length ? 'The ' + itemsOn()[0].l + (/s$/.test(itemsOn()[0].l) ? ' are' : ' is') + ' on the scale. Read the dial.'"
M_NEW = "msg(itemsOn().length ? (itemsOn().length > 1 ? 'The ' + itemsOn().map(function (x) { return x.l; }).join(' and the ') + ' are' : 'The ' + itemsOn()[0].l + (/s$/.test(itemsOn()[0].l) ? ' are' : ' is')) + ' on the scale. Read the dial.'"
F_OLD = "      if (K === 'dial' && IT.length && itemsOn().length) flag(box, 'on');"
F_NEW = F_OLD + "\n      if (K === 'dial' && IT.length && itemsOn().length === IT.length) flag(box, 'all');"
CSS = """
/* 3.11.07 bar model */
.sb-bm{padding:14px 10px}
.bm-wrap{max-width:640px;margin:0 auto}
.bm-top{display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:6px}
.bm-brace{display:block;width:100%;height:16px;border:3px solid #0E1C42;border-bottom:none;border-radius:12px 12px 0 0}
.bm-bar{display:flex;gap:3px;border:3px solid #0E1C42;border-radius:8px;padding:3px;background:#fff}
.bm-seg{min-height:58px;border-radius:5px;display:flex;align-items:center;justify-content:center;padding:4px;min-width:124px}
.bm-slot{min-width:96px;min-height:40px;padding:4px 10px;border:3px dashed #AEB6CC;border-radius:10px;background:#F6F7FB;display:flex;align-items:center;justify-content:center;font-weight:900;color:#0E1C42;font-size:17px;cursor:pointer;text-align:center}
.bm-seg .bm-slot{background:rgba(255,255,255,.92);min-width:84px}
.bm-slot small{font-size:12px;font-weight:800;color:#5B6478}
.bm-slot.open{border-color:#C9A227}
.bm-slot.full{border-style:solid;border-color:#1E7A4C;background:#fff;cursor:default}
.bm-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:14px}
.bm-chip{touch-action:none;user-select:none;cursor:grab;font-family:var(--sans);font-weight:900;font-size:17px;color:#0E1C42;background:#fff;border:2px solid #0E1C42;border-radius:12px;padding:8px 14px;box-shadow:0 3px 0 rgba(14,28,66,.25)}
.bm-chip.sel{background:#FFF4D6;border-color:#C9A227}
.bm-chip.dragging{position:relative;z-index:5}
@media (max-width:560px){.bm-seg{min-width:78px}.bm-seg .bm-slot{min-width:0}.bm-slot{min-width:64px;font-size:14px;padding:3px 5px}.bm-chip{font-size:15px;padding:6px 10px}}
"""
for p in sys.argv[1:]:
    if p.endswith('.css'):
        c = open(p).read()
        if '.sb-bm' in c: print(p, 'already patched'); continue
        open(p, 'w').write(c.rstrip('\n') + '\n' + CSS); print(p, 'patched'); continue
    s = open(p).read()
    if 'MODS.bar =' in s: print(p, 'already patched'); continue
    assert 'MODS.weigh' in s, p + ': run patch1106 first'
    for a in (MARK, W_OLD, B_OLD, P_OLD, N_OLD, F_OLD, M_OLD): assert s.count(a) == 1, (p, a[:60])
    s = s.replace(MARK, MOD + MARK).replace(W_OLD, W_NEW).replace(B_OLD, B_NEW).replace(P_OLD, P_NEW).replace(N_OLD, N_NEW).replace(F_OLD, F_NEW).replace(M_OLD, M_NEW)
    open(p, 'w').write(s); print(p, 'patched')
