const { Router } = require("express");
const Event = require("../models/event.model");
const r = Router();

// 1) minimalni zapis dogodka (en klic iz user/loan/FE)
r.post("/events", async (req, res) => {
  try {
    const { type, userId, entityId, meta } = req.body || {};
    if (!type) return res.status(400).json({ message: "type required" });
    const ev = await Event.create({ type, userId, entityId, meta });
    res.status(201).json({ id: ev._id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 2) branje dogodkov (za frontend)
r.get("/events", async (req, res) => {
  const { userId, type, limit = 50 } = req.query;
  const q = {};
  if (userId) q.userId = userId;
  if (type) q.type = type;
  const items = await Event.find(q).sort({ createdAt: -1 }).limit(Math.min(200, +limit));
  res.json(items.map(e => ({
    id: e._id, type: e.type, userId: e.userId, entityId: e.entityId, meta: e.meta, createdAt: e.createdAt
  })));
});

module.exports = r;