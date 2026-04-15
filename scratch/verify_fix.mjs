
async function test() {
  const url = "https://shikimori.one/api/animes?limit=1";
  const res = await fetch(url, {
    headers: { "User-Agent": "MiruVerse/1.0" }
  });
  
  const xTotal = res.headers.get("X-Total");
  console.log("X-Total Header:", xTotal);
  console.log("X-Total case-insensitive check:", res.headers.get("x-total"));
  
  const data = await res.json();
  const total = xTotal ? parseInt(xTotal, 10) : (Array.isArray(data) ? data.length : 0);
  console.log("Final Total used in code:", total);
}
test();
