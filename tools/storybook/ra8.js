// read-aloud test: node ra8.js preview.html
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1150,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route(/googleapis|gstatic|githubusercontent/,r=>r.abort());await p.route(/github\.io\/optima-4th-math\/manipulatives\/(.*)/,r=>{const f=r.request().url().split('/manipulatives/')[1].split('?')[0];const fp='/home/claude/kit4/manipulatives/'+f;if(fs.existsSync(fp))r.fulfill({path:fp});else r.abort()});
await p.addInitScript(()=>{window.__said=[];const ss={speaking:false,pending:false,paused:false,speak(u){window.__said.push(u.text);setTimeout(()=>{u.onend&&u.onend({});},2)},cancel(){},pause(){},resume(){},getVoices(){return[]},addEventListener(){},onvoiceschanged:null};Object.defineProperty(window,'speechSynthesis',{value:ss,configurable:true});window.SpeechSynthesisUtterance=function(t){this.text=t;};});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(1200);
const steps=await p.evaluate(()=>[...document.querySelectorAll('.os-row, .os-step, [data-os]')].length);console.log('onestep nodes',steps);
const run=async(lab)=>{await p.evaluate(()=>{window.__said=[]});const go=await p.$('.ra-go');if(go&&await go.isVisible())await go.click();else await p.click('#sb-read');await p.waitForTimeout(2500);const s=await p.evaluate(()=>window.__said.slice());await p.evaluate(()=>{const st=document.querySelector('.ra-stop');st&&st.click()});console.log('\n=== '+lab+': '+s.length+' sentences');s.forEach(x=>console.log('  · '+x));};
await p.click('.sb-tab[data-tab="warmup"]');await p.waitForTimeout(300);await run('Warm-Up');
await p.click('.sb-tab[data-tab="learn"]');await p.waitForTimeout(300);
for(const st of [1,2,3]){await p.click(`.sb-pstep[data-st="${st}"]`);await p.waitForTimeout(300);await run('Lesson station '+st);}
await p.click('.sb-tab[data-tab="swyk"]');await p.waitForTimeout(300);await run('SWYK');
console.log('errors',errs);await b.close();})();
