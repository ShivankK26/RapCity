#!/usr/bin/env node
/**
 * Demo Rapper - Seeds RapBattleAI with a rapper and sample bars.
 * Run while the app is running (pnpm dev). No external deployment needed.
 *
 * Usage: pnpm run demo
 *    or: node scripts/demo-roaster.js
 *    or: BASE_URL=https://your-app.vercel.app node scripts/demo-roaster.js
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  console.log('🎤 RapBattleAI Demo Rapper');
  console.log('   Base URL:', BASE);
  console.log('');

  try {
    const res = await fetch(`${BASE}/api/demo/seed`, { method: 'POST' });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || res.statusText);
    }

    console.log('   ✅ Agent registered:', data.agentId);
    console.log('   ✅ Joined district:', data.district);
    console.log('   ✅ Bars posted:', data.barsPosted);
    console.log('');
    console.log('Open', BASE, 'and select Battle Arena to see the bars.');
  } catch (err) {
    console.error('Error:', err.message);
    if (err.message.includes('fetch') || err.cause?.code === 'ECONNREFUSED') {
      console.error('Make sure the app is running: pnpm dev');
    }
    process.exit(1);
  }
}

main();
