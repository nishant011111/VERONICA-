const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const importTarget = `import { NotesScreen } from './components/screens/NotesScreen';`;
const importNew = `import { NotesScreen } from './components/screens/NotesScreen';
import { AutomationsScreen } from './components/screens/AutomationsScreen';
import { TimelineScreen } from './components/screens/TimelineScreen';
import { IntegrationsScreen } from './components/screens/IntegrationsScreen';`;

app = app.replace(importTarget, importNew);

const switchTarget = `      case 'settings':
        return <SettingsScreen />;`;
const switchNew = `      case 'settings':
        return <SettingsScreen />;
      case 'automations':
        return <AutomationsScreen />;
      case 'timeline':
        return <TimelineScreen />;
      case 'integrations':
        return <IntegrationsScreen />;`;

app = app.replace(switchTarget, switchNew);
fs.writeFileSync('src/App.tsx', app);
console.log('patched app screens');
