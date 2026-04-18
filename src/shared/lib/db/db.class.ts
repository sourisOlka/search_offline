import { FileItemType } from '../../model/types';
import { type PageVectorsType } from './types';

export class DB {
  private DB_NAME = 'VectorCacheDB';
  private STORE_FILES = 'pdfs';
  private STORE_EMBEDS = 'embeddings';
  private db: IDBDatabase | null = null;
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 2);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(this.STORE_FILES)) {
          db.createObjectStore(this.STORE_FILES, { keyPath: 'id' });
        }

        let embedStore;
        if (!db.objectStoreNames.contains(this.STORE_EMBEDS)) {
          embedStore = db.createObjectStore(this.STORE_EMBEDS, {
            keyPath: 'id',
            autoIncrement: true,
          });
        } else {
          embedStore = request.transaction!.objectStore(this.STORE_EMBEDS);
        }

        if (!embedStore.indexNames.contains('pdf_id')) {
          embedStore.createIndex('pdf_id', 'pdf_id', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }
  async getAllPdfs(): Promise<FileItemType[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_FILES, 'readonly');
      const store = transaction.objectStore(this.STORE_FILES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.initDB();

    const transaction = db.transaction(
      [this.STORE_FILES, this.STORE_EMBEDS],
      'readwrite',
    );

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('Все данные успешно удалены');
        resolve();
      };

      transaction.onerror = () => reject(transaction.error);

      const fileStore = transaction.objectStore(this.STORE_FILES);
      const embedStore = transaction.objectStore(this.STORE_EMBEDS);

      fileStore.clear();
      embedStore.clear();
    });
  }
  async deletePdfById(id: string): Promise<void> {
    const db = await this.initDB();

    const transaction = db.transaction(
      [this.STORE_FILES, this.STORE_EMBEDS],
      'readwrite',
    );

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      const fileStore = transaction.objectStore(this.STORE_FILES);
      const embedStore = transaction.objectStore(this.STORE_EMBEDS);

      fileStore.delete(id);

      const index = embedStore.index('pdf_id');
      const range = IDBKeyRange.only(id);
      const cursorRequest = index.openKeyCursor(range);

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          embedStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
    });
  }
  async getAllEmbeddings(): Promise<any[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_EMBEDS, 'readonly');
      const store = transaction.objectStore(this.STORE_EMBEDS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async saveFilesData(
    filesVectors: (FileItemType & { vectors: PageVectorsType[] })[],
  ): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(
      [this.STORE_FILES, this.STORE_EMBEDS],
      'readwrite',
    );

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Транзакция прервана'));

      const fileStore = transaction.objectStore(this.STORE_FILES);
      const embedStore = transaction.objectStore(this.STORE_EMBEDS);

      for (const file of filesVectors) {
        fileStore.put({
          id: file.id,
          name: file.name,
        });

        for (const pageData of file.vectors) {
          embedStore.put({
            pdf_id: file.id,
            ...pageData,
          });
        }
      }
    });
  }
}
