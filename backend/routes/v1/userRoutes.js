const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers, getUserById, updateUserRole, updateProfile, deactivateUser,
} = require('../../controllers/userController');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { validate } = require('../../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update own profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/profile',
  [body('name').trim().notEmpty().isLength({ min: 2, max: 50 })],
  validate,
  updateProfile
);

// Admin-only routes
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/role', [body('role').isIn(['user', 'admin'])], validate, updateUserRole);
router.patch('/:id/deactivate', deactivateUser);

module.exports = router;
