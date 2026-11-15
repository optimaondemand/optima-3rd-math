// 3.11.01 playthrough: node t13.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-11-01.html');
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
// strings: X0 70, seg 640/d, rows y 70 / 222
async function bridgeTo(j,r,from,to,d){const m=await map(M(j,'cmp'));const br=(await p.$$(`${M(j,'cmp')} .bridge`))[r];const bb=await br.boundingBox();const seg=640/d;await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(m.x(70+to*seg+5),bb.y+bb.height/2,{steps:8});await p.mouse.up();await p.waitForTimeout(150);}
async function pluckBoth(j){const s=await p.$$(`${M(j,'cmp')} .seg`);for(const e of s){await e.click({force:true});await p.waitForTimeout(80);}}
// tiles: LX 10, BW 680, rows y 86 / 172, RH 46
async function shadeTo(j,r,k,d,sel){/*d = that row's denominator*/const m=await map(sel||M(j,'cmp'));const y=[86,172][r]+23;await p.mouse.click(m.x(10+(k-0.5)*680/d),m.y(y));await p.waitForTimeout(120);}
async function dots(sel,d,ks){for(const k of ks){const m=await map(sel);await p.mouse.click(m.x(60+k/d*680),m.y(120));await p.waitForTimeout(150);}}
const sym=async(sel,s)=>{await p.click(`${sel} .sym-card[data-s="${s}"]`);await p.waitForTimeout(120);};


const pp=async(j,r,act,n=1)=>{for(let i=0;i<n;i++){await p.click(`${M(j,'pipes')} .pp-row[data-r="${r}"] .pp-${act}`);await p.waitForTimeout(40);}};
const blow=async(j,r)=>{const e=(await p.$$(`${M(j,'pipes')} .pp-row[data-r="${r}"] .pp-piece`))[0];await e.click({force:true});await p.waitForTimeout(120);};
async function dots2(sel,r,n,k){const m=await map(sel);const hs=await p.$$(sel+' .nl-hit');const h=r===0?hs[0]:hs[hs.length-1];const hb=await h.boundingBox();await p.mouse.click(m.x(60+k/n*680),hb.y+hb.height/2);await p.waitForTimeout(150);}





const RS=(j,n)=>`${J(j)} [data-name="${n}"]`;
const kl=672/165;
const lay=async(j,n,dragFirst)=>{if(dragFirst){await dragEl(`${RS(j,n)} [aria-label="Meter stick"]`,`${RS(j,n)} svg`);}else{await p.click(`${RS(j,n)} [aria-label="Centimeter ruler"]`);console.log(' ruler-first msg:',await ro(RS(j,n)));await p.click(`${RS(j,n)} [aria-label="Meter stick"]`);}await p.waitForTimeout(150);console.log(` j${j} after stick:`,await ro(RS(j,n)),'| now:',await now(j));await p.click(`${RS(j,n)} [aria-label="Centimeter ruler"]`);await p.waitForTimeout(150);console.log(` j${j} after ruler:`,await ro(RS(j,n)),'| now:',await now(j));};
const toZero=async(j,n,useDrag)=>{const sel=`${RS(j,n)} .ms-obj`;if(useDrag){const e=await p.$(sel);await p.evaluate(s=>document.querySelector(s).closest('.sb-stage').scrollIntoView({block:'center'}),sel);await p.waitForTimeout(150);const bb=await e.boundingBox();await p.mouse.move(bb.x+40,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x-10,bb.y+bb.height/2,{steps:6});await p.mouse.move(bb.x-80,bb.y+bb.height/2,{steps:6});await p.mouse.up();await p.waitForTimeout(200);}else{await p.focus(sel);await p.keyboard.press('ArrowLeft');await p.waitForTimeout(150);}console.log(` j${j} zero:`,await ro(RS(j,n)),'| now:',await now(j));};
const cutTo=async(n,len)=>{const sel=`${RS(7,n)} .ms-end`;const m=await map(RS(7,n));const e=await p.$(sel);const bb=await e.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+15,bb.y+bb.height/2,{steps:3});await p.mouse.move(m.x(14+len*kl),bb.y+bb.height/2,{steps:10});await p.mouse.up();await p.waitForTimeout(250);console.log(' cut',len,':',await ro(RS(7,n)),'| now:',await now(7));};
const RV='.sb-qgroup[data-done="review"]';
await shot('.sb-book','x-book');await shot('.sb-intro','x-intro');
await p.fill(RV+' .sb-ans','10');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans','9');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));await shot(RV,'x-review');
for(const [i,v] of [125,109,918,906,562,800,900,163,509,805].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1
console.log('j1 now:',await now(1));await shot(J(1),'x-j1-start');
await lay(1,'think',true);await shot(RS(1,'think'),'x-j1-model');
await fill(1,[1,36]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[1,37]);await check(1);console.log('j1 now:',await now(1));
await fill(1,[37]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[137]);await check(1);console.log('j1 now:',await now(1));
await check(1);console.log('j1 empty write:',await fb(1));
await p.fill('#w-think','The cloth is 1 m 37 cm and also 137 cm because 1 meter is 100 cm.');await check(1);console.log('after j1',await prog());await shot(J(1),'x-j1-done');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','x-learncard');
// JOB 2
console.log('j2 now:',await now(2));await lay(2,'yt',false);
await fill(2,[1,25]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[1,52]);await check(2);console.log('j2 now:',await now(2));
await fill(2,[800,89]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[800,890]);await check(2);console.log('after j2',await prog());await shot(J(2),'x-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3
console.log('j3 now:',await now(3));await shot(J(3),'x-j3-start');
await fill(3,['longer']);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,['shorter']);await check(3);console.log('j3 now:',await now(3));
await fill(3,[90]);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,[900]);await check(3);
await fill(3,[94]);await check(3);console.log('j3 wrong (Juno):',await fb(3));await fill(3,[904]);await check(3);
await p.fill('#w-juno','9 meters is 900 cm so 9 m 4 cm is 904. The zero shows there are no tens.');await check(3);console.log('after j3',await prog());await shot(J(3),'x-j3');
// JOB 4
console.log('j4 now:',await now(4));await shot(J(4),'x-j4-start');await toZero(4,'leo',true);
await fill(4,[19]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[18]);await check(4);console.log('j4 now:',await now(4));
await fill(4,[2]);await check(4);console.log('j4 wrong2:',await fb(4));await fill(4,[1]);await check(4);
await p.fill('#w-leo','Line up the end with 0 because starting at 1 adds an extra centimeter.');await check(4);console.log('after j4',await prog());await shot(J(4),'x-j4');
// JOB 5
console.log('j5 now:',await now(5));await toZero(5,'kai',false);
await fill(5,['longer']);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,['shorter']);await check(5);console.log('j5 now:',await now(5));
await fill(5,[12]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[102]);await check(5);console.log('j5 now:',await now(5));
await sym(RS(5,'kai-sym'),'<');console.log('j5 sym wrong:',await ro(RS(5,'kai-sym')));await sym(RS(5,'kai-sym'),'>');console.log('j5 sym:',await ro(RS(5,'kai-sym')),'| now:',await now(5));
await p.fill('#w-kai','First write both lengths in centimeters. Then compare. 1 m is 100 cm.');await check(5);console.log('after j5',await prog());await shot(J(5),'x-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6
console.log('j6 now:',await now(6));await fill(6,[1068]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[168]);await check(6);
await fill(6,[73,8]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[7,38]);await check(6);
await p.fill('#w-own','738 has 7 hundreds, so 7 meters. The rest is 38 cm.');await check(6);console.log('after j6',await prog());await shot(J(6),'x-j6');
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
// JOB 7
console.log('j7 now:',await now(7));await shot(J(7),'x-j7-start');
await cutTo('wow',141);await cutTo('wow',108);
await fill(7,[18]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[108]);await check(7);console.log('j7 now:',await now(7));await shot(RS(7,'wow'),'x-j7-both1');
await cutTo('wow',141);await fill(7,[1,14]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[1,41]);await check(7);console.log('after j7',await prog());await shot(J(7),'x-j7');
await p.fill('#w-prove','First I laid the meter stick, then the ruler showed 37. So 1 m 37 cm which is also 137 cm.');await check(8);console.log('after j8',await prog());
const BN='.sb-qgroup[data-done="bonus"]';await p.fill(BN+' .sb-ans >> nth=0','86');await p.fill(BN+' .sb-ans >> nth=1','rope');await p.fill(BN+' .sb-ans >> nth=2','54');await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));await p.fill(BN+' .sb-ans >> nth=0','806');await p.fill(BN+' .sb-ans >> nth=1','wire');await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
console.log('errors:',errs.length?errs:'none');await b.close();})();
