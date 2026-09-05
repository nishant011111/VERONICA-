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

class AIRouterService {

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
  async ask(
    prompt: string,
    aiSettings: UserSettings['ai'],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    const provider = await this.getProvider(aiSettings);
    const mergedOptions: AIRequestOptions = {
        explanationLevel: options.explanationLevel || aiSettings.explanationLevel,
        responseStyle: options.responseStyle || aiSettings.responseStyle,
        userApiKey: aiSettings.activeProvider === 'groq' ? aiSettings.groqApiKey : aiSettings.geminiApiKey,
        groqApiKey: aiSettings.groqApiKey,
        ollamaHost: aiSettings.ollamaHost,
        model: options.model || aiSettings.activeModel, // Need to add activeModel to types
        ...options
    };
    return await provider.ask(prompt, mergedOptions);
  }

  /** Execute Streaming response */
  async streamResponse(
    prompt: string,
    aiSettings: UserSettings['ai'],
    options: AIRequestOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    const provider = await this.getProvider(aiSettings);
    const mergedOptions: AIRequestOptions = {
        explanationLevel: options.explanationLevel || aiSettings.explanationLevel,
        responseStyle: options.responseStyle || aiSettings.responseStyle,
        userApiKey: aiSettings.activeProvider === 'groq' ? aiSettings.groqApiKey : aiSettings.geminiApiKey,
        groqApiKey: aiSettings.groqApiKey,
        ollamaHost: aiSettings.ollamaHost,
        model: options.model || aiSettings.activeModel,
        ...options
    };
    return await provider.streamResponse(prompt, mergedOptions, onChunk);
  }

  /** Summarize */
  async summarize(
    text: string,
    aiSettings: UserSettings['ai'],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    const provider = await this.getProvider(aiSettings);
    const mergedOptions: AIRequestOptions = {
        userApiKey: aiSettings.activeProvider === 'groq' ? aiSettings.groqApiKey : aiSettings.geminiApiKey,
        model: options.model || aiSettings.activeModel,
        ...options
    };
    return await provider.summarize(text, mergedOptions);
  }

  /** Explain Concept */
  async explain(
    concept: string,
    aiSettings: UserSettings['ai'],
    options: AIRequestOptions = {}
  ): Promise<AIResponse> {
    const provider = await this.getProvider(aiSettings);
    const mergedOptions: AIRequestOptions = {
        userApiKey: aiSettings.activeProvider === 'groq' ? aiSettings.groqApiKey : aiSettings.geminiApiKey,
        model: options.model || aiSettings.activeModel,
        ...options
    };
    return await provider.explain(concept, mergedOptions);
  }

  /** Generate Practice Questions */
  async generateQuestions(
    params: PracticeQuestionParams,
    aiSettings: UserSettings['ai'],
    options: AIRequestOptions = {}
  ): Promise<PracticeQuestion[]> {
    const provider = await this.getProvider(aiSettings);
    const mergedOptions: AIRequestOptions = {
        userApiKey: aiSettings.activeProvider === 'groq' ? aiSettings.groqApiKey : aiSettings.geminiApiKey,
        model: options.model || aiSettings.activeModel,
        ...options
    };
    return await provider.generateQuestions(params, mergedOptions);
  }

  /** Evaluate Student Answer */
  async evaluateAnswer(
    question: string,
    userAnswer: string,
    referenceSolution: string | undefined,
    aiSettings: UserSettings['ai'],
    options: AIRequestOptions = {}
  ): Promise<AnswerEvaluation> {
    const provider = await this.getProvider(aiSettings);
    const mergedOptions: AIRequestOptions = {
        userApiKey: aiSettings.activeProvider === 'groq' ? aiSettings.groqApiKey : aiSettings.geminiApiKey,
        model: options.model || aiSettings.activeModel,
        ...options
    };
    return await provider.evaluateAnswer(question, userAnswer, referenceSolution, mergedOptions);
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
