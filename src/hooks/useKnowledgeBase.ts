import { useState, useEffect, useCallback } from 'react';
import { KnowledgeBaseDocument } from '../types';
import { vectorStore } from '../services/kb/VectorStore';
import { documentProcessor } from '../services/kb/DocumentProcessor';
import { embeddingService } from '../services/kb/EmbeddingService';

export const useKnowledgeBase = (userId: string, geminiApiKey?: string) => {
  const [kbDocuments, setKbDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshDocuments = useCallback(async () => {
    if (!userId) return;
    setIsRefreshing(true);
    try {
      const docs = await vectorStore.getUserDocuments(userId);
      setKbDocuments(docs);
    } catch (err) {
      console.error('Failed to load KB docs:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const indexDocument = async (vaultFileId: string, subjectId?: string, fileData?: string, mimeType?: string) => {
    if (!userId || !fileData || !mimeType) return;
    
    const docId = `kb_${vaultFileId}`;
    const newDoc: KnowledgeBaseDocument = {
      id: docId,
      userId,
      vaultFileId,
      subjectId,
      status: 'processing',
      chunkCount: 0,
      processingProgress: 0,
    };
    await vectorStore.saveDocument(newDoc);
    await refreshDocuments();

    try {
      const updateProgress = async (progress: number) => {
        newDoc.processingProgress = progress;
        await vectorStore.saveDocument(newDoc);
        setKbDocuments(prev => prev.map(d => d.id === docId ? { ...newDoc } : d));
      };

      await updateProgress(10);
      const { pages } = await documentProcessor.extractText(fileData, mimeType);
      
      await updateProgress(40);
      
      const chunks = documentProcessor.chunkText(pages);
      await updateProgress(60);

      const embeddedChunks = [];
      let i = 0;
      for (const chunk of chunks) {
        const embedding = await embeddingService.generateEmbedding(chunk.content, geminiApiKey);
        embeddedChunks.push({
          id: `chunk_${docId}_${i}`,
          userId,
          documentId: docId,
          vaultFileId,
          content: chunk.content,
          pageNumber: chunk.pageNumber,
          embedding,
        });
        i++;
        await updateProgress(60 + Math.round((i / chunks.length) * 30));
      }

      await vectorStore.saveChunks(embeddedChunks);
      
      newDoc.status = 'indexed';
      newDoc.chunkCount = embeddedChunks.length;
      newDoc.lastIndexedAt = new Date().toISOString();
      newDoc.processingProgress = 100;
      await vectorStore.saveDocument(newDoc);
      await refreshDocuments();

    } catch (err: any) {
      console.error('Indexing error:', err);
      newDoc.status = 'failed';
      newDoc.error = err.message || 'Unknown error during indexing';
      newDoc.processingProgress = 0;
      await vectorStore.saveDocument(newDoc);
      await refreshDocuments();
    }
  };

  const removeDocument = async (vaultFileId: string) => {
    const docId = `kb_${vaultFileId}`;
    await vectorStore.deleteDocument(docId);
    await refreshDocuments();
  };

  return {
    kbDocuments,
    isRefreshing,
    indexDocument,
    removeDocument,
    refreshDocuments,
  };
};
