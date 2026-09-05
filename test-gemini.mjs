import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: "hello"
    });
    console.log("3.7-flash SUCCESS:", res.text);
  } catch (e) {
    console.log("3.7-flash ERROR:", e.message);
  }
  
  try {
    const res = await ai.models.generateContent({
      model: "gemini-pro-latest",
      contents: "hello"
    });
    console.log("pro-latest SUCCESS:", res.text);
  } catch (e) {
    console.log("pro-latest ERROR:", e.message);
  }
}
run();
