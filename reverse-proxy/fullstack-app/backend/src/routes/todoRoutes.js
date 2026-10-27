import express from 'express';
import { Todo } from '../models/Todo.js';

const router = express.Router();

// GET all todos with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const filter = {};

    if (status === 'active') {
      filter.completed = false;
    } else if (status === 'completed') {
      filter.completed = true;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
  }
});

// GET stats summary
router.get('/stats', async (req, res) => {
  try {
    const [total, completed, active, highPriority] = await Promise.all([
      Todo.countDocuments({}),
      Todo.countDocuments({ completed: true }),
      Todo.countDocuments({ completed: false }),
      Todo.countDocuments({ priority: 'high', completed: false }),
    ]);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      total,
      completed,
      active,
      highPriority,
      completionRate,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// POST create todo
router.post('/', async (req, res) => {
  try {
    const { title, description, category, priority, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTodo = new Todo({
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category || 'General',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      completed: false,
    });

    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create task', details: error.message });
  }
});

// PATCH update todo
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, completed, category, priority, dueDate } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (completed !== undefined) updates.completed = Boolean(completed);
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;

    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedTodo) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update task', details: error.message });
  }
});

// DELETE single todo
router.delete('/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
});

// POST seed sample data
router.post('/seed', async (req, res) => {
  try {
    const samples = [
      {
        title: 'Configure NGINX Reverse Proxy for Fullstack App',
        description: 'Route /api requests to Express Node.js and / to React Vite frontend bundle.',
        category: 'Ops',
        priority: 'high',
        completed: false,
      },
      {
        title: 'Deploy MongoDB container with persistent volume',
        description: 'Ensure data persistence across Docker container rebuilds and restarts.',
        category: 'Ops',
        priority: 'high',
        completed: true,
      },
      {
        title: 'Implement Dark Emerald Cyberpunk Design System',
        description: 'Mirror Plus Jakarta Sans typography, radial glows, and glassmorphic cards.',
        category: 'Design',
        priority: 'medium',
        completed: true,
      },
      {
        title: 'Build React Todo List with Filter and Priority Tags',
        description: 'Add live state management, optimistic UI updates, and category badges.',
        category: 'Dev',
        priority: 'medium',
        completed: false,
      },
      {
        title: 'Add Health Check API endpoint for Docker & DB status',
        description: 'Provide live database connection verification for frontend status badge.',
        category: 'Dev',
        priority: 'low',
        completed: true,
      },
    ];

    await Todo.deleteMany({});
    const created = await Todo.insertMany(samples);
    res.status(201).json({ message: 'Sample tasks seeded successfully', count: created.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed sample tasks', details: error.message });
  }
});

// DELETE clear all completed todos
router.delete('/bulk/completed', async (req, res) => {
  try {
    const result = await Todo.deleteMany({ completed: true });
    res.json({ message: 'Completed tasks removed', count: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear completed tasks', details: error.message });
  }
});

// PATCH toggle all todos
router.patch('/bulk/toggle-all', async (req, res) => {
  try {
    const { completed } = req.body;
    const targetStatus = completed !== undefined ? completed : true;
    await Todo.updateMany({}, { completed: targetStatus });
    const updated = await Todo.find({}).sort({ createdAt: -1 });
    res.json({ message: `Updated all tasks to ${targetStatus ? 'completed' : 'active'}`, todos: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle all tasks', details: error.message });
  }
});

export default router;
