// 3.09.04 playthrough: node t5.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/mnt/user-data/uploads/optima-4th-math/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-09-04.html');
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
// review
await p.fill('.sb-qgroup[data-done="review"] .sb-ans >> nth=0','10');await p.fill('.sb-qgroup[data-done="review"] .sb-ans >> nth=1','1');await p.click('.sb-qgroup[data-done="review"] .sb-btn.check');console.log('review wrong:',await p.textContent('.sb-qgroup[data-done="review"] .sb-fb'));
for(const [i,v] of ['1','10','1','11'].entries())await p.fill(`.sb-qgroup[data-done="review"] .sb-ans >> nth=${i}`,v);await p.click('.sb-qgroup[data-done="review"] .sb-btn.check');console.log('review:',await p.textContent('.sb-qgroup[data-done="review"] .sb-fb'));
for(const [i,v] of [9,9,6,5,6,7,8,6].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1 pipes
console.log('j1 now:',await now(1));await pp(1,0,'more',9);console.log('j1 top 10:',await ro(M(1,'pipes')));await pp(1,0,'less',1);console.log('j1 now:',await now(1));
await pp(1,1,'more',11);console.log('j1 now:',await now(1));await blow(1,0);console.log('j1 one blown:',await ro(M(1,'pipes')));await blow(1,1);console.log('j1:',await ro(M(1,'pipes')),'| now:',await now(1));await shot(J(1),'v-j1');
await fill(1,['shorter',1,12,1,9]);await check(1);console.log('j1 wrong fb:',await fb(1));await fill(1,['longer',1,9,1,12]);await check(1);console.log('after j1',await prog());await shot(J(1)+' .sb-payoff','v-j1-payoff');
// JOB 2
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);await shot('.sb-station[data-st="1"] .sb-card:not(.sb-job)','v-learncard');
await shadeTo(2,0,7,9);console.log('j2 now:',await now(2));await shadeTo(2,1,8,12);console.log('j2 8:',await ro(M(2,'cmp')));await shadeTo(2,1,7,12);console.log('j2:',await ro(M(2,'cmp')),'| now:',await now(2));
await fill(2,['twelfths']);await check(2);console.log('j2 wrong fb:',await fb(2));await fill(2,['ninths']);await check(2);console.log('j2 now:',await now(2));
await sym(M(2,'sym'),'<');console.log('j2 sym wrong:',await ro(M(2,'sym')));await dragEl(`${M(2,'sym')} .sym-card[data-s=">"]`,`${M(2,'sym')} .sym-slot`);console.log('j2 sym (drag):',await ro(M(2,'sym')));console.log('after j2',await prog());await shot(J(2),'v-j2');
// JOB 3
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);console.log('j3 slot start:',await p.textContent(`${M(3,'sym')} .sym-slot`));
await shadeTo(3,0,1,11);await shadeTo(3,1,1,9);console.log('j3:',await ro(M(3,'cmp')),'| now:',await now(3));
await fill(3,['eleventh','bigger']);await check(3);console.log('j3 wrong fb:',await fb(3));await fill(3,['ninth','smaller']);await check(3);
await sym(M(3,'sym'),'<');console.log('j3 sym:',await ro(M(3,'sym')));await check(3);console.log('j3 no write:',await fb(3));await p.fill('#w-ava','More parts in the same whole make smaller parts, so one-eleventh is less.');await check(3);console.log('after j3',await prog());await shot(J(3),'v-j3');
// JOB 4 Noah strings
await bridgeTo(4,0,1,4,5);console.log('j4 now:',await now(4));await bridgeTo(4,1,1,5,10);console.log('j4 b too far:',await ro(M(4,'cmp')));await bridgeTo(4,1,5,4,10);console.log('j4 now:',await now(4));
await pluckBoth(4);console.log('j4:',await ro(M(4,'cmp')),'| now:',await now(4));await fill(4,['same','fifths']);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,['different','fifths']);await check(4);
console.log('j4 slot start:',await p.textContent(`${M(4,'sym')} .sym-slot`));await sym(M(4,'sym'),'>');console.log('j4 sym:',await ro(M(4,'sym')));await p.fill('#w-noah','Both have 4 parts but fifths are bigger parts than tenths.');await check(4);console.log('after j4',await prog());await shot(J(4),'v-j4');
// JOB 5 climb + order
await blow(5,0);console.log('j5:',await ro(M(5,'pipes')));for(let i=0;i<3;i++){await pp(5,0,'more');await blow(5,0);}console.log('j5:',await ro(M(5,'pipes')),'| now:',await now(5));await shot(M(5,'pipes'),'v-j5-pipes');
await fill(5,['smaller','higher']);await check(5);await p.waitForTimeout(700);console.log('j5 now:',await now(5));
for(const [n,i] of [['1/9',0],['1/11',1],['1/12',2]]){await dragEl(`${J(5)} .ord-tray .ord-card[data-n="${n}"]`,`${J(5)} .ord-slot[data-i="${i}"]`);console.log('  j5 s:',await p.evaluate(()=>JSON.stringify(SB.ST.mods['climb-order'])));}
await p.click(`${J(5)} .ord-play`);await p.waitForTimeout(2500);console.log('j5 wrong tune:',await ro(M(5,'order')));
let cards=await p.$$(`${J(5)} .ord-slot .ord-card`);await dragEl(cards[2],`${J(5)} .ord-slot[data-i="0"]`);console.log('j5 order:',await p.evaluate(()=>SB.ST.mods['climb-order'].s.join()),'| now:',await now(5));
await p.click(`${J(5)} .ord-play`);await p.waitForTimeout(2500);console.log('j5 tune:',await ro(M(5,'order')),'| after j5',await prog());await shot(J(5),'v-j5');
// JOB 6
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
await dots2(M(6,'nl2'),0,7,4);console.log('j6 wrong:',await ro(M(6,'nl2')));await dots2(M(6,'nl2'),0,7,3);console.log('j6 now:',await now(6));await dots2(M(6,'nl2'),1,12,3);console.log('j6:',await ro(M(6,'nl2')),'| now:',await now(6));
await sym(M(6,'sym'),'>');await fill(6,['twelfths']);await check(6);console.log('j6 wrong:',await fb(6));await fill(6,['sevenths']);await check(6);console.log('after j6',await prog());await shot(J(6),'v-j6');
// JOB 7
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
await shadeTo(7,0,4,9);await shadeTo(7,1,4,11);await p.waitForTimeout(500);await sym(M(7,'sym'),'>');await p.fill('#w-ninths','Both have 4 parts. The denominator 9 makes bigger parts than 11.');await check(7);console.log('after j7',await prog());await shot(J(7),'v-j7');
// JOB 8
for(const [n,i] of [['6/11',0],['6/9',1],['6/8',2]]){await dragEl(`${J(8)} .ord-tray .ord-card[data-n="${n}"]`,`${J(8)} .ord-slot[data-i="${i}"]`);}
console.log('j8:',await p.evaluate(()=>SB.ST.mods['swyk-order'].s.join()),'| now:',await now(8));await p.click(`${J(8)} .ord-play`);await p.waitForTimeout(2500);console.log('j8:',await ro(M(8,'order')));
await p.fill('#w-prove','All three have 6 parts. Elevenths are the smallest parts and eighths the biggest. The tune stepped down.');await check(8);console.log('after j8',await prog());await shot(J(8),'v-j8');
// bonus
await p.fill('.sb-qgroup[data-done="bonus"] .sb-ans >> nth=1','8');await p.click('.sb-qgroup[data-done="bonus"] .sb-btn.check');console.log('bonus wrong:',await p.textContent('.sb-qgroup[data-done="bonus"] .sb-fb'));
await p.fill('.sb-qgroup[data-done="bonus"] .sb-ans >> nth=1','11');await p.click('.sb-qgroup[data-done="bonus"] .sb-btn.check');console.log('bonus:',await p.textContent('.sb-qgroup[data-done="bonus"] .sb-fb'));
// reload restores
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| j5 slots',await p.evaluate(()=>SB.ST.mods['climb-order'].s.join()),'| pipes',await p.evaluate(()=>JSON.stringify(SB.ST.mods.think)));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw,await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>document.documentElement.clientWidth+0.2&&r.width>0}).slice(0,6).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().right))));}
await p.click('.sb-tab[data-tab="warmup"]');await p.waitForTimeout(300);await p.screenshot({path:'shots/v-warm-top'+sfx+'.png',fullPage:false});
console.log('errors:',errs.length?errs:'none');await b.close();})();
