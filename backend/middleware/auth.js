const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id).select('-passwordHash');
      if (!req.user) return res.status(401).json({ message: 'Not authorized, user missing' });
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired, please login again' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'super_admin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Super admin access required' });
  }
};

// Aliases for more granular route protection
const requireAuth = protect;
const requireRole = (roles = []) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized for this resource' });
};

module.exports = { protect, admin, superAdmin, requireAuth, requireRole };
