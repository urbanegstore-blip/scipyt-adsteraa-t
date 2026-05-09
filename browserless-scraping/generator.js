const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { syncTokens } = require('./distributor');
require('dotenv').config();

// Polyfill for Node 20 WebSockets on GitHub Actions
global.WebSocket = require('ws');

// Use Environment Variables (will be passed from GitHub Secrets)
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

let DOMAINS = ['a.trendingkart.shop']; // Default fallback

async function loadGlobalConfig() {
  const { data } = await supabase.from('global_config').select('value').eq('id', 'email_domains').single();
  if (data && data.value) {
    DOMAINS = data.value.split(',').map(d => d.trim());
    console.log(`🌐 Loaded dynamic domains: ${DOMAINS.join(', ')}`);
  }
}

/**
 * Generates a more stealthy, human-like email address
 * @returns {string} The generated email
 */
function generateEmail() {
  const firstNames = ['alex', 'jordan', 'taylor', 'casey', 'morgan', 'sam', 'riley', 'jamie', 'chris', 'pat', 'michael', 'sarah', 'jessica', 'david', 'john', 'emily', 'josh', 'matt', 'ryan', 'laura'];
  const lastNames = ['smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'martinez', 'rodriguez', 'lee', 'white', 'clark', 'lewis', 'walker', 'hall', 'allen'];
  
  const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomYear = Math.floor(Math.random() * 40) + 1975; // e.g., 1975 to 2014
  const randomNum = Math.floor(Math.random() * 999);
  
  const formats = [
    `${fName}.${lName}${randomYear}`,
    `${fName}${lName}${randomNum}`,
    `${fName[0]}${lName}${randomYear}`,
    `${lName}.${fName}${Math.floor(Math.random() * 99)}`,
    `${fName}_${lName}${randomNum}`
  ];
  
  const selectedFormat = formats[Math.floor(Math.random() * formats.length)];
  const selectedDomain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  
  return `${selectedFormat}@${selectedDomain}`;
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
    await page.goto('https://www.browserless.io/signup/email?plan=free', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await emailInput.pressSequentially(email, { delay: 35 + Math.random() * 40 });
    await page.getByRole('button', { name: 'Continue with email' }).click();

    const otpInput = page.getByPlaceholder('000 000');
    try {
        await otpInput.waitFor({ state: 'visible', timeout: 20000 });
    } catch (e) {
        console.log("⚠️ [DEBUG] OTP box didn't appear. Capturing page text to see what went wrong...");
        const pageText = await page.evaluate(() => document.body.innerText);
        console.log("📄 PAGE TEXT DUMP:\n", pageText.substring(0, 1000));
        throw new Error("OTP input never appeared. See page text dump above.");
    }
    
    const otp = await waitForOTP(email, startTime);
    await otpInput.pressSequentially(otp, { delay: 100 + Math.random() * 50 });
    await page.getByRole('button', { name: 'Submit code' }).click();

    console.log(`📝 Handling Onboarding...`);
    try {
        const nameInput = page.getByPlaceholder('Jamie Rivera');
        await nameInput.waitFor({ state: 'visible', timeout: 15000 });
        const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Sam', 'Riley', 'Jamie'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
        const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        await nameInput.pressSequentially(randomName, { delay: 40 + Math.random() * 60 });
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

// Run EXACTLY 2 accounts per job (For Matrix Carpet Bombing)
async function startBatch() {
    await loadGlobalConfig();
    console.log("🚀 STARTING CLOUD DOUBLE-STRIKE");
    console.log("🔥 Running Account 1/2...");
    await runSingleFarmingCycle();
    console.log("🔥 Running Account 2/2...");
    await runSingleFarmingCycle();
    console.log(`🏁 Strike complete.`);
    process.exit(0);
}

startBatch();
