/**
 * Preprocessing pipeline for LILA player telemetry data.
 * Reads parquet files, decodes events, computes match-elapsed time,
 * and outputs static JSON + resized minimap images for the frontend.
 *
 * Usage: node scripts/preprocess.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parquetRead } from 'hyparquet';
import sharp from 'sharp';

const DATA_DIR = 'player_data';
const DATE_FOLDERS = ['February_10', 'February_11', 'February_12', 'February_13', 'February_14'];
const OUTPUT_DATA = 'public/data';
const OUTPUT_MATCHES = 'public/data/matches';
const OUTPUT_HEATMAPS = 'public/data/heatmaps';
const OUTPUT_MINIMAPS = 'public/minimaps';

const MAP_CONFIGS = {
  AmbroseValley: { scale: 900, originX: -370, originZ: -473 },
  GrandRift:     { scale: 581, originX: -290, originZ: -290 },
  Lockdown:      { scale: 1000, originX: -500, originZ: -500 },
};

const MINIMAP_SOURCES = {
  AmbroseValley: join(DATA_DIR, 'minimaps', 'AmbroseValley_Minimap.png'),
  GrandRift:     join(DATA_DIR, 'minimaps', 'GrandRift_Minimap.png'),
  Lockdown:      join(DATA_DIR, 'minimaps', 'Lockdown_Minimap.jpg'),
};

const MINIMAP_OUTPUTS = {
  AmbroseValley: join(OUTPUT_MINIMAPS, 'ambrose_valley.webp'),
  GrandRift:     join(OUTPUT_MINIMAPS, 'grand_rift.webp'),
  Lockdown:      join(OUTPUT_MINIMAPS, 'lockdown.webp'),
};

const TARGET_SIZE = 1024;

// ── Helpers ──────────────────────────────────────────────────────────

function isUUID(s) {
  return typeof s === 'string' && s.length === 36 && s.includes('-');
}

function decodeBytes(val) {
  if (val instanceof Uint8Array) return new TextDecoder().decode(val);
  if (typeof val === 'string') return val;
  return String(val);
}

/** Convert folder name like "February_10" to "2026-02-10" */
function folderToDate(folder) {
  const day = folder.split('_')[1];
  return `2026-02-${day.padStart(2, '0')}`;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.time('preprocess');

  // Ensure output dirs exist
  for (const dir of [OUTPUT_DATA, OUTPUT_MATCHES, OUTPUT_HEATMAPS, OUTPUT_MINIMAPS]) {
    mkdirSync(dir, { recursive: true });
  }

  // ── Step 1: Parse all parquet files ────────────────────────────────
  console.log('Step 1: Parsing parquet files...');

  /** @type {Map<string, Array>} matchId → events[] */
  const matchEvents = new Map();
  /** @type {Map<string, {mapId: string, date: string}>} matchId → metadata */
  const matchMeta = new Map();

  let totalFiles = 0;
  let totalEvents = 0;

  for (const folder of DATE_FOLDERS) {
    const folderPath = join(DATA_DIR, folder);
    if (!existsSync(folderPath)) {
      console.warn(`  Skipping missing folder: ${folderPath}`);
      continue;
    }

    const files = readdirSync(folderPath).filter(f => f.endsWith('.nakama-0'));
    const date = folderToDate(folder);

    for (const file of files) {
      const filePath = join(folderPath, file);
      const parts = basename(file, '.nakama-0').split('_');
      const fileUserId = parts[0];
      const fileIsBot = !isUUID(fileUserId);

      try {
        const buffer = readFileSync(filePath);
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

        const rows = [];
        await parquetRead({
          file: arrayBuffer,
          onComplete: (data) => rows.push(...data),
        });

        for (const row of rows) {
          const userId = decodeBytes(row[0]);
          const matchId = decodeBytes(row[1]);
          const mapId = decodeBytes(row[2]);
          const x = Number(row[3]);
          // row[4] = y (elevation, skipped)
          const z = Number(row[5]);

          // ts is stored as int64 unix seconds despite schema saying timestamp[ms]
          // hyparquet reads raw int64 as ms → new Date(raw). getTime() recovers the raw int64 value.
          let ts;
          if (typeof row[6] === 'bigint') {
            ts = Number(row[6]);
          } else if (row[6] instanceof Date) {
            ts = row[6].getTime();
          } else {
            ts = Number(row[6]);
          }

          const event = decodeBytes(row[7]);

          const isBot = fileIsBot || event === 'BotPosition' || event === 'BotKill' || event === 'BotKilled';

          if (!matchEvents.has(matchId)) {
            matchEvents.set(matchId, []);
          }
          matchEvents.get(matchId).push({ userId, isBot, x, z, ts, event });

          if (!matchMeta.has(matchId)) {
            matchMeta.set(matchId, { mapId, date });
          }
        }

        totalFiles++;
        totalEvents += rows.length;
      } catch (err) {
        console.error(`  Error reading ${filePath}: ${err.message}`);
      }
    }

    console.log(`  ${folder}: processed ${files.length} files`);
  }

  console.log(`  Total: ${totalFiles} files, ${totalEvents} events, ${matchEvents.size} matches`);

  // ── Step 2: Emit per-match JSON + index ────────────────────────────
  console.log('Step 2: Emitting per-match JSON...');

  const index = [];

  for (const [matchId, events] of matchEvents) {
    const meta = matchMeta.get(matchId);
    if (!meta) continue;

    // Sort by timestamp
    events.sort((a, b) => a.ts - b.ts);

    const minTs = events[0].ts;
    const maxTs = events[events.length - 1].ts;
    const durationS = Math.round(maxTs - minTs);

    // Compute t_elapsed and round coordinates
    const processedEvents = events.map(e => ({
      userId: e.userId,
      isBot: e.isBot,
      x: round2(e.x),
      z: round2(e.z),
      tElapsed: round2(e.ts - minTs),
      event: e.event,
    }));

    // Gather unique players
    const players = [...new Set(events.map(e => e.userId))];
    const humanCount = players.filter(p => isUUID(p)).length;
    const botCount = players.length - humanCount;

    // Event counts
    const eventCounts = {};
    for (const e of events) {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    }

    // Write per-match file
    const matchData = {
      matchId,
      mapId: meta.mapId,
      date: meta.date,
      durationS,
      players,
      events: processedEvents,
    };

    // Sanitize matchId for filename (remove .nakama-0 suffix if present)
    const safeId = matchId.replace(/\.nakama-0$/, '');
    writeFileSync(
      join(OUTPUT_MATCHES, `${safeId}.json`),
      JSON.stringify(matchData)
    );

    index.push({
      matchId,
      mapId: meta.mapId,
      date: meta.date,
      durationS,
      humanCount,
      botCount,
      eventCounts,
    });
  }

  writeFileSync(join(OUTPUT_DATA, 'index.json'), JSON.stringify(index));
  console.log(`  Wrote ${index.length} match files + index.json`);

  // ── Step 3: Precompute heatmap point arrays ────────────────────────
  console.log('Step 3: Computing heatmap data...');

  const heatmaps = {};
  for (const mapId of Object.keys(MAP_CONFIGS)) {
    heatmaps[mapId] = { kills: [], deaths: [], traffic: [] };
  }

  const positionCounter = {};

  for (const [matchId, events] of matchEvents) {
    const meta = matchMeta.get(matchId);
    if (!meta) continue;
    const mapId = meta.mapId;
    const hm = heatmaps[mapId];
    if (!hm) continue;

    if (!positionCounter[mapId]) positionCounter[mapId] = 0;

    for (const e of events) {
      switch (e.event) {
        case 'Kill':
        case 'BotKill':
          hm.kills.push([round2(e.x), round2(e.z)]);
          break;
        case 'Killed':
        case 'BotKilled':
        case 'KilledByStorm':
          hm.deaths.push([round2(e.x), round2(e.z)]);
          break;
        case 'Position':
        case 'BotPosition':
          // Subsample every 5th position event to keep JSON small
          positionCounter[mapId]++;
          if (positionCounter[mapId] % 5 === 0) {
            hm.traffic.push([round2(e.x), round2(e.z)]);
          }
          break;
      }
    }
  }

  for (const [mapId, hm] of Object.entries(heatmaps)) {
    writeFileSync(
      join(OUTPUT_HEATMAPS, `${mapId}.json`),
      JSON.stringify(hm)
    );
    console.log(`  ${mapId}: ${hm.kills.length} kills, ${hm.deaths.length} deaths, ${hm.traffic.length} traffic pts`);
  }

  // ── Step 4: Resize minimaps ────────────────────────────────────────
  console.log('Step 4: Resizing minimaps...');

  for (const [mapId, srcPath] of Object.entries(MINIMAP_SOURCES)) {
    if (!existsSync(srcPath)) {
      console.warn(`  Skipping missing minimap: ${srcPath}`);
      continue;
    }

    const outPath = MINIMAP_OUTPUTS[mapId];
    await sharp(srcPath)
      .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'fill' })
      .webp({ quality: 85 })
      .toFile(outPath);

    const stats = readFileSync(outPath);
    console.log(`  ${mapId}: ${(stats.length / 1024).toFixed(0)} KB → ${outPath}`);
  }

  console.timeEnd('preprocess');
  console.log('Done! Run `npm run dev` to start the frontend.');
}

main().catch(err => {
  console.error('Preprocessing failed:', err);
  process.exit(1);
});
