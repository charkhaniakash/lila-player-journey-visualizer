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
      <div className="flex-1 relative group">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
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
