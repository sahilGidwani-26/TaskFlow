const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'Token is invalid or user no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Your account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please login again.');
    }
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `Access denied. Required role: ${roles.join(' or ')}.`);
    }
    next();
  };
};

module.exports = { protect, authorize };
