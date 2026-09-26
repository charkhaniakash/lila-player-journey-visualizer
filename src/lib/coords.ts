import type { MapConfig } from './types';

export interface PixelCoord {
  readonly px: number;
  readonly py: number;
}

/* Transform world (x, z) to pixel coordinates on the minimap image.
   Y-flip is needed because image origin is top-left but world origin is bottom-left. */
export function worldToPixel(x: number, z: number, map: MapConfig): PixelCoord {
  const u = (x - map.originX) / map.scale;
  const v = (z - map.originZ) / map.scale;
  return {
    px: u * map.imageWidth,
    py: (1 - v) * map.imageHeight,
  };
}
