const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const oldChange = "onChange={(e) => updateSettings({ ai: { ...settings.ai, activeProvider: e.target.value as any } })}";
const newChange = `onChange={(e) => {
                  const newProvider = e.target.value as any;
                  const newPrimary = AI_PROVIDERS_CONFIG[newProvider as keyof typeof AI_PROVIDERS_CONFIG]?.primaryModel;
                  updateSettings({ ai: { ...settings.ai, activeProvider: newProvider, activeModel: newPrimary } });
                }}`;

code = code.replace(oldChange, newChange);
fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
