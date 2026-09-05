const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

const target = `{/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] text-slate-500 dark:text-slate-400 text-left hover:bg-slate-200 dark:hover:bg-[#111111] transition-all flex items-center justify-between"
          >
            <span>Search Veronica OS...</span>
            <span className="text-[10px] bg-slate-200 dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded text-slate-500">⌘K</span>
          </button>
             
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>`;

const replacement = `{/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] text-slate-500 dark:text-slate-400 text-left hover:bg-slate-200 dark:hover:bg-[#111111] transition-all flex items-center justify-between"
          >
            <span>Search Veronica OS...</span>
            <span className="text-[10px] bg-slate-200 dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded text-slate-500">⌘K</span>
          </button>
        </div>
      </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/layout/Header.tsx', content);
