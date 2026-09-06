const fs = require('fs');
let code = fs.readFileSync('src/services/ai/AIErrorHandler.ts', 'utf8');

code = code.replace(
  "errStr.includes('GEMINI_API_KEY environment variable not set')",
  "errStr.includes('environment variable') || errStr.includes('API key is not set')"
);

fs.writeFileSync('src/services/ai/AIErrorHandler.ts', code);
