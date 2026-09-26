import type { MatchMetadata } from '../lib/types';
import { Clock, Users, Bot, Crosshair, Skull, Zap, Package } from 'lucide-react';

interface MatchInfoPanelProps {
  readonly match: MatchMetadata | null;
}

export function MatchInfoPanel({ match }: MatchInfoPanelProps) {
  if (!match) {
    return (
      <section className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Match Info</h3>
        <p className="text-xs text-gray-500">Select a match to view details</p>
      </section>
    );
  }

  const mins = Math.floor(match.durationS / 60);
  const secs = match.durationS % 60;
  const kills = (match.eventCounts.Kill ?? 0) + (match.eventCounts.BotKill ?? 0);
  const deaths = (match.eventCounts.Killed ?? 0) + (match.eventCounts.BotKilled ?? 0);
  const stormDeaths = match.eventCounts.KilledByStorm ?? 0;
  const loots = match.eventCounts.Loot ?? 0;

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Match Info</h3>

      <div className="space-y-2">
        <div className="text-xs text-gray-300">
          <span className="text-gray-500">Map:</span>{' '}
          <span className="font-medium">{match.mapId}</span>
        </div>
        <div className="text-xs text-gray-300">
          <span className="text-gray-500">Date:</span>{' '}
          <span className="font-medium">{match.date}</span>
        </div>

        <StatRow icon={<Clock className="w-3 h-3" />} label="Duration" value={`${mins}m ${secs}s`} />
        <StatRow icon={<Users className="w-3 h-3" />} label="Humans" value={String(match.humanCount)} />
        <StatRow icon={<Bot className="w-3 h-3" />} label="Bots" value={String(match.botCount)} />
        <StatRow icon={<Crosshair className="w-3 h-3 text-red-400" />} label="Kills" value={String(kills)} color="text-red-400" />
        <StatRow icon={<Skull className="w-3 h-3 text-gray-400" />} label="Deaths" value={String(deaths)} />
        <StatRow icon={<Zap className="w-3 h-3 text-cyan-400" />} label="Storm Deaths" value={String(stormDeaths)} color="text-cyan-400" />
        <StatRow icon={<Package className="w-3 h-3 text-yellow-400" />} label="Loots" value={String(loots)} color="text-yellow-400" />
      </div>
    </section>
  );
}

interface StatRowProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
  readonly color?: string;
}

function StatRow({ icon, label, value, color }: StatRowProps) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className={color ?? 'text-gray-300'}>{value}</span>
    </div>
  );
}
