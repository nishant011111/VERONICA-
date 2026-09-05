import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function testModel(m) {
  try {
    const res = await ai.models.generateContent({ model: m, contents: "hello" });
    console.log(`${m} SUCCESS`);
  } catch (e) {
    console.log(`${m} ERROR:`, e.message);
  }
}
async function run() {
  await testModel("gemini-3.1-flash");
  await testModel("gemini-3.1-flash-lite");
  await testModel("gemini-3.6-flash");
  await testModel("gemini-3.7-flash");
}
run();
