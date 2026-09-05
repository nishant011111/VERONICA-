const fs = require('fs');
const content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const newContent = content.replace(
  "const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {",
  "const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {\n    console.trace('showToast called');"
).replace(
  "const updateSettings = (partial: DeepPartial<UserSettings>) => {",
  "const updateSettings = (partial: DeepPartial<UserSettings>) => {\n    console.trace('updateSettings called');"
);
fs.writeFileSync('src/context/AppContext.tsx', newContent);
