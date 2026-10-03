async function scrapeGiphy(query) {
  try {
    const url = `https://giphy.com/search/${encodeURIComponent(query).replace(/%20/g, '-')}`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    const html = await res.text();
    // Search for a generic .mp4 url in the page
    const match = html.match(/https:\/\/[^"'\s]+\.mp4/);
    if (match) {
        console.log(match[0]);
    } else {
        console.log("No match found.");
    }
  } catch (e) {
    console.error("Scrape failed:", e.message);
  }
}
scrapeGiphy("cat running");
