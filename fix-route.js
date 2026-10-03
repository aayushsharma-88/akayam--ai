const fs = require('fs');
let code = fs.readFileSync('src/app/api/chat/route.ts', 'utf8');

const oldErrorHandle = `const errMsg = streamError?.message || 'Something went wrong while generating your response. Please try again.'
            controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ content: errMsg, error: true })}\\n\\n\`))`;

const newErrorHandle = `let errMsg = streamError?.message || 'Something went wrong while generating your response. Please try again.'
            
            // Clean up raw Google API JSON errors
            if (errMsg.includes('503') || errMsg.includes('Service Unavailable') || errMsg.includes('UNAVAILABLE')) {
              errMsg = '⚠️ **Google AI Servers are Overloaded**\\n\\nI am very sorry, but the Google Gemini AI servers are currently experiencing extremely high demand worldwide. Both my primary and backup AI models are temporarily down from Google\\'s side. Please try again in a few minutes!'
            } else if (errMsg.startsWith('{')) {
              try {
                const parsed = JSON.parse(errMsg)
                if (parsed.error && parsed.error.message) {
                  try {
                    const inner = JSON.parse(parsed.error.message)
                    errMsg = inner.error.message
                  } catch(e) {
                     errMsg = parsed.error.message
                  }
                }
              } catch (e) {
                // ignore
              }
            }
            
            controller.enqueue(encoder.encode(\`data: \${JSON.stringify({ content: errMsg, error: true })}\\n\\n\`))`;

code = code.replace(oldErrorHandle, newErrorHandle);
fs.writeFileSync('src/app/api/chat/route.ts', code);
console.log('Fixed route error handling');
