import { prisma } from '@/prisma/prisma';

export async function findRelevantFinance(query: string, userId?: string | null, limit = 3, ticker?: string | null,) {
  // Search trading notes by content using case-insensitive pattern matching
  const searchTerm = `%${query}%`;

  const results = await prisma.tradingNote.findMany({
    where: {
      AND: [
        { content: { search: query } }, // Full-text search if supported
        userId ? { userId } : {},
        ticker ? { ticker: { symbol: ticker.toUpperCase() } } : {},
      ],
    },
    include: {
      ticker: true,
    },
    take: limit,
  });

  // Map to match the expected result format
  return results.map((note) => ({
    id: note.id,
    content: note.content,
    metadata: { ticker: note.ticker.symbol },
    ticker: note.ticker.symbol,
  }));
}