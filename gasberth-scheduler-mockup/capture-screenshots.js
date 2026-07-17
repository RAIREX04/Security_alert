const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screens = [
  ['01-login', 'login'],
  ['02-dashboard-kalender-lpg', 'calendar-lpg'],
  ['03-cetak-kalender-lpg', 'print-calendar-lpg'],
  ['04-tv-lpg', 'tv-lpg'],
  ['05-cetak-tv-lpg', 'print-tv-lpg'],
  ['06-dashboard-lpg', 'dashboard-lpg'],
  ['07-data-jadwal-lpg', 'schedule-lpg'],
  ['08-tambah-data-lpg', 'add-lpg'],
  ['09-loading-port-lpg', 'master-lpg-loading'],
  ['10-discharge-port-lpg', 'master-lpg-discharge'],
  ['11-vessel-lpg', 'master-lpg-vessel'],
  ['12-activity-lpg', 'master-lpg-activity'],
  ['13-dashboard-kalender-lng', 'calendar-lng'],
  ['14-cetak-kalender-lng', 'print-calendar-lng'],
  ['15-tv-lng', 'tv-lng'],
  ['16-cetak-tv-lng', 'print-tv-lng'],
  ['17-dashboard-lng', 'dashboard-lng'],
  ['18-data-jadwal-lng', 'schedule-lng'],
  ['19-tambah-data-lng', 'add-lng'],
  ['20-loading-port-lng', 'master-lng-loading'],
  ['21-discharge-port-lng', 'master-lng-discharge'],
  ['22-vessel-lng', 'master-lng-vessel'],
  ['23-owner-lng', 'master-lng-owner'],
  ['24-berth-lng', 'master-lng-berth'],
  ['25-activity-lng', 'master-lng-activity'],
  ['26-status-lng', 'master-lng-status'],
  ['27-user-sebelum-superadmin', 'users-before'],
  ['28-user-setelah-superadmin', 'users-after'],
  ['29-view-only', 'view-only'],
];

(async () => {
  const root = __dirname;
  const outputDir = path.join(root, 'screenshots');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
  const url = 'file:///' + path.join(root, 'index.html').replace(/\\/g, '/');

  for (const [fileName, route] of screens) {
    await page.goto(`${url}#${route}`, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(outputDir, `${fileName}.png`), fullPage: false });
  }

  await browser.close();
  console.log(`Saved ${screens.length} screenshots to ${outputDir}`);
})();
