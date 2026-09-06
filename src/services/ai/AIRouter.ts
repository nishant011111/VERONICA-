import {
  AIProvider,
  AIRequestOptions,
  AIResponse
} from './types';
import { AIProviderManager } from './AIProviderManager';
import {
  UserSettings,
  PracticeQuestion,
  AnswerEvaluation,
  PracticeQuestionParams,
  AIProviderStatusInfo,
  AIProviderType
} from '../../types';

import { AIErrorHandler } from './AIErrorHandler';

class AIRouterService {
  private getFallbackChain(activeProvider: string): string[] {
    const defaultChain = ['gemini', 'openai', 'ollama'];
    const chain = new Set([activeProvider, ...defaultChain]);
    return Array.from(chain);
  }

  private async executeWithFallback<T>(
    aiSettings: UserSettings['ai'],
    options: AIRequestOptions,
    operation: (provider: AIProvider, mergedOptions: AIRequestOptions) => Promise<T>,
    onChunkProxy?: { hasYielded: boolean }
  ): Promise<T> {
    const chain = this.getFallbackChain(aiSettings.activeProvider);
    let lastError: any = null;
    let attempted = 0;

    for (const providerId of chain) {
      const provider = AIProviderManager.getProvider(providerId);
      if (!provider) continue;

      const mergedOptions: AIRequestOptions = {
        explanationLevel: options.explanationLevel || aiSettings.explanationLevel,
        responseStyle: options.responseStyle || aiSettings.responseStyle,
        userApiKey: providerId === 'groq' ? aiSettings.groqApiKey : aiSettings.geminiApiKey,
        groqApiKey: aiSettings.groqApiKey,
        ollamaHost: aiSettings.ollamaHost,
        model: providerId === aiSettings.activeProvider ? (options.model || aiSettings.activeModel) : undefined,
        ...options
      };

      try {
        attempted++;
        return await operation(provider, mergedOptions);
      } catch (err: any) {
        lastError = err;
        
        // If it already yielded chunks, we can't safely fallback and restart the stream
        if (onChunkProxy && onChunkProxy.hasYielded) {
          throw err; 
        }

        const parsedError = AIErrorHandler.parse(err);
        console.warn(`[AIRouter] Provider ${providerId} failed: ${parsedError.code} - ${parsedError.message}. Trying next fallback...`);
      }
    }

    if (lastError) {
      const parsed = AIErrorHandler.parse(lastError);
      if (attempted > 1) {
         throw new Error('All AI providers are currently unavailable or unconfigured. Please check your active provider and API keys in AI Settings.');
      }
      throw lastError;
    }
    
    throw new Error('No AI provider is currently configured.');
  }


  /** Resolve appropriate AI provider based on user settings */
  private async getProvider(aiSettings: UserSettings['ai']): Promise<AIProvider> {
    const providerId = aiSettings.activeProvider;
    const provider = AIProviderManager.getProvider(providerId);
    
    if (!provider) {
        throw new Error(`Provider ${providerId} is not configured or enabled.`);
    }

    return provider;
  }

  /** Execute Ask query */
  async ask(prompt: string, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.ask(prompt, mergedOptions));
  }

  /** Execute Streaming response */
  async streamResponse(prompt: string, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}, onChunk?: (chunk: string) => void): Promise<AIResponse> {
    const proxy = { hasYielded: false };
    const onChunkWrapper = onChunk ? (chunk: string) => { proxy.hasYielded = true; onChunk(chunk); } : undefined;
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.streamResponse(prompt, mergedOptions, onChunkWrapper), proxy);
  }

  /** Summarize */
  async summarize(text: string, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.summarize(text, mergedOptions));
  }

  /** Explain Concept */
  async explain(concept: string, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.explain(concept, mergedOptions));
  }

  /** Generate Practice Questions */
  async generateQuestions(params: PracticeQuestionParams, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<PracticeQuestion[]> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.generateQuestions(params, mergedOptions));
  }

  /** Evaluate Student Answer */
  async evaluateAnswer(question: string, userAnswer: string, referenceSolution: string | undefined, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<AnswerEvaluation> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.evaluateAnswer(question, userAnswer, referenceSolution, mergedOptions));
  }

  /** Fetch status for all registered providers sequentially (Real Pings) */
  async getAllProviderStatuses(aiSettings: UserSettings['ai']): Promise<AIProviderStatusInfo[]> {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const isOnline = navigator.onLine;

    const results: AIProviderStatusInfo[] = [];

    // 1. Internet Connection Test
    results.push({
      id: 'internet',
      name: 'Internet Connection',
      status: isOnline ? 'operational' : 'offline',
      message: isOnline ? 'Online' : 'Disconnected',
      lastChecked: now
    });

    for (const id of AIProviderManager.getAvailableProviderIds()) {
        const provider = AIProviderManager.getProvider(id);
        if (!provider) continue;

        const res = await provider.checkStatus({ 
            apiKey: id === 'gemini' ? aiSettings.geminiApiKey : (id === 'groq' ? aiSettings.groqApiKey : undefined),
            ollamaHost: id === 'ollama' ? aiSettings.ollamaHost : undefined
        });

        results.push({
          id: id as AIProviderType,
          name: provider.name,
          status: (res.status as any) || (res.available ? 'operational' : 'unavailable'),
          model: res.model,
          reason: res.reason,
          message: res.message,
          latencyMs: res.latencyMs,
          lastChecked: now
        });
    }

    return results;
  }
}

export const AIRouter = new AIRouterService();
