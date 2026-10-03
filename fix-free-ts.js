const fs = require('fs');
let code = fs.readFileSync('src/lib/ai/providers/free-media-provider.ts', 'utf8');

code = code.replace(/return \{ text \}/, "return { text, model: 'pollinations', provider: this.id }");
code = code.replace(/export class FreeTTSProvider implements TTSProvider \{/, "export class FreeTTSProvider implements TTSProvider { async getVoices() { return [] } ");
code = code.replace(/model: 'google-tts',/g, '');

fs.writeFileSync('src/lib/ai/providers/free-media-provider.ts', code);
console.log('Fixed TS errors in free providers');
