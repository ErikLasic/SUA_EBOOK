const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user.model');

const toPublic = (u) => ({
  id: u._id, email: u.email, name: u.name, role: u.role, status: u.status,
  createdAt: u.createdAt, updatedAt: u.updatedAt, lastLoginAt: u.lastLoginAt
});

// POST /users
async function createUser(req, res) {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ message: 'email, password, name so obvezni' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email že obstaja' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, role });
    return res.status(201).json(toPublic(user));
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// POST /users/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'email in password sta obvezna' });

    const user = await User.findOne({ email, status: 'active' });
    if (!user) return res.status(401).json({ message: 'Napačni podatki' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Napačni podatki' });

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { sub: String(user._id), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: toPublic(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// GET /users
async function listUsers(req, res) {
  try {
    const { email, status, page = 1, limit = 20 } = req.query;
    const q = {};
    if (email) q.email = new RegExp(email, 'i');
    if (status) q.status = status;

    const p = Math.max(1, parseInt(page, 10));
    const l = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [items, total] = await Promise.all([
      User.find(q).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      User.countDocuments(q)
    ]);

    res.json({ page: p, limit: l, total, items: items.map(toPublic) });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// GET /users/:id
async function getUser(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Neveljaven id' });

    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Uporabnik ni najden' });
    res.json(toPublic(u));
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// PUT /users/:id
async function updateUser(req, res) {
  try {
    const { name, role, status } = req.body;
    const update = {};
    if (name) update.name = name;
    if (role) update.role = role;
    if (status) update.status = status;

    const u = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!u) return res.status(404).json({ message: 'Uporabnik ni najden' });
    res.json(toPublic(u));
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// PUT /users/:id/password
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: 'newPassword je obvezen' });

    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Uporabnik ni najden' });

    if (currentPassword) {
      const ok = await bcrypt.compare(currentPassword, u.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Napačno trenutno geslo' });
    }
    u.passwordHash = await bcrypt.hash(newPassword, 10);
    await u.save();
    res.json({ message: 'Geslo posodobljeno' });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// DELETE /users/:id
async function deleteUser(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Neveljaven id' });

    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ message: 'Uporabnik ni najden' });
    res.status(204).send();
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// DELETE /users/inactive
async function deleteInactive(req, res) {
  try {
    const r = await User.deleteMany({ status: 'inactive' });
    res.json({ deleted: r.deletedCount });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

/* ---------- helperji za druge storitve ---------- */

// GET /me
async function me(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Missing token' });

    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ message: 'Uporabnik ni najden' });
    return res.json(toPublic(u));
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// GET /auth/verify
function verifyToken(req, res) {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(400).json({ message: 'Missing Bearer token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      valid: true,
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    });
  } catch {
    return res.status(401).json({ valid: false, message: 'Invalid token' });
  }
}

// GET /users/:id/exists
async function exists(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: 'Neveljaven id' });
    const count = await User.countDocuments({ _id: id });
    res.json({ id, exists: count > 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

// GET /users/lookup?email=
async function lookupByEmail(req, res) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Manjka email' });
    const u = await User.findOne({ email });
    if (!u) return res.status(404).json({ message: 'Uporabnik ni najden' });
    res.json({ id: u._id, email: u.email, name: u.name, role: u.role, status: u.status });
  } catch (e) { res.status(500).json({ message: e.message }); }
}

module.exports = {
  createUser, login, listUsers, getUser,
  updateUser, changePassword, deleteUser, deleteInactive,
  me, verifyToken, exists, lookupByEmail
};
