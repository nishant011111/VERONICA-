const fs = require('fs');
let code = fs.readFileSync('src/services/ai/AIErrorHandler.ts', 'utf8');

code = code.replace(/Gemini /g, 'AI ');
code = code.replace(/Gemini/g, 'AI');

fs.writeFileSync('src/services/ai/AIErrorHandler.ts', code);
