import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { prisma } from '@/prisma/prisma';

export async function findRelevantFinance(query: string, userId?: string | null, limit = 3, ticker?: string | null,) {
  // Turning the user's question into a vector 
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // Format for pgvector [0.1, 0.2...]
  const vectorString = `[${embedding.join(',')}]`;

  const results = await prisma.$queryRaw`
    SELECT id, content, metadata, ticker,
    1 - (embedding <=> ${vectorString}::vector) as similarity
    FROM "FinancialInsight"
    WHERE (1 - (embedding <=> ${vectorString}::vector) > 0.5)
      AND ("userId" = ${userId} OR ${userId} IS NULL)
      AND ("ticker" = ${ticker?.toUpperCase()} OR ${ticker} IS NULL)
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return results;
}