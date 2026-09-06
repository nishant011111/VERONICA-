const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /temperature: temperature \?\? 0\.7,/g,
  "temperature: (requestedModel.includes('gpt-5.6') || requestedModel.startsWith('o1') || requestedModel.startsWith('o3')) ? 1 : (temperature ?? 0.7),"
);

fs.writeFileSync('server.ts', code);
