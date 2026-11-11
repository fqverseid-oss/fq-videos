import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const times=process.argv.slice(3).map(Number); const out=process.argv[2]; fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('PAGEERR',e.message)); p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await p.goto('http://127.0.0.1:8767/index.html'); await p.waitForFunction(()=>window.renderBoth,null,{timeout:30000}); await p.evaluate(()=>window.__f);
for(const t of times){ const r=await p.evaluate(t=>window.renderBoth(t),t); fs.writeFileSync(`${out}/f_${t}.jpg`,Buffer.from(r.sub,'base64')); }
await b.close();
