const fs = require('fs');
let code = fs.readFileSync('src/services/ai/AIRouter.ts', 'utf8');

const fallbackHelpers = `
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
        console.warn(\`[AIRouter] Provider \${providerId} failed: \${parsedError.code} - \${parsedError.message}. Trying next fallback...\`);
      }
    }

    if (lastError) {
      const parsed = AIErrorHandler.parse(lastError);
      if (parsed.code === 'AUTH_FAILURE' && attempted > 1) {
         throw new Error('No AI provider is currently configured. Please check your AI Settings to add an API key.');
      }
      throw lastError;
    }
    
    throw new Error('No AI provider is currently configured.');
  }
`;

code = code.replace(
  "class AIRouterService {",
  "import { AIErrorHandler } from './AIErrorHandler';\n\nclass AIRouterService {" + fallbackHelpers
);

// Replace ask
code = code.replace(
  /async ask\([\s\S]*?\): Promise<AIResponse> \{[\s\S]*?return await provider\.ask\(prompt, mergedOptions\);\n  \}/,
  `async ask(prompt: string, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.ask(prompt, mergedOptions));
  }`
);

// Replace streamResponse
code = code.replace(
  /async streamResponse\([\s\S]*?\): Promise<AIResponse> \{[\s\S]*?return await provider\.streamResponse\(prompt, mergedOptions, onChunk\);\n  \}/,
  `async streamResponse(prompt: string, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}, onChunk?: (chunk: string) => void): Promise<AIResponse> {
    const proxy = { hasYielded: false };
    const onChunkWrapper = onChunk ? (chunk: string) => { proxy.hasYielded = true; onChunk(chunk); } : undefined;
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.streamResponse(prompt, mergedOptions, onChunkWrapper), proxy);
  }`
);

// Replace summarize
code = code.replace(
  /async summarize\([\s\S]*?\): Promise<AIResponse> \{[\s\S]*?return await provider\.summarize\(text, mergedOptions\);\n  \}/,
  `async summarize(text: string, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.summarize(text, mergedOptions));
  }`
);

// Replace explain
code = code.replace(
  /async explain\([\s\S]*?\): Promise<AIResponse> \{[\s\S]*?return await provider\.explain\(concept, mergedOptions\);\n  \}/,
  `async explain(concept: string, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.explain(concept, mergedOptions));
  }`
);

// Replace generateQuestions
code = code.replace(
  /async generateQuestions\([\s\S]*?\): Promise<PracticeQuestion\[\]> \{[\s\S]*?return await provider\.generateQuestions\(params, mergedOptions\);\n  \}/,
  `async generateQuestions(params: PracticeQuestionParams, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<PracticeQuestion[]> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.generateQuestions(params, mergedOptions));
  }`
);

// Replace evaluateAnswer
code = code.replace(
  /async evaluateAnswer\([\s\S]*?\): Promise<AnswerEvaluation> \{[\s\S]*?return await provider\.evaluateAnswer\(question, userAnswer, referenceSolution, mergedOptions\);\n  \}/,
  `async evaluateAnswer(question: string, userAnswer: string, referenceSolution: string | undefined, aiSettings: UserSettings['ai'], options: AIRequestOptions = {}): Promise<AnswerEvaluation> {
    return this.executeWithFallback(aiSettings, options, (provider, mergedOptions) => provider.evaluateAnswer(question, userAnswer, referenceSolution, mergedOptions));
  }`
);


fs.writeFileSync('src/services/ai/AIRouter.ts', code);
