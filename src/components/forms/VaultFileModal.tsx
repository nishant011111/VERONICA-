import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Upload, HardDrive } from 'lucide-react';

interface VaultFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaultFileModal: React.FC<VaultFileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addVaultFile, subjects } = useApp();

  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [fileSize, setFileSize] = useState(1024 * 1024 * 2.5); // 2.5 MB default
  const [subjectId, setSubjectId] = useState('');
  const [storageSource, setStorageSource] = useState<'local' | 'cloud' | 'drive'>('local');

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      setFileType(ext);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    addVaultFile({
      name: fileName.trim(),
      size: fileSize,
      type: fileType,
      mimeType: fileType.toLowerCase() === 'pdf' ? 'application/pdf' : 'application/octet-stream',
      storageSource,
      subjectId: subjectId || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add File to Vault"
      subtitle="Local document store & academic PDF vault"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop / Select zone */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center bg-slate-100/50 dark:bg-slate-900/50 hover:border-blue-500 transition-colors cursor-pointer relative">
          <input
            type="file"
            onChange={handleLocalFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {fileName ? fileName : 'Click or drag a file to select for Vault'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports PDFs, DOCX, EPUB, TXT, Slides (Stored locally)
          </p>
        </div>

        <FormField label="Document Name" required>
          <input
            type="text"
            required
            placeholder="e.g., Lecture_04_Paging_And_Virtual_Memory.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Storage Source">
            <select
              value={storageSource}
              onChange={(e) => setStorageSource(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="local">Local Storage (Offline)</option>
              <option value="cloud" disabled>
                Veronica Cloud (Coming Step 2)
              </option>
              <option value="drive" disabled>
                Google Drive (Coming Step 2)
              </option>
            </select>
          </FormField>

          <FormField label="Subject Association">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- General Vault --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code ? `[${sub.code}] ` : ''}{sub.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save to Vault
          </Button>
        </div>
      </form>
    </Modal>
  );
};
