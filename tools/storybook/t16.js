// 3.11.04 playthrough: node t16.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-11-04.html');
await p.goto(URL);await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(900);
const J=j=>`section[data-job="${j}"]`;const sfx=W===1150?'':'-'+W;
const shot=async(sel,n)=>{const e=await p.$(sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(200);await e.screenshot({path:'shots/'+n+sfx+'.png'});};
const fill=async(job,vals)=>{const ins=await p.$$(`${J(job)} .sb-step.now .sb-ans`);if(ins.length!==vals.length)console.log('!! job',job,'boxes',ins.length,'vals',vals.length);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{await p.click(`${J(job)} .sb-step.now .sb-btn.check`);await p.waitForTimeout(150);};
const fb=async(job)=>p.textContent(`${J(job)} .sb-step.now .sb-fb`).catch(()=>'(none)');
const now=async(job)=>{await p.waitForTimeout(450);const h=await p.evaluate(j=>{const x=document.querySelector(`section[data-job="${j}"] .sb-hand`);return x?(x.hidden?'HIDDEN ':'')+x.dataset.t:'no hand'},job);const t=await p.textContent(`${J(job)} .sb-step.now h4`).catch(()=>'(none)');return t+'  [hand: '+h+']';};
const prog=async()=>p.textContent('.sb-prog .n');
const ro=async(sel)=>p.textContent(sel+' .sb-readout');
async function map(sel){const s=await p.$(sel+' svg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),s);await p.waitForTimeout(150);const bb=await s.boundingBox();const vb=(await s.getAttribute('viewBox')).split(' ').map(Number);return {x:v=>bb.x+v*bb.width/vb[2],y:v=>bb.y+v*bb.height/vb[3]};}
async function dragPt(m,x0,y0,x1,y1){await p.mouse.move(m.x(x0),m.y(y0));await p.mouse.down();await p.mouse.move(m.x((x0+x1)/2),m.y((y0+y1)/2),{steps:5});await p.mouse.move(m.x(x1),m.y(y1),{steps:5});await p.mouse.up();await p.waitForTimeout(150);}
async function dragEl(a,bSel){const A=await (typeof a==='string'?p.$(a):a);await p.evaluate(s=>{const e=document.querySelector(s);(e.closest('.sb-stage')||e).scrollIntoView({block:'center'})},bSel);await p.waitForTimeout(100);const ba=await A.boundingBox();const B=await p.$(bSel);const bb=await B.boundingBox();await p.mouse.move(ba.x+ba.width/2,ba.y+ba.height/2);await p.mouse.down();await p.mouse.move(ba.x+ba.width/2+10,ba.y+ba.height/2+10,{steps:3});await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2,{steps:8});await p.mouse.up();await p.waitForTimeout(200);}
const M=(j,mod)=>`${J(j)} [data-mod="${mod}"]`;
const RS=(j,n)=>`${J(j)} [data-name="${n}"]`;
const tapKm=async(j,n,k)=>{for(let i=0;i<k;i++){await p.click(`${RS(j,n)} g.ck-next`);await p.waitForTimeout(120);}console.log(` j${j} km x${k}:`,await ro(RS(j,n)),'| now:',await now(j));};
const brk=async(j,n)=>{await p.click(`${RS(j,n)} .ck-break`);await p.waitForTimeout(200);console.log(` j${j} break:`,await ro(RS(j,n)),'| now:',await now(j));};
const cut=async(j,n,v)=>{const m=await map(RS(j,n));const e=await p.$(`${RS(j,n)} .ck-sc`);const bb=await e.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+8,bb.y+bb.height/2,{steps:3});await p.mouse.move(m.x(14+v*0.672),bb.y+bb.height/2,{steps:14});await p.mouse.up();await p.waitForTimeout(250);console.log(` j${j} cut ${v}:`,await ro(RS(j,n)),'| now:',await now(j));};
const RV='.sb-qgroup[data-done="review"]';
await shot('.sb-book','x-book');await shot('.sb-intro','x-intro');
await p.fill(RV+' .sb-ans >> nth=0','100');await p.fill(RV+' .sb-ans >> nth=1','620');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','1,000');await p.fill(RV+' .sb-ans >> nth=1','6200');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [900,200,500,300,350,950,910,980,4000,7000].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1
console.log('j1 now:',await now(1));await shot(J(1),'x-j1-start');
await brk(1,'think');await cut(1,'think',600);await cut(1,'think',450);await shot(RS(1,'think'),'x-j1-model');
await fill(1,[650]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[550]);await check(1);console.log('j1 now:',await now(1));
await fill(1,[3,3,550]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[2,2,550]);await check(1);console.log('j1 now:',await now(1));
await fill(1,[300,2550]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,['3,000','2,550']);await check(1);console.log('j1 now:',await now(1));
await p.fill('#w-think','I broke one kilometer into 1,000 m and cut 450 m. 550 m were left and 2 whole kilometers.');await check(1);console.log('after j1',await prog());await shot(J(1),'x-j1-done');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','x-learncard');
// JOB 2
console.log('j2 now:',await now(2));await brk(2,'yt');await tapKm(2,'yt',2);await brk(2,'yt');await cut(2,'yt',640);
await fill(2,[460,4,4,460]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[360,4,4,360]);await check(2);
await fill(2,[1000,6]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,['1,000',7]);await check(2);console.log('after j2',await prog());await shot(J(2),'x-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3
console.log('j3 now:',await now(3));await tapKm(3,'kai',3);await brk(3,'kai');await cut(3,'kai',200);
await fill(3,[5,5,800]);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,[4,4,800]);await check(3);
await fill(3,[5,1]);await check(3);
await p.fill('#w-kai','When you break a kilometer it becomes 1,000 m, so it is not a whole kilometer anymore. Only 4 are whole.');await check(3);console.log('after j3',await prog());await shot(J(3),'x-j3');
// JOB 4
console.log('j4 now:',await now(4));await brk(4,'leo');await cut(4,'leo',70);
await fill(4,[100,30]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[1000,930]);await check(4);
await fill(4,[2,930]);await check(4);
await p.fill('#w-leo','A meter breaks into 100 cm but a kilometer breaks into 1,000 m.');await check(4);console.log('after j4',await prog());await shot(J(4),'x-j4');
// JOB 5
console.log('j5 now:',await now(5));await brk(5,'juno');await cut(5,'juno',900);
await fill(5,[900,100]);await check(5);
await fill(5,[5,900,'left']);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[5,100,'cut off']);await check(5);
await p.fill('#w-juno','Add 5 km 100 m and 900 m. You get 6 km, the whole road.');await check(5);console.log('after j5',await prog());await shot(J(5),'x-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6
console.log('j6 now:',await now(6));await tapKm(6,'own',2);await brk(6,'own');await cut(6,'own',480);
await fill(6,[6,620]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[6,520]);await check(6);
await fill(6,[760]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[660]);await check(6);
await p.fill('#w-own','I took away 2 km, broke one km, and cut 480 m. 6 km 520 m are left.');await check(6);console.log('after j6',await prog());await shot(J(6),'x-j6');
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
// JOB 7
console.log('j7 now:',await now(7));await shot(J(7),'x-j7-start');
await tapKm(7,'wow',2);await brk(7,'wow');await cut(7,'wow',350);
await fill(7,[3,750]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[3,650]);await check(7);console.log('j7 now:',await now(7));
await tapKm(7,'wow',1);await cut(7,'wow',800);await cut(7,'wow',900);await shot(RS(7,'wow'),'x-j7-model');
await fill(7,[1,100]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[2,100]);await check(7);console.log('after j7',await prog());await shot(J(7),'x-j7');
await p.fill('#w-prove','Step 1 I break one kilometer into 1,000 m. Step 2 I cut the meters. Step 3 I count the whole kilometers. I check by adding back.');await check(8);console.log('after j8',await prog());
const BN='.sb-qgroup[data-done="bonus"]';await p.fill(BN+' .sb-ans >> nth=0','6');await p.fill(BN+' .sb-ans >> nth=1','25');await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));await p.fill(BN+' .sb-ans >> nth=0','5');await p.fill(BN+' .sb-ans >> nth=1','925');await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
console.log('errors:',errs.length?errs:'none');await b.close();})();
