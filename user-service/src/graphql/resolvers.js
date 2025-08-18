const User = require('../models/user.model');

/** Pomožna pretvorba Mongoose -> GraphQL */
const mapUser = (u) => ({
  id: u._id?.toString() || u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  status: u.status,
  lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
  profile: {
    nickname: u.name, // demo polje (da imamo tretji tip)
    website: null
  }
});

module.exports = {
  // QUERIES
  user: async ({ id }) => {
    const u = await User.findById(id);
    return u ? mapUser(u) : null;
  },

  users: async () => {
    const list = await User.find({}).sort({ createdAt: -1 });
    return list.map(mapUser);
  },

  usersByStatus: async ({ status }) => {
    const list = await User.find({ status }).sort({ updatedAt: -1 });
    return list.map(mapUser);
  },

  userStats: async () => {
    const [total, active, inactive] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' })
    ]);
    return { total, active, inactive };
  },

  // MUTATIONS
  updateUserStatus: async ({ id, status }) => {
    const updated = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return mapUser(updated);
  }
};
