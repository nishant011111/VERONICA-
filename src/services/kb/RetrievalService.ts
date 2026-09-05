import { vectorStore } from './VectorStore';
import { embeddingService } from './EmbeddingService';
import { KnowledgeSourceScope } from '../../types';

export class RetrievalService {
  /**
   * Calculates cosine similarity between two vectors.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Retrieves relevant chunks based on a query.
   */
  async retrieve(
    query: string,
    userId: string,
    scope: KnowledgeSourceScope,
    scopeIds: string[], // documentIds or subjectIds depending on scope
    apiKey?: string,
    limit = 5
  ): Promise<{ content: string; pageNumber?: number; documentId: string; score: number }[]> {
    // 1. Get embedding for the query
    const queryEmbedding = await embeddingService.generateEmbedding(query, apiKey);

    // 2. Fetch all candidate chunks based on scope
    let allChunks = await vectorStore.getAllUserChunks(userId);

    if (scope === 'document') {
      allChunks = allChunks.filter(c => scopeIds.includes(c.documentId));
    } else if (scope === 'documents') {
      allChunks = allChunks.filter(c => scopeIds.includes(c.documentId));
    }
    // For subject scope, we'd need to filter by document's subjectId.
    // For simplicity, we can fetch all docs, map to their chunks.
    if (scope === 'subject') {
      const allDocs = await vectorStore.getUserDocuments(userId);
      const allowedDocIds = allDocs.filter(d => scopeIds.includes(d.subjectId!)).map(d => d.id);
      allChunks = allChunks.filter(c => allowedDocIds.includes(c.documentId));
    }

    // 3. Calculate similarity scores
    const scoredChunks = allChunks.map(chunk => ({
      chunk,
      score: this.cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // 4. Also perform basic keyword matching as a hybrid approach
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
    for (const item of scoredChunks) {
      const contentLower = item.chunk.content.toLowerCase();
      let keywordScore = 0;
      for (const kw of keywords) {
        if (contentLower.includes(kw)) {
          keywordScore += 0.05; // boost for keyword match
        }
      }
      item.score += keywordScore;
    }

    // 5. Sort by score descending and take top N
    scoredChunks.sort((a, b) => b.score - a.score);
    const topResults = scoredChunks.slice(0, limit);

    return topResults.map(res => ({
      content: res.chunk.content,
      pageNumber: res.chunk.pageNumber,
      documentId: res.chunk.documentId,
      score: res.score,
    }));
  }
}

export const retrievalService = new RetrievalService();
