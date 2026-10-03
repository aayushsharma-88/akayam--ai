const { "dotenv" } = require('@google/genai');

async function testNewKey() {
const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const res = await ai.models.list();
    let names = [];
    for await (const m of res) {
      names.push(m.name);
    }
    console.log("AVAILABLE MODELS: ", names.join(', '));
  } catch (e) {
    console.error(`FAILED: ${e.message}`);
  }
}

testNewKey();
