// 3.10.07 playthrough: node t12.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-10-07.html');
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
const tray=async(j,n,k=1)=>{for(let i=0;i<k;i++){await p.click(`${RS(j,n)} .as-tray`);await p.waitForTimeout(60);}};
const tapT=async(j,n,idx)=>{for(const i of idx){await p.click(`${RS(j,n)} .as-t[data-i="${i}"]`);await p.waitForTimeout(60);}};
const RV='.sb-qgroup[data-done="review"]';
await p.fill(RV+' .sb-ans >> nth=0','8');await p.fill(RV+' .sb-ans >> nth=1','5');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','4');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [11,10,11,12,10,13,7,14].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1
console.log('j1 now:',await now(1));await shot(J(1),'x-j1-start');
{const m=await map(RS(1,'think'));const tr=await p.$(`${RS(1,'think')} .as-tray`);const tb=await tr.boundingBox();await p.mouse.move(tb.x+tb.width/2,tb.y+tb.height/2);await p.mouse.down();await p.mouse.move(tb.x+40,tb.y-40,{steps:4});await p.mouse.move(m.x(300),m.y(110),{steps:6});await p.mouse.up();await p.waitForTimeout(200);console.log('j1 drag:',await ro(RS(1,'think')));}
await tray(1,'think',10);console.log('j1 after 11:',await ro(RS(1,'think')),'| now:',await now(1));
await fill(1,[11,16]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[14,32]);await check(1);console.log('j1 wrong den:',await fb(1));await fill(1,[14,16]);await check(1);console.log('j1 now:',await now(1));
await tapT(1,'think',[13,12,11,10,9]);console.log('j1 take:',await ro(RS(1,'think')),'| now:',await now(1));
await fill(1,[19,16]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[9,16]);await check(1);console.log('j1 now:',await now(1));
await check(1);console.log('j1 empty write:',await fb(1));
await p.fill('#w-think','The word more told me to add. Scratches out told me to take away.');await check(1);console.log('after j1',await prog());await shot(RS(1,'think'),'x-j1-model');await shot(J(1),'x-j1-done');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','x-learncard');
// JOB 2
console.log('j2 now:',await now(2));await tray(2,'yt',4);console.log('j2 now:',await now(2));
await fill(2,[8,18]);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[8,9]);await check(2);console.log('j2 now:',await now(2));
await tapT(2,'yt',[7]);console.log('j2 now:',await now(2));await fill(2,[7,9]);await check(2);console.log('j2 now:',await now(2));
await fill(2,['take away','add']);await check(2);console.log('j2 wrong clue:',await fb(2));await fill(2,['add','take away']);await check(2);console.log('after j2',await prog());await shot(J(2),'x-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// gap helper
const gapT=async(j,n,k)=>{for(let i=0;i<k;i++){await p.click(`${RS(j,n)} .gp-tray`);await p.waitForTimeout(60);}};
// JOB 3
console.log('j3 now:',await now(3));await shot(J(3),'x-j3-start');
await dragEl(`${RS(3,'juno')} .gp-tray`,`${RS(3,'juno')} svg`);console.log('j3 drag:',await ro(RS(3,'juno')));
await gapT(3,'juno',5);console.log('j3 full:',await ro(RS(3,'juno')),'| now:',await now(3));
await fill(3,[14,11]);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,[6,11]);await check(3);console.log('j3 now:',await now(3));
await fill(3,[14]);await check(3);console.log('j3 wrong2:',await fb(3));await fill(3,[3]);await check(3);
await p.fill('#w-juno','How much more means find the gap. The gap is 6 elevenths, so take away.');await check(3);console.log('after j3',await prog());await shot(J(3),'x-j3');
// JOB 4
console.log('j4 now:',await now(4));await gapT(4,'leo',5);console.log('j4:',await ro(RS(4,'leo')));
await p.click(`${RS(4,'leo')} .gp-tray`).catch(()=>console.log('j4 tray gone when full (ok)'));
await fill(4,[7,12]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[5,12]);await check(4);console.log('j4 now:',await now(4));
await fill(4,[7]);await check(4);console.log('j4 wrong2:',await fb(4));await fill(4,[5]);await check(4);
await p.fill('#w-leo','Leo counted the whole first candle. He should count only the gap, 5 twelfths.');await check(4);console.log('after j4',await prog());await shot(J(4),'x-j4');
// JOB 5
console.log('j5 now:',await now(5));await tray(5,'kai',5);console.log('j5 now:',await now(5));
await fill(5,[14,32]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[14,16]);await check(5);console.log('j5 now:',await now(5));
for(const q of [2,4,6,8,10,12,14]){await p.click(`${RS(5,'kai-g')} .gp-line >> nth=${q-1}`);await p.waitForTimeout(40);}console.log('j5 group:',await ro(RS(5,'kai-g')),'| now:',await now(5));
await fill(5,[7,16]);await check(5);console.log('j5 wrong (Kai):',await fb(5));await fill(5,[7,8]);await check(5);console.log('j5 now:',await now(5));
await fill(5,['more']);await check(5);console.log('j5 wrong2:',await fb(5));await fill(5,['less']);await check(5);
await p.fill('#w-kai','Divide the top and the bottom by 2. 14 sixteenths is 7 eighths, the same amount.');await check(5);console.log('after j5',await prog());await shot(J(5),'x-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6
console.log('j6 now:',await now(6));await tapT(6,'own',[7,6,5,4,3,2]);console.log('j6 now:',await now(6));await tapT(6,'own',[1]);console.log('j6 over:',await ro(RS(6,'own')));
await fill(6,[2,11]);await check(6);console.log('j6 now:',await now(6));await tray(6,'own',7);await fill(6,[16,11]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[9,11]);await check(6);
await p.fill('#w-own','8 take away 6 is 2, then the cook brings 7 more, so 9 elevenths.');await check(6);console.log('after j6',await prog());await shot(J(6),'x-j6');
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
// JOB 7 Story Builder
const S7=RS(7,'story');console.log('j7 now:',await now(7));
await p.click(`${S7} .stb-clue button >> nth=1`);console.log('j7 now:',await now(7));
await p.click(`${S7} .stb-thing button >> nth=0`);console.log('j7 now:',await now(7));
await p.click(`${S7} .stb-unit button >> nth=1`);console.log('j7 now:',await now(7));
await p.click(`${S7} .tile[aria-label="Top bar tile 11"]`);console.log('j7 whole:',await ro(S7));
await p.click(`${S7} .tile[aria-label="Bottom bar tile 3"]`);console.log('j7 b first:',await ro(S7));
await p.click(`${S7} .tile[aria-label="Top bar tile 9"]`);console.log('j7 now:',await now(7));
await p.click(`${S7} .tile[aria-label="Bottom bar tile 9"]`);console.log('j7 b same:',await ro(S7));
await p.click(`${S7} .tile[aria-label="Bottom bar tile 4"]`);console.log('j7 frame:',await p.textContent(`${S7} .stb-frame`),'| now:',await now(7));
await check(7);console.log('j7 empty:',await fb(7));
await p.fill('#w-story','On Sunday one candle is 9 elevenths of a foot tall and another is 4 elevenths. How much taller is the first candle?');await check(7);console.log('j7 now:',await now(7));
await fill(7,[13,11]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[5,11]);await check(7);console.log('j7 now:',await now(7));
await p.click(`${S7} .stb-play`);await p.waitForTimeout(5200);console.log('j7 played:',await ro(S7),'| after j7',await prog());await shot(J(7),'x-j7');
await p.fill('#w-prove','First 3 sixteenths and 11 more is 14 sixteenths. Then take away 5, so 9 sixteenths.');await check(8);console.log('after j8',await prog());
const BN='.sb-qgroup[data-done="bonus"]';await p.fill(BN+' .sb-ans >> nth=0','2');await p.fill(BN+' .sb-ans >> nth=1','12');await p.fill(BN+' .sb-ans >> nth=2','2');await p.fill(BN+' .sb-ans >> nth=3','12');await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));await p.fill(BN+' .sb-ans >> nth=2','1');await p.fill(BN+' .sb-ans >> nth=3','6');await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
console.log('errors:',errs.length?errs:'none');await b.close();})();
