const fs = require('fs');
let code = fs.readFileSync('src/lib/ai/providers/gemini-provider.ts', 'utf8');

code = code.replace(
  "if (err.status === 503 || err.status?.toString() === '503')",
  "if (String(err.status) === '503' || String(err.status) === 'Service Unavailable' || String(err.code) === '503' || (err.message && err.message.includes('503')) || (err.message && err.message.includes('UNAVAILABLE')))"
);

fs.writeFileSync('src/lib/ai/providers/gemini-provider.ts', code);
console.log('Fixed fallback condition in generateText');
