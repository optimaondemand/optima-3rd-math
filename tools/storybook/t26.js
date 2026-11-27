// 3.12.07 playthrough: node t26.js <preview.html> <width>
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
const W=+(process.argv[3]||1150);
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:W,height:950}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());
await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
await p.goto('file://'+process.argv[2]);
await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
await p.waitForTimeout(1400);
fs.mkdirSync('/home/claude/shots',{recursive:true});
const shot=async(sel,n)=>{const e=await p.$(sel);if(!e)return console.log('NO ELEMENT',sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(250);await e.screenshot({path:'/home/claude/shots/'+n+'.png'}).catch(e=>console.log('shot fail',n,e.message));};
const prog=async()=>p.textContent('.sb-prog .n');
const out=async(job)=>p.textContent(`section[data-job="${job}"] .sb-readout`).catch(()=>'');
const fill=async(job,vals)=>{const ins=await p.$$(`section[data-job="${job}"] .sb-step.open:not(.right) .sb-ans`);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{const btn=await p.$(`section[data-job="${job}"] .sb-step.open:not(.right) .sb-btn.check`);if(!btn)return console.log('no check button in job',job);await btn.click();await p.waitForTimeout(200);};
const hand=async(job)=>p.evaluate(j=>{const h=document.querySelector(`section[data-job="${j}"] .sb-hand`);return h?(h.dataset.t||h.dataset.step||'hand'):'(none)';},job);
// the dashed lines cross each other, so a click at the exact crossing is ambiguous: fire the handler
// per line, and check real pointer hit-testing separately with realClick() below.
const foldAll=async(job)=>{const n=await p.evaluate(j=>document.querySelectorAll(`section[data-job="${j}"] .sf-line`).length,job);
  for(let i=0;i<n;i++){await p.evaluate(({j,i})=>document.querySelectorAll(`section[data-job="${j}"] .sf-line`)[i].dispatchEvent(new MouseEvent('click',{bubbles:true})),{j:job,i});await p.waitForTimeout(160);}
  return n;};
// a real mouse click a quarter of the way along a line, where nothing else overlaps
const realClick=async(job,i)=>{const r=await p.evaluate(({j,i})=>{const g=document.querySelectorAll(`section[data-job="${j}"] .sf-line`)[i];const b=g.getBoundingClientRect();g.scrollIntoView({block:'center'});const b2=g.getBoundingClientRect();return {x:b2.x,y:b2.y,w:b2.width,h:b2.height};},{j:job,i});
  await p.waitForTimeout(200);
  const x=r.x+r.w*0.5, y=r.y+r.h*0.12;
  await p.mouse.click(x,y);await p.waitForTimeout(220);
  return p.evaluate(({j,i})=>document.querySelectorAll(`section[data-job="${j}"] .sf-line`)[i].getAttribute('aria-label'),{j:job,i});};

// Warm-Up review
await p.fill('.sb-qgroup[data-done="review"] .sb-ans','2');await p.click('.sb-qgroup[data-done="review"] .sb-btn.check');await p.waitForTimeout(150);
console.log('review fb:', (await p.textContent('.sb-qgroup[data-done="review"] .sb-fb')).slice(0,60));

// JOB 1 fold the vase
console.log('J1 hand:', await hand(1));
console.log('J1 real pointer click on line 1 ->', await realClick(1,0));
console.log('J1 folds:', await foldAll(1), '| readout:', (await out(1)).slice(0,90));
await shot('section[data-job="1"]','j1');
await check(1); // blank write
console.log('J1 blank write fb:', (await p.textContent('section[data-job="1"] .sb-step.open:not(.right) .sb-fb')).slice(0,60));
await p.fill('#w-think','The up and down fold matched. The others had a bit sticking out.');await check(1);
console.log('after J1:', await prog());

// JOB 2 mirror
await p.click('.sb-tab[data-tab="learn"]');await p.waitForTimeout(700);
console.log('J2 hand:', await hand(2));
const pin=async(x,y)=>{const e=await p.$(`section[data-job="2"] .tr-pin[data-p="${x},${y}"]`);if(!e)return 'no pin '+x+','+y;await e.click();await p.waitForTimeout(140);return (await out(2)).slice(0,70);};
console.log('J2 wrong pin:', await pin(8,5));
console.log('J2 on axis:', await pin(5,3));
console.log('J2 ok1:', await pin(9,5));
console.log('J2 ok2:', await pin(7,5));
console.log('J2 ok3:', await pin(7,9));
await shot('section[data-job="2"]','j2');
console.log('after J2:', await prog());

// JOB 3 Ben
await p.click('.sb-pstep[data-st="2"]');await p.waitForTimeout(600);
console.log('J3 hand:', await hand(3));
console.log('J3 folds:', await foldAll(3), '|', (await out(3)).slice(0,90));
await shot('section[data-job="3"]','j3');
await fill(3,[3]);await check(3);console.log('J3 wrong fb:',(await p.textContent('section[data-job="3"] .sb-step.open:not(.right) .sb-fb')).slice(0,80));
await fill(3,[2]);await check(3);console.log('after J3:', await prog());

// JOB 4 Mia
console.log('J4 folds:', await foldAll(4), '|', (await out(4)).slice(0,90));
await fill(4,[1]);await check(4);
await p.fill('#w-mia','Counting sides does not work. You have to fold each line and see if it matches.');await check(4);
console.log('after J4:', await prog());

// JOB 5 Kai
console.log('J5 folds:', await foldAll(5), '|', (await out(5)).slice(0,110));
await fill(5,[0]);await check(5);
await p.fill('#w-kai','I tried all three folds and none matched. All the sides are different.');await check(5);
await shot('section[data-job="5"]','j5');
console.log('after J5:', await prog());

// JOB 6 compass
await p.click('.sb-pstep[data-st="3"]');await p.waitForTimeout(600);
console.log('J6 hand:', await hand(6));
const setR=async(r)=>{const g=await p.$('section[data-job="6"] .sf-pen');await g.scrollIntoViewIfNeeded();await p.waitForTimeout(150);await g.focus();
  const cur=await p.evaluate(()=>+document.querySelector('section[data-job="6"] .sf-pen').getAttribute('aria-valuenow'));
  for(let i=0;i<Math.abs(r-cur);i++){await p.keyboard.press(r>cur?'ArrowRight':'ArrowLeft');await p.waitForTimeout(90);}
  return p.evaluate(()=>document.querySelector('section[data-job="6"] .sf-pen').getAttribute('aria-valuenow'));};
console.log('J6 set 3 ->', await setR(3));
await p.click('section[data-job="6"] .an-btns .sb-btn:not(.ghost)');await p.waitForTimeout(250);
console.log('J6 after draw:', (await out(6)).slice(0,90));
await fill(6,[6]);await check(6);
console.log('J6 set 1 ->', await setR(1));
await p.click('section[data-job="6"] .an-btns .sb-btn:not(.ghost)');await p.waitForTimeout(250);
await fill(6,[2]);await check(6);
await shot('section[data-job="6"]','j6');
// the card
const cards=await p.$$('section[data-job="6"] .qd-card');
console.log('J6 cards:', cards.length);
if(cards.length){await cards[1].click();await p.waitForTimeout(120);await p.click('section[data-job="6"] .tn-slot');await p.waitForTimeout(200);console.log('J6 wrong card:',(await out(6)).slice(0,70));
  await (await p.$$('section[data-job="6"] .qd-card'))[0].click();await p.waitForTimeout(120);await p.click('section[data-job="6"] .tn-slot');await p.waitForTimeout(250);console.log('J6 right card:',(await out(6)).slice(0,70));}
await p.fill('#w-own','The needle point stays still and the pencil stays the same distance away all the way around.');await check(6);
console.log('after J6:', await prog());

// JOB 7 euclid
await p.click('.sb-tab[data-tab="swyk"]');await p.waitForTimeout(700);
console.log('J7 hand:', await hand(7));
const eb=async(i)=>{const bs=await p.$$('section[data-job="7"] .an-btns .sb-btn');await bs[i].click();await p.waitForTimeout(250);return (await out(7)).slice(0,70);};
console.log('J7 open:', await eb(0));
console.log('J7 circle A:', await eb(1));
console.log('J7 circle B:', await eb(2));
const nx=await p.evaluate(()=>document.querySelectorAll('section[data-job="7"] .sf-x').length);console.log('J7 crossings:',nx);
for(let i=0;i<nx;i++){const x=await p.$(`section[data-job="7"] .sf-x[data-i="${i}"]`);if(!x)break;await x.click();await p.waitForTimeout(260);}
console.log('J7 after line:', (await out(7)).slice(0,110));
await shot('section[data-job="7"]','j7');
console.log('J7 open steps:', await p.evaluate(()=>[...document.querySelectorAll('section[data-job="7"] .sb-step')].map(s=>(s.querySelector('h4')||{}).textContent+' :: '+s.className).join(' | ')));
await fill(7,[3]);await check(7);
console.log('J7 box fb:', (await p.textContent('section[data-job="7"] .sb-step.open .sb-fb').catch(()=>'(none)')).slice(0,60));
console.log('after J7:', await prog());

// JOB 8 + bonus
await p.fill('#w-prove','Fold it and look. If nothing sticks out the halves match. A scalene triangle has none.');await check(8);
const nb=await p.evaluate(()=>document.querySelectorAll('.sb-qgroup[data-done="bonus"] .sf-line').length);
for(let i=0;i<nb;i++){await p.evaluate(i=>document.querySelectorAll('.sb-qgroup[data-done="bonus"] .sf-line')[i].dispatchEvent(new MouseEvent('click',{bubbles:true})),i);await p.waitForTimeout(150);}
console.log('bonus folds:', nb, '|', (await p.textContent('.sb-qgroup[data-done="bonus"] .sb-readout')).slice(0,80));
await p.fill('.sb-qgroup[data-done="bonus"] .sb-ans','4');await p.click('.sb-qgroup[data-done="bonus"] .sb-btn.check');await p.waitForTimeout(200);
console.log('bonus fb:', (await p.textContent('.sb-qgroup[data-done="bonus"] .sb-fb')).slice(0,70));
await shot('.sb-qgroup[data-done="bonus"]','bonus');
console.log('FINAL:', await prog());

// reload restores
await p.reload();await p.waitForTimeout(1500);
console.log('after reload:', await prog());
// sideways scroll
const over=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
console.log('horizontal overflow px:', over);
console.log('ERRORS:', errs.length?errs.slice(0,6):'none');
await b.close();
})();
