const fs = require('fs');
let code = fs.readFileSync('src/lib/ai/providers/gemini-provider.ts', 'utf8');

// Change default to 3.8-flash
code = code.replace(/const DEFAULT_TEXT_MODEL = 'gemini-3.7-flash'/, "const DEFAULT_TEXT_MODEL = 'gemini-3.8-flash'");

// Implement fallback in generateText
const oldGenerateText = `    try {
      const response = await ai.models.generateContent({
        model,
        contents: formatMessages(options.messages),
        config: {
          systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
          maxOutputTokens: options.maxTokens,
          temperature: options.temperature,
        },
      })

      return {
        text: response.text ?? '',
      }
    } catch (err: any) {
      console.error('[Gemini generateText Error]', err)
      throw new GeminiProviderError(err.message, err.status?.toString())
    }`;

const newGenerateText = `    const fallbackModel = model === 'gemini-3.8-flash' ? 'gemini-3.7-flash' : 'gemini-3.8-flash';
    try {
      const response = await ai.models.generateContent({
        model,
        contents: formatMessages(options.messages),
        config: {
          systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
          maxOutputTokens: options.maxTokens,
          temperature: options.temperature,
        },
      })
      return { text: response.text ?? '' }
    } catch (err: any) {
      if (err.status === 503 || err.status?.toString() === '503') {
        try {
          const response = await ai.models.generateContent({
            model: fallbackModel,
            contents: formatMessages(options.messages),
            config: {
              systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
              maxOutputTokens: options.maxTokens,
              temperature: options.temperature,
            },
          })
          return { text: response.text ?? '' }
        } catch (err2: any) {
          throw new GeminiProviderError(err2.message, err2.status?.toString())
        }
      }
      throw new GeminiProviderError(err.message, err.status?.toString())
    }`;

code = code.replace(oldGenerateText, newGenerateText);

// Implement fallback in streamText
const oldStreamText = `    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: formatMessages(options.messages),
        config: {
          systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 8192,
        },
      })

      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text
        }
      }
    } catch (err: any) {
      console.error('[Gemini streamText Error]', err)
      throw new GeminiProviderError(err.message, err.status?.toString())
    }`;

const newStreamText = `    const fallbackModel = model === 'gemini-3.8-flash' ? 'gemini-3.7-flash' : 'gemini-3.8-flash';
    let streamToYield;
    try {
      streamToYield = await ai.models.generateContentStream({
        model,
        contents: formatMessages(options.messages),
        config: {
          systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 8192,
        },
      });
    } catch (err: any) {
      if (err.status === 503 || err.status?.toString() === '503') {
        try {
          streamToYield = await ai.models.generateContentStream({
            model: fallbackModel,
            contents: formatMessages(options.messages),
            config: {
              systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
              temperature: options.temperature ?? 0.7,
              maxOutputTokens: options.maxTokens ?? 8192,
            },
          });
        } catch (err2: any) {
          throw new GeminiProviderError(err2.message, err2.status?.toString())
        }
      } else {
        throw new GeminiProviderError(err.message, err.status?.toString())
      }
    }
    
    try {
      for await (const chunk of streamToYield) {
        if (chunk.text) yield chunk.text;
      }
    } catch (streamErr: any) {
        throw new GeminiProviderError(streamErr.message, streamErr.status?.toString())
    }`;

code = code.replace(oldStreamText, newStreamText);

fs.writeFileSync('src/lib/ai/providers/gemini-provider.ts', code);
console.log('Fallbacks implemented');
