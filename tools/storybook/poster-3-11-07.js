// poster for the 3.11.07 Learn video: the bar model for the rope problem, no caption, no answer
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const tl=JSON.parse(fs.readFileSync(__dirname+'/timeline-3-11-07.json'));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('file://'+__dirname+'/harness-3-11-07.html');await p.waitForTimeout(400);await p.evaluate(t=>{window.NOCAP=true;init(t);},tl);
const t=await p.evaluate(()=>K.qm+1.5);await p.evaluate(t=>render(t),t);await p.waitForTimeout(100);
await p.screenshot({path:'/home/claude/g3sb/repo/assets/video/g3math-11-07-learn.jpg',type:'jpeg',quality:86});await b.close();console.log('poster at',t);})();
