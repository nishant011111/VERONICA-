const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "systemInstruction: req.body.systemInstruction,\n          temperature: req.body.temperature ?? 0.7\n        }",
  "systemInstruction: req.body.systemInstruction,\n          temperature: req.body.temperature ?? 0.7,\n          tools: [{ googleSearch: {} }]\n        }"
);

code = code.replace(
  "systemInstruction: req.body.systemInstruction,\n          temperature: req.body.temperature ?? 0.7\n        }",
  "systemInstruction: req.body.systemInstruction,\n          temperature: req.body.temperature ?? 0.7,\n          tools: [{ googleSearch: {} }]\n        }"
);

fs.writeFileSync('server.ts', code);
