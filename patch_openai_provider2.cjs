const fs = require('fs');
let code = fs.readFileSync('src/services/ai/providers/OpenAIProvider.ts', 'utf8');

code = code.replace(/\\\`/g, '`');
code = code.replace(/\\\\n/g, '\\n');

fs.writeFileSync('src/services/ai/providers/OpenAIProvider.ts', code);
