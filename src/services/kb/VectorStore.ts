import { openDB, IDBPDatabase } from 'idb';
import { KnowledgeBaseDocument, DocumentChunk } from '../../types';

interface EmbeddedChunk extends DocumentChunk {
  embedding: number[];
}

interface KBDatabase extends IDBPDatabase {
  // We don't strictly type the DB schema here for simplicity,
  // we use standard methods
}

const DB_NAME = 'veronica-kb-store';
const DB_VERSION = 1;

export class VectorStore {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('userId', 'userId');
          docStore.createIndex('vaultFileId', 'vaultFileId');
        }
        if (!db.objectStoreNames.contains('chunks')) {
          const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' });
          chunkStore.createIndex('userId', 'userId');
          chunkStore.createIndex('documentId', 'documentId');
        }
      },
    });
  }

  async saveDocument(doc: KnowledgeBaseDocument): Promise<void> {
    const db = await this.dbPromise;
    await db.put('documents', doc);
  }

  async getDocument(id: string): Promise<KnowledgeBaseDocument | undefined> {
    const db = await this.dbPromise;
    return db.get('documents', id);
  }

  async getDocumentByVaultFileId(vaultFileId: string): Promise<KnowledgeBaseDocument | undefined> {
    const db = await this.dbPromise;
    const index = db.transaction('documents').store.index('vaultFileId');
    return index.get(vaultFileId);
  }

  async getUserDocuments(userId: string): Promise<KnowledgeBaseDocument[]> {
    const db = await this.dbPromise;
    const index = db.transaction('documents').store.index('userId');
    return index.getAll(userId);
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('documents', id);
    // Delete associated chunks
    const tx = db.transaction('chunks', 'readwrite');
    const index = tx.store.index('documentId');
    const keys = await index.getAllKeys(id);
    for (const key of keys) {
      await tx.store.delete(key);
    }
    await tx.done;
  }

  async saveChunks(chunks: EmbeddedChunk[]): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('chunks', 'readwrite');
    for (const chunk of chunks) {
      await tx.store.put(chunk);
    }
    await tx.done;
  }

  async getChunksByDocumentId(documentId: string): Promise<EmbeddedChunk[]> {
    const db = await this.dbPromise;
    const index = db.transaction('chunks').store.index('documentId');
    return index.getAll(documentId);
  }

  async getAllUserChunks(userId: string): Promise<EmbeddedChunk[]> {
    const db = await this.dbPromise;
    const index = db.transaction('chunks').store.index('userId');
    return index.getAll(userId);
  }
}

export const vectorStore = new VectorStore();
