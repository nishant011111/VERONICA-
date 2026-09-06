const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('Type, GoogleGenAI')) {
  code = code.replace("import { GoogleGenAI } from '@google/genai';", "import { GoogleGenAI, Type } from '@google/genai';");
}

const newEndpoint = `
// Timetable Vision Extraction API
app.post('/api/ai/vision/timetable', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length < 5) {
      return res.status(400).json({ error: 'Gemini API key is not configured.' });
    }
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Create the schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        timetable_name: { type: Type.STRING },
        academic_year: { type: Type.STRING },
        semester: { type: Type.STRING },
        days: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING, description: "Monday, Tuesday, etc." },
              classes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    start_time: { type: Type.STRING, description: "HH:mm format, e.g. 09:00" },
                    end_time: { type: Type.STRING, description: "HH:mm format, e.g. 10:00" },
                    subject: { type: Type.STRING },
                    subject_code: { type: Type.STRING },
                    faculty: { type: Type.STRING },
                    room: { type: Type.STRING },
                    building: { type: Type.STRING },
                    type: { type: Type.STRING, description: "lecture, lab, tutorial, seminar, other" },
                    section: { type: Type.STRING },
                    confidence: { type: Type.NUMBER, description: "0.0 to 1.0 confidence score of extraction" }
                  },
                  required: ["start_time", "end_time", "subject"]
                }
              }
            }
          }
        }
      },
      required: ["days"]
    };

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64,
      },
    };
    
    const textPart = {
      text: "Analyze this university class timetable image and extract the classes into the requested JSON structure. Accurately identify the days, start times, end times, subject names, room numbers, and teachers. Handle merged cells carefully. Infer class types if possible (e.g., 'lab' if it says practical). If a field cannot be determined, leave it empty."
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    if (!response || !response.text) {
      throw new Error('Gemini failed to return text.');
    }

    const parsedJson = JSON.parse(response.text.trim());
    res.json(parsedJson);

  } catch (error: any) {
    console.error('Vision API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze timetable' });
  }
});
`;

// Insert the new endpoint before the app.post('/api/ai/chat' ...)
if (!code.includes('/api/ai/vision/timetable')) {
  code = code.replace("app.post('/api/ai/chat',", newEndpoint + "\n\napp.post('/api/ai/chat',");
  fs.writeFileSync('server.ts', code);
}
