const { spawn } = require('child_process');
const path = require('path');

/**
 * 🚀 UNIVERSAL FLEET LAUNCHER
 * This script runs both the Dashboard and the Fleet in a single process tree.
 * Optimized for deployment (Render, Heroku, VPS).
 */

function startProcess(name, script) {
  console.log(`[System] Launching ${name}...`);
  
  const child = spawn('node', [script], {
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: 'true' }
  });

  child.on('close', (code) => {
    console.error(`[System] ⚠️ ${name} exited with code ${code}. Restarting in 5s...`);
    setTimeout(() => startProcess(name, script), 5000);
  });

  return child;
}

// 1. Launch Dashboard (The Orchestrator)
// The dashboard will automatically manage and restart the Fleet process.
startProcess('Command Center', 'dashboard-server.js');

console.log('✅ ORCHESTRATOR ONLINE. Fleet will follow Dashboard commands.');
