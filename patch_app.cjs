const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('TimetableReminderManager')) {
  code = code.replace(
    "import { NotificationSystem } from './components/layout/NotificationSystem';",
    "import { NotificationSystem } from './components/layout/NotificationSystem';\nimport { TimetableReminderManager } from './components/layout/TimetableReminderManager';"
  );
  
  code = code.replace(
    "<NotificationSystem />",
    "<NotificationSystem />\n      <TimetableReminderManager />"
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
