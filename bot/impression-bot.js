// bot/impression-bot.js
const { chromium } = require('playwright');

const randomDelay = (min, max) =>
  new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));

/**
 * Moves the mouse along a Bezier curve — identical to real human movement.
 * Straight-line movement is a bot fingerprint. Curves are not.
 * @param {object} page - Playwright page object
 * @param {number} targetX - Destination X coordinate
 * @param {number} targetY - Destination Y coordinate
 */
async function bezierMouseMove(page, targetX, targetY) {
  if (page.isClosed()) return;
  const startX = Math.random() * 800;
  const startY = Math.random() * 600;
  // Two control points for the Bezier curve (the "handles")
  const cp1x = startX + (Math.random() - 0.5) * 300;
  const cp1y = startY + (Math.random() - 0.5) * 300;
  const cp2x = targetX + (Math.random() - 0.5) * 200;
  const cp2y = targetY + (Math.random() - 0.5) * 200;
  const steps = Math.floor(Math.random() * 20) + 20;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.pow(1 - t, 3) * startX
            + 3 * Math.pow(1 - t, 2) * t * cp1x
            + 3 * (1 - t) * Math.pow(t, 2) * cp2x
            + Math.pow(t, 3) * targetX;
    const y = Math.pow(1 - t, 3) * startY
            + 3 * Math.pow(1 - t, 2) * t * cp1y
            + 3 * (1 - t) * Math.pow(t, 2) * cp2y
            + Math.pow(t, 3) * targetY;
    await page.mouse.move(x, y).catch(() => {});
    await randomDelay(10, 30);
  }
}

/**
 * Simulates organic, human-like scrolling behavior.
 * A 0% scroll rate is statistically impossible for real users.
 * @param {object} page - Playwright page object
 */
async function organicScroll(page) {
  if (page.isClosed()) return;
  const scrolls = Math.floor(Math.random() * 4) + 2;
  for (let i = 0; i < scrolls; i++) {
    const distance = Math.floor(Math.random() * 400) + 100;
    await page.mouse.wheel(0, distance).catch(() => {});
    await randomDelay(600, 1800);
  }
  // Sometimes scroll back up a bit like a real reader
  if (Math.random() > 0.5) {
    await page.mouse.wheel(0, -(Math.floor(Math.random() * 200) + 50)).catch(() => {});
    await randomDelay(400, 900);
  }
}

/**
 * Generates a realistic Chrome desktop device profile.
 * Safari/iOS profiles are removed — faking Safari on Chromium
 * creates a detectable TLS mismatch.
 * @returns {object} Device profile
 */
function generateProfile() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 🕐 US Timezones to match the US residential proxy pool
  const US_TIMEZONES = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
  ];

  const windowsGPUs = [
    { gpuVendor: 'Google Inc. (NVIDIA)', gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (NVIDIA)', gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (NVIDIA)', gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (Intel)',  gpuRenderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (Intel)',  gpuRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 770 Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (AMD)',    gpuRenderer: 'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0)' },
  ];

  const macGPUs = [
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple M1' },
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple M2' },
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple M3' },
    { gpuVendor: 'Google Inc. (Apple)', gpuRenderer: 'ANGLE (Apple, Apple M2, OpenGL 4.1)' },
  ];

  const windowsRes = [{ w: 1920, h: 1080 }, { w: 2560, h: 1440 }, { w: 1366, h: 768 }, { w: 1536, h: 864 }];
  const macRes     = [{ w: 1440, h: 900  }, { w: 2560, h: 1600 }, { w: 1512, h: 982 }, { w: 1728, h: 1117 }];

  // Chrome versions with matching userAgentData brands
  const chromeVersions = [
    { version: '122.0.0.0', fullVersion: '122.0.6261.128' },
    { version: '123.0.0.0', fullVersion: '123.0.6312.107' },
    { version: '124.0.0.0', fullVersion: '124.0.6367.82'  },
  ];

  const deviceTypes = [
    () => { // Windows Chrome
      const res = pick(windowsRes); const gpu = pick(windowsGPUs); const cv = pick(chromeVersions);
      return {
        userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${cv.version} Safari/537.36`,
        platform: 'Win32', cores: pick([4, 8, 12, 16]), memory: pick([8, 16, 32]),
        width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer,
        isMobile: false, timezone: pick(US_TIMEZONES), chromeVersion: cv.version, fullVersion: cv.fullVersion,
        uaDataPlatform: 'Windows', brands: [
          { brand: 'Chromium', version: cv.version.split('.')[0] },
          { brand: 'Google Chrome', version: cv.version.split('.')[0] },
          { brand: 'Not:A-Brand', version: '24' }
        ]
      };
    },
    () => { // Windows Edge
      const res = pick(windowsRes); const gpu = pick(windowsGPUs); const cv = pick(chromeVersions);
      return {
        userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${cv.version} Safari/537.36 Edg/${cv.version}`,
        platform: 'Win32', cores: pick([4, 8, 12, 16]), memory: pick([8, 16, 32]),
        width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer,
        isMobile: false, timezone: pick(US_TIMEZONES), chromeVersion: cv.version, fullVersion: cv.fullVersion,
        uaDataPlatform: 'Windows', brands: [
          { brand: 'Chromium', version: cv.version.split('.')[0] },
          { brand: 'Microsoft Edge', version: cv.version.split('.')[0] },
          { brand: 'Not:A-Brand', version: '24' }
        ]
      };
    },
    () => { // macOS Chrome
      const res = pick(macRes); const gpu = pick(macGPUs); const cv = pick(chromeVersions);
      return {
        userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${cv.version} Safari/537.36`,
        platform: 'MacIntel', cores: pick([8, 10, 12]), memory: pick([8, 16, 24]),
        width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer,
        isMobile: false, timezone: pick(US_TIMEZONES), chromeVersion: cv.version, fullVersion: cv.fullVersion,
        uaDataPlatform: 'macOS', brands: [
          { brand: 'Chromium', version: cv.version.split('.')[0] },
          { brand: 'Google Chrome', version: cv.version.split('.')[0] },
          { brand: 'Not:A-Brand', version: '24' }
        ]
      };
    },
  ];

  return pick(deviceTypes)();
}

/**
 * Executes a high-stealth impression session.
 * All stealth overrides are handled at the CDP layer by Browserless.
 * @param {string} targetUrl - The ad network URL to hit
 * @param {string} profileId - Unique ID for this bot instance (for logging)
 * @param {string} browserlessToken - The Browserless API key
 */
async function runImpression(targetUrl, profileId, browserlessToken) {
  let browser;
  const profile = generateProfile();

  // ✅ Original Browserless endpoint with stealth=true activated at CDP level.
  // No extra Chrome flags — they change browser behavior in detectable ways.
  const wsUrl = `wss://chrome.browserless.io?token=${browserlessToken}&stealth=true&blockAds=false&timeout=90000&proxy=residential&proxyCountry=us`;

  // 🔄 CONNECTION RETRY ENGINE
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      browser = await chromium.connectOverCDP(wsUrl);
      break;
    } catch (error) {
      if (attempt === 2) throw error;
      await randomDelay(5000, 8000);
    }
  }

  const context = await browser.newContext({
    userAgent: profile.userAgent,
    viewport:  { width: profile.width, height: profile.height },
    isMobile:  false,
    locale:    'en-US',
    timezoneId: profile.timezone,
    // 🔗 REFERRER SPOOFING: Traffic appears to come from a real gaming/lifestyle site.
    // A blank referer = direct traffic = instant ban. Real users click links.
    extraHTTPHeaders: {
      'Referer':         'https://ankergames.net/',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  // 🎭 Spoof userAgentData (Client Hints) — the hidden API that exposes Chromium
  // even when you fake the User-Agent string. This must match the profile exactly.
  await context.addInitScript((p) => {
    try {
      Object.defineProperty(navigator, 'userAgentData', {
        get: () => ({
          brands:   p.brands,
          mobile:   false,
          platform: p.uaDataPlatform,
          getHighEntropyValues: (hints) => Promise.resolve({
            brands:          p.brands,
            mobile:          false,
            platform:        p.uaDataPlatform,
            uaFullVersion:   p.fullVersion,
            platformVersion: p.uaDataPlatform === 'Windows' ? '10.0.0' : '14.0.0',
            architecture:    'x86',
            bitness:         '64',
            model:           '',
          }),
        }),
      });
    } catch(e) {}
  }, { brands: profile.brands, uaDataPlatform: profile.uaDataPlatform, fullVersion: profile.fullVersion });

  const page = await context.newPage();
  let activePage = page;

  // Follow any pop-ups or redirects from the ad network
  context.on('page', async (newPage) => {
    activePage = newPage;
    await activePage.bringToFront().catch(() => {});
  });

  try {
    console.log(`[Bot ${profileId}] 🚀 Navigating to Target... [${profile.timezone}]`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Wait for ads/trackers to fire — critical for impression generation
    await randomDelay(2000, 4000);

    // --- Phase 1: Human Dwell — Realistic bell-curve distribution ---
    // Tight timing windows are statistically detectable. Real users:
    // 20% bounce fast (5-10s), 60% read normally (15-35s), 20% deep-read (35-50s)
    const dwellRoll = Math.random();
    const dwellMs = dwellRoll < 0.20 ? (5000  + Math.random() * 5000)   // Bounce
                  : dwellRoll < 0.80 ? (15000 + Math.random() * 20000)  // Normal
                  :                    (35000 + Math.random() * 15000);  // Deep read

    console.log(`[Bot ${profileId}] Phase 1: Human Dwell (${Math.round(dwellMs/1000)}s)...`);
    const dwellEnd = Date.now() + dwellMs;
    let scrolled = false;
    while (Date.now() < dwellEnd && !activePage.isClosed()) {
      await bezierMouseMove(activePage, Math.random() * profile.width, Math.random() * profile.height);
      if (!scrolled && Math.random() > 0.3) {
        await organicScroll(activePage);
        scrolled = true;
      }
      await randomDelay(1500, 3500);
    }

    // --- Phase 2: Interaction — Realistic 5% CTR ---
    // Real human CTR is 1-5%. 100% CTR is a guaranteed fraud flag.
    if (!activePage.isClosed() && Math.random() < 0.05) {
      console.log(`[Bot ${profileId}] Phase 2: CTA Click...`);
      const cta = await activePage.evaluate(() => {
        const btn = document.querySelector('a[href], button');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }).catch(() => null);

      if (cta) {
        await bezierMouseMove(activePage, cta.x, cta.y);
        await randomDelay(300, 700);
        await activePage.mouse.click(cta.x, cta.y).catch(() => {});
        console.log(`[Bot ${profileId}] ✅ Click Successful. Dwelling 6-9s...`);
        await randomDelay(6000, 9000);
      }
    }

    // --- Phase 3: Randomized Exit — 30% back button, 70% just close ---
    // Using back button 100% of the time is a bot pattern.
    if (!activePage.isClosed()) {
      if (Math.random() < 0.30) {
        console.log(`[Bot ${profileId}] Phase 3: Back Button Exit...`);
        await activePage.goBack({ timeout: 4000 }).catch(() => {});
        await randomDelay(1000, 2000);
        await activePage.goBack({ timeout: 4000 }).catch(() => {});
      }
      // else: just close the browser, like a normal user closing a tab
    }

  } catch (error) {
    console.log(`[Bot ${profileId}] Session Interrupted: ${error.message.split('\n')[0]}`);
  } finally {
    console.log(`[Bot ${profileId}] ✅ Session Complete.`);
    await browser.close().catch(() => {});
  }
}

module.exports = { runImpression };
