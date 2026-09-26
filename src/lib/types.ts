export type MapId = 'AmbroseValley' | 'GrandRift' | 'Lockdown';

export type EventType =
  | 'Position'
  | 'BotPosition'
  | 'Kill'
  | 'Killed'
  | 'BotKill'
  | 'BotKilled'
  | 'KilledByStorm'
  | 'Loot';

export interface MapConfig {
  readonly id: MapId;
  readonly label: string;
  readonly scale: number;
  readonly originX: number;
  readonly originZ: number;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly minimapPath: string;
}

export interface PlayerEvent {
  readonly userId: string;
  readonly isBot: boolean;
  readonly x: number;
  readonly z: number;
  readonly tElapsed: number;
  readonly event: EventType;
}

export interface MatchMetadata {
  readonly matchId: string;
  readonly mapId: MapId;
  readonly date: string;
  readonly durationS: number;
  readonly humanCount: number;
  readonly botCount: number;
  readonly eventCounts: Record<EventType, number>;
}

export interface MatchData {
  readonly matchId: string;
  readonly mapId: MapId;
  readonly date: string;
  readonly durationS: number;
  readonly players: readonly string[];
  readonly events: readonly PlayerEvent[];
}

export interface HeatmapData {
  readonly kills: ReadonlyArray<[number, number]>;
  readonly deaths: ReadonlyArray<[number, number]>;
  readonly traffic: ReadonlyArray<[number, number]>;
}
