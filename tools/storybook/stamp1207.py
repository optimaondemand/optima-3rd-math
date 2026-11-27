# Re-stamp the cache-busting ?v= on every storybook page after a layer change (sb.js / sb.css).
# Run from the repo root:  python3 tools/storybook/stamp1207.py
import hashlib, glob, re, os
js = open('assets/storybook/sb.js', encoding='utf8').read()
css = open('assets/storybook/sb.css', encoding='utf8').read()
ver = hashlib.md5((js + css).encode()).hexdigest()[:8]
n = 0
for p in sorted(glob.glob('math-lesson-3-*.html')):
    s = open(p, encoding='utf8').read()
    if 'assets/storybook/sb.js' not in s:
        continue
    s2 = re.sub(r'(assets/storybook/sb\.(?:js|css))\?v=[a-f0-9]+', r'\1?v=' + ver, s)
    if s2 != s:
        open(p, 'w', encoding='utf8').write(s2); n += 1
print('version', ver, '· pages re-stamped', n)
