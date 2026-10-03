async function testGradio() {
  try {
    const res = await fetch('https://damo-vilab-modelscope-text-to-video-synthesis.hf.space/run/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: ["a flying cat", 50, 0] // some endpoints take prompt, steps, seed
      })
    });
    const json = await res.json();
    console.log(json);
  } catch (e) {
    console.error(e);
  }
}
testGradio();
