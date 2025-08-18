const BASE = process.env.ACTIVITY_URL;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).end("Method Not Allowed");
    }

    const { userId, limit = "10" } = req.query || {};
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const url = `${BASE}/events?userId=${encodeURIComponent(userId)}&limit=${encodeURIComponent(limit)}`;
    const r = await fetch(url);

    const text = await r.text();
    const data = (() => { try { return JSON.parse(text); } catch { return text; } })();

    if (!r.ok) return res.status(r.status).json({ message: "Upstream error", details: data });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error" });
  }
}
