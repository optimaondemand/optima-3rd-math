// 3.12.03 playthrough: node t22.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-12-03.html');
await p.goto(URL);await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(900);
const J=j=>`section[data-job="${j}"]`;const sfx=W===1150?'':'-'+W;
const shot=async(sel,n)=>{const e=await p.$(sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(200);await e.screenshot({path:'shots/'+n+sfx+'.png'});};
const fill=async(job,vals)=>{const ins=await p.$$(`${J(job)} .sb-step.now .sb-ans`);if(ins.length!==vals.length)console.log('!! job',job,'boxes',ins.length,'vals',vals.length);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{await p.click(`${J(job)} .sb-step.now .sb-btn.check`);await p.waitForTimeout(150);};
const fb=async(job)=>p.textContent(`${J(job)} .sb-step.now .sb-fb`).catch(()=>'(none)');
const now=async(job)=>{await p.waitForTimeout(450);const h=await p.evaluate(j=>{const x=document.querySelector(`section[data-job="${j}"] .sb-hand`);return x?(x.hidden?'HIDDEN ':'')+x.dataset.t:'no hand'},job);const t=await p.textContent(`${J(job)} .sb-step.now h4`).catch(()=>'(none)');return t+'  [hand: '+h+']';};
const prog=async()=>p.textContent('.sb-prog .n');
const RS=(j,n)=>`${J(j)} [data-name="${n}"]`;
const ro=async(j,n)=>p.textContent(RS(j,n)+' .sb-readout');
async function map(sel){const s=await p.$(sel+' svg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),s);await p.waitForTimeout(150);const bb=await s.boundingBox();const vb=(await s.getAttribute('viewBox')).split(' ').map(Number);return {x:v=>bb.x+(v-vb[0])*bb.width/vb[2],y:v=>bb.y+(v-vb[1])*bb.height/vb[3]};}
const PP=(cx,cy,r,d)=>({x:cx+r*Math.cos(d*Math.PI/180),y:cy-r*Math.sin(d*Math.PI/180)});
async function dragTo(sel,handle,tx,ty){const m=await map(sel);const h=await p.$(sel+' '+handle);const hb=await h.boundingBox();const x=hb.x+hb.width/2,y=hb.y+hb.height/2;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+8,y-8,{steps:3});await p.mouse.move(m.x(tx),m.y(ty),{steps:14});await p.mouse.up();await p.waitForTimeout(250);}
async function swing(sel,cx,cy,r){const m=await map(sel);const h=await p.$(sel+' .ci-pen');const hb=await h.boundingBox();await p.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2);await p.mouse.down();for(let a=0;a<=372;a+=8){const q=PP(cx,cy,r,a);await p.mouse.move(m.x(q.x),m.y(q.y));}await p.mouse.up();await p.waitForTimeout(300);}

async function vbH(sel){const s=await p.$(sel+' svg');return +(await s.getAttribute('viewBox')).split(' ')[3];}
async function dragSvg(sel,ax,ay,bx,by){let m=await map(sel);await p.mouse.move(m.x(ax),m.y(ay));await p.mouse.down();await p.mouse.move(m.x(ax)+8,m.y(ay)-8,{steps:3});await p.mouse.move(m.x(bx),m.y(by),{steps:14});await p.mouse.up();await p.waitForTimeout(250);}
async function chip(j,n,label,k,tap){const c=await p.$$(`${RS(j,n)} .an-chip`);let el=null;for(const e of c){if((await e.textContent()).trim()===label){el=e;break;}}if(!el){console.log('!! no chip',label);return;}
  const s=await p.$(`${RS(j,n)} .an-lslot[data-k="${k}"]`);await s.scrollIntoViewIfNeeded();
  if(tap){await el.click();await p.waitForTimeout(80);const s2=await p.$(`${RS(j,n)} .an-lslot[data-k="${k}"]`);await s2.click();}else{const a=await el.boundingBox(),bb=await s.boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(a.x+a.width/2+10,a.y+a.height/2-10,{steps:3});await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2,{steps:12});await p.mouse.up();}
  await p.waitForTimeout(200);console.log(` j${j} ${label}→${k}:`,await ro(j,n));}
async function card(j,n,k){await p.click(`${RS(j,n)} .an-card[data-k="${k}"]`);await p.waitForTimeout(150);console.log(` j${j} card ${k}:`,await ro(j,n));}
async function cardDrag(j,n,k){const a=await (await p.$(`${RS(j,n)} .an-card[data-k="${k}"]`)).boundingBox();const s=await (await p.$(`${RS(j,n)} .an-slot`)).boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(a.x+a.width/2+10,a.y+5,{steps:3});await p.mouse.move(s.x+s.width/2,s.y+s.height/2,{steps:12});await p.mouse.up();await p.waitForTimeout(200);console.log(` j${j} drag card ${k}:`,await ro(j,n));}

const RV='.sb-qgroup[data-done="review"]';
function cinfo(pts,i){const n=pts.length,V=pts[i],nx=pts[(i+1)%n],pv=pts[(i+n-1)%n];const at=(v,q)=>((Math.atan2(v[1]-q[1],q[0]-v[0])*180/Math.PI)+360)%360;const b=at(V,nx),d=(at(V,pv)-b+360)%360;const a=d<=180?d:360-d;return {V,a,rot:d<=180?b:b-90};}
async function grabDrop(sel,ax,ay,rot,tx,ty,r){r=r||28;const g=PP(ax,ay,r,rot+45);const t=PP(tx,ty,r,rot+45);await dragSvg(sel,g.x,g.y,t.x,t.y);}
async function corners(j,n,pts,misMark,miss){let at=[585,395],rot=0;for(let i=0;i<pts.length;i++){const c=cinfo(pts,i);
   if(i===0){await grabDrop(RS(j,n),at[0],at[1],rot,miss[0],miss[1]);console.log(` j${j} miss drop:`,await ro(j,n));}
   if(i===pts.length-1){await p.click(`${RS(j,n)} .rk-v[data-i="${i}"]`);await p.waitForTimeout(200);}else{await grabDrop(RS(j,n),at[0],at[1],rot,c.V[0],c.V[1]);}
   console.log(` j${j} check ${'ABCDE'[i]} (${c.a.toFixed(0)}):`,await ro(j,n));at=c.V;rot=c.rot;if(i===1)await shot(RS(j,n),`b-j${j}-check2`);}
 console.log(` j${j} now:`,await now(j));
 await p.click(`${RS(j,n)} .rk-v[data-i="${misMark}"]`);await p.waitForTimeout(150);console.log(` j${j} wrong mark:`,await ro(j,n));
 for(let i=0;i<pts.length;i++){if(Math.abs(cinfo(pts,i).a-90)<1.5){await p.click(`${RS(j,n)} .rk-v[data-i="${i}"]`);await p.waitForTimeout(150);}}
 console.log(` j${j} marked:`,await ro(j,n),'| now:',await now(j));await shot(RS(j,n),`b-j${j}-model`);}
await shot('.sb-book','b-book');await shot('.sb-intro','b-intro');
await p.fill(RV+' .sb-ans >> nth=0','2');await p.fill(RV+' .sb-ans >> nth=1','half');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','4');await p.fill(RV+' .sb-ans >> nth=1','fourth');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));await shot(RV,'b-review');
for(const [i,v] of [24,42,20,54,40,36,12,48,72,16].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1 fold
console.log('j1 now:',await now(1));await shot(RS(1,'think'),'b-j1-start');
await p.click(RS(1,'think')+' .an-f1');await p.waitForTimeout(250);console.log(' f1:',await ro(1,'think'),'| now:',await now(1));await shot(RS(1,'think'),'b-j1-f1');
await p.click(RS(1,'think')+' .an-f2');await p.waitForTimeout(250);console.log(' f2:',await ro(1,'think'),'| now:',await now(1));await shot(RS(1,'think'),'b-j1-f2');
let H=await vbH(RS(1,'think'));
await grabDrop(RS(1,'think'),150,H-90,0,350,120,45);console.log(' miss:',await ro(1,'think'));
await grabDrop(RS(1,'think'),150,H-90,0,530,H-70,45);console.log(' fit:',await ro(1,'think'),'| now:',await now(1));
await card(1,'think','less');await cardDrag(1,'think','right');console.log('j1 now:',await now(1));await shot(RS(1,'think'),'b-j1-fit');
await p.click(RS(1,'think')+' .an-new');await p.waitForTimeout(200);await p.click(RS(1,'think')+' .an-f1');await p.waitForTimeout(150);await p.click(RS(1,'think')+' .an-f2');await p.waitForTimeout(200);await shot(RS(1,'think'),'b-j1-new');
await p.fill('#w-think','Yes. The first fold makes a straight edge on any scrap. Folding that edge onto itself always makes a square corner.');await check(1);console.log('after j1',await prog());await shot(J(1),'b-j1-done');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);
for(let k=0;k<3;k++)await shot(`.sb-station[data-st="1"] > .sb-card:not(.sb-job) >> nth=${k}`,'b-learn'+k);
// JOB 2 frame
const F2=[[220,330],[515,277],[493,149],[402,94],[185,133]];
console.log('j2 now:',await now(2));await shot(RS(2,'yt'),'b-j2-start');await corners(2,'yt',F2,2,[350,215]);
await fill(2,[5]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[3]);await check(2);console.log('j2 now:',await now(2));
await p.fill('#w-hunt','My door has 4 right angles.');await check(2);console.log('after j2',await prog());
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3 look
console.log('j3 now:',await now(3));await shot(RS(3,'ben'),'b-j3-start');
await grabDrop(RS(3,'ben'),560,380,0,400,150,35);console.log(' miss:',await ro(3,'ben'));
await grabDrop(RS(3,'ben'),560,380,0,250,330,35);console.log(' on:',await ro(3,'ben'),'| now:',await now(3));
await card(3,'ben','right');await cardDrag(3,'ben','greater');console.log('j3 now:',await now(3));await shot(RS(3,'ben'),'b-j3-model');
await p.fill('#w-ben','When I put the checker on it, there was a gap by the green side, so the corner is greater than a right angle.');await check(3);console.log('after j3',await prog());
// JOB 4 cross
console.log('j4 now:',await now(4));await shot(RS(4,'mia'),'b-j4-start');
for(let i=0;i<4;i++){await p.click(`${RS(4,'mia')} .rk-q[data-i="${i}"]`);await p.waitForTimeout(150);console.log(` corner ${i+1}:`,await ro(4,'mia'),'| now:',await now(4));}
await shot(RS(4,'mia'),'b-j4-model');
await fill(4,[1]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[4]);await check(4);
await p.fill('#w-mia','Two perpendicular streets make four right angles because every corner fits the checker.');await check(4);console.log('after j4',await prog());
// JOB 5 kai
const F5=[[209,277],[486,316],[408,154],[236,79]];
console.log('j5 now:',await now(5));await corners(5,'kai',F5,3,[620,60]);
await fill(5,[4]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[1]);await check(5);
await p.fill('#w-kai','I checked every corner. Only corner A fits. The other corners have a gap or hide under the checker.');await check(5);console.log('after j5',await prog());
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6 perp
H=await vbH(RS(6,'own'));const PV=[330,H-150];console.log('j6 now:',await now(6));await shot(RS(6,'own'),'b-j6-start');
q=PP(...PV,210,30+70);await dragTo(RS(6,'own'),'.an-h',q.x,q.y);console.log(' lean:',await ro(6,'own'),'| now:',await now(6));
q=PP(...PV,210,30+92);await dragTo(RS(6,'own'),'.an-h',q.x,q.y);console.log(' stood:',await ro(6,'own'),'| now:',await now(6));
await dragSvg(RS(6,'own'),160,70,400,120);console.log(' sq miss:',await ro(6,'own'));
await dragSvg(RS(6,'own'),160,70,PV[0]+40,PV[1]-40);console.log(' sq on:',await ro(6,'own'),'| now:',await now(6));
await p.click(RS(6,'own')+' .an-tr');await p.waitForTimeout(150);console.log(' turn wrong:',await ro(6,'own'));
await p.click(RS(6,'own')+' .an-tl');await p.waitForTimeout(150);await p.click(RS(6,'own')+' .an-tl');await p.waitForTimeout(150);await p.click(RS(6,'own')+' .an-tl');await p.waitForTimeout(200);console.log(' fits:',await ro(6,'own'),'| now:',await now(6));await shot(RS(6,'own'),'b-j6-model');
await p.fill('#w-own','I turned the set square. One edge is on the road and one is on my line, so the lines are perpendicular.');await check(6);console.log('after j6',await prog());
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(400);
// JOB 7 posts
H=await vbH(RS(7,'wow'));const G=H-(W<560?100:60);console.log('j7 now:',await now(7));await shot(RS(7,'wow'),'b-j7-start');
q=PP(250,G,170,80);await dragTo(RS(7,'wow'),'.an-pa',q.x,q.y);console.log(' A lean:',await ro(7,'wow'));
q=PP(250,G,170,91);await dragTo(RS(7,'wow'),'.an-pa',q.x,q.y);console.log(' A:',await ro(7,'wow'),'| now:',await now(7));
q=PP(450,G,170,88);await dragTo(RS(7,'wow'),'.an-pb',q.x,q.y);console.log(' B:',await ro(7,'wow'),'| now:',await now(7));
await p.click(RS(7,'wow')+' .an-tall');await p.waitForTimeout(150);await p.click(RS(7,'wow')+' .an-tall');await p.waitForTimeout(200);console.log(' tall:',await ro(7,'wow'),'| now:',await now(7));await shot(RS(7,'wow'),'b-j7-tall');
await fill(7,['yes']);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,['no']);await check(7);console.log('after j7',await prog());await shot(J(7),'b-j7');
await p.fill('#w-prove','First tear a scrap of paper. Fold it once, then fold the straight edge onto itself. Put the corner on the vertex of the book and line up one edge. If both edges line up, it is a right angle.');await p.click(J(8)+' .sb-btn.check');await p.waitForTimeout(200);console.log('after j8',await prog());
const BQ='.sb-qgroup[data-done="bonus"]';await p.fill(BQ+' .sb-ans','6');await p.click(BQ+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BQ+' .sb-fb'));await p.fill(BQ+' .sb-ans','8');await p.click(BQ+' .sb-btn.check');console.log('bonus:',await p.textContent(BQ+' .sb-fb'));
await shot(BQ,'b-bonus');await shot('.sb-listen','b-listen');
await p.reload();await p.waitForTimeout(900);console.log('after reload',await prog());await p.click('[data-tab="learn"]');await p.waitForTimeout(300);await p.click('.sb-pstep[data-st="1"]');await p.waitForTimeout(300);await shot(RS(2,'yt'),'b-j2-reload');
await p.click('.sb-pstep[data-st="3"]');await p.waitForTimeout(300);await shot(RS(6,'own'),'b-j6-reload');
const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);console.log('sideways scroll:',sw);
console.log('errors:',errs.length?errs:'none');await b.close();})();
