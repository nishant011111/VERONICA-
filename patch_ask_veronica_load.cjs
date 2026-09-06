const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

code = code.replace(
  "const loaded = ConversationService.getConversations(userId);",
  "const loaded = ConversationService.getConversations(userId);\n    ConversationService.loadFromFirebase(userId).then((fbConvs) => {\n      if (fbConvs && fbConvs.length > 0) {\n        setConversations(fbConvs);\n        if (!activeConvId) {\n          setActiveConvId(fbConvs[0].id);\n          setMessages(fbConvs[0].messages || []);\n        }\n      }\n    });"
);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
