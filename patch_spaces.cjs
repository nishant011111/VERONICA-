const fs = require('fs');
let code = fs.readFileSync('src/services/ai/mathCleaner.ts', 'utf8');

code = code.replace(
  "speech = speech.replace(/\\s{2,}/g, ' ');",
  "speech = speech.replace(/ {2,}/g, ' ');"
);

fs.writeFileSync('src/services/ai/mathCleaner.ts', code);
