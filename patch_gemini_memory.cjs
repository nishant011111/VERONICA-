const fs = require('fs');
let code = fs.readFileSync('src/services/ai/providers/GeminiProvider.ts', 'utf8');

code = code.replace(
  "contents: prompt,",
  "contents: prompt,\n      messages: options.messages,"
);

code = code.replace(
  "contents: prompt,",
  "contents: prompt,\n      messages: options.messages,"
);

fs.writeFileSync('src/services/ai/providers/GeminiProvider.ts', code);
