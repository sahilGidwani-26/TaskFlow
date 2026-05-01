const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email already exists.');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    logger.info(`New user registered: ${email}`);

    return sendSuccess(res, 201, 'Account created successfully', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Your account has been deactivated. Contact support.');
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    logger.info(`User logged in: ${email}`);

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('tasks');
    return sendSuccess(res, 200, 'Profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
