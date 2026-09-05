import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Brain, FileText, Settings, Trash2, CheckCircle2, AlertCircle, RefreshCw, Plus, Clock, Cpu } from 'lucide-react';

export const KnowledgeBaseDashboard: React.FC = () => {
  const { vaultFiles, kbDocuments, indexDocument, removeDocumentFromIndex } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="glass-panel p-6 rounded-3xl border border-neutral-800 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Private Knowledge Base</h3>
          </div>
          <p className="text-xs text-neutral-400 max-w-xl">
            Documents indexed here can be queried by Veronica. Indexing uses AI to extract, chunk, and embed the knowledge. 
            All processing is private and explicitly initiated by you.
          </p>
        </div>
        
        <div className="glass-panel p-6 rounded-3xl border border-neutral-800 flex flex-col justify-center min-w-[200px]">
          <span className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Status</span>
          <div className="text-2xl font-black text-white">{kbDocuments.length}</div>
          <span className="text-[10px] text-neutral-400">Indexed Documents</span>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Available Documents</h4>
        {vaultFiles.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="Vault is Empty"
            description="Upload documents to your Vault first, then index them here."
          />
        ) : (
          <div className="space-y-3">
            {vaultFiles.map(file => {
              const kbDoc = kbDocuments.find(d => d.vaultFileId === file.id);
              const isIndexed = kbDoc?.status === 'indexed';
              const isProcessing = kbDoc?.status === 'processing';
              const isFailed = kbDoc?.status === 'failed';

              return (
                <Card key={file.id} glass className="p-4 flex items-center justify-between border border-neutral-800 hover:border-neutral-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {file.name}
                        {isIndexed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        {isProcessing && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                        {isFailed && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {file.storageSource.toUpperCase()} • {file.type || 'PDF'}
                        {isIndexed && kbDoc && ` • ${kbDoc.chunkCount} chunks • Indexed ${new Date(kbDoc.lastIndexedAt || '').toLocaleDateString()}`}
                        {isProcessing && kbDoc && ` • Progress: ${kbDoc.processingProgress || 0}%`}
                        {isFailed && kbDoc && ` • ${kbDoc.error}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isIndexed ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                        onClick={() => {
                          if (window.confirm('Remove this document from Knowledge Base? This does not delete the original file.')) {
                            removeDocumentFromIndex(file.id);
                          }
                        }}
                      >
                        Remove Index
                      </Button>
                    ) : isProcessing ? (
                      <Badge variant="indigo">Processing...</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Cpu className="w-3.5 h-3.5" />}
                        onClick={() => indexDocument(file.id, file.subjectId, file.fileData, file.mimeType)}
                      >
                        Index for Veronica
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
