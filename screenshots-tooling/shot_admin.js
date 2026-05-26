const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new', executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ['--no-sandbox'],
    defaultViewport: { width: 1366, height: 768 },
  });
  const outDir = path.resolve(__dirname, '..', 'screenshots');

  // admin_login (logged in as root)
  let page = await browser.newPage();
  await page.goto('http://localhost:8000/admin/login/?next=/admin/', { waitUntil: 'networkidle0' });
  await page.type('input[name="username"]', 'root');
  await page.type('input[name="password"]', 'root');
  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  await page.screenshot({ path: path.join(outDir, 'admin_login.png') });
  console.log('admin_login saved');

  // admin_logout
  await page.goto('http://localhost:8000/admin/logout/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'admin_logout.png') });
  console.log('admin_logout saved');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
