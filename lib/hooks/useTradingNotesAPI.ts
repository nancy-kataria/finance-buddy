import { useState, useCallback } from 'react';
import type { TradingNote } from '@/types';

export function useTradingNotesAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNote = useCallback(
    async (ticker: string, content: string): Promise<TradingNote> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/trading-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, ticker }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create note');
        }

        return response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create note';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateNote = useCallback(
    async (noteId: string, content: string): Promise<TradingNote> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/trading-notes/${noteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update note');
        }

        return response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update note';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteNote = useCallback(async (noteId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/trading-notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete note';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createNote, updateNote, deleteNote, isLoading, error };
}
