# Assistant Worker (Gemini proxy)

A tiny Cloudflare Worker that answers questions from the portal's Assistant page.
The Gemini API key is stored as a Worker secret — it never reaches the browser.

## Deploy (5 minutes)

Prerequisites: a free Cloudflare account and a Gemini API key from
[Google AI Studio](https://aistudio.google.com/apikey).

```bash
cd worker
npx wrangler login                      # opens browser, authorise Cloudflare
npx wrangler secret put GEMINI_API_KEY  # paste your Gemini API key when prompted
npx wrangler deploy
```

`wrangler deploy` prints the Worker URL, e.g.
`https://mp-dcr-mcr-assistant.<your-subdomain>.workers.dev`.

## Connect the frontend

Either:

- paste the URL into `src/config.js` (`ASSISTANT_WORKER_URL`) and push — enables it for every visitor, or
- open the portal's **Assistant** page and paste the URL into the setup panel — enables it for that browser only.

## Options (worker/wrangler.toml)

- `MODEL` — defaults to `gemini-flash-lite-latest` (always the newest Flash-Lite). Pin e.g. `gemini-3.1-flash-lite` if you prefer a fixed version.
- `ALLOWED_ORIGIN` — set to `https://thevikram123.github.io` after deploying to lock CORS to your site.

## No-CLI alternative

Cloudflare Dashboard → Workers & Pages → Create Worker → paste the contents of
`gemini-proxy.js` → Deploy → Settings → Variables and Secrets → add secret
`GEMINI_API_KEY`.
