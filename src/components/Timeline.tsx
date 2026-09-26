import { Play, Pause, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

interface TimelineProps {
  readonly durationS: number;
  readonly currentTime: number;
  readonly isPlaying: boolean;
  readonly speed: number;
  readonly onTimeChange: (t: number) => void;
  readonly onTogglePlay: () => void;
  readonly onSpeedChange: (s: number) => void;
  readonly onReset: () => void;
}

const SPEEDS = [1, 2, 4, 8];

function formatTime(s: number): string {
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function Timeline({
  durationS, currentTime, isPlaying, speed,
  onTimeChange, onTogglePlay, onSpeedChange, onReset,
}: TimelineProps) {
  const progress = durationS > 0 ? (currentTime / durationS) * 100 : 0;

  return (
    <div className="h-16 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 flex items-center gap-4 px-4">
      {/* Play / Pause */}
      <button
        onClick={onTogglePlay}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 transition-colors"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-200 transition-colors"
        title="Reset"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* Time Display */}
      <span className="text-xs font-mono text-gray-400 min-w-[90px]">
        {formatTime(currentTime)} / {formatTime(durationS)}
      </span>

      {/* Scrubber */}
      <div className="flex-1 relative group cursor-pointer">
        {/* Track background */}
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          {/* Filled progress */}
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 40%, #a78bfa 70%, #c4b5fd 100%)',
              boxShadow: isPlaying ? '0 0 12px 2px rgba(139, 92, 246, 0.6)' : 'none',
            }}
          />
        </div>
        {/* Playhead dot */}
        {progress > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-violet-500 shadow-lg shadow-violet-500/50 pointer-events-none"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        )}
        <input
          type="range"
          min={0}
          max={durationS}
          step={0.1}
          value={currentTime}
          onChange={(e) => onTimeChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Speed Controls */}
      <div className="flex gap-1">
        {SPEEDS.map(s => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={clsx(
              'px-2 py-1 rounded text-xs transition-colors',
              speed === s
                ? 'bg-indigo-600/30 text-indigo-300'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
