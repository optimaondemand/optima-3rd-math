// 3.09.02 playthrough: node t3.js [preview.html]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1150,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/mnt/user-data/uploads/optima-4th-math/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-09-02.html');
await p.goto(URL);await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(900);
const J=j=>`section[data-job="${j}"]`;
const shot=async(sel,n)=>{const e=await p.$(sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(200);await e.screenshot({path:'shots/'+n+'.png'});};
const fill=async(job,vals)=>{const ins=await p.$$(`${J(job)} .sb-step.open:not(.right) .sb-ans`);if(ins.length!==vals.length)console.log('!! job',job,'boxes',ins.length,'vals',vals.length);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{await p.click(`${J(job)} .sb-step.open:not(.right) .sb-btn.check`);await p.waitForTimeout(150);};
const fb=async(job)=>p.textContent(`${J(job)} .sb-step.open:not(.right) .sb-fb`).catch(()=>'(none)');
const prog=async()=>p.textContent('.sb-prog .n');
const ro=async(job)=>p.textContent(`${J(job)} .sb-readout`);
async function svgMap(job){const s=await p.$(`${J(job)} [data-mod] svg`);await p.evaluate(e=>e.scrollIntoView({block:'center'}),s);await p.waitForTimeout(150);const bb=await s.boundingBox();const vb=(await s.getAttribute('viewBox')).split(' ').map(Number);return {x:v=>bb.x+v*bb.width/vb[2],y:v=>bb.y+v*bb.height/vb[3]};}
const X=(v,b=1,X0=60)=>X0+v/b*(740-X0);
async function dragPt(m,x0,y0,x1,y1){await p.mouse.move(m.x(x0),m.y(y0));await p.mouse.down();await p.mouse.move(m.x((x0+x1)/2),m.y(y0),{steps:4});await p.mouse.move(m.x(x1),m.y(y1),{steps:4});await p.mouse.up();await p.waitForTimeout(120);}
// review + fluency
await p.fill('.sb-qgroup[data-done="review"] .sb-ans','6');await p.click('.sb-qgroup[data-done="review"] .sb-btn.check');console.log('review wrong:',await p.textContent('.sb-qgroup[data-done="review"] .sb-fb'));
await p.fill('.sb-qgroup[data-done="review"] .sb-ans','7');await p.click('.sb-qgroup[data-done="review"] .sb-btn.check');
// JOB 1
let br=await p.$$(`${J(1)} .bridge`);await br[2].click();console.log('j1 out of order:',await ro(1));
for(let i=0;i<5;i++){br=await p.$$(`${J(1)} .bridge`);await br[i].click();await p.waitForTimeout(80);}
console.log('j1:',await ro(1));await shot(J(1)+' [data-mod]','t-j1');
await fill(1,[1,1,4,5,4,5]);await check(1);console.log('j1 wrong fb:',await fb(1));
await fill(1,[0,1,4,5,4,5]);await check(1);console.log('after j1',await prog());
// JOB 2
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);
for(let i=0;i<8;i++){await p.click(`${J(2)} .add`);}console.log('j2 8 ticks:',await ro(2));
await p.click(`${J(2)} .rem`);await p.click(`${J(2)} .rem`);console.log('j2 6 ticks:',await ro(2));
let m=await svgMap(2);
for(const k of [5,4,3,2,1,0,0,1,2,3,4,5]){m=await svgMap(2);const pos=await p.evaluate(k=>SB.ST.mods.yourturn.p[k],k);await dragPt(m,X(pos),100,X((k+1)/7)+4,100);}
console.log('j2 after drags:',await ro(2), await p.evaluate(()=>JSON.stringify(SB.ST.mods.yourturn.p.map(v=>+v.toFixed(3)))));
m=await svgMap(2);await dragPt(m,X(0),120,X(2/7)+3,120);console.log('j2 dot at 2:',await ro(2));
await dragPt(m,X(2/7),120,X(3/7)-5,120);console.log('j2 dot:',await ro(2));
await shot(J(2)+' [data-mod]','t-j2');
await fill(2,[7,1,7,3,3,7]);await check(2);console.log('j2 wrong fb:',await fb(2));
await fill(2,[6,1,7,3,3,7]);await check(2);console.log('after j2',await prog());
// JOB 3
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
await fill(3,[11]);await check(3);await p.click(`${J(3)} .minus`);console.log('j3:',await ro(3));await fill(3,[9]);await check(3);console.log('after j3',await prog());
// JOB 4
await p.click(`${J(4)} .pa`);await p.click(`${J(4)} .pf`);console.log('j4 before:',await ro(4));
m=await svgMap(4);
for(const k of [0,1,2,3,4,5,5,4,3,2,1,0]){const pos=await p.evaluate(k=>SB.ST.mods.ben.p[k],k);await dragPt(m,X(pos),92,X((k+1)/7)-3,92);}
console.log('j4 even:',await ro(4));await p.click(`${J(4)} .pa`);await p.click(`${J(4)} .pf`);console.log('j4 same:',await ro(4));await shot(J(4)+' [data-mod]','t-j4');
await p.fill('#w-same','The spaces are equal now, so 4 jumps from 0 land in the same spot.');await check(4);console.log('after j4',await prog());
// JOB 5
let tk=await p.$$(`${J(5)} .nl-tick`);await tk[0].click();tk=await p.$$(`${J(5)} .nl-tick`);await tk[5].click();console.log('j5:',await ro(5));tk=await p.$$(`${J(5)} .nl-tick`);await tk[8].click();await shot(J(5)+' [data-mod]','t-j5');
await fill(5,[1,9,5,9,9,9]);await check(5);console.log('after j5',await prog());
// JOB 6
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
for(const t of [3,8,12]){m=await svgMap(6);await p.mouse.click(m.x(X(t/10,2)),m.y(120));await p.waitForTimeout(120);}
console.log('j6:',await ro(6));await shot(J(6)+' [data-mod]','t-j6');
await fill(6,[3,7,0,2,1]);await check(6);await fill(6,[1,2]);await check(6);console.log('j6 no write:',await fb(6));await p.fill('#w-past','1 is ten-tenths and twelve-tenths is 2 jumps past 1.');await check(6);console.log('after j6',await prog());
// JOB 7 + 8
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
let tl=await p.$$(`${J(7)} .tile`);await tl[9].click();console.log('j7 at 10:',await ro(7));tl=await p.$$(`${J(7)} .tile`);await tl[6].click();console.log('j7:',await ro(7));await shot(J(7)+' [data-mod]','t-j7');
await fill(7,[7,12,12,11]);await check(7);console.log('after j7',await prog());
for(let i=0;i<7;i++)await p.click(`${J(8)} .add`);m=await svgMap(8);
for(const k of [6,5,4,3,2,1,0,0,1,2,3,4,5,6]){const pos=await p.evaluate(k=>SB.ST.mods.swyk.p[k],k);await dragPt(m,X(pos),100,X((k+1)/8)+2,100);}
m=await svgMap(8);await p.mouse.click(m.x(X(7/8)),m.y(120));await p.waitForTimeout(150);console.log('j8:',await ro(8));await shot(J(8)+' [data-mod]','t-j8');
await fill(8,[7,8,1,1]);await check(8);await p.fill('#w-prove','I drew 7 tick marks to make 8 equal spaces. I counted 7 jumps from 0. Equal spaces make each jump one-eighth.');await check(8);
console.log('after j8',await prog());
await p.fill('.sb-qgroup[data-done="bonus"] .sb-ans','14');await p.click('.sb-qgroup[data-done="bonus"] .sb-btn.check');
await p.click('[data-journal="gather"]');const jt=await p.inputValue('#sb-journal-out');console.log('journal lines',jt.split('\n').length);fs.writeFileSync('shots/journal.txt',jt);
// reload restores
await p.reload();await p.waitForTimeout(900);console.log('after reload',await prog(), 'tab', await p.evaluate(()=>SB.ST.tab));
// widths + top-of-section landing
for(const w of [420,1150,1600]){await p.setViewportSize({width:w,height:900});await p.waitForTimeout(250);
 for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(200);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);const top=await p.evaluate(t=>{const pan=document.getElementById('tab-'+t);const tb=document.querySelector('.sb-tabs').getBoundingClientRect();return Math.round(pan.getBoundingClientRect().top-tb.bottom)},t);if(sw>0||top<0||top>60)console.log('!! width',w,t,'sideways',sw,'gap',top);}
 await p.screenshot({path:`shots/w${w}.png`});}
await p.setViewportSize({width:420,height:900});await p.click('.sb-tab[data-tab="learn"]');await p.click('.sb-pstep[data-st="2"]');await p.waitForTimeout(200);await shot(J(4),'t-j4-420');await shot(J(5),'t-j5-420');
console.log('errors',errs);await b.close();})();
