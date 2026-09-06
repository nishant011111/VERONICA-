const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

code = code.replace(
  "messages: messages,",
  "messages: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content })),"
);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
