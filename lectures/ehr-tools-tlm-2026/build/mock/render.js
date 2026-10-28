const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = process.argv[2], out = process.argv[3];
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 2.5, viewport: { width: 1200, height: 900 } });
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
    await p.goto('file://' + path.join(dir, f));
    const el = await p.$('#m > *');
    await el.screenshot({ path: path.join(out, f.replace('.html', '.png')) });
  }
  await b.close();
})();
