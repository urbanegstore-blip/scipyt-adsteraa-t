const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Polyfill for Node 20 WebSockets on GitHub Actions
global.WebSocket = require('ws');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Syncs UNPUSHED keys to the production token table.
 */
async function syncTokens() {
    console.log(`\n🔄 --- SYNCING NEW TOKENS TO FLEET ---`);

    try {
        // 1. Fetch only keys that haven't been pushed yet
        const { data: unpushed, error: fetchError } = await supabase
            .from('scrpedkeys')
            .select('*')
            .eq('pushed', false);

        if (fetchError) throw fetchError;

        if (!unpushed || unpushed.length === 0) {
            console.log(`📭 No new unpushed keys found.`);
            return;
        }

        console.log(`📦 Found ${unpushed.length} new keys to sync.`);

        for (const item of unpushed) {
            // 2. Upsert into production pool
            const { error: upsertError } = await supabase
                .from('browserless_tokens')
                .upsert({
                    token: item.key,
                    status: 'active'
                }, { onConflict: 'token' });

            if (!upsertError) {
                // 3. Mark as pushed in the staging table
                await supabase
                    .from('scrpedkeys')
                    .update({ pushed: true })
                    .eq('id', item.id);
                
                console.log(`✅ Activated: ${item.key}`);
            } else {
                console.error(`❌ Sync Failed for ${item.key}:`, upsertError.message);
            }
        }
        console.log(`🎉 Fleet sync completed.`);

    } catch (err) {
        console.error(`🛑 Distributor Error:`, err.message);
    }
}

// Export for generator.js to use
module.exports = { syncTokens };

// If run directly, start the 10-minute interval
if (require.main === module) {
    console.log("🕒 Token Distributor active. Syncing every 10 minutes...");
    setInterval(syncTokens, 10 * 60 * 1000);
    syncTokens(); // Run once now
}
