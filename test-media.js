const { GoogleGenAI } = require('@google/genai');

async function testMedia() {
 const apiKey = process.env.GEMINI_API_KEY;;
  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Image
  try {
    console.log("\nTesting Image: nano-banana-pro-preview");
    const res = await ai.models.generateContent({
      model: 'nano-banana-pro-preview',
      contents: 'a small blue square',
      config: { responseMimeType: 'image/jpeg' }
    });
    console.log("SUCCESS Image.");
  } catch (e) { console.error("Image FAILED:", e.message); }

  // Video
  try {
    console.log("\nTesting Video: veo-3.1-generate-preview");
    const res = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      source: { prompt: 'a small blue square' }
    });
    console.log("SUCCESS Video. ID:", res.name || res.operation?.name);
  } catch (e) { console.error("Video FAILED:", e.message); }

  // TTS
  try {
    console.log("\nTesting TTS: gemini-3.8-flash-tts");
    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: 'HELLO',
      config: { responseMimeType: 'audio/mp3' }
    });
    console.log("SUCCESS TTS.");
  } catch (e) { console.error("TTS FAILED:", e.message); }
}

testMedia();
