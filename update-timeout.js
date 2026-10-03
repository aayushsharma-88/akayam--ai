const fs = require('fs');

const codePath = 'src/lib/ai/providers/gemini-provider.ts';
let code = fs.readFileSync(codePath, 'utf8');

// The goal is to replace `streamText` completely.
const newStreamText = `  async *streamText(options: TextGenerationOptions): AsyncGenerator<string> {
    const ai = getClient()
    const model = options.model ?? DEFAULT_TEXT_MODEL
    const fallbackModel = model === 'gemini-3.8-flash' ? 'gemini-3.7-flash' : 'gemini-3.8-flash'

    let responseStream;
    let usedFallback = false;

    // Timeout helper
    const withTimeout = (promise, ms) => {
      let timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('TIMEOUT')), ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
    };

    try {
      // try primary model with 10s timeout
      responseStream = await withTimeout(ai.models.generateContentStream({
        model,
        contents: formatMessages(options.messages),
        config: {
          systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 8192,
        }
      }), 15000);
    } catch (err: any) {
      if (err.message === 'TIMEOUT' || err.status === 503 || err.status?.toString() === '503') {
        console.warn('Primary model failed (timeout or 503), trying fallback:', fallbackModel);
        try {
          usedFallback = true;
          responseStream = await withTimeout(ai.models.generateContentStream({
            model: fallbackModel,
            contents: formatMessages(options.messages),
            config: {
              systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
              temperature: options.temperature ?? 0.7,
              maxOutputTokens: options.maxTokens ?? 8192,
            }
          }), 15000);
        } catch (err2: any) {
           throw new GeminiProviderError(err2.message || 'Stream timeout', err2.status?.toString());
        }
      } else {
        throw new GeminiProviderError(err.message, err.status?.toString())
      }
    }

    try {
      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text
        }
      }
    } catch (err: any) {
      throw new GeminiProviderError(err.message, err.status?.toString())
    }
  }`;

// Replace the old streamText
const streamTextRegex = /async \*streamText\(options: TextGenerationOptions\): AsyncGenerator<string> \{[\s\S]*?(?=^\s*\}\s*$)/m;
// Actually regex replacing a large block is brittle. Let's do it manually by finding the start of `streamText` and the next function.
const startIdx = code.indexOf('async *streamText(options: TextGenerationOptions): AsyncGenerator<string> {');
const nextFnIdx = code.indexOf('export class GeminiVisionProvider', startIdx);
if (startIdx !== -1 && nextFnIdx !== -1) {
    // find the closing brace before nextFnIdx
    const endIdx = code.lastIndexOf('}', nextFnIdx) + 1;
    code = code.substring(0, startIdx) + newStreamText + "\n  }\n\n  // " + code.substring(nextFnIdx);
} else {
    console.error("Could not find boundaries for streamText");
}

fs.writeFileSync(codePath, code);
console.log("Updated streamText with Timeout and Fallback");
