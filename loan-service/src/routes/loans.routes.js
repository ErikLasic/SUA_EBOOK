const { Router } = require("express");
const c = require("../controllers/loans.controller");

const r = Router();

// GET
r.get("/loans", c.listLoans);
r.get("/loans/:id", c.getLoan);

// POST
r.post("/loans", c.createLoan);
r.post("/returns", c.recordReturn);

// PUT
r.put("/loans/:id/extend", c.extendLoan);
r.put("/loans/:id/note", c.updateNote);

// DELETE
r.delete("/loans/clear-old", c.clearOld);
// IMPORTANT: staticna pot pred parametricno, zato je /clear-old nad /cancel/:id
r.delete("/loans/cancel/:id", c.cancelLoan);

module.exports = r;
