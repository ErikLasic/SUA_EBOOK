const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    loanDate: { type: Date, default: () => new Date(), required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ["active", "returned", "canceled"], default: "active", index: true },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

LoanSchema.index({ bookId: 1, status: 1 }); // hitro preverjanje aktivnih izposoj iste knjige

module.exports = mongoose.model("Loan", LoanSchema);
