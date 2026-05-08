// bot/fleet.js
const { runImpression } = require('./impression-bot');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const { getActiveTokens, logRequest, getFleetStatus } = require('./db.js');

const TARGET_URL = "https://www.profitablecpmratenetwork.com/apz376kk?key=d2049490bc0ab0f7271bbdab0c3082a9";
const BOTS_PER_TOKEN = 2;
const MAX_CONCURRENT_TOKENS = 125;

async function runContinuousFleet() {
  console.log(`🚀 Booting up High-Velocity Scaling Fleet...`);
  console.log(`🎯 Target URL: ${TARGET_URL}`);
  console.log(`📊 Mode: ${BOTS_PER_TOKEN} Bots per Token.`);

  let cycleCounter = 1;

  while (true) {
    const isRunning = await getFleetStatus();
    if (!isRunning) {
      console.log("⏸️ Fleet is PAUSED. Waiting 10s...");
      await new Promise(r => setTimeout(r, 10000));
      continue;
    }

    let tokens = await getActiveTokens().catch(() => []);
    if (tokens.length === 0) {
      console.log("😴 No active tokens found. Waiting 60s...");
      await new Promise(r => setTimeout(r, 60000));
      continue;
    }

    console.log(`\n🔥 STARTING VELOCITY CYCLE #${cycleCounter} [Tokens: ${tokens.length}]`);
    console.log(`=========================================\n`);

    for (let i = 0; i < tokens.length; i += MAX_CONCURRENT_TOKENS) {
      const tokenBatch = tokens.slice(i, i + MAX_CONCURRENT_TOKENS);
      console.log(`📡 Dispatching ${tokenBatch.length} tokens (${tokenBatch.length * BOTS_PER_TOKEN} bots)...`);

      const allBotTasks = [];

      for (let tIdx = 0; tIdx < tokenBatch.length; tIdx++) {
        const token = tokenBatch[tIdx];
        for (let b = 0; b < BOTS_PER_TOKEN; b++) {
          const profileId = `bot_c${cycleCounter}_t${i + tIdx}_b${b + 1}`;
          allBotTasks.push((async () => {
            await new Promise(r => setTimeout(r, Math.random() * 10000));
            try {
              await runImpression(TARGET_URL, profileId, token);
              await logRequest({ bot_id: profileId, target_url: TARGET_URL, token_used: token, status: 'success', error_message: null });
            } catch (err) {
              await logRequest({ bot_id: profileId, target_url: TARGET_URL, token_used: token, status: 'failed', error_message: err.message });
            }
          })());
        }
      }

      await Promise.all(allBotTasks);
      console.log(`✅ Batch finished. Cooldown 10s...`);
      await new Promise(r => setTimeout(r, 10000));
    }
    cycleCounter++;
  }
}

runContinuousFleet().catch(err => console.error("🛑 Critical Fleet Failure:", err));
