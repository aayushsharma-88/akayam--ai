const { GoogleGenAI } = require('@google/genai');

async function testStream() {
  const apiKey = process.env.GEMINI_API_KEY;;
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const modelsToTest = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.7-pro', 'gemini-3.5-flash'];

  for (const model of modelsToTest) {
      console.log("Testing:", model);
      try {
        const res = await ai.models.generateContentStream({
          model: model,
          contents: 'HELLO'
        });
        for await (const chunk of res) {
          console.log("SUCCESS:", chunk.text);
          break; // just check first chunk
        }
        break; // Stop if successful
      } catch (e) {
        console.error("FAILED", model, e.status);
      }
  }
}

testStream();
