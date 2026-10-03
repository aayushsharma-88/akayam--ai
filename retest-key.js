const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
let apiKey = match ? match[1].trim() : '';

// Strip quotes
if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
  apiKey = apiKey.slice(1, -1);
} else if (apiKey.startsWith("'") && apiKey.endsWith("'")) {
  apiKey = apiKey.slice(1, -1);
}

async function runTests() {
  console.log(`Key length: ${apiKey.length}, Starts with: ${apiKey.substring(0, 3)}`);
  
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
  }
}

runTests();
