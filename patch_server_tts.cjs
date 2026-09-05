const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `    // Stream the audio back
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
    }`;

const newCode = `    // Send the audio back
    res.setHeader('Content-Type', 'audio/mpeg');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
