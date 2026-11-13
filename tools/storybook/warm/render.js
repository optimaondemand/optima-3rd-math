// node render.js 3.09.01 w1.json <fps|check> [times]
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [L,T,mode,times]=process.argv.slice(2);const tl=JSON.parse(fs.readFileSync(__dirname+'/'+T));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('LOG',m.text()));
await p.goto('file://'+__dirname+'/warm.html');await p.waitForTimeout(400);const K=await p.evaluate(([l,t])=>init(l,t),[L,tl]);console.log(JSON.stringify(K));
if(mode==='check'){for(const t of times.split(',').map(Number)){await p.evaluate(t=>render(t),t);await p.waitForTimeout(60);await p.screenshot({path:`chk/${L}-${t}.png`});}await b.close();return;}
const fps=+mode,dir='frames-'+L;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);const N=Math.ceil(K.total*fps);
for(let i=0;i<N;i++){await p.evaluate(t=>render(t),i/fps);if(i<2)await p.waitForTimeout(300);await p.screenshot({path:`${dir}/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:88});}
await b.close();console.log('frames',N);})();
