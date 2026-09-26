import { useRef, useEffect } from 'react';
import type { MapConfig, HeatmapData } from '../lib/types';
import type { HeatmapMode } from './HeatmapToggle';
import { worldToPixel } from '../lib/coords';
import simpleheat from 'simpleheat';

interface HeatmapCanvasProps {
  readonly mapConfig: MapConfig;
  readonly heatmapData: HeatmapData | null;
  readonly mode: HeatmapMode;
}

const CANVAS_SIZE = 1024;

/* Per-mode rendering config for visually distinct heatmaps */
const MODE_CONFIG: Record<string, { radius: number; blur: number; maxVal: number; gradient: Record<number, string> }> = {
  kills: {
    radius: 18,
    blur: 25,
    maxVal: 8,
    gradient: { 0.2: '#1a0a2e', 0.4: '#7c2d12', 0.6: '#dc2626', 0.8: '#f97316', 1.0: '#fbbf24' },
  },
  deaths: {
    radius: 20,
    blur: 28,
    maxVal: 6,
    gradient: { 0.2: '#0c1220', 0.4: '#1e3a5f', 0.6: '#3b82f6', 0.8: '#818cf8', 1.0: '#e0e7ff' },
  },
  traffic: {
    radius: 12,
    blur: 20,
    maxVal: 15,
    gradient: { 0.2: '#052e16', 0.4: '#166534', 0.6: '#22c55e', 0.8: '#86efac', 1.0: '#f0fdf4' },
  },
};

export function HeatmapCanvas({ mapConfig, heatmapData, mode }: HeatmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !heatmapData || mode === 'paths') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const config = MODE_CONFIG[mode];
    if (!config) return;

    const points = mode === 'kills' ? heatmapData.kills
      : mode === 'deaths' ? heatmapData.deaths
      : heatmapData.traffic;

    /* Convert world coords to pixel coords for heatmap */
    const pixelPoints: Array<[number, number, number]> = points.map(([x, z]) => {
      const { px, py } = worldToPixel(x!, z!, mapConfig);
      return [px, py, 1];
    });

    /* Use simpleheat to render */
    const heat = simpleheat(canvas);
    heat.data(pixelPoints);
    heat.radius(config.radius * dpr, config.blur * dpr);
    heat.max(config.maxVal);
    heat.gradient(config.gradient);
    heat.draw();
  }, [mapConfig, heatmapData, mode]);

  if (mode === 'paths') return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Dimmed minimap terrain background so heatmap hotspots overlay onto real locations */}
      <img
        src={mapConfig.minimapPath}
        alt={mapConfig.label}
        className="w-full h-full object-contain absolute inset-0 opacity-45 select-none pointer-events-none"
        style={{ maxWidth: CANVAS_SIZE, maxHeight: CANVAS_SIZE }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain absolute inset-0 pointer-events-none"
        style={{ imageRendering: 'auto', maxWidth: CANVAS_SIZE, maxHeight: CANVAS_SIZE }}
      />
      {/* Label showing which heatmap is active */}
      <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 rounded text-xs font-medium text-gray-200 backdrop-blur-sm border border-gray-800 z-10">
        {mode.charAt(0).toUpperCase() + mode.slice(1)} Heatmap
      </div>
    </div>
  );
}
