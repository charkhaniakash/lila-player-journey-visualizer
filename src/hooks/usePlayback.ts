import { useState, useRef, useCallback, useEffect } from 'react';

interface UsePlaybackResult {
  readonly currentTime: number;
  readonly isPlaying: boolean;
  readonly speed: number;
  readonly setCurrentTime: (t: number) => void;
  readonly play: () => void;
  readonly pause: () => void;
  readonly togglePlay: () => void;
  readonly setSpeed: (s: number) => void;
  readonly reset: () => void;
}

export function usePlayback(durationS: number): UsePlaybackResult {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const lastFrameRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const reset = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying || durationS <= 0) return;

    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      setCurrentTime(prev => {
        const next = prev + delta * speed;
        if (next >= durationS) {
          setIsPlaying(false);
          return durationS;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, speed, durationS]);

  return { currentTime, isPlaying, speed, setCurrentTime, play, pause, togglePlay, setSpeed, reset };
}
