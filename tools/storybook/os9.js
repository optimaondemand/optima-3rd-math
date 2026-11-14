// one-step view + tour on the repo page (lesson-tools.js served from kit4): node os9.js <repo page> <width>
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const W=+(process.argv[3]||1150);const p=await (await b.newContext({viewport:{width:W,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(1500);
const tabs=['warmup','learn','swyk'];let total=0;
for(const t of tabs){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(400);
  const lanes=await p.$$('.sb-panel.on .osm-bar');let seen=new Set();
  for(let i=0;i<40;i++){const c=await p.evaluate(()=>{const b=[...document.querySelectorAll('.sb-panel.on .osm-bar')].find(x=>x.offsetParent);return b?b.querySelector('.osm-count').textContent+' | '+b.querySelector('.osm-next').textContent:null});if(!c||seen.has(c))break;seen.add(c);console.log(t,c);
    const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)console.log('!! sideways',sw);
    const nb=await p.evaluate(()=>{const b=[...document.querySelectorAll('.sb-panel.on .osm-bar')].find(x=>x.offsetParent);const n=b&&b.querySelector('.osm-next');if(n&&!n.disabled&&n.offsetParent){n.click();return true}return false});if(!nb)break;await p.waitForTimeout(250);}
  total+=seen.size;}
console.log('total step views',total);
await p.click('.sb-tab[data-tab="warmup"]');await p.waitForTimeout(300);
await p.evaluate(()=>{const d=document.getElementById('sb-start');if(d)d.open=true});await p.waitForTimeout(200);
await p.click('.tour-go');await p.waitForTimeout(700);
for(let i=0;i<14;i++){const tt=await p.evaluate(()=>{const t=document.querySelector('.sb-tourtip, .osm-tip');return t?t.innerText.replace(/\s+/g,' ').slice(0,90):null});if(!tt)break;console.log('tour',i,tt);const nx=await p.$('.sb-tourtip .nx, .osm-tip button.n');if(!nx)break;await nx.click();await p.waitForTimeout(600);}
console.log('errors',errs.length?errs:'none');await b.close();})();
