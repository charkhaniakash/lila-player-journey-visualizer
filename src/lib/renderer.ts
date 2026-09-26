import type { EventType } from './types';

/* Consistent color for each player based on user_id hash */
export function playerColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue}, 75%, 60%)`;
}

/* Event type → marker color */
export function eventColor(event: EventType): string {
  switch (event) {
    case 'Kill':
    case 'BotKill':
      return '#ef4444';
    case 'Killed':
    case 'BotKilled':
      return '#9ca3af';
    case 'KilledByStorm':
      return '#22d3ee';
    case 'Loot':
      return '#facc15';
    default:
      return '#ffffff';
  }
}

/* Whether a given event type is a movement event */
export function isMovementEvent(event: EventType): boolean {
  return event === 'Position' || event === 'BotPosition';
}

/* Whether a given event type is combat/item (marker-worthy) */
export function isMarkerEvent(event: EventType): boolean {
  return !isMovementEvent(event);
}
