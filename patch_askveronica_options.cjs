const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

code = code.replace(
  '<option value="gemini">Gemini</option>',
  '<option value="openai">OpenAI (ChatGPT)</option>\n                <option value="gemini">Gemini</option>'
);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
