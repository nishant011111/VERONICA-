const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

// Also revert the console.trace hacks
code = code.replace(
  "const updateSettings = (partial: any) => { console.trace('updateSettings'); return app.updateSettings(partial); };",
  "const updateSettings = app.updateSettings;"
);
code = code.replace(
  "const showToast = (m: string, t?: any) => { console.trace('showToast'); return app.showToast(m, t); };",
  "const showToast = app.showToast;"
);
code = code.replace(
  "const app = useApp();\n  const profile = app.profile;\n  const settings = app.settings;\n  const kbDocuments = app.kbDocuments;\n  const updateSettings = app.updateSettings;\n  const subjects = app.subjects;\n  const notes = app.notes;\n  const vaultFiles = app.vaultFiles;\n  const assignments = app.assignments;\n  const showToast = app.showToast;\n  const tasks = app.tasks;\n  const exams = app.exams;\n  const goals = app.goals;",
  "const { profile, settings, kbDocuments, updateSettings, subjects, notes, vaultFiles, assignments, showToast, tasks, exams, goals } = useApp();"
);

// Fix the toggleAutoSpeech bug
code = code.replace(
  "  const toggleAutoSpeech = () => {\n    setAutoSpeech((prev) => {\n      const next = !prev;\n      localStorage.setItem('veronica_auto_tts', String(next));\n      if (!next) {\n        stopSpeaking();\n      }\n      showToast(`Auto Text-to-Speech ${next ? 'enabled' : 'disabled'}`, 'info');\n      return next;\n    });\n  };",
  "  const toggleAutoSpeech = () => {\n    const next = !autoSpeech;\n    setAutoSpeech(next);\n    localStorage.setItem('veronica_auto_tts', String(next));\n    if (!next) {\n      stopSpeaking();\n    }\n    showToast(`Auto Text-to-Speech ${next ? 'enabled' : 'disabled'}`, 'info');\n  };"
);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
