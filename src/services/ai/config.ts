export const GEMINI_PRIMARY_MODEL = 'gemini-3.1-flash-lite';

export const GEMINI_FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
];

export const OPENAI_PRIMARY_MODEL = 'gpt-5.6-luna';
export const OPENAI_FALLBACK_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
export const GROQ_PRIMARY_MODEL = 'openai/gpt-oss-20b';
export const GROQ_FALLBACK_MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'groq/compound'
];

export const OLLAMA_PRIMARY_MODEL = 'llama3';
export const OLLAMA_FALLBACK_MODELS = ['mistral', 'gemma'];

export const ANDROID_PRIMARY_MODEL = 'Gemini Nano (On-Device)';

export const AI_HEALTH_TEST_PROMPT = 'Reply with OK.';

export const AI_PROVIDERS_CONFIG = {
  openai: {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    primaryModel: OPENAI_PRIMARY_MODEL,
    fallbackModels: OPENAI_FALLBACK_MODELS,
    enabled: true
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini Cloud AI',
    primaryModel: GEMINI_PRIMARY_MODEL,
    fallbackModels: GEMINI_FALLBACK_MODELS,
    enabled: true
  },
  groq: {
    id: 'groq',
    name: 'Groq Cloud AI',
    primaryModel: GROQ_PRIMARY_MODEL,
    fallbackModels: GROQ_FALLBACK_MODELS,
    enabled: true
  },
  ollama: {
    id: 'ollama',
    name: 'Local AI (Ollama)',
    primaryModel: OLLAMA_PRIMARY_MODEL,
    fallbackModels: OLLAMA_FALLBACK_MODELS,
    enabled: true
  },
  android_local: {
    id: 'android_local',
    name: 'Android On-Device AI',
    primaryModel: ANDROID_PRIMARY_MODEL,
    fallbackModels: [],
    enabled: true
  }
};

