const fs = require('fs');
let code = fs.readFileSync('src/services/ai/types.ts', 'utf8');

if (!code.includes('messages?: { role: string; content: string }[];')) {
  code = code.replace(
    "providerOverride?: string;",
    "providerOverride?: string;\n  messages?: { role: string; content: string }[];"
  );
  fs.writeFileSync('src/services/ai/types.ts', code);
}
