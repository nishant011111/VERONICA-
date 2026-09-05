import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, FileText, CalendarCheck, BookOpen, Clock, Tag, Command, Plus, Sparkles, Settings, Terminal } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { notes, tasks, subjects, vaultFiles, setActiveScreen } = useApp();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const saved = localStorage.getItem('veronica_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener is handled in App.tsx typically, but we can also bind esc here
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const saveRecentSearch = (q: string) => {
    if (!q.trim()) return;
    const newRecent = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('veronica_recent_searches', JSON.stringify(newRecent));
  };

  if (!isOpen) return null;

  const q = query.toLowerCase();

  const systemCommands = [
    { id: 'cmd_ask', title: 'Ask Veronica', icon: <Sparkles className="w-4 h-4" />, action: () => handleSelectResult('ask_veronica', 'cmd') },
    { id: 'cmd_new_task', title: 'Create Task', icon: <Plus className="w-4 h-4" />, action: () => handleSelectResult('planner', 'cmd') },
    { id: 'cmd_settings', title: 'Settings', icon: <Settings className="w-4 h-4" />, action: () => handleSelectResult('settings', 'cmd') },
    { id: 'cmd_auto', title: 'Automations', icon: <Terminal className="w-4 h-4" />, action: () => handleSelectResult('automations', 'cmd') },
  ].filter(c => q === '' || c.title.toLowerCase().includes(q));

  const results = {
    notes: q ? notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)).slice(0, 5) : [],
    tasks: q ? tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)).slice(0, 5) : [],
    subjects: q ? subjects.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)).slice(0, 3) : [],
    files: q ? vaultFiles.filter(f => f.name.toLowerCase().includes(q)).slice(0, 5) : [],
  };

  const hasResults = Object.values(results).some(arr => arr.length > 0) || systemCommands.length > 0;

  const handleSelectResult = (screen: any, _id: string, searchTerm?: string) => {
    if (searchTerm) saveRecentSearch(searchTerm);
    setActiveScreen(screen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#0A0A0A] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-[#1A1A1A]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-[#1A1A1A]">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search everything... (Notes, Tasks, Files, Subjects)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveRecentSearch(query);
            }}
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-lg"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!q && recentSearches.length > 0 && (
            <div className="p-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Searches</h4>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(rs => (
                  <button 
                    key={rs} 
                    onClick={() => setQuery(rs)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#111111] hover:bg-slate-200 dark:hover:bg-[#1A1A1A] rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {rs}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && !hasResults && (
            <div className="p-8 text-center text-slate-500">
              <p>No results found for "{query}"</p>
            </div>
          )}

          
          {systemCommands.length > 0 && (
            <div className="mb-4">
              <h4 className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Commands</h4>
              {systemCommands.map(cmd => (
                <div 
                  key={cmd.id}
                  onClick={cmd.action}
                  className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-[#111111] rounded-lg cursor-pointer flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-500/10 flex items-center justify-center transition-colors">
                    {cmd.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{cmd.title}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100">Run Command</span>
                </div>
              ))}
            </div>
          )}
          
          {results.notes.length > 0 && (
            <div className="mb-4">
              <h4 className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</h4>
              {results.notes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => handleSelectResult('notes', note.id, query)}
                  className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-[#111111] rounded-lg cursor-pointer flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{note.title}</p>
                    <p className="text-xs text-slate-500 truncate">{note.content.substring(0, 60)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.tasks.length > 0 && (
            <div className="mb-4">
              <h4 className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Tasks</h4>
              {results.tasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => handleSelectResult('planner', task.id, query)}
                  className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-[#111111] rounded-lg cursor-pointer flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.date} • {task.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.files.length > 0 && (
            <div className="mb-4">
              <h4 className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Vault Files</h4>
              {results.files.map(file => (
                <div 
                  key={file.id}
                  onClick={() => handleSelectResult('vault', file.id, query)}
                  className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-[#111111] rounded-lg cursor-pointer flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{file.type} • {(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.subjects.length > 0 && (
            <div className="mb-4">
              <h4 className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Subjects</h4>
              {results.subjects.map(sub => (
                <div 
                  key={sub.id}
                  onClick={() => handleSelectResult('subjects', sub.id, query)}
                  className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-[#111111] rounded-lg cursor-pointer flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{sub.name}</p>
                    <p className="text-xs text-slate-500">{sub.code}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-slate-100 dark:border-[#1A1A1A] bg-slate-50 dark:bg-[#111111] text-[10px] text-slate-400 flex items-center justify-between">
          <span>Search powered by Veronica OS</span>
          <span className="hidden sm:inline">Use <kbd className="bg-slate-200 dark:bg-slate-800 px-1 rounded">esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
