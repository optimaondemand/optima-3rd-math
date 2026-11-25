// 3.12.02 playthrough: node t21.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-12-02.html');
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
await shot('.sb-book','a-book');await shot('.sb-intro','a-intro');
await p.fill(RV+' .sb-ans >> nth=0','4');await p.fill(RV+' .sb-ans >> nth=1','5');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','5');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));await shot(RV,'a-review');
for(const [i,v] of [28,24,36,18,48,33,44,27,32,36].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1 open
const V1=[350,330];let q;
console.log('j1 now:',await now(1));await shot(RS(1,'think'),'a-j1-start');
q=PP(...V1,270,35);await dragTo(RS(1,'think'),'.an-h',q.x,q.y);console.log(' little:',await ro(1,'think'),'| now:',await now(1));
q=PP(...V1,270,88);await dragTo(RS(1,'think'),'.an-h',q.x,q.y);console.log(' right:',await ro(1,'think'),'| now:',await now(1));await shot(RS(1,'think'),'a-j1-right');
q=PP(...V1,270,130);await dragTo(RS(1,'think'),'.an-h',q.x,q.y);console.log(' wide:',await ro(1,'think'));
q=PP(...V1,270,178);await dragTo(RS(1,'think'),'.an-h',q.x,q.y);console.log(' straight:',await ro(1,'think'),'| now:',await now(1));await shot(RS(1,'think'),'a-j1-straight');
await fill(1,['length']);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,['opening']);await check(1);console.log('j1 now:',await now(1));
await p.fill('#w-think','At first the strips opened a little. Then they made a square corner. At the end they made one straight line. Only the opening changed.');await check(1);console.log('after j1',await prog());await shot(J(1),'a-j1-done');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job) >> nth=1','a-learncard');
// JOB 2 parts
console.log('j2 now:',await now(2));await shot(RS(2,'yt'),'a-j2-start');
await chip(2,'yt','ray','vertex');await chip(2,'yt','vertex','vertex');await chip(2,'yt','ray','ray-a',true);await chip(2,'yt','ray','ray-b');console.log('j2 now:',await now(2));
let H=await vbH(RS(2,'yt'));const PV=[175,345];
await dragSvg(RS(2,'yt'),425+70,H-28-70,300,200);console.log(' sq miss:',await ro(2,'yt'));
H=await vbH(RS(2,'yt'));await dragSvg(RS(2,'yt'),425+70,H-28-70,PV[0]+70,PV[1]-70);console.log(' sq on:',await ro(2,'yt'),'| now:',await now(2));await shot(RS(2,'yt'),'a-j2-check');
await card(2,'yt','greater');await card(2,'yt','right');await cardDrag(2,'yt','less');console.log('j2 now:',await now(2));await shot(RS(2,'yt'),'a-j2-model');
await p.fill('#w-hunt','The corner of my book is a right angle.');await check(2);console.log('after j2',await prog());
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3 ben
console.log('j3 now:',await now(3));await shot(RS(3,'ben'),'a-j3-start');q=PP(455,350,120,118);await dragTo(RS(3,'ben'),'.an-end',q.x,q.y);console.log(' short stretch:',await ro(3,'ben'));
q=PP(455,350,210,118);await dragTo(RS(3,'ben'),'.an-end',q.x,q.y);console.log(' stretch:',await ro(3,'ben'),'| now:',await now(3));
await dragTo(RS(3,'ben'),'.an-qv',300,250);console.log(' miss:',await ro(3,'ben'));
await dragTo(RS(3,'ben'),'.an-qv',95,350);console.log(' laid:',await ro(3,'ben'),'| now:',await now(3));await shot(RS(3,'ben'),'a-j3-model');
await fill(3,['P']);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,['Q']);await check(3);
await p.fill('#w-ben','Long rays do not make a bigger angle. The size of an angle is the opening. Angle Q has the wider opening, so Q is greater.');await check(3);console.log('after j3',await prog());
// JOB 4 turn
console.log('j4 now:',await now(4));await shot(RS(4,'mia'),'a-j4-start');const MV=[265,330];
await dragSvg(RS(4,'mia'),470+50,380-50,MV[0]+50,MV[1]-50);console.log(' on:',await ro(4,'mia'),'| now:',await now(4));
q=PP(...MV,175*.707+30,60);await dragTo(RS(4,'mia'),'.an-rot',q.x,q.y);console.log(' rot 15:',await ro(4,'mia'));
await p.click(RS(4,'mia')+' .an-tl');await p.waitForTimeout(200);console.log(' turn btn:',await ro(4,'mia'),'| now:',await now(4));await shot(RS(4,'mia'),'a-j4-model');
await card(4,'mia','less');await card(4,'mia','right');console.log('j4 now:',await now(4));
await p.fill('#w-mia','I turned the set square until both rays lay on its edges. It fit the square corner, so it is a right angle.');await check(4);console.log('after j4',await prog());
// JOB 5 meet
console.log('j5 now:',await now(5));await shot(RS(5,'kai'),'a-j5-start');await dragTo(RS(5,'kai'),'.an-e',420,200);console.log(' miss:',await ro(5,'kai'));
await dragTo(RS(5,'kai'),'.an-e',217,318);console.log(' met:',await ro(5,'kai'),'| now:',await now(5));
await p.click(RS(5,'kai')+' .an-v');await p.waitForTimeout(200);console.log(' vertex:',await ro(5,'kai'),'| now:',await now(5));await shot(RS(5,'kai'),'a-j5-model');
await p.fill('#w-kai','An angle needs two sides that meet at one point. Kai\'s sticks did not touch. Now they meet at the vertex.');await check(5);console.log('after j5',await prog());
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6 own
console.log('j6 now:',await now(6));H=await vbH(RS(6,'own'));const OV=[330,H-110];
q=PP(...OV,230,62);await dragTo(RS(6,'own'),'.an-h',q.x,q.y);console.log(' 62:',await ro(6,'own'),'| now:',await now(6));
await p.click(RS(6,'own')+' .an-chk');await p.waitForTimeout(200);console.log(' check small:',await ro(6,'own'));
q=PP(...OV,230,176);await dragTo(RS(6,'own'),'.an-h',q.x,q.y);console.log(' 176:',await ro(6,'own'),'| now:',await now(6));
q=PP(...OV,230,132);await dragTo(RS(6,'own'),'.an-h',q.x,q.y);console.log(' 132:',await ro(6,'own'),'| now:',await now(6));
await chip(6,'own','vertex','vertex');await chip(6,'own','ray','ray-a');await chip(6,'own','ray','ray-b');console.log('j6 now:',await now(6));await shot(RS(6,'own'),'a-j6-model');
await p.fill('#w-own','I put the square corner on the vertex. The green ray sticks out past the set square, so it is greater.');await check(6);console.log('after j6',await prog());
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(400);
// JOB 7 euclid
const EV=[350,300];console.log('j7 now:',await now(7));q=PP(...EV,240,70);await dragTo(RS(7,'wow'),'.an-h',q.x,q.y);console.log(' 70:',await ro(7,'wow'));
q=PP(...EV,240,92);await dragTo(RS(7,'wow'),'.an-h',q.x,q.y);console.log(' equal:',await ro(7,'wow'),'| now:',await now(7));await shot(RS(7,'wow'),'a-j7-eq');
await fill(7,[4]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[2]);await check(7);console.log('j7 now:',await now(7));
q=PP(...EV,240,60);await dragTo(RS(7,'wow'),'.an-h',q.x,q.y);console.log(' wrong way:',await ro(7,'wow'));
q=PP(...EV,240,135);await dragTo(RS(7,'wow'),'.an-h',q.x,q.y);console.log(' lean:',await ro(7,'wow'),'| now:',await now(7));await shot(RS(7,'wow'),'a-j7-lean');
await fill(7,['less']);await check(7);console.log('j7 wrong2:',await fb(7));await fill(7,['greater']);await check(7);console.log('after j7',await prog());await shot(J(7),'a-j7');
await p.fill('#w-prove','A straight angle is one straight line. A right angle fits in it 2 times, so the straight angle is greater.');await p.click(J(8)+' .sb-btn.check');await p.waitForTimeout(200);console.log('after j8',await prog());
const BQ='.sb-qgroup[data-done="bonus"]';await p.fill(BQ+' .sb-ans','6');await p.click(BQ+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BQ+' .sb-fb'));await p.fill(BQ+' .sb-ans','7');await p.click(BQ+' .sb-btn.check');console.log('bonus:',await p.textContent(BQ+' .sb-fb'));
await shot('.sb-listen','a-listen');
await p.reload();await p.waitForTimeout(900);console.log('after reload',await prog());await p.click('[data-tab="learn"]');await p.waitForTimeout(300);await p.click('.sb-pstep[data-st="1"]');await p.waitForTimeout(300);await shot(RS(2,'yt'),'a-j2-reload');
const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);console.log('sideways scroll:',sw);
console.log('errors:',errs.length?errs:'none');await b.close();})();
