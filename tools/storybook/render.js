const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const tl=JSON.parse(fs.readFileSync('timeline.json'));const fps=+process.argv[2]||20;const only=process.argv[3];
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/harness.html');await p.waitForTimeout(500);await p.evaluate(t=>init(t),tl);
console.log(await p.evaluate(()=>JSON.stringify(K)));
if(only){for(const t of only.split(',').map(Number)){await p.evaluate(t=>render(t),t);await p.screenshot({path:'check-'+t+'.png'});}await b.close();return;}
fs.mkdirSync('frames',{recursive:true});const N=Math.ceil(tl.total*fps);
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/fps);await p.screenshot({path:`frames/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:88});}
await b.close();console.log('frames',N);})();
