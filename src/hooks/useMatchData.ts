import { useState, useEffect } from 'react';
import type { MatchData } from '../lib/types';
import { fetchMatchData } from '../lib/data';

interface UseMatchDataResult {
  readonly data: MatchData | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export function useMatchData(matchId: string | null): UseMatchDataResult {
  const [data, setData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMatchData(matchId)
      .then(result => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load match');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [matchId]);

  return { data, loading, error };
}
