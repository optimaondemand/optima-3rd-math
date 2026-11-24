// 3.12.01 playthrough: node t20.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-12-01.html');
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
const RV='.sb-qgroup[data-done="review"]';
await shot('.sb-book','c-book');await shot('.sb-intro','c-intro');
await p.click(RV+' .part >> nth=0');await p.fill(RV+' .sb-ans','third');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans','half');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));await shot(RV,'c-review');
for(const [i,v] of [22,50,80,70,90,22,35,50,17,42].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1
console.log('j1 now:',await now(1));await p.click(RS(1,'think')+' .ci-fold');await p.waitForTimeout(250);await shot(RS(1,'think'),'c-j1-folding');await p.waitForTimeout(700);console.log(' fold1:',await ro(1,'think'),'| now:',await now(1));
await p.click(RS(1,'think')+' .ci-fold2');await p.waitForTimeout(900);console.log(' fold2:',await ro(1,'think'),'| now:',await now(1));
let m=await map(RS(1,'think'));await p.mouse.click(m.x(420),m.y(180));await p.waitForTimeout(150);console.log(' wrong tap:',await ro(1,'think'));
m=await map(RS(1,'think'));await p.mouse.click(m.x(352),m.y(232));await p.waitForTimeout(250);console.log(' center:',await ro(1,'think'),'| now:',await now(1));
for(let i=0;i<3;i++){await p.click(RS(1,'think')+' .ci-meas');await p.waitForTimeout(150);}console.log(' meas:',await ro(1,'think'),'| now:',await now(1));await shot(RS(1,'think'),'c-j1-model');
await fill(1,[22,'middle']);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[11,'center']);await check(1);console.log('j1 now:',await now(1));
await p.fill('#w-think','I folded it in half two ways. The folds crossed at the center. Every line from there to the edge was 11 cm.');await check(1);console.log('after j1',await prog());await shot(J(1),'c-j1-done');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','c-learncard');
// JOB 2 parts
console.log('j2 now:',await now(2));await shot(RS(2,'yt'),'c-j2-start');
async function chip(j,n,label,k,tap){const c=await p.$$(`${RS(j,n)} .ci-chip`);let el=null;for(const e of c){if((await e.textContent()).trim()===label){el=e;break;}}if(!el){console.log('!! no chip',label);return;}
  const s=await p.$(`${RS(j,n)} .ci-slot[data-k="${k}"]`);await s.scrollIntoViewIfNeeded();
  if(tap){await el.click();await p.waitForTimeout(80);const s2=await p.$(`${RS(j,n)} .ci-slot[data-k="${k}"]`);await s2.click();}else{const a=await el.boundingBox(),bb=await s.boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(a.x+a.width/2+10,a.y+a.height/2-10,{steps:3});await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2,{steps:12});await p.mouse.up();}
  await p.waitForTimeout(200);console.log(` j${j} ${label}→${k}:`,await ro(j,n));}
await chip(2,'yt','diameter','radius');await chip(2,'yt','diameter','diameter');await chip(2,'yt','center','center',true);await chip(2,'yt','radius','radius');console.log('j2 now:',await now(2));await shot(RS(2,'yt'),'c-j2-model');
await fill(2,[17]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[34]);await check(2);console.log('after j2',await prog());await shot(J(2),'c-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3 ben
console.log('j3 now:',await now(3));let q=PP(350,230,155,140);await dragTo(RS(3,'ben'),'.ci-end',q.x,q.y);console.log(' ben 140:',await ro(3,'ben'),'| now:',await now(3));
q=PP(350,230,155,182);await dragTo(RS(3,'ben'),'.ci-end',q.x,q.y);console.log(' ben 182:',await ro(3,'ben'),'| now:',await now(3));await shot(RS(3,'ben'),'c-j3-model');
await fill(3,[40,40]);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,[80,80]);await check(3);
await p.fill('#w-ben','A radius only goes from the center to the edge. The diameter goes all the way across, so it is 40 + 40 = 80 cm.');await check(3);console.log('after j3',await prog());await shot(J(3),'c-j3');
// JOB 4 chord
console.log('j4 now:',await now(4));await shot(RS(4,'mia'),'c-j4-start');q=PP(350,230,155,60);await dragTo(RS(4,'mia'),'.ci-end',q.x,q.y);console.log(' mia 60:',await ro(4,'mia'));
q=PP(350,230,155,27);await dragTo(RS(4,'mia'),'.ci-end',q.x,q.y);console.log(' mia 27:',await ro(4,'mia'),'| now:',await now(4));await shot(RS(4,'mia'),'c-j4-model');
await fill(4,[20]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[28]);await check(4);
await p.fill('#w-mia','A diameter has to go through the center. Her line misses it, so it is shorter. The diameter is 28 cm.');await check(4);console.log('after j4',await prog());await shot(J(4),'c-j4');
// JOB 5 kai (compass + given circle)
const lay=(T,MX,giv,euc)=>{let K,PX,PY;if(euc){K=Math.min(600/(3*T+6),330/(2*T+4));PX=350-K*T*.5;PY=60+K*(T+2);}else if(giv){const gr=giv,tw=2*T+4+2*gr;K=Math.min(620/(tw+4),330/(2*Math.max(T,gr)+4));PX=40+K*(T+2);PY=60+K*(Math.max(T,gr)+2);}else{K=Math.min(300/(MX+1),360/(2*T+4));PX=350-K*(MX/2-T*.4);PY=60+K*(T+2);}return {K,PX,PY};};
let L=lay(21,24,10.5);console.log('j5 now:',await now(5));await shot(RS(5,'kai'),'c-j5-start');
await dragTo(RS(5,'kai'),'.ci-pen',L.PX+L.K*17,L.PY);console.log(' open 17:',await ro(5,'kai'),'| now:',await now(5));
await dragTo(RS(5,'kai'),'.ci-pen',L.PX+L.K*21,L.PY);console.log(' open 21:',await ro(5,'kai'),'| now:',await now(5));
await swing(RS(5,'kai'),L.PX,L.PY,L.K*21);console.log(' drawn:',await ro(5,'kai'),'| now:',await now(5));await shot(RS(5,'kai'),'c-j5-model');
await fill(5,[21,'B']);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[42,'A']);await check(5);
await p.fill('#w-kai','Circle A has a radius of 21 cm, so it is 42 cm across. Circle B is only 21 cm across. Circle A is twice as wide.');await check(5);console.log('after j5',await prog());await shot(J(5),'c-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6 own
console.log('j6 now:',await now(6));await fill(6,[38]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[19]);await check(6);console.log('j6 now:',await now(6));
L=lay(19,25,0);await dragTo(RS(6,'own'),'.ci-pen',L.PX+L.K*19,L.PY);console.log(' open:',await ro(6,'own'),'| now:',await now(6));
// keyboard-free tap auto swing
await p.click(RS(6,'own')+' .ci-pen');await p.waitForTimeout(1400);console.log(' tap swing:',await ro(6,'own'),'| now:',await now(6));await shot(RS(6,'own'),'c-j6-model');
await p.fill('#w-own','38 inches is the diameter. The compass opens to the radius, which is half: 19 inches.');await check(6);console.log('after j6',await prog());
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(400);
// JOB 7 euclid
L=lay(15,20,0,1);console.log('j7 now:',await now(7));await dragTo(RS(7,'wow'),'.ci-pen',L.PX+L.K*15,L.PY);console.log(' open:',await ro(7,'wow'),'| now:',await now(7));
await swing(RS(7,'wow'),L.PX,L.PY,L.K*15);console.log(' A:',await ro(7,'wow'),'| now:',await now(7));await shot(RS(7,'wow'),'c-j7-a');
await dragTo(RS(7,'wow'),'.ci-pt',L.PX+L.K*7,L.PY+40);console.log(' miss:',await ro(7,'wow'));
await dragTo(RS(7,'wow'),'.ci-pt',L.PX+L.K*15,L.PY);console.log(' moved:',await ro(7,'wow'),'| now:',await now(7));
await swing(RS(7,'wow'),L.PX+L.K*15,L.PY,L.K*15);console.log(' B:',await ro(7,'wow'),'| now:',await now(7));
await fill(7,[30]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[15]);await check(7);console.log('j7 now:',await now(7));
await p.click(RS(7,'wow')+' .ci-cross');await p.waitForTimeout(250);console.log(' cross:',await ro(7,'wow'),'| now:',await now(7));await shot(RS(7,'wow'),'c-j7-model');
await fill(7,[15,15]);await check(7);console.log('after j7',await prog());await shot(J(7),'c-j7');
await p.fill('#w-prove','Circle B\'s center is on circle A\'s edge. The line from circle A\'s center to its edge is a radius, so it is 15 cm.');await p.click(J(8)+' .sb-btn.check');await p.waitForTimeout(200);console.log('after j8',await prog());
const BQ='.sb-qgroup[data-done="bonus"]';await p.fill(BQ+' .sb-ans >> nth=0','46');await p.fill(BQ+' .sb-ans >> nth=1','23');await p.click(BQ+' .sb-btn.check');console.log('bonus:',await p.textContent(BQ+' .sb-fb'));
// reload restores
await p.reload();await p.waitForTimeout(900);console.log('after reload',await prog());await p.click('[data-tab="swyk"]');await p.waitForTimeout(300);await shot(RS(7,'wow'),'c-j7-reload');
const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);console.log('sideways scroll:',sw);
console.log('errors:',errs.length?errs:'none');await b.close();})();
