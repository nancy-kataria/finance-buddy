import { useEffect, useState, useCallback } from 'react';
import type { TradingNote } from '@/types';

export function useFetchNotesAPI(tickerId?: string) {
  const [notes, setNotes] = useState<TradingNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL('/api/trading-notes', window.location.origin);
      if (tickerId) {
        url.searchParams.append('tickerId', tickerId);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch notes');
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch notes';
      setError(errorMessage);
      console.error('Error fetching notes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tickerId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { notes, isLoading, error, refetch: fetchNotes };
}
