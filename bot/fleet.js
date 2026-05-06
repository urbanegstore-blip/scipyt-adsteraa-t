// bot/fleet.js
const { runImpression } = require('./impression-bot');

const fs = require('fs');
const path = require('path');

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================

// 1. Set the Target URL you want the bots to visit here
const TARGET_URL = 'https://www.profitablecpmratenetwork.com/s6hmi1bh?key=eb552aa11e60ae5d54331085d1cd457a';

// 2. Load API Tokens from tokens.txt directly into RAM at startup (Lightning fast)
let tokens = [];
try {
  const fileContent = fs.readFileSync(path.join(__dirname, 'tokens.txt'), 'utf-8');
  tokens = fileContent.split('\n').map(t => t.trim()).filter(t => t.length > 0);
  console.log(`🔑 Loaded ${tokens.length} API tokens into memory.`);
} catch (e) {
  console.error("❌ Could not find tokens.txt! Please create it and add your keys.");
  process.exit(1);
}

// ==========================================

async function runContinuousFleet() {
  const BATCH_SIZE = 1;
  console.log(`🚀 Booting up Bot Fleet on Browserless. Concurrent scaling set to: ${BATCH_SIZE}`);
  console.log(`🎯 Target URL: ${TARGET_URL}`);
  console.log(`🔄 INFINITE LOOP MODE ENABLED. Press Ctrl+C to stop.\n`);

  let cycleCounter = 1;

  while (true) {
    console.log(`\n=========================================`);
    console.log(`🔥 STARTING FLEET CYCLE #${cycleCounter}`);
    console.log(`=========================================\n`);

    // Using dynamic IDs so you can track different cycles in the logs
    const profiles = [
      { id: `bot_cycle${cycleCounter}` }
    ];

    const promises = profiles.map(async (profile) => {
      // INSTANT FALLBACK LOGIC: If a token drops, instantly pivot to the next one without waiting
      for (let attempt = 0; attempt < tokens.length; attempt++) {
        // Calculate which token to use, naturally rotating each cycle and attempt
        const tokenIndex = (cycleCounter - 1 + attempt) % tokens.length;
        const currentToken = tokens[tokenIndex];

        console.log(`[Fleet] Using API Token index: ${tokenIndex}`);

        try {
          // If it throws an error (ETIMEDOUT, 400), it jumps straight to catch
          await runImpression(TARGET_URL, profile.id, currentToken);
          return; // Success! Break out of the retry loop completely.
        } catch (err) {
          console.error(`[Error] Token ${tokenIndex} failed (${err.message}). Instant pivoting to next token...`);
          // The loop immediately restarts with attempt++, using the next token in RAM
        }
      }
      console.log(`[Fleet] 🚨 All tokens failed for profile ${profile.id} on this cycle.`);
    });

    await Promise.all(promises);
    console.log(`\n🎯 Fleet Cycle #${cycleCounter} Complete.`);

    // Browserless Free Tier takes a few seconds to fully destroy the previous browser container.
    // If we connect too quickly, it thinks we are using 2 concurrent sessions and blocks us.
    console.log(`⏳ Cooldown: Waiting 10 seconds for Browserless to clear the previous session slot...\n`);
    await new Promise(r => setTimeout(r, 10000));

    cycleCounter++;
  }
}

// Start the endless loop
runContinuousFleet();
