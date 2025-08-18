const fetch = require('cross-fetch');
const Loan = require('../models/loan.model');

const USER_BASE = process.env.USER_SERVICE_URL || 'http://localhost:5001/api';
const BOOK_BASE = process.env.BOOK_SERVICE_URL || 'http://localhost:8000';

async function okJson(res) {
  if (!res.ok) throw new Error(`Upstream ${res.status}`);
  return res.json();
}

const mapLoan = (l) => ({
  id: l._id?.toString() || l.id,
  bookId: l.bookId,
  userId: l.userId,
  loanDate: new Date(l.loanDate).toISOString(),
  dueDate: new Date(l.dueDate).toISOString(),
  returnDate: l.returnDate ? new Date(l.returnDate).toISOString() : null,
  status: l.status,
  note: l.note ?? ''
});

module.exports = {
  // QUERIES
  loan: async ({ id }) => {
    const l = await Loan.findById(id).lean();
    return l ? mapLoan(l) : null;
  },

  loansByUser: async ({ userId }) => {
    const list = await Loan.find({ userId }).sort({ createdAt: -1 }).lean();
    return list.map(mapLoan);
  },

  activeLoans: async () => {
    const list = await Loan.find({ status: 'active' }).sort({ createdAt: -1 }).lean();
    return list.map(mapLoan);
  },

  // MUTATIONS
  createLoan: async ({ userId, bookId, dueDate, note }) => {
    const doc = await Loan.create({
      userId,
      bookId,
      dueDate: new Date(dueDate),
      note: note || ''
    });
    return mapLoan(doc.toObject());
  },

  returnLoan: async ({ id }) => {
    const doc = await Loan.findByIdAndUpdate(
      id,
      { status: 'returned', returnDate: new Date() },
      { new: true }
    ).lean();
    return mapLoan(doc);
  },

  cancelLoan: async ({ id }) => {
    const doc = await Loan.findByIdAndUpdate(
      id,
      { status: 'canceled' },
      { new: true }
    ).lean();
    return mapLoan(doc);
  },

  // FIELD RESOLVERS (Loan.user, Loan.book)
  // express-graphql z buildSchema uporablja rootValue; field resolverje definiramo
  // z istimi imeni kot "Type.field" (npr. "Loan.user")
  'Loan.user': async (loan) => {
    try {
      const res = await fetch(`${USER_BASE}/users/${encodeURIComponent(loan.userId)}`);
      const u = await okJson(res);
      return {
        id: u._id || u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null
      };
    } catch {
      return null;
    }
  },

  'Loan.book': async (loan) => {
    try {
      // prilagodi pot glede na tvoj Book service
      const res = await fetch(`${BOOK_BASE}/api/books/${encodeURIComponent(loan.bookId)}`);
      const b = await okJson(res);
      return { id: b._id || b.id, title: b.title, author: b.author };
    } catch {
      return null;
    }
  }
};
