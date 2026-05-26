/* eslint-disable */
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1366, height: 768 },
  });

  const outDir = path.resolve(__dirname, '..', 'screenshots');

  async function shot(name, fn) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    try {
      await fn(page);
      const filePath = path.join(outDir, `${name}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved ${filePath}`);
    } catch (e) {
      console.error(`Failed ${name}:`, e.message);
    } finally {
      await page.close();
    }
  }

  // 1) admin_login (logged in as root)
  await shot('admin_login', async (page) => {
    await page.goto('http://localhost:8000/admin/login/', { waitUntil: 'networkidle0' });
    await page.type('input[name="username"]', 'root');
    await page.type('input[name="password"]', 'root');
    await Promise.all([
      page.click('input[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
  });

  // 2) admin_logout
  await shot('admin_logout', async (page) => {
    await page.goto('http://localhost:8000/admin/login/', { waitUntil: 'networkidle0' });
    await page.type('input[name="username"]', 'root');
    await page.type('input[name="password"]', 'root');
    await Promise.all([
      page.click('input[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    await page.goto('http://localhost:8000/admin/logout/', { waitUntil: 'networkidle0' });
  });

  // 3) get_dealers (React on :3000, anonymous)
  await shot('get_dealers', async (page) => {
    await page.goto('http://localhost:3000/dealers', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
  });

  // 4) get_dealers_loggedin
  await shot('get_dealers_loggedin', async (page) => {
    // login first
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await page.type('input[name="username"]', 'root');
    await page.type('input[name="psw"]', 'root');
    await page.click('input[type="submit"]');
    await new Promise((r) => setTimeout(r, 1500));
    await page.goto('http://localhost:3000/dealers', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
  });

  // 5) dealersbystate (filter by Kansas)
  await shot('dealersbystate', async (page) => {
    await page.goto('http://localhost:3000/dealers', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.select('select#state', 'Kansas');
    await new Promise((r) => setTimeout(r, 1500));
  });

  // 6) dealer_id_reviews — dealer 17 has 4 reviews
  await shot('dealer_id_reviews', async (page) => {
    await page.goto('http://localhost:3000/dealer/17', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2500));
  });

  // 7) dealership_review_submission — postreview form filled
  await shot('dealership_review_submission', async (page) => {
    // login
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await page.type('input[name="username"]', 'root');
    await page.type('input[name="psw"]', 'root');
    await page.click('input[type="submit"]');
    await new Promise((r) => setTimeout(r, 1500));
    // postreview
    await page.goto('http://localhost:3000/postreview/17', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2000));
    await page.type('#review', 'Fantastic services from this dealership, very helpful staff.');
    await page.evaluate(() => {
      const dateEl = document.querySelector('input[type="date"]');
      if (dateEl) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(dateEl, '2026-05-26');
        dateEl.dispatchEvent(new Event('input', { bubbles: true }));
        dateEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.select('select#cars', 'Toyota Corolla');
    await page.evaluate(() => {
      const yearEl = document.querySelector('input[type="int"]') || document.querySelectorAll('input')[document.querySelectorAll('input').length - 1];
    });
    // The "Car Year" input is type="int" which browsers treat as text. Find it and type.
    const yearInputs = await page.$$('input');
    if (yearInputs.length > 0) {
      await yearInputs[yearInputs.length - 1].type('2023');
    }
    await new Promise((r) => setTimeout(r, 800));
  });

  // 8) added_review — submit then view dealer reviews
  await shot('added_review', async (page) => {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await page.type('input[name="username"]', 'root');
    await page.type('input[name="psw"]', 'root');
    await page.click('input[type="submit"]');
    await new Promise((r) => setTimeout(r, 1500));
    await page.goto('http://localhost:3000/postreview/17', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2000));
    await page.type('#review', 'Outstanding experience! The staff was professional and helpful.');
    await page.evaluate(() => {
      const dateEl = document.querySelector('input[type="date"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(dateEl, '2026-05-26');
      dateEl.dispatchEvent(new Event('input', { bubbles: true }));
      dateEl.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.select('select#cars', 'Toyota Corolla');
    const inputs = await page.$$('input');
    if (inputs.length > 0) {
      await inputs[inputs.length - 1].type('2023');
    }
    await Promise.all([
      page.click('button.postreview'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {}),
    ]);
    await new Promise((r) => setTimeout(r, 2500));
  });

  await browser.close();
})();
