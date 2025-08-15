const mongoose = require("mongoose");
const Loan = require("../models/loan.model");
const { verifyJwt } = require("../clients/userClient");
const { fetchBook, updateBookState } = require("../clients/bookClient");

const toPublic = (l) => ({
  id: l._id,
  bookId: l.bookId,
  userId: l.userId,
  loanDate: l.loanDate,
  dueDate: l.dueDate,
  returnDate: l.returnDate,
  status: l.status,
  note: l.note,
  createdAt: l.createdAt,
  updatedAt: l.updatedAt
});

// GET /loans
async function listLoans(req, res) {
  try {
    const { userId, bookId, status, page = 1, limit = 20 } = req.query;
    const q = {};
    if (userId) q.userId = userId;
    if (bookId) q.bookId = bookId;
    if (status) q.status = status;

    const p = Math.max(1, parseInt(page, 10));
    const l = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [items, total] = await Promise.all([
      Loan.find(q).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      Loan.countDocuments(q)
    ]);

    res.json({ page: p, limit: l, total, items: items.map(toPublic) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

// GET /loans/:id
async function getLoan(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Neveljaven id" });

    const l = await Loan.findById(req.params.id);
    if (!l) return res.status(404).json({ message: "Izposoja ni najdena" });
    res.json(toPublic(l));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

// POST /loans (ustvari izposojo)
async function createLoan(req, res) {
  try {
    // 1) preveri JWT (user-service)
    const authHeader = req.headers.authorization || "";
    const v = await verifyJwt(authHeader);
    if (!v?.valid && process.env.DISABLE_AUTH !== "true")
      return res.status(401).json({ message: "Invalid token" });
    const userId = v?.sub || req.body.userId; // fallback za DISABLE_AUTH

    const { bookId, dueDate, note } = req.body;
    if (!bookId || !dueDate)
      return res.status(400).json({ message: "bookId in dueDate sta obvezna" });

    // 2) preveri, da knjiga obstaja (book-service)
    await fetchBook(bookId);

    // 3) preveri, da ni aktivne izposoje za to knjigo
    const active = await Loan.findOne({ bookId, status: "active" });
    if (active) return res.status(409).json({ message: "Knjiga je že izposojena" });

    // 4) ustvari
    const loan = await Loan.create({ bookId, userId, dueDate, note });
    res.status(201).json(toPublic(loan));
  } catch (e) {
    if (e.response?.status === 404) {
      return res.status(404).json({ message: "Knjiga ne obstaja" });
    }
    res.status(500).json({ message: e.message });
  }
}

// POST /returns (zabeleži vracilo, opcijsko nastavi stanje knjige)
async function recordReturn(req, res) {
  try {
    const { loanId, state } = req.body; // state: unharmed|damaged (opcijsko)
    if (!loanId) return res.status(400).json({ message: "loanId je obvezen" });

    const l = await Loan.findById(loanId);
    if (!l) return res.status(404).json({ message: "Izposoja ni najdena" });
    if (l.status !== "active") return res.status(409).json({ message: "Izposoja ni aktivna" });

    l.returnDate = new Date();
    l.status = "returned";
    await l.save();

    // ce pride state, posodobi stanje knjige v book-service
    if (state === "unharmed" || state === "damaged") {
      try { await updateBookState(l.bookId, state); } catch (_) { /* ne blokiraj vracila */ }
    }

    res.json(toPublic(l));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

// PUT /loans/:id/extend
async function extendLoan(req, res) {
  try {
    const { extraDays = 7 } = req.body;
    const l = await Loan.findById(req.params.id);
    if (!l) return res.status(404).json({ message: "Izposoja ni najdena" });
    if (l.status !== "active") return res.status(409).json({ message: "Izposoja ni aktivna" });

    const base = l.dueDate ?? new Date();
    const n = new Date(base);
    n.setDate(n.getDate() + Number(extraDays));
    l.dueDate = n;
    await l.save();

    res.json(toPublic(l));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

// PUT /loans/:id/note
async function updateNote(req, res) {
  try {
    const { note = "" } = req.body;
    const l = await Loan.findByIdAndUpdate(req.params.id, { note }, { new: true });
    if (!l) return res.status(404).json({ message: "Izposoja ni najdena" });
    res.json(toPublic(l));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

// DELETE /loans/clear-old
async function clearOld(req, res) {
  try {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    const r = await Loan.deleteMany({ createdAt: { $lt: cutoff } });
    res.json({ deleted: r.deletedCount });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

// DELETE /loans/cancel/:id
async function cancelLoan(req, res) {
  try {
    const l = await Loan.findById(req.params.id);
    if (!l) return res.status(404).json({ message: "Izposoja ni najdena" });
    if (l.status !== "active") return res.status(409).json({ message: "Izposoja ni aktivna" });

    l.status = "canceled";
    await l.save();
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = {
  listLoans,
  getLoan,
  createLoan,
  recordReturn,
  extendLoan,
  updateNote,
  clearOld,
  cancelLoan
};
