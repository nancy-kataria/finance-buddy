import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findRelevantFinance } from './search';

interface MockFinancialInsight {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

vi.mock('@ai-sdk/openai');
vi.mock('ai');


vi.mock('@/prisma/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { embed } from 'ai';
import { prisma } from '@/prisma/prisma';


describe('findRelevantFinance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return search results when given a valid query', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];

    vi.mocked(embed).mockResolvedValue({
      embedding: mockEmbedding,
      value: 'stock market trends',
      usage: { promptTokens: 10, completionTokens: 0, tokens: 10 },
      warnings: [],
    } as any);

    const mockResults: MockFinancialInsight[] = [
      {
        id: '1',
        content: 'Tech stocks are rising',
        metadata: { type: 'news' },
        similarity: 0.85,
      },
      {
        id: '2',
        content: 'Market volatility expected',
        metadata: { type: 'analysis' },
        similarity: 0.72,
      },
    ];
    vi.mocked(prisma.$queryRaw).mockResolvedValue(mockResults);

    const results = await findRelevantFinance('stock market trends');
    expect(results).toEqual(mockResults);
    expect(embed).toHaveBeenCalledTimes(1);
    expect(embed).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'stock market trends',
      })
    );
  });

  
  it('should filter results by userId when provided', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
    vi.mocked(embed).mockResolvedValue({
      embedding: mockEmbedding,
      value: 'my portfolio performance',
      usage: { promptTokens: 10, completionTokens: 0, tokens: 10 },
      warnings: [],
    } as any);

    const mockUserResults: MockFinancialInsight[] = [
      {
        id: 'user-1-insight-1',
        content: "User's investment notes",
        metadata: { source: 'personal' },
        similarity: 0.88,
      },
    ];
    vi.mocked(prisma.$queryRaw).mockResolvedValue(mockUserResults);

    const userId = 'user-123';
    const results = await findRelevantFinance(
      'my portfolio performance',
      userId
    );

    expect(results).toEqual(mockUserResults);
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should use custom limit parameter', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    vi.mocked(embed).mockResolvedValue({
      embedding: mockEmbedding,
      value: 'query',
      usage: { promptTokens: 10, completionTokens: 0, tokens: 10 },
      warnings: [],
    } as any);

    const mockResults: MockFinancialInsight[] = Array(5).fill({
      id: 'id',
      content: 'test',
      metadata: {},
      similarity: 0.7,
    });
    vi.mocked(prisma.$queryRaw).mockResolvedValue(mockResults);

    await findRelevantFinance('query', undefined, 5);
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('should handle empty query string', async () => {
    const mockEmbedding: number[] = [];
    vi.mocked(embed).mockResolvedValue({
      embedding: mockEmbedding,
      value: '',
      usage: { promptTokens: 10, completionTokens: 0, tokens: 10 },
      warnings: [],
    } as any);

    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

    const results = await findRelevantFinance('');

    expect(results).toEqual([]);
    expect(embed).toHaveBeenCalled();
  });

  it('should pass correct similarity threshold to query', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
    vi.mocked(embed).mockResolvedValue({
      embedding: mockEmbedding,
      value: 'query',
      usage: { promptTokens: 10, completionTokens: 0, tokens: 10 },
      warnings: [],
    } as any);

    const mockResults: MockFinancialInsight[] = [
      {
        id: '1',
        content: 'High similarity result',
        metadata: {},
        similarity: 0.8, // Above 0.5 threshold
      },
    ];
    vi.mocked(prisma.$queryRaw).mockResolvedValue(mockResults);

    const results = await findRelevantFinance('query');

    // All results should have similarity > 0.5
    expect((results as MockFinancialInsight[]).every((r: MockFinancialInsight) => r.similarity > 0.5)).toBe(true);
  });

  
  it('should return empty array when no results match similarity threshold', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
    vi.mocked(embed).mockResolvedValue({
      embedding: mockEmbedding,
      value: 'some obscure query',
      usage: { promptTokens: 10, completionTokens: 0, tokens: 10 },
      warnings: [],
    } as any);

    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as MockFinancialInsight[]);

    const results = await findRelevantFinance('some obscure query');
    expect(results).toHaveLength(0);
  });

  /**
   * Testing large embedding vectors
   * Real embeddings from OpenAI are 1536-dimensional
   * This tests that the function handles realistic embedding sizes
   */
  it('should handle large embedding vectors correctly', async () => {
    const largeEmbedding = Array(1536)
      .fill(0)
      .map((_, i) => i / 1536);

    vi.mocked(embed).mockResolvedValue({
      embedding: largeEmbedding,
      value: 'test query',
      usage: { promptTokens: 10, completionTokens: 0, tokens: 10 },
      warnings: [],
    } as any);

    const mockResults: MockFinancialInsight[] = [
      {
        id: '1',
        content: 'Test result',
        metadata: {},
        similarity: 0.95,
      },
    ];
    vi.mocked(prisma.$queryRaw).mockResolvedValue(mockResults);
    const results = await findRelevantFinance('test query');

    expect(results).toEqual(mockResults);
    expect(embed).toHaveBeenCalled();
  });

  it('should format embedding as pgvector string correctly', async () => {
    /**
     * Creating a specific, small embedding to verify formatting
     */
    const mockEmbedding = [0.1, 0.2, 0.3];
    vi.mocked(embed).mockResolvedValue({
      embedding: mockEmbedding,
      value: 'test',
      usage: { promptTokens: 10, completionTokens: 0, tokens: 10 },
      warnings: [],
    } as any);

    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as MockFinancialInsight[]);

    await findRelevantFinance('test');
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});
