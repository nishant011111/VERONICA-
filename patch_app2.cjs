const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('TimetableReminderManager')) {
  code = code.replace(
    "import { Header } from './components/layout/Header';",
    "import { Header } from './components/layout/Header';\nimport { TimetableReminderManager } from './components/layout/TimetableReminderManager';"
  );
  
  code = code.replace(
    "<Header onOpenQuickAdd",
    "<TimetableReminderManager />\n      <Header onOpenQuickAdd"
  );
  
  fs.writeFileSync('src/App.tsx', code);
}
