const fs = require('fs');
let code = fs.readFileSync('src/services/ai/AIErrorHandler.ts', 'utf8');

code = code.replace(
  "const errStr = String(rawMsg);",
  "const errStr = String(rawMsg);\n    const lowerErr = errStr.toLowerCase();"
);

code = code.replace(/errStr\.includes/g, 'lowerErr.includes');
code = code.replace(/'API key is not configured'/g, "'api key is not configured'");
code = code.replace(/'API key is missing'/g, "'api key is missing'");
code = code.replace(/'UNAUTHENTICATED'/g, "'unauthenticated'");
code = code.replace(/'Authentication failed'/g, "'authentication failed'");
code = code.replace(/'Invalid or unauthenticated'/g, "'invalid or unauthenticated'");
code = code.replace(/'RESOURCE_EXHAUSTED'/g, "'resource_exhausted'");
code = code.replace(/'Rate limit'/g, "'rate limit'");
code = code.replace(/'Quota exceeded'/g, "'quota exceeded'");
code = code.replace(/'UNAVAILABLE'/g, "'unavailable'");
code = code.replace(/'Service Unavailable'/g, "'service unavailable'");
code = code.replace(/'NOT_FOUND'/g, "'not_found'");
code = code.replace(/'NetworkError'/g, "'networkerror'");
code = code.replace(/'Failed to fetch'/g, "'failed to fetch'");
code = code.replace(/'Internet connection unavailable'/g, "'internet connection unavailable'");
code = code.replace(/'Ollama'/g, "'ollama'");
code = code.replace(/'Local AI'/g, "'local ai'");
code = code.replace(/'Unable to reach '/g, "'unable to reach '");

fs.writeFileSync('src/services/ai/AIErrorHandler.ts', code);
