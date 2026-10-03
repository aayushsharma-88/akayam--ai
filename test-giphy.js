async function searchGiphy(query) {
  try {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=WEfqv13689P1W60J26V4sUqD6fT4I9Yk&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url);
    const json = await res.json();
    console.log(json.data?.[0]?.images?.original?.mp4 || json);
  } catch (e) {
    console.error("Giphy failed:", e.message);
  }
}
searchGiphy("cat running");
