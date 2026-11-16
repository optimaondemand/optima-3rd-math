// poster for the 3.11.04 Learn video: 1 km taken away, 4 whole km + the open km with 240 m cut, no caption
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const tl=JSON.parse(fs.readFileSync(__dirname+'/timeline-3-11-04.json'));const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
await p.goto('file://'+__dirname+'/harness-3-11-04.html');await p.waitForTimeout(400);await p.evaluate(t=>{window.NOCAP=true;init(t);},tl);
const t=await p.evaluate(()=>K.cut+1.6);await p.evaluate(t=>render(t),t);await p.waitForTimeout(100);
await p.screenshot({path:'/home/claude/g3sb/repo/assets/video/g3math-11-04-learn.jpg',type:'jpeg',quality:86});await b.close();console.log('poster at',t);})();
