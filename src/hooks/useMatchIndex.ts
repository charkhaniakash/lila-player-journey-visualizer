import { useState, useEffect } from 'react';
import type { MatchMetadata } from '../lib/types';
import { fetchMatchIndex } from '../lib/data';

interface UseMatchIndexResult {
  readonly matches: MatchMetadata[];
  readonly loading: boolean;
  readonly error: string | null;
}

export function useMatchIndex(): UseMatchIndexResult {
  const [matches, setMatches] = useState<MatchMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMatchIndex()
      .then(data => {
        if (!cancelled) {
          setMatches(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load match index');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  return { matches, loading, error };
}
