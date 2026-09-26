import type { PlayerEvent } from '../lib/types';

interface TooltipProps {
  readonly event: PlayerEvent | null;
  readonly x: number;
  readonly y: number;
}

export function Tooltip({ event, x, y }: TooltipProps) {
  if (!event) return null;

  const mins = Math.floor(event.tElapsed / 60);
  const secs = Math.floor(event.tElapsed % 60);

  return (
    <div
      className="fixed z-50 pointer-events-none px-3 py-2 bg-gray-900/95 border border-gray-700 rounded-lg shadow-xl backdrop-blur-sm"
      style={{ left: x + 12, top: y - 12 }}
    >
      <div className="text-xs font-medium text-gray-200">{event.event}</div>
      <div className="text-xs text-gray-400 mt-0.5">
        {event.isBot ? 'Bot' : 'Human'} · {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="text-xs text-gray-500 mt-0.5 font-mono">
        {event.userId.slice(0, 12)}…
      </div>
    </div>
  );
}
