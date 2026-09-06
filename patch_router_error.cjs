const fs = require('fs');
let code = fs.readFileSync('src/services/ai/AIRouter.ts', 'utf8');

code = code.replace(
  `    if (lastError) {
      const parsed = AIErrorHandler.parse(lastError);
      if (parsed.code === 'AUTH_FAILURE' && attempted > 1) {
         throw new Error('No AI provider is currently configured. Please check your AI Settings to add an API key.');
      }
      throw lastError;
    }`,
  `    if (lastError) {
      const parsed = AIErrorHandler.parse(lastError);
      if (attempted > 1) {
         throw new Error('All AI providers are currently unavailable or unconfigured. Please check your active provider and API keys in AI Settings.');
      }
      throw lastError;
    }`
);

fs.writeFileSync('src/services/ai/AIRouter.ts', code);
