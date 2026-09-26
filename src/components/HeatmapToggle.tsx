import clsx from 'clsx';

export type HeatmapMode = 'paths' | 'kills' | 'deaths' | 'traffic';

interface HeatmapToggleProps {
  readonly mode: HeatmapMode;
  readonly onModeChange: (mode: HeatmapMode) => void;
}

const MODES: Array<{ key: HeatmapMode; label: string }> = [
  { key: 'paths', label: 'Paths' },
  { key: 'kills', label: 'Kills' },
  { key: 'deaths', label: 'Deaths' },
  { key: 'traffic', label: 'Traffic' },
];

export function HeatmapToggle({ mode, onModeChange }: HeatmapToggleProps) {
  return (
    <div className="flex gap-0.5 bg-gray-800/60 rounded-lg p-0.5">
      {MODES.map(m => (
        <button
          key={m.key}
          onClick={() => onModeChange(m.key)}
          className={clsx(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
            mode === m.key
              ? 'bg-indigo-600/30 text-indigo-300 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
