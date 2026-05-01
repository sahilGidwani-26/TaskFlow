const express = require('express');
const { body, query } = require('express-validator');
const {
  getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats, getAllTasksAdmin,
} = require('../../controllers/taskController');
const { protect, authorize } = require('../../middleware/authMiddleware');
const { validate } = require('../../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('tags').optional().isArray(),
];

/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics for current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task statistics
 */
router.get('/stats', getTaskStats);

/**
 * @swagger
 * /tasks/admin/all:
 *   get:
 *     summary: Get all tasks (admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin/all', authorize('admin'), getAllTasksAdmin);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks for current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, done]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 */
router.get('/', getTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', taskValidation, validate, createTask);

router.get('/:id', getTask);
router.put('/:id', taskValidation, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
