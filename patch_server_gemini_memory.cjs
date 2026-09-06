const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const transformLogic = `
    let geminiContents: any = req.body.contents;
    if (req.body.messages && Array.isArray(req.body.messages)) {
      geminiContents = [];
      req.body.messages.forEach((m: any) => {
        const role = (m.sender === 'user' || m.role === 'user') ? 'user' : 'model';
        geminiContents.push({ role, parts: [{ text: m.content }] });
      });
      // Append current prompt if not present
      const lastMsg = geminiContents[geminiContents.length - 1];
      if (!lastMsg || lastMsg.parts[0].text !== req.body.contents) {
        geminiContents.push({ role: 'user', parts: [{ text: req.body.contents }] });
      }
    }
`;

code = code.replace(
  "const requestedModel = req.body.model || GEMINI_PRIMARY_MODEL;\n    let response = null;",
  "const requestedModel = req.body.model || GEMINI_PRIMARY_MODEL;\n" + transformLogic + "\n    let response = null;"
);

code = code.replace(
  "contents: req.body.contents,",
  "contents: geminiContents,"
);

code = code.replace(
  "const requestedModel = req.body.model || GEMINI_PRIMARY_MODEL;\n    let activeStream: AsyncIterable<any> | null = null;",
  "const requestedModel = req.body.model || GEMINI_PRIMARY_MODEL;\n" + transformLogic + "\n    let activeStream: AsyncIterable<any> | null = null;"
);

code = code.replace(
  "contents: req.body.contents,",
  "contents: geminiContents,"
);

fs.writeFileSync('server.ts', code);
