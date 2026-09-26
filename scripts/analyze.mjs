/**
 * Analysis script to find data-driven insights from preprocessed match data.
 * Usage: node scripts/analyze.mjs
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const INDEX = JSON.parse(readFileSync('public/data/index.json', 'utf-8'));
const MATCHES_DIR = 'public/data/matches';

// ── 1. Map Popularity & Duration ──────────────────────────────────────

const mapStats = {};
for (const m of INDEX) {
  if (!mapStats[m.mapId]) {
    mapStats[m.mapId] = { count: 0, totalDuration: 0, totalHumans: 0, totalBots: 0, totalKills: 0, totalDeaths: 0, stormDeaths: 0 };
  }
  const s = mapStats[m.mapId];
  s.count++;
  s.totalDuration += m.durationS;
  s.totalHumans += m.humanCount;
  s.totalBots += m.botCount;
  s.totalKills += (m.eventCounts.Kill || 0) + (m.eventCounts.BotKill || 0);
  s.totalDeaths += (m.eventCounts.Killed || 0) + (m.eventCounts.BotKilled || 0);
  s.stormDeaths += m.eventCounts.KilledByStorm || 0;
}

console.log('\n=== MAP STATISTICS ===');
for (const [mapId, s] of Object.entries(mapStats)) {
  console.log(`\n${mapId}:`);
  console.log(`  Matches: ${s.count}`);
  console.log(`  Avg duration: ${(s.totalDuration / s.count / 60).toFixed(1)} min`);
  console.log(`  Avg humans per match: ${(s.totalHumans / s.count).toFixed(1)}`);
  console.log(`  Avg bots per match: ${(s.totalBots / s.count).toFixed(1)}`);
  console.log(`  Total kills: ${s.totalKills} (avg ${(s.totalKills / s.count).toFixed(1)} / match)`);
  console.log(`  Total deaths: ${s.totalDeaths}`);
  console.log(`  Storm deaths: ${s.stormDeaths} (${(s.stormDeaths / s.count).toFixed(1)} / match)`);
  console.log(`  Kill-to-death ratio: ${(s.totalKills / Math.max(s.totalDeaths, 1)).toFixed(2)}`);
}

// ── 2. Date Distribution ──────────────────────────────────────────────

const dateStats = {};
for (const m of INDEX) {
  if (!dateStats[m.date]) dateStats[m.date] = { count: 0, avgDuration: 0, totalEvents: 0 };
  dateStats[m.date].count++;
  dateStats[m.date].avgDuration += m.durationS;
}

console.log('\n=== DATE DISTRIBUTION ===');
for (const [date, s] of Object.entries(dateStats)) {
  console.log(`${date}: ${s.count} matches, avg ${(s.avgDuration / s.count / 60).toFixed(1)} min`);
}

// ── 3. Bot vs Human Kill Analysis ─────────────────────────────────────

let humanKills = 0, botKills = 0, humanDeaths = 0, botDeaths = 0;
for (const m of INDEX) {
  humanKills += m.eventCounts.Kill || 0;
  botKills += m.eventCounts.BotKill || 0;
  humanDeaths += m.eventCounts.Killed || 0;
  botDeaths += m.eventCounts.BotKilled || 0;
}

console.log('\n=== HUMAN vs BOT COMBAT ===');
console.log(`Human kills (by humans): ${humanKills}`);
console.log(`Bot kills (by humans): ${botKills}`);
console.log(`Human deaths: ${humanDeaths}`);
console.log(`Bot deaths: ${botDeaths}`);
console.log(`% kills that are bot kills: ${(botKills / (humanKills + botKills) * 100).toFixed(1)}%`);

// ── 4. Loot Analysis ─────────────────────────────────────────────────

let totalLoot = 0;
const lootByMap = {};
for (const m of INDEX) {
  const loots = m.eventCounts.Loot || 0;
  totalLoot += loots;
  lootByMap[m.mapId] = (lootByMap[m.mapId] || 0) + loots;
}

console.log('\n=== LOOT DISTRIBUTION ===');
console.log(`Total loot events: ${totalLoot}`);
for (const [mapId, count] of Object.entries(lootByMap)) {
  const matchCount = mapStats[mapId].count;
  console.log(`  ${mapId}: ${count} (avg ${(count / matchCount).toFixed(1)} / match)`);
}

// ── 5. Storm Death Analysis ──────────────────────────────────────────

const stormMatchesCount = INDEX.filter(m => (m.eventCounts.KilledByStorm || 0) > 0).length;
console.log('\n=== STORM ANALYSIS ===');
console.log(`Matches with storm deaths: ${stormMatchesCount} / ${INDEX.length} (${(stormMatchesCount / INDEX.length * 100).toFixed(1)}%)`);

// ── 6. Spatial Clustering — load heatmap files ──────────────────────

for (const mapId of ['AmbroseValley', 'GrandRift', 'Lockdown']) {
  const hm = JSON.parse(readFileSync(`public/data/heatmaps/${mapId}.json`, 'utf-8'));
  console.log(`\n=== ${mapId} SPATIAL ===`);
  console.log(`  Kill locations: ${hm.kills.length}`);
  console.log(`  Death locations: ${hm.deaths.length}`);
  console.log(`  Traffic samples: ${hm.traffic.length}`);

  // Find kill hotspot clusters (simple grid-based)
  const gridSize = 100;
  const killGrid = {};
  for (const [x, z] of hm.kills) {
    const gx = Math.floor(x / gridSize);
    const gz = Math.floor(z / gridSize);
    const key = `${gx},${gz}`;
    killGrid[key] = (killGrid[key] || 0) + 1;
  }

  const hotspots = Object.entries(killGrid)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  console.log('  Top 5 kill hotspot grid cells:');
  for (const [key, count] of hotspots) {
    const [gx, gz] = key.split(',').map(Number);
    console.log(`    Grid (${gx * gridSize}..${(gx + 1) * gridSize}, ${gz * gridSize}..${(gz + 1) * gridSize}): ${count} kills`);
  }

  // Find dead zones — grid cells with traffic but no kills
  const trafficGrid = {};
  for (const [x, z] of hm.traffic) {
    const gx = Math.floor(x / gridSize);
    const gz = Math.floor(z / gridSize);
    const key = `${gx},${gz}`;
    trafficGrid[key] = (trafficGrid[key] || 0) + 1;
  }

  const deadZones = Object.entries(trafficGrid)
    .filter(([key]) => !killGrid[key])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (deadZones.length > 0) {
    console.log('  Top 3 dead zones (traffic but no kills):');
    for (const [key, count] of deadZones) {
      const [gx, gz] = key.split(',').map(Number);
      console.log(`    Grid (${gx * gridSize}..${(gx + 1) * gridSize}, ${gz * gridSize}..${(gz + 1) * gridSize}): ${count} traffic, 0 kills`);
    }
  }
}

// ── 7. Match Duration Distribution ─────────────────────────────────

const durations = INDEX.map(m => m.durationS).sort((a, b) => a - b);
const shortMatches = durations.filter(d => d < 120).length;
const medMatches = durations.filter(d => d >= 120 && d < 600).length;
const longMatches = durations.filter(d => d >= 600).length;

console.log('\n=== MATCH DURATION DISTRIBUTION ===');
console.log(`Short (<2min): ${shortMatches}`);
console.log(`Medium (2-10min): ${medMatches}`);
console.log(`Long (>10min): ${longMatches}`);
console.log(`Median: ${(durations[Math.floor(durations.length / 2)] / 60).toFixed(1)} min`);
