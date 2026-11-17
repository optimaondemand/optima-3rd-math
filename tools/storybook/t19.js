// 3.11.07 playthrough: node t17.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-11-07.html');
await p.goto(URL);await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(900);
const J=j=>`section[data-job="${j}"]`;const sfx=W===1150?'':'-'+W;
const shot=async(sel,n)=>{const e=await p.$(sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(200);await e.screenshot({path:'shots/'+n+sfx+'.png'});};
const fill=async(job,vals)=>{const ins=await p.$$(`${J(job)} .sb-step.now .sb-ans`);if(ins.length!==vals.length)console.log('!! job',job,'boxes',ins.length,'vals',vals.length);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{await p.click(`${J(job)} .sb-step.now .sb-btn.check`);await p.waitForTimeout(150);};
const fb=async(job)=>p.textContent(`${J(job)} .sb-step.now .sb-fb`).catch(()=>'(none)');
const now=async(job)=>{await p.waitForTimeout(450);const h=await p.evaluate(j=>{const x=document.querySelector(`section[data-job="${j}"] .sb-hand`);return x?(x.hidden?'HIDDEN ':'')+x.dataset.t:'no hand'},job);const t=await p.textContent(`${J(job)} .sb-step.now h4`).catch(()=>'(none)');return t+'  [hand: '+h+']';};
const prog=async()=>p.textContent('.sb-prog .n');
const RS=(j,n)=>`${J(j)} [data-name="${n}"]`;
async function dragY(j,n,cls,yv){const s=await p.$(RS(j,n)+' svg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),s);await p.waitForTimeout(120);const bb=await s.boundingBox();const vb=(await s.getAttribute('viewBox')).split(' ').map(Number);const k=bb.height/vb[3];const h=await p.$(RS(j,n)+' '+cls);const hb=await h.boundingBox();const x=hb.x+hb.width/2,y=hb.y+hb.height/2;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x,y-10,{steps:3});await p.mouse.move(x,bb.y+yv*k,{steps:12});await p.mouse.up();await p.waitForTimeout(250);}
const narrow=async(j,n)=>p.evaluate(s=>document.querySelector(s).clientWidth<560,RS(j,n));
async function bkY(j,n,cap,v){const nw=await narrow(j,n);const y0=nw?52:40,bh=nw?360:250;return y0+bh-v/cap*bh;}
function thY(nw,F){const yT=40,yL=nw?560:400;return yL-(F-30)/80*(yL-yT);}
const ro=async(j,n)=>p.textContent(RS(j,n)+' .sb-readout');
async function map(sel){const s=await p.$(sel+' svg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),s);await p.waitForTimeout(150);const bb=await s.boundingBox();const vb=(await s.getAttribute('viewBox')).split(' ').map(Number);return {x:v=>bb.x+v*bb.width/vb[2],y:v=>bb.y+v*bb.height/vb[3]};}
const give=async(j,n)=>{await p.click(`${RS(j,n)} .cm-m.cm-next`);await p.waitForTimeout(200);console.log(` j${j} give:`,await ro(j,n),'| now:',await now(j));};
const brk=async(j,n)=>{await p.click(`${RS(j,n)} .cm-break`);await p.waitForTimeout(200);console.log(` j${j} break:`,await ro(j,n),'| now:',await now(j));};
const cut=async(j,n,v)=>{const m=await map(RS(j,n));const e=await p.$(`${RS(j,n)} .cm-sc`);const bb=await e.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+12,bb.y+bb.height/2,{steps:3});await p.mouse.move(m.x(14+v*6.72),bb.y+bb.height/2,{steps:10});await p.mouse.up();await p.waitForTimeout(250);console.log(` j${j} cut ${v}:`,await ro(j,n),'| now:',await now(j));};
// bar model: drag a chip (by its label) onto a slot (w, p0, p1…); tap mode when tap=true
async function chip(j,n,label,k,tap){const c=(await p.$$(`${RS(j,n)} .bm-chip:not([hidden])`));let el=null;for(const e of c){if((await e.textContent()).trim()===label){el=e;break;}}if(!el){console.log('!! no chip',label);return;}
  const s=await p.$(`${RS(j,n)} .bm-slot[data-k="${k}"]`);await s.scrollIntoViewIfNeeded();
  if(tap){await el.click();await p.waitForTimeout(80);await s.click();}else{const a=await el.boundingBox(),b=await s.boundingBox();await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();await p.mouse.move(a.x+a.width/2+10,a.y+a.height/2-10,{steps:3});await p.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await p.mouse.up();}
  await p.waitForTimeout(200);console.log(` j${j} ${label}→${k}:`,await ro(j,n));}
const tapItem=async(j,n)=>{await p.click(`${RS(j,n)} .wg-item.wg-next`);await p.waitForTimeout(200);console.log(` j${j} item:`,await ro(j,n),'| now:',await now(j));};
const RV='.sb-qgroup[data-done="review"]';
await shot('.sb-book','v-book');await shot('.sb-intro','v-intro');
await p.fill(RV+' .sb-ans >> nth=0','100');await p.fill(RV+' .sb-ans >> nth=1','480');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','1,000');await p.fill(RV+' .sb-ans >> nth=1','4080');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [72,360,910,1300,1000,700,600,147,1410,100].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1
console.log('j1 now:',await now(1));await give(1,'think');await give(1,'think');await brk(1,'think');await cut(1,'think',48);await shot(RS(1,'think'),'v-j1-model');
await fill(1,[48,3,3,48]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[52,2,2,52]);await check(1);console.log('j1 now:',await now(1));
await p.fill('#w-think','I handed over 2 whole meters. Then I broke a meter into 100 cm and cut 48 cm, so 2 m 52 cm is left.');await check(1);console.log('after j1',await prog());await shot(J(1),'v-j1-done');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','v-learncard');
// JOB 2
console.log('j2 now:',await now(2));await shot(RS(2,'yt'),'v-j2-start');await chip(2,'yt','1 km 490 m','w');await chip(2,'yt','?','p0');await chip(2,'yt','?','w');await chip(2,'yt','1 km 490 m','p0',true);await chip(2,'yt','880 m','p1');console.log('j2 now:',await now(2));await shot(RS(2,'yt'),'v-j2-model');
await fill(2,[1490,1370]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,['1,490','2,370']);await check(2);
await fill(2,[2,370]);await check(2);console.log('after j2',await prog());await shot(J(2),'v-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3
console.log('j3 now:',await now(3));await chip(3,'kai','45 cm','w');await chip(3,'kai','3 m 10 cm','w');await chip(3,'kai','45 cm','p0');await chip(3,'kai','?','p1');console.log('j3 now:',await now(3));await shot(RS(3,'kai'),'v-j3-model');
await fill(3,[310,335,3,35]);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,[310,265,2,65]);await check(3);
await p.fill('#w-kai','A cut plank gets shorter, but 3 m 35 cm is longer. Change 3 m 10 cm to 310 cm, then 310 − 45 = 265 cm = 2 m 65 cm.');await check(3);console.log('after j3',await prog());await shot(J(3),'v-j3');
// JOB 4
console.log('j4 now:',await now(4));await chip(4,'leo','?','w');await chip(4,'leo','2 kg 840 g','p0');await chip(4,'leo','1 kg 370 g','p1');console.log('j4 now:',await now(4));await shot(RS(4,'leo'),'v-j4-model');
await fill(4,[3210]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,['4,210']);await check(4);
await fill(4,[3,1210]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[4,210]);await check(4);
await p.fill('#w-leo','1,210 g is more than 1,000 g, so it has another kilogram. 3 kg 1,210 g = 4 kg 210 g.');await check(4);console.log('after j4',await prog());await shot(J(4),'v-j4');
// JOB 5
console.log('j5 now:',await now(5));let nw=await narrow(5,'temp');await dragY(5,'temp','.th-ptr',thY(nw,58));console.log(' th 58:',await ro(5,'temp'),'| now:',await now(5));await shot(RS(5,'temp'),'v-j5-read');
await fill(5,[56]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[58]);await check(5);console.log('j5 now:',await now(5));
await dragY(5,'temp','.th-top',thY(nw,76));console.log(' th 76:',await ro(5,'temp'),'| now:',await now(5));await shot(RS(5,'temp'),'v-j5-model');
await fill(5,[134]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[18]);await check(5);console.log('after j5',await prog());await shot(J(5),'v-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6
console.log('j6 now:',await now(6));await chip(6,'own','5 L','w');await chip(6,'own','2 L 600 mL','p0');await chip(6,'own','?','p1');await chip(6,'own','1 L 900 mL','p1');await chip(6,'own','?','p2');console.log('j6 now:',await now(6));await shot(RS(6,'own'),'v-j6-model');
await fill(6,[3500,3,500]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,['4,500',4,500]);await check(6);
await fill(6,[500]);await check(6);
await p.fill('#w-own','First I found how much water is in the tank. Then I found what is still empty.');await check(6);console.log('after j6',await prog());await shot(J(6),'v-j6');
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
// JOB 7
console.log('j7 now:',await now(7));await shot(J(7),'v-j7-start');
await dragY(7,'wow-bk','.bk-fill',await bkY(7,'wow-bk',2000,1100));console.log(' fill 1100:',await ro(7,'wow-bk'),'| now:',await now(7));
await dragY(7,'wow-bk','.bk-fill',await bkY(7,'wow-bk',2000,1150));console.log(' fill 1150:',await ro(7,'wow-bk'),'| now:',await now(7));
await p.click(`${RS(7,'wow')} .wg-item >> nth=1`).catch(e=>console.log('tap water first failed'));await p.waitForTimeout(200);console.log(' water first:',await ro(7,'wow'));
await tapItem(7,'wow');await shot(RS(7,'wow'),'v-j7-bucket');
await fill(7,[550]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[500]);await check(7);console.log('j7 now:',await now(7));
await tapItem(7,'wow');await shot(RS(7,'wow'),'v-j7-model');
await fill(7,[1150,1650,1,650]);await check(7);console.log('j7 now:',await now(7));
await fill(7,[1650,1,650]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,['1,350',1,350]);await check(7);console.log('after j7',await prog());await shot(J(7),'v-j7');
await p.fill('#w-prove','The question was how many more grams make 3 kg. My bar model showed 3 kg as the whole and 1 kg 650 g as one part. I changed to grams: 3,000 − 1,650 = 1,350. My answer is 1 kg 350 g.');await check(8);console.log('after j8',await prog());await shot(J(8),'v-j8');
const BN='.sb-qgroup[data-done="bonus"]';await p.fill(BN+' .sb-ans >> nth=0','330');await p.fill(BN+' .sb-ans >> nth=1','2');await p.fill(BN+' .sb-ans >> nth=2','70');await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));await p.fill(BN+' .sb-ans >> nth=1','1');await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
console.log('errors:',errs.length?errs:'none');await b.close();})();
