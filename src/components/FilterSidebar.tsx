import { useMemo } from 'react';
import type { MatchMetadata, MapId } from '../lib/types';
import { MAP_IDS } from '../lib/mapConfig';
import { Search } from 'lucide-react';
import clsx from 'clsx';

interface FilterSidebarProps {
  readonly matches: MatchMetadata[];
  readonly selectedMap: MapId;
  readonly selectedDate: string | null;
  readonly selectedMatchId: string | null;
  readonly showBotPaths: boolean;
  readonly onMapChange: (map: MapId) => void;
  readonly onDateChange: (date: string | null) => void;
  readonly onMatchChange: (matchId: string | null) => void;
  readonly onToggleBotPaths: (show: boolean) => void;
}

const MAP_LABELS: Record<MapId, string> = {
  AmbroseValley: 'Ambrose Valley',
  GrandRift: 'Grand Rift',
  Lockdown: 'Lockdown',
};

const DATES = ['2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13', '2026-02-14'];

export function FilterSidebar({
  matches, selectedMap, selectedDate, selectedMatchId,
  showBotPaths, onMapChange, onDateChange, onMatchChange, onToggleBotPaths,
}: FilterSidebarProps) {
  const filteredMatches = useMemo(() => {
    return matches
      .filter(m => m.mapId === selectedMap)
      .filter(m => !selectedDate || m.date === selectedDate)
      .sort((a, b) => b.durationS - a.durationS);
  }, [matches, selectedMap, selectedDate]);

  const handleMapChange = (map: MapId) => {
    onMapChange(map);
    onMatchChange(null);
  };

  const handleDateChange = (date: string | null) => {
    onDateChange(date);
    onMatchChange(null);
  };

  return (
    <aside className="w-64 bg-gray-900/80 backdrop-blur-sm border-r border-gray-800 flex flex-col p-4 gap-5 overflow-y-auto">
      {/* Map Selection */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Map</h3>
        <div className="flex flex-col gap-1">
          {MAP_IDS.map(id => (
            <button
              key={id}
              onClick={() => handleMapChange(id)}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm text-left transition-all duration-150',
                selectedMap === id
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-gray-300 hover:bg-gray-800 border border-transparent'
              )}
            >
              {MAP_LABELS[id]}
            </button>
          ))}
        </div>
      </section>

      {/* Date Selection */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date</h3>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => handleDateChange(null)}
            className={clsx(
              'px-2 py-1 rounded text-xs transition-all duration-150',
              !selectedDate
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-gray-400 hover:bg-gray-800 border border-transparent'
            )}
          >
            All
          </button>
          {DATES.map(d => (
            <button
              key={d}
              onClick={() => handleDateChange(d)}
              className={clsx(
                'px-2 py-1 rounded text-xs transition-all duration-150',
                selectedDate === d
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-gray-400 hover:bg-gray-800 border border-transparent'
              )}
            >
              {d.slice(5)}
            </button>
          ))}
        </div>
      </section>

      {/* Match Selection */}
      <section className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Match ({filteredMatches.length})
        </h3>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search matches..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
            onChange={(e) => {
              const val = e.target.value.toLowerCase();
              if (!val) { onMatchChange(null); return; }
              const found = filteredMatches.find(m => m.matchId.toLowerCase().includes(val));
              if (found) onMatchChange(found.matchId);
            }}
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin">
          {filteredMatches.map(m => (
            <button
              key={m.matchId}
              onClick={() => onMatchChange(m.matchId)}
              className={clsx(
                'w-full text-left px-2 py-1.5 rounded text-xs transition-all duration-150',
                selectedMatchId === m.matchId
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-gray-400 hover:bg-gray-800/60 border border-transparent'
              )}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono truncate max-w-[120px]">{m.matchId.slice(0, 8)}</span>
                <span className="text-gray-500">{Math.floor(m.durationS / 60)}m</span>
              </div>
              <div className="flex gap-2 mt-0.5 text-gray-500">
                <span>{m.humanCount}H</span>
                <span>{m.botCount}B</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Bot Path Toggle */}
      <section className="border-t border-gray-800 pt-3">
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showBotPaths}
            onChange={(e) => onToggleBotPaths(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500/30"
          />
          Show bot paths
        </label>
      </section>
    </aside>
  );
}
