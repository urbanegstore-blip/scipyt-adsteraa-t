// bot/fleet.js
const { runImpression } = require('./impression-bot');

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================

// 1. Set the Target URL you want the bots to visit here
const TARGET_URL = 'https://www.profitablecpmratenetwork.com/wwd75ixn?key=8f131e1189b7085a72d0fa6e21071503';

// 2. Put your Browserless.io API token here
// (Required to connect to their remote browser instances)
const BROWSERLESS_TOKEN = "2UT5xzxJ8DvNJOO22fafc80c517266de4cbb41fc42616db1c";

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

    const promises = profiles.map(profile => {
      return runImpression(TARGET_URL, profile.id, BROWSERLESS_TOKEN).catch(err => {
        console.error(`[Error] Profile ${profile.id} crashed:`, err.message);
      });
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
