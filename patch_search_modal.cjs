const fs = require('fs');
let modal = fs.readFileSync('src/components/search/GlobalSearchModal.tsx', 'utf8');

// Replace lucide imports
const targetImports = "import { Search, X, FileText, CalendarCheck, BookOpen, Clock, Tag } from 'lucide-react';";
const newImports = "import { Search, X, FileText, CalendarCheck, BookOpen, Clock, Tag, Command, Plus, Sparkles, Settings, Terminal } from 'lucide-react';";
modal = modal.replace(targetImports, newImports);

// Insert system commands
const targetQ = "const q = query.toLowerCase();";
const newCommands = `const q = query.toLowerCase();

  const systemCommands = [
    { id: 'cmd_ask', title: 'Ask Veronica', icon: <Sparkles className="w-4 h-4" />, action: () => handleSelectResult('ask_veronica', 'cmd') },
    { id: 'cmd_new_task', title: 'Create Task', icon: <Plus className="w-4 h-4" />, action: () => handleSelectResult('planner', 'cmd') },
    { id: 'cmd_settings', title: 'Settings', icon: <Settings className="w-4 h-4" />, action: () => handleSelectResult('settings', 'cmd') },
    { id: 'cmd_auto', title: 'Automations', icon: <Terminal className="w-4 h-4" />, action: () => handleSelectResult('automations', 'cmd') },
  ].filter(c => q === '' || c.title.toLowerCase().includes(q));`;
modal = modal.replace(targetQ, newCommands);

// Insert commands into results check
const targetHasResults = "const hasResults = Object.values(results).some(arr => arr.length > 0);";
const newHasResults = "const hasResults = Object.values(results).some(arr => arr.length > 0) || systemCommands.length > 0;";
modal = modal.replace(targetHasResults, newHasResults);

// Insert command UI
const targetNotes = "{results.notes.length > 0 && (";
const newCommandUI = `
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
          
          {results.notes.length > 0 && (`;
modal = modal.replace(targetNotes, newCommandUI);

fs.writeFileSync('src/components/search/GlobalSearchModal.tsx', modal);
console.log('patched search modal');
