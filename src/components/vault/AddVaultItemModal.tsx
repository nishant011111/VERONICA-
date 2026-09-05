import React, { useState } from 'react';
import { Subject } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  X,
  Upload,
  HardDrive,
  Cloud,
  FolderLock,
  FolderPlus,
  FileText,
  AlertCircle
} from 'lucide-react';

interface AddVaultItemModalProps {
  subjects: Subject[];
  existingFiles: { name: string }[];
  onAddFile: (file: {
    name: string;
    size: number;
    type: string;
    mimeType: string;
    storageSource: 'local' | 'cloud' | 'drive';
    subjectId?: string;
    fileData?: string;
    isOfflineAvailable?: boolean;
  }) => void;
  onAddFolder: (folder: {
    name: string;
    storageSource: 'local' | 'cloud' | 'drive';
  }) => void;
  onClose: () => void;
  onDuplicateDetected: (fileName: string, pendingFile: any) => void;
}

export const AddVaultItemModal: React.FC<AddVaultItemModalProps> = ({
  subjects,
  existingFiles,
  onAddFile,
  onAddFolder,
  onClose,
  onDuplicateDetected,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'folder'>('upload');
  const [storageSource, setStorageSource] = useState<'local' | 'cloud' | 'drive'>('local');
  const [subjectId, setSubjectId] = useState<string>('');
  const [folderName, setFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const isDuplicate = existingFiles.some(
      (f) => f.name.toLowerCase() === selectedFile.name.toLowerCase()
    );

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
    let type = 'other';
    if (ext === 'pdf') type = 'pdf';
    else if (['doc', 'docx', 'txt', 'md'].includes(ext)) type = 'document';
    else if (['jpg', 'png', 'webp', 'svg'].includes(ext)) type = 'image';

    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result as string;
      const fileObj = {
        name: selectedFile.name,
        size: selectedFile.size,
        type,
        mimeType: selectedFile.type || 'application/octet-stream',
        storageSource,
        subjectId: subjectId || undefined,
        fileData,
        isOfflineAvailable: storageSource === 'local',
      };

      if (isDuplicate) {
        onDuplicateDetected(selectedFile.name, fileObj);
      } else {
        onAddFile(fileObj);
        onClose();
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onAddFolder({
      name: folderName.trim(),
      storageSource,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Upload Material
            </button>
            <button
              onClick={() => setActiveTab('folder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'folder'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              New Folder
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Storage Location Selector */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-400 font-mono">Target Storage Provider</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setStorageSource('local')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                storageSource === 'local'
                  ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-bold'
                  : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <HardDrive className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono">💻 Local</span>
            </button>

            <button
              type="button"
              onClick={() => setStorageSource('cloud')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                storageSource === 'cloud'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold'
                  : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Cloud className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono">☁ Cloud</span>
            </button>

            <button
              type="button"
              onClick={() => setStorageSource('drive')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1.5 ${
                storageSource === 'drive'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                  : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <FolderLock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono">G Drive</span>
            </button>
          </div>
        </div>

        {activeTab === 'upload' ? (
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* Drag & Drop File Upload Box */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950'
              }`}
            >
              <input
                type="file"
                id="vault-file-input"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="vault-file-input" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>

                {selectedFile ? (
                  <div>
                    <p className="text-xs font-bold text-white font-mono break-all">{selectedFile.name}</p>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-white">Choose file or drag & drop</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">PDFs, eBooks, Documents, Slides, Text</p>
                  </div>
                )}
              </label>
            </div>

            {/* Subject Selector */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-mono">Link to Subject (Optional)</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white p-3 rounded-2xl focus:outline-none focus:border-indigo-500"
              >
                <option value="">General Vault Material</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                disabled={!selectedFile}
                icon={<Upload className="w-4 h-4" />}
              >
                Save File to Vault
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFolderSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 font-mono">Folder Name</label>
              <input
                type="text"
                placeholder="e.g., Chapter 1 Notes, Past Exams..."
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white p-3 rounded-2xl focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                disabled={!folderName.trim()}
                icon={<FolderPlus className="w-4 h-4" />}
              >
                Create Folder
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
