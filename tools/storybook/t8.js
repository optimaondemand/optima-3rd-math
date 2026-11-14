// 3.10.03 playthrough: node t8.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-10-03.html');
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



const RV='.sb-qgroup[data-done="review"]';
await p.fill(RV+' .sb-ans >> nth=0','1');await p.fill(RV+' .sb-ans >> nth=1','1');await p.fill(RV+' .sb-ans >> nth=2','8');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','2');await p.fill(RV+' .sb-ans >> nth=1','2');await p.fill(RV+' .sb-ans >> nth=2','16');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [8,7,4,5,5,4,4,5].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
const stk=async(r,k,d)=>{const m=await map(M(1,'stack'));await p.mouse.click(m.x(10+(k-0.5)*680/d),m.y(88+r*80+23));await p.waitForTimeout(120);};
const gl=async(j,qs)=>{for(const q of qs){const ls=await p.$$(`${M(j,'group')} .gp-line`);await ls[q-1].click({force:true});await p.waitForTimeout(60);}};
console.log('j1 now:',await now(1));await stk(1,1,2);console.log('j1 halves:',await ro(M(1,'stack')),'| now:',await now(1));
await stk(2,5,5);console.log('j1 over:',await ro(M(1,'stack')));await stk(2,4,5);console.log('j1:',await ro(M(1,'stack')),'| now:',await now(1));await shot(J(1),'w-j1');
await fill(1,[8,10]);await check(1);console.log('j1 wrong fb:',await fb(1));await fill(1,[4,5]);await check(1);console.log('j1 now:',await now(1));
await p.fill('#w-think','No. Both strips are shaded to the same spot. Fifths are fewer, bigger parts.');await check(1);console.log('after j1',await prog());await shot(J(1)+' .sb-payoff','w-j1-payoff');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','w-learncard');
console.log('j2 now:',await now(2));await gl(2,[1,3]);console.log('j2 bad:',await ro(M(2,'group')));await gl(2,[1,3]);await gl(2,[2,4,6,8,10,12,14]);console.log('j2:',await ro(M(2,'group')),'| now:',await now(2));
await dragEl(`${J(2)} .ar-card[data-t="2"]`,`${J(2)} .ar-slot.top`);console.log('j2 top:',await ro(M(2,'arrows')),'| now:',await now(2));
await p.click(`${J(2)} .ar-card[data-t="2"]`);await p.waitForTimeout(100);console.log('j2 arrows:',await ro(M(2,'arrows')),'| now:',await now(2));
await fill(2,[7,9,7,9]);await check(2);console.log('j2 wrong fb:',await fb(2));await fill(2,[7,8,7,8]);await check(2);console.log('j2 now:',await now(2));
await fill(2,['yes']);await check(2);console.log('j2 wrong2:',await fb(2));await fill(2,['no']);await check(2);console.log('after j2',await prog());await shot(J(2),'w-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
console.log('j3 now:',await now(3));await shadeTo(3,0,2,12,M(3,'cmp'));console.log('j3 now:',await now(3));await shadeTo(3,1,1,12,M(3,'cmp'));console.log('j3:',await ro(M(3,'cmp')),'| now:',await now(3));
await fill(3,['longer']);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,['shorter']);await check(3);console.log('j3 now:',await now(3));
await p.click(`${J(3)} .ar-card[data-t="3"]`);await p.waitForTimeout(100);console.log('j3 ÷3:',await ro(M(3,'arrows')));await p.click(`${J(3)} .ar-slot.top`);
await dragEl(`${J(3)} .ar-card[data-t="2"]`,`${J(3)} .ar-slot.top`);console.log('j3 now:',await now(3));
await dragEl(`${J(3)} .ar-card[data-t="4"]`,`${J(3)} .ar-slot.bot`);console.log('j3 mixed:',await ro(M(3,'arrows')));await dragEl(`${J(3)} .ar-card[data-t="2"]`,`${J(3)} .ar-slot.bot`);console.log('j3 arrows:',await ro(M(3,'arrows')),'| now:',await now(3));
await fill(3,[1,12]);await check(3);console.log('j3 wrong2:',await fb(3));await fill(3,[1,6]);await check(3);console.log('j3 now:',await now(3));
await p.fill('#w-leo','Leo forgot to divide the denominator by 2 too. Use the same number on both.');await check(3);console.log('after j3',await prog());await shot(J(3),'w-j3');
await shadeTo(4,0,2,10,M(4,'cmp'));await shadeTo(4,1,1,9,M(4,'cmp'));console.log('j4:',await ro(M(4,'cmp')),'| now:',await now(4));
await fill(4,['longer']);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,['shorter']);await check(4);console.log('j4 now:',await now(4));
await fill(4,[1,9,1,9]);await check(4);console.log('j4 wrong2:',await fb(4));await fill(4,[1,5,1,5]);await check(4);console.log('j4 now:',await now(4));
await p.fill('#w-juno','Taking away 1 makes ninths, and ninths are a different size. Divide both by 2 instead.');await check(4);console.log('after j4',await prog());await shot(J(4),'w-j4');
await fill(5,[3]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[2]);await check(5);console.log('j5 now:',await now(5));
await gl(5,[2,4,6,8]);console.log('j5:',await ro(M(5,'group')),'| now:',await now(5));
await fill(5,[8,10,'yes']);await check(5);console.log('j5 wrong2:',await fb(5));await fill(5,[4,5,'no']);await check(5);console.log('j5 now:',await now(5));
await p.fill('#w-kai','8 and 10 are both even, so Kai could divide by 2 again and get 4/5. That is simplest form.');await check(5);console.log('after j5',await prog());await shot(J(5),'w-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
console.log('j6 now:',await now(6));await p.click(`${J(6)} .ar-card[data-t="3"]`);await p.waitForTimeout(100);console.log('j6 ÷3:',await ro(M(6,'arrows')));await p.click(`${J(6)} .ar-slot.top`);
await p.click(`${J(6)} .ar-card[data-t="2"]`);await p.waitForTimeout(100);console.log('j6 top:',await ro(M(6,'arrows')),'| now:',await now(6));await p.click(`${J(6)} .ar-card[data-t="2"]`);await p.waitForTimeout(100);console.log('j6:',await ro(M(6,'arrows')),'| now:',await now(6));
await fill(6,[3,8,6,16]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[3,8,3,8]);await check(6);
await p.fill('#w-own','3 is odd. 3 split into groups of 2 leaves 1 left over, so 3/8 is simplest form.');await check(6);console.log('after j6',await prog());await shot(J(6),'w-j6');
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
const T1=`${J(7)} [data-name="trade1"]`,T2=`${J(7)} [data-name="trade2"]`;
console.log('j7 now:',await now(7));
await dragEl(`${T1} .tr-tray[data-t="8"]`,`${T1} .tr-row`);console.log('j7 t8:',await ro(T1),'| now:',await now(7));
await p.click(`${T1} .tr-tray[data-t="8"]`,{force:true});await p.waitForTimeout(100);console.log('j7 same:',await ro(T1));
await p.click(`${T1} .tr-tray[data-t="4"]`,{force:true});await p.waitForTimeout(100);await p.click(`${T1} .tr-tray[data-t="2"]`,{force:true});await p.waitForTimeout(100);await p.click(`${T1} .tr-tray[data-t="1"]`,{force:true});await p.waitForTimeout(150);console.log('j7 whole:',await ro(T1),'| now:',await now(7));await shot(T1,'w-j7-stairs');
await p.click(`${T1} .tr-play`);await p.waitForTimeout(12800);console.log('j7 played:',await ro(T1),'| now:',await now(7));
await p.click(`${T2} .tr-tray[data-t="4"]`,{force:true});await p.waitForTimeout(100);console.log('j7 m2 fourths early:',await ro(T2));
await dragEl(`${T2} .tr-tray[data-t="8"]`,`${T2} .tr-row`);console.log('j7 m2:',await ro(T2),'| now:',await now(7));
await p.click(`${T2} .tr-tray[data-t="4"]`,{force:true});await p.waitForTimeout(100);console.log('j7 m2 fourths:',await ro(T2));await shot(T2,'w-j7-m2');
await fill(7,[14,16,'yes']);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[7,8,'no']);await check(7);console.log('j7 now:',await now(7));
await p.fill('#w-trade','7 eighths in groups of 2 leaves 1 eighth left over, so no fourth tile fits. 7/8 is simplest form.');await check(7);console.log('after j7',await prog());await shot(J(7),'w-j7');
await p.fill('#w-prove','Every 2 tenths make 1 fifth, so the 8 shaded tenths became 4 fifths and the 10 tenths became 5 fifths. That is ÷2 on both. Same length.');await check(8);console.log('after j8',await prog());
const BN='.sb-qgroup[data-done="bonus"]';await p.fill(BN+' .sb-ans >> nth=0','2');await p.fill(BN+' .sb-ans >> nth=1','10');await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));
await p.fill(BN+' .sb-ans >> nth=0','1');await p.fill(BN+' .sb-ans >> nth=1','5');await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));await shot(BN,'w-bonus');
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
await p.click('.sb-tab[data-tab="warmup"]');await p.waitForTimeout(300);await p.screenshot({path:'shots/w-warm-top'+sfx+'.png',fullPage:false});
console.log('errors:',errs.length?errs:'none');await b.close();})();
