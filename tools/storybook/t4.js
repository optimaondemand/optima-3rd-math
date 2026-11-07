// 3.09.03 playthrough: node t4.js [preview.html] [width]  (screenshots in ./shots)
const {chromium}=require('playwright');const fs=require('fs');fs.mkdirSync('shots',{recursive:true});
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const ctx=await b.newContext({viewport:{width:W,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|manifest/.test(m.text()))errs.push('console: '+m.text())});
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/mnt/user-data/uploads/optima-4th-math/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
const URL='file://'+(process.argv[2]||'/home/claude/g3sb/build/g3-storybook-preview-3-09-03.html');
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
async function dragEl(a,bSel){const A=await (typeof a==='string'?p.$(a):a);await A.scrollIntoViewIfNeeded();const ba=await A.boundingBox();const B=await p.$(bSel);const bb=await B.boundingBox();await p.mouse.move(ba.x+ba.width/2,ba.y+ba.height/2);await p.mouse.down();await p.mouse.move(ba.x+ba.width/2+10,ba.y+ba.height/2+10,{steps:3});await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2,{steps:8});await p.mouse.up();await p.waitForTimeout(200);}
const M=(j,mod)=>`${J(j)} [data-mod="${mod}"]`;
// strings: X0 70, seg 640/d, rows y 70 / 222
async function bridgeTo(j,r,from,to,d){const m=await map(M(j,'cmp'));const br=(await p.$$(`${M(j,'cmp')} .bridge`))[r];const bb=await br.boundingBox();const seg=640/d;await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(m.x(70+to*seg+5),bb.y+bb.height/2,{steps:8});await p.mouse.up();await p.waitForTimeout(150);}
async function pluckBoth(j){const s=await p.$$(`${M(j,'cmp')} .seg`);for(const e of s){await e.click({force:true});await p.waitForTimeout(80);}}
// tiles: LX 10, BW 680, rows y 86 / 172, RH 46
async function shadeTo(j,r,k,d,sel){const m=await map(sel||M(j,'cmp'));const y=[86,172][r]+23;await p.mouse.click(m.x(10+(k-0.5)*680/d),m.y(y));await p.waitForTimeout(120);}
async function dots(sel,d,ks){for(const k of ks){const m=await map(sel);await p.mouse.click(m.x(60+k/d*680),m.y(120));await p.waitForTimeout(150);}}
const sym=async(sel,s)=>{await p.click(`${sel} .sym-card[data-s="${s}"]`);await p.waitForTimeout(120);};

// review
await p.fill('.sb-qgroup[data-done="review"] .sb-ans >> nth=0','>');await p.fill('.sb-qgroup[data-done="review"] .sb-ans >> nth=1','>');await p.click('.sb-qgroup[data-done="review"] .sb-btn.check');console.log('review wrong:',await p.textContent('.sb-qgroup[data-done="review"] .sb-fb'));
await p.fill('.sb-qgroup[data-done="review"] .sb-ans >> nth=0','<');await p.click('.sb-qgroup[data-done="review"] .sb-btn.check');console.log('review:',await p.textContent('.sb-qgroup[data-done="review"] .sb-fb'));
// fluency
for(const [i,v] of [18,45,27,54,72,81,7,4].entries())await p.fill(`.fluency-input >> nth=${i}`,String(v));
// JOB 1
console.log('j1 now:',await now(1));await bridgeTo(1,0,1,6,9);console.log('j1 too far:',await ro(M(1,'cmp')));
await bridgeTo(1,0,6,4,9);console.log('j1 now:',await now(1));await bridgeTo(1,1,1,7,9);console.log('j1 now:',await now(1));
await pluckBoth(1);console.log('j1:',await ro(M(1,'cmp')),'| now:',await now(1));await shot(J(1),'u-j1');
await fill(1,[4,7,4,9,7,9]);await check(1);console.log('j1 wrong fb:',await fb(1));await fill(1,[4,7,7,9,4,9]);await check(1);console.log('after j1',await prog());await shot(J(1)+' .sb-payoff','u-j1-payoff');
// JOB 2
await p.click('[data-go-tab="learn"]');await p.waitForTimeout(400);
await shadeTo(2,0,7,12);console.log('j2 7:',await ro(M(2,'cmp')));
// drag along the top bar back to 5
{const m=await map(M(2,'cmp'));await dragPt(m,10+6.5*680/12,109,10+4.6*680/12,109);console.log('j2 drag to 5:',await ro(M(2,'cmp')),'| now:',await now(2));}
await shadeTo(2,1,11,12);console.log('j2 now:',await now(2));await shot(J(2),'u-j2a');
await dots(M(2,'nl'),12,[4]);console.log('j2 wrong dot:',await ro(M(2,'nl')));await dots(M(2,'nl'),12,[5,11]);console.log('j2 now:',await now(2));
await dragEl(`${M(2,'sym')} .sym-card[data-s=">"]`,`${M(2,'sym')} .sym-slot`);console.log('j2 sym wrong (drag):',await ro(M(2,'sym')));
await sym(M(2,'sym'),'<');console.log('j2 sym:',await ro(M(2,'sym')),'| now:',await now(2));await shot(J(2),'u-j2');
await fill(2,[5,12]);await check(2);console.log('j2 wrong fb:',await fb(2));await fill(2,[11,12]);await check(2);console.log('after j2',await prog());
// JOB 3
await p.click('[data-next-st="2"]');await p.waitForTimeout(300);
console.log('j3 slot start:',await p.textContent(`${M(3,'sym')} .sym-slot`));
await shadeTo(3,0,9,11);await shadeTo(3,1,4,11);console.log('j3 now:',await now(3));
await fill(3,['bottom',9,11]);await check(3);console.log('j3 wrong fb:',await fb(3));await fill(3,['top',9,11]);await check(3);
await sym(M(3,'sym'),'=');console.log('j3 = :',await ro(M(3,'sym')));await sym(M(3,'sym'),'>');console.log('j3 > :',await ro(M(3,'sym')));
await check(3);console.log('j3 no write:',await fb(3));await p.fill('#w-mia','The open side faces the greater fraction, nine-elevenths.');await check(3);console.log('after j3',await prog());await shot(J(3),'u-j3');
// JOB 4
await pluckBoth(4);console.log('j4 heard:',await ro(M(4,'cmp')),'| now:',await now(4));
await fill(4,['same','longer']);await check(4);console.log('j4 wrong fb:',await fb(4));await fill(4,['different','longer']);await check(4);console.log('j4 now:',await now(4));
await shot(J(4)+' [data-mod="cmp"]','u-j4a');
{const m=await map(M(4,'cmp'));const kn=(await p.$$(`${M(4,'cmp')} .bridge.drag`)).slice(-1)[0];const bb=await kn.boundingBox();await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(m.x(745),bb.y+bb.height/2,{steps:10});await p.mouse.up();await p.waitForTimeout(150);}console.log('j4 match:',await ro(M(4,'cmp')),'| now:',await now(4));
await pluckBoth(4);console.log('j4 same:',await ro(M(4,'cmp')),'| now:',await now(4));
await sym(M(4,'sym'),'=');console.log('j4 sym:',await ro(M(4,'sym')));await p.fill('#w-ben','Only compare fractions of the same whole. The strings must be the same length.');await check(4);console.log('after j4',await prog());await shot(J(4),'u-j4');
// JOB 5
console.log('j5 now:',await now(5));await p.click(`${J(5)} .ord-play`);await p.waitForTimeout(2500);console.log('j5 leo played:',await ro(M(5,'order')),'| now:',await now(5));
let cards=await p.$$(`${J(5)} .ord-slot .ord-card`);await dragEl(cards[2],`${J(5)} .ord-slot[data-i="0"]`);console.log('j5 after drag:',await p.evaluate(()=>SB.ST.mods.leo.s.join()),'| now:',await now(5));
await p.click(`${J(5)} .ord-play`);await p.waitForTimeout(2500);console.log('j5 tune:',await ro(M(5,'order')),'| now:',await now(5));await shot(J(5),'u-j5');
await fill(5,['greatest','least']);await check(5);console.log('after j5',await prog());
// JOB 6
await p.click('[data-next-st="3"]');await p.waitForTimeout(300);
await dots(M(6,'nl'),10,[5,8]);await sym(M(6,'sym'),'>');console.log('j6 sym wrong:',await ro(M(6,'sym')));await sym(M(6,'sym'),'<');
await fill(6,['yes',8,5]);await check(6);console.log('j6 wrong fb:',await fb(6));await fill(6,['no',8,5]);await check(6);console.log('after j6',await prog());await shot(J(6),'u-j6');
// JOB 7
await p.click('[data-go-tab="swyk"]');await p.waitForTimeout(300);
await shadeTo(7,0,6,9);await shadeTo(7,1,1,9);await sym(M(7,'sym'),'>');await p.fill('#w-ninths','Both are ninths so the parts are the same size. The numerator 6 is more than 1.');await check(7);console.log('after j7',await prog());await shot(J(7),'u-j7');
// JOB 8
for(const [n,i] of [[3,0],[8,1],[10,2]]){await dragEl(`${J(8)} .ord-tray .ord-card[data-n="${n}"]`,`${J(8)} .ord-slot[data-i="${i}"]`);}
console.log('j8:',await p.evaluate(()=>SB.ST.mods['swyk-order'].s.join()),'| now:',await now(8));await p.click(`${J(8)} .ord-play`);await p.waitForTimeout(2500);console.log('j8:',await ro(M(8,'order')));
await p.fill('#w-prove','All three are twelfths so the parts are the same size. I counted 3, 8, 10. The tune stepped down.');await check(8);console.log('after j8',await prog());await shot(J(8),'u-j8');
// reload restores
await p.reload();await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});await p.waitForTimeout(800);console.log('after reload',await prog(),'| j5 slots',await p.evaluate(()=>SB.ST.mods.leo.s.join()));
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(250);const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways scroll on',t,sw,await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>document.documentElement.clientWidth+0.2&&r.width>0}).slice(0,6).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().right))));}
await p.click('.sb-tab[data-tab="learn"]');await p.waitForTimeout(300);await p.screenshot({path:'shots/u-learn-top'+sfx+'.png'});
console.log('errors:',errs.length?errs:'none');await b.close();})();
