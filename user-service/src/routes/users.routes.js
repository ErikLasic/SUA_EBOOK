const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const c = require('../controllers/users.controller');

const r = Router();

/* Public */
r.post('/users', c.createUser);
r.post('/users/login', c.login);

/* Helperji za druge storitve */
r.get('/auth/verify', c.verifyToken);
r.get('/users/lookup', auth(false), c.lookupByEmail);

/* Read */
r.get('/users', auth(false), c.listUsers);
r.get('/users/:id', auth(false), c.getUser);
r.get('/me', auth(true), c.me);

/* IMPORTANT: statična pot PRED parametrično */
r.delete('/users/inactive', auth(true), c.deleteInactive);
r.get('/users/:id/exists', auth(false), c.exists);

/* Write */
r.put('/users/:id', auth(true), c.updateUser);
r.put('/users/:id/password', auth(true), c.changePassword);
r.delete('/users/:id', auth(true), c.deleteUser);

module.exports = r;
