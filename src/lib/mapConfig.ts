import type { MapConfig, MapId } from './types';

/* Resized dimensions (1024×1024 target) — preprocessing resizes source images to these */
const MAP_CONFIGS: Record<MapId, MapConfig> = {
  AmbroseValley: {
    id: 'AmbroseValley',
    label: 'Ambrose Valley',
    scale: 900,
    originX: -370,
    originZ: -473,
    imageWidth: 1024,
    imageHeight: 1024,
    minimapPath: '/minimaps/ambrose_valley.webp',
  },
  GrandRift: {
    id: 'GrandRift',
    label: 'Grand Rift',
    scale: 581,
    originX: -290,
    originZ: -290,
    imageWidth: 1024,
    imageHeight: 1024,
    minimapPath: '/minimaps/grand_rift.webp',
  },
  Lockdown: {
    id: 'Lockdown',
    label: 'Lockdown',
    scale: 1000,
    originX: -500,
    originZ: -500,
    imageWidth: 1024,
    imageHeight: 1024,
    minimapPath: '/minimaps/lockdown.webp',
  },
};

export function getMapConfig(mapId: MapId): MapConfig {
  return MAP_CONFIGS[mapId];
}

export function getAllMapConfigs(): MapConfig[] {
  return Object.values(MAP_CONFIGS);
}

export const MAP_IDS: readonly MapId[] = ['AmbroseValley', 'GrandRift', 'Lockdown'] as const;
