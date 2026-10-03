const fs = require('fs');
let code = fs.readFileSync('src/app/api/chat/route.ts', 'utf8');

const oldRegex = `const imageMatch = message.match(/^generate an image of (.*)/i) || message.match(/^generate image:\\s*(.*)/i)
            const videoMatch = message.match(/^generate a(?:n\\s+(?:\\d+\\s+)?(?:second\\s+)?)?(?:cinematic\\s+)?video of (.*)/i) || message.match(/^generate video:\\s*(.*)/i)
            const audioMatch = message.match(/^convert this text to voice:\\s*(.*)/i) || message.match(/^speak:\\s*(.*)/i) || message.match(/^generate audio:\\s*(.*)/i)`;

const newRegex = `const imageMatch = message.match(/(?:generate|create|make) (?:an )?image of (.*)/i) || message.match(/^generate image:\\s*(.*)/i)
            const videoMatch = message.match(/(?:generate|create|make) (?:a )?(?:short )?video of (.*)/i) || message.match(/^generate video:\\s*(.*)/i)
            const audioMatch = message.match(/convert this text to voice:\\s*(.*)/i) || message.match(/^speak:\\s*(.*)/i) || message.match(/(?:generate|create|make) audio (?:of|for):?\\s*(.*)/i)`;

code = code.replace(oldRegex, newRegex);
fs.writeFileSync('src/app/api/chat/route.ts', code);
console.log('Fixed media regex');
