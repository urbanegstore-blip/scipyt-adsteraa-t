// bot/impression-bot.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs').promises;

async function humanMouseMove(page, targetX, targetY) {
  const steps = Math.floor(Math.random() * 20) + 15;
  await page.mouse.move(targetX, targetY, { steps });
}

const randomDelay = (min, max) =>
  new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));

const STEALTH_SCRIPT = (shift) => {
  const newProto = Object.getPrototypeOf(navigator);
  delete newProto.webdriver;
  Object.defineProperty(navigator, 'webdriver', { get: () => false });

  const cores = shift.cores;
  const memory = shift.memory;
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => cores });
  Object.defineProperty(navigator, 'deviceMemory', { get: () => memory });
  Object.defineProperty(navigator, 'platform', { get: () => shift.platform });

  Object.defineProperty(navigator, 'plugins', {
    get: () => {
      const entries = [
        { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' }
      ];
      const p = entries;
      p.refresh = () => {};
      p.item = (i) => entries[i];
      p.namedItem = (n) => entries.find(e => e.name === n);
      return p;
    }
  });

  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

  window.chrome = { runtime: {}, loadTimes: function() {}, csi: function() {}, app: {} };

  const originalQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications'
      ? Promise.resolve({ state: Notification.permission })
      : originalQuery(parameters)
  );

  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function(x, y, width, height) {
    const imageData = originalGetImageData.call(this, x, y, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + shift.r));
      imageData.data[i+1] = Math.max(0, Math.min(255, imageData.data[i+1] + shift.g));
      imageData.data[i+2] = Math.max(0, Math.min(255, imageData.data[i+2] + shift.b));
    }
    return imageData;
  };

  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    const ctx = this.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, this.width, this.height);
      ctx.putImageData(imageData, 0, 0); 
    }
    return originalToDataURL.apply(this, args);
  };
};

/**
 * Executes a fast, highly scalable 10-15s impression session on Browserless.
 */
async function runImpression(targetUrl, profileId, browserlessToken) {
  console.log(`[Bot ${profileId}] Connecting to Browserless.io...`);

  // Using the Browserless residential proxy network
  const wsUrl = `wss://chrome.browserless.io?token=${browserlessToken}&stealth=true&timeout=60000&proxy=residential`;
  
  let browser;
  try {
    browser = await chromium.connectOverCDP(wsUrl);
  } catch (error) {
    console.error(`[Bot ${profileId}] Failed to connect to Browserless. Check token/limits.`, error.message);
    return;
  }

  const uas = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  ];
  const platforms = ['Win32', 'MacIntel', 'Win32'];
  const profileIndex = Math.floor(Math.random() * uas.length);

  const context = await browser.newContext({
    viewport: { 
      width: 1366 + Math.floor(Math.random() * 554), // Randomize between 1366 and 1920
      height: 768 + Math.floor(Math.random() * 312)  // Randomize between 768 and 1080
    },
    userAgent: uas[profileIndex],
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });

  const noiseShift = {
    r: Math.floor(Math.random() * 6) - 3,
    g: Math.floor(Math.random() * 6) - 3,
    b: Math.floor(Math.random() * 6) - 3,
    cores: [4, 8, 12, 16][Math.floor(Math.random() * 4)], // Randomize CPU cores
    memory: [4, 8, 16][Math.floor(Math.random() * 3)],    // Randomize RAM
    platform: platforms[profileIndex]
  };
  await context.addInitScript(STEALTH_SCRIPT, noiseShift);

  const page = await context.newPage();
  await page.bringToFront();

  console.log(`[Bot ${profileId}] Navigating directly to target: ${targetUrl}`);
  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    console.log(`[Bot ${profileId}] Page load took too long, proceeding anyway.`);
  }

  // Calculate random duration between 10 and 15 seconds
  const durationMs = Math.floor(Math.random() * 5000) + 10000; 
  const endTime = Date.now() + durationMs;
  console.log(`[Bot ${profileId}] Dwell time locked to ${durationMs / 1000}s. Simulating human...`);

  // Simple while loop: just scroll and move the mouse until the timer hits 0
  while (Date.now() < endTime) {
    // 1. Random human mouse movement across the screen
    await humanMouseMove(page, 150 + Math.random() * 800, 100 + Math.random() * 600);
    
    // 2. Random scrolling (mostly down, occasionally slightly up)
    if (Math.random() > 0.3) {
      const scrollAmount = (Math.random() * 400) - 100;
      await page.mouse.wheel(0, scrollAmount);
    }

    // 3. Pause briefly to mimic human reading and processing
    await randomDelay(800, 2000);
  }

  // 4. THE CLICK BEHAVIOR (Generates CTR)
  console.log(`[Bot ${profileId}] Executing final click behavior...`);
  try {
    // Look for anything clickable (ads are usually inside <a> or <button> tags)
    const elements = await page.$$('a, button');
    if (elements.length > 0) {
      // Pick a random link on the page
      const randomEl = elements[Math.floor(Math.random() * elements.length)];
      const box = await randomEl.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        // Move mouse smoothly to the element
        await humanMouseMove(page, box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await randomDelay(50, 150);
        await page.mouse.up();
        console.log(`[Bot ${profileId}] Clicked an element successfully!`);
        // Wait a second so the analytics pixel registers the click before we close
        await randomDelay(1000, 2000); 
      }
    }
  } catch (e) {
    console.log(`[Bot ${profileId}] Couldn't find a valid element to click.`);
  }

  console.log(`[Bot ${profileId}] ✅ Time reached (${durationMs / 1000}s). Killing session.`);
  await browser.close();
}

module.exports = { runImpression };
