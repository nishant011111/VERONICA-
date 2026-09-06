const fs = require('fs');
let code = fs.readFileSync('src/services/ai/AIProviderManager.ts', 'utf8');

if (!code.includes('OpenAIProvider')) {
  code = code.replace(
    "import { GroqProvider } from './providers/GroqProvider';",
    "import { GroqProvider } from './providers/GroqProvider';\nimport { OpenAIProvider } from './providers/OpenAIProvider';"
  );
  
  code = code.replace(
    "providers.set('groq', new GroqProvider());",
    "providers.set('openai', new OpenAIProvider());\n    providers.set('groq', new GroqProvider());"
  );
  
  fs.writeFileSync('src/services/ai/AIProviderManager.ts', code);
}
