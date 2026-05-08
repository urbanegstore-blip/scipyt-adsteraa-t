const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { syncTokens } = require('./distributor');
require('dotenv').config();

// Use Environment Variables (will be passed from GitHub Secrets)
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

const DOMAIN = 'trendingkart.shop';

function generateEmail() {
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `bot_${randomStr}@${DOMAIN}`;
}

async function waitForOTP(email, startTime) {
  const maxAttempts = 30; 
  console.log(`📡 --- OTP MONITOR STARTED ---`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    process.stdout.write(`🔎 [${attempt}/${maxAttempts}] Checking code... `);
    
    const { data } = await supabase
      .from('otp_bridge')
      .select('code, created_at')
      .eq('email', email)
      .gte('created_at', startTime.toISOString())
      .maybeSingle();

    if (data && data.code) {
      console.log(`\n🎯 CODE RECEIVED! [ ${data.code} ]`);
      return data.code.trim();
    }
    process.stdout.write(`(Waiting...)\n`);
    await new Promise(r => setTimeout(r, 5000));
  }
  throw new Error(`Timeout: OTP for ${email} never arrived.`);
}

async function runSingleFarmingCycle() {
  const email = generateEmail();
  const startTime = new Date(); 
  
  console.log(`\n💎 --- STARTING CLOUD SIGNUP (${email}) ---`);

  // Optimized for GitHub Actions: Headless & No Proxy
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();

    // 🚀 HYPER-SPEED: Block CSS, Images, and Fonts
    await page.route('**/*', (route) => {
        const type = route.request().resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
            route.abort();
        } else {
            route.continue();
        }
    });
    
    console.log(`🌐 Navigating to Browserless...`);
    await page.goto('https://www.browserless.io/signup/email', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.fill(email);
    await page.getByRole('button', { name: 'Continue with email' }).click();

    const otpInput = page.getByPlaceholder('000 000');
    await otpInput.waitFor({ state: 'visible', timeout: 20000 });
    
    const otp = await waitForOTP(email, startTime);
    await otpInput.fill(otp);
    await page.getByRole('button', { name: 'Submit code' }).click();

    console.log(`📝 Handling Onboarding...`);
    try {
        const nameInput = page.getByPlaceholder('Jamie Rivera');
        await nameInput.waitFor({ state: 'visible', timeout: 15000 });
        await nameInput.fill('Cloud Farmer');
        await page.click('input[type="checkbox"]');
        await page.getByTestId('complete-signup-button').click();
    } catch (e) { console.log("⚠️ Onboarding skipped."); }

    console.log(`🔓 Capturing API key...`);
    await page.waitForURL('**/home', { timeout: 60000 });
    const showBtn = page.locator('button[title="Show API Key"]');
    await showBtn.waitFor({ state: 'visible', timeout: 30000 });
    await showBtn.click();
    await page.waitForTimeout(1000);

    const apiKey = await page.evaluate(() => {
        const input = document.querySelector('input[type="text"].font-mono') || 
                      document.querySelector('input.font-mono') ||
                      document.querySelector('input[readonly]');
        return input ? input.value : null;
    });

    if (apiKey && !apiKey.includes('**')) {
      await supabase.from('scrpedkeys').insert({
        email: email,
        key: apiKey,
        pushed: false,
        created_at: new Date().toISOString()
      });
      console.log(`✅ SUCCESS! Token captured.`);
      await syncTokens();
    }

  } catch (err) {
    console.error(`🛑 Cycle Failed: ${err.message}`);
  } finally {
    await browser.close();
  }
}

// Run 5 accounts per job
async function startBatch() {
    console.log("🚀 STARTING CLOUD BATCH (5 Accounts)");
    for(let i=0; i<5; i++) {
        await runSingleFarmingCycle();
        console.log(`🏁 Account ${i+1}/5 complete.`);
        await new Promise(r => setTimeout(r, 2000));
    }
    console.log("🎉 Batch finished.");
    process.exit(0);
}

startBatch();
