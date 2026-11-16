// 3.11.05 playthrough: node t17.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-11-05.html');
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
// drag a slider handle (pointer / water top / red line) with the mouse to an svg y
async function dragY(j,n,cls,yv){const s=await p.$(RS(j,n)+' svg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),s);await p.waitForTimeout(120);const bb=await s.boundingBox();const vb=(await s.getAttribute('viewBox')).split(' ').map(Number);const k=bb.height/vb[3];const h=await p.$(RS(j,n)+' '+cls);const hb=await h.boundingBox();const x=hb.x+hb.width/2,y=hb.y+hb.height/2;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x,y-10,{steps:3});await p.mouse.move(x,bb.y+yv*k,{steps:12});await p.mouse.up();await p.waitForTimeout(250);}
const narrow=async(j,n)=>p.evaluate(s=>document.querySelector(s).clientWidth<560,RS(j,n));
async function bkY(j,n,cap,v){const nw=await narrow(j,n);const y0=nw?52:40,bh=nw?360:250;return y0+bh-v/cap*bh;}
async function ptr(j,n,cap,v){await dragY(j,n,'.bk-ptr',await bkY(j,n,cap,v));console.log(` j${j} pointer→${v}:`,await ro(j,n),'| now:',await now(j));}
async function fillTo(j,n,cap,v){await dragY(j,n,'.bk-fill',await bkY(j,n,cap,v));console.log(` j${j} fill→${v}:`,await ro(j,n),'| now:',await now(j));}
async function keys(j,n,cls,key,k){for(let i=0;i<k;i++){await p.focus(RS(j,n)+' '+cls);await p.keyboard.press(key);await p.waitForTimeout(40);}console.log(` j${j} ${cls} ${key}x${k}:`,await ro(j,n),'| now:',await now(j));}
async function tapB(j,n,k){for(let i=0;i<k;i++){await p.click(`${RS(j,n)} g.bk-bot.bk-next`);await p.waitForTimeout(120);}console.log(` j${j} bottles x${k}:`,await ro(j,n),'| now:',await now(j));}
async function pour(j,n,i){await p.click(`${RS(j,n)} .bk-pour[data-i="${i}"]`);await p.waitForTimeout(200);console.log(` j${j} pour ${i}:`,await ro(j,n),'| now:',await now(j));}
function thY(nw,F){const yT=40,yL=nw?560:400;return yL-(F-30)/80*(yL-yT);}
const RV='.sb-qgroup[data-done="review"]';
await shot('.sb-book','y-book');await shot('.sb-intro','y-intro');
await p.fill(RV+' .sb-ans >> nth=0','100');await p.fill(RV+' .sb-ans >> nth=1','580');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','1,000');await p.fill(RV+' .sb-ans >> nth=1','5080');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [6000,9000,1350,8600,7060,900,400,200,300,500].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1
console.log('j1 now:',await now(1));await shot(J(1),'y-j1-start');
await ptr(1,'think',2000,1700);await ptr(1,'think',2000,1850);await shot(RS(1,'think'),'y-j1-read');
await fill(1,[100,1700]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[50,'1,850']);await check(1);console.log('j1 now:',await now(1));
await pour(1,'think',0);await shot(RS(1,'think'),'y-j1-pour');
await fill(1,[1850,1,850]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[850,1,850]);await check(1);console.log('j1 now:',await now(1));
await p.fill('#w-think','Each mark is 50 mL. The milk is at 1,850 mL. One bottle took 1,000 mL so 1 L 850 mL.');await check(1);console.log('after j1',await prog());await shot(J(1),'y-j1-done');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','y-learncard');
// JOB 2
console.log('j2 now:',await now(2));await tapB(2,'yt',1);await fillTo(2,'yt',1000,850);await fillTo(2,'yt',1000,900);await shot(RS(2,'yt'),'y-j2-model');
await fill(2,[100,1900]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,['1,000','1,900']);await check(2);console.log('j2 now:',await now(2));
await p.evaluate(()=>document.querySelector('[data-name="yt-sym"]').scrollIntoView({block:'center'}));
await p.click('[data-name="yt-sym"] .sym-card[data-s="<"]');await p.waitForTimeout(200);console.log(' j2 sym <:',await p.textContent('[data-name="yt-sym"] .sb-readout'));
await p.click('[data-name="yt-sym"] .sym-card[data-s=">"]');await p.waitForTimeout(300);console.log(' j2 sym >:',await p.textContent('[data-name="yt-sym"] .sb-readout'),'| now:',await now(2));
await fill(2,[900]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[90]);await check(2);console.log('after j2',await prog());await shot(J(2),'y-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3
console.log('j3 now:',await now(3));await keys(3,'kai','.bk-ptr','ArrowUp',9);await shot(RS(3,'kai'),'y-j3-model');
await fill(3,[9,100]);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,[4,50]);await check(3);
await fill(3,[900,900]);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,[450,450]);await check(3);
await p.fill('#w-kai','Each mark is not 100. From 0 to 200 there are 4 marks, so each mark is 50 mL.');await check(3);console.log('after j3',await prog());await shot(J(3),'y-j3');
// JOB 4
console.log('j4 now:',await now(4));await tapB(4,'leo',5);await fillTo(4,'leo',100,60);await shot(RS(4,'leo'),'y-j4-model');
await fill(4,[100,500,560]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[1000,5000,5060]);await check(4);
await p.fill('#w-leo','A meter is 100 cm but a liter is 1,000 mL, so 5 L is 5,000 mL.');await check(4);console.log('after j4',await prog());await shot(J(4),'y-j4');
// JOB 5
console.log('j5 now:',await now(5));await ptr(5,'juno',500,300);
await fill(5,[500,'top']);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[300,'capacity']);await check(5);console.log('j5 now:',await now(5));
await fillTo(5,'juno',500,500);await shot(RS(5,'juno'),'y-j5-model');
await fill(5,[300]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[200]);await check(5);
await p.fill('#w-juno','The top number is the capacity. Read where the water stops: 300 mL.');await check(5);console.log('after j5',await prog());await shot(J(5),'y-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6
console.log('j6 now:',await now(6));await ptr(6,'own-bk',2000,1050);
await fill(6,[1500,1,500]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,['1,050',1,50]);await check(6);
await fill(6,[690]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[6090]);await check(6);console.log('j6 now:',await now(6));
let nw=await narrow(6,'own-th');await dragY(6,'own-th','.th-ptr',thY(nw,80));console.log(' th 80:',await ro(6,'own-th'));await dragY(6,'own-th','.th-ptr',thY(nw,86));console.log(' th 86:',await ro(6,'own-th'),'| now:',await now(6));
await shot(RS(6,'own-th'),'y-j6-thermo');
await fill(6,[83,30]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[86,30]);await check(6);console.log('j6 now:',await now(6));
await dragY(6,'own-th','.th-top',thY(nw,70));console.log(' th drag 70:',await ro(6,'own-th'));await keys(6,'own-th','.th-top','ArrowDown',3);
console.log('after j6',await prog());await shot(J(6),'y-j6');
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
// JOB 7
console.log('j7 now:',await now(7));await shot(J(7),'y-j7-start');
await pour(7,'wow',0);await fill(7,[150]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[50]);await check(7);console.log('j7 now:',await now(7));
await pour(7,'wow',1);await shot(RS(7,'wow'),'y-j7-model');
await fill(7,[600,1,600]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[550,1,550]);await check(7);
await fill(7,[1450]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,['1,550']);await check(7);console.log('after j7',await prog());await shot(J(7),'y-j7');
await p.fill('#w-prove','First I poured beaker A. The bottle needed 50 mL more. Beaker B had 550 mL left. That is 1,550 mL.');await check(8);console.log('after j8',await prog());
const BN='.sb-qgroup[data-done="bonus"]';await p.fill(BN+' .sb-ans','805');await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));await p.fill(BN+' .sb-ans','8,005');await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
console.log('errors:',errs.length?errs:'none');await b.close();})();
