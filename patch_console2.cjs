const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /console\.error\("All Gemini API attempts failed\.", err\);/g,
  "// console.error('All Gemini API attempts failed.', err);"
);

code = code.replace(
  /console\.error\('Vision API Error:', error\);/g,
  "// console.error('Vision API Error:', error);"
);

code = code.replace(
  /console\.error\('Gemini Embed Error:', error\);/g,
  "// console.error('Gemini Embed Error:', error);"
);

fs.writeFileSync('server.ts', code);
