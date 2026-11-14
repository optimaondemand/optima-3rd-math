// 3.10.05 playthrough: node t10.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-10-05.html');
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
const bh=async(j,n)=>{await p.click(`${RS(j,n)} .bn-half`);await p.waitForTimeout(150);};
const bg=async(j,n)=>{await p.click(`${RS(j,n)} .bn-gap`);await p.waitForTimeout(150);};
const RV='.sb-qgroup[data-done="review"]';
await p.fill(RV+' .sb-ans >> nth=0','1');await p.fill(RV+' .sb-ans >> nth=1','20');await p.fill(RV+' .sb-ans >> nth=2','<');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','4');await p.fill(RV+' .sb-ans >> nth=2','>');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [4,6,5,7,9,8,10,11].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
console.log('j1 now:',await now(1));await shot(J(1),'x-j1-start');await bh(1,'think');console.log('j1:',await ro(RS(1,'think')),'| now:',await now(1));
await fill(1,[3]);await check(1);console.log('j1 wrong:',await fb(1));await fill(1,[2]);await check(1);console.log('j1 now:',await now(1));
await bg(1,'think');console.log('j1 gap | now:',await now(1));await fill(1,[5,7]);await check(1);console.log('j1 wrong2:',await fb(1));await fill(1,[9,10]);await check(1);
await p.fill('#w-think','It is missing only one tenth, and that is the smallest missing piece.');await check(1);console.log('after j1',await prog());await shot(RS(1,'think'),'x-j1-model');
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','x-learncard');
console.log('j2 now:',await now(2));await bh(2,'yt');await fill(2,[5,'more']);await check(2);console.log('j2 wrong:',await fb(2));await fill(2,[5,'less']);await check(2);
await fill(2,['less']);await check(2);console.log('j2 wrong2:',await fb(2));await fill(2,['more']);await check(2);console.log('j2 now:',await now(2));await sym(RS(2,'yt-sym'),'<');console.log('after j2',await prog());await shot(J(2),'x-j2');
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
console.log('j3 now:',await now(3));await bg(3,'juno');await fill(3,['ninth','seventh']);await check(3);console.log('j3 wrong:',await fb(3));await fill(3,['seventh','ninth']);await check(3);
await fill(3,[6,7]);await check(3);console.log('j3 wrong2:',await fb(3));await fill(3,[8,9]);await check(3);console.log('j3 now:',await now(3));await sym(RS(3,'juno-sym'),'<');
await p.fill('#w-juno','Six-sevenths is missing one seventh. Eight-ninths is missing one ninth, a smaller piece, so it is fuller.');await check(3);console.log('after j3',await prog());await shot(J(3),'x-j3');
console.log('j4 now:',await now(4));await bh(4,'kai');await fill(4,['yes']);await check(4);console.log('j4 now:',await now(4));await bg(4,'kai');await fill(4,[2,'less']);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[2,'more']);await check(4);
console.log('j4 sym start:',await ro(RS(4,'kai-sym')));await sym(RS(4,'kai-sym'),'<');await p.fill('#w-kai','Both are past half, but the missing pieces are different. Two elevenths is smaller, so nine-elevenths is more.');await check(4);console.log('after j4',await prog());await shot(J(4),'x-j4');
console.log('j5 now:',await now(5));await bh(5,'leo');await fill(5,['whole']);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,['half']);await check(5);await fill(5,['less']);await check(5);
await sym(RS(5,'leo-sym'),'<');await p.fill('#w-leo','Half of 9 is 4 and a half, not 4. So four-ninths is less than one-half.');await check(5);console.log('after j5',await prog());await shot(J(5),'x-j5');
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
await bh(6,'own');await fill(6,[6,'more','more']);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[6,'less','more']);await check(6);await sym(RS(6,'own-sym'),'<');
await p.fill('#w-own','Seven-elevenths has more. It is past half, and five-twelfths is less than half.');await check(6);console.log('after j6',await prog());await shot(J(6),'x-j6');
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
const S7=RS(7,'sorter');console.log('j7 now:',await now(7));
await dragEl(`${S7} .hs-card[data-c="5/9"]`,`${S7} .hs-zone[data-z="lo"]`);console.log('j7 wrong drop:',await ro(S7));
await dragEl(`${S7} .hs-card[data-c="5/9"]`,`${S7} .hs-zone[data-z="hi"]`);console.log('j7 drop:',await ro(S7));
for(const [c,z] of [['1/6','lo'],['9/10','hi'],['4/11','lo'],['7/12','hi'],['2/7','lo']]){await p.click(`${S7} .hs-card[data-c="${c}"]`);await p.waitForTimeout(80);await p.click(`${S7} .hs-zone[data-z="${z}"] .hs-zl`);await p.waitForTimeout(120);}
console.log('j7 sorted:',await ro(S7),'| now:',await now(7));await shot(S7,'x-j7-sorted');
await p.click(`${S7} .hs-play`);await p.waitForTimeout(9000);console.log('j7 played:',await ro(S7),'| now:',await now(7));
await fill(7,[7,12]);await check(7);console.log('j7 wrong:',await fb(7));await fill(7,[9,10]);await check(7);
await p.fill('#w-sort','2/7 is less than half because half of 7 is 3 and a half. 7/12 is more than half because half of 12 is 6.');await check(7);console.log('after j7',await prog());
await p.fill('#w-prove','Half of 9 is 4 and a half, so two-ninths is less than half. Half of 7 is 3 and a half, so five-sevenths is more. Nine-tenths is missing the smallest piece.');await check(8);console.log('after j8',await prog());
const BN='.sb-qgroup[data-done="bonus"]';await p.fill(BN+' .sb-ans','>');await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));await p.fill(BN+' .sb-ans','<');await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
console.log('errors:',errs.length?errs:'none');await b.close();})();
