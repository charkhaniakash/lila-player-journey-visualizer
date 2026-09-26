# LILA Player Journey Visualizer

> A web-based tool for visualizing player movement, combat, and loot events on game minimaps from 5 days of LILA BLACK production telemetry.

**🔗 Deployed URL:** _[To be added after Vercel deployment]_

**🎥 Walkthrough Video:** _[To be added]_

---

## What This Is

A Level Design analysis tool that overlays ~89,000 player telemetry events across 796 matches onto three game minimaps (Ambrose Valley, Grand Rift, Lockdown). Designers can visualize player paths, kill/death locations, loot pickups, and storm deaths — then watch matches replay in real-time or explore spatial heatmaps to identify hotspots and dead zones.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript (Vite) |
| Styling | Tailwind CSS 4 |
| Parquet Reader | hyparquet (preprocessing) |
| Canvas Rendering | HTML5 Canvas (raw) |
| Heatmaps | simpleheat |
| Image Processing | sharp (preprocessing) |
| State | React hooks + Zustand (available) |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- The `player_data/` directory with parquet files and minimap images

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/charkhaniakash/lila-player-journey-visualizer.git
cd lila-player-journey-visualizer

# 2. Install dependencies
npm install

# 3. Run preprocessing (reads parquet files, outputs JSON + resized minimaps)
# Requires player_data/ directory with February_10..14 folders and minimaps/
npm run preprocess

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

None required. All data is preprocessed and served statically.

---

## Repo Structure

```
lila-player-journey-visualizer/
├── player_data/                  # Input data (gitignored except README + minimaps)
│   ├── February_10..14/          # Parquet telemetry files
│   ├── minimaps/                 # Source minimap images
│   └── README.md                 # Data documentation
├── scripts/
│   ├── preprocess.mjs            # Parquet → JSON preprocessing pipeline
│   └── analyze.mjs               # Data analysis for insights
├── public/
│   ├── data/
│   │   ├── index.json            # Match metadata index (796 entries)
│   │   ├── matches/{id}.json     # Per-match event data
│   │   └── heatmaps/{map}.json   # Precomputed heatmap points
│   └── minimaps/                 # Resized minimap images (webp)
├── src/
│   ├── App.tsx                   # Main application component
│   ├── components/               # UI components
│   │   ├── FilterSidebar.tsx     # Map, date, match filters
│   │   ├── MapCanvas.tsx         # Minimap + path/marker rendering
│   │   ├── HeatmapCanvas.tsx     # Heatmap overlay layer
│   │   ├── HeatmapToggle.tsx     # Paths/Kills/Deaths/Traffic toggle
│   │   ├── Timeline.tsx          # Playback scrubber + controls
│   │   ├── MatchInfoPanel.tsx    # Selected match statistics
│   │   ├── Legend.tsx            # Event marker legend
│   │   └── Tooltip.tsx           # Hover tooltip for markers
│   ├── hooks/                    # React hooks
│   │   ├── useMatchIndex.ts      # Fetch + cache match index
│   │   ├── useMatchData.ts       # Fetch + cache per-match data
│   │   └── usePlayback.ts        # RAF-based timeline animation
│   └── lib/                      # Shared utilities
│       ├── types.ts              # TypeScript type definitions
│       ├── mapConfig.ts          # Per-map coordinate constants
│       ├── coords.ts             # World → pixel transformation
│       ├── coords.test.ts        # Coordinate unit tests
│       ├── data.ts               # Data fetching + caching
│       └── renderer.ts           # Color + event type utilities
├── ARCHITECTURE.md               # Architecture documentation
├── INSIGHTS.md                   # 3 data-driven insights
├── AI_BUILD_PROMPT.md            # Build specification
└── README.md                     # This file
```

---

## Features

1. **Player Journey Paths** — Colored polylines on minimap, distinct human (saturated) vs bot (dashed, muted) styling
2. **Event Markers** — Kill (red crosshair), death (grey X), storm death (cyan diamond), loot (yellow square)
3. **Filter System** — Filter by map, date, and specific match with cascading selection
4. **Timeline Playback** — Scrubber + play/pause/speed controls, progressive path rendering
5. **Heatmap Overlays** — Kill zones, death zones, and traffic density with distinct color gradients
6. **Hover Tooltips** — Marker details on hover (event type, player, timestamp)
7. **Keyboard Shortcuts** — Space (play/pause), arrow keys (±5s scrub)
