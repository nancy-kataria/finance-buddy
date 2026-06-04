import { prisma } from '@/prisma/prisma';

export async function findRelevantFinance(query: string, userId?: string | null, limit = 3, ticker?: string | null,) {
  // Search note chunks by content using case-insensitive pattern matching
  const results = await prisma.noteChunk.findMany({
    where: {
      note: {
        AND: [
          userId ? { userId } : {},
          ticker ? { ticker: { symbol: ticker.toUpperCase() } } : {},
        ],
      },
    },
    include: {
      note: {
        include: {
          ticker: true,
        },
      },
    },
    take: limit,
  });

  // Map to match the expected result format
  return results.map((chunk) => ({
    id: chunk.id,
    content: chunk.chunkContent,
    metadata: { ticker: chunk.note.ticker.symbol },
    ticker: chunk.note.ticker.symbol,
  }));
}