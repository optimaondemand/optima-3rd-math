// 3.12.03 playthrough: node t22.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-12-04.html');
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
async function rodTo(j,n,rn,side){const r=await p.$(`${RS(j,n)} .tr-rod[data-n="${rn}"]`);await r.scrollIntoViewIfNeeded();const a=await r.boundingBox();const g=await p.$(`${RS(j,n)} .tr-ring[data-side="${side}"]`);const bb=await g.boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(a.x+a.width/2+10,a.y-10,{steps:3});await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2,{steps:14});await p.mouse.up();await p.waitForTimeout(250);}
async function rodMiss(j,n,rn){const r=await p.$(`${RS(j,n)} .tr-rod[data-n="${rn}"]`);const a=await r.boundingBox();const m=await map(RS(j,n));await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(a.x+20,a.y-20,{steps:3});await p.mouse.move(m.x(350),m.y(60),{steps:10});await p.mouse.up();await p.waitForTimeout(250);}
const pin=async(j,n,x,y)=>{await p.click(`${RS(j,n)} .tr-pin[data-p="${x},${y}"]`);await p.waitForTimeout(120);};
const GP=(x,y)=>[130+30+x*38,10+30+y*38];
async function tapAll(j,n,cls){const k=(await p.$$(`${RS(j,n)} ${cls}`)).length;for(let i=0;i<k;i++){await p.click(`${RS(j,n)} ${cls} >> nth=${i}`);await p.waitForTimeout(150);}}
await shot('.sb-book','b-book');await shot('.sb-intro','b-intro');
await p.fill(RV+' .sb-ans >> nth=0','4');await p.fill(RV+' .sb-ans >> nth=1','5');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','5');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));await shot(RV,'b-review');
for(const [i,v] of [42,32,63,56,21,72,84,48,35,64].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1
console.log('j1 now:',await now(1));await shot(RS(1,'think'),'c-j1-start');
await rodMiss(1,'think',4);console.log(' miss:',await ro(1,'think'));
await rodTo(1,'think',4,'L');console.log(' L:',await ro(1,'think'),'| now:',await now(1));await shot(RS(1,'think'),'c-j1-L');
await rodTo(1,'think',7,'R');console.log(' R:',await ro(1,'think'),'| now:',await now(1));
await tapAll(1,'think','.tr-side');console.log(' sides:',await ro(1,'think'),'| now:',await now(1));await shot(RS(1,'think'),'c-j1-closed');
await p.fill('#w-think','It has 3 straight sides. They meet end to end with no gaps, so it is closed.');await check(1);console.log('after j1',await prog());
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);
// JOB 2
console.log('j2 now:',await now(2));
await pin(2,'yt',1,8);await pin(2,'yt',4,8);await pin(2,'yt',8,8);await pin(2,'yt',1,8);console.log(' flat:',await ro(2,'yt'));
await p.click(RS(2,'yt')+' .tr-redo');await p.waitForTimeout(150);
await pin(2,'yt',1,8);await pin(2,'yt',8,8);await pin(2,'yt',4,2);await pin(2,'yt',1,8);console.log(' closed:',await ro(2,'yt'),'| now:',await now(2));
await tapAll(2,'yt','.tr-side');console.log(' sides:',await ro(2,'yt'),'| now:',await now(2));
await tapAll(2,'yt','.tr-vt');console.log(' verts:',await ro(2,'yt'),'| now:',await now(2));await shot(RS(2,'yt'),'c-j2');
await fill(2,[3,4,3]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[3,3,3]);await check(2);console.log('after j2',await prog());
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3
console.log('j3 now:',await now(3));await shot(RS(3,'ben'),'c-j3-start');
await card(3,'ben','yes');await cardDrag(3,'ben','not');console.log(' now:',await now(3));
let s=GP(1,8);await dragTo(RS(3,'ben'),'.tr-end',s[0]+60,s[1]-90);console.log(' miss:',await ro(3,'ben'));
await dragTo(RS(3,'ben'),'.tr-end',s[0],s[1]);console.log(' closed:',await ro(3,'ben'),'| now:',await now(3));await shot(RS(3,'ben'),'c-j3-closed');
await p.fill('#w-ben','Your sides did not meet. There was a gap, so it was not closed.');await check(3);console.log('after j3',await prog());
// JOB 4
console.log('j4 now:',await now(4));await card(4,'mia','yes');await card(4,'mia','not');console.log(' now:',await now(4));
await p.click(RS(4,'mia')+' .tr-st');await p.waitForTimeout(150);console.log(' straight tap:',await ro(4,'mia'));
{const m=await map(RS(4,'mia'));const a=GP(1,8),c=GP(9,8);await p.mouse.click(m.x((a[0]+c[0])/2),m.y(a[1]+60));await p.waitForTimeout(200);}
console.log(' found:',await ro(4,'mia'),'| now:',await now(4));await shot(RS(4,'mia'),'c-j4-found');
await p.click(RS(4,'mia')+' .tr-fix');await p.waitForTimeout(200);console.log(' fixed:',await ro(4,'mia'),'| now:',await now(4));
await p.fill('#w-mia','One side was curved. A triangle needs 3 straight sides.');await check(4);console.log('after j4',await prog());
// JOB 5
console.log('j5 now:',await now(5));await rodTo(5,'kai',2,'L');console.log(' L:',await ro(5,'kai'),'| now:',await now(5));
await rodTo(5,'kai',3,'R');console.log(' R:',await ro(5,'kai'),'| now:',await now(5));await shot(RS(5,'kai'),'c-j5');
await fill(5,[6]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[5]);await check(5);
await p.fill('#w-kai','The two short rods together are 5. The long rod is 8, so they cannot reach. There is a gap.');await check(5);console.log('after j5',await prog());
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6
console.log('j6 now:',await now(6));
await pin(6,'own',2,8);await pin(6,'own',6,8);await pin(6,'own',2,3);await pin(6,'own',2,8);console.log(' wrong legs:',await ro(6,'own'));
await p.click(RS(6,'own')+' .tr-redo');await pin(6,'own',2,8);await pin(6,'own',5,8);await pin(6,'own',4,3);await pin(6,'own',2,8);console.log(' no corner:',await ro(6,'own'));
await p.click(RS(6,'own')+' .tr-redo');await pin(6,'own',2,8);await pin(6,'own',5,8);await pin(6,'own',2,3);await pin(6,'own',2,8);console.log(' made:',await ro(6,'own'),'| now:',await now(6));
s=GP(2,8);await dragTo(RS(6,'own'),'.tr-sq',s[0]+150,s[1]-200);console.log(' sq miss:',await ro(6,'own'));
await dragTo(RS(6,'own'),'.tr-sq',s[0],s[1]);console.log(' sq:',await ro(6,'own'),'| now:',await now(6));await shot(RS(6,'own'),'c-j6');
await p.fill('#w-own','It has 3 straight sides and it is closed. The set square fits the corner exactly.');await check(6);console.log('after j6',await prog());
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(400);
// JOB 7
console.log('j7 now:',await now(7));
for(const n of [1,2,3,4,5,6,7,8,9,10]){await p.click(`${RS(7,'wow')} .tr-rod[data-n="${n}"]`);await p.waitForTimeout(150);console.log(`  rod ${n}:`,await ro(7,'wow'));if(n===4||n===6||n===10)await shot(RS(7,'wow'),'c-j7-'+n);}
console.log(' now:',await now(7));
await fill(7,[4,10]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[5,9]);await check(7);console.log('after j7',await prog());await shot(J(7),'c-j7');
await p.fill('#w-prove','First count the sides: a triangle has 3. Check that every side is straight and that they meet with no gaps. A shape with a curved side is not a triangle.');await p.click(J(8)+' .sb-btn.check');await p.waitForTimeout(200);console.log('after j8',await prog());
const BQ='.sb-qgroup[data-done="bonus"]';await p.fill(BQ+' .sb-ans','2');await p.click(BQ+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BQ+' .sb-fb'));await p.fill(BQ+' .sb-ans','3');await p.click(BQ+' .sb-btn.check');console.log('bonus:',await p.textContent(BQ+' .sb-fb'));
await shot('.sb-listen','c-listen');
await p.reload();await p.waitForTimeout(900);console.log('after reload',await prog());await p.click('[data-tab="learn"]');await p.waitForTimeout(300);await p.click('.sb-pstep[data-st="1"]');await p.waitForTimeout(300);await shot(RS(2,'yt'),'c-j2-reload');
const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);console.log('sideways scroll:',sw);
console.log('errors:',errs.length?errs:'none');await b.close();})();
