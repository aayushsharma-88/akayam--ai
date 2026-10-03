const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function testAuth() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("GEMINI_API_KEY is not set in the environment.");
    return;
  }
  
  console.log(`Key found! Length: ${apiKey.length}. Starts with: ${apiKey.substring(0, 3)}...`);
  
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  
  try {
    console.log("Sending test request to Gemini...");
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Hello, respond with exactly the word SUCCESS.'
    });
    console.log("API Success! Response: ", response.text);
  } catch (err) {
    console.error("API Error occurred!");
    console.error(`Status: ${err.status}`);
    console.error(`Message: ${err.message}`);
  }
}

testAuth();
