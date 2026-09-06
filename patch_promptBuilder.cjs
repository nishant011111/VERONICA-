const fs = require('fs');
let code = fs.readFileSync('src/services/ai/promptBuilder.ts', 'utf8');

code = code.replace(
  "Use this context to accurately tailor your response. Do not invent details outside of facts.`;",
  "${c.memories && c.memories.length > 0 ? `\n[LONG-TERM MEMORIES]\n- ` + c.memories.join('\\n- ') : ''}\n${c.pastConversations && c.pastConversations.length > 0 ? `\n[RELEVANT PAST CONVERSATIONS]\n` + c.pastConversations.join('\\n---\\n') : ''}\nUse this context to accurately tailor your response. Do not invent details outside of facts.`;"
);

fs.writeFileSync('src/services/ai/promptBuilder.ts', code);
