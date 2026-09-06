const fs = require('fs');
let code = fs.readFileSync('src/services/ai/types.ts', 'utf8');

code = code.replace(
  "ragChunks?: { content: string, source: string, pageNumber?: number }[];",
  "ragChunks?: { content: string, source: string, pageNumber?: number }[];\n  memories?: string[];\n  pastConversations?: string[];"
);

fs.writeFileSync('src/services/ai/types.ts', code);
