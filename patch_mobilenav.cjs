const fs = require('fs');
let nav = fs.readFileSync('src/components/layout/MobileNav.tsx', 'utf8');

nav = nav.replace(
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

nav = nav.replace(targetItems, newItems);
fs.writeFileSync('src/components/layout/MobileNav.tsx', nav);
console.log('patched mobilenav');
