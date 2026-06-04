import { useEffect, useState, useCallback } from 'react';
import type { Ticker } from '@/types';

export interface FetchTickersResponse extends Ticker {
  notes?: any[];
}

export function useFetchTickersAPI() {
  const [tickers, setTickers] = useState<FetchTickersResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tickers');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tickers');
      }

      const data = await response.json();
      setTickers(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch tickers';
      setError(errorMessage);
      console.error('Error fetching tickers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickers();
  }, [fetchTickers]);

  return { tickers, isLoading, error, refetch: fetchTickers };
}
