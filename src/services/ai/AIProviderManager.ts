import { AIProvider } from './types';
import { GeminiProvider } from './providers/GeminiProvider';
import { GroqProvider } from './providers/GroqProvider';
import { OllamaProvider } from './providers/OllamaProvider';

export class AIProviderManager {
  private static providers: Record<string, AIProvider> = {
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
      const provider = this.getProvider(providerId);
      if (!provider) return [];
      // This is a simplification. Real implementation would call provider.getModels()
      if (providerId === 'gemini') return ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.7-flash'];
      if (providerId === 'groq') return ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'groq/compound'];
      return ['default'];
  }
}
