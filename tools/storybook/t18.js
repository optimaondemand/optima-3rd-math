// 3.11.06 playthrough: node t18.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-11-06.html');
await p.goto(URL);await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(900);
const J=j=>`section[data-job="${j}"]`;const sfx=W===1150?'':'-'+W;
const shot=async(sel,n)=>{const e=await p.$(sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(200);await e.screenshot({path:'shots/'+n+sfx+'.png'});};
const fill=async(job,vals)=>{const ins=await p.$$(`${J(job)} .sb-step.now .sb-ans`);if(ins.length!==vals.length)console.log('!! job',job,'boxes',ins.length,'vals',vals.length);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{await p.click(`${J(job)} .sb-step.now .sb-btn.check`);await p.waitForTimeout(150);};
const fb=async(job)=>p.textContent(`${J(job)} .sb-step.now .sb-fb`).catch(()=>'(none)');
const now=async(job)=>{await p.waitForTimeout(450);const h=await p.evaluate(j=>{const x=document.querySelector(`section[data-job="${j}"] .sb-hand`);if(!x)return 'no hand';const t=document.querySelector(`section[data-job="${j}"] .sb-cue-on, section[data-job="${j}"] [data-cued]`);return (x.hidden?'HIDDEN ':'')+(x.dataset.t||'')},job);const t=await p.textContent(`${J(job)} .sb-step.now h4`).catch(()=>'(none)');return t+'  [hand: '+h+']';};
const prog=async()=>p.textContent('.sb-prog .n');
const RS=(j,n)=>`${J(j)} [data-name="${n}"]`;
const ro=async(j,n)=>p.textContent(RS(j,n)+' .sb-readout');
async function tapW(j,n,g,k=1){for(let i=0;i<k;i++){await p.click(`${RS(j,n)} .wg-w[data-g="${g}"]`);await p.waitForTimeout(80);}console.log(` j${j} +${g}x${k}:`,await ro(j,n));}
async function tapOn(j,n,i=0){const on=await p.$$(`${RS(j,n)} .wg-on`);await on[i].click();await p.waitForTimeout(120);console.log(` j${j} take off #${i}:`,await ro(j,n));}
async function tapItem(j,n){await p.click(`${RS(j,n)} .wg-item.wg-next`);await p.waitForTimeout(150);console.log(` j${j} item:`,await ro(j,n),'| now:',await now(j));}
// real mouse drag of a node to a fraction of the svg box
async function dragTo(j,n,sel,fx,fy){const s=await p.$(RS(j,n)+' svg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),s);await p.waitForTimeout(150);const bb=await s.boundingBox();const h=await p.$(RS(j,n)+' '+sel);const hb=await h.boundingBox();const x=hb.x+hb.width/2,y=hb.y+hb.height/2;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+8,y-8,{steps:3});await p.mouse.move(bb.x+bb.width*fx,bb.y+bb.height*fy,{steps:14});await p.mouse.up();await p.waitForTimeout(250);console.log(` j${j} drag ${sel}:`,await ro(j,n),'| now:',await now(j));}
const RV='.sb-qgroup[data-done="review"]';
await shot('.sb-book','z-book');await shot('.sb-intro','z-intro');
await p.fill(RV+' .sb-ans >> nth=0','100');await p.fill(RV+' .sb-ans >> nth=1','870');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','1,000');await p.fill(RV+' .sb-ans >> nth=1','8070');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [7000,8000,1070,6900,9060,600,900,300,990,1000].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1
console.log('j1 now:',await now(1));await shot(J(1),'z-j1-start');
await dragTo(1,'think','.wg-item',0.5,0.3);await shot(RS(1,'think'),'z-j1-read');
await fill(1,[20,50]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[10,100]);await check(1);console.log('j1 now:',await now(1));
await fill(1,[19,190,1,90]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[9,'1,900',1,900]);await check(1);console.log('j1 now:',await now(1));
await p.fill('#w-think','Each mark is 100 g. The pointer passed 1 kg and went 9 more marks, so 1,900 g.');await check(1);console.log('after j1',await prog());await shot(J(1),'z-j1-done');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','z-learncard');
// JOB 2
console.log('j2 now:',await now(2));await tapW(2,'yt',1000);await tapW(2,'yt',500);await tapW(2,'yt',200);console.log('j2 now:',await now(2));await tapOn(2,'yt',2);
await dragTo(2,'yt','.wg-w[data-g="100"]',0.5,0.3);await tapW(2,'yt',50);console.log('j2 now:',await now(2));await shot(RS(2,'yt'),'z-j2-model');
await fill(2,[1,650,1650]);await check(2);console.log('after j2',await prog());await shot(J(2),'z-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3
console.log('j3 now:',await now(3));await tapW(3,'kai',1000,8);await tapW(3,'kai',20);console.log('j3 now:',await now(3));await shot(RS(3,'kai'),'z-j3-model');
await fill(3,[8000,820]);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,['8,000','8,020']);await check(3);
await p.fill('#w-kai','8 kg is 8,000 g so 820 is too light. The zero goes in the hundreds place: 8,020.');await check(3);console.log('after j3',await prog());await shot(J(3),'z-j3');
// JOB 4
console.log('j4 now:',await now(4));await tapW(4,'leo',1000,6);await tapW(4,'leo',200);await tapW(4,'leo',100);console.log('j4 now:',await now(4));await shot(RS(4,'leo'),'z-j4-model');
await fill(4,[100,600,900]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[1000,6000,6300]);await check(4);
await p.fill('#w-leo','A meter is 100 cm but a kilogram is 1,000 g, so 6 kg is 6,000 g.');await check(4);console.log('after j4',await prog());await shot(J(4),'z-j4');
// JOB 5
console.log('j5 now:',await now(5));await shot(RS(5,'juno'),'z-j5-start');await tapItem(5,'juno');await tapItem(5,'juno');await shot(RS(5,'juno'),'z-j5-model');
await fill(5,[1850,'A',150]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,['1,850','b',150]);await check(5);
await p.fill('#w-juno','First write both weights in grams. 1 kg 850 g is 1,850 g, more than 1,700 g.');await check(5);console.log('after j5',await prog());await shot(J(5),'z-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6
console.log('j6 now:',await now(6));await tapItem(6,'own');await shot(RS(6,'own'),'z-j6-model');
await fill(6,[10,100]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[20,50]);await check(6);
await fill(6,[3,1150,1,150]);await check(6);await fill(6,[905]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,['9,005']);await check(6);
await p.fill('#w-own','From 0 to 1 kg I counted 20 marks, so each mark is 50 g.');await check(6);console.log('after j6',await prog());await shot(J(6),'z-j6');
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
// JOB 7
console.log('j7 now:',await now(7));await shot(J(7),'z-j7-start');
await tapW(7,'wow',500);await tapW(7,'wow',200);await tapW(7,'wow',100);await shot(RS(7,'wow'),'z-j7-heavy');await tapOn(7,'wow',2);await tapW(7,'wow',20);console.log('j7 now:',await now(7));await shot(RS(7,'wow'),'z-j7-model');
await fill(7,[820]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[720]);await check(7);
await fill(7,[380]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[280]);await check(7);console.log('after j7',await prog());await shot(J(7),'z-j7');
await p.fill('#w-prove','I put 500 g, 200 g and 20 g on the right pan until it was level. The box weighs 720 g. 1,000 - 720 = 280.');await check(8);console.log('after j8',await prog());await shot(J(8),'z-j8');
const BN='.sb-qgroup[data-done="bonus"]';await p.fill(BN+' .sb-ans','607');await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));await p.fill(BN+' .sb-ans','6,007');await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
console.log('errors:',errs.length?errs:'none');await b.close();})();
