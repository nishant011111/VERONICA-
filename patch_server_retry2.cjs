const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const currentRetryLogic = `    let response;
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

const newRetryLogic = `    let response;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const modelName = attempts === maxAttempts - 1 ? "gemini-flash-latest" : "gemini-3.8-flash";
        response = await ai.models.generateContent({
          model: modelName,
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
        if (attempts >= maxAttempts) {
            console.error("All Gemini API attempts failed.", err);
            throw err;
        }
        console.warn(\`Gemini API error (\${err.message}). Retrying \${attempts}/\${maxAttempts}...\`);
        await new Promise(resolve => setTimeout(resolve, 1500 * Math.pow(2, attempts)));
      }
    }`;

if (code.includes(currentRetryLogic)) {
  code = code.replace(currentRetryLogic, newRetryLogic);
  fs.writeFileSync('server.ts', code);
  console.log("Patched server.ts with better retry logic");
} else {
  console.log("Could not find the exact string to replace in server.ts");
}
