// Cloudflare Worker: proxies assistant questions to the Google Gemini API.
// The API key lives only here (Worker secret GEMINI_API_KEY), never in the frontend.
//
// Env vars:
//   GEMINI_API_KEY (secret, required)  — wrangler secret put GEMINI_API_KEY
//   MODEL          (optional)          — defaults to gemini-3.1-flash-lite
//   ALLOWED_ORIGIN (optional)          — e.g. https://thevikram123.github.io (defaults to *)

const SYSTEM_PROMPT = `You are the reporting assistant inside the Mumbai Police DCR/MCR demonstration portal.
Answer questions using ONLY the JSON dataset provided below. It contains the jurisdiction hierarchy,
per-station daily FIR figures (DCR), monthly FIR/chargesheet figures (MCR), a city-wide daily trend,
and reports actually filed through the portal. Figures where dcrSubmitted/mcrSubmitted is false are
synthetic baseline values, not officer-filed reports — say so if it matters.
Be concise and factual. Use plain sentences or short dash lists; no markdown tables, no headings.
If the data cannot answer the question, say so plainly. Do not invent figures.`;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);
    if (!env.GEMINI_API_KEY) return json({ error: "GEMINI_API_KEY secret is not set on the Worker." }, 500, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400, cors); }
    const { question, history = [], context = "" } = body;
    if (!question || typeof question !== "string" || question.length > 2000) {
      return json({ error: "Provide a question (max 2000 chars)." }, 400, cors);
    }

    const model = env.MODEL || "gemini-3.1-flash-lite";
    const contents = [
      ...history.slice(-10).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.text).slice(0, 4000) }]
      })),
      { role: "user", parts: [{ text: question }] }
    ];

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nDATASET:\n${context}`.slice(0, 100000) }] },
          contents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
        })
      }
    );

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return json({ error: data?.error?.message || `Gemini API error (${upstream.status})` }, 502, cors);
    }
    const answer = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    return json({ answer: answer || "The model returned no text." }, 200, cors);
  }
};

function json(payload, status, cors) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...cors }
  });
}
