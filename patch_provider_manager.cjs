const fs = require('fs');
let code = fs.readFileSync('src/services/ai/AIProviderManager.ts', 'utf8');

code = code.replace(
  "private static providers: Record<string, AIProvider> = {",
  "private static providers: Record<string, AIProvider> = {\n    openai: new OpenAIProvider(),"
);

const newModelsFunc = `  static async getAvailableModels(providerId: string, settings: any): Promise<string[]> {
      if (providerId === 'openai') return ['gpt-5.6-luna', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
      if (providerId === 'gemini') return ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash'];
      if (providerId === 'groq') return ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'groq/compound'];
      if (providerId === 'ollama') return ['llama3', 'mistral', 'gemma'];
      return ['default'];
  }`;

code = code.replace(
  /static async getAvailableModels[\s\S]*?return \['default'\];\n  }/,
  newModelsFunc
);

fs.writeFileSync('src/services/ai/AIProviderManager.ts', code);
