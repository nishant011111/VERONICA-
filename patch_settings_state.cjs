const fs = require('fs');
let code = fs.readFileSync('src/components/screens/SettingsScreen.tsx', 'utf8');

code = code.replace(
  "const [activeProvider, setActiveProvider] = useState<AIProviderType>(settings.ai?.activeProvider || 'gemini');",
  "const [activeProvider, setActiveProvider] = useState<AIProviderType>(settings.ai?.activeProvider || 'gemini');\n  const [memoryEnabled, setMemoryEnabled] = useState(settings.ai?.memoryEnabled !== false);"
);

code = code.replace(
  "updateSettings({\n      ...settings,\n      ai: {\n        ...settings.ai,\n        activeProvider,\n        activeModel\n      }\n    });",
  "updateSettings({\n      ...settings,\n      ai: {\n        ...settings.ai,\n        activeProvider,\n        activeModel,\n        memoryEnabled\n      }\n    });"
);

fs.writeFileSync('src/components/screens/SettingsScreen.tsx', code);
