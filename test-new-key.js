const { GoogleGenAI } = require('@google/genai');

async function testNewKey() {
 const apiKey = process.env.GEMINI_API_KEY;;
  console.log(`Testing new key: ${apiKey}`);
  
  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Respond with exactly: HELLO'
    });
    console.log("SUCCESS: " + res.text);
  } catch (e) {
    console.error(`FAILED: ${e.message}`);
    if (e.status) console.error(`Status: ${e.status}`);
    console.error("Full error:", e);
  }
}

testNewKey();
