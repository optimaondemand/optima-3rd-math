const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const tl=JSON.parse(fs.readFileSync(__dirname+'/timeline-3-10-07.json'));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('file://'+__dirname+'/harness-3-10-07.html');await p.waitForTimeout(400);await p.evaluate(t=>{init(t);window.NOCAP=1;},tl);await p.evaluate(()=>render(33));await p.screenshot({path:'g3math-10-07-learn.jpg',type:'jpeg',quality:88});await b.close();})();
