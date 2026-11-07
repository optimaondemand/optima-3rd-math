const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1150,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];try{r.fulfill({path:'/mnt/user-data/uploads/optima-4th-math/manipulatives/'+f})}catch(e){r.abort()}});
const URL='file:///home/claude/g3sb/build/g3-storybook-preview-3-09-01-v1.html';
await p.goto(URL);await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(1200);
const shot=async(sel,n)=>{const e=await p.$(sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(250);await e.screenshot({path:'shots/e-'+n+'.png'});};
const fill=async(job,vals)=>{const ins=await p.$$(`section[data-job="${job}"] .sb-step.open:not(.right) .sb-ans`);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{await p.click(`section[data-job="${job}"] .sb-step.open:not(.right) .sb-btn.check`);await p.waitForTimeout(150);};
const prog=async()=>p.textContent('.sb-prog .n');
// review
await p.fill('.sb-qgroup[data-done="review"] .sb-ans','one-half');await p.click('.sb-qgroup[data-done="review"] .sb-btn.check');
// JOB1
await shot('section[data-job="1"]','j1-a');
const seg=await p.$('section[data-job="1"] .seg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),seg);await p.waitForTimeout(200);const bb=await seg.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(300);
let br=await p.$$('section[data-job="1"] .bridge');console.log('bridges',br.length, await p.evaluate(()=>JSON.stringify(SB.ST.steps)), await p.evaluate(({x,y})=>document.elementFromPoint(x,y).outerHTML.slice(0,100),{x:bb.x+bb.width/2,y:bb.y+bb.height/2}));
await shot('section[data-job="1"]','j1-b');
// drag bridges to 1/3, 2/3
const svg=await p.$('section[data-job="1"] svg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),svg);await p.waitForTimeout(200);const sb=await svg.boundingBox();const sx=x=>sb.x+x*sb.width/800;const sy=y=>sb.y+y*sb.height/210;
async function dragB(i,frac){br=await p.$$('section[data-job="1"] .bridge');const r=await br[i].boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.mouse.move(sx(70+frac*660)-20,sy(110),{steps:5});await p.mouse.move(sx(70+frac*660),sy(110),{steps:5});await p.mouse.up();await p.waitForTimeout(200);}
await dragB(0,1/3);console.log('msg1',await p.textContent('section[data-job="1"] .sb-mono-msg'));
await dragB(1,2/3);console.log('msg2',await p.textContent('section[data-job="1"] .sb-mono-msg'));
await fill(1,[2,1,2]);await check(1);console.log('wrong fb',await p.textContent('section[data-job="1"] .sb-step.open:not(.right) .sb-fb'));
await fill(1,[3,1,3]);await check(1);console.log('blank write fb',await p.textContent('section[data-job="1"] .sb-step.open:not(.right) .sb-fb'));
await p.fill('#w-think','They sang the same note and looked the same.');await check(1);
console.log('after job1',await prog());await shot('section[data-job="1"]','j1-c');
// JOB2
await p.click('.sb-tab[data-tab="learn"]');await p.waitForTimeout(600);
await shot('.sb-station[data-st="1"]','st1');
const tsvg=await p.$('section[data-job="2"] [data-mod] svg');
// tap tray: find tray tiles = tiles with aria-label Add a one-eighth
for(let i=0;i<2;i++){await p.click('section[data-job="2"] [aria-label="Add a one-fourth tile"]');await p.waitForTimeout(80);} 
console.log('mixed?',await p.textContent('section[data-job="2"] .sb-readout'));
await shot('section[data-job="2"]','j2-a');
// remove fourth tiles by tapping placed
for(let i=0;i<2;i++){await p.click('section[data-job="2"] [aria-label="Take away a one-fourth tile"]');await p.waitForTimeout(80);}
// drag one eighth for real, then tap the rest
await p.evaluate(e=>e.scrollIntoView({block:'center'}),tsvg);await p.waitForTimeout(200);const t8=await p.$('section[data-job="2"] [aria-label="Add a one-eighth tile"]');const r8=await t8.boundingBox();const tb=await tsvg.boundingBox();
await p.mouse.move(r8.x+10,r8.y+10);await p.mouse.down();await p.mouse.move(tb.x+100,tb.y+tb.height*0.4,{steps:8});await p.mouse.up();await p.waitForTimeout(150);
console.log('after drag',await p.textContent('section[data-job="2"] .sb-readout'));
for(let i=0;i<7;i++){await p.click('section[data-job="2"] [aria-label="Add a one-eighth tile"]');await p.waitForTimeout(60);}
console.log('full',await p.textContent('section[data-job="2"] .sb-readout'));
for(let i=1;i<=6;i++){await p.click(`section[data-job="2"] [aria-label^="Tile ${i},"]`);await p.waitForTimeout(60);}
console.log('shade',await p.textContent('section[data-job="2"] .sb-readout'));
await fill(2,[6,6,8]);await check(2);await fill(2,[6,8,'eighths']);await check(2);await fill(2,[2,8,8,1]);await check(2);
console.log('after job2',await prog());await shot('section[data-job="2"]','j2-b');
// station 2
await p.click('[data-next-st="2"]');await p.waitForTimeout(600);
// job3 tap chips
await p.click('section[data-job="3"] .sb-chipnum[data-v="9"]');await p.click('section[data-job="3"] .sb-slot[data-s="top"]');await p.waitForTimeout(100);
console.log('j3 wrong',await p.textContent('section[data-job="3"] .sb-readout'));
await shot('section[data-job="3"]','j3-a');
// drag chip 2 to top, 9 to bottom
async function dragTo(a,bsel){await p.evaluate(s=>document.querySelector(s).scrollIntoView({block:'center'}),bsel);await p.waitForTimeout(150);const A=await (await p.$(a)).boundingBox();const B=await (await p.$(bsel)).boundingBox();await p.mouse.move(A.x+A.width/2,A.y+A.height/2);await p.mouse.down();await p.mouse.move(B.x+B.width/2,B.y+B.height/2,{steps:8});await p.mouse.up();await p.waitForTimeout(120);}
await dragTo('section[data-job="3"] .sb-chipnum[data-v="2"]','section[data-job="3"] .sb-slot[data-s="top"]');
await dragTo('section[data-job="3"] .sb-chipnum[data-v="9"]','section[data-job="3"] .sb-slot[data-s="bot"]');
console.log('j3',await p.textContent('section[data-job="3"] .sb-readout'));
await fill(3,[9,2,9]);await check(3);console.log('after job3',await prog());
// job4 sort: drag A to yes; tap B wrong into yes
await dragTo('section[data-job="4"] .sb-shape[data-id="A"]','section[data-job="4"] .sb-bin[data-b="yes"]');
await p.click('section[data-job="4"] .sb-shape[data-id="B"]');await p.click('section[data-job="4"] .sb-bin[data-b="yes"]');console.log('j4 wrong',await p.textContent('section[data-job="4"] .sb-readout'));
await p.click('section[data-job="4"] .sb-shape[data-id="B"]');await p.click('section[data-job="4"] .sb-bin[data-b="no"]');
await p.click('section[data-job="4"] .sb-shape[data-id="C"]');await p.click('section[data-job="4"] .sb-bin[data-b="no"]');
await p.click('section[data-job="4"] .sb-shape[data-id="D"]');await p.click('section[data-job="4"] .sb-bin[data-b="yes"]');
await shot('section[data-job="4"]','j4');
await p.fill('#w-sort','The shaded part is bigger than the others.');await check(4);console.log('after job4',await prog());
// job6 drag 1 slice, tap 3
await p.evaluate(()=>document.querySelector('section[data-job="5"] [data-mod] svg').scrollIntoView({block:'center'}));await p.waitForTimeout(150);const sl=await p.$$('section[data-job="5"] .part');const S0=await sl[0].boundingBox();const sv6=await (await p.$('section[data-job="5"] [data-mod] svg')).boundingBox();
await p.mouse.move(S0.x+S0.width/2,S0.y+S0.height/2);await p.mouse.down();await p.mouse.move(sv6.x+sv6.width*0.75,sv6.y+sv6.height*0.5,{steps:8});await p.mouse.up();await p.waitForTimeout(100);
for(const i of [1,2,3]){const s=await p.$(`section[data-job="5"] [aria-label="Slice ${i+1}, in the loaf"]`);await s.click();await p.waitForTimeout(60);} 
console.log('j6',await p.textContent('section[data-job="5"] .sb-readout'));await shot('section[data-job="5"]','j6');
await fill(5,[4,10,6,10]);await check(5);await fill(5,[10,1]);await check(5);console.log('after job6',await prog());
// station 3
await p.click('[data-next-st="3"]');await p.waitForTimeout(600);
for(let i=0;i<5;i++)await p.click('section[data-job="6"] .plus');
await p.click('section[data-job="6"] [aria-label="Part 2"]');await p.click('section[data-job="6"] [aria-label="Part 5"]');
console.log('j7',await p.textContent('section[data-job="6"] .sb-readout'));await shot('section[data-job="6"]','j7');
await fill(6,[2,7,5,7]);await check(6);await p.fill('#w-cora','No, it is still 2 of 7 equal parts.');await check(6);console.log('after job7',await prog());
// SWYK
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(600);
for(const s of ['Long','Short'])for(const i of [1,3,5])await p.click(`section[data-job="7"] [aria-label="${s} string, part ${i}"]`);
console.log('j9',await p.textContent('section[data-job="7"] .sb-readout'));await shot('section[data-job="7"]','j9');
await fill(7,[3,5,3,5]);await check(7);await p.fill('#w-size','No, the long whole is longer.');await check(7);console.log('after job9',await prog());
for(let i=1;i<=9;i++)await p.click(`section[data-job="8"] [aria-label="Strip 1, part ${i}"]`);
await fill(8,[9,10,1,10]);await check(8);await fill(8,[11,12,1,12]);await check(8);await fill(8,[10,9]);await p.fill('#w-prove','The 10 tells equal parts. 9 shaded.');await check(8);
console.log('after job10',await prog());
await p.click('[data-journal="gather"]');console.log((await p.inputValue('#sb-journal-out')));
await shot('section[data-job="8"]','j10');
// reload restore
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(1200);console.log('after reload',await prog(), await p.getAttribute('.sb-tab[data-tab="swyk"]','aria-selected'));
console.log('errors',errs);await b.close();})();
