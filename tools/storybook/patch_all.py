# patch_all.py — run from optima-3rd-math repo root on Bethany's computer:
#   python3 -I tools/storybook/patch_all.py
# 1) splice MODS.area into tools/storybook/sb.src.js (before MODS.quad)
# 2) append the area CSS to assets/storybook/sb.css
# 3) register 3.13.01 + the area-grid tool in tools/storybook/build.py
import io, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
def rd(p): return io.open(p, encoding='utf-8').read()
def wr(p, s): io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

# ---- 1. model into sb.src.js ----
SRC = os.path.join(HERE, 'sb.src.js')
s = rd(SRC)
model = rd(os.path.join(HERE, 'area-model.js'))
if 'MODS.area =' in s:
    print('sb.src.js: MODS.area already present, skipping')
else:
    anchor = '  MODS.quad = function (box) {'
    assert anchor in s, 'MODS.quad anchor not found in sb.src.js'
    s = s.replace(anchor, model.rstrip('\n') + '\n\n' + anchor, 1)
    wr(SRC, s)
    print('sb.src.js: MODS.area spliced in (%d bytes)' % len(s))

# ---- 2. CSS ----
CSSP = os.path.join(HERE, '..', '..', 'assets', 'storybook', 'sb.css')
css = rd(CSSP)
ADD = """
/* area model (3.13.01): mosaic tiles, count, half tiles, build */
.sb-area svg{max-width:100%;height:auto}
.ar-cell{cursor:pointer}
.ar-cell:focus{outline:none}
.ar-cell:focus-visible rect,.ar-cell:focus-visible polygon{stroke:#2563EB;stroke-width:3.5}
.ar-tray{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:8px;justify-content:center}
.ar-tray[hidden]{display:none}
.ar-tlab{font-weight:800;color:#5B6478}
.ar-tile-src{width:40px;height:40px;border:none;border-radius:6px;background:#C0632F;color:#fff;font-size:20px;line-height:1;cursor:grab;box-shadow:0 2px 0 #7C3A16;touch-action:none}
.ar-tile-src:active{cursor:grabbing}
.ar-tile-src.dragging{opacity:.85}
"""
if '.ar-cell{' in css:
    print('sb.css: area CSS already present, skipping')
else:
    wr(CSSP, css.rstrip('\n') + '\n' + ADD)
    print('sb.css: area CSS appended')

# ---- 3. build.py: tool + lesson entry ----
BP = os.path.join(HERE, 'build.py')
b = rd(BP)
TOOL = (" 'area-grid': ('tiles', {}, 'Color Tiles & Area Grid', "
        "'Lay square tiles to cover a shape and count them to find the area. Walk the edges to find the perimeter.'),\n")
ENTRY = '''  '3.13.01': dict(page='math-lesson-3-13-01-area.html', title='Area', video='g3math-13-01-learn', music='bach-goldberg-aria.mp3',
   glossary=[
     {"t": "area", "d": "How much flat space a shape covers. We measure it in square units.", "key": True},
     {"t": "square unit", "alt": ["square units"], "d": "One square that covers a shape. Count the square units to find the area.", "key": True},
     {"t": "row", "alt": ["rows"], "d": "A line of squares that goes across, left to right.", "key": True},
     {"t": "column", "alt": ["columns"], "d": "A line of squares that goes up and down.", "key": True},
     {"t": "half square", "alt": ["half squares", "half tile", "half tiles"], "d": "A square cut along a slant into two triangles. Two half tiles make one whole square unit.", "key": True},
     {"t": "cover", "alt": ["covered", "covering"], "d": "To fill a shape with tiles so no part is left bare."},
     {"t": "gap", "alt": ["gaps"], "d": "A bare space left between tiles. Gaps make the count too small."},
     {"t": "overlap", "alt": ["overlaps", "overlapping"], "d": "When one tile sits on top of another. Overlaps count the same space twice."},
     {"t": "tessera", "alt": ["tesserae"], "d": "A tiny square tile the Romans used to build a floor."},
     {"t": "mosaic", "alt": ["mosaics"], "d": "A picture or floor made of many little tiles set side by side."},
     {"t": "slanted edge", "alt": ["slanted"], "d": "An edge that is not straight across or straight up and down, but on a slant."},
     {"t": "estimate", "d": "A smart guess about how many, made before you count."}]),
'''
if "'3.13.01': dict(" in b:
    print('build.py: 3.13.01 already present, skipping')
else:
    assert " 'setsquare': (" in b, 'setsquare tool anchor missing'
    assert "  '3.12.06': dict(" in b, '3.12.06 lesson anchor missing'
    b = b.replace(" 'setsquare': (", TOOL + " 'setsquare': (", 1)
    b = b.replace("  '3.12.06': dict(", ENTRY + "  '3.12.06': dict(", 1)
    wr(BP, b)
    print('build.py: area-grid tool + 3.13.01 entry added')
print('DONE')
