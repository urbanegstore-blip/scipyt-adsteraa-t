const express = require('express');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'logs', 'fleet.log');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const { getFleetStatus, logRequest } = require('./db.js');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.static('public'));

let fleetProcess = null;
let logClients = [];

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, 'logs'))) fs.mkdirSync(path.join(__dirname, 'logs'));

// 🛡️ .ENV BASED AUTH
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization || req.query.auth;
  const securePass = process.env.DASHBOARD_PASSWORD || 'admin123';
  
  if (auth === securePass) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid Admin Key' });
  }
};

function broadcastLog(msg) {
  const timestamp = new Date().toISOString();
  const formattedMsg = `[${timestamp}] ${msg}`;
  fs.appendFileSync(LOG_FILE, formattedMsg + '\n');
  logClients.forEach(res => res.write(`data: ${JSON.stringify({ msg: formattedMsg })}\n\n`));
}

function startFleetProcess() {
  if (fleetProcess) return;
  fleetProcess = spawn('node', ['fleet.js']);
  fleetProcess.stdout.on('data', (d) => d.toString().split('\n').forEach(l => l.trim() && broadcastLog(l.trim())));
  fleetProcess.stderr.on('data', (d) => broadcastLog(`⚠️ ERROR: ${d.toString()}`));
  fleetProcess.on('close', () => { broadcastLog("🛑 Fleet Process Terminated."); fleetProcess = null; });
}

function stopFleetProcess() {
  if (fleetProcess) {
    if (process.platform === 'win32') exec(`taskkill /pid ${fleetProcess.pid} /f /t`);
    else fleetProcess.kill('SIGKILL');
    fleetProcess = null;
  }
}

// 📡 LIVE TERMINAL STREAM (Auth via Query)
app.get('/api/logs/stream', authMiddleware, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  logClients.push(res);
  req.on('close', () => { logClients = logClients.filter(c => c !== res); });
});

// 📊 OPTIMIZED STATS
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    // ⚡ SELECTIVE FETCH (Handling NULLS FIRST for new tokens)
    const { data: tokens, error: tErr } = await supabase
      .from('browserless_tokens')
      .select('token, status, usage_count, last_used_at')
      .order('last_used_at', { ascending: false, nullsFirst: true });
    
    if (tErr) {
      console.error("❌ Stats Fetch Error (Tokens):", tErr.message);
      return res.status(500).json({ error: "Tokens Error: " + tErr.message });
    }

    if (!tokens || tokens.length === 0) {
      console.log("⚠️ Database returned 0 tokens. Check if you are in the right Supabase project.");
    }

    const { data: logs } = await supabase
      .from('fleet_logs')
      .select('created_at, status, bot_id, classification')
      .order('created_at', { ascending: false })
      .limit(20);

    const isRunning = await getFleetStatus();
    res.json({ 
      tokens: tokens || [], 
      logs: logs || [], 
      totalRequests: logs?.length || 0, 
      fleetStatus: isRunning ? 'running' : 'stopped' 
    });
  } catch (e) { 
    console.error("❌ API Critical Failure:", e.message);
    res.status(500).json({ error: e.message }); 
  }
});

// 🏺 LOG HISTORY
app.get('/api/logs/history', authMiddleware, (req, res) => {
  try {
    if (!fs.existsSync(LOG_FILE)) return res.json({ logs: [] });
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    res.json({ logs: content.split('\n').filter(l => l.trim()).slice(-500) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 🔄 BULK ADD
app.post('/api/tokens/bulk', authMiddleware, async (req, res) => {
  try {
    const { tokens } = req.body;
    await supabase.from('browserless_tokens').upsert(tokens.map(t => ({ token: t.trim(), status: 'active' })), { onConflict: 'token' });
    broadcastLog(`🔄 Registry Updated: ${tokens.length} keys.`);
    stopFleetProcess();
    await supabase.from('fleet_settings').update({ is_running: true, updated_at: new Date() }).eq('id', 'master_switch');
    setTimeout(startFleetProcess, 1000);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 🔘 TOGGLE
// 🔄 SELF-HEALING CRON: Runs every 24 hours
// Automatically resurrects tokens that have been exhausted for 7+ days
setInterval(async () => {
  try {
    console.log("🕯️ Running Self-Healing Cron (7-day cycle)...");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('browserless_tokens')
      .update({ status: 'active' })
      .eq('status', 'exhausted')
      .lt('updated_at', sevenDaysAgo.toISOString());
    
    console.log("🕯️ Cron: Checked for healed tokens.");
  } catch (e) {
    console.error("❌ Cron Failure:", e.message);
  }
}, 24 * 60 * 60 * 1000); // Once a day

// 🔘 TOGGLE & CRUD
app.post('/api/token/status', authMiddleware, async (req, res) => {
  try {
    const { token, status } = req.body;
    await supabase.from('browserless_tokens').update({ status }).eq('token', token);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/token/delete', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    await supabase.from('browserless_tokens').delete().eq('token', token);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/token/edit', authMiddleware, async (req, res) => {
  try {
    const { oldToken, newToken } = req.body;
    await supabase.from('browserless_tokens').update({ token: newToken }).eq('token', oldToken);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/fleet/toggle', authMiddleware, async (req, res) => {
  try {
    const current = await getFleetStatus();
    await supabase.from('fleet_settings').update({ is_running: !current, updated_at: new Date() }).eq('id', 'master_switch');
    if (!current) startFleetProcess(); else stopFleetProcess();
    res.json({ success: true, status: !current ? 'running' : 'stopped' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 🔄 SYNC LOOP (Ensures fleet process matches DB status)
// DISABLED: Since the fleet is now horizontally scaled via GitHub Actions or dedicated worker instances, 
// the Dashboard Server is now purely a Control Plane (UI + API).
// It no longer spawns a local, un-sharded fleet.js process.
/*
setInterval(async () => {
  try {
    const { data } = await supabase.from('fleet_settings').select('is_running').eq('id', 'master_switch').single();
    if (data.is_running && !fleetProcess) startFleetProcess();
    else if (!data.is_running && fleetProcess) stopFleetProcess();
  } catch (e) {}
}, 5000);
*/

app.listen(PORT, async () => {
  console.log(`🚀 Optimized Orchestrator active on port ${PORT}`);
  
  // 🛡️ INITIALIZE MASTER SWITCH
  try {
    await supabase.from('fleet_settings').upsert({ id: 'master_switch', is_running: false }, { onConflict: 'id' });
    console.log("📡 System Initialized: Fleet set to OFF.");
  } catch (e) {
    console.error("⚠️ Initialization Warning:", e.message);
  }
});
