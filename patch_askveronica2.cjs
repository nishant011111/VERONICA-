const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

code = code.replace(
  "const { profile, settings, kbDocuments, updateSettings, subjects, notes, vaultFiles, assignments, showToast } = useApp();",
  "const { profile, settings, kbDocuments, updateSettings, subjects, notes, vaultFiles, assignments, showToast, tasks, exams, goals } = useApp();"
);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
