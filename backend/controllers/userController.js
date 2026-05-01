const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all users (admin)
// @route   GET /api/v1/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(),
    ]);

    return sendSuccess(res, 200, 'Users retrieved', users, {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (admin)
// @route   GET /api/v1/users/:id
// @access  Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found.');
    return sendSuccess(res, 200, 'User retrieved', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin)
// @route   PATCH /api/v1/users/:id/role
// @access  Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot change your own role.');
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) return sendError(res, 404, 'User not found.');
    return sendSuccess(res, 200, 'User role updated', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update own profile
// @route   PATCH /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, 200, 'Profile updated', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user (admin)
// @route   PATCH /api/v1/users/:id/deactivate
// @access  Admin
const deactivateUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot deactivate your own account.');
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return sendError(res, 404, 'User not found.');
    return sendSuccess(res, 200, 'User deactivated', user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, updateProfile, deactivateUser };
