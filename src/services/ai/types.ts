import {
  AcademicMode,
  ExplanationLevel,
  ResponseStyle,
  PracticeQuestion,
  AnswerEvaluation,
  PracticeQuestionParams
} from '../../types';

export interface AIContextData {
  subjectName?: string;
  subjectCode?: string;
  noteTitle?: string;
  noteContent?: string;
  pdfName?: string;
  pdfContent?: string;
  assignmentTitle?: string;
  assignmentDescription?: string;
  topic?: string;
  ragChunks?: { content: string, source: string, pageNumber?: number }[];
}

export interface AIRequestOptions {
  academicMode?: AcademicMode;
  explanationLevel?: ExplanationLevel;
  responseStyle?: ResponseStyle;
  context?: AIContextData;
  systemPromptOverride?: string;
  temperature?: number;
  model?: string;
  userApiKey?: string;
  groqApiKey?: string;
  ollamaHost?: string;
  providerOverride?: string;
  signal?: AbortSignal;
}

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
  isOffline: boolean;
  sources?: string[];
  practiceQuestions?: PracticeQuestion[];
  evaluation?: AnswerEvaluation;
}

export interface AIProvider {
  id: string;
  name: string;
  isLocal: boolean;

  /** Check if the provider is configured and available */
  checkStatus(customConfig?: { ollamaHost?: string; apiKey?: string }): Promise<{
    available: boolean;
    status?: string;
    model?: string;
    reason?: string;
    message: string;
    latencyMs?: number;
  }>;

  /** Standard text generation query */
  ask(prompt: string, options?: AIRequestOptions): Promise<AIResponse>;

  /** Stream response generation */
  streamResponse(
    prompt: string,
    options?: AIRequestOptions,
    onChunk?: (chunk: string) => void
  ): Promise<AIResponse>;

  /** Summarize content */
  summarize(text: string, options?: AIRequestOptions): Promise<AIResponse>;

  /** Explain a concept */
  explain(concept: string, options?: AIRequestOptions): Promise<AIResponse>;

  /** Generate practice questions */
  generateQuestions(params: PracticeQuestionParams, options?: AIRequestOptions): Promise<PracticeQuestion[]>;

  /** Evaluate student answer */
  evaluateAnswer(
    question: string,
    userAnswer: string,
    referenceSolution?: string,
    options?: AIRequestOptions
  ): Promise<AnswerEvaluation>;
}
