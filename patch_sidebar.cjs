const fs = require('fs');
let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

sidebar = sidebar.replace(
  "import {\n  LayoutDashboard,",
  "import {\n  Activity,\n  Workflow,\n  Link as LinkIcon,\n  LayoutDashboard,"
);

const targetItems = `    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];`;

const newItems = `    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'automations', label: 'Automations', icon: <Workflow className="w-5 h-5" /> },
    { id: 'timeline', label: 'Activity', icon: <Activity className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <LinkIcon className="w-5 h-5" /> },
  ];`;

sidebar = sidebar.replace(targetItems, newItems);
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);
console.log('patched sidebar');
