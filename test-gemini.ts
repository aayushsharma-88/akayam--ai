
import { GeminiTextProvider } from './src/lib/ai/providers/gemini-provider'

async function test() {
  const provider = new GeminiTextProvider()
  console.log("Configured:", provider.isConfigured())
  console.log("Key length:", process.env.GEMINI_API_KEY?.length)
  
  try {
    const result = await provider.generateText({
      model: 'gemini-3.8-flash',
      messages: [{ role: 'user', content: 'Hello!' }]
    })
    console.log("Success:", result.text)
  } catch (err) {
    console.error("Caught Error:", err)
  }
}
test()
