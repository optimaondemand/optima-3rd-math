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
 'fbars-9': ('fbars', {"d": [9], "lab": 1}, 'Fraction Tiles', 'Try two bars of ninths. Shade 3 tiles in one and 6 in the other. Which is more?'),
 'fbars-12': ('fbars', {"d": [12], "lab": 1}, 'Fraction Tiles', 'Try two bars of twelfths. Shade a different number of tiles in each. The bar with more shaded tiles is greater.'),
 'fbars-11': ('fbars', {"d": [11], "lab": 1}, 'Fraction Tiles', 'Try two bars of elevenths. Shade 2 tiles in one and 6 in the other. Say it with greater than.'),
 'fbars-10': ('fbars', {"d": [10], "lab": 1}, 'Fraction Tiles', 'Try two bars of tenths. Both bars are the same whole, so every tenth is the same size.'),
 'nl-10o': NL(0, 1, 10) + ('Try the Number Line in tenths. Put dots on three fractions. The dot farthest left is the least.',),
 'nl-10c': NL(0, 1, 10) + ('Try the Number Line in tenths. Put dots on two fractions. The one farther right is greater.',),
 'fbars-9-12': ('fbars', {"d": [9, 12], "lab": 1}, 'Fraction Tiles', 'Try a bar of ninths and a bar of twelfths. Shade the same number of tiles in each. Which bar shows more?'),
 'fbars-9-11': ('fbars', {"d": [9, 11], "lab": 1}, 'Fraction Tiles', 'Try a bar of ninths and a bar of elevenths. Shade 1 tile in each. Which tile is bigger?'),
 'fbars-5-10': ('fbars', {"d": [5, 10], "lab": 1}, 'Fraction Tiles', 'Try a bar of fifths and a bar of tenths. Shade the same number of tiles in each. Are they equal?'),
 'fbars-9-11-12': ('fbars', {"d": [9, 11, 12], "lab": 1}, 'Fraction Tiles', 'Try bars of ninths, elevenths and twelfths. Shade 1 tile in each and line them up from smallest to biggest.'),
 'fbars-3-12': ('fbars', {"d": [3, 12], "lab": 1}, 'Fraction Tiles', 'Try a bar of thirds and a bar of twelfths. Shade 2 thirds. How many twelfths reach the same place?'),
 'nl-12': NL(0, 1, 12) + ('Try the Number Line in twelfths. Count by twos: every 2 twelfths make 1 sixth.',),
 'fbars-7-12': ('fbars', {"d": [7, 12], "lab": 1}, 'Fraction Tiles', 'Try a bar of sevenths and a bar of twelfths. Shade the same number of tiles in each. Which reaches farther?'),
 'fbars-4-8-12': ('fbars', {"d": [4, 8, 12], "lab": 1}, 'Fraction Tiles', 'Try bars of fourths, eighths and twelfths. Shade 1 fourth. How many eighths and twelfths reach the same place?'),
 'fbars-3-6': ('fbars', {"d": [3, 6], "lab": 1}, 'Fraction Tiles', 'Try a bar of thirds and a bar of sixths. Shade 2 thirds. How many sixths reach the same place?'),
 'fbars-3-9': ('fbars', {"d": [3, 9], "lab": 1}, 'Fraction Tiles', 'Try a bar of thirds and a bar of ninths. Shade 1 third. How many ninths line up with it?'),
 'fbars-6-12': ('fbars', {"d": [6, 12], "lab": 1}, 'Fraction Tiles', 'Try a bar of sixths and a bar of twelfths. Shade some sixths, then find the twelfths that line up.'),
 'fbars-2-5-10': ('fbars', {"d": [2, 5, 10], "lab": 1}, 'Fraction Tiles', 'Try bars of halves, fifths and tenths. Shade 8 tenths. Which other bar can match it?'),
 'fbars-5-10c': ('fbars', {"d": [5, 10], "lab": 1}, 'Fraction Tiles', 'Line up a bar of fifths and a bar of tenths. How many tenths fit under one fifth?'),
 'fbars-8': ('fbars', {"d": [8], "lab": 1}, 'Fraction Tiles', 'Try a bar of eighths. Each eighth is as long as 2 sixteenths.'),
 'fbars-9-10': ('fbars', {"d": [9, 10], "lab": 1}, 'Fraction Tiles', 'Try a bar of ninths and a bar of tenths. Shade 1 ninth and 2 tenths. Which reaches farther?'),
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
 '3.09.03': dict(page='math-lesson-3-09-03-comparing-fractions-like-denominators.html', title='Comparing Fractions with Like Denominators', video='g3math-09-03-learn',
   glossary=[
     {"t": "compare", "d": "To look at two numbers and find out which is greater, which is less, or if they are equal.", "key": True},
     {"t": "greater than", "d": "More than. The symbol is >. The open side faces the greater number.", "key": True},
     {"t": "less than", "d": "Not as much as. The symbol is <. The point faces the smaller number.", "key": True},
     {"t": "equal to", "d": "The same amount. The symbol is =.", "key": True},
     {"t": "same denominator", "d": "Two fractions with the same bottom number. Their parts are the same size.", "key": True},
     GL_BASE[2], GL_BASE[3], GL_BASE[1],
     {"t": "least to greatest", "d": "In order from the smallest amount to the biggest amount."},
     GL_BASE[5]]),
 '3.09.04': dict(page='math-lesson-3-09-04-comparing-fractions-like-numerators.html', title='Comparing Fractions with Like Numerators', video='g3math-09-04-learn',
   glossary=[
     {"t": "unit fraction", "d": "A fraction with 1 on top, like one-ninth. It names one equal part. More parts in the whole make each part smaller.", "key": True},
     {"t": "denominator", "d": "The bottom number of a fraction. It tells how many equal parts make the whole. A bigger denominator means smaller parts.", "key": True},
     {"t": "same numerator", "d": "Two fractions with the same top number. They have the same number of parts, but the parts may not be the same size."},
     GL_BASE[2],
     {"t": "pipe", "d": "A hollow tube. When you blow across it, it whistles. A short pipe whistles a higher note than a long pipe."},
     {"t": "compare", "d": "To look at two numbers and find out which is greater, which is less, or if they are equal."},
     {"t": "least to greatest", "d": "In order from the smallest amount to the biggest amount."},
     GL_BASE[1], GL_BASE[5]]),
 '3.10.01': dict(page='math-lesson-3-10-01-equivalent-fractions.html', title='Equivalent Fractions', video='g3math-10-01-learn',
   glossary=[
     {"t": "equivalent fractions", "d": "Fractions that name the same amount, like one-fifth and two-tenths. Equivalent sounds like equal.", "key": True},
     {"t": "equivalent", "d": "Equal in amount. Same amount, new name.", "key": True},
     {"t": "measure", "d": "In music, one measure is one whole. Notes of different lengths can fill it.", "key": True},
     GL_BASE[1], GL_BASE[2], GL_BASE[3],
     {"t": "one whole", "alt": ["1 whole"], "d": "All the equal parts together."},
     {"t": "half note", "d": "A note that lasts for one-half of a measure."},
     {"t": "quarter note", "d": "A note that lasts for one-fourth of a measure."},
     {"t": "eighth note", "d": "A note that lasts for one-eighth of a measure."}]),
 '3.10.02': dict(page='math-lesson-3-10-02-finding-equivalent-fractions.html', title='Finding Equivalent Fractions', video='g3math-10-02-learn',
   glossary=[
     {"t": "equivalent fractions", "d": "Fractions that name the same amount, like one-fourth and three-twelfths.", "key": True},
     {"t": "multiply", "d": "To find the total of equal groups. 4 × 3 means 4 groups of 3.", "key": True},
     GL_BASE[2], GL_BASE[3],
     {"t": "variation", "d": "A new version of a piece of music. It keeps the same measures and low notes but fills them with new notes.", "key": True},
     {"t": "measure", "d": "In music, one measure is one whole. Notes of different lengths can fill it.", "key": True},
     GL_BASE[1],
     {"t": "aria", "d": "A slow song. Bach's book of variations starts with one."},
     {"t": "one whole", "alt": ["1 whole"], "d": "All the equal parts together."}]),
 '3.10.03': dict(page='math-lesson-3-10-03-simplifying-fractions.html', title='Simplifying Fractions', video='g3math-10-03-learn',
   glossary=[
     {"t": "simplest form", "d": "A fraction is in simplest form when no number except 1 divides both the numerator and the denominator. It has the fewest, biggest parts.", "key": True},
     {"t": "simplify", "alt": ["simplifying", "simpler name"], "d": "To find a simpler name for a fraction by dividing the numerator and the denominator by the same number.", "key": True},
     {"t": "equivalent fractions", "d": "Fractions that name the same amount, like eight-tenths and four-fifths.", "key": True},
     GL_BASE[2], GL_BASE[3],
     {"t": "measure", "d": "In music, one measure is one whole. Notes of different lengths can fill it.", "key": True},
     {"t": "divide", "alt": ["divided"], "d": "To split into equal groups. 8 ÷ 2 = 4 means 8 split into groups of 2 makes 4 groups."},
     {"t": "hymn", "d": "A song sung in church. Bach used old hymn tunes in his music."},
     {"t": "sixteenth note", "alt": ["sixteenth notes"], "d": "A note that lasts for one-sixteenth of a measure. 16 of them fill one measure."},
     {"t": "eighth note", "d": "A note that lasts for one-eighth of a measure."}]),
 '3.10.04': dict(page='math-lesson-3-10-04-comparing-fractions-part-1.html', title='Comparing Fractions, Part 1', video='g3math-10-04-learn',
   glossary=[
     {"t": "common denominator", "d": "The same denominator for two fractions. When two fractions have a common denominator, their pieces are the same size, so you can count and compare.", "key": True},
     {"t": "common numerator", "d": "The same numerator for two fractions. Then the fraction with the bigger pieces is greater.", "key": True},
     {"t": "re-cut", "alt": ["re-cutting"], "d": "To cut every piece of a bar into the same number of smaller pieces. The amount stays the same, but the fraction gets a new name.", "key": True},
     GL_BASE[2], GL_BASE[3],
     {"t": "measure", "d": "In music, one measure is one whole. Notes of different lengths can fill it.", "key": True},
     {"t": "multiply", "d": "To find the total of equal groups. 4 × 2 means 4 groups of 2."},
     {"t": "invention", "alt": ["inventions"], "d": "A short practice piece Bach wrote with two parts, one for each hand."},
     {"t": "harpsichord", "d": "A keyboard instrument from Bach's time. Its keys pluck the strings inside."}]),
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
            for vf, mt in [(f, 'video/mp4' if f.endswith('mp4') else 'image/jpeg') for f in sorted(set(re.findall(r'assets/video/[\w.-]+\.(?:mp4|jpg)', h)))]:
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
