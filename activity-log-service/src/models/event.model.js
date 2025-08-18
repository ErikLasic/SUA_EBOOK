const mongoose = require("mongoose");
const EventSchema = new mongoose.Schema({
  type:   { type: String, required: true }, // users.login, loans.created, loans.returned
  userId: { type: String, index: true },
  entityId: { type: String },
  meta:   { type: Object, default: {} }
}, { timestamps: true });
EventSchema.index({ type: 1, createdAt: -1 });
module.exports = mongoose.model("Event", EventSchema);