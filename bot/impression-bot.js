// bot/impression-bot.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs').promises;

/**
 * Moves the mouse in a human-like way with randomized steps.
 */
async function humanMouseMove(page, targetX, targetY) {
  if (page.isClosed()) return;
  const steps = Math.floor(Math.random() * 20) + 15;
  await page.mouse.move(targetX, targetY, { steps }).catch(() => {});
}

const randomDelay = (min, max) =>
  new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));

const STEALTH_SCRIPT = (shift) => {
  try {
    const newProto = Object.getPrototypeOf(navigator);
    delete newProto.webdriver;
    Object.defineProperty(navigator, 'webdriver', { get: () => false });

    // 🏎️ Hardware Profiling
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => shift.cores });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => shift.memory });
    Object.defineProperty(navigator, 'platform', { get: () => shift.platform });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

    // 🔇 WebRTC Leak Prevention
    const originalPeerConnection = window.RTCPeerConnection;
    window.RTCPeerConnection = function(...args) {
      const pc = new originalPeerConnection(...args);
      pc.createOffer = () => Promise.reject(new Error('WebRTC Disabled for Privacy'));
      return pc;
    };

    // 🎨 WebGL & WebGL2 Spoofing (Critical for Cluster Prevention)
    const spoofWebGL = (proto) => {
      const getParam = proto.getParameter;
      proto.getParameter = function(parameter) {
        if (parameter === 37445) return 'Google Inc. (Intel)'; // UNMASKED_VENDOR
        if (parameter === 37446) return 'ANGLE (Intel, Intel(R) UHD Graphics Direct3D11)'; // UNMASKED_RENDERER
        return getParam.apply(this, arguments);
      };
    };
    if (window.WebGLRenderingContext) spoofWebGL(WebGLRenderingContext.prototype);
    if (window.WebGL2RenderingContext) spoofWebGL(WebGL2RenderingContext.prototype);

    // 🎵 Audio Fingerprint Noise
    const originalGetChannelData = AudioBuffer.prototype.getChannelData;
    AudioBuffer.prototype.getChannelData = function() {
      const data = originalGetChannelData.apply(this, arguments);
      for (let i = 0; i < data.length; i += 100) {
        data[i] = data[i] + (Math.random() * 0.0000001);
      }
      return data;
    };

    // 🔋 Battery Status Spoofing
    if (navigator.getBattery) {
      navigator.getBattery = () => Promise.resolve({
        charging: true,
        level: 1.0,
        chargingTime: 0,
        dischargingTime: Infinity,
        onchargingchange: null,
        onlevelchange: null
      });
    }

    // 🛡️ Canvas Noise
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (x, y, width, height) {
      const imageData = originalGetImageData.call(this, x, y, width, height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] += shift.r;
        imageData.data[i + 1] += shift.g;
        imageData.data[i + 2] += shift.b;
      }
      return imageData;
    };

    window.chrome = { runtime: {}, loadTimes: () => {}, csi: () => {}, app: {} };
  } catch (e) {}
};

/**
 * Executes a high-stealth impression session with Redirect Resilience.
 */
async function runImpression(targetUrl, profileId, browserlessToken) {
  let browser;
  const flags = [
    '--disable-web-security',
    '--disable-features=SafeBrowsing,SafeBrowsingService,IsolateOrigins,site-per-process,AdFilter,HeavyAdPrivacyMitigations',
    '--disable-site-isolation-trials',
    '--disable-blink-features=AutomationControlled,BlockAds',
    '--ignore-certificate-errors',
    '--disable-gpu'
  ].join('&');

  const wsUrl = `wss://chrome.browserless.io?token=${browserlessToken}&stealth=true&blockAds=false&timeout=60000&proxy=residential&proxyCountry=us&${flags}`;
  
  // 🔄 CONNECTION RETRY ENGINE (2 Attempts)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      browser = await chromium.connectOverCDP(wsUrl);
      break; // Success!
    } catch (error) {
      if (attempt === 2) {
        console.error(`[Bot ${profileId}] Connection Final Failure:`, error.message);
        throw error;
      }
      console.log(`[Bot ${profileId}] ⚠️ Connection Glitch (Attempt ${attempt}/2). Retrying in 5s...`);
      await randomDelay(5000, 7000);
    }
  }

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280 + Math.floor(Math.random() * 200), height: 720 + Math.floor(Math.random() * 200) }
  });

  const noiseShift = { r: Math.floor(Math.random() * 4) - 2, g: Math.floor(Math.random() * 4) - 2, b: Math.floor(Math.random() * 4) - 2, cores: 8, memory: 16, platform: 'Win32' };
  await context.addInitScript(STEALTH_SCRIPT, noiseShift);

  const page = await context.newPage();
  let activePage = page;
  let impressionRecorded = false;

  context.on('page', async newPage => {
    console.log(`[Bot ${profileId}] 🔀 Redirect detected! Switching focus...`);
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
    console.log(`[Bot ${profileId}] 🚀 Navigating to Target...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Phase 1: Dwell
    const dwellEnd = Date.now() + 12000 + Math.random() * 3000;
    console.log(`[Bot ${profileId}] Phase 1: Human Dwell...`);
    while (Date.now() < dwellEnd && !activePage.isClosed()) {
      await humanMouseMove(activePage, Math.random() * 800, Math.random() * 600);
      await randomDelay(2000, 4000);
    }

    // Phase 2: Click
    if (!activePage.isClosed()) {
      console.log(`[Bot ${profileId}] Phase 2: Scanning for Click Target...`);
      const cta = await activePage.evaluate(() => {
        const btn = document.querySelector('a[href], button');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width/2, y: r.top + r.height/2 };
      }).catch(() => null);

      if (cta) {
        await activePage.mouse.click(cta.x, cta.y).catch(() => {});
        console.log(`[Bot ${profileId}] ✅ Interaction successful.`);
        await randomDelay(5000, 7000);
      }
    }

  } catch (error) {
    console.log(`[Bot ${profileId}] Interaction Interrupted: ${error.message}`);
  } finally {
    console.log(`[Bot ${profileId}] ✅ Closing Session.`);
    await browser.close().catch(() => {});
  }
}

module.exports = { runImpression };
