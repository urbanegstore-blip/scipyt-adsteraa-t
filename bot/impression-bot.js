// bot/impression-bot.js
const { chromium } = require('playwright');

const randomDelay = (min, max) =>
  new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));

/**
 * Moves the mouse along a Bézier curve — organic human-like acceleration.
 * @param {import('playwright').Page} page
 * @param {number} toX
 * @param {number} toY
 */
async function bezierMouseMove(page, toX, toY) {
  if (page.isClosed()) return;
  try {
    const pos = await page.evaluate(() => ({ x: window.__botX || 400, y: window.__botY || 300 }));
    const fromX = pos.x;
    const fromY = pos.y;

    // Control points for a quadratic Bézier curve
    const cpX = fromX + (Math.random() - 0.5) * 300;
    const cpY = fromY + (Math.random() - 0.5) * 300;
    const steps = Math.floor(Math.random() * 20) + 15;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // Quadratic Bézier formula
      const x = Math.pow(1 - t, 2) * fromX + 2 * (1 - t) * t * cpX + Math.pow(t, 2) * toX;
      const y = Math.pow(1 - t, 2) * fromY + 2 * (1 - t) * t * cpY + Math.pow(t, 2) * toY;
      await page.mouse.move(x, y);
      await randomDelay(10, 30);
    }

    await page.evaluate((coords) => {
      window.__botX = coords.x;
      window.__botY = coords.y;
    }, { x: toX, y: toY });
  } catch (e) {}
}

/**
 * Performs organic, randomized page scrolling.
 * @param {import('playwright').Page} page
 */
async function organicScroll(page) {
  if (page.isClosed()) return;
  try {
    const scrolls = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < scrolls; i++) {
      const distance = Math.floor(Math.random() * 400) + 100;
      const direction = Math.random() > 0.2 ? distance : -distance; // mostly scroll down
      await page.mouse.wheel(0, direction);
      await randomDelay(500, 1500);
    }
  } catch (e) {}
}

/**
 * Generates a realistic US Chrome Windows/macOS/Android profile.
 * iOS/Safari profiles are intentionally excluded to prevent TLS mismatch.
 */
function generateProfile() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const windowsGPUs = [
    { gpuVendor: 'Google Inc. (NVIDIA)', gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (NVIDIA)', gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (Intel)',  gpuRenderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (Intel)',  gpuRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 770 Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (AMD)',    gpuRenderer: 'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0)' }
  ];

  const macGPUs = [
    { gpuVendor: 'Google Inc. (Apple)', gpuRenderer: 'ANGLE (Apple, Apple M1, OpenGL 4.1)' },
    { gpuVendor: 'Google Inc. (Apple)', gpuRenderer: 'ANGLE (Apple, Apple M2, OpenGL 4.1)' },
    { gpuVendor: 'Google Inc. (Apple)', gpuRenderer: 'ANGLE (Apple, Apple M3, OpenGL 4.1)' }
  ];

  const androidGPUs = [
    { gpuVendor: 'Qualcomm', gpuRenderer: 'Adreno (TM) 740' },
    { gpuVendor: 'Qualcomm', gpuRenderer: 'Adreno (TM) 730' },
    { gpuVendor: 'ARM',      gpuRenderer: 'Mali-G710' }
  ];

  const usTimezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'
  ];

  const windowsRes = [{ w: 1920, h: 1080 }, { w: 2560, h: 1440 }, { w: 1366, h: 768 }, { w: 1536, h: 864 }];
  const macRes     = [{ w: 1440, h: 900  }, { w: 2560, h: 1600 }, { w: 1512, h: 982  }, { w: 1728, h: 1117 }];
  const androidRes = [{ w: 412,  h: 915  }, { w: 360,  h: 800  }, { w: 384,  h: 854  }, { w: 432,  h: 960  }];

  const deviceTypes = [
    () => { // Windows Chrome
      const res = pick(windowsRes); const gpu = pick(windowsGPUs);
      return {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        platform: 'Win32', cores: pick([4, 8, 12, 16]), memory: pick([8, 16, 32]),
        width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer,
        isMobile: false, timezone: pick(usTimezones),
        uaBrands: [{ brand: 'Chromium', version: '124' }, { brand: 'Google Chrome', version: '124' }, { brand: 'Not-A.Brand', version: '99' }],
        uaPlatform: 'Windows'
      };
    },
    () => { // Windows Edge
      const res = pick(windowsRes); const gpu = pick(windowsGPUs);
      return {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
        platform: 'Win32', cores: pick([4, 8, 12, 16]), memory: pick([8, 16, 32]),
        width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer,
        isMobile: false, timezone: pick(usTimezones),
        uaBrands: [{ brand: 'Chromium', version: '124' }, { brand: 'Microsoft Edge', version: '124' }, { brand: 'Not-A.Brand', version: '99' }],
        uaPlatform: 'Windows'
      };
    },
    () => { // macOS Chrome
      const res = pick(macRes); const gpu = pick(macGPUs);
      return {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        platform: 'MacIntel', cores: pick([8, 10, 12]), memory: pick([8, 16, 24]),
        width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer,
        isMobile: false, timezone: pick(usTimezones),
        uaBrands: [{ brand: 'Chromium', version: '124' }, { brand: 'Google Chrome', version: '124' }, { brand: 'Not-A.Brand', version: '99' }],
        uaPlatform: 'macOS'
      };
    },
    () => { // Android Chrome
      const res = pick(androidRes); const gpu = pick(androidGPUs);
      return {
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv8l', cores: pick([8]), memory: pick([6, 8, 12]),
        width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer,
        isMobile: true, timezone: pick(usTimezones),
        uaBrands: [{ brand: 'Chromium', version: '124' }, { brand: 'Google Chrome', version: '124' }, { brand: 'Not-A.Brand', version: '99' }],
        uaPlatform: 'Android'
      };
    }
  ];

  return pick(deviceTypes)();
}

/**
 * Referrer pool — the bot arrives from a real-looking game/news page.
 */
const REFERRERS = [
  'https://ankergames.net/',
  'https://ankergames.net/play',
  'https://ankergames.net/games/action',
  'https://ankergames.net/top-games',
  'https://ankergames.net/new-releases'
];

/**
 * Executes a high-stealth impression session.
 * Keeps the core impression generation (dwell, interaction, history) intact
 * while patching all identified fingerprint leaks.
 * @param {string} targetUrl
 * @param {string} profileId
 * @param {string} browserlessToken
 */
async function runImpression(targetUrl, profileId, browserlessToken) {
  let browser;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ✅ CLEAN WS URL: No custom Chrome flags (they change behaviour detectably).
  // Stealth + blockAds=false + residential proxy are the only additions.
  const wsUrl = `wss://chrome.browserless.io?token=${browserlessToken}&stealth=true&blockAds=false&timeout=60000&proxy=residential&proxyCountry=us`;

  // 🔄 CONNECTION RETRY ENGINE
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      browser = await chromium.connectOverCDP(wsUrl);
      break;
    } catch (error) {
      if (attempt === 2) throw error;
      await randomDelay(5000, 7000);
    }
  }

  const profile = generateProfile();
  const referrer = pick(REFERRERS);

  // ✅ Context now includes timezone + locale to match US residential proxy
  const context = await browser.newContext({
    userAgent: profile.userAgent,
    viewport: { width: profile.width, height: profile.height },
    isMobile: profile.isMobile,
    hasTouch: profile.isMobile,
    locale: 'en-US',
    timezoneId: profile.timezone,
    // ✅ Referrer spoof: bot looks like it came from a real site
    extraHTTPHeaders: { 'Referer': referrer, 'Accept-Language': 'en-US,en;q=0.9' }
  });

  // ✅ Only spoof Client Hints (navigator.userAgentData) — the one thing
  // Browserless's stealth mode does NOT patch automatically.
  // This prevents the TLS/UA mismatch detected by ad networks.
  await context.addInitScript((p) => {
    try {
      if (navigator.userAgentData) {
        Object.defineProperty(navigator, 'userAgentData', {
          get: () => ({
            brands: p.uaBrands,
            mobile: p.isMobile,
            platform: p.uaPlatform,
            getHighEntropyValues: () => Promise.resolve({
              platform: p.uaPlatform,
              brands: p.uaBrands,
              mobile: p.isMobile
            })
          }),
          configurable: true
        });
      }
    } catch (e) {}
  }, { uaBrands: profile.uaBrands, isMobile: profile.isMobile, uaPlatform: profile.uaPlatform });

  const page = await context.newPage();
  let activePage = page;
  let impressionRecorded = false;

  // 🕵️ ALLOW FULL LOAD & REDIRECTS (To maximize CPM)
  context.on('page', async newPage => {
    console.log(`[Bot ${profileId}] 🔀 Redirect opened!`);
    activePage = newPage;
    await activePage.bringToFront().catch(() => {});
  });

  page.on('request', req => {
    if (/pixel|impression|trk|analytics/.test(req.url())) {
      impressionRecorded = true;
      console.log(`[Bot ${profileId}] 🎯 Impression Detected!`);
    }
  });

  try {
    console.log(`[Bot ${profileId}] 🚀 Navigating from ${referrer.split('/')[2]}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000, referer: referrer });

    // ──────────────────────────────────────────────
    // Phase 1: Human Dwell (13-15s) with Bézier movement + organic scroll
    // ──────────────────────────────────────────────
    const dwellEnd = Date.now() + 13500 + Math.random() * 2000;
    console.log(`[Bot ${profileId}] Phase 1: Human Dwell (15s)...`);
    while (Date.now() < dwellEnd && !activePage.isClosed()) {
      await bezierMouseMove(activePage, Math.random() * profile.width * 0.8, Math.random() * profile.height * 0.8);
      await organicScroll(activePage);
      await randomDelay(1500, 2500);
    }

    // ──────────────────────────────────────────────
    // Phase 2: Click the main CTA — only 40% of bots click (realistic CTR)
    // ──────────────────────────────────────────────
    if (!activePage.isClosed() && Math.random() < 0.40) {
      console.log(`[Bot ${profileId}] Phase 2: Interaction...`);
      const cta = await activePage.evaluate(() => {
        // Score candidate elements — prefer visible, large, and text-rich ones
        const candidates = Array.from(document.querySelectorAll('a[href], button'));
        const scored = candidates.map(el => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return null;
          const area = r.width * r.height;
          const hasText = (el.innerText || '').trim().length > 0;
          return { x: r.left + r.width / 2, y: r.top + r.height / 2, score: area + (hasText ? 5000 : 0) };
        }).filter(Boolean);
        scored.sort((a, b) => b.score - a.score);
        return scored[0] || null;
      }).catch(() => null);

      if (cta) {
        await bezierMouseMove(activePage, cta.x, cta.y);
        await randomDelay(300, 800);
        await activePage.mouse.click(cta.x, cta.y).catch(() => {});
        console.log(`[Bot ${profileId}] ✅ Click Successful. Waiting 8s...`);
        await randomDelay(8000, 8500);
      }
    }

    // ──────────────────────────────────────────────
    // Phase 3: Randomized exit (70% scroll+close, 30% history back)
    // ──────────────────────────────────────────────
    if (!activePage.isClosed()) {
      if (Math.random() < 0.3) {
        console.log(`[Bot ${profileId}] Phase 3: Simulating Back Navigation...`);
        await activePage.goBack({ timeout: 4000 }).catch(() => {});
        await randomDelay(1500, 2500);
        await activePage.goBack({ timeout: 4000 }).catch(() => {});
      } else {
        console.log(`[Bot ${profileId}] Phase 3: Scrolling to bottom, then closing tab...`);
        await organicScroll(activePage);
        await randomDelay(1000, 2000);
      }
    }

  } catch (error) {
    console.log(`[Bot ${profileId}] Session Interrupted: ${error.message}`);
  } finally {
    console.log(`[Bot ${profileId}] ✅ Session Complete.`);
    await browser.close().catch(() => {});
  }
}

module.exports = { runImpression };
