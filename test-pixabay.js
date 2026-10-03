async function searchPixabay(query) {
  try {
    const url = `https://pixabay.com/api/videos/?key=43818317-0b1c03bc1808e6ffdd15316db&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const json = await res.json();
    console.log(json.hits?.[0]?.videos?.tiny?.url || json);
  } catch (e) {
    console.error("Pixabay failed:", e.message);
  }
}
searchPixabay("cat running");
