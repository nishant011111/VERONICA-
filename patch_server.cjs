const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const ttsRoute = `

// ElevenLabs TTS API
app.post('/api/tts', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      return res.status(500).json({ error: 'ElevenLabs API key is not configured on the server.' });
    }

    const { text, voiceId, modelId } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required.' });
    }
    
    const targetVoiceId = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default voice
    const targetModelId = modelId || 'eleven_turbo_v2_5';
    
    const response = await fetch(\`https://api.elevenlabs.io/v1/text-to-speech/\${targetVoiceId}\`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey.trim()
      },
      body: JSON.stringify({
        text: text,
        model_id: targetModelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API Error:', response.status, errData);
      return res.status(response.status).json({ error: 'ElevenLabs API request failed.' });
    }

    // Stream the audio back
    res.setHeader('Content-Type', 'audio/mpeg');
    
    // Check if the response body is available
    if (response.body) {
      // Pipe the web stream to the Node.js response
      // @ts-ignore - Node.js fetch body is a ReadableStream which can be handled this way
      const reader = response.body.getReader();
      
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
              break;
            }
            res.write(value);
          }
        } catch (err) {
          console.error('Error pumping TTS stream:', err);
          res.end();
        }
      };
      
      pump();
    } else {
      res.status(500).json({ error: 'Failed to receive audio stream from ElevenLabs.' });
    }

  } catch (error: any) {
    console.error('TTS Route Error:', error);
    res.status(500).json({ error: 'Failed to process TTS request.' });
  }
});
`;

code = code.replace('// Start Server and Vite Handler', ttsRoute + '\n// Start Server and Vite Handler');

fs.writeFileSync('server.ts', code);
