const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const openaiEndpoints = `
// --- OpenAI Endpoints ---
import OpenAI from 'openai';

app.post('/api/ai/health/openai', async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.trim().length < 10) {
      return res.json({ available: false, status: 'unavailable', reason: 'Missing backend OPENAI_API_KEY env var' });
    }
    const openai = new OpenAI({ apiKey: key });
    await openai.models.list();
    res.json({ available: true, status: 'operational', model: 'gpt-5.6-luna' });
  } catch (err: any) {
    res.json({ available: false, status: 'unavailable', reason: err.message });
  }
});

app.post('/api/ai/openai/chat', async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.trim().length < 10) {
      return res.status(400).json({ error: 'OPENAI_API_KEY environment variable is not set.' });
    }
    const openai = new OpenAI({ apiKey: key });
    
    const { model, contents, systemInstruction, messages, temperature } = req.body;
    const requestedModel = model || 'gpt-5.6-luna';

    const openaiMsgs: any[] = [];
    if (systemInstruction) openaiMsgs.push({ role: 'system', content: systemInstruction });
    
    if (messages && Array.isArray(messages)) {
      messages.forEach((m: any) => {
        if (m.sender === 'user' || m.role === 'user') openaiMsgs.push({ role: 'user', content: m.content });
        else if (m.sender === 'ai' || m.role === 'assistant') openaiMsgs.push({ role: 'assistant', content: m.content });
      });
    }
    
    // Add the current prompt if not already the last message
    const lastMsg = openaiMsgs[openaiMsgs.length - 1];
    if (!lastMsg || lastMsg.content !== contents) {
      openaiMsgs.push({ role: 'user', content: contents });
    }

    const response = await openai.chat.completions.create({
      model: requestedModel,
      messages: openaiMsgs,
      temperature: temperature ?? 0.7,
    });

    res.json({
      text: response.choices[0]?.message?.content || '',
      provider: 'OpenAI',
      model: response.model || requestedModel,
    });
  } catch (err: any) {
    console.error('OpenAI Chat Error:', err);
    res.status(500).json({ error: err.message || 'OpenAI request failed' });
  }
});

app.post('/api/ai/openai/stream', async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.trim().length < 10) {
      return res.status(400).json({ error: 'OPENAI_API_KEY environment variable is not set.' });
    }
    const openai = new OpenAI({ apiKey: key });
    
    const { model, contents, systemInstruction, messages, temperature } = req.body;
    const requestedModel = model || 'gpt-5.6-luna';

    const openaiMsgs: any[] = [];
    if (systemInstruction) openaiMsgs.push({ role: 'system', content: systemInstruction });
    
    if (messages && Array.isArray(messages)) {
      messages.forEach((m: any) => {
        if (m.sender === 'user' || m.role === 'user') openaiMsgs.push({ role: 'user', content: m.content });
        else if (m.sender === 'ai' || m.role === 'assistant') openaiMsgs.push({ role: 'assistant', content: m.content });
      });
    }
    
    const lastMsg = openaiMsgs[openaiMsgs.length - 1];
    if (!lastMsg || lastMsg.content !== contents) {
      openaiMsgs.push({ role: 'user', content: contents });
    }

    const stream = await openai.chat.completions.create({
      model: requestedModel,
      messages: openaiMsgs,
      temperature: temperature ?? 0.7,
      stream: true,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      res.write(\`data: \${JSON.stringify({ text, model: chunk.model })}\\n\\n\`);
    }
    res.write('data: [DONE]\\n\\n');
    res.end();
  } catch (err: any) {
    console.error('OpenAI Stream Error:', err);
    res.write(\`data: \${JSON.stringify({ error: err.message || 'OpenAI stream failed' })}\\n\\n\`);
    res.end();
  }
});

// --- End OpenAI Endpoints ---
`;

code = code.replace(
  "app.post('/api/ai/health/gemini'",
  openaiEndpoints + "\napp.post('/api/ai/health/gemini'"
);

fs.writeFileSync('server.ts', code);
