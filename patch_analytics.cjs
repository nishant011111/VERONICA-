const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AnalyticsScreen.tsx', 'utf8');

const importTarget = "const { studySessions, tasks, attendance, subjects, goals, profile, showToast } = useApp();";
const newImport = "const { studySessions, tasks, attendance, subjects, goals, profile, showToast, vaultFiles, activityTimeline } = useApp();";
code = code.replace(importTarget, newImport);

const statsTarget = "const completedTasks = tasks.filter((t) => t.status === 'completed').length;";
const newStats = `const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
  
  const totalStorageBytes = vaultFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const storageUsageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);
  const documentCount = vaultFiles.length;`;
if(!code.includes('const pendingTasks')) {
  code = code.replace(statsTarget, newStats);
}

const renderTarget = "{/* Quick Stats Grid */}";
const newRender = `{/* Ecosystem Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card glass className="p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 mb-2 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4 text-indigo-500" /> Documents
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{documentCount}</div>
        </Card>
        <Card glass className="p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 mb-2 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 text-emerald-500" /> Storage
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{storageUsageMB} MB</div>
        </Card>
        <Card glass className="p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 mb-2 text-xs font-bold uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4 text-amber-500" /> Pending Tasks
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{pendingTasks}</div>
        </Card>
        <Card glass className="p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-500 mb-2 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-rose-500" /> Completed
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{completedTasks}</div>
        </Card>
      </div>
      
      {/* Quick Stats Grid */}`;
if(!code.includes('Ecosystem Stats')) {
  code = code.replace(renderTarget, newRender);
}

fs.writeFileSync('src/components/screens/AnalyticsScreen.tsx', code);
console.log('patched analytics');
