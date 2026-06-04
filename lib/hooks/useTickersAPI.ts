import { useState, useCallback } from 'react';
import type { Ticker } from '@/types';

export function useTickersAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTicker = useCallback(
    async (symbol: string): Promise<Ticker> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/tickers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create ticker');
        }

        return response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create ticker';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteTicker = useCallback(
    async (ticker: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tickers/${ticker}`, {
          method: 'DELETE',
        });

        if (!response.ok && response.status !== 404) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete ticker');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete ticker';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { createTicker, deleteTicker, isLoading, error };
}
