const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { syncTokens } = require('./distributor');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const DOMAIN = 'trendingkart.shop';

/**
 * Generates a unique, randomized email alias for Cloudflare Catch-all.
 */
function generateEmail() {
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `bot_${randomStr}@${DOMAIN}`;
}

const randomDelay = (min, max) => new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));

/**
 * Freshness-Aware OTP Polling Engine
 */
async function waitForOTP(email, startTime) {
  const maxAttempts = 60; // 5 minutes
  console.log(`\n📡 --- OTP MONITOR STARTED ---`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    process.stdout.write(`🔎 [Attempt ${attempt}/${maxAttempts}] Checking for code... `);
    
    const { data } = await supabase
      .from('otp_bridge')
      .select('code, created_at')
      .eq('email', email)
      .gte('created_at', startTime.toISOString())
      .maybeSingle();

    if (data && data.code) {
      console.log(`\n🎯 CODE RECEIVED! [ ${data.code} ]`);
      return data.code.trim();
    } else {
      process.stdout.write(`(Waiting...)\n`);
    }

    await new Promise(r => setTimeout(r, 5000));
  }

  throw new Error(`Timeout: OTP for ${email} never arrived.`);
}

const { execSync } = require('child_process');

/**
 * Rotates IP using Cloudflare WARP
 */
async function rotateIP() {
  console.log(`☢️  EXECUTING NUCLEAR IP RESET...`);
  try {
    // 1. Force stop the WARP service (Needs Admin)
    console.log("🛑 Stopping WARP Service...");
    try { execSync('net stop "Cloudflare WARP"', { stdio: 'ignore' }); } catch(e) {}
    await new Promise(r => setTimeout(r, 4000));
    
    // 2. Clear registration while service is down
    try { execSync('warp-cli registration delete', { stdio: 'ignore' }); } catch(e) {}
    
    // 3. Restart the service
    console.log("🚀 Restarting WARP Service...");
    execSync('net start "Cloudflare WARP"', { stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 8000)); // Give it time to boot
    
    // 4. Create brand new identity
    execSync('warp-cli registration new', { stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 3000));
    
    execSync('warp-cli connect', { stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 8000)); 
    
    console.log(`✅ NUCLEAR RESET SUCCESSFUL. Fresh IP ready.`);
  } catch (e) {
    console.log(`⚠️ Nuclear Reset failed: ${e.message}`);
    console.log(`🔄 Attempting standard connect fallback...`);
    try { execSync('warp-cli connect', { stdio: 'ignore' }); } catch(err) {}
  }
}

async function startFarming() {
  console.log(`\n🤖 --- AUTONOMOUS FARMER STARTED ---`);
  
  while (true) {
    await rotateIP(); // 🔄 Fresh IP for every attempt
    
    const email = generateEmail();
    const startTime = new Date(); 
    console.log(`\n💎 --- ATTEMPTING SIGNUP (${email}) ---`);

    const browser = await chromium.launch({ headless: false });
    
    try {
      // 🕶️ STEALTH: Use a real Human User-Agent
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
      });
      const page = await context.newPage();

      console.log(`🌐 Navigating to Browserless Signup...`);
      await page.goto('https://www.browserless.io/signup/email', { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // 🖱️ Human Scroll
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(2000);
      await page.mouse.wheel(0, -500);

      // 📧 Enter Email
      const emailInput = page.locator('input[type="email"]');
      await emailInput.waitFor({ state: 'visible', timeout: 15000 });
      await emailInput.fill(email);

      // 🖱️ Click Continue
      const continueBtn = page.getByRole('button', { name: 'Continue with email' });
      await continueBtn.click();
      console.log(`✅ "Continue with email" clicked.`);

      // 🔢 OTP Entry
      console.log(`📝 Waiting for OTP input field...`);
      const otpInput = page.getByPlaceholder('000 000');
      await otpInput.waitFor({ state: 'visible', timeout: 30000 });
      
      const otp = await waitForOTP(email, startTime);
      console.log(`⌨️ Typing OTP: ${otp}`);
      await otpInput.fill(otp);
      
      await page.getByRole('button', { name: 'Submit code' }).click();
      console.log(`✅ "Submit code" clicked.`);

      // 📝 Onboarding
      console.log(`📝 Handling Onboarding...`);
      try {
          const nameInput = page.getByPlaceholder('Jamie Rivera');
          await nameInput.waitFor({ state: 'visible', timeout: 30000 }); // ⏳ Increased to 30s
          await nameInput.fill('Fleet Manager');
          await page.click('input[type="checkbox"]');
          await page.getByTestId('complete-signup-button').click();
          console.log(`🚀 Account Created!`);
      } catch (e) {
          console.log("⚠️ Onboarding skipped or failed.");
      }

      // 🔓 Capture API Key
      console.log(`🔓 Loading home and revealing API key...`);
      await page.waitForURL('**/home', { timeout: 120000 }); // ⏳ Increased to 120s (2 mins)
      
      // 1. Click the "Show API Key" button (the eye icon)
      try {
          const showBtn = page.locator('button[title="Show API Key"]');
          await showBtn.waitFor({ state: 'visible', timeout: 60000 }); // ⏳ Increased to 60s
          await showBtn.click();
          console.log(`👁️ Clicked "Show API Key".`);
          await page.waitForTimeout(2000); // Wait for the reveal animation
      } catch (e) {
          console.log("⚠️ Could not find 'Show' button, checking if already visible...");
      }

      // 2. Extract the unmasked value from the input
      const apiKey = await page.evaluate(() => {
          const input = document.querySelector('input[type="text"].font-mono') || 
                        document.querySelector('input.font-mono') ||
                        document.querySelector('input[readonly]');
          return input ? input.value : null;
      });

      if (apiKey && !apiKey.includes('**')) {
        // 1. Save to the Scraped Vault (Staging)
        await supabase.from('scrpedkeys').insert({
          email: email,
          key: apiKey,
          pushed: false,
          created_at: new Date().toISOString()
        });

        console.log(`✅ SUCCESS! Token ${apiKey} saved to vault.`);

        // 2. ⚡ TRIGGER INSTANT DISTRIBUTOR
        await syncTokens();
      } else {
        console.log(`🛑 Failed to capture clean API key. Got: ${apiKey}`);
      }
    } catch (err) {
      console.error(`🛑 Cycle Failed: ${err.message}`);
      await page.screenshot({ path: 'cycle_error.png' }).catch(() => {});
    } finally {
      console.log(`🏁 Session finished. Cooldown before next account...`);
      await browser.close();
      await new Promise(r => setTimeout(r, 2000)); // ⏳ 2s cooldown between accounts
    }
  }
}

startFarming();
