export class EmbeddingService {
  /**
   * Calls the backend API to generate an embedding for the given text.
   */
  async generateEmbedding(text: string, apiKey?: string): Promise<number[]> {
    const response = await fetch('/api/ai/embed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, apiKey }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate embedding');
    }

    const data = await response.json();
    return data.embedding;
  }
}

export const embeddingService = new EmbeddingService();
