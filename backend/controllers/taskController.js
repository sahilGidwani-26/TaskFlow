const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all tasks for current user
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = { owner: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean({ virtuals: true }),
      Task.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, 'Tasks retrieved', tasks, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return sendError(res, 404, 'Task not found.');
    return sendSuccess(res, 200, 'Task retrieved', task);
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      owner: req.user._id,
    });
    return sendSuccess(res, 201, 'Task created', task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title, description, status, priority, dueDate, tags },
      { new: true, runValidators: true }
    );

    if (!task) return sendError(res, 404, 'Task not found.');
    return sendSuccess(res, 200, 'Task updated', task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) return sendError(res, 404, 'Task not found.');
    return sendSuccess(res, 200, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get task stats
// @route   GET /api/v1/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      { $match: { owner: req.user._id } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatted = {
      byStatus: { todo: 0, 'in-progress': 0, done: 0 },
      byPriority: { low: 0, medium: 0, high: 0 },
      total: 0,
    };

    stats.forEach(({ _id, count }) => {
      formatted.byStatus[_id] = count;
      formatted.total += count;
    });

    priorityStats.forEach(({ _id, count }) => {
      formatted.byPriority[_id] = count;
    });

    return sendSuccess(res, 200, 'Stats retrieved', formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all tasks
// @route   GET /api/v1/tasks/admin/all
// @access  Admin
const getAllTasksAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(),
    ]);

    return sendSuccess(res, 200, 'All tasks retrieved', tasks, {
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats, getAllTasksAdmin };
