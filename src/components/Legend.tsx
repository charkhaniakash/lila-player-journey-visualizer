export function Legend() {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Legend</h3>
      <div className="space-y-1.5">
        <LegendItem color="#ef4444" shape="crosshair" label="Kill / Bot Kill" />
        <LegendItem color="#9ca3af" shape="x" label="Death / Bot Death" />
        <LegendItem color="#22d3ee" shape="diamond" label="Storm Death" />
        <LegendItem color="#facc15" shape="square" label="Loot" />
        <LegendItem color="#818cf8" shape="line" label="Human Path" />
        <LegendItem color="#6b7280" shape="dashed" label="Bot Path" />
      </div>
    </section>
  );
}

interface LegendItemProps {
  readonly color: string;
  readonly shape: 'crosshair' | 'x' | 'diamond' | 'square' | 'line' | 'dashed';
  readonly label: string;
}

function LegendItem({ color, shape, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
        {shape === 'crosshair' && (
          <>
            <line x1="4" y1="8" x2="12" y2="8" stroke={color} strokeWidth="2" />
            <line x1="8" y1="4" x2="8" y2="12" stroke={color} strokeWidth="2" />
            <circle cx="8" cy="8" r="3" fill="none" stroke={color} strokeWidth="1.5" />
          </>
        )}
        {shape === 'x' && (
          <>
            <line x1="4" y1="4" x2="12" y2="12" stroke={color} strokeWidth="2" />
            <line x1="12" y1="4" x2="4" y2="12" stroke={color} strokeWidth="2" />
            <circle cx="8" cy="8" r="1.5" fill={color} />
          </>
        )}
        {shape === 'diamond' && (
          <polygon points="8,2 14,8 8,14 2,8" fill={color} opacity="0.8" />
        )}
        {shape === 'square' && (
          <rect x="4" y="4" width="8" height="8" fill={color} opacity="0.8" />
        )}
        {shape === 'line' && (
          <line x1="2" y1="8" x2="14" y2="8" stroke={color} strokeWidth="2" />
        )}
        {shape === 'dashed' && (
          <line x1="2" y1="8" x2="14" y2="8" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
        )}
      </svg>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
