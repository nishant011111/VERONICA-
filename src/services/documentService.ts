// DocumentService - AI Document Processing Preparation Interface for Veronica Vault
import { VaultFile } from '../types';
import { vaultIndexedDB } from './vaultIndexedDB';

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface PreparedAIDocument {
  fileId: string;
  fileName: string;
  preparedAt: string;
  pageCount: number;
  characterCount: number;
  snippet: string;
  readyForAI: boolean;
}

export class DocumentService {
  // Get document record metadata
  static async getDocument(fileId: string, vaultFiles: VaultFile[]): Promise<VaultFile | null> {
    return vaultFiles.find((f) => f.id === fileId) || null;
  }

  // Get raw metadata formatted for document analysis
  static async getMetadata(file: VaultFile): Promise<Record<string, any>> {
    return {
      fileId: file.id,
      name: file.name,
      sizeBytes: file.size,
      mimeType: file.mimeType,
      storageSource: file.storageSource,
      uploadedAt: file.uploadedAt,
      isOfflineAvailable: file.isOfflineAvailable,
      subjectId: file.subjectId || 'unassigned',
    };
  }

  // Extract raw text from local document or file blob
  static async extractText(file: VaultFile): Promise<string> {
    try {
      if (file.fileData && file.fileData.startsWith('data:text/')) {
        const base64Part = file.fileData.split(',')[1];
        if (base64Part) {
          return atob(base64Part);
        }
      }

      const cached = await vaultIndexedDB.getBlob(file.id);
      if (cached) {
        if (typeof cached === 'string') {
          return cached;
        } else if (cached instanceof Blob && cached.type.includes('text')) {
          return await cached.text();
        }
      }

      // Simulated clean text extraction placeholder for PDF structures
      return `[Text extracted from ${file.name}]\nDocument Title: ${file.name}\nSource: ${(file.storageSource || 'local').toUpperCase()}\nSize: ${file.size} bytes.`;
    } catch (e) {
      console.warn('Text extraction error', e);
      return `[Unable to extract text preview for ${file.name}]`;
    }
  }

  // Extract paginated text blocks
  static async getPages(file: VaultFile): Promise<ExtractedPage[]> {
    const fullText = await this.extractText(file);
    const paragraphs = fullText.split('\n\n').filter(Boolean);
    
    if (paragraphs.length === 0) {
      return [{ pageNumber: 1, text: fullText }];
    }

    return paragraphs.map((p, index) => ({
      pageNumber: index + 1,
      text: p,
    }));
  }

  /**
   * IMPORTANT: prepareForAI() does NOT automatically send anything to an AI provider.
   * It only extracts local text structure & metadata to prepare for explicit user action
   * ("Ask Veronica about this PDF") in Step 5.
   */
  static async prepareForAI(file: VaultFile): Promise<PreparedAIDocument> {
    const text = await this.extractText(file);
    const pages = await this.getPages(file);

    return {
      fileId: file.id,
      fileName: file.name,
      preparedAt: new Date().toISOString(),
      pageCount: pages.length,
      characterCount: text.length,
      snippet: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
      readyForAI: true,
    };
  }
}
