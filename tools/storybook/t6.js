// 3.10.01 playthrough: node t5.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/mnt/user-data/uploads/optima-4th-math/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-10-01.html');
await p.goto(URL);await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(900);
const J=j=>`section[data-job="${j}"]`;const sfx=W===1150?'':'-'+W;
const shot=async(sel,n)=>{const e=await p.$(sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(200);await e.screenshot({path:'shots/'+n+sfx+'.png'});};
const fill=async(job,vals)=>{const ins=await p.$$(`${J(job)} .sb-step.now .sb-ans`);if(ins.length!==vals.length)console.log('!! job',job,'boxes',ins.length,'vals',vals.length);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{await p.click(`${J(job)} .sb-step.now .sb-btn.check`);await p.waitForTimeout(150);};
const fb=async(job)=>p.textContent(`${J(job)} .sb-step.now .sb-fb`).catch(()=>'(none)');
const now=async(job)=>p.textContent(`${J(job)} .sb-step.now h4`).catch(()=>'(none)');
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
await p.fill(RV+' .sb-ans >> nth=0','1');await p.fill(RV+' .sb-ans >> nth=1','5');await p.fill(RV+' .sb-ans >> nth=2','6');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=1','6');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [24,48,32,56,72,40,64,16].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1 beat
const tray=async(j,sel,n=1)=>{for(let i=0;i<n;i++){const e=await p.$(`${J(j)} ${sel}`);await e.click({force:true});await p.waitForTimeout(60);}};
console.log('j1 now:',await now(1));await tray(1,'.bt-tray',9);console.log('j1 9:',await ro(M(1,'beat')));
await p.click(`${J(1)} .bt-b >> nth=0`,{force:true});await p.waitForTimeout(100);console.log('j1:',await ro(M(1,'beat')),'| now:',await now(1));
await p.click(`${J(1)} .bt-play`);await p.waitForTimeout(4200);console.log('j1 played:',await ro(M(1,'beat')),'| now:',await now(1));await shot(J(1),'w-j1');
await fill(1,[12,2,3,8,12]);await check(1);console.log('j1 wrong fb:',await fb(1));await fill(1,[8,2,3,8,12]);await check(1);console.log('j1 nowrite:',await fb(1));
await p.fill('#w-think','Both rows stopped on the same beat. 8 twelfths are the same length as 2 thirds.');await check(1);console.log('after j1',await prog());await shot(J(1)+' .sb-payoff','w-j1-payoff');
// JOB 2 nl2
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','w-learncard');
await dots2(M(2,'nl2'),0,6,5);console.log('j2 now:',await now(2));await dots2(M(2,'nl2'),1,12,9);console.log('j2 wrong bottom:',await ro(M(2,'nl2')));
await dots2(M(2,'nl2'),1,12,10);console.log('j2:',await ro(M(2,'nl2')),'| now:',await now(2));await fill(2,[5,12,2]);await check(2);console.log('j2 wrong fb:',await fb(2));await fill(2,[10,12,2]);await check(2);console.log('after j2',await prog());await shot(J(2),'w-j2');
// JOB 3 Ava
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
await shadeTo(3,0,4,12);await shadeTo(3,1,1,3);console.log('j3:',await ro(M(3,'cmp')),'| now:',await now(3));
await fill(3,['different','greater']);await check(3);console.log('j3 wrong fb:',await fb(3));await fill(3,['same','equal']);await check(3);console.log('j3 now:',await now(3));
console.log('j3 slot:',await p.textContent(`${M(3,'sym')} .sym-slot`));await sym(M(3,'sym'),'<');console.log('j3 sym wrong:',await ro(M(3,'sym')));await sym(M(3,'sym'),'=');console.log('j3 sym:',await ro(M(3,'sym')),'| now:',await now(3));
await p.fill('#w-ava','The shaded parts are the same length. Twelfths are smaller pieces so it takes more.');await check(3);console.log('after j3',await prog());await shot(J(3),'w-j3');
// JOB 4 Leo
console.log('j4 start:',await ro(M(4,'fixstrip')));
await shot(J(4),'w-j4-start');
const m4=await map(M(4,'fixstrip'));const fe=await p.$(`${J(4)} .fx-end`);const fb0=await fe.boundingBox();await p.mouse.move(fb0.x+fb0.width/2,fb0.y+fb0.height/2);await p.mouse.down();await p.mouse.move(m4.x(600),fb0.y+fb0.height/2,{steps:6});await p.mouse.move(m4.x(690),fb0.y+fb0.height/2,{steps:6});await p.mouse.up();await p.waitForTimeout(200);
console.log('j4 dragged:',await ro(M(4,'fixstrip')),'| now:',await now(4));await p.click(`${J(4)} .fx-cut`);await p.waitForTimeout(150);console.log('j4:',await ro(M(4,'fixstrip')),'| now:',await now(4));
await fill(4,['different','bigger']);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,['same','equivalent']);await check(4);
await p.fill('#w-leo','First his strip was too short. Second his parts were not equal.');await check(4);console.log('after j4',await prog());await shot(J(4),'w-j4');
// JOB 5 group
const gl=async q=>{await p.click(`${J(5)} .gp-line >> nth=${q-1}`,{force:true});await p.waitForTimeout(80);};
await gl(3);console.log('j5 odd:',await ro(M(5,'group')));await gl(3);for(const q of [2,4,6,8])await gl(q);console.log('j5:',await ro(M(5,'group')),'| now:',await now(5));
await fill(5,[10,8,8,10]);await check(5);console.log('j5 wrong:',await fb(5));await fill(5,[5,4,4,5]);await check(5);console.log('after j5',await prog());await shot(J(5),'w-j5');
// JOB 6 split
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
await p.click(`${J(6)} .sp-3`);console.log('j6 by3:',await ro(M(6,'split')),'| now:',await now(6));await p.click(`${J(6)} .sp-0`);await p.click(`${J(6)} .sp-2`);await p.waitForTimeout(100);console.log('j6:',await ro(M(6,'split')),'| now:',await now(6));
await fill(6,[10,3,3,5]);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,[10,6,6,10]);await check(6);
await p.fill('#w-own','Every piece was split in 2, so the shaded part has twice as many pieces but the same length.');await check(6);console.log('after j6',await prog());await shot(J(6),'w-j6');
// JOB 7 measure
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
const mt=async i=>{await p.click(`${J(7)} .ms-tray >> nth=${i}`,{force:true});await p.waitForTimeout(80);};
await mt(0);await mt(0);await mt(0);console.log('j7 3rd half:',await ro(M(7,'measure')));
await mt(1);await mt(2);await mt(2);console.log('j7:',await ro(M(7,'measure')),'| now:',await now(7));await p.click(`${J(7)} .ms-play`);await p.waitForTimeout(5300);console.log('j7 played:',await ro(M(7,'measure')),'| now:',await now(7));
await p.fill('#w-measure','The quarter note takes the same time as 2 eighth notes. 1/4 = 2/8.');await check(7);console.log('after j7',await prog());await shot(J(7),'w-j7');
await p.fill('#w-prove','I picked 2/3. I split every third into 2. So 2/3 is equal to 4/6 because the shaded part is the same length.');await check(8);console.log('after j8',await prog());
const BN='.sb-qgroup[data-done="bonus"]';await p.fill(BN+' .sb-ans:not([readonly]) >> nth=0','2');await p.fill(BN+' .sb-ans:not([readonly]) >> nth=1','4');await p.click(BN+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BN+' .sb-fb'));
await p.fill(BN+' .sb-ans:not([readonly]) >> nth=1','3');await p.click(BN+' .sb-btn.check');console.log('bonus:',await p.textContent(BN+' .sb-fb'));await shot(BN,'w-bonus');
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| mods',await p.evaluate(()=>JSON.stringify(SB.ST.mods)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw);}
await p.click('.sb-tab[data-tab="warmup"]');await p.waitForTimeout(300);await p.screenshot({path:'shots/w-warm-top'+sfx+'.png',fullPage:false});
console.log('errors:',errs.length?errs:'none');await b.close();})();
