const jwt = require('jsonwebtoken');

function auth(required = true) {
  return (req, res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;

    if (!token) {
      return required ? res.status(401).json({ message: 'Missing token' }) : next();
    }
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: process.env.JWT_ISSUER
      });
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = { auth };
