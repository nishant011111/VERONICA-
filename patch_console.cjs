const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "console.error('OpenAI Stream Error:', err);",
  "// console.error('OpenAI Stream Error:', err);"
);

code = code.replace(
  "console.error('OpenAI Chat Error:', err);",
  "// console.error('OpenAI Chat Error:', err);"
);

code = code.replace(
  "console.error('Gemini Stream Error:', error);",
  "// console.error('Gemini Stream Error:', error);"
);

code = code.replace(
  "console.error('Gemini API Error:', error);",
  "// console.error('Gemini API Error:', error);"
);

code = code.replace(
  "console.error('Groq API Error:', error);",
  "// console.error('Groq API Error:', error);"
);

fs.writeFileSync('server.ts', code);
