import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs';
const port = process.env.PORT || 8766; const times = process.argv.slice(2).map(Number);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text().slice(0, 300)));
await p.goto(`http://127.0.0.1:${port}/index.html`); await p.waitForFunction(() => window.render && window.ready, null, { timeout: 40000 }); await p.evaluate(() => window.__f);
for (const t of times) { const t0 = Date.now(); await p.evaluate(t => window.render(t), t); await p.locator('canvas').first().screenshot({ path: `f_${t}.png` }); console.log(t, Date.now() - t0, 'ms'); }
await b.close();
