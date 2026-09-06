const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

// Update streamResponse call to include messages
code = code.replace(
  /const response = await AIRouter\.streamResponse\(\s*fullPrompt,\s*settings\.ai,\s*\{\s*academicMode,\s*explanationLevel,\s*responseStyle,\s*context:\s*\{\s*\.\.\.baseContext,\s*ragChunks\s*\},/g,
  "const response = await AIRouter.streamResponse(\n        fullPrompt,\n        settings.ai,\n        {\n          academicMode,\n          explanationLevel,\n          responseStyle,\n          messages: messages,\n          context: {\n            ...baseContext,\n            ragChunks\n          },"
);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
