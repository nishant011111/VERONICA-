import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VaultFile, VaultFolder, Subject } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { EditSubjectModal } from '../forms/EditSubjectModal';
import { AddVaultItemModal } from '../vault/AddVaultItemModal';
import { PdfViewerModal } from '../vault/PdfViewerModal';
import { FileInfoModal } from '../vault/FileInfoModal';
import { DuplicateFileDialog } from '../vault/DuplicateFileDialog';
import { VaultActivityModal } from '../vault/VaultActivityModal';
import { GoogleDriveBrowserModal } from '../vault/GoogleDriveBrowserModal';
import { KnowledgeBaseDashboard } from '../vault/KnowledgeBaseDashboard';
import { DocumentService } from '../../services/documentService';
import {
  FolderLock,
  Plus,
  HardDrive,
  Cloud,
  FileText,
  Trash2,
  AlertCircle,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Folder,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  History,
  Info,
  Edit2,
  MoveRight,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Edit3
} from 'lucide-react';

export const VaultScreen: React.FC = () => {
  const {
    vaultFiles,
    vaultFolders,
    vaultActivities,
    addVaultFile,
    updateVaultFile,
    deleteVaultFile,
    saveFileOffline,
    removeOfflineCopy,
    addVaultFolder,
    deleteVaultFolder,
    googleDriveToken,
    setGoogleDriveToken,
    connectGoogleDrive,
    disconnectGoogleDrive,
    clearVaultActivities,
    subjects,
    setActiveScreen,
    showToast,
  } = useApp();

  // Search & Filters state
  const [sourceFilter, setSourceFilter] = useState<'all' | 'local' | 'cloud' | 'drive'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [offlineOnly, setOfflineOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'recent' | 'oldest' | 'size'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'vault' | 'knowledge_base'>('vault');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Active File Inspectors
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<VaultFile | null>(null);
  const [selectedFileForInfo, setSelectedFileForInfo] = useState<VaultFile | null>(null);
  const [duplicateFileNotice, setDuplicateFileNotice] = useState<{ fileName: string; fileObj: any } | null>(null);
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<VaultFile | null>(null);

  const getSubject = (subjectId?: string) => subjects.find((s) => s.id === subjectId);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filtered Files
  const filteredFiles = vaultFiles.filter((f) => {
    if (sourceFilter !== 'all' && f.storageSource !== sourceFilter) return false;
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (offlineOnly && !f.isOfflineAvailable) return false;
    if (currentFolderId && f.folderId !== currentFolderId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchType = f.type.toLowerCase().includes(q);
      const matchSource = f.storageSource.toLowerCase().includes(q);
      return matchName || matchType || matchSource;
    }
    return true;
  });

  // Filtered Folders
  const filteredFolders = vaultFolders.filter((f) => {
    if (sourceFilter !== 'all' && f.storageSource !== sourceFilter) return false;
    if (currentFolderId && f.parentId !== currentFolderId) return false;
    if (!currentFolderId && f.parentId) return false;
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Sort Files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    if (sortBy === 'recent') return new Date(b.modifiedAt || b.uploadedAt).getTime() - new Date(a.modifiedAt || a.uploadedAt).getTime();
    if (sortBy === 'oldest') return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    if (sortBy === 'size') return b.size - a.size;
    return 0;
  });

  // Source Icon Helper
  const getSourceBadge = (source: 'local' | 'cloud' | 'drive') => {
    if (source === 'local') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md uppercase">
          <HardDrive className="w-3 h-3" /> 💻 Local
        </span>
      );
    }
    if (source === 'cloud') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md uppercase">
          <Cloud className="w-3 h-3" /> ☁ Cloud
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
        <FolderLock className="w-3 h-3" /> G Drive
      </span>
    );
  };

  // Ask Veronica about this PDF handler
  const handleAskVeronica = async (file: VaultFile) => {
    try {
      const prepared = await DocumentService.prepareForAI(file);
      showToast(`Document "${file.name}" prepared for AI analysis`, 'success');
      setActiveScreen('ask_veronica');
    } catch (e) {
      showToast('Failed to prepare document for AI', 'error');
    }
  };

  // Explicit confirmation for deleting file
  const handleDeleteWithConfirmation = (file: VaultFile) => {
    setConfirmDelete(file);
  };
  
  const executeDelete = () => {
    if (confirmDelete) {
      deleteVaultFile(confirmDelete.id);
      setConfirmDelete(null);
    }
  };
  
  const oldDelete = (f: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${f.name}" from ${(f.storageSource || 'local').toUpperCase()} storage?`
    );
    if (confirmed) {
      deleteVaultFile(f.id);
    }
  };

  // Rename File submit
  const handleSaveRename = (fileId: string) => {
    if (!renameInput.trim()) return;
    updateVaultFile(fileId, { name: renameInput.trim() });
    setRenamingFileId(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* View Mode Tabs */}
      <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 w-fit mb-4">
        <button
          onClick={() => setViewMode('vault')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'vault' ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
        >
          Storage Vault
        </button>
        <button
          onClick={() => setViewMode('knowledge_base')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'knowledge_base' ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
        >
          Knowledge Base (RAG)
        </button>
      </div>

      {viewMode === 'vault' ? (
        <>
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Academic Vault & Storage
            <Badge variant="indigo">{vaultFiles.length} Documents</Badge>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Personal document vault supporting Local, Veronica Cloud & Google Drive
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowActivityModal(true)}
            icon={<History className="w-4 h-4" />}
          >
            Activity Log
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDriveModal(true)}
            icon={<FolderLock className="w-4 h-4" />}
          >
            {googleDriveToken ? 'Google Drive Connected ✓' : 'Connect Google Drive'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            + Add to Vault
          </Button>
        </div>
      </div>

      {/* Storage Source Filter Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSourceFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            sourceFilter === 'all'
              ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-sm font-bold'
              : 'glass-panel border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-white">All Materials</h4>
            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{vaultFiles.length} files</p>
          </div>
          <Badge variant="slate">Total</Badge>
        </button>

        <button
          onClick={() => setSourceFilter('local')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            sourceFilter === 'local'
              ? 'bg-sky-600/10 border-sky-500 text-sky-400 shadow-sm font-bold'
              : 'glass-panel border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-white">💻 Local</h4>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                {vaultFiles.filter((f) => f.storageSource === 'local').length} local files
              </p>
            </div>
          </div>
          <Badge variant="blue">Offline</Badge>
        </button>

        <button
          onClick={() => setSourceFilter('cloud')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            sourceFilter === 'cloud'
              ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-sm font-bold'
              : 'glass-panel border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Cloud className="w-4 h-4 text-indigo-400" />
            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-white">☁ Veronica Cloud</h4>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                {vaultFiles.filter((f) => f.storageSource === 'cloud').length} cloud files
              </p>
            </div>
          </div>
          <Badge variant="indigo">Synced</Badge>
        </button>

        <button
          onClick={() => setSourceFilter('drive')}
          className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
            sourceFilter === 'drive'
              ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-sm font-bold'
              : 'glass-panel border-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FolderLock className="w-4 h-4 text-emerald-400" />
            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-white">G Google Drive</h4>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                {vaultFiles.filter((f) => f.storageSource === 'drive').length} Drive files
              </p>
            </div>
          </div>
          <Badge variant="emerald">{googleDriveToken ? 'Active' : 'OAuth'}</Badge>
        </button>
      </div>

      {/* Search, Filter & Sort Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0A0A0A] p-3 rounded-2xl border border-neutral-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search your study library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-xs text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-sans"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="document">Text & Docs</option>
            <option value="image">Images</option>
            <option value="other font-mono">Other</option>
          </select>

          {/* Offline Only Toggle */}
          <button
            onClick={() => setOfflineOnly(!offlineOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              offlineOnly
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Offline Only
          </button>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="recent">Recently Modified</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="oldest">Oldest First</option>
            <option value="size">File Size</option>
          </select>
        </div>
      </div>

      {/* Folders Navigation Bar (if any folders exist) */}
      {filteredFolders.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400">Folders</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {filteredFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolderId(folder.id)}
                className="p-3 bg-[#0A0A0A] border border-neutral-800 hover:border-indigo-500/50 rounded-2xl text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white truncate">{folder.name}</span>
                </div>
                {getSourceBadge(folder.storageSource)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Files List / Empty State */}
      {sortedFiles.length === 0 && filteredFolders.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <FolderLock className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">Your Vault is empty.</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Keep your study materials organized in one secure place. Upload PDFs, connect Google Drive, or create organized study folders.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              + Upload File
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              icon={<Folder className="w-4 h-4" />}
            >
              + Create Folder
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDriveModal(true)}
              icon={<FolderLock className="w-4 h-4" />}
            >
              + Connect Google Drive
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedFiles.map((file) => {
            const sub = getSubject(file.subjectId);
            const isMenuOpen = activeMenuFileId === file.id;

            return (
              <Card
                key={file.id}
                glass
                className="flex items-center justify-between p-4 relative border border-neutral-800 hover:border-neutral-700 transition-all"
              >
                {/* Left: File Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    onClick={() => setSelectedFileForViewer(file)}
                    className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 cursor-pointer hover:scale-105 transition-transform"
                  >
                    {file.type || 'PDF'}
                  </div>

                  <div className="min-w-0">
                    {renamingFileId === file.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          className="bg-neutral-900 border border-neutral-700 text-xs text-white px-2 py-1 rounded-lg focus:outline-none focus:border-indigo-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(file.id)}
                          className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <h4
                        onClick={() => setSelectedFileForViewer(file)}
                        className="text-sm font-bold text-white hover:text-indigo-400 transition-colors truncate cursor-pointer flex items-center gap-2"
                      >
                        {file.name}
                        {file.isOfflineAvailable && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-mono uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Offline ✓
                          </span>
                        )}
                      </h4>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span className="font-mono text-[10px]">{formatSize(file.size)}</span>
                      <span>•</span>
                      <span className="text-neutral-300 flex items-center gap-1">
                        <span>{sub ? sub.name : 'General Vault'}</span>
                        {sub && (
                          <button
                            onClick={() => setEditingSubject(sub)}
                            className="text-neutral-500 hover:text-indigo-400 p-0.5"
                            title="Edit Subject Name"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">{file.uploadedAt.split('T')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Source Badge & Context Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {getSourceBadge(file.storageSource)}

                  <button
                    onClick={() => handleAskVeronica(file)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300 rounded-xl text-xs font-semibold transition-colors"
                    title="Prepare document for Veronica AI analysis"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Ready
                  </button>

                  <button
                    onClick={() => setSelectedFileForViewer(file)}
                    className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Open
                  </button>

                  {/* Context Menu Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuFileId(isMenuOpen ? null : file.id)}
                      className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-10 z-40 w-52 bg-[#0A0A0A] border border-neutral-800 rounded-2xl shadow-2xl p-1.5 space-y-1 text-xs">
                        <button
                          onClick={() => { setSelectedFileForViewer(file); setActiveMenuFileId(null); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4 text-indigo-400" /> Open PDF Viewer
                        </button>

                        <button
                          onClick={() => { setSelectedFileForInfo(file); setActiveMenuFileId(null); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2"
                        >
                          <Info className="w-4 h-4 text-sky-400" /> View File Info
                        </button>

                        <button
                          onClick={() => { handleAskVeronica(file); setActiveMenuFileId(null); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-indigo-300 hover:bg-indigo-500/20 flex items-center gap-2 font-semibold"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-400" /> Ask Veronica
                        </button>

                        {file.storageSource !== 'local' && (
                          file.isOfflineAvailable ? (
                            <button
                              onClick={() => { removeOfflineCopy(file.id); setActiveMenuFileId(null); }}
                              className="w-full text-left px-3 py-2 rounded-xl text-amber-300 hover:bg-amber-500/10 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4 text-amber-400" /> Remove Offline Copy
                            </button>
                          ) : (
                            <button
                              onClick={() => { saveFileOffline(file.id); setActiveMenuFileId(null); }}
                              className="w-full text-left px-3 py-2 rounded-xl text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Save Copy Offline
                            </button>
                          )
                        )}

                        <button
                          onClick={() => { setRenamingFileId(file.id); setRenameInput(file.name); setActiveMenuFileId(null); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4 text-amber-400" /> Rename
                        </button>

                        <div className="h-px bg-neutral-800 my-1" />

                        <button
                          onClick={() => { handleDeleteWithConfirmation(file); setActiveMenuFileId(null); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-bold"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" /> Delete File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

              </>
      ) : (
        <KnowledgeBaseDashboard />
      )}

      {/* Active Inspectors & Modals */}
      {selectedFileForViewer && (
        <PdfViewerModal
          file={selectedFileForViewer}
          onClose={() => setSelectedFileForViewer(null)}
          onOpenInfo={() => { setSelectedFileForInfo(selectedFileForViewer); }}
          onSaveOffline={() => saveFileOffline(selectedFileForViewer.id)}
        />
      )}

      {selectedFileForInfo && (
        <FileInfoModal
          file={selectedFileForInfo}
          subject={getSubject(selectedFileForInfo.subjectId)}
          onClose={() => setSelectedFileForInfo(null)}
          onSaveOffline={() => saveFileOffline(selectedFileForInfo.id)}
          onRemoveOffline={() => removeOfflineCopy(selectedFileForInfo.id)}
          onDelete={() => { handleDeleteWithConfirmation(selectedFileForInfo); setSelectedFileForInfo(null); }}
        />
      )}

      <ConfirmationModal
        isOpen={!!confirmDelete}
        title="Delete File"
        message={
          <>
            Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{confirmDelete?.name}"</span>? 
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDelete(null)}
      />
      {showAddModal && (
        <AddVaultItemModal
          subjects={subjects}
          existingFiles={vaultFiles}
          onAddFile={(f) => addVaultFile(f)}
          onAddFolder={(f) => addVaultFolder(f)}
          onClose={() => setShowAddModal(false)}
          onDuplicateDetected={(fileName, fileObj) => {
            setShowAddModal(false);
            setDuplicateFileNotice({ fileName, fileObj });
          }}
        />
      )}

      {duplicateFileNotice && (
        <DuplicateFileDialog
          fileName={duplicateFileNotice.fileName}
          onReplace={() => {
            const existing = vaultFiles.find((f) => f.name.toLowerCase() === duplicateFileNotice.fileName.toLowerCase());
            if (existing) deleteVaultFile(existing.id);
            addVaultFile(duplicateFileNotice.fileObj);
            setDuplicateFileNotice(null);
          }}
          onKeepBoth={() => {
            const parts = duplicateFileNotice.fileName.split('.');
            const ext = parts.pop();
            const nameWithoutExt = parts.join('.');
            const copyName = `${nameWithoutExt} (1).${ext}`;
            addVaultFile({ ...duplicateFileNotice.fileObj, name: copyName });
            setDuplicateFileNotice(null);
          }}
          onCancel={() => setDuplicateFileNotice(null)}
        />
      )}

      {showActivityModal && (
        <VaultActivityModal
          activities={vaultActivities}
          onClose={() => setShowActivityModal(false)}
          onClearHistory={clearVaultActivities}
        />
      )}

      {showDriveModal && (
        <GoogleDriveBrowserModal
          token={googleDriveToken}
          onConnect={connectGoogleDrive}
          onDisconnect={disconnectGoogleDrive}
          onImportFileToVault={(file, blob) => {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            let type = 'other';
            if (ext === 'pdf') type = 'pdf';
            else if (['doc', 'docx', 'txt'].includes(ext)) type = 'document';

            addVaultFile({
              name: file.name,
              size: file.size ? parseInt(file.size) : 1024 * 50,
              type,
              mimeType: file.mimeType || 'application/pdf',
              storageSource: 'drive',
              driveFileId: file.id,
              driveWebViewLink: file.webViewLink,
              drivePermission: file.capabilities?.canEdit === false ? 'read_only' : 'edit',
              isOfflineAvailable: !!blob,
            });
            if (blob) {
              saveFileOffline('file_drive_' + file.id, blob);
            }
          }}
          onClose={() => setShowDriveModal(false)}
        />
      )}

      <EditSubjectModal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        subject={editingSubject}
      />
    </div>
  );
};
