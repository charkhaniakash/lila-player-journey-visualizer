import type { MatchMetadata, MatchData, HeatmapData } from './types';

const cache = new Map<string, MatchData>();

export async function fetchMatchIndex(): Promise<MatchMetadata[]> {
  const res = await fetch('/data/index.json');
  if (!res.ok) throw new Error(`Failed to load match index: ${res.status}`);
  return res.json() as Promise<MatchMetadata[]>;
}

export async function fetchMatchData(matchId: string): Promise<MatchData> {
  const cached = cache.get(matchId);
  if (cached) return cached;

  /* matchId may contain .nakama-0 suffix that was stripped from filename */
  const safeId = matchId.replace(/\.nakama-0$/, '');
  const res = await fetch(`/data/matches/${safeId}.json`);
  if (!res.ok) throw new Error(`Failed to load match ${matchId}: ${res.status}`);

  const data = (await res.json()) as MatchData;
  cache.set(matchId, data);
  return data;
}

export async function fetchHeatmapData(mapId: string): Promise<HeatmapData> {
  const res = await fetch(`/data/heatmaps/${mapId}.json`);
  if (!res.ok) throw new Error(`Failed to load heatmap for ${mapId}: ${res.status}`);
  return res.json() as Promise<HeatmapData>;
}
