import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODELS, GROQ_PRIMARY_MODEL, AI_HEALTH_TEST_PROMPT } from './src/services/ai/config';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to categorize errors cleanly
function classifyGeminiError(error: any): string {
  if (!error) return 'Server error';
  let errStr = typeof error === 'string' ? error : error?.message || error?.error || String(error);

  if (typeof errStr === 'string' && (errStr.startsWith('{') || errStr.includes('"error"'))) {
    try {
      const parsed = JSON.parse(errStr);
      if (parsed?.error?.message) {
        errStr = parsed.error.message;
      }
    } catch (e) {
      // ignore
    }
  }

  const lowStr = String(errStr).toLowerCase();

  if (
    lowStr.includes('api key is not configured') ||
    lowStr.includes('api key is missing') ||
    lowStr.includes('api key missing') ||
    lowStr.includes('gemini_api_key environment variable not set')
  ) {
    return 'API key missing';
  }
  if (
    lowStr.includes('401') ||
    lowStr.includes('403') ||
    lowStr.includes('unauthenticated') ||
    lowStr.includes('api_key_invalid') ||
    lowStr.includes('api key is not valid') ||
    lowStr.includes('invalid api key') ||
    lowStr.includes('authentication failed') ||
    lowStr.includes('invalid credential')
  ) {
    return 'Authentication failed';
  }
  if (
    lowStr.includes('quota exceeded') ||
    lowStr.includes('resource_exhausted') ||
    lowStr.includes('exceeded your current quota') ||
    lowStr.includes('quota')
  ) {
    return 'Quota exceeded';
  }
  if (
    lowStr.includes('429') ||
    lowStr.includes('rate-limited') ||
    lowStr.includes('rate limit') ||
    lowStr.includes('too many requests')
  ) {
    return 'Rate limited';
  }
  if (
    lowStr.includes('404') ||
    lowStr.includes('not_found') ||
    lowStr.includes('no longer available') ||
    lowStr.includes('is not found') ||
    lowStr.includes('model unavailable')
  ) {
    return 'Model unavailable';
  }
  if (
    lowStr.includes('invalid_argument') ||
    lowStr.includes('invalid model') ||
    lowStr.includes('unsupported model') ||
    lowStr.includes('unknown model')
  ) {
    return 'Invalid model';
  }
  if (
    lowStr.includes('fetch failed') ||
    lowStr.includes('enotfound') ||
    lowStr.includes('econnrefused') ||
    lowStr.includes('etimedout') ||
    lowStr.includes('network error') ||
    lowStr.includes('network') ||
    lowStr.includes('offline')
  ) {
    return 'Network error';
  }
  if (
    lowStr.includes('configuration error') ||
    lowStr.includes('misconfigured')
  ) {
    return 'Configuration error';
  }
  if (
    lowStr.includes('500') ||
    lowStr.includes('502') ||
    lowStr.includes('503') ||
    lowStr.includes('504') ||
    lowStr.includes('internal') ||
    lowStr.includes('unavailable') ||
    lowStr.includes('high demand') ||
    lowStr.includes('overloaded') ||
    lowStr.includes('server error')
  ) {
    return 'Server error';
  }

  return 'Server error';
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini Health Check endpoint - performs real lightweight test prompt "Reply with OK."
app.post('/api/ai/health/gemini', async (req, res) => {
  const apiKey = req.body?.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length < 5) {
    return res.json({
      status: 'not_configured',
      available: false,
      model: GEMINI_PRIMARY_MODEL,
      reason: 'API key missing',
      message: 'Gemini API key is missing.',
      lastChecked: new Date().toISOString()
    });
  }

  const start = Date.now();
  const modelsToTest = [GEMINI_PRIMARY_MODEL, ...GEMINI_FALLBACK_MODELS];
  let lastErrorReason = 'Server error';

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    for (const modelCandidate of modelsToTest) {
      try {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: AI_HEALTH_TEST_PROMPT
        });

        if (response && response.text) {
          const latencyMs = Date.now() - start;
          return res.json({
            status: 'operational',
            available: true,
            model: modelCandidate,
            latencyMs,
            message: `Operational (${modelCandidate})`,
            lastChecked: new Date().toISOString()
          });
        }
      } catch (err: any) {
        lastErrorReason = classifyGeminiError(err);
        if (lastErrorReason === 'Authentication failed' || lastErrorReason === 'API key missing') {
          break;
        }
      }
    }

    return res.json({
      status: 'unavailable',
      available: false,
      model: GEMINI_PRIMARY_MODEL,
      reason: lastErrorReason,
      message: `Unavailable: ${lastErrorReason}`,
      lastChecked: new Date().toISOString()
    });
  } catch (err: any) {
    const reason = classifyGeminiError(err);
    return res.json({
      status: 'unavailable',
      available: false,
      model: GEMINI_PRIMARY_MODEL,
      reason,
      message: `Unavailable: ${reason}`,
      lastChecked: new Date().toISOString()
    });
  }
});

// AI Provider Status Summary API
app.get('/api/ai/status', async (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 5);

  res.json({
    gemini: {
      configured: hasGeminiKey,
      status: hasGeminiKey ? 'configured' : 'not_configured',
      message: hasGeminiKey ? 'Gemini API key configured' : 'Gemini API key is not configured.'
    },
    groq: {
      configured: hasGroqKey,
      status: hasGroqKey ? 'configured' : 'not_configured',
      message: hasGroqKey ? 'Groq Cloud API connected' : 'GROQ_API_KEY not configured'
    },
    timestamp: new Date().toISOString()
  });
});

// Groq Health Check API Endpoint (Official Groq Endpoint: https://api.groq.com/openai/v1/models)
app.post('/api/ai/health/groq', async (req, res) => {
  const apiKey = req.body?.apiKey || process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.trim().length < 5) {
    return res.json({
      status: 'not_configured',
      available: false,
      model: GROQ_PRIMARY_MODEL,
      reason: 'API key missing',
      message: 'API key missing',
      lastChecked: new Date().toISOString()
    });
  }

  const start = Date.now();
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    const latencyMs = Date.now() - start;

    if (response.ok) {
      return res.json({
        status: 'operational',
        available: true,
        model: GROQ_PRIMARY_MODEL,
        latencyMs,
        message: 'Operational',
        lastChecked: new Date().toISOString()
      });
    }

    if (response.status === 401 || response.status === 403) {
      return res.json({
        status: 'auth_failed',
        available: false,
        model: GROQ_PRIMARY_MODEL,
        reason: 'Authentication failed',
        message: 'Authentication failed',
        lastChecked: new Date().toISOString()
      });
    }

    return res.json({
      status: 'service_unavailable',
      available: false,
      model: GROQ_PRIMARY_MODEL,
      reason: 'Service unavailable',
      message: 'Service unavailable',
      lastChecked: new Date().toISOString()
    });
  } catch (err: any) {
    return res.json({
      status: 'service_unavailable',
      available: false,
      model: GROQ_PRIMARY_MODEL,
      reason: 'Service unavailable',
      message: 'Service unavailable',
      lastChecked: new Date().toISOString()
    });
  }
});

function classifyGroqError(errorMsg: string, status: number): string {
  if (status === 401 || status === 403 || errorMsg.toLowerCase().includes('invalid api key')) {
    return 'Groq authentication failed.';
  }
  if (status === 429 || errorMsg.toLowerCase().includes('rate limit')) {
    return 'Groq rate limit reached.';
  }
  if (errorMsg.toLowerCase().includes('network error') || errorMsg.toLowerCase().includes('fetch failed')) {
    return 'Unable to connect to Groq.';
  }
  if (errorMsg) {
    return errorMsg;
  }
  return `Groq request failed with status ${status}`;
}

// Groq Non-Streaming Chat API
app.post('/api/ai/groq/chat', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim().length < 5) {
      return res.status(400).json({
        error: 'Groq API key is not configured.'
      });
    }

    const requestedModel = req.body.model || GROQ_PRIMARY_MODEL;
    const messages = req.body.messages || [];
    if (messages.length === 0 && req.body.prompt) {
      if (req.body.systemInstruction) {
        messages.push({ role: 'system', content: req.body.systemInstruction });
      }
      messages.push({ role: 'user', content: req.body.prompt });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: requestedModel,
        messages,
        temperature: req.body.temperature ?? 0.7
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const rawMsg = errData?.error?.message || '';
      const mappedError = classifyGroqError(rawMsg, response.status);
      return res.status(response.status).json({ error: mappedError });
    }

    const data = await response.json();
    res.json({
      text: data.choices?.[0]?.message?.content || '',
      provider: 'Groq',
      model: requestedModel
    });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    const msg = error.message || '';
    if (msg.includes('fetch failed') || msg.includes('network')) {
      return res.status(502).json({ error: 'Unable to connect to Groq.' });
    }
    res.status(500).json({ error: 'Failed to communicate with Groq Cloud AI' });
  }
});

// Gemini Non-Streaming Chat API
app.post('/api/ai/chat', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length < 5) {
      return res.status(400).json({
        error: 'Gemini API key is not configured.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const requestedModel = req.body.model || GEMINI_PRIMARY_MODEL;
    let response = null;

    try {
      response = await ai.models.generateContent({
        model: requestedModel,
        contents: req.body.contents,
        config: {
          systemInstruction: req.body.systemInstruction,
          temperature: req.body.temperature ?? 0.7
        }
      });
    } catch (err: any) {
      throw err;
    }

    if (!response) {
      throw new Error('Gemini model failed to return a response');
    }

    res.json({
      text: response.text || '',
      usage: response.usageMetadata || null,
      model: requestedModel
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const userFriendlyError = classifyGeminiError(error);
    res.status(500).json({ error: userFriendlyError });
  }
});

// Gemini Streaming Chat API (Server-Sent Events)
app.post('/api/ai/stream', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length < 5) {
      return res.status(400).json({
        error: 'Gemini API key is not configured.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const requestedModel = req.body.model || GEMINI_PRIMARY_MODEL;
    let activeStream: AsyncIterable<any> | null = null;

    try {
      const stream = await ai.models.generateContentStream({
        model: requestedModel,
        contents: req.body.contents,
        config: {
          systemInstruction: req.body.systemInstruction,
          temperature: req.body.temperature ?? 0.7
        }
      });

      const iterator = stream[Symbol.asyncIterator]();
      const firstResult = await iterator.next();

      activeStream = (async function* () {
        if (!firstResult.done) {
          yield firstResult.value;
        }
        let nextResult = await iterator.next();
        while (!nextResult.done) {
          yield nextResult.value;
          nextResult = await iterator.next();
        }
      })();
    } catch (err: any) {
      throw err;
    }

    if (!activeStream) {
      throw new Error('Gemini model failed to return a stream');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of activeStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text, model: requestedModel })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    const userFriendlyError = classifyGeminiError(error);

    if (!res.headersSent) {
      res.status(500).json({ error: userFriendlyError });
    } else {
      res.write(`data: ${JSON.stringify({ error: userFriendlyError })}\n\n`);
      res.end();
    }
  }
});


// Embeddings API
app.post('/api/ai/embed', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length < 5) {
      return res.status(400).json({ error: 'Gemini API key is not configured.' });
    }
    
    const text = req.body.text;
    if (!text) {
      return res.status(400).json({ error: 'Text to embed is required.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });
    
    if (response && response.embeddings && response.embeddings.length > 0) {
      res.json({ embedding: response.embeddings[0].values });
    } else {
      res.status(500).json({ error: 'Failed to generate embedding' });
    }
  } catch (error: any) {
    console.error('Gemini Embed Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate embedding' });
  }
});

// Start Server and Vite Handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Veronica Academic AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
