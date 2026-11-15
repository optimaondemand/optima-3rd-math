// poster for the 3.11.02 Learn video: 8 whole meters + the open meter with 28 cm cut, no caption
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const tl=JSON.parse(fs.readFileSync(__dirname+'/timeline-3-11-02.json'));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('file://'+__dirname+'/harness-3-11-02.html');await p.waitForTimeout(400);await p.evaluate(t=>{window.NOCAP=true;init(t);},tl);
const t=await p.evaluate(()=>K.take+1.6);await p.evaluate(t=>render(t),t);await p.waitForTimeout(100);
await p.screenshot({path:'/home/claude/g3sb/repo/assets/video/g3math-11-02-learn.jpg',type:'jpeg',quality:86});await b.close();console.log('poster at',t);})();
