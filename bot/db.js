const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches all 'active' tokens from Supabase
 */
async function getActiveTokens() {
  const { data, error } = await supabase
    .from('browserless_tokens')
    .select('token')
    .eq('status', 'active');
  
  if (error) throw error;
  return data.map(d => d.token);
}

/**
 * Updates token status and usage count
 */
async function updateTokenStatus(token, status, incrementUsage = false) {
  const updateData = { status, last_used_at: new Date() };
  
  if (incrementUsage) {
    const { data: current } = await supabase
      .from('browserless_tokens')
      .select('usage_count')
      .eq('token', token)
      .single();
    updateData.usage_count = (current?.usage_count || 0) + 1;
  }

  await supabase
    .from('browserless_tokens')
    .update(updateData)
    .eq('token', token);
}

/**
 * Logs a fleet request
 */
async function logRequest(dataOrBotId, classificationOrUrl = 'Success', status = 'success') {
  let logData;

  if (typeof dataOrBotId === 'string') {
    // 🛡️ SYSTEM LOG (Positional)
    logData = {
      bot_id: dataOrBotId,
      classification: classificationOrUrl,
      status: status,
      target_url: 'N/A',
      token_used: 'SYSTEM',
      error_message: null
    };
  } else {
    // 🤖 BOT LOG (Object)
    const { bot_id, target_url, token_used, status, error_message } = dataOrBotId;
    let classification = 'Success';
    if (status === 'failed') {
      if (error_message.includes('usage limit') || error_message.includes('401')) {
        classification = 'Usage Limit Exceeded';
      } else if (error_message.includes('timeout')) {
        classification = 'Network Timeout';
      } else {
        classification = 'Other Error';
      }
    }
    logData = { bot_id, target_url, token_used, status, error_message, classification };
  }

  await supabase.from('fleet_logs').insert([logData]);

  // If usage limit is reached, auto-disable the key
  if (logData.classification === 'Usage Limit Exceeded' && logData.token_used !== 'SYSTEM') {
    console.log(`🚨 Token ${logData.token_used.slice(0, 8)}... marked as EXHAUSTED.`);
    await updateTokenStatus(logData.token_used, 'exhausted');
  }
}

/**
 * Monthly reset: Mark all exhausted keys as active
 */
async function resetMonthlyKeys() {
  await supabase
    .from('browserless_tokens')
    .update({ status: 'active' })
    .eq('status', 'exhausted');
  console.log('📅 Monthly reset complete: All exhausted keys are now ACTIVE.');
}

/**
 * Gets the Master Switch status
 */
async function getFleetStatus() {
  const { data } = await supabase
    .from('fleet_settings')
    .select('is_running')
    .eq('id', 'master_switch')
    .single();
  return data ? data.is_running : false; // DEFAULT OFF FOR SAFETY
}

/**
 * Toggles the Master Switch status
 */
async function toggleFleetStatus(isRunning) {
  await supabase
    .from('fleet_settings')
    .update({ is_running: isRunning })
    .eq('id', 'master_switch');
}

module.exports = {
  getActiveTokens,
  updateTokenStatus,
  logRequest,
  resetMonthlyKeys,
  getFleetStatus,
  toggleFleetStatus
};
