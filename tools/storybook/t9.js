// 3.10.04 playthrough: node t9.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-10-04.html');
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




const cut=async(j,m,name)=>{await p.click(`${J(j)} [data-name="${name}"] .rc-cut[data-m="${m}"]`);await p.waitForTimeout(150);};
const reset=async(j,name)=>{await p.click(`${J(j)} [data-name="${name}"] .rc-0`);await p.waitForTimeout(120);};
const RS=(j,n)=>`${J(j)} [data-name="${n}"]`;
const RV='.sb-qgroup[data-done="review"]';
await p.fill(RV+' .sb-ans >> nth=0','more');await p.fill(RV+' .sb-ans >> nth=1','>');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','less');await p.fill(RV+' .sb-ans >> nth=1','<');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [8,14,18,12,20,20,35,12].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1
console.log('j1 now:',await now(1));console.log('j1 ro:',await ro(RS(1,'think')));await shot(J(1),'w-j1-start');
await cut(1,3,'think');console.log('j1 wrong cut:',await ro(RS(1,'think')));await reset(1,'think');await cut(1,2,'think');console.log('j1 cut:',await ro(RS(1,'think')),'| now:',await now(1));await shot(RS(1,'think'),'w-j1-cut');
await fill(1,[4,5]);await check(1);console.log('j1 wrong fb:',await fb(1));await fill(1,[8,10]);await check(1);console.log('j1 now:',await now(1));
await sym(RS(1,'think-sym'),'<');console.log('j1 sym wrong:',await ro(RS(1,'think-sym')));await sym(RS(1,'think-sym'),'>');console.log('j1 sym:',await ro(RS(1,'think-sym')),'| now:',await now(1));
await p.fill('#w-think','No. The gold line stayed in the same place, so the note is the same length. It just has more, smaller pieces.');await check(1);console.log('after j1',await prog());await shot(J(1)+' .sb-payoff','w-j1-payoff');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','w-learncard');
// JOB 2
console.log('j2 now:',await now(2));await cut(2,2,'yt');console.log('j2:',await ro(RS(2,'yt')),'| now:',await now(2));
await fill(2,[14,15,14,15]);await check(2);console.log('j2 wrong fb:',await fb(2));await fill(2,[14,16,14,16]);await check(2);console.log('j2 now:',await now(2));
await sym(RS(2,'yt-sym'),'>');console.log('after j2',await prog());await shot(J(2),'w-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 3 Juno
console.log('j3 now:',await now(3));console.log('j3 sym start:',await ro(RS(3,'juno-sym')));await cut(3,4,'juno');console.log('j3 wrong cut:',await ro(RS(3,'juno')));await reset(3,'juno');await cut(3,2,'juno');console.log('j3:',await ro(RS(3,'juno')),'| now:',await now(3));
await fill(3,[9,20]);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,[18,20]);await check(3);console.log('j3 now:',await now(3));
await sym(RS(3,'juno-sym'),'<');console.log('j3 sym:',await ro(RS(3,'juno-sym')),'| now:',await now(3));
await p.fill('#w-juno','Twentieths are smaller pieces than tenths. Nine-tenths is 18 twentieths, and 18 is more than 17.');await check(3);console.log('after j3',await prog());await shot(J(3),'w-j3');
// JOB 4 Kai
console.log('j4 now:',await now(4));await cut(4,2,'kai');console.log('j4 wrong cut:',await ro(RS(4,'kai')));await reset(4,'kai');await cut(4,4,'kai');console.log('j4:',await ro(RS(4,'kai')),'| now:',await now(4));
await fill(4,[1,20]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[4,20]);await check(4);
await sym(RS(4,'kai-sym'),'<');console.log('j4 now:',await now(4));
await p.fill('#w-kai','A bigger denominator means the whole is cut into more pieces, so each piece is smaller. One-fifth is 4 twentieths.');await check(4);console.log('after j4',await prog());await shot(J(4),'w-j4');
// JOB 5 Leo
console.log('j5 now:',await now(5));await shadeTo(5,0,4,5,RS(5,'leo-check'));console.log('j5 now:',await now(5));await shadeTo(5,1,4,20,RS(5,'leo-check'));console.log('j5:',await ro(RS(5,'leo-check')),'| now:',await now(5));
await fill(5,['longer']);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,['shorter']);await check(5);console.log('j5 now:',await now(5));
await cut(5,4,'leo');console.log('j5 cut:',await ro(RS(5,'leo')),'| now:',await now(5));
await fill(5,[4,20]);await check(5);console.log('j5 wrong2:',await fb(5));await fill(5,[16,20]);await check(5);console.log('j5 now:',await now(5));
await sym(RS(5,'leo-sym'),'<');console.log('j5 now:',await now(5));
await p.fill('#w-leo','Leo forgot to multiply the numerator by 4 too. Use the same number on both.');await check(5);console.log('after j5',await prog());await shot(J(5),'w-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6 own
console.log('j6 now:',await now(6));await cut(6,2,'own');console.log('j6:',await ro(RS(6,'own')));await fill(6,[7,20]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[14,20]);await check(6);
await sym(RS(6,'own-sym'),'>');await p.fill('#w-own','The right hand note is longer. Seven-tenths is 14 twentieths, and 14 is more than 13.');await check(6);console.log('after j6',await prog());await shot(J(6),'w-j6');
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
// JOB 7 duet
console.log('j7 now:',await now(7));await p.click(`${RS(7,'duet')} .rc-play`);await p.waitForTimeout(3700);console.log('j7 heard:',await ro(RS(7,'duet')),'| now:',await now(7));
await fill(7,['left']);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,['right']);await check(7);console.log('j7 now:',await now(7));
await cut(7,2,'duet');console.log('j7 cut:',await ro(RS(7,'duet')),'| now:',await now(7));await fill(7,[18,20]);await check(7);
await sym(RS(7,'duet-sym'),'>');console.log('j7 now:',await now(7));await p.click(`${RS(7,'duet')} .rc-play`);await p.waitForTimeout(3700);console.log('j7 taps:',await ro(RS(7,'duet')),'| now:',await now(7));
await p.fill('#w-duet','The right hand tapped 18 times and the left hand tapped 13 times. The pieces are the same size, so 18 is more.');await check(7);console.log('after j7',await prog());await shot(J(7),'w-j7');
await p.fill('#w-prove','Each fifth cut into 2 makes tenths. That is times 2 on both numbers, so four-fifths is 8 tenths. 8 tenths is more than 7 tenths.');await check(8);console.log('after j8',await prog());
const BN='.sb-qgroup[data-done="bonus"]';for(const [i,v] of [3,10,1,5,7,20].entries())await p.fill(BN+` .sb-ans >> nth=${i}`,String(v));await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));
for(const [i,v] of [1,5,3,10,7,20].entries())await p.fill(BN+` .sb-ans >> nth=${i}`,String(v));await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
await p.click('.sb-tab[data-tab="warmup"]');await p.waitForTimeout(300);await p.screenshot({path:'shots/w-warm-top'+sfx+'.png',fullPage:false});
console.log('errors:',errs.length?errs:'none');await b.close();})();
