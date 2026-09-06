const fs = require('fs');
let code = fs.readFileSync('src/services/ai/config.ts', 'utf8');

code = code.replace(
  "export const GROQ_PRIMARY_MODEL = 'openai/gpt-oss-20b';",
  "export const OPENAI_PRIMARY_MODEL = 'gpt-5.6-luna';\nexport const OPENAI_FALLBACK_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];\nexport const GROQ_PRIMARY_MODEL = 'openai/gpt-oss-20b';"
);

code = code.replace(
  "gemini: {",
  "openai: {\n    id: 'openai',\n    name: 'OpenAI (ChatGPT)',\n    primaryModel: OPENAI_PRIMARY_MODEL,\n    fallbackModels: OPENAI_FALLBACK_MODELS,\n    enabled: true\n  },\n  gemini: {"
);

fs.writeFileSync('src/services/ai/config.ts', code);
