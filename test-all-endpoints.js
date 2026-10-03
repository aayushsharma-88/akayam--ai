const http = require('http');

async function testEndpoint(name, url, method, body) {
  console.log(`\n--- Testing ${name} ---`);
  try {
    const res = await fetch(`http://localhost:3000${url}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${text.slice(0, 300)}...`);
  } catch (err) {
    console.error(`Fetch Error: ${err.message}`);
  }
}

async function runTests() {
  // Test A - Text
  await testEndpoint('Text Chat', '/api/test-chat', 'POST', { message: 'Hello, introduce yourself.' });
  
  // Test C - Image
  await testEndpoint('Image Gen Chat', '/api/test-chat', 'POST', { message: 'generate an image of a futuristic city at sunset' });

  // Test D - Video
  await testEndpoint('Video Gen Chat', '/api/test-chat', 'POST', { message: 'generate an 8 second cinematic video of a futuristic city' });

  // Test E - TTS (Audio generation via chat command)
  await testEndpoint('TTS Chat', '/api/test-chat', 'POST', { message: 'convert this text to voice: Welcome to Akayam AI.' });
}

runTests();
