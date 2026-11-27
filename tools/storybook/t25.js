// 3.12.06 playthrough: node t25.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-12-06.html');
await p.goto(URL);await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(900);
const J=j=>`section[data-job="${j}"]`;const sfx=W===1150?'':'-'+W;
const shot=async(sel,n)=>{const e=await p.$(sel);await e.scrollIntoViewIfNeeded();await p.waitForTimeout(200);await e.screenshot({path:'shots/'+n+sfx+'.png'});};
const fill=async(job,vals)=>{const ins=await p.$$(`${J(job)} .sb-step.now .sb-ans`);if(ins.length!==vals.length)console.log('!! job',job,'boxes',ins.length,'vals',vals.length);for(let i=0;i<ins.length;i++)await ins[i].fill(String(vals[i]));};
const check=async(job)=>{await p.click(`${J(job)} .sb-step.now .sb-btn.check`);await p.waitForTimeout(150);};
const fb=async(job)=>p.textContent(`${J(job)} .sb-step.now .sb-fb`).catch(()=>'(none)');
const now=async(job)=>{await p.waitForTimeout(450);const h=await p.evaluate(j=>{const x=document.querySelector(`section[data-job="${j}"] .sb-hand`);return x?(x.hidden?'HIDDEN ':'')+x.dataset.t:'no hand'},job);const t=await p.textContent(`${J(job)} .sb-step.now h4`).catch(()=>'(none)');return t+'  [hand: '+h+']';};
const prog=async()=>p.textContent('.sb-prog .n');
const RS=(j,n)=>`${J(j)} [data-name="${n}"]`;
const ro=async(sel)=>(await p.textContent(sel+' .sb-readout')).replace(/\s+/g,' ');
async function map(sel){const s=await p.$(sel+' svg');await p.evaluate(e=>e.scrollIntoView({block:'center'}),s);await p.waitForTimeout(150);const bb=await s.boundingBox();const vb=(await s.getAttribute('viewBox')).split(' ').map(Number);return {x:v=>bb.x+(v-vb[0])*bb.width/vb[2],y:v=>bb.y+(v-vb[1])*bb.height/vb[3]};}
async function dragEl(a,bEl){await a.scrollIntoViewIfNeeded();const A=await a.boundingBox(),B=await bEl.boundingBox();await p.mouse.move(A.x+A.width/2,A.y+A.height/2);await p.mouse.down();await p.mouse.move(A.x+A.width/2+10,A.y+A.height/2-10,{steps:3});await p.mouse.move(B.x+B.width/2,B.y+B.height/2,{steps:14});await p.mouse.up();await p.waitForTimeout(250);}
const GP=(x,y)=>[130+30+x*38,10+30+y*38];
async function sqTo(sel,vx,vy){const m=await map(sel);const h=await p.$(sel+' .tn-sq');const hb=await h.boundingBox();const x=hb.x+12,y=hb.y+hb.height-12;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+8,y-8,{steps:3});await p.mouse.move(m.x(vx),m.y(vy),{steps:14});await p.mouse.up();await p.waitForTimeout(250);}
async function tapCorners(sel){const n=(await p.$$(sel+' .tn-cn')).length;for(let i=0;i<n;i++){const done=await p.$eval(`${sel} .tn-cn >> nth=${i}`,e=>e.classList.contains('done')).catch(()=>true);if(done)continue;await p.click(`${sel} .tn-cn >> nth=${i}`);await p.waitForTimeout(120);}}
async function name(sel,card,key,drag){const c=await p.$(`${sel} .tn-card[data-c="${card}"]`);const s=await p.$(`${sel} .tn-slot[data-key="${key}"]`);if(!c||!s){console.log('!! missing',card,key);return;}
  if(drag)await dragEl(c,s);else{await c.click();await p.waitForTimeout(80);await (await p.$(`${sel} .tn-slot[data-key="${key}"]`)).click();await p.waitForTimeout(150);}console.log(`  ${card}→${key}:`,await ro(sel));}
const pin=async(sel,x,y)=>{await p.click(`${sel} .tr-pin[data-p="${x},${y}"]`);await p.waitForTimeout(110);};
const band=async(sel,ps)=>{for(const q of ps)await pin(sel,q[0],q[1]);await pin(sel,ps[0][0],ps[0][1]);};
async function card(sel,c,drag){const e=await p.$(`${sel} .qd-card[data-c="${c}"]`);const s=await p.$(`${sel} .tn-slot`);if(!e||!s){console.log('!! missing card',c);return;}if(drag)await dragEl(e,s);else{await e.click();await p.waitForTimeout(80);await (await p.$(`${sel} .tn-slot`)).click();await p.waitForTimeout(150);}console.log(`  card ${c}:`,await ro(sel));}
async function sides(sel,a,b){await p.click(`${sel} .qd-side[data-i="${a}"]`);await p.waitForTimeout(100);await p.click(`${sel} .qd-side[data-i="${b}"]`);await p.waitForTimeout(150);console.log(`  sides ${a}+${b}:`,await ro(sel));}
async function hdl(sel,i,x,y,tap){if(tap){await p.click(`${sel} .qd-h[data-i="${i}"]`);await p.waitForTimeout(100);await p.click(`${sel} .tr-pin[data-p="${x},${y}"]`);}else{const m=await map(sel);const h=await p.$(`${sel} .qd-h[data-i="${i}"]`);const hb=await h.boundingBox();const cx=hb.x+hb.width/2,cy=hb.y+hb.height/2;await p.mouse.move(cx,cy);await p.mouse.down();await p.mouse.move(cx+8,cy-8,{steps:3});const g=GP(x,y);await p.mouse.move(m.x(g[0]),m.y(g[1]),{steps:14});await p.mouse.up();}await p.waitForTimeout(200);console.log(`  corner ${i}→${x},${y}:`,await ro(sel));}
await shot('.sb-book','b-book');await shot('.sb-intro','b-intro');
const RV='.sb-qgroup[data-done="review"]';
await p.fill(RV+' .sb-ans >> nth=0','3');await p.fill(RV+' .sb-ans >> nth=1','1');await p.click(RV+' .sb-btn.check');console.log('review wrong:',await p.textContent(RV+' .sb-fb'));
await p.fill(RV+' .sb-ans >> nth=0','2');await p.click(RV+' .sb-btn.check');console.log('review:',await p.textContent(RV+' .sb-fb'));
for(const [i,v] of [28,54,49,72,77,36,56,99,42,27].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));await p.click('[data-fluency-check]');console.log('facts:',await p.textContent('.fluency-box .sb-fb'));
// JOB 1 reshape
const T1=RS(1,'think');console.log('j1 now:',await now(1));await shot(T1,'c-j1-start');
await p.click(T1+' .qd-h[data-i="0"]');await p.click(T1+' .qd-h[data-i="2"]');await p.waitForTimeout(150);console.log('  same pin:',await ro(T1));
await hdl(T1,0,9,8);        // crossed band -> refused
await hdl(T1,0,5,7);        // 3 in a line -> refused
await hdl(T1,0,4,1);        // new shape 1 (drag)
await hdl(T1,0,4,1);        // same pin
await hdl(T1,2,6,9,true);   // shape 2 (tap)
await hdl(T1,3,5,5);        // shape 3 (dart-ish)
console.log(' now:',await now(1));await shot(T1,'c-j1-done');
await p.fill('#w-think','Every shape had 4 straight sides and 4 corners. There were no gaps.');await check(1);console.log('after j1',await prog());
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);
// JOB 2 check
const T2=RS(2,'yt');console.log('j2 now:',await now(2));
await sides(T2,0,1);await sides(T2,0,2);await card(T2,'parallelogram');await sides(T2,1,3);console.log(' now:',await now(2));
await tapCorners(T2);console.log(' corners:',await ro(T2),'| now:',await now(2));
await card(T2,'quadrilateral');await card(T2,'rhombus');await card(T2,'parallelogram',true);console.log(' now:',await now(2));await shot(T2,'c-j2');console.log('after j2',await prog());
// JOB 3 make rectangle
const T3=RS(3,'rect');console.log('j3 now:',await now(3));
await band(T3,[[2,2],[6,2],[6,6],[2,6]]);console.log(' square:',await ro(T3));await p.click(T3+' .tr-redo');
await band(T3,[[2,2],[8,2],[7,5],[2,5]]);console.log(' not rect:',await ro(T3));await p.click(T3+' .tr-redo');
await band(T3,[[2,3],[8,3],[8,6],[2,6]]);console.log(' made:',await ro(T3),'| now:',await now(3));
await card(T3,'rectangle');await tapCorners(T3);console.log(' now:',await now(3));await card(T3,'parallelogram');await card(T3,'rectangle');console.log(' now:',await now(3));await shot(T3,'c-j3');console.log('after j3',await prog());
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
// JOB 4 Ben
const T4=RS(4,'ben');console.log('j4 now:',await now(4));await sqTo(T4,GP(3,3)[0],GP(3,3)[1]);console.log(' sq:',await ro(T4));await tapCorners(T4);console.log(' now:',await now(4));
await fill(4,[3]);await check(4);console.log('j4 wrong:',await fb(4));await fill(4,[4]);await check(4);console.log(' now:',await now(4));
await card(T4,'no');await card(T4,'yes',true);console.log(' now:',await now(4));await shot(T4,'c-j4');
await p.fill('#w-ben','Your square has 4 square corners, so it is a rectangle too. Its sides are all equal, so it is a special rectangle.');await check(4);console.log('after j4',await prog());
// JOB 5 Mia sort
const T5=RS(5,'mia');console.log('j5 now:',await now(5));
let qs=await p.$$(T5+' .qd-tray .tn-rt');await dragEl(qs[0],await p.$(T5+' .qd-grp[data-g="no"]'));console.log(' dart→no:',await ro(T5));
qs=await p.$$(T5+' .qd-tray .tn-rt');await dragEl(qs[0],await p.$(T5+' .qd-grp[data-g="yes"]'));console.log(' dart→yes:',await ro(T5));
for(let k=0;k<3;k++){await p.click(T5+' .qd-tray .tn-rt >> nth=0');await p.click(T5+' .qd-grp[data-g="no"]');await p.waitForTimeout(150);console.log(' →no:',await ro(T5));}
console.log(' now:',await now(5));await shot(T5,'c-j5');
await p.fill('#w-mia','I was surprised that the pointy dart is a quadrilateral. It has 4 straight sides and no gaps.');await check(5);console.log('after j5',await prog());
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
// JOB 6 one pair
const T6=RS(6,'own');console.log('j6 now:',await now(6));
await band(T6,[[2,7],[7,7],[9,3],[4,3]]);console.log(' parallelogram:',await ro(T6));await p.click(T6+' .tr-redo');
await band(T6,[[1,8],[8,8],[6,2],[2,4]]);console.log(' no pair:',await ro(T6));await p.click(T6+' .tr-redo');
await band(T6,[[1,8],[9,8],[7,4],[3,4]]);console.log(' made:',await ro(T6),'| now:',await now(6));
await sides(T6,1,3);await sides(T6,0,2);console.log(' now:',await now(6));
await card(T6,'quadrilateral');await card(T6,'trapezoid');console.log(' now:',await now(6));await shot(T6,'c-j6');
await p.fill('#w-own','I made the top and bottom go straight across, and the top is shorter. It is a trapezoid because it has 1 pair of parallel sides.');await check(6);console.log('after j6',await prog());
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(400);
// JOB 7 tree
const T7=RS(7,'wow');console.log('j7 now:',await now(7));await shot(T7,'c-j7-start');
const tc=async(k,spot,drag)=>{const e=await p.$(`${T7} .qd-tc[data-k="${k}"]`);const s=await p.$(`${T7} .qd-node[data-k="${spot}"]`);if(drag)await dragEl(e,s);else{await e.click();await p.waitForTimeout(80);await (await p.$(`${T7} .qd-node[data-k="${spot}"]`)).click();await p.waitForTimeout(150);}console.log(`  ${k}→${spot}:`,await ro(T7));};
await tc('square','rectangle');await tc('square','square',true);await tc('rhombus','trapezoid');await tc('rhombus','rhombus');await tc('quadrilateral','quadrilateral');await tc('trapezoid','trapezoid',true);await tc('rectangle','rectangle');await tc('parallelogram','parallelogram');
console.log(' now:',await now(7));
for(const k of ['square','rectangle','rhombus','parallelogram','trapezoid','quadrilateral']){await p.click(`${T7} .qd-node[data-k="${k}"]`);await p.waitForTimeout(120);}console.log(' tapped:',await ro(T7));
console.log('after j7',await prog());await shot(J(7),'c-j7');
await p.fill('#w-prove','First check for parallel sides. Next check if the sides are equal. Then check the corners with a set square. Use the name that tells the most.');await p.click(J(8)+' .sb-btn.check');await p.waitForTimeout(200);console.log('after j8',await prog());
const BQ='.sb-qgroup[data-done="bonus"]';await p.fill(BQ+' .sb-ans','4');await p.click(BQ+' .sb-btn.check');console.log('bonus wrong:',await p.textContent(BQ+' .sb-fb'));await p.fill(BQ+' .sb-ans','5');await p.click(BQ+' .sb-btn.check');console.log('bonus:',await p.textContent(BQ+' .sb-fb'));
await shot('.sb-listen','c-listen');
await p.reload();await p.waitForTimeout(900);console.log('after reload',await prog());await p.click('[data-tab="learn"]');await p.waitForTimeout(300);await p.click('.sb-pstep[data-st="3"]');await p.waitForTimeout(300);await shot(RS(6,'own'),'c-j6-reload');
const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);console.log('sideways scroll:',sw);
console.log('errors:',errs.length?errs:'none');await b.close();})();
