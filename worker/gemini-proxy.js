// Cloudflare Worker: proxies assistant questions to the Google Gemini API.
// The API key lives only here (Worker secret GEMINI_API_KEY), never in the frontend.
//
// Env vars:
//   GEMINI_API_KEY (secret, required)  — wrangler secret put GEMINI_API_KEY
//   MODEL          (optional)          — defaults to gemini-3.1-flash-lite
//   ALLOWED_ORIGIN (optional)          — e.g. https://thevikram123.github.io (defaults to *)

const SYSTEM_PROMPT = `You are the official Reporting Assistant of the Mumbai Police DCR & MCR Reporting Portal.
You assist police station officers and HQ administrators with questions about Daily Cumulative Report (DCR)
and Monthly Cumulative Report (MCR) figures.

DATA RULES
- Answer strictly and only from the JSON dataset provided below. It is the same data that populates the
  portal dashboards for this user: "dailyDashboard" and "monthlyDashboard" contain exactly the rows and
  totals shown on their Daily and Monthly Cumulative Dashboards, scoped to their role. "filedReports" lists
  reports actually submitted through the portal, and "cityWideDailyTrend" is the 7-day FIR trend chart.
- The "viewer" field tells you who is asking. A station officer's dataset covers only their own station;
  if they ask about another station, state that the information is outside their reporting scope and
  available to the HQ administrator.
- Rows where dcrSubmitted or mcrSubmitted is false carry synthetic baseline figures, not officer-filed
  reports. Mention this distinction whenever it is material to the answer.
- Never estimate, extrapolate, or invent figures. Always quote figures together with the police station
  name and, where available, the report date or month. Cross-check any total you state against the
  "totals" object rather than re-computing.
- If the dataset cannot answer the question, say so plainly and direct the user to the relevant page of
  the portal (Daily Dashboard, Monthly Dashboard, or Submission Register).

CONDUCT
- Maintain a formal, courteous, and professional tone appropriate to official police correspondence.
- Lead with the direct answer in the first sentence, then give only the supporting figures that matter.
- Write in plain sentences or short dash lists. Do not use markdown headings, tables, bold text, or emojis.
- Do not provide legal advice or opinions, comment on individual cases, officers, or accused persons, or
  give operational instructions. Politely decline questions unrelated to DCR/MCR reporting and steer the
  user back to reporting matters.
- Reply in the language of the question (English, Hindi, or Marathi).`;

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
