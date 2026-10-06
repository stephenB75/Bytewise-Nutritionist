/**
 * Capture App Store Connect screenshots at exact Apple pixel sizes.
 *
 * Devices:
 * - iPhone 18 (6.9" / Pro Max class): 1320 × 2868
 * - iPhone Duo outer: 1398 × 2034
 * - iPhone Duo inner: 2007 × 2853
 * - iPad 13": 2064 × 2752
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const BASE_URL = process.env.SCREENSHOT_URL || 'http://127.0.0.1:5012';
const OUT_ROOT = path.resolve('app-store-screenshots');
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const DEVICES = [
  { id: 'iphone-18', label: 'iPhone 18 (6.9")', width: 1320, height: 2868 },
  { id: 'iphone-duo-outer', label: 'iPhone Duo outer', width: 1398, height: 2034 },
  { id: 'iphone-duo-inner', label: 'iPhone Duo inner', width: 2007, height: 2853 },
  { id: 'ipad-13', label: 'iPad 13"', width: 2064, height: 2752 },
];

const SCREENS = [
  {
    file: '01-dashboard',
    testId: 'nav-dashboard',
    wait: '[data-testid="daily-progress"], [data-testid="progress-section"], [data-testid="navigation-tabs"]',
    // Store listing wants product UI, not only the hero fold.
    reveal: async (page) => {
      const btn = await page.$('button');
      // Prefer scrolling into the progress section when present.
      const progressed = await page.evaluate(() => {
        const el =
          document.querySelector('[data-testid="daily-progress"]')
          || document.querySelector('[data-testid="progress-section"]')
          || document.querySelector('[data-testid="progress-card"]');
        if (el) {
          el.scrollIntoView({ block: 'start' });
          return true;
        }
        window.scrollBy(0, Math.round(window.innerHeight * 0.85));
        return false;
      });
      if (!progressed) {
        // Click "View Progress" style CTA if scroll didn't find the section.
        await page.evaluate(() => {
          for (const b of document.querySelectorAll('button')) {
            const t = (b.textContent || '').toLowerCase();
            if (t.includes('view progress') || t.includes('start calculating') || t.includes('start fasting')) {
              b.click();
              break;
            }
          }
        });
      }
      void btn;
    },
  },
  {
    file: '02-tracker',
    testId: 'nav-calculator',
    wait: '[data-testid="main-food-search"], [data-testid="calorie-calculator-section"]',
    reveal: async (page) => {
      await page.evaluate(() => {
        const el =
          document.querySelector('[data-testid="main-food-search"]')
          || document.querySelector('[data-testid="calorie-calculator-section"]');
        if (el) el.scrollIntoView({ block: 'start' });
        else {
          for (const b of document.querySelectorAll('button')) {
            if ((b.textContent || '').toLowerCase().includes('start calculating')) {
              b.click();
              break;
            }
          }
          window.scrollBy(0, Math.round(window.innerHeight * 0.85));
        }
      });
    },
  },
  {
    file: '03-fasting',
    testId: 'nav-fasting',
    wait: '[data-testid="fasting-tracker"]',
    reveal: async (page) => {
      await page.evaluate(() => {
        const el = document.querySelector('[data-testid="fasting-tracker"]');
        if (el) el.scrollIntoView({ block: 'start' });
        else {
          for (const b of document.querySelectorAll('button')) {
            if ((b.textContent || '').toLowerCase().includes('start fasting')) {
              b.click();
              break;
            }
          }
          window.scrollBy(0, Math.round(window.innerHeight * 0.85));
        }
      });
    },
  },
  {
    file: '04-journal',
    testId: 'nav-journal',
    wait: 'body',
    reveal: async (page) => {
      await page.evaluate(() => window.scrollBy(0, Math.round(window.innerHeight * 0.55)));
    },
  },
  {
    file: '05-profile',
    testId: 'nav-profile',
    wait: '[data-testid="profile-content"]',
    reveal: async (page) => {
      await page.evaluate(() => {
        const el = document.querySelector('[data-testid="profile-content"]');
        if (el) el.scrollIntoView({ block: 'start' });
        else window.scrollBy(0, Math.round(window.innerHeight * 0.55));
      });
    },
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function dismissOverlays(page) {
  const testIds = [
    'welcome-dismiss-tour',
    'welcome-start-tour',
  ];
  for (const id of testIds) {
    try {
      const el = await page.$(`[data-testid="${id}"]`);
      if (el) {
        await el.click({ delay: 20 });
        await sleep(400);
      }
    } catch {
      // ignore missing overlays
    }
  }
  await page.evaluate(() => {
    const labels = ['maybe later', 'not now', 'skip', 'got it', 'close'];
    for (const btn of document.querySelectorAll('button')) {
      const text = (btn.textContent || '').trim().toLowerCase();
      if (labels.some((l) => text === l || text.includes(l))) {
        btn.click();
        break;
      }
    }
  }).catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
}

async function waitForApp(page) {
  await page.waitForSelector('[data-testid="navigation-tabs"]', { timeout: 45000 });
  await sleep(1200);
  await dismissOverlays(page);
  await sleep(400);
}

async function captureDevice(browser, device) {
  const dir = path.join(OUT_ROOT, device.id);
  fs.mkdirSync(dir, { recursive: true });

  const page = await browser.newPage();
  await page.setViewport({
    width: device.width,
    height: device.height,
    deviceScaleFactor: 1,
    isMobile: device.id !== 'ipad-13',
    hasTouch: true,
  });

  // Prefer a clean guest session for marketing shots
  await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => {
    try {
      localStorage.setItem('bytewise-welcome-dismissed', '1');
      localStorage.setItem('welcomeTourDismissed', '1');
      localStorage.setItem('profileCompletionDismissed', '1');
    } catch {}
  });
  await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
  await waitForApp(page);

  const readmeLines = [
    `# ${device.label}`,
    ``,
    `App Store size: ${device.width} × ${device.height} (portrait PNG)`,
    `Captured from: ${BASE_URL}`,
    ``,
  ];

  for (const screen of SCREENS) {
    const nav = await page.$(`[data-testid="${screen.testId}"]`);
    if (!nav) throw new Error(`Missing nav ${screen.testId} on ${device.id}`);
    await nav.click();
    await sleep(900);
    try {
      await page.waitForSelector(screen.wait, { timeout: 8000 });
    } catch {
      // Journal may not expose a stable test id; continue with viewport shot
    }
    await dismissOverlays(page);
    await sleep(300);

    // Hero fold first (branded App Store frame)
    const heroPath = path.join(dir, `${screen.file}-hero.png`);
    await page.screenshot({
      path: heroPath,
      type: 'png',
      fullPage: false,
      captureBeyondViewport: false,
    });

    if (typeof screen.reveal === 'function') {
      await screen.reveal(page);
      await sleep(700);
      await dismissOverlays(page);
      await sleep(300);
    }

    const outPath = path.join(dir, `${screen.file}.png`);
    await page.screenshot({
      path: outPath,
      type: 'png',
      fullPage: false,
      captureBeyondViewport: false,
    });

    // Verify exact pixels
    const dims = await page.evaluate(() => ({
      w: window.innerWidth,
      h: window.innerHeight,
      dpr: window.devicePixelRatio,
    }));
    console.log(`  ✓ ${device.id}/${screen.file}.png (+hero)  (${dims.w}×${dims.h} @${dims.dpr}x)`);
    readmeLines.push(`- ${screen.file}.png (feature UI)`);
    readmeLines.push(`- ${screen.file}-hero.png (branded hero)`);
  }

  fs.writeFileSync(path.join(dir, 'README.md'), readmeLines.join('\n') + '\n');
  await page.close();
}

async function main() {
  if (!fs.existsSync(CHROME)) {
    throw new Error(`Chrome not found at ${CHROME}`);
  }
  fs.mkdirSync(OUT_ROOT, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    defaultViewport: null,
    args: [
      '--hide-scrollbars',
      '--disable-gpu',
      '--no-sandbox',
      '--force-device-scale-factor=1',
      '--high-dpi-support=1',
    ],
  });

  try {
    for (const device of DEVICES) {
      console.log(`\nCapturing ${device.label}…`);
      await captureDevice(browser, device);
    }
  } finally {
    await browser.close();
  }

  const index = [
    '# App Store Screenshots',
    '',
    'Portrait PNGs sized for App Store Connect upload.',
    '',
    '| Folder | Device | Size |',
    '|---|---|---|',
    ...DEVICES.map((d) => `| \`${d.id}/\` | ${d.label} | ${d.width}×${d.height} |`),
    '',
    'Screens per device: dashboard, tracker, fasting, journal, profile.',
    '',
    'Note: iPhone Duo uploads may not be accepted in App Store Connect until Apple enables that slot; files are ready at the published sizes.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT_ROOT, 'README.md'), index);
  console.log(`\nDone → ${OUT_ROOT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
