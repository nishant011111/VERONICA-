// IndexedDB Service for local offline file storage in Veronica Vault

const DB_NAME = 'veronica_vault_db';
const DB_VERSION = 1;
const STORE_NAME = 'vault_blobs';

class VaultIndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          reject(new Error('IndexedDB is not supported in this environment.'));
          return;
        }
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  // Save blob or base64 data to IndexedDB
  async saveBlob(fileId: string, blobData: Blob | string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(blobData, fileId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB save failed, falling back to memory/storage', e);
    }
  }

  // Retrieve blob or string from IndexedDB
  async getBlob(fileId: string): Promise<Blob | string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(fileId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB read failed', e);
      return null;
    }
  }

  // Delete blob from IndexedDB
  async deleteBlob(fileId: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(fileId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB delete failed', e);
    }
  }

  // Calculate actual total local storage used by saved blobs
  async getTotalStorageUsage(): Promise<number> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        let totalBytes = 0;
        const req = store.openCursor();
        req.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const val = cursor.value;
            if (val instanceof Blob) {
              totalBytes += val.size;
            } else if (typeof val === 'string') {
              totalBytes += val.length;
            }
            cursor.continue();
          } else {
            resolve(totalBytes);
          }
        };
        req.onerror = () => resolve(0);
      });
    } catch (e) {
      return 0;
    }
  }

  // Clear all cached local blobs
  async clearAllBlobs(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch (e) {
      console.warn('IndexedDB clear failed', e);
    }
  }
}

export const vaultIndexedDB = new VaultIndexedDBService();
