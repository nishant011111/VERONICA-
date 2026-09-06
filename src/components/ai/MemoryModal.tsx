import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrainCircuit, X, Plus, Trash2, Edit3, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ isOpen, onClose }) => {
  const { authUser, settings } = useApp();
  const userId = authUser?.uid || 'local_user';
  const [memories, setMemories] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      import('../../services/ai/MemoryService').then(({ MemoryService }) => {
        setMemories(MemoryService.getMemories(userId));
      });
    }
  }, [isOpen, userId]);

  const saveToService = async (newMemories: any[]) => {
    setMemories(newMemories);
    const { MemoryService } = await import('../../services/ai/MemoryService');
    MemoryService.saveMemories(userId, newMemories);
    
    // Attempt to update vectorDB but we don't strictly need to wait for it here
    const { vectorDB } = await import('../../services/ai/VectorDatabase');
    // Basic sync logic could be placed here if needed
  };

  const [newMemory, setNewMemory] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newMemory.trim()) return;
    const newM = { id: crypto.randomUUID(), userId, content: newMemory, category: 'fact', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    saveToService([newM, ...memories]);
    setNewMemory('');
  };

  const handleDelete = (id: string) => {
    saveToService(memories.filter(m => m.id !== id));
    import('../../services/ai/VectorDatabase').then(({ vectorDB }) => vectorDB.delete(id));
  };

  const handleClear = () => {
    if(confirm('Are you sure you want to clear all AI memories?')) {
      saveToService([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Veronica's Memory</h2>
              <p className="text-[10px] text-slate-500">Manage what Veronica knows about you</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Privacy Notice:</strong> Memories are used to personalize Veronica's responses. 
            Do not store sensitive personal information like passwords or financial data here. 
            You have full control to edit or delete these at any time.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={newMemory}
              onChange={e => setNewMemory(e.target.value)}
              placeholder="E.g., I prefer concise answers..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Button variant="primary" onClick={handleAdd} icon={<Plus className="w-4 h-4" />}>Add</Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Memories ({memories.length})</h3>
              {memories.length > 0 && (
                <button onClick={handleClear} className="text-xs text-rose-500 hover:text-rose-600 font-semibold">
                  Clear All
                </button>
              )}
            </div>
            
            {memories.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Veronica currently has no specific memories saved.
              </div>
            ) : (
              memories.map(m => (
                <Card key={m.id} glass className="p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between group">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{m.content}</p>
                  <button 
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
