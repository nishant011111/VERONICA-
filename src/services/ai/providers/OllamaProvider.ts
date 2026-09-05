import { AIProvider, AIRequestOptions, AIResponse } from '../types';
import { PracticeQuestion, AnswerEvaluation, PracticeQuestionParams } from '../../../types';
import { buildSystemInstruction } from '../promptBuilder';
import { OLLAMA_PRIMARY_MODEL } from '../config';

export class OllamaProvider implements AIProvider {
  id = 'ollama';
  name = 'Ollama (Local AI)';
  isLocal = true;

  private defaultHost = 'http://localhost:11434';

  private getHost(customConfig?: { ollamaHost?: string }): string {
    return (customConfig?.ollamaHost || this.defaultHost).replace(/\/$/, '');
  }

  async checkStatus(customConfig?: { ollamaHost?: string }): Promise<{ available: boolean; message: string; latencyMs?: number }> {
    const host = this.getHost(customConfig);
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${host}/api/tags`, {
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));

      if (res.ok) {
        const data = await res.json();
        const models = data.models || [];
        const latencyMs = Date.now() - start;
        if (models.length > 0) {
          return {
            available: true,
            message: `Available (${models[0].name})`,
            latencyMs
          };
        }
        return { available: true, message: 'Ollama service active (no local models pulled yet)', latencyMs };
      }
      return { available: false, message: 'Ollama service offline or not running' };
    } catch (e: any) {
      return { available: false, message: 'Offline AI is not configured or reachable on this device.' };
    }
  }

  async ask(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    const host = this.getHost({ ollamaHost: (options as any).ollamaHost });
    const status = await this.checkStatus({ ollamaHost: (options as any).ollamaHost });

    if (!status.available) {
      throw new Error('Offline AI is not configured on this device. Please start Ollama locally or switch to Online AI mode in Settings.');
    }

    const systemInstruction = buildSystemInstruction(options);
    const model = options.model || OLLAMA_PRIMARY_MODEL;

    const res = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${systemInstruction}\n\nUser Question:\n${prompt}`,
        stream: false
      }),
      signal: options.signal
    });

    if (!res.ok) {
      throw new Error(`Local Ollama error (${res.status}): Make sure model "${model}" is installed.`);
    }

    const data = await res.json();
    return {
      text: data.response || '',
      provider: 'Ollama (Local)',
      model,
      isOffline: true
    };
  }

  async streamResponse(
    prompt: string,
    options: AIRequestOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    const host = this.getHost({ ollamaHost: (options as any).ollamaHost });
    const status = await this.checkStatus({ ollamaHost: (options as any).ollamaHost });

    if (!status.available) {
      throw new Error('Offline AI is not configured on this device. Please start Ollama locally or switch to Online AI mode in Settings.');
    }

    const systemInstruction = buildSystemInstruction(options);
    const model = options.model || OLLAMA_PRIMARY_MODEL;

    const res = await fetch(`${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${systemInstruction}\n\nUser Question:\n${prompt}`,
        stream: true
      }),
      signal: options.signal
    });

    if (!res.ok || !res.body) {
      throw new Error(`Local Ollama streaming error (${res.status}).`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkStr = decoder.decode(value, { stream: true });
      const lines = chunkStr.split('\n');

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            accumulatedText += parsed.response;
            if (onChunk) onChunk(parsed.response);
          }
        } catch (e) {
          // ignore stream parse chunking errors
        }
      }
    }

    return {
      text: accumulatedText,
      provider: 'Ollama (Local)',
      model,
      isOffline: true
    };
  }

  async summarize(text: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.ask(`Summarize the following notes:\n\n${text}`, options);
  }

  async explain(concept: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.ask(`Explain the academic concept: ${concept}`, options);
  }

  async generateQuestions(params: PracticeQuestionParams, options: AIRequestOptions = {}): Promise<PracticeQuestion[]> {
    const res = await this.ask(`Generate ${params.count} practice questions for ${params.topic}.`, options);
    return [{
      id: `q_ollama_${Date.now()}`,
      question: `Practice question on ${params.topic}`,
      explanation: res.text,
      type: params.type,
      correctAnswer: 'Refer to local explanation'
    }];
  }

  async evaluateAnswer(
    question: string,
    userAnswer: string,
    referenceSolution?: string,
    options: AIRequestOptions = {}
  ): Promise<AnswerEvaluation> {
    const res = await this.ask(`Evaluate answer to: ${question}\nStudent answer: ${userAnswer}`, options);
    return {
      score: 80,
      correctness: 'partially_correct',
      summary: res.text.slice(0, 150),
      missingConcepts: [],
      errorsIdentified: [],
      explanationQuality: 'Local Evaluation',
      suggestedImprovement: 'Review formulas step-by-step'
    };
  }
}
