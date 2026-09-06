const fs = require('fs');
let code = fs.readFileSync('src/services/ai/providers/OpenAIProvider.ts', 'utf8');

code = code.replace(
  "reason: \\`Server error (\\${res.status})\\`",
  "reason: `Server error (${res.status})`"
);

fs.writeFileSync('src/services/ai/providers/OpenAIProvider.ts', code);
