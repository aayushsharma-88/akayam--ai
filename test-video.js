async function run() {
    try {
        const res = await fetch('https://www.youtube.com/results?search_query=car', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const html = await res.text();
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        console.log('YouTube:', match ? match[1] : 'None');
    } catch(e) { console.error(e); }
}
run();
