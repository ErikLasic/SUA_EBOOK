const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  lastLoginAt: { type: Date }
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model('User', UserSchema);
