const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const originalCall = `    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });`;

const retryLogic = `    let response;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: { parts: [imagePart, textPart] },
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.2
          }
        });
        break;
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) throw err;
        console.warn(\`Gemini API error (\${err.message}). Retrying \${attempts}/\${maxAttempts}...\`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      }
    }`;

if (code.includes(originalCall)) {
  code = code.replace(originalCall, retryLogic);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts with retry logic");
} else {
  console.log("Could not find the exact string to replace in server.ts");
}
