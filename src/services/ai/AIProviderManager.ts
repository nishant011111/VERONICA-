import { AIProvider } from './types';
import { GeminiProvider } from './providers/GeminiProvider';
import { GroqProvider } from './providers/GroqProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { OllamaProvider } from './providers/OllamaProvider';

export class AIProviderManager {
  private static providers: Record<string, AIProvider> = {
    openai: new OpenAIProvider(),
    gemini: new GeminiProvider(),
    groq: new GroqProvider(),
    ollama: new OllamaProvider(),
  };

  static getProvider(id: string): AIProvider | undefined {
    return this.providers[id];
  }

  static getAvailableProviderIds(): string[] {
    return Object.keys(this.providers);
  }
  
    static async getAvailableModels(providerId: string, settings: any): Promise<string[]> {
      if (providerId === 'openai') return ['gpt-5.6-luna', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
      if (providerId === 'gemini') return ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash'];
      if (providerId === 'groq') return ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'groq/compound'];
      if (providerId === 'ollama') return ['llama3', 'mistral', 'gemma'];
      return ['default'];
  }
}
