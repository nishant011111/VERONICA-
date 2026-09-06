const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

code = code.replace(
  "if (msgId && speakingMsgId === msgId && ttsService.isPlaying(msgId)) {",
  "if (msgId && speakingMsgId === msgId) {"
);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
