import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes.js';
import { Todo } from './models/Todo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tododb';

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// System Health & Diagnostics endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      provider: 'MongoDB (Docker)',
      status: states[dbState] || 'Unknown',
      connected: dbState === 1,
      host: mongoose.connection.host || 'localhost',
      port: mongoose.connection.port || 27017,
      name: mongoose.connection.name || 'tododb',
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  });
});

// Mount Routes
app.use('/api/todos', todoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Connect to MongoDB and seed initial data if empty
async function startServer() {
  try {
    console.log(`[Database] Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Database] Connected to MongoDB via Docker successfully.');

    // Seed if empty
    const count = await Todo.countDocuments({});
    if (count === 0) {
      console.log('[Database] Seeding initial sample todos...');
      await Todo.insertMany([
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
      ]);
      console.log('[Database] Initial sample todos seeded.');
    }

    app.listen(PORT, () => {
      console.log(`[Server] Node.js Express server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error.message);
    // Still run the app so health endpoint can report connection failure
    app.listen(PORT, () => {
      console.log(`[Server] Express running in fallback mode on http://localhost:${PORT} (MongoDB offline)`);
    });
  }
}

startServer();
