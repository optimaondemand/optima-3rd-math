// poster for the 3.11.05 Learn video: a 1,000 mL beaker read at its marks (water at 600 mL), no caption, no answer
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const tl=JSON.parse(fs.readFileSync(__dirname+'/timeline-3-11-05.json'));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('file://'+__dirname+'/harness-3-11-05.html');await p.waitForTimeout(400);await p.evaluate(t=>{window.NOCAP=true;init(t);},tl);
const t=await p.evaluate(()=>K.water+0.9);await p.evaluate(t=>render(t),t);await p.waitForTimeout(100);
await p.screenshot({path:'/home/claude/g3sb/repo/assets/video/g3math-11-05-learn.jpg',type:'jpeg',quality:86});await b.close();console.log('poster at',t);})();
