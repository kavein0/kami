
async function test() {
  const res = await fetch("https://shikimori.one/api/animes?limit=1", {
    headers: { "User-Agent": "MiruVerse/1.0" }
  });
  console.log("Status:", res.status);
  console.log("Headers:", Array.from(res.headers.entries()));
}
test();
