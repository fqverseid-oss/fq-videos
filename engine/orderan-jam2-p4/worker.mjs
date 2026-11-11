import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const [k, nw, total, outDir] = [Number(process.argv[2]), Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
const FPS = 24;
fs.mkdirSync(`${outDir}/sub`, { recursive: true }); fs.mkdirSync(`${outDir}/nosub`, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('PAGEERR', e.message));
await p.goto('http://127.0.0.1:8767/index.html'); await p.waitForFunction(() => window.renderBoth && window.ready, null, { timeout: 60000 }); await p.evaluate(() => window.__f);
let n = 0;
for (let i = k; i < total; i += nw) {
  const nm = String(i).padStart(5, '0') + '.jpg';
  if (fs.existsSync(`${outDir}/sub/${nm}`)) continue;
  const r = await p.evaluate(t => window.renderBoth(t), i / FPS);
  fs.writeFileSync(`${outDir}/nosub/${nm}`, Buffer.from(r.nosub, 'base64')); fs.writeFileSync(`${outDir}/sub/${nm}`, Buffer.from(r.sub, 'base64'));
  if (++n % 100 === 0) console.log(`w${k}`, i, '/', total);
}
await b.close(); console.log(`w${k} done`);
