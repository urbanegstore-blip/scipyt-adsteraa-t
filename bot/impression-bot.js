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

    // 🎨 WebGL & WebGL2 Spoofing
    const spoofWebGL = (proto) => {
      const getParam = proto.getParameter;
      proto.getParameter = function(parameter) {
        if (parameter === 37445) return shift.gpuVendor || 'Google Inc. (Intel)'; 
        if (parameter === 37446) return shift.gpuRenderer || 'ANGLE (Intel, Intel(R) UHD Graphics Direct3D11)';
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
        charging: true, level: 1.0, chargingTime: 0, dischargingTime: Infinity
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

function generateProfile() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const windowsGPUs = [
    { gpuVendor: 'Google Inc. (NVIDIA)', gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (NVIDIA)', gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (NVIDIA)', gpuRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (Intel)', gpuRenderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (Intel)', gpuRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 770 Direct3D11 vs_5_0 ps_5_0)' },
    { gpuVendor: 'Google Inc. (AMD)', gpuRenderer: 'ANGLE (AMD, AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0)' }
  ];
  
  const macGPUs = [
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple M1' },
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple M1 Pro' },
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple M2' },
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple M2 Max' },
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple M3' },
    { gpuVendor: 'Google Inc. (Apple)', gpuRenderer: 'ANGLE (Apple, Apple M2, OpenGL 4.1)' }
  ];

  const iosGPUs = [
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple GPU' },
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple A15 GPU' },
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple A16 GPU' },
    { gpuVendor: 'Apple Inc.', gpuRenderer: 'Apple A17 Pro GPU' }
  ];

  const androidGPUs = [
    { gpuVendor: 'Qualcomm', gpuRenderer: 'Adreno (TM) 740' },
    { gpuVendor: 'Qualcomm', gpuRenderer: 'Adreno (TM) 730' },
    { gpuVendor: 'Qualcomm', gpuRenderer: 'Adreno (TM) 640' },
    { gpuVendor: 'ARM', gpuRenderer: 'Mali-G710' },
    { gpuVendor: 'ARM', gpuRenderer: 'Mali-G78' }
  ];

  const windowsRes = [{w:1920, h:1080}, {w:2560, h:1440}, {w:1366, h:768}, {w:1536, h:864}];
  const macRes = [{w:1440, h:900}, {w:2560, h:1600}, {w:1512, h:982}, {w:1728, h:1117}];
  const iosRes = [{w:390, h:844}, {w:428, h:926}, {w:375, h:812}, {w:414, h:896}];
  const androidRes = [{w:412, h:915}, {w:360, h:800}, {w:384, h:854}, {w:432, h:960}];

  const deviceTypes = [
    () => { // Windows Chrome
      const res = pick(windowsRes); const gpu = pick(windowsGPUs);
      return { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', platform: 'Win32', cores: pick([4, 8, 12, 16]), memory: pick([8, 16, 32]), width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer, isMobile: false };
    },
    () => { // Windows Edge
      const res = pick(windowsRes); const gpu = pick(windowsGPUs);
      return { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0', platform: 'Win32', cores: pick([4, 8, 12, 16]), memory: pick([8, 16, 32]), width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer, isMobile: false };
    },
    () => { // macOS Safari
      const res = pick(macRes); const gpu = pick(macGPUs);
      return { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15', platform: 'MacIntel', cores: pick([8, 10, 12]), memory: pick([8, 16, 24]), width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer, isMobile: false };
    },
    () => { // macOS Chrome
      const res = pick(macRes); const gpu = pick(macGPUs);
      return { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', platform: 'MacIntel', cores: pick([8, 10, 12]), memory: pick([8, 16, 24]), width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer, isMobile: false };
    },
    () => { // iOS Safari
      const res = pick(iosRes); const gpu = pick(iosGPUs);
      return { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1', platform: 'iPhone', cores: pick([6, 8]), memory: pick([4, 6, 8]), width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer, isMobile: true };
    },
    () => { // Android Chrome
      const res = pick(androidRes); const gpu = pick(androidGPUs);
      return { userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36', platform: 'Linux armv81', cores: pick([8]), memory: pick([6, 8, 12]), width: res.w, height: res.h, gpuVendor: gpu.gpuVendor, gpuRenderer: gpu.gpuRenderer, isMobile: true };
    }
  ];

  return pick(deviceTypes)();
}

/**
 * Executes a high-stealth impression session with Unit-Saver and Redirect Resilience.
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

  const context = await browser.newContext({
    userAgent: profile.userAgent,
    viewport: { width: profile.width, height: profile.height },
    isMobile: profile.isMobile,
    hasTouch: profile.isMobile
  });

  const noiseShift = { 
    r: Math.floor(Math.random() * 4) - 2, 
    g: Math.floor(Math.random() * 4) - 2, 
    b: Math.floor(Math.random() * 4) - 2, 
    cores: profile.cores, 
    memory: profile.memory, 
    platform: profile.platform,
    gpuVendor: profile.gpuVendor,
    gpuRenderer: profile.gpuRenderer
  };
  await context.addInitScript(STEALTH_SCRIPT, noiseShift);

  const page = await context.newPage();
  let activePage = page;
  let impressionRecorded = false;
  // 🕵️ ALLOW FULL LOAD & REDIRECTS (To maximize CPM)
  context.on('page', async newPage => {
    console.log(`[Bot ${profileId}] 🔀 Pop-up or Redirect opened!`);
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
    
    // Phase 1: Human Dwell (15s)
    const dwellEnd = Date.now() + 13500 + Math.random() * 2000;
    console.log(`[Bot ${profileId}] Phase 1: Human Dwell (15s)...`);
    while (Date.now() < dwellEnd && !activePage.isClosed()) {
      await humanMouseMove(activePage, Math.random() * 800, Math.random() * 600);
      await randomDelay(2000, 3000);
    }

    // Phase 2: Interaction (8s)
    if (!activePage.isClosed()) {
      console.log(`[Bot ${profileId}] Phase 2: Interaction...`);
      const cta = await activePage.evaluate(() => {
        const btn = document.querySelector('a[href], button');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width/2, y: r.top + r.height/2 };
      }).catch(() => null);

      if (cta) {
        await activePage.mouse.click(cta.x, cta.y).catch(() => {});
        console.log(`[Bot ${profileId}] ✅ Click Successful. Waiting 8s...`);
        await randomDelay(8000, 8500); 
      }
    }

    // Phase 3: History (Back x2)
    console.log(`[Bot ${profileId}] Phase 3: Simulating Return (Back x2)...`);
    try {
      if (!activePage.isClosed()) {
        await activePage.goBack({ timeout: 4000 }).catch(() => {});
        await randomDelay(1500, 2500);
        await activePage.goBack({ timeout: 4000 }).catch(() => {});
      }
    } catch (e) {}

  } catch (error) {
    console.log(`[Bot ${profileId}] Session Interrupted: ${error.message}`);
  } finally {
    console.log(`[Bot ${profileId}] ✅ Session Complete.`);
    await browser.close().catch(() => {});
  }
}

module.exports = { runImpression };
