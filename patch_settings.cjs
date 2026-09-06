const fs = require('fs');
let code = fs.readFileSync('src/components/screens/SettingsScreen.tsx', 'utf8');

if (!code.includes('<option value="openai">OpenAI (ChatGPT)</option>')) {
  code = code.replace(
    '<option value="gemini">Gemini</option>',
    '<option value="openai">OpenAI (ChatGPT)</option>\n              <option value="gemini">Gemini</option>'
  );
  fs.writeFileSync('src/components/screens/SettingsScreen.tsx', code);
}
