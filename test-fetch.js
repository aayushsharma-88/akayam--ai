const fs = require('fs');

let env = fs.readFileSync('.env.local', 'utf8');
let match = env.match(/GEMINI_API_KEY=(.*)/);
let apiKey = match ? match[1].trim() : '';
if (apiKey.startsWith('"') || apiKey.startsWith("'")) apiKey = apiKey.slice(1, -1);

fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ contents: [{ parts: [{ text: 'HELLO' }] }] })
})
.then(r => r.json())
.then(j => console.log(JSON.stringify(j, null, 2)))
.catch(console.error);
