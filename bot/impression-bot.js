// bot/impression-bot.js
const { chromium } = require('playwright');

/**
 * Generates a Bézier-curved mouse path for organic human movement.
 * Anti-bot systems flag linear mouse.move() paths; real humans move in curves.
 */
async function humanMouseMove(page, targetX, targetY) {
  if (page.isClosed()) return;
  try {
    // Get current mouse position (default to random origin)
    const startX = Math.random() * 400;
    const startY = Math.random() * 300;
    
    // Bézier control points for natural curve
    const cp1x = startX + (targetX - startX) * 0.25 + (Math.random() - 0.5) * 100;
    const cp1y = startY + (targetY - startY) * 0.25 + (Math.random() - 0.5) * 100;
    const cp2x = startX + (targetX - startX) * 0.75 + (Math.random() - 0.5) * 60;
    const cp2y = startY + (targetY - startY) * 0.75 + (Math.random() - 0.5) * 60;
    
    const steps = Math.floor(Math.random() * 15) + 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const x = u*u*u*startX + 3*u*u*t*cp1x + 3*u*t*t*cp2x + t*t*t*targetX;
      const y = u*u*u*startY + 3*u*u*t*cp1y + 3*u*t*t*cp2y + t*t*t*targetY;
      await page.mouse.move(x, y);
      // Variable speed: slower at start/end, faster in middle (like a real hand)
      const delay = Math.floor(5 + Math.random() * 15 * (1 + Math.sin(Math.PI * t)));
      await new Promise(r => setTimeout(r, delay));
    }
  } catch (e) {}
}

/**
 * Simulates organic page scrolling with variable speed and pauses.
 */
async function humanScroll(page) {
  if (page.isClosed()) return;
  try {
    const scrollChunks = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < scrollChunks; i++) {
      const distance = Math.floor(Math.random() * 300) + 100;
      await page.mouse.wheel(0, distance);
      await randomDelay(500, 1500);
    }
    // Occasionally scroll back up slightly (like a real reader)
    if (Math.random() < 0.3) {
      await page.mouse.wheel(0, -(Math.floor(Math.random() * 150) + 50));
      await randomDelay(300, 800);
    }
  } catch (e) {}
}

const randomDelay = (min, max) =>
  new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generates a realistic browser profile for context creation.
 * NOTE: We only generate profiles that match Chromium-based browsers,
 * since Browserless runs real Chromium. Faking Safari/iOS user-agents
 * on a Chromium engine is a MASSIVE detection vector (TLS mismatch).
 */
function generateProfile() {
  const desktopProfiles = [
    () => {
      // Windows Chrome
      const res = pick([{w:1920, h:1080}, {w:2560, h:1440}, {w:1366, h:768}, {w:1536, h:864}, {w:1600, h:900}]);
      return { userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${pick(['124','125','126'])}.0.0.0 Safari/537.36`, width: res.w, height: res.h, isMobile: false };
    },
    () => {
      // Windows Edge
      const res = pick([{w:1920, h:1080}, {w:2560, h:1440}, {w:1366, h:768}]);
      const ver = pick(['124','125','126']);
      return { userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ver}.0.0.0 Safari/537.36 Edg/${ver}.0.0.0`, width: res.w, height: res.h, isMobile: false };
    },
    () => {
      // macOS Chrome
      const res = pick([{w:1440, h:900}, {w:2560, h:1600}, {w:1512, h:982}, {w:1728, h:1117}]);
      return { userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${pick(['123','124','125'])}.0.0.0 Safari/537.36`, width: res.w, height: res.h, isMobile: false };
    },
    () => {
      // Android Chrome (mobile)
      const res = pick([{w:412, h:915}, {w:360, h:800}, {w:384, h:854}, {w:432, h:960}]);
      const device = pick(['SM-S918B', 'SM-A546B', 'Pixel 8 Pro', 'SM-S928B']);
      return { userAgent: `Mozilla/5.0 (Linux; Android 14; ${device}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${pick(['124','125','126'])}.0.0.0 Mobile Safari/537.36`, width: res.w, height: res.h, isMobile: true };
    }
  ];

  return pick(desktopProfiles)();
}

/**
 * Executes a high-stealth impression session.
 * 
 * CRITICAL DESIGN DECISION:
 * Browserless's `stealth=true` already handles at the CDP level:
 *   - navigator.webdriver = false
 *   - navigator.plugins (realistic injection)
 *   - Canvas fingerprint entropy
 *   - WebGL vendor/renderer masking
 *   - Audio context fingerprint noise
 *   - Chrome runtime object injection
 * 
 * We do NOT re-inject any of these via addInitScript because:
 *   1. Double-patching creates detectable inconsistencies
 *   2. JS-level overrides can be detected via property descriptor checks
 *   3. Browserless applies patches at CDP level which is invisible to JS
 * 
 * What WE handle (things Browserless does NOT):
 *   - Realistic user-agent (Chromium-only, no Safari faking)
 *   - Timezone matching to proxy country
 *   - Locale consistency
 *   - Referrer headers (organic traffic source)
 *   - Human-like mouse movement (Bézier curves, not linear)
 *   - Organic scroll behavior
 *   - Randomized dwell times
 *   - Realistic CTR limiting (15%)
 */
async function runImpression(targetUrl, profileId, browserlessToken) {
  let browser;

  // 🔗 CONNECTION URL — using ?stealth=true param (works on all token tiers incl. free)
  // NOTE: /chromium/stealth dedicated route requires paid plan — do NOT use it
  const wsUrl = `wss://chrome.browserless.io?token=${browserlessToken}&stealth=true&blockAds=false&timeout=90000&proxy=residential&proxyCountry=us`;
  
  // 🔄 CONNECTION RETRY ENGINE
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      browser = await chromium.connectOverCDP(wsUrl);
      break;
    } catch (error) {
      if (attempt === 3) throw error;
      await randomDelay(3000, 6000);
    }
  }

  const profile = generateProfile();

  const context = await browser.newContext({
    userAgent: profile.userAgent,
    viewport: { width: profile.width, height: profile.height },
    isMobile: profile.isMobile,
    hasTouch: profile.isMobile,
    locale: 'en-US',
    timezoneId: pick(['America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Denver']),
    colorScheme: pick(['light', 'dark']),
    // Permissions that a real browser would have granted
    permissions: ['geolocation']
  });

  // 🛡️ REFERRER HEADER (Organic traffic source)
  await context.setExtraHTTPHeaders({
    'Referer': 'https://ankergames.net/',
    'Accept-Language': 'en-US,en;q=0.9'
  });

  const page = await context.newPage();
  let activePage = page;

  // 🕵️ ALLOW REDIRECTS (Ad networks use redirect chains for tracking)
  context.on('page', async newPage => {
    activePage = newPage;
    await activePage.bringToFront().catch(() => {});
  });

  try {
    console.log(`[Bot ${profileId}] 🚀 Navigating to Target...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // ========= PHASE 1: ORGANIC DWELL (12-18s) =========
    // Randomized dwell time prevents statistical clustering
    const dwellMs = 12000 + Math.random() * 6000;
    const dwellEnd = Date.now() + dwellMs;
    console.log(`[Bot ${profileId}] Phase 1: Organic Dwell (${Math.round(dwellMs/1000)}s)...`);
    
    // Initial pause before any movement (humans take a moment to orient)
    await randomDelay(1000, 2500);
    
    while (Date.now() < dwellEnd && !activePage.isClosed()) {
      const action = Math.random();
      if (action < 0.4) {
        // Mouse movement (40% of actions)
        const vw = profile.width;
        const vh = profile.height;
        await humanMouseMove(activePage, 
          Math.floor(Math.random() * vw * 0.8 + vw * 0.1),
          Math.floor(Math.random() * vh * 0.7 + vh * 0.1)
        );
      } else if (action < 0.7) {
        // Scroll (30% of actions)
        await humanScroll(activePage);
      } else {
        // Idle pause (30% of actions) — humans don't constantly move
        await randomDelay(1500, 4000);
      }
      await randomDelay(800, 2000);
    }

    // ========= PHASE 2: SMART CTR ENGINE (30%) =========
    if (!activePage.isClosed()) {
      const shouldClick = Math.random() < 0.30;

      if (shouldClick) {
        console.log(`[Bot ${profileId}] Phase 2: CTR Trigger — hunting for high-value element...`);

        const cta = await activePage.evaluate(() => {
          /**
           * Smart element finder: Prioritizes high-value ad elements in order:
           * 1. Download / Install buttons (highest CPM value)
           * 2. Spin buttons (game ad engagement)
           * 3. Linked images (banner ad clicks)
           * 4. Any visible link/button (fallback)
           */
          const keywords = {
            priority1: /download|install|get.?it|free.?download|play.?now|install.?now|get.?app/i,
            priority2: /spin|play|start|try.?now|launch/i,
          };

          function getClickCoords(el) {
            const r = el.getBoundingClientRect();
            if (r.width < 10 || r.height < 8 || r.top < 0 || r.top > window.innerHeight) return null;
            return {
              x: r.left + (r.width * 0.2) + (Math.random() * (r.width * 0.6)),
              y: r.top + (r.height * 0.2) + (Math.random() * (r.height * 0.6))
            };
          }

          // Priority 1: Download / Install buttons
          const allButtons = [...document.querySelectorAll('a[href], button, input[type="button"], input[type="submit"]')];
          for (const el of allButtons) {
            const text = (el.textContent || el.value || el.title || el.alt || '').trim();
            if (keywords.priority1.test(text)) {
              const coords = getClickCoords(el);
              if (coords) return { ...coords, type: 'Download/Install' };
            }
          }

          // Priority 2: Spin / Play buttons
          for (const el of allButtons) {
            const text = (el.textContent || el.value || el.title || el.alt || '').trim();
            if (keywords.priority2.test(text)) {
              const coords = getClickCoords(el);
              if (coords) return { ...coords, type: 'Spin/Play' };
            }
          }

          // Priority 3: Linked images (banner ad clicks — image wrapped in <a>)
          const linkedImages = document.querySelectorAll('a[href] img, a[href] > picture');
          for (const img of linkedImages) {
            const parent = img.closest('a[href]');
            if (parent) {
              const coords = getClickCoords(parent);
              if (coords) return { ...coords, type: 'Linked Image' };
            }
          }

          // Priority 4: Any visible link/button (fallback)
          for (const el of allButtons) {
            const coords = getClickCoords(el);
            if (coords) return { ...coords, type: 'Generic CTA' };
          }

          return null;
        }).catch(() => null);

        if (cta) {
          // Move to button with Bézier curve first (no teleport clicking)
          await humanMouseMove(activePage, cta.x, cta.y);
          await randomDelay(150, 500);
          await activePage.mouse.click(cta.x, cta.y).catch(() => {});
          console.log(`[Bot ${profileId}] ✅ Clicked [${cta.type}]. Dwelling post-click...`);
          await randomDelay(5000, 11000);
        } else {
          console.log(`[Bot ${profileId}] 👁️ CTR triggered but no clickable element found.`);
          await randomDelay(2000, 4000);
        }
      } else {
        console.log(`[Bot ${profileId}] 👁️ Impression Only (no click).`);
        await randomDelay(2000, 5000);
      }
    }

    // ========= PHASE 3: EXIT BEHAVIOR =========
    // Only 30% of users use the back button; the rest just close the tab
    if (!activePage.isClosed() && Math.random() < 0.3) {
      console.log(`[Bot ${profileId}] Phase 3: Back navigation...`);
      await activePage.goBack({ timeout: 4000 }).catch(() => {});
      await randomDelay(1000, 2000);
    }

  } catch (error) {
    console.log(`[Bot ${profileId}] Session Interrupted: ${error.message}`);
  } finally {
    console.log(`[Bot ${profileId}] ✅ Session Complete.`);
    await browser.close().catch(() => {});
  }
}

module.exports = { runImpression };
