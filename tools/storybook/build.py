import re, json, base64, hashlib, os, subprocess, sys
from PIL import Image
R='/home/claude/g3sb/'; S='/mnt/user-data/uploads/Downloads/'
os.makedirs(R+'repo/images/storybook',exist_ok=True)
# images
def save(im,name,q=84):
    p=R+'repo/images/storybook/'+name
    if name.endswith('.png'): im.save(p,optimize=True)
    else: im.convert('RGB').save(p,quality=q,optimize=True,progressive=True)
if not os.path.exists(R+'repo/images/storybook/sb-athens-plate.jpg'):
    im=Image.open(S+'sb-school-of-athens.jpg'); save(im.crop((200,700,800,1150)),'sb-athens-plate.jpg')
    save(Image.open(S+'sb-pythagoras-tablet.jpg'),'sb-pythagoras-tablet.jpg')
    m=Image.open(S+'sb-muse-lyre.jpg'); m2=m.copy(); m2.thumbnail((820,1200)); save(m2,'sb-muse-lyre.jpg')
    sm=m.crop((300,250,1500,1750)); sm.thumbnail((300,375)); save(sm,'sb-muse-lyre-sm.jpg')
    o=Image.open('/mnt/user-data/uploads/optima-3rd-social-studies/images/opti-owl.png'); o.thumbnail((240,240)); save(o,'opti-owl.png')
music=R+'repo/audio/storybook/bach-cello-suite-1-prelude.mp3'
if not os.path.exists(music):
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',S+'sb-bach-cello-suite1-prelude.ogg','-ac','1','-b:a','96k',music],check=True)
crew=json.load(open(R+'build/crew.json'))
js=open(R+'src/sb.js').read().replace('__CREW__',json.dumps(crew))
open(R+'repo/assets/storybook/sb.js','w').write(js)
css=open(R+'repo/assets/storybook/sb.css').read()
ver=hashlib.md5((js+css).encode()).hexdigest()[:8]
html=open(R+'src/lesson-3-09-01.html').read()
def miss(h): return ' data-hint="'+h.replace('"','&quot;')+'"' if h else ''
def num(a,lab='answer',h=''):
    return '<input class="sb-ans" data-a="%s" inputmode="numeric" autocomplete="off" aria-label="%s"%s>'%(a,lab,miss(h))
def tok(m):
    t=m.group(1); h=''
    if '~' in t: t,h=t.split('~',1)
    k,v=t.split(':',1)
    if k=='n': return num(v,'number',h)
    if k=='w': return '<input class="sb-ans word" data-a="%s" autocomplete="off" aria-label="word"%s>'%(v,miss(h))
    if k=='fr':
        a,b=v.split(':'); return '<span class="sb-frac">'+num(a,'top number',h)+'<i></i>'+num(b,'bottom number',h)+'</span>'
html=re.sub(r'\[\[(.*?)\]\]',tok,html)
data={"lesson":"3.09.01","key":"g3sb-3-09-01","title":"Fractions of a Whole","audioBase":"audio/storybook/","imgBase":"images/storybook/",
 "music":"bach-cello-suite-1-prelude.mp3","audioReady":os.path.exists(R+'repo/audio/storybook/g3m-3-09-01-warm-1.mp3'),
 "glossary":[
  {"t":"fraction","d":"A number that names equal parts of one whole, like one-third.","key":True},
  {"t":"equal parts","d":"Parts that are all the same size.","key":True},
  {"t":"numerator","d":"The top number of a fraction. It tells how many parts you are counting.","key":True},
  {"t":"denominator","d":"The bottom number of a fraction. It tells how many equal parts make the whole.","key":True},
  {"t":"string","d":"A thin cord pulled tight. When you pluck it, it shakes and makes a sound.","key":True},
  {"t":"note","d":"One musical sound. A note can be high or low.","key":True},
  {"t":"unit fraction","d":"A fraction with 1 on top, like one-third. It names one equal part."},
  {"t":"whole","d":"All of something. All the equal parts together make 1 whole."},
  {"t":"bridge","d":"A small wedge under a string. It holds the string up and cuts it into parts you can pluck."},
  {"t":"lyre","d":"A string instrument from ancient Greece. You pluck its strings."}],
 "cueWords":{}}
cw=R+'build/cuewords.json'
if os.path.exists(cw): data['cueWords']=json.load(open(cw))
def enc(o): return base64.urlsafe_b64encode(json.dumps(o,separators=(',',':')).encode()).decode().rstrip('=')
TB='https://optimaondemand.github.io/optima-4th-math/manipulatives/tool.html?t='
TOOLS={'fbars-yt':('fbars',{"bm":"build","d":[4,6,8],"bt":[],"sh":{}},'Fraction Tiles','This might be a good time to try the Fraction Tiles. Fill the bar with equal tiles, then shade some.'),
 'fbars-3':('fbars',{"bm":"build","d":[3],"bt":[],"sh":{}},'Fraction Tiles','Try it with tiles: how many one-third tiles fill 1 whole?'),
 'fcircles-3':('fcircles',{"c":1,"n":3},'Fraction Circles','Try a circle cut into 3 equal slices. Shade 1 slice.'),
 'fcircles':('fcircles',{"c":1,"n":10},'Fraction Circles','Cut a circle into 10 equal slices. Take some away and name both parts.'),
 'whiteboard':('whiteboard',None,'Grid Whiteboard','Draw a board with 7 equal parts on the Grid Whiteboard. Shade 2 that are apart.')}
def tool(m):
    t,st,name,tip=TOOLS[m.group(1)]
    url=TB+t+'&amp;st=1'+('#s='+enc(st) if st else '')
    return '<a class="sb-tool" href="%s" target="_blank" rel="noopener" title="%s">🧮 Try the %s ↗</a>'%(url,tip,name)
html=re.sub(r'\{\{TOOL:([^}]+)\}\}',tool,html)
html=html.replace('{{DATA}}',json.dumps(data))
vid=R+'repo/assets/video/g3math-09-01-learn.mp4'
LV='<video controls preload="metadata" playsinline poster="assets/video/g3math-09-01-learn.jpg" src="assets/video/g3math-09-01-learn.mp4"></video>'
def out(path,inline):
    h=html.replace('{{LEARNVIDEO}}',LV)
    if inline:
        def img(m):
            n=m.group(1); p=R+'repo/images/storybook/'+n; mt='image/png' if n.endswith('png') else 'image/jpeg'
            return 'data:%s;base64,%s'%(mt,base64.b64encode(open(p,'rb').read()).decode())
        h=re.sub(r'\{\{IMG:([^}]+)\}\}',img,h)
        for vf,mt in [('assets/video/g3math-09-01-learn.mp4','video/mp4'),('assets/video/g3math-09-01-learn.jpg','image/jpeg')]:
            if os.path.exists(R+'repo/'+vf): h=h.replace(vf,'data:%s;base64,%s'%(mt,base64.b64encode(open(R+'repo/'+vf,'rb').read()).decode()))
        h=h.replace('{{CSS}}','<style>'+css+'</style>')
        aud={}
        for root,_,fs in os.walk(R+'repo/audio/storybook'):
            for f in fs:
                rel=os.path.relpath(os.path.join(root,f),R+'repo/audio/storybook')
                aud[rel]='data:audio/mpeg;base64,'+base64.b64encode(open(os.path.join(root,f),'rb').read()).decode()
        owl=img(re.match(r'(.*)','opti-owl.png'))
        h=h.replace('{{PRE}}','<script>window.SB_IMG={"opti-owl.png":"%s"};window.SB_AUDIO=%s;</script>'%(owl,json.dumps(aud)))
        h=h.replace('{{JS}}','<script>'+js+'</script>')
    else:
        h=re.sub(r'\{\{IMG:([^}]+)\}\}',lambda m:'images/storybook/'+m.group(1),h)
        h=h.replace('{{CSS}}','<link rel="stylesheet" href="assets/storybook/sb.css?v=%s">'%ver)
        h=h.replace('{{PRE}}','').replace('{{JS}}','<script src="assets/storybook/sb.js?v=%s"></script>'%ver)
    open(path,'w').write(h); print(path, len(h)//1024,'KB')
out(R+'repo/math-lesson-3-09-01-fractions-of-a-whole.html',False)
out(R+'build/g3-storybook-preview-3-09-01-v1.html',True)
