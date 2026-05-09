// bot/fleet.js
const { runImpression } = require('./impression-bot');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const { getActiveTokens, logRequest, getFleetStatus, getGlobalConfig } = require('./db.js');

let TARGET_URL = "https://www.profitablecpmratenetwork.com/x5etp09xb?key=3f9471fb701e7d5fbd10acf493a966ce";
const BOTS_PER_TOKEN = 6;    // 6 concurrent sessions per token — maximizes throughput
const MAX_CONCURRENT_BOTS = 5000; // GitHub Actions has no local CPU ceiling

// Sharding Configuration
// Passed via .env or hosting provider (e.g. Render/Heroku)
const INSTANCE_ID = parseInt(process.env.INSTANCE_ID || '0', 10);
const TOTAL_INSTANCES = parseInt(process.env.TOTAL_INSTANCES || '1', 10);

async function runContinuousFleet() {
  console.log(`🚀 Booting up High-Velocity Scaling Fleet...`);
  console.log(`🌍 Server Instance: [${INSTANCE_ID + 1}/${TOTAL_INSTANCES}]`);

  let cycleCounter = 1;

  while (true) {
    // 🛡️ DYNAMIC CONFIG: Fetch the latest target URL from the database
    const config = await getGlobalConfig();
    if (config && config.target_url) {
      TARGET_URL = config.target_url;
    }
    const isRunning = await getFleetStatus();
    if (!isRunning) {
      console.log("⏸️ Fleet is PAUSED. Waiting 10s...");
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }

    // Always fetch the freshest list of ALL active tokens from the database
    let allTokens = await getActiveTokens().catch(() => []);
    if (allTokens.length === 0) {
      console.log("😴 No active tokens found. Waiting 60s...");
      await new Promise(r => setTimeout(r, 60000));
      continue;
    }

    // Sharding: Divide total keys cleanly by the number of instances
    const chunkSize = Math.ceil(allTokens.length / TOTAL_INSTANCES);
    const startIndex = INSTANCE_ID * chunkSize;
    const myTokens = allTokens.slice(startIndex, startIndex + chunkSize);

    console.log(`\n🔥 STARTING VELOCITY CYCLE #${cycleCounter} [Instance takes ${myTokens.length}/${allTokens.length} active tokens]`);
    console.log(`=========================================\n`);

    const activeWorkers = new Set();

    // We will launch BOTS_PER_TOKEN bots for every token we own
    for (let tIdx = 0; tIdx < myTokens.length; tIdx++) {
      const token = myTokens[tIdx];

      for (let b = 0; b < BOTS_PER_TOKEN; b++) {

        // Wait if we hit the maximum concurrency limit for this server
        if (activeWorkers.size >= MAX_CONCURRENT_BOTS) {
          await Promise.race(activeWorkers);
        }

        const profileId = `bot_c${cycleCounter}_i${INSTANCE_ID}_t${tIdx}_b${b + 1}`;

        // Small stagger per-bot to avoid Browserless rejecting simultaneous bursts on 1 token
        await new Promise(r => setTimeout(r, 100));

        const workerPromise = (async () => {
          try {
            await runImpression(TARGET_URL, profileId, token);
            // Fire-and-forget log (no await to avoid blocking the bot exit)
            logRequest({ bot_id: profileId, target_url: TARGET_URL, token_used: token, status: 'success', error_message: null }).catch(() => { });
          } catch (err) {
            logRequest({ bot_id: profileId, target_url: TARGET_URL, token_used: token, status: 'failed', error_message: err.message }).catch(() => { });
          }
        })();

        activeWorkers.add(workerPromise);

        // Crucial step: remove the bot from the Set when it finishes to free a slot
        workerPromise.finally(() => {
          activeWorkers.delete(workerPromise);
        });
      }
    }

    // Wait for the remaining straggler bots in this cycle to finish
    await Promise.all(activeWorkers);
    console.log(`✅ Cycle #${cycleCounter} finished. Cooldown 10s...`);
    await new Promise(r => setTimeout(r, 10000));

    cycleCounter++;
  }
}

runContinuousFleet().catch(err => console.error("🛑 Critical Fleet Failure:", err));
