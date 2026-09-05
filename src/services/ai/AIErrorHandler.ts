import { GEMINI_PRIMARY_MODEL } from './config';

export type AIErrorCode =
  | 'RATE_LIMIT_EXCEEDED'
  | 'SERVICE_UNAVAILABLE'
  | 'AUTH_FAILURE'
  | 'MODEL_NOT_FOUND'
  | 'OFFLINE_NETWORK'
  | 'LOCAL_PROVIDER_OFFLINE'
  | 'UNKNOWN_ERROR';

export interface HumanizedAIError {
  code: AIErrorCode;
  title: string;
  message: string;
  suggestion: string;
  retryable: boolean;
  suggestedMode?: 'automatic' | 'online' | 'local' | 'offline';
  originalMessage?: string;
}

export class AIErrorHandler {
  /**
   * Normalizes raw errors from any AI provider/HTTP endpoint into a human-readable structure
   */
  public static parse(error: any): HumanizedAIError {
    let rawMsg = typeof error === 'string' ? error : error?.message || error?.error || String(error);

    // If rawMsg itself is a stringified JSON object, extract the inner message cleanly
    if (typeof rawMsg === 'string' && (rawMsg.startsWith('{') || rawMsg.includes('"error"'))) {
      try {
        const parsedJson = JSON.parse(rawMsg);
        if (parsedJson?.error?.message) {
          rawMsg = parsedJson.error.message;
        } else if (parsedJson?.error) {
          rawMsg = typeof parsedJson.error === 'string' ? parsedJson.error : JSON.stringify(parsedJson.error);
        }
      } catch (e) {
        // Ignored
      }
    }

    const errStr = String(rawMsg);

    // 1. Missing API Key / Not Configured
    if (
      errStr.includes('API key is not configured') ||
      errStr.includes('API key is missing') ||
      errStr.includes('GEMINI_API_KEY environment variable not set')
    ) {
      return {
        code: 'AUTH_FAILURE',
        title: 'Gemini API Key Missing',
        message: 'Gemini API key is not configured.',
        suggestion: 'Add your GEMINI_API_KEY in environment variables or AI Settings.',
        retryable: false,
        originalMessage: rawMsg
      };
    }

    // 2. Authentication Failures (401, 403, UNAUTHENTICATED, invalid key)
    if (
      errStr.includes('401') ||
      errStr.includes('403') ||
      errStr.includes('UNAUTHENTICATED') ||
      errStr.includes('authentication failed') ||
      errStr.includes('Authentication failed') ||
      errStr.includes('Invalid or unauthenticated')
    ) {
      return {
        code: 'AUTH_FAILURE',
        title: 'Gemini Authentication Failed',
        message: 'Gemini authentication failed. Check your API key and project permissions.',
        suggestion: 'Verify your GEMINI_API_KEY in Settings.',
        retryable: false,
        originalMessage: rawMsg
      };
    }

    // 3. Rate Limit Exceeded (429, RESOURCE_EXHAUSTED)
    if (
      errStr.includes('429') ||
      errStr.includes('RESOURCE_EXHAUSTED') ||
      errStr.includes('rate-limited') ||
      errStr.includes('Rate limit') ||
      errStr.includes('rate limit reached') ||
      errStr.includes('Quota exceeded')
    ) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        title: 'Gemini Rate Limit Reached',
        message: 'Gemini rate limit reached. Please wait a moment or use another AI provider.',
        suggestion: 'Wait a few seconds or switch to Local AI mode in Settings.',
        retryable: true,
        suggestedMode: 'local',
        originalMessage: rawMsg
      };
    }

    // 4. Service Unavailable / Overloaded (503, 500, 502, UNAVAILABLE, high demand)
    if (
      errStr.includes('503') ||
      errStr.includes('500') ||
      errStr.includes('502') ||
      errStr.includes('UNAVAILABLE') ||
      errStr.includes('high demand') ||
      errStr.includes('overloaded') ||
      errStr.includes('Service Unavailable') ||
      errStr.includes('temporarily unavailable')
    ) {
      return {
        code: 'SERVICE_UNAVAILABLE',
        title: 'Gemini Service Temporarily Unavailable',
        message: 'Gemini service is temporarily unavailable. Retrying with fallback.',
        suggestion: 'Please try again in a few moments or switch to Local AI.',
        retryable: true,
        suggestedMode: 'local',
        originalMessage: rawMsg
      };
    }

    // 5. Model Not Found / Deprecated (404, NOT_FOUND)
    if (
      errStr.includes('404') ||
      errStr.includes('NOT_FOUND') ||
      errStr.includes('no longer available') ||
      errStr.includes('not found')
    ) {
      return {
        code: 'MODEL_NOT_FOUND',
        title: 'Gemini Model Unavailable',
        message: 'Gemini model or endpoint is unavailable. Veronica will try a supported fallback model.',
        suggestion: `Veronica is routing your request to ${GEMINI_PRIMARY_MODEL} automatically.`,
        retryable: true,
        originalMessage: rawMsg
      };
    }

    // 6. Offline / Network Disconnected
    if (
      errStr.includes('offline') ||
      errStr.includes('Failed to fetch') ||
      errStr.includes('NetworkError') ||
      errStr.includes('Internet connection unavailable') ||
      errStr.includes('Unable to reach Gemini') ||
      errStr.includes('network')
    ) {
      return {
        code: 'OFFLINE_NETWORK',
        title: 'Network Connection Required',
        message: 'Unable to reach Gemini. Check your internet connection.',
        suggestion: 'Check your Wi-Fi/cellular connection or launch Ollama for Local AI.',
        retryable: true,
        suggestedMode: 'offline',
        originalMessage: rawMsg
      };
    }

    // 7. Local Provider Offline
    if (
      errStr.includes('Ollama') ||
      errStr.includes('Local AI') ||
      errStr.includes('http://localhost:11434') ||
      errStr.includes('11434')
    ) {
      return {
        code: 'LOCAL_PROVIDER_OFFLINE',
        title: 'Local AI Not Active',
        message: 'The local Ollama AI engine is not running on this device.',
        suggestion: 'Ensure Ollama is running on http://localhost:11434 or switch to Cloud AI mode.',
        retryable: true,
        suggestedMode: 'automatic',
        originalMessage: rawMsg
      };
    }

    // Clean fallback message without raw JSON
    let cleanMessage = errStr.replace(/\{.*?\}/g, '').trim();
    if (!cleanMessage || cleanMessage.length < 3) {
      cleanMessage = 'An unexpected issue occurred while communicating with Gemini Cloud AI.';
    }

    return {
      code: 'UNKNOWN_ERROR',
      title: 'AI Request Interrupted',
      message: cleanMessage,
      suggestion: 'Please try asking again or test your AI providers in Settings.',
      retryable: true,
      originalMessage: rawMsg
    };
  }

  /**
   * Formats human-readable markdown alert for chat interface
   */
  public static formatChatNotice(error: any): string {
    const humanized = this.parse(error);
    return `⚠️ **${humanized.title}**\n${humanized.message}\n\n💡 **Suggested Action:** ${humanized.suggestion}`;
  }
}
