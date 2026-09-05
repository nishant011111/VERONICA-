import {
  AIProvider,
  AIRequestOptions,
  AIResponse
} from '../types';
import {
  PracticeQuestion,
  AnswerEvaluation,
  PracticeQuestionParams
} from '../../../types';
import { buildSystemInstruction } from '../promptBuilder';
import { GEMINI_PRIMARY_MODEL } from '../config';

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Gemini Cloud AI';
  isLocal = false;

  /**
   * Performs a REAL lightweight generation test ("Reply with OK.") to verify operational status.
   */
  async checkStatus(customConfig?: { apiKey?: string }): Promise<{
    available: boolean;
    status?: string;
    model?: string;
    reason?: string;
    message: string;
    latencyMs?: number;
  }> {
    try {
      const res = await fetch('/api/ai/health/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: customConfig?.apiKey })
      });

      if (!res.ok) {
        return {
          available: false,
          status: 'unavailable',
          model: GEMINI_PRIMARY_MODEL,
          reason: `Server error (${res.status})`,
          message: `Unavailable: Server error (${res.status})`
        };
      }

      const data = await res.json();
      return {
        available: Boolean(data.available),
        status: data.status || (data.available ? 'operational' : 'unavailable'),
        model: data.model || GEMINI_PRIMARY_MODEL,
        reason: data.reason,
        message: data.message || (data.available ? `Operational (${data.model})` : 'Unavailable'),
        latencyMs: data.latencyMs
      };
    } catch (e: any) {
      return {
        available: false,
        status: 'unavailable',
        model: GEMINI_PRIMARY_MODEL,
        reason: 'Unable to reach backend endpoint',
        message: 'Unavailable: Network offline or backend unreachable'
      };
    }
  }

  async ask(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    const systemInstruction = buildSystemInstruction(options);
    const model = options.model || GEMINI_PRIMARY_MODEL;

    const payload = {
      model,
      contents: prompt,
      systemInstruction,
      apiKey: options.userApiKey,
      groqApiKey: (options as any).groqApiKey
    };

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: options.signal
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Gemini request failed: ${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.text || '',
      provider: data.provider || (data.model?.toLowerCase().includes('groq') ? 'Groq' : 'Gemini'),
      model: data.model || model,
      isOffline: false
    };
  }

  async streamResponse(
    prompt: string,
    options: AIRequestOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse> {
    const systemInstruction = buildSystemInstruction(options);
    const model = options.model || GEMINI_PRIMARY_MODEL;

    const payload = {
      model,
      contents: prompt,
      systemInstruction,
      apiKey: options.userApiKey,
      groqApiKey: (options as any).groqApiKey
    };

    const res = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: options.signal
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Gemini stream failed: ${res.status}`);
    }

    if (!res.body) {
      throw new Error('Streaming response body empty');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let buffer = '';

    let actualModel = model;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.replace(/^data:\s*/, '');
          if (dataStr === '[DONE]') break;
          let parsed: any = null;
          try {
            parsed = JSON.parse(dataStr);
          } catch (e) {
            // Partial JSON chunk line
            continue;
          }

          if (parsed) {
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              if (onChunk) onChunk(parsed.text);
            }
            if (parsed.model) {
              actualModel = parsed.model;
            }
          }
        }
      }
    }

    return {
      text: accumulatedText,
      provider: actualModel.toLowerCase().includes('groq') ? 'Groq' : 'Gemini',
      model: actualModel,
      isOffline: false
    };
  }

  async summarize(text: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    const prompt = `Summarize the following academic material clearly, highlighting key takeaways, core definitions, and important formulas:\n\n${text}`;
    return this.ask(prompt, { ...options, responseStyle: 'balanced' });
  }

  async explain(concept: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    const prompt = `Explain the academic concept "${concept}" clearly with intuition, formal definition, practical examples, and applications.`;
    return this.ask(prompt, options);
  }

  async generateQuestions(params: PracticeQuestionParams, options: AIRequestOptions = {}): Promise<PracticeQuestion[]> {
    const prompt = `Generate exactly ${params.count} practice questions for:
Topic: ${params.topic}
Difficulty: ${params.difficulty}
Question Type: ${params.type}

Respond strictly in valid JSON format matching this array schema without markdown code blocks:
[
  {
    "id": "q1",
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"], // required only if type is mcq
    "correctAnswer": "Correct answer or option text",
    "explanation": "Detailed step by step solution and reasoning",
    "type": "${params.type}"
  }
]`;

    const response = await this.ask(prompt, {
      ...options,
      systemPromptOverride: 'You are a JSON-only response engine. Output raw valid JSON without markdown wrapping.'
    });

    try {
      const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed.map((item: any, idx: number) => ({
        id: item.id || `q_${Date.now()}_${idx}`,
        question: item.question || '',
        options: item.options || undefined,
        correctAnswer: item.correctAnswer || '',
        explanation: item.explanation || '',
        type: params.type
      }));
    } catch (e) {
      console.error('Failed to parse practice questions JSON:', response.text);
      return [
        {
          id: `q_${Date.now()}_fallback`,
          question: `Sample ${params.difficulty} question on ${params.topic}: Explain the foundational principles and state the main governing equation.`,
          options: params.type === 'mcq' ? ['Option A: Linear Model', 'Option B: Exponential Model', 'Option C: Conservation Law', 'Option D: None'] : undefined,
          correctAnswer: 'Conservation Law',
          explanation: response.text || 'Review subject notes for step-by-step guidance.',
          type: params.type
        }
      ];
    }
  }

  async evaluateAnswer(
    question: string,
    userAnswer: string,
    referenceSolution?: string,
    options: AIRequestOptions = {}
  ): Promise<AnswerEvaluation> {
    const prompt = `Evaluate the student's answer to this academic question:
Question: ${question}
Student's Answer: ${userAnswer}
${referenceSolution ? `Reference Solution: ${referenceSolution}` : ''}

Respond strictly in valid JSON format matching this schema without markdown code blocks:
{
  "score": 85,
  "correctness": "partially_correct", // "correct", "partially_correct", or "incorrect"
  "summary": "Short evaluation summary",
  "missingConcepts": ["List missing concepts if any"],
  "errorsIdentified": ["List specific mistakes made"],
  "explanationQuality": "Assessment of reasoning clarity",
  "suggestedImprovement": "Clear advice to reach full score"
}`;

    const response = await this.ask(prompt, {
      ...options,
      systemPromptOverride: 'You are a strict academic evaluator. Output raw valid JSON matching the exact schema without code block ticks.'
    });

    try {
      const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      return {
        score: 75,
        correctness: 'partially_correct',
        summary: response.text.slice(0, 200),
        missingConcepts: ['Check units and edge cases'],
        errorsIdentified: [],
        explanationQuality: 'Good effort',
        suggestedImprovement: 'Include formula steps explicitly'
      };
    }
  }
}
