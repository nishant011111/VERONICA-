const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(
  "export type AIProviderType = 'gemini' | 'groq' | 'ollama';",
  "export type AIProviderType = 'openai' | 'gemini' | 'groq' | 'ollama';"
);

fs.writeFileSync('src/types/index.ts', code);
