import { useRef, useEffect, useCallback } from 'react';
import type { MatchData, MapConfig, PlayerEvent } from '../lib/types';
import { worldToPixel } from '../lib/coords';
import { playerColor, eventColor, isMovementEvent, isMarkerEvent } from '../lib/renderer';

interface MapCanvasProps {
  readonly mapConfig: MapConfig;
  readonly matchData: MatchData | null;
  readonly currentTime: number;
  readonly showBotPaths: boolean;
  readonly onHoverEvent: (event: PlayerEvent | null, x: number, y: number) => void;
}

const CANVAS_SIZE = 1024;

export function MapCanvas({ mapConfig, matchData, currentTime, showBotPaths, onHoverEvent }: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const eventsRef = useRef<PlayerEvent[]>([]);
  const markerPositionsRef = useRef<Array<{ event: PlayerEvent; px: number; py: number }>>([]);

  /* Load minimap image */
  useEffect(() => {
    const img = new Image();
    img.src = mapConfig.minimapPath;
    img.onload = () => {
      imageRef.current = img;
      drawFrame();
    };
  }, [mapConfig.minimapPath]);

  /* Cache events reference */
  useEffect(() => {
    eventsRef.current = matchData?.events ? [...matchData.events] : [];
  }, [matchData]);

  /* Draw on every frame update */
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !ctx || !img) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Clear and draw minimap */
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (!matchData) return;

    const events = eventsRef.current;
    const visibleEvents = events.filter(e => e.tElapsed <= currentTime);

    /* Group movement events by player for path rendering */
    const playerPaths = new Map<string, Array<{ px: number; py: number }>>();
    const markers: Array<{ event: PlayerEvent; px: number; py: number }> = [];

    for (const e of visibleEvents) {
      if (e.isBot && !showBotPaths && isMovementEvent(e.event)) continue;

      const { px, py } = worldToPixel(e.x, e.z, mapConfig);

      if (isMovementEvent(e.event)) {
        const path = playerPaths.get(e.userId) ?? [];
        path.push({ px, py });
        playerPaths.set(e.userId, path);
      }

      if (isMarkerEvent(e.event)) {
        markers.push({ event: e, px, py });
      }
    }

    /* Draw paths */
    for (const [userId, points] of playerPaths) {
      if (points.length < 2) continue;

      const isBot = visibleEvents.find(e => e.userId === userId)?.isBot ?? false;

      ctx.beginPath();
      ctx.strokeStyle = isBot ? 'rgba(107, 114, 128, 0.3)' : playerColor(userId);
      ctx.lineWidth = isBot ? 1 : 1.5;
      ctx.globalAlpha = isBot ? 0.4 : 0.8;

      if (isBot) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);

      ctx.moveTo(points[0]!.px, points[0]!.py);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i]!.px, points[i]!.py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    }

    /* Draw event markers */
    markerPositionsRef.current = markers;
    for (const { event, px, py } of markers) {
      drawMarker(ctx, event, px, py);
    }
  }, [mapConfig, matchData, currentTime, showBotPaths]);

  useEffect(() => { drawFrame(); }, [drawFrame]);

  /* Hover hit-testing */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const hitRadius = 12;
    const hit = markerPositionsRef.current.find(
      m => Math.abs(m.px - mx) < hitRadius && Math.abs(m.py - my) < hitRadius
    );

    onHoverEvent(hit?.event ?? null, e.clientX, e.clientY);
  }, [onHoverEvent]);

  const handleMouseLeave = useCallback(() => {
    onHoverEvent(null, 0, 0);
  }, [onHoverEvent]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain cursor-crosshair"
      style={{ imageRendering: 'auto', maxWidth: CANVAS_SIZE, maxHeight: CANVAS_SIZE }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}

/* Draw distinct markers per event type */
function drawMarker(ctx: CanvasRenderingContext2D, event: PlayerEvent, px: number, py: number) {
  const color = eventColor(event.event);
  const size = 5;

  ctx.save();
  ctx.translate(px, py);

  switch (event.event) {
    case 'Kill':
    case 'BotKill': {
      /* Red crosshair */
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size, 0); ctx.lineTo(size, 0);
      ctx.moveTo(0, -size); ctx.lineTo(0, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'Killed':
    case 'BotKilled': {
      /* Grey skull shape — simplified as X with dot */
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size, -size); ctx.lineTo(size, size);
      ctx.moveTo(size, -size); ctx.lineTo(-size, size);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'KilledByStorm': {
      /* Cyan diamond */
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'Loot': {
      /* Yellow square */
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(-size * 0.6, -size * 0.6, size * 1.2, size * 1.2);
      ctx.globalAlpha = 1;
      break;
    }
  }

  ctx.restore();
}
