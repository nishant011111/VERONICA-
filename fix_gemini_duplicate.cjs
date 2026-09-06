const fs = require('fs');
let code = fs.readFileSync('src/services/ai/providers/GeminiProvider.ts', 'utf8');

code = code.replace(
  "messages: options.messages,\n      messages: options.messages,",
  "messages: options.messages,"
);
code = code.replace(
  "messages: options.messages,\n      messages: options.messages,",
  "messages: options.messages,"
);

fs.writeFileSync('src/services/ai/providers/GeminiProvider.ts', code);
