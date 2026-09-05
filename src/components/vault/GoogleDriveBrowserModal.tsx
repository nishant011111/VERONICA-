import React, { useState, useEffect } from 'react';
import { GoogleDriveService, GoogleDriveFile } from '../../services/googleDriveService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  X,
  FolderLock,
  Folder,
  FileText,
  Upload,
  FolderPlus,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Download,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface GoogleDriveBrowserModalProps {
  token: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onImportFileToVault: (file: GoogleDriveFile, blob?: Blob) => void;
  onClose: () => void;
}

export const GoogleDriveBrowserModal: React.FC<GoogleDriveBrowserModalProps> = ({
  token,
  onConnect,
  onDisconnect,
  onImportFileToVault,
  onClose,
}) => {
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'My Drive' },
  ]);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadDriveFiles(currentFolderId, searchQuery);
    }
  }, [token, currentFolderId, searchQuery]);

  const loadDriveFiles = async (folderId: string, search: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await GoogleDriveService.listFiles(folderId, search);
      setDriveFiles(res.files);
      setIsReadOnly(res.readOnly);
    } catch (e: any) {
      console.warn('Drive list files error:', e);
      setErrorMsg(e.message || 'Failed to load Google Drive files.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateFolder = (folder: GoogleDriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const nextPath = folderPath.slice(0, index + 1);
    setFolderPath(nextPath);
    setCurrentFolderId(nextPath[nextPath.length - 1].id);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      setLoading(true);
      await GoogleDriveService.createFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setShowCreateFolder(false);
      await loadDriveFiles(currentFolderId, searchQuery);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create folder on Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadProgress(10);
      const uploaded = await GoogleDriveService.uploadFile(
        file,
        currentFolderId,
        (progress) => setUploadProgress(progress)
      );
      setUploadProgress(null);
      await loadDriveFiles(currentFolderId, searchQuery);
      onImportFileToVault(uploaded);
    } catch (e: any) {
      setUploadProgress(null);
      setErrorMsg(e.message || 'File upload to Google Drive failed');
    }
  };

  const handleDeleteDriveFile = async (file: GoogleDriveFile) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}"?\n\nThis will delete the actual Google Drive file.`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await GoogleDriveService.deleteFile(file.id);
      await loadDriveFiles(currentFolderId, searchQuery);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to delete file from Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToVault = async (file: GoogleDriveFile) => {
    try {
      setLoading(true);
      const blob = await GoogleDriveService.downloadFileBlob(file.id);
      onImportFileToVault(file, blob);
    } catch (e: any) {
      onImportFileToVault(file);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Google Drive Vault Sync
                {token && <Badge variant="emerald">Connected</Badge>}
              </h3>
              <p className="text-xs text-neutral-400">Direct academic document integration</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authorization Explanation / Connect Screen */}
        {!token ? (
          <div className="p-8 text-center space-y-5 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl my-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h4 className="text-lg font-bold text-white">Connect Your Google Drive</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Connect your Google Drive account using secure Google OAuth to access, save, and manage your lecture slides, eBooks, and assignments in Veronica.
              </p>
            </div>

            {/* Requested Scope Explanation */}
            <div className="max-w-md mx-auto p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-left space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                🔒 Minimal Permission Scope Requested
              </span>
              <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">drive.file</strong>: Access only files created or explicitly opened with Veronica.</li>
                <li><strong className="text-white">drive.readonly</strong>: View document metadata to list study folders.</li>
              </ul>
              <p className="text-[11px] text-neutral-400 pt-1">
                Veronica does not alter or scan unselected Google Drive files. Your data remains strictly your property.
              </p>
            </div>

            <Button variant="primary" size="lg" onClick={onConnect} icon={<FolderLock className="w-5 h-5" />}>
              Authorize Google Drive Connection
            </Button>
          </div>
        ) : (
          <>
            {/* Connected Toolbar & Path */}
            <div className="space-y-3 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800/80">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono text-neutral-300 py-1">
                  {folderPath.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />}
                      <button
                        onClick={() => handleBreadcrumbClick(idx)}
                        className={`hover:text-emerald-400 transition-colors whitespace-nowrap ${
                          idx === folderPath.length - 1 ? 'font-bold text-emerald-400' : 'text-neutral-400'
                        }`}
                      >
                        {item.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                    <span className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </span>
                  </label>

                  <button
                    onClick={() => setShowCreateFolder(!showCreateFolder)}
                    className="p-1.5 bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs transition-colors"
                    title="New Folder"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => loadDriveFiles(currentFolderId, searchQuery)}
                    className="p-1.5 bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={onDisconnect}
                    className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-500/20 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Create folder form */}
              {showCreateFolder && (
                <form onSubmit={handleCreateFolder} className="flex gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <input
                    type="text"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <Button type="submit" variant="primary" size="sm">Create</Button>
                </form>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Google Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Read Only Notice */}
              {isReadOnly && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 font-mono">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Read-Only mode: Authorized permissions permit viewing and caching files to Vault.</span>
                </div>
              )}

              {uploadProgress !== null && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center justify-between">
                  <span>Uploading to Google Drive... {uploadProgress}%</span>
                  <div className="w-24 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* File List */}
            <div className="flex-1 overflow-auto space-y-2 pr-1">
              {loading ? (
                <div className="text-center py-12 text-xs text-neutral-400">Loading Google Drive content...</div>
              ) : driveFiles.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">This folder is empty.</div>
              ) : (
                driveFiles.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  return (
                    <div
                      key={file.id}
                      className="p-3 bg-neutral-900/40 border border-neutral-800/60 hover:border-neutral-700 rounded-2xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div
                        onClick={() => isFolder && handleNavigateFolder(file)}
                        className={`flex items-center gap-3 min-w-0 flex-1 ${isFolder ? 'cursor-pointer' : ''}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isFolder ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isFolder ? <Folder className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{file.name}</h4>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            {isFolder ? 'Folder' : file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : 'Google Doc'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isFolder && (
                          <button
                            onClick={() => handleSaveToVault(file)}
                            className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" /> Save to Vault
                          </button>
                        )}

                        {file.capabilities?.canDelete !== false && (
                          <button
                            onClick={() => handleDeleteDriveFile(file)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
