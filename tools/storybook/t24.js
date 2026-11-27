// 3.12.05 playthrough: node t24.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-12-05.html');
await p.goto(URL);await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(900);
const J=j=>`section[data-job="${j}"]`;const sfx=W===1150?'':'-'+W;
const shot=async(sel,n)=>{const e=await p.$(sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(200);await e.screenshot({path:'shots/'+n+sfx+'.png'});};
const fill=async(job,vals)=>{const ins=await p.$$(`${J(job)} .sb-step.now .sb-ans`);if(ins.length!==vals.length)console.log('!! job',job,'boxes',ins.length,'vals',vals.length);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{await p.click(`${J(job)} .sb-step.now .sb-btn.check`);await p.waitForTimeout(150);};
const fb=async(job)=>p.textContent(`${J(job)} .sb-step.now .sb-fb`).catch(()=>'(none)');
const now=async(job)=>{await p.waitForTimeout(450);const h=await p.evaluate(j=>{const x=document.querySelector(`section[data-job="${j}"] .sb-hand`);return x?(x.hidden?'HIDDEN ':'')+x.dataset.t:'no hand'},job);const t=await p.textContent(`${J(job)} .sb-step.now h4`).catch(()=>'(none)');return t+'  [hand: '+h+']';};
const prog=async()=>p.textContent('.sb-prog .n');
const RS=(j,n)=>`${J(j)} [data-name="${n}"]`;
const ro=async(sel)=>(await p.textContent(sel+' .sb-readout')).replace(/\s+/g,' ');
async function map(sel){const s=await p.$(sel+' svg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),s);await p.waitForTimeout(150);const bb=await s.boundingBox();const vb=(await s.getAttribute('viewBox')).split(' ').map(Number);return {x:v=>bb.x+(v-vb[0])*bb.width/vb[2],y:v=>bb.y+(v-vb[1])*bb.height/vb[3]};}
async function dragEl(a,bEl){await a.scrollIntoViewIfNeeded();const A=await a.boundingBox(),B=await bEl.boundingBox();await p.mouse.move(A.x+A.width/2,A.y+A.height/2);await p.mouse.down();await p.mouse.move(A.x+A.width/2+10,A.y+A.height/2-10,{steps:3});await p.mouse.move(B.x+B.width/2,B.y+B.height/2,{steps:14});await p.mouse.up();await p.waitForTimeout(250);}
const GP=(x,y)=>[130+30+x*38,10+30+y*38];
async function sqTo(sel,vx,vy){const m=await map(sel);const h=await p.$(sel+' .tn-sq');const hb=await h.boundingBox();const x=hb.x+12,y=hb.y+hb.height-12;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+8,y-8,{steps:3});await p.mouse.move(m.x(vx),m.y(vy),{steps:14});await p.mouse.up();await p.waitForTimeout(250);}
async function tapCorners(sel){const n=(await p.$$(sel+' .tn-cn')).length;for(let i=0;i<n;i++){const done=await p.$eval(`${sel} .tn-cn >> nth=${i}`,e=>e.classList.contains('done')).catch(()=>true);if(done)continue;await p.click(`${sel} .tn-cn >> nth=${i}`);await p.waitForTimeout(120);}}
async function name(sel,card,key,drag){const c=await p.$(`${sel} .tn-card[data-c="${card}"]`);const s=await p.$(`${sel} .tn-slot[data-key="${key}"]`);if(!c||!s){console.log('!! missing',card,key);return;}
  if(drag)await dragEl(c,s);else{await c.click();await p.waitForTimeout(80);await (await p.$(`${sel} .tn-slot[data-key="${key}"]`)).click();await p.waitForTimeout(150);}console.log(`  ${card}→${key}:`,await ro(sel));}
const pin=async(sel,x,y)=>{await p.click(`${sel} .tr-pin[data-p="${x},${y}"]`);await p.waitForTimeout(110);};
const band=async(sel,ps)=>{for(const q of ps)await pin(sel,q[0],q[1]);await pin(sel,ps[0][0],ps[0][1]);};
await shot('.sb-book','b-book');await shot('.sb-intro','b-intro');
// review: house corners
const RV='.sb-qgroup[data-done="review"]';
await sqTo(RV,GP(2,9)[0],GP(2,9)[1]);console.log('review sq:',await ro(RV));await tapCorners(RV);await shot(RV,'b-review');
await p.fill(RV+' .sb-ans','3');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans','2');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [27,48,63,36,81,24,108,42,45,72].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1 rod sort
const T1=RS(1,'think');console.log('j1 now:',await now(1));await shot(T1,'c-j1-start');
let rts=await p.$$(T1+' .tn-rt:not(.in)');await dragEl(rts[0],await p.$(T1+' .tn-grp[data-g="all"]'));console.log(' wrong:',await ro(T1));
rts=await p.$$(T1+' .tn-rt:not(.in)');await dragEl(rts[0],await p.$(T1+' .tn-grp[data-g="none"]'));console.log(' 5-7-9:',await ro(T1));
await p.click(T1+' .tn-rt:not(.in) >> nth=0');await p.click(T1+' .tn-grp[data-g="all"]');await p.waitForTimeout(150);console.log(' 7-7-7 tap:',await ro(T1));
await p.click(T1+' .tn-rt:not(.in) >> nth=0');await p.click(T1+' .tn-grp[data-g="two"]');await p.waitForTimeout(150);console.log(' 9-9-4:',await ro(T1),'| now:',await now(1));await shot(T1,'c-j1-sorted');
await p.fill('#w-think','I read the numbers. 7, 7, 7 are all the same. 9, 9, 4 has 2 the same. 5, 7, 9 has none the same.');await check(1);console.log('after j1',await prog());
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);
// JOB 2 two equal sides
const T2=RS(2,'yt');console.log('j2 now:',await now(2));
await band(T2,[[1,8],[5,8],[2,3]]);console.log(' scalene:',await ro(T2));await shot(T2,'c-j2-bad');
await p.click(T2+' .tr-redo');await p.waitForTimeout(150);
await band(T2,[[2,8],[8,8],[5,2]]);console.log(' made:',await ro(T2),'| now:',await now(2));
await name(T2,'scalene','u:s');await name(T2,'acute','u:s');await name(T2,'isosceles','u:s',true);console.log(' now:',await now(2));await shot(T2,'c-j2');
await fill(2,[3]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[2]);await check(2);console.log('after j2',await prog());
// JOB 3 corners
const T3=RS(3,'ang');console.log('j3 now:',await now(3));
await name(T3,'right','0:a');
await sqTo(T3,GP(1,4)[0],GP(1,4)[1]);console.log(' sq A:',await ro(T3));await sqTo(T3,GP(7,2)[0]+120,GP(7,2)[1]-60);console.log(' sq miss:',await ro(T3));
await tapCorners(T3);console.log(' all:',await ro(T3),'| now:',await now(3));await shot(T3,'c-j3-checked');
await name(T3,'obtuse','0:a');await name(T3,'right','0:a');await name(T3,'obtuse','1:a');await name(T3,'acute','2:a',true);console.log(' now:',await now(3));await shot(T3,'c-j3');
await fill(3,[1]);await check(3);console.log('after j3',await prog());
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 4 Ben
const T4=RS(4,'ben');console.log('j4 now:',await now(4));await tapCorners(T4);console.log(' corners:',await ro(T4),'| now:',await now(4));
await name(T4,'obtuse','0:a');await name(T4,'acute','0:a');console.log(' now:',await now(4));await shot(T4,'c-j4');
await p.fill('#w-ben','All 3 angles are smaller than a square corner, so it is acute. Size does not matter.');await check(4);console.log('after j4',await prog());
// JOB 5 Mia
const T5=RS(5,'mia');console.log('j5 now:',await now(5));await tapCorners(T5);console.log(' corners:',await ro(T5),'| now:',await now(5));
await name(T5,'acute','0:a');await name(T5,'right','0:a');console.log(' now:',await now(5));await shot(T5,'c-j5');
await p.fill('#w-mia','Your triangle is isosceles and right. One name is for the sides and one is for the angles.');await check(5);console.log('after j5',await prog());
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6 make
const T6=RS(6,'own');console.log('j6 now:',await now(6));
await band(T6,[[1,8],[7,8],[4,2]]);console.log(' isosceles:',await ro(T6));await p.click(T6+' .tr-redo');
await band(T6,[[1,8],[7,8],[1,3]]);console.log(' right:',await ro(T6));await p.click(T6+' .tr-redo');
await band(T6,[[1,8],[8,8],[3,6]]);console.log(' made:',await ro(T6),'| now:',await now(6));
await sqTo(T6,GP(3,6)[0],GP(3,6)[1]);console.log(' sq wide:',await ro(T6),'| now:',await now(6));
await name(T6,'obtuse','u:a');await tapCorners(T6);await name(T6,'obtuse','u:a');await name(T6,'isosceles','u:s');await name(T6,'scalene','u:s');console.log(' now:',await now(6));await shot(T6,'c-j6');
await p.fill('#w-own','It is scalene because the tick marks are all different. It is obtuse because one corner is wider than the set square.');await check(6);console.log('after j6',await prog());
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(400);
// JOB 7 Wow
const T7=RS(7,'wow');console.log('j7 now:',await now(7));await shot(T7,'c-j7-start');await tapCorners(T7);console.log(' corners | now:',await now(7));
await name(T7,'isosceles','2:s');await name(T7,'equilateral','2:s');await name(T7,'acute','2:a');await name(T7,'isosceles','0:s');await name(T7,'right','0:a');await name(T7,'scalene','1:s');await name(T7,'obtuse','1:a',true);
console.log('after j7',await prog());await shot(J(7),'c-j7');
await p.fill('#w-prove','First count the equal sides with tick marks. Then check each corner with the set square. Give one name for the sides and one for the angles.');await p.click(J(8)+' .sb-btn.check');await p.waitForTimeout(200);console.log('after j8',await prog());
const BQ='.sb-qgroup[data-done="bonus"]';await p.fill(BQ+' .sb-ans >> nth=0','3');await p.fill(BQ+' .sb-ans >> nth=1','1');await p.click(BQ+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BQ+' .sb-fb'));await p.fill(BQ+' .sb-ans >> nth=0','2');await p.click(BQ+' .sb-btn.check');console.log('bonus:',await p.textContent(BQ+' .sb-fb'));
await shot('.sb-listen','c-listen');
await p.reload();await p.waitForTimeout(900);console.log('after reload',await prog());await p.click('[data-tab="learn"]');await p.waitForTimeout(300);await p.click('.sb-pstep[data-st="3"]');await p.waitForTimeout(300);await shot(RS(6,'own'),'c-j6-reload');
const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);console.log('sideways scroll:',sw);
console.log('errors:',errs.length?errs:'none');await b.close();})();
