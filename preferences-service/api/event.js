const BASE = process.env.ACTIVITY_URL;
const REQUIRED_KEY = process.env.FEED_API_KEY || null;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-api-key");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).end("Method Not Allowed");
    }

    if (REQUIRED_KEY) {
      const got = req.headers["x-api-key"];
      if (!got || got !== REQUIRED_KEY) return res.status(401).json({ message: "Invalid API key" });
    }

    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }

    if (!body?.type || !body?.userId) {
      return res.status(400).json({ message: "Missing type or userId" });
    }

    const r = await fetch(`${BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const text = await r.text();
    const out = (() => { try { return JSON.parse(text); } catch { return text; } })();

    if (!r.ok) return res.status(r.status).json({ message: "Upstream error", details: out });
    return res.status(201).json(out);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error" });
  }
}
