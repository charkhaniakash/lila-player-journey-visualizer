# Architecture

## Stack Rationale

**React + Vite + TypeScript** — A lightweight SPA framework that gives us fast HMR, tree-shaking, and TypeScript strict mode. No server-side rendering needed since all data is pre-processed and served statically. Vite's build output is a single HTML + JS + CSS bundle deployable anywhere.

**Tailwind CSS** — Utility-first styling that keeps the component files self-contained. The dark game-tool aesthetic is built with Tailwind's gray/indigo palette. No separate CSS files to maintain.

**HTML5 Canvas** — The minimap is a raster image, not geographic tiles. Canvas gives us pixel-level control for drawing paths, markers, and handling hit-testing for hover tooltips. Leaflet would add unnecessary complexity for a non-geographic use case.

**hyparquet** — Pure JavaScript parquet reader with zero native dependencies. Runs in Node.js for preprocessing without requiring Python or system-level libraries.

**simpleheat** — Lightweight canvas-based heatmap library. Renders directly to our canvas layer with configurable radius, blur, and color gradients.

**Pre-processed static JSON** — The telemetry data is historical (5 days, immutable). Pre-processing into JSON eliminates the need for a backend server, database, or API routes. The entire app runs as a static site on Vercel at zero cost.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  PREPROCESSING (node scripts/preprocess.mjs — runs once locally)   │
│                                                                     │
│  1,243 Parquet files (player_data/February_10..14/)                 │
│    │                                                                │
│    ├── Read via hyparquet                                           │
│    ├── Decode event column (Uint8Array → UTF-8 string)              │
│    ├── Reinterpret ts as Unix seconds (not ms)                      │
│    ├── Compute t_elapsed = ts - min(ts) per match                   │
│    ├── Detect bots via user_id shape (UUID = human, numeric = bot)  │
│    ├── Group all events by match_id                                 │
│    │                                                                │
│    ├── OUTPUT: public/data/index.json         (796 match metadata)  │
│    ├── OUTPUT: public/data/matches/{id}.json  (per-match events)    │
│    ├── OUTPUT: public/data/heatmaps/{map}.json (kill/death/traffic) │
│    │                                                                │
│    └── Resize 3 minimaps via sharp → public/minimaps/*.webp         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React SPA on Vercel)                                     │
│                                                                     │
│  On mount: fetch /data/index.json → populate sidebar filters        │
│  On match select: fetch /data/matches/{id}.json → render on canvas  │
│  On heatmap toggle: fetch /data/heatmaps/{map}.json → simpleheat    │
│                                                                     │
│  Canvas Layer 1: Minimap image (1024×1024 webp)                     │
│  Canvas Layer 2: Player paths + event markers (MapCanvas)           │
│  Canvas Layer 3: Heatmap overlay (HeatmapCanvas, when active)       │
│                                                                     │
│  Timeline: currentTime state → filters events by t_elapsed          │
│  Playback: requestAnimationFrame loop advances currentTime          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Coordinate Mapping Walkthrough

This is the trickiest part of the project. The telemetry data uses **Unreal Engine world coordinates** (3D), but we display on a **2D minimap image**. Here's how the mapping works:

### The Problem
- World data has `(x, y, z)` where `y` is elevation — **not useful for 2D**
- We plot `x` (horizontal) and `z` (depth) onto the minimap
- The minimap image origin is **top-left**, but world origin is **bottom-left**
- Each map has different scale and origin offsets

### Per-Map Constants (from game data)

| Map | Scale | Origin X | Origin Z |
|---|---|---|---|
| AmbroseValley | 900 | -370 | -473 |
| GrandRift | 581 | -290 | -290 |
| Lockdown | 1000 | -500 | -500 |

### The Formula

```
u = (x - originX) / scale        // Normalize to [0, 1]
v = (z - originZ) / scale        // Normalize to [0, 1]

pixelX = u × imageWidth           // Scale to image pixels
pixelY = (1 - v) × imageHeight    // Y-FLIP: image top-left origin
```

### Why the Y-Flip?
- In world space: Z increases upward (north)
- In image space: Y increases downward
- `(1 - v)` flips the vertical axis so north in the world maps to the top of the image

### Verification
For AmbroseValley, world coordinate `(-301.45, -355.55)`:
- `u = (-301.45 - (-370)) / 900 = 68.55 / 900 = 0.0762`
- `v = (-355.55 - (-473)) / 900 = 117.45 / 900 = 0.1305`
- `pixelX = 0.0762 × 1024 = 78`
- `pixelY = (1 - 0.1305) × 1024 = 890`

This is validated by a unit test in `src/lib/coords.test.ts`.

### Image Resizing
Source minimaps are large and non-uniform (4320×4320, 2160×2158, 9000×9000). We resize all to **1024×1024** webp during preprocessing:
- Keeps consistent coordinate mapping across all maps
- Reduces payload (original Lockdown alone is 11.8MB; resized webp is 82KB)
- The `mapConfig.ts` stores resized dimensions, not source dimensions

---

## Assumptions

1. **Timestamp is Unix seconds** — The parquet schema declares `timestamp[ms]` but the raw int64 values are Unix seconds (verified: `1770754537` → `2026-02-10T20:15:37Z`)
2. **Bot detection via user_id format** — UUIDs (36 chars, contains dashes) = human; short numeric strings = bot. Cross-verified with event types (`Position` vs `BotPosition`)
3. **Traffic heatmap subsamples every 5th Position event** — Full position data would be ~70K points per map; 1-in-5 sampling keeps heatmap JSON under 500KB while preserving spatial patterns
4. **Match reconstruction** — Each parquet file represents one player's view of one match. To rebuild a full match, we aggregate all files sharing the same `match_id`, then sort by timestamp
5. **Minimap resize target is 1024×1024** — Balances visual quality with payload size. GrandRift (originally 2160×2158, not square) is stretched to square, which introduces ~0.1% distortion — negligible at this scale
6. **Feb 14 is a partial day** — Only 37 matches vs 285 on Feb 10. We include it but don't draw conclusions from its volume

---

## Tradeoffs

| Choice | Alternative | Why |
|---|---|---|
| Pre-processed static JSON | Live parquet parsing in browser | Data is historical and immutable; static JSON eliminates backend cost, reduces client CPU, and enables CDN caching |
| HTML5 Canvas | Leaflet / Mapbox | Minimap is a PNG, not geographic tiles. Canvas gives pixel-level control without projection overhead |
| Node.js preprocessing | Python (pandas/pyarrow) | Single ecosystem (JS end-to-end), simpler onboarding, hyparquet handles parquet natively |
| 1024×1024 resize target | Original dimensions or 2048 | 1024 balances visual quality with payload. At CSS display sizes (~600-800px), 1024 is retina-quality |
| simpleheat | heatmap.js / deck.gl | Minimal API, canvas-native, no WebGL dependencies. Sufficient for our point counts (~2K-10K) |
| Per-match JSON files | Single large data file | Lazy loading — only fetches data for the selected match. Keeps initial page load under 100KB |
| Vite + React | Next.js | No SSR needed for a static visualization tool. Vite is faster to build and simpler to deploy |
| Squash GrandRift to square | Preserve aspect ratio (letterbox) | Uniform 1024×1024 target simplifies coordinate mapping. The 2px height difference (2160 vs 2158) causes ~0.1% distortion — imperceptible at display size |
