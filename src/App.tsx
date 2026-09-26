import { useState, useEffect, useCallback } from 'react';
import type { MapId, PlayerEvent } from './lib/types';
import { getMapConfig } from './lib/mapConfig';
import { fetchHeatmapData } from './lib/data';
import type { HeatmapData } from './lib/types';
import { useMatchIndex } from './hooks/useMatchIndex';
import { useMatchData } from './hooks/useMatchData';
import { usePlayback } from './hooks/usePlayback';
import { FilterSidebar } from './components/FilterSidebar';
import { MapCanvas } from './components/MapCanvas';
import { HeatmapCanvas } from './components/HeatmapCanvas';
import { Timeline } from './components/Timeline';
import { HeatmapToggle } from './components/HeatmapToggle';
import type { HeatmapMode } from './components/HeatmapToggle';
import { MatchInfoPanel } from './components/MatchInfoPanel';
import { Legend } from './components/Legend';
import { Tooltip } from './components/Tooltip';
import { Loader2, Map } from 'lucide-react';

export function App() {
  /* State */
  const [selectedMap, setSelectedMap] = useState<MapId>('AmbroseValley');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showBotPaths, setShowBotPaths] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('paths');
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<PlayerEvent | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  /* Data hooks */
  const { matches, loading: indexLoading, error: indexError } = useMatchIndex();
  const { data: matchData, loading: matchLoading, error: matchError } = useMatchData(selectedMatchId);

  /* Playback */
  const durationS = matchData?.durationS ?? 0;
  const playback = usePlayback(durationS);

  /* Reset playback when match changes */
  useEffect(() => {
    playback.reset();
    playback.setCurrentTime(durationS);
  }, [selectedMatchId, durationS]);

  /* Load heatmap data when map changes */
  useEffect(() => {
    fetchHeatmapData(selectedMap)
      .then(setHeatmapData)
      .catch(() => setHeatmapData(null));
  }, [selectedMap]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          playback.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playback.setCurrentTime(Math.max(0, playback.currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          playback.setCurrentTime(Math.min(durationS, playback.currentTime + 5));
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playback.togglePlay, playback.currentTime, durationS]);

  const mapConfig = getMapConfig(selectedMap);

  const handleHoverEvent = useCallback((event: PlayerEvent | null, x: number, y: number) => {
    setHoveredEvent(event);
    setTooltipPos({ x, y });
  }, []);

  /* Find selected match metadata for info panel */
  const selectedMatchMeta = matches.find(m => m.matchId === selectedMatchId) ?? null;

  /* Error state */
  if (indexError) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-400 text-sm">Failed to load data</p>
          <p className="text-gray-500 text-xs">{indexError}</p>
          <p className="text-gray-600 text-xs">Run `npm run preprocess` first</p>
        </div>
      </main>
    );
  }

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center px-4 gap-3 shrink-0">
        <Map className="w-4 h-4 text-indigo-400" />
        <h1 className="text-sm font-semibold tracking-tight">LILA Player Journey Visualizer</h1>
        <div className="ml-auto">
          <HeatmapToggle mode={heatmapMode} onModeChange={setHeatmapMode} />
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Filters */}
        <FilterSidebar
          matches={matches}
          selectedMap={selectedMap}
          selectedDate={selectedDate}
          selectedMatchId={selectedMatchId}
          showBotPaths={showBotPaths}
          onMapChange={setSelectedMap}
          onDateChange={setSelectedDate}
          onMatchChange={setSelectedMatchId}
          onToggleBotPaths={setShowBotPaths}
        />

        {/* Center - Canvas */}
        <div className="flex-1 flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
          {indexLoading ? (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs">Loading match data…</p>
            </div>
          ) : matchLoading ? (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs">Loading match…</p>
            </div>
          ) : matchError ? (
            <div className="text-center space-y-2">
              <p className="text-red-400 text-sm">Error loading match</p>
              <p className="text-gray-500 text-xs">{matchError}</p>
            </div>
          ) : !selectedMatchId && heatmapMode === 'paths' ? (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Map className="w-10 h-10 text-gray-700" />
              <p className="text-sm">Select a match to begin</p>
              <p className="text-xs text-gray-600">Choose a map and match from the sidebar</p>
            </div>
          ) : (
            <div className="relative" style={{ maxWidth: 1024, maxHeight: 1024, aspectRatio: '1/1', width: '100%', height: '100%' }}>
              {heatmapMode === 'paths' ? (
                <MapCanvas
                  mapConfig={mapConfig}
                  matchData={matchData}
                  currentTime={playback.currentTime}
                  showBotPaths={showBotPaths}
                  onHoverEvent={handleHoverEvent}
                />
              ) : (
                <HeatmapCanvas
                  mapConfig={mapConfig}
                  heatmapData={heatmapData}
                  mode={heatmapMode}
                />
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Info */}
        <aside className="w-56 bg-gray-900/80 backdrop-blur-sm border-l border-gray-800 p-4 space-y-5 overflow-y-auto shrink-0">
          <MatchInfoPanel match={selectedMatchMeta} />
          <Legend />
        </aside>
      </div>

      {/* Bottom - Timeline */}
      {selectedMatchId && matchData && (
        <Timeline
          durationS={durationS}
          currentTime={playback.currentTime}
          isPlaying={playback.isPlaying}
          speed={playback.speed}
          onTimeChange={playback.setCurrentTime}
          onTogglePlay={playback.togglePlay}
          onSpeedChange={playback.setSpeed}
          onReset={playback.reset}
        />
      )}

      {/* Tooltip */}
      <Tooltip event={hoveredEvent} x={tooltipPos.x} y={tooltipPos.y} />
    </div>
  );
}
