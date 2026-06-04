import { useState, useCallback } from 'react';

export interface IngestResponse {
  success: boolean;
  message: string;
  chunksCreated: number;
}

export function useIngestAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingestNote = useCallback(
    async (
      content: string,
      ticker: string,
      noteId: string
    ): Promise<IngestResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            ticker,
            noteId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to ingest note');
        }

        return response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to ingest note';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { ingestNote, isLoading, error };
}
