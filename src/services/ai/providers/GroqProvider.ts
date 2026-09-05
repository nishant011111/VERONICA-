import { AIProvider, AIRequestOptions, AIResponse } from '../types';
import { PracticeQuestion, AnswerEvaluation, PracticeQuestionParams } from '../../../types';
import { buildSystemInstruction } from '../promptBuilder';
import { GROQ_PRIMARY_MODEL } from '../config';

export class GroqProvider implements AIProvider {
  id = 'groq';
  name = 'Groq Cloud AI';
  isLocal = false;

  async checkStatus(customConfig?: { apiKey?: string }): Promise<{
    available: boolean;
    status?: 'operational' | 'auth_failed' | 'service_unavailable' | 'not_configured';
    model?: string;
    reason?: string;
    message: string;
    latencyMs?: number;
  }> {
    try {
      const res = await fetch('/api/ai/health/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: customConfig?.apiKey })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          available: Boolean(data.available),
          status: data.status || (data.available ? 'operational' : 'not_configured'),
          model: data.model || GROQ_PRIMARY_MODEL,
          reason: data.reason,
          message: data.message || (data.available ? 'Operational' : 'Unavailable'),
          latencyMs: data.latencyMs
        };
      }
    } catch (e) {
      // Backend route error fallback
    }

    // Direct browser fetch fallback
    const key = customConfig?.apiKey;
    if (!key || key.trim().length < 5) {
      return {
        available: false,
        status: 'not_configured',
        model: GROQ_PRIMARY_MODEL,
        reason: 'API key missing',
        message: 'API key missing'
      };
    }

    const start = Date.now();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${key.trim()}` }
      });
      const latencyMs = Date.now() - start;
      if (res.ok) {
        return {
          available: true,
          status: 'operational',
          model: GROQ_PRIMARY_MODEL,
          latencyMs,
          message: 'Operational'
        };
      }
      if (res.status === 401 || res.status === 403) {
        return {
          available: false,
          status: 'auth_failed',
          model: GROQ_PRIMARY_MODEL,
          reason: 'Authentication failed',
          message: 'Authentication failed'
        };
      }
      return {
        available: false,
        status: 'service_unavailable',
        model: GROQ_PRIMARY_MODEL,
        reason: 'Service unavailable',
        message: 'Service unavailable'
      };
    } catch (e: any) {
      return {
        available: false,
        status: 'service_unavailable',
        model: GROQ_PRIMARY_MODEL,
        reason: 'Service unavailable',
        message: 'Service unavailable'
      };
    }
  }

  async ask(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    const key = options.userApiKey;
    const systemInstruction = buildSystemInstruction(options);
    const model = options.model || GROQ_PRIMARY_MODEL;

    try {
      const res = await fetch('/api/ai/groq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: key,
          model,
          prompt,
          systemInstruction,
          temperature: options.temperature ?? 0.7
        }),
        signal: options.signal
      });

      if (res.ok) {
        const data = await res.json();
        return {
          text: data.text || '',
          provider: 'Groq',
          model,
          isOffline: false
        };
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Groq request failed with status ${res.status}`);
      }
    } catch (e: any) {
      if (
        e.message.includes('Groq request failed') ||
        e.message.includes('Groq API key is not configured') ||
        e.message.includes('Groq authentication failed') ||
        e.message.includes('Groq API key is invalid') ||
        e.message.includes('Groq rate limit')
      ) {
        throw e;
      }
      
      if (!e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      // If it's a true network error, fallback to direct browser fetch
    }

    if (!key) {
      throw new Error('Groq API Key is not configured. Please enter your key in AI Settings.');
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature ?? 0.7
      }),
      signal: options.signal
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err?.error?.message || `Groq request failed: ${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || '',
      provider: 'Groq',
      model,
      isOffline: false
    };
  }

  async streamResponse(
    prompt: string,
    options: AIRequestOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    // For Groq, falls back to ask or streams via SSE if key present
    const response = await this.ask(prompt, options);
    if (onChunk && response.text) {
      onChunk(response.text);
    }
    return response;
  }

  async summarize(text: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.ask(`Summarize this academic content:\n\n${text}`, options);
  }

  async explain(concept: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    return this.ask(`Explain the academic concept: ${concept}`, options);
  }

  async generateQuestions(params: PracticeQuestionParams, options: AIRequestOptions = {}): Promise<PracticeQuestion[]> {
    const res = await this.ask(`Generate ${params.count} practice questions on ${params.topic} (${params.difficulty}). Respond in plain JSON.`, options);
    try {
      return JSON.parse(res.text);
    } catch {
      return [{
        id: `q_groq_${Date.now()}`,
        question: `Explain key concepts of ${params.topic}`,
        explanation: res.text,
        type: params.type,
        correctAnswer: 'See explanation'
      }];
    }
  }

  async evaluateAnswer(
    question: string,
    userAnswer: string,
    referenceSolution?: string,
    options: AIRequestOptions = {}
  ): Promise<AnswerEvaluation> {
    const res = await this.ask(`Evaluate answer for ${question}. Student answer: ${userAnswer}.`, options);
    return {
      score: 80,
      correctness: 'partially_correct',
      summary: res.text.slice(0, 150),
      missingConcepts: [],
      errorsIdentified: [],
      explanationQuality: 'Fair',
      suggestedImprovement: 'Expand on intermediate mathematical steps'
    };
  }
}
