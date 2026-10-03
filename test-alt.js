const { GoogleGenAI } = require('@google/genai');

async function testNewKey() {
  const apiKey = process.env.GEMINI_API_KEY;;
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const models = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash'];
  for (const model of models) {
    try {
      console.log(`\nTesting ${model}...`);
      const res = await ai.models.generateContent({
        model: model,
        contents: 'Respond with exactly: HELLO'
      });
      console.log("SUCCESS: " + res.text);
      break; // Exit if one succeeds
    } catch (e) {
      console.error(`FAILED: ${e.message}`);
    }
  }
}

testNewKey();
