const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const c = require('../controllers/users.controller');

const r = Router();

/* Public */
r.post('/users', c.createUser);
r.post('/users/login', c.login);

/* Helpers (service-to-service) */
r.get('/auth/verify', c.verifyToken);
r.get('/users/lookup', auth(true), requireRole('admin'), c.lookupByEmail);

/* Read */
r.get('/users', auth(false), c.listUsers);
r.get('/users/:id', auth(false), c.getUser);
r.get('/me', auth(true), c.me);

/* Static before param */
r.delete('/users/inactive', auth(true), requireRole('admin'), c.deleteInactive);
r.get('/users/:id/exists', auth(false), c.exists);

/* Write */
r.put('/users/:id', auth(true), c.updateUser);
r.put('/users/:id/password', auth(true), c.changePassword);
r.delete('/users/:id', auth(true), requireRole('admin'), c.deleteUser);

module.exports = r;
