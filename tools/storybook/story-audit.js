// story audit: is the story on the Warm-Up, and out of the way on the Lesson + Show What You Know tabs?
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();
for(const L of ['3-11-01','3-11-02']){const p=await (await b.newContext({viewport:{width:1150,height:900}})).newPage();
await p.route(/googleapis|gstatic|githubusercontent|github\.io/,r=>r.abort());
await p.goto('file:///home/claude/g3sb/build/g3-storybook-preview-'+L+'.html');await p.waitForTimeout(900);
await p.evaluate(()=>{const d=document.getElementById('sb-start');if(d)d.open=false;});
for(const t of ['warmup','learn','swyk']){await p.click(`.sb-tab[data-tab="${t}"]`);await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{const vis=e=>e&&e.getBoundingClientRect().height>0&&getComputedStyle(e).display!=='none';
    const book=document.querySelector('.sb-book'), eq=document.querySelector('.sb-intro');
    const panel=document.querySelector('.sb-panel.on');const st=panel.querySelector('.sb-station.on')||panel;
    const job=st.querySelector('.sb-job');const art=[...panel.querySelectorAll('.sb-art img, .sb-fig img')].filter(vis).length;
    const story=[...st.querySelectorAll('.sb-story')].filter(vis).map(s=>s.textContent.trim());
    const above=job?Math.round(job.getBoundingClientRect().top+scrollY):null;
    return {book:vis(book),eq:vis(eq),bar:!!document.querySelector('.sb-topbar, .sb-fold, [class*="topbar"]'),artImgs:art,firstJobAt:above,story:story};});
  console.log(L,t,JSON.stringify(r));
  await p.screenshot({path:'/tmp/aud-'+L+'-'+t+'.png'});}
}
await b.close();})();
