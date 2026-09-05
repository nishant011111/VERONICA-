const fs = require('fs');
let types = fs.readFileSync('src/types/index.ts', 'utf8');
types = types.replace(
  "  | 'settings';",
  "  | 'settings'\n  | 'automations'\n  | 'timeline'\n  | 'integrations';"
);
fs.writeFileSync('src/types/index.ts', types);
console.log('patched types');
