const fs = require('fs');
let code = fs.readFileSync('src/services/ai/types.ts', 'utf8');

if (!code.includes('timetableStr?: string;')) {
  code = code.replace(
    "ragChunks?: { content: string, source: string, pageNumber?: number }[];",
    "ragChunks?: { content: string, source: string, pageNumber?: number }[];\n  timetableStr?: string;"
  );
  fs.writeFileSync('src/services/ai/types.ts', code);
}
