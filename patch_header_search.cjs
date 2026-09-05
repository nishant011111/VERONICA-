const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

const importStr = "import { GlobalSearchModal } from '../search/GlobalSearchModal';";
if (!content.includes(importStr)) {
  content = content.replace(
    "import { StudentProfileModal } from '../profile/StudentProfileModal';",
    "import { StudentProfileModal } from '../profile/StudentProfileModal';\nimport { GlobalSearchModal } from '../search/GlobalSearchModal';"
  );
}

const searchInputOld = `<input
            type="text"
            placeholder="Search tasks, notes, subjects, exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />`;

const searchInputNew = `<button
            onClick={() => setIsSearchOpen(true)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] text-slate-500 dark:text-slate-400 text-left hover:bg-slate-200 dark:hover:bg-[#111111] transition-all flex items-center justify-between"
          >
            <span>Search Veronica OS...</span>
            <span className="text-[10px] bg-slate-200 dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded text-slate-500">⌘K</span>
          </button>`;

content = content.replace(searchInputOld, searchInputNew);

// Remove the "Clear" button that was beside the old search input
const clearBtnStart = content.indexOf('{searchQuery && (');
if (clearBtnStart > -1) {
  const clearBtnEnd = content.indexOf(')}', clearBtnStart) + 2;
  content = content.substring(0, clearBtnStart) + content.substring(clearBtnEnd);
}

// Add state for isSearchOpen and keyboard shortcut
const stateMatch = "  const [startInEditMode, setStartInEditMode] = useState(false);";
const stateNew = "  const [startInEditMode, setStartInEditMode] = useState(false);\n  const [isSearchOpen, setIsSearchOpen] = useState(false);\n\n  useEffect(() => {\n    const handleKeyDown = (e: KeyboardEvent) => {\n      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {\n        e.preventDefault();\n        setIsSearchOpen(true);\n      }\n    };\n    window.addEventListener('keydown', handleKeyDown);\n    return () => window.removeEventListener('keydown', handleKeyDown);\n  }, []);";

content = content.replace(stateMatch, stateNew);

// Add the GlobalSearchModal at the end
const endMatch = "      <StudentProfileModal";
const endNew = "      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />\n      <StudentProfileModal";

content = content.replace(endMatch, endNew);

fs.writeFileSync('src/components/layout/Header.tsx', content);
console.log("Patched Header.tsx");
