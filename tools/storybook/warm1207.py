# warm1207: add the 3.12.07 Warm-Up scene and cue words to tools/storybook/warm/warm.html
# (run once on her computer, after warm1206):  python3 warm1207.py tools/storybook/warm/warm.html
import sys
p = sys.argv[1]; s = open(p, encoding='utf8').read()

SCENE = (
"SC['3.12.07']=function(t,K){\n"
"  var HD='CHAPTER 12 · EUCLID\\'S COMPASS',GOLD2='#C9A227';\n"
"  function circ(cx,cy,r,k,op,col){if(k<=0)return;var C=2*Math.PI*r;\n"
"    S('circle',{cx:cx,cy:cy,r:r,fill:'none',stroke:col||NAVY,'stroke-width':8,opacity:op==null?1:op,\n"
"      'stroke-dasharray':k>=1?'':(C*k)+' '+C,transform:k>=1?'':'rotate(-90 '+cx+' '+cy+')'});}\n"
"  function dash(x1,y1,x2,y2,op){S('line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:GOLD2,'stroke-width':7,'stroke-dasharray':'18 13','stroke-linecap':'round',opacity:op});}\n"
"  function arrow(ax,k,op){var L=[[640,210],[470,380],[555,380],[555,520],[640,520]],R=L.map(function(p){return [2*ax-p[0],p[1]];});\n"
"    S('polygon',{points:L.concat(R.slice().reverse()).map(function(p){return p.join(',');}).join(' '),fill:'#FBF6EA',stroke:NAVY,'stroke-width':8,'stroke-linejoin':'round',opacity:op});\n"
"    if(k>0)S('polygon',{points:L.map(function(p){return (p[0]+(2*ax-2*p[0])*k)+','+p[1];}).join(' '),fill:'rgba(30,140,90,.22)',stroke:'#1E8C5A','stroke-width':8,'stroke-linejoin':'round',opacity:op});}\n"
"  if(t<K.circles-0.3){head('','');owl(1000,380,150,t);book(t,0.1,'sb-byrne-prop1.jpg','CHAPTER 12 · LESSON 7','Lines of Symmetry','Alexandria, about 300 BC');return;}\n"
"  if(t<K.fold-0.3){head(HD,'Two circles of the same size');owl(null);var o=fade(t,K.circles-0.3,K.fold-0.3);\n"
"    circ(540,400,210,ramp(t,K.circles-0.3,1.1),o);\n"
"    circ(740,400,210,ramp(t,K.circles+0.9,1.1),o,'#D2453B');\n"
"    S('line',{x1:540,y1:400,x2:740,y2:400,stroke:NAVY,'stroke-width':8,opacity:o});\n"
"    S('circle',{cx:540,cy:400,r:10,fill:NAVY,opacity:o});S('circle',{cx:740,cy:400,r:10,fill:NAVY,opacity:o});return;}\n"
"  if(t<K.temples-0.3){head(HD,'A fold line where both halves match');owl(null);var o2=fade(t,K.fold-0.3,K.temples-0.3);\n"
"    circ(540,400,210,1,o2);circ(740,400,210,1,o2,'#D2453B');\n"
"    S('line',{x1:540,y1:400,x2:740,y2:400,stroke:NAVY,'stroke-width':8,opacity:o2});\n"
"    var k=ramp(t,K.fold-0.3,0.7);dash(640,150-20*k,640,650+20*k,o2*k);\n"
"    if(t>=K.match-0.3)label(1070,185,'both halves match',ramp(t,K.match-0.3,0.4)*o2,'#1E7A4C',28);return;}\n"
"  if(t<K.today-0.3){head(HD,'Greek builders made their temples match');owl(null);var o3=fade(t,K.temples-0.3,K.today-0.3);\n"
"    pic('sb-greek-temple-front.jpg',200,90,880,520,1+0.02*(t-K.temples),.5,.5,o3);\n"
"    var k3=ramp(t,K.temples+0.5,0.7);dash(640,70,640,640,o3*k3);return;}\n"
"  head(HD,'Fold a shape and look');owl(null);var o4=ramp(t,K.today-0.3,0.5);\n"
"  dash(640,160,640,570,o4);\n"
"  arrow(640,ramp(t,K.shapes-0.4,1.2),o4);\n"
"};\n")

CUE = (" '3.12.07':function(){return{circles:wt(/^circles$/,0),fold:wt(/^fold$/,0),match:wt(/^match$/,0),"
       "temples:wt(/^temples$/,0),today:wt(/^Today$/,0),shapes:wt(/^shapes$/,0)};},\n")

if "SC['3.12.07']=function" in s:
    print('already'); sys.exit()
assert "SC['3.12.06']=function" in s and " '3.12.06':function(){return{" in s
s = s.replace("SC['3.12.06']=function", SCENE + "SC['3.12.06']=function", 1).replace(" '3.12.06':function(){return{", CUE + " '3.12.06':function(){return{", 1)
open(p, 'w', encoding='utf8').write(s); print('ok')
