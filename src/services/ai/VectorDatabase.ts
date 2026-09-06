import { openDB, IDBPDatabase } from 'idb';

export interface VectorRecord {
  id: string; // Unique ID
  text: string; // Original text chunk
  embedding: number[]; // Vector
  metadata: {
    type: 'message' | 'memory' | 'conversation';
    conversationId?: string;
    sender?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export class VectorDatabase {
  private dbPromise: Promise<IDBPDatabase<any>>;

  constructor() {
    this.dbPromise = openDB('veronica_vector_db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('vectors')) {
          db.createObjectStore('vectors', { keyPath: 'id' });
        }
      },
    });
  }

  async upsert(record: VectorRecord): Promise<void> {
    const db = await this.dbPromise;
    await db.put('vectors', record);
  }

  async delete(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('vectors', id);
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('vectors');
  }

  async getAll(): Promise<VectorRecord[]> {
    const db = await this.dbPromise;
    return await db.getAll('vectors');
  }

  async search(queryEmbedding: number[], filterType?: string, limit: number = 5): Promise<(VectorRecord & { score: number })[]> {
    const records = await this.getAll();
    
    let filtered = records;
    if (filterType) {
      filtered = records.filter(r => r.metadata?.type === filterType);
    }

    const scored = filtered.map(record => {
      const score = this.cosineSimilarity(queryEmbedding, record.embedding);
      return { ...record, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) return 0;
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
}

export const vectorDB = new VectorDatabase();
