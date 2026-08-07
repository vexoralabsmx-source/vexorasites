import http from "node:http";

const options = { host: "localhost", port: 3001, path: "/" };
const req = http.get(options, (res) => {
  console.log("Status:", res.statusCode);
  console.log("Content-Type:", res.headers["content-type"]);
  let body = "";
  res.on("data", (chunk) => { body += chunk; });
  res.on("end", () => {
    console.log("Body (first 500 chars):", body.slice(0, 500));
    process.exit(0);
  });
});
req.on("error", (e) => {
  console.error("Request error:", e.message);
  process.exit(1);
});
req.setTimeout(8000, () => {
  console.error("TIMEOUT after 8s");
  process.exit(1);
});
