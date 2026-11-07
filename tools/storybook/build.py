# Storybook build: python3 build.py 3.09.02   (or several lesson ids; default = all)
# Writes repo/<page>.html (links assets/storybook, cache-busted) and build/g3-storybook-preview-<id>.html (everything inline).
# Layout: R/src (this kit), R/repo (repo files: assets, images, audio), R/build (crew.json, cuewords-<id>.json).
import re, json, base64, hashlib, os, sys
R = '/home/claude/g3sb/'
crew = json.load(open(R + 'build/crew.json'))
js = open(R + 'src/sb.js').read().replace('__CREW__', json.dumps(crew))
os.makedirs(R + 'repo/assets/storybook', exist_ok=True)
open(R + 'repo/assets/storybook/sb.js', 'w').write(js)
css = open(R + 'repo/assets/storybook/sb.css').read()
ver = hashlib.md5((js + css).encode()).hexdigest()[:8]
TB = 'https://optimaondemand.github.io/optima-4th-math/manipulatives/tool.html?t='
def NL(a, b, parts, lab='ends'): return ('numberline', {"a": a, "b": b, "parts": parts, "mode": "frac", "lab": lab}, 'Number Line')
TOOLS = {
 'fbars-yt': ('fbars', {"bm": "build", "d": [4, 6, 8], "bt": [], "sh": {}}, 'Fraction Tiles', 'This might be a good time to try the Fraction Tiles. Fill the bar with equal tiles, then shade some.'),
 'fbars-3': ('fbars', {"bm": "build", "d": [3], "bt": [], "sh": {}}, 'Fraction Tiles', 'Try it with tiles: how many one-third tiles fill 1 whole?'),
 'fcircles-3': ('fcircles', {"c": 1, "n": 3}, 'Fraction Circles', 'Try a circle cut into 3 equal slices. Shade 1 slice.'),
 'fcircles': ('fcircles', {"c": 1, "n": 10}, 'Fraction Circles', 'Cut a circle into 10 equal slices. Take some away and name both parts.'),
 'whiteboard': ('whiteboard', None, 'Grid Whiteboard', 'Draw a board with 7 equal parts on the Grid Whiteboard. Shade 2 that are apart.'),
 'nl-5': NL(0, 1, 5) + ('Try the Number Line in fifths. Put a dot on every mark and say its name.',),
 'nl-7': NL(0, 1, 7) + ('Try the Number Line in sevenths. Put a dot 3 jumps from 0.',),
 'nl-10': NL(0, 1, 10) + ('Try the Number Line in tenths. Count the spaces between 0 and 1.',),
 'nl-9': NL(0, 1, 9, 'all') + ('Try the Number Line in ninths. Check each label by counting jumps from 0.',),
 'nl-20': NL(0, 2, 20) + ('Try the Number Line from 0 to 2 in tenths. Find 1 first, then count past it.',),
}
def enc(o): return base64.urlsafe_b64encode(json.dumps(o, separators=(',', ':')).encode()).decode().rstrip('=')
GL_BASE = [
  {"t": "fraction", "d": "A number that names equal parts of one whole, like one-third.", "key": True},
  {"t": "equal parts", "d": "Parts that are all the same size.", "key": True},
  {"t": "numerator", "d": "The top number of a fraction. It tells how many parts you are counting.", "key": True},
  {"t": "denominator", "d": "The bottom number of a fraction. It tells how many equal parts make the whole.", "key": True},
  {"t": "unit fraction", "d": "A fraction with 1 on top, like one-third. It names one equal part."},
  {"t": "bridge", "d": "A small wedge under a string. It holds the string up and cuts it into parts you can pluck."},
  {"t": "lyre", "d": "A string instrument from ancient Greece. You pluck its strings."}]
L = {
 '3.09.01': dict(page='math-lesson-3-09-01-fractions-of-a-whole.html', title='Fractions of a Whole', video='g3math-09-01-learn',
   glossary=GL_BASE[:4] + [
     {"t": "string", "d": "A thin cord pulled tight. When you pluck it, it shakes and makes a sound.", "key": True},
     {"t": "note", "d": "One musical sound. A note can be high or low.", "key": True},
     GL_BASE[4], {"t": "whole", "d": "All of something. All the equal parts together make 1 whole."}, GL_BASE[5], GL_BASE[6]]),
 '3.09.02': dict(page='math-lesson-3-09-02-fractions-on-a-number-line.html', title='Fractions on a Number Line', video='g3math-09-02-learn',
   glossary=[
     {"t": "number line", "d": "A straight line with numbers on it in order, equally spaced, like a ruler.", "key": True},
     {"t": "tick mark", "d": "A short line that crosses the number line. Tick marks cut the line into equal parts.", "key": True},
     {"t": "unit fraction", "d": "A fraction with 1 on top, like one-seventh. On a number line, it is one jump.", "key": True},
     GL_BASE[1],
     {"t": "zero", "d": "Where the number line starts. At 0 you have not jumped yet.", "key": True},
     {"t": "one whole", "alt": ["1 whole"], "d": "All the equal parts together. On the number line, 1 whole is the mark at 1.", "key": True},
     GL_BASE[0], GL_BASE[2], GL_BASE[3],
     {"t": "jump", "d": "One move from one tick mark to the next one."},
     GL_BASE[5]]),
}
def tool(m):
    t, st, name, tip = TOOLS[m.group(1)]
    url = TB + t + '&amp;st=1' + ('#s=' + enc(st) if st else '')
    return '<a class="sb-tool" href="%s" target="_blank" rel="noopener" title="%s">🧮 Try the %s ↗</a>' % (url, tip, name)
def num(a, lab='answer', h=''):
    return '<input class="sb-ans" data-a="%s" inputmode="numeric" autocomplete="off" aria-label="%s"%s>' % (a, lab, (' data-hint="' + h.replace('"', '&quot;') + '"') if h else '')
def tok(m):
    t = m.group(1); h = ''
    if '~' in t: t, h = t.split('~', 1)
    k, v = t.split(':', 1)
    if k == 'n': return num(v, 'number', h)
    if k == 'w': return '<input class="sb-ans word" data-a="%s" autocomplete="off" aria-label="word"%s>' % (v, (' data-hint="' + h.replace('"', '&quot;') + '"') if h else '')
    if k == 'fr':
        a, b = v.split(':'); return '<span class="sb-frac">' + num(a, 'top number', h) + '<i></i>' + num(b, 'bottom number', h) + '</span>'
def b64(p, mt): return 'data:%s;base64,%s' % (mt, base64.b64encode(open(p, 'rb').read()).decode())
def build(lid):
    c = L[lid]; slug = lid.replace('.', '-')
    html = open(R + 'src/lesson-%s.html' % slug).read()
    html = re.sub(r'\[\[(.*?)\]\]', tok, html)
    html = re.sub(r'\{\{TOOL:([^}]+)\}\}', tool, html)
    data = {"lesson": lid, "key": "g3sb-" + slug, "title": c['title'], "audioBase": "audio/storybook/", "imgBase": "images/storybook/",
            "music": "bach-cello-suite-1-prelude.mp3", "audioReady": True, "glossary": c['glossary'], "cueWords": {}}
    for cw in (R + 'build/cuewords-%s.json' % slug, R + 'build/cuewords.json' if lid == '3.09.01' else ''):
        if cw and os.path.exists(cw): data['cueWords'] = json.load(open(cw)); break
    html = html.replace('{{DATA}}', json.dumps(data))
    v = c['video']; mp4 = R + 'repo/assets/video/%s.mp4' % v
    LV = '<video controls preload="metadata" playsinline poster="assets/video/%s.jpg" src="assets/video/%s.mp4"></video>' % (v, v)
    for inline, path in ((False, R + 'repo/' + c['page']), (True, R + 'build/g3-storybook-preview-%s.html' % slug)):
        h = html.replace('{{LEARNVIDEO}}', LV)
        if inline:
            h = re.sub(r'\{\{IMG:([^}]+)\}\}', lambda m: b64(R + 'repo/images/storybook/' + m.group(1), 'image/png' if m.group(1).endswith('png') else 'image/jpeg'), h)
            for vf, mt in (('assets/video/%s.mp4' % v, 'video/mp4'), ('assets/video/%s.jpg' % v, 'image/jpeg')):
                if os.path.exists(R + 'repo/' + vf): h = h.replace(vf, b64(R + 'repo/' + vf, mt))
            h = h.replace('{{CSS}}', '<style>' + css + '</style>')
            aud = {}
            for root, _, fs in os.walk(R + 'repo/audio/storybook'):
                for f in fs:
                    rel = os.path.relpath(os.path.join(root, f), R + 'repo/audio/storybook')
                    if rel.startswith('g3m-3-') and not rel.startswith('g3m-' + slug): continue
                    aud[rel] = b64(os.path.join(root, f), 'audio/mpeg')
            h = h.replace('{{PRE}}', '<script>window.SB_IMG={"opti-owl.png":"%s"};window.SB_AUDIO=%s;</script>' % (b64(R + 'repo/images/storybook/opti-owl.png', 'image/png'), json.dumps(aud)))
            h = h.replace('{{JS}}', '<script>' + js + '</script>')
        else:
            h = re.sub(r'\{\{IMG:([^}]+)\}\}', lambda m: 'images/storybook/' + m.group(1), h)
            h = h.replace('{{CSS}}', '<link rel="stylesheet" href="assets/storybook/sb.css?v=%s">' % ver)
            h = h.replace('{{PRE}}', '').replace('{{JS}}', '<script src="assets/storybook/sb.js?v=%s"></script>' % ver)
        open(path, 'w').write(h); print(path, len(h) // 1024, 'KB')
for lid in (sys.argv[1:] or list(L)): build(lid)
