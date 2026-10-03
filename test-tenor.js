async function searchGif(query) {
  try {
    const url = `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=LIVDSRZULELA&limit=1`;
    const res = await fetch(url);
    const json = await res.json();
    console.log(json);
  } catch (e) {
    console.error("Tenor failed:", e.message);
  }
}
searchGif("cat running");
