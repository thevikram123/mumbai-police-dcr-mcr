import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

createServer(async (req, res) => {
  try {
    const requested = decodeURIComponent((req.url || "/").split("?")[0]);
    let file = normalize(join(root, requested === "/" ? "index.html" : requested));
    if (!file.startsWith(root)) throw new Error("Invalid path");
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}).listen(4173, "127.0.0.1", () => console.log("Mumbai Police reporting app: http://127.0.0.1:4173"));

