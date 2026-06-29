async function test() {
  const res = await fetch("https://api.mistral.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer cvqt7XdDlbgaEig9wXHAazJyLcpF2QxG"
    },
    body: JSON.stringify({
      model: "mistral-embed",
      input: ["Hello"]
    })
  });
  console.log(res.status, await res.text());
}
test();
