const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAuth(req, res, next){
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try{
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    return next();
  }catch(err){
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(roles = []){
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

module.exports = { requireAuth, requireRole };
