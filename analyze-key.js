const key = process.env.GEMINI_API_KEY || '';
console.log('Length:', key.length);
console.log('Contains quotes?', key.includes('"'), key.includes("'"));
console.log('Starts with sk-?', key.startsWith('sk-'));
console.log('Starts with AIza?', key.startsWith('AIza') || key.includes('AIza'));
console.log('First 4 chars:', key.substring(0, 4));
