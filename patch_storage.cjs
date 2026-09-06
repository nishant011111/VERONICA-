const fs = require('fs');
let code = fs.readFileSync('src/services/storage.ts', 'utf8');

code = code.replace(
  "saveHistory: true,",
  "saveHistory: true,\n    memoryEnabled: true,"
);

fs.writeFileSync('src/services/storage.ts', code);
