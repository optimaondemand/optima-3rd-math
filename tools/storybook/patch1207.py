# patch1207: add the 3.12.07 model layer (MODS.symm: fold, mirror, compass, euclid) + its CSS.
# Run once on her computer, from the repo root:
#   python3 tools/storybook/patch1207.py tools/storybook/sb.src.js assets/storybook/sb.css
# (and the same JS patch is applied to assets/storybook/sb.js by build.py, which rewrites it).
# MODS.sym is already the <, > and = model, so this layer is MODS.symm.
import sys, os

JS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'symm.js')).read()

CSS = """
.sb-quad svg .sf-line,.sb-quad svg .sf-x,.sb-quad svg .sf-pen{cursor:pointer}
.sb-quad svg .sf-line:focus-visible,.sb-quad svg .sf-x:focus-visible,.sb-quad svg .sf-pen:focus-visible{outline:3px solid #C9A227;outline-offset:2px}
.sb-quad svg .sf-x:not(.done) circle+circle{animation:anPulse 1.6s ease-in-out infinite}
.sb-quad .qd-chips .tr-res.no{border-color:#B23A2E;color:#B23A2E;background:#FBE7E4}
"""

def do_js(p):
    s = open(p, encoding='utf-8').read()
    if 'MODS.symm = function' in s:
        print('js: already'); return
    assert '  MODS.quad = function (box) {' in s, 'anchor MODS.quad not found'
    s = s.replace('  MODS.quad = function (box) {', JS.rstrip('\n') + '\n\n  MODS.quad = function (box) {', 1)
    open(p, 'w', encoding='utf-8').write(s); print('js: ok')

def do_css(p):
    s = open(p, encoding='utf-8').read()
    if '.sf-line' in s:
        print('css: already'); return
    assert '.sb-quad .qd-chips .tr-res.yes' in s, 'anchor .tr-res.yes not found'
    s = s.rstrip('\n') + '\n' + CSS.strip('\n') + '\n'
    open(p, 'w', encoding='utf-8').write(s); print('css: ok')

if __name__ == '__main__':
    do_js(sys.argv[1]); do_css(sys.argv[2])
