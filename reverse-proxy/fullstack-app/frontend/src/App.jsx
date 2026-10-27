import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import TodoForm from './components/TodoForm.jsx';
import TodoFilters from './components/TodoFilters.jsx';
import TodoList from './components/TodoList.jsx';
import SystemModal from './components/SystemModal.jsx';
import Toast from './components/Toast.jsx';
import { Layers, Server, Database, ShieldCheck, Zap, HardDrive } from 'lucide-react';

const API_BASE = '/api';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0, highPriority: 0, completionRate: 0 });
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch Health
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      setHealth((prev) => ({
        ...prev,
        database: { connected: false, status: 'Offline / Connecting' },
      }));
    }
  }, []);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/todos/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch Todos
  const fetchTodos = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.append('status', activeFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${API_BASE}/todos?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      } else {
        addToast('Failed to load tasks from server', 'error');
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      addToast('Cannot connect to Node.js backend', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, categoryFilter, priorityFilter, searchQuery]);

  // Initial load and periodic health check
  useEffect(() => {
    fetchTodos(true);
    fetchStats();
    fetchHealth();

    const interval = setInterval(() => {
      fetchHealth();
      fetchStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchHealth, fetchStats, fetchTodos]);

  // Add Todo
  const handleAddTodo = async (todoData) => {
    try {
      const res = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });

      if (!res.ok) {
        const errData = await res.json();
        addToast(errData.error || 'Failed to create task', 'error');
        return false;
      }

      const created = await res.json();
      setTodos((prev) => [created, ...prev]);
      addToast(`Task "${created.title.slice(0, 30)}" created`);
      fetchStats();
      return true;
    } catch (err) {
      addToast('Network error while creating task', 'error');
      return false;
    }
  };

  // Toggle Todo completion
  const handleToggle = async (id, newStatus) => {
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newStatus } : t))
    );

    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus }),
      });

      if (!res.ok) {
        // Revert on failure
        fetchTodos();
        addToast('Failed to update task status', 'error');
      } else {
        addToast(newStatus ? 'Task completed' : 'Task marked active');
        fetchStats();
      }
    } catch (err) {
      fetchTodos();
      addToast('Error updating task', 'error');
    }
  };

  // Update Todo content
  const handleUpdate = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated = await res.json();
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
        addToast('Task updated successfully');
        fetchStats();
      } else {
        addToast('Failed to save changes', 'error');
      }
    } catch (err) {
      addToast('Network error updating task', 'error');
    }
  };

  // Delete Todo
  const handleDelete = async (id) => {
    // Optimistic delete
    const previous = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setTodos(previous);
        addToast('Failed to delete task', 'error');
      } else {
        addToast('Task deleted');
        fetchStats();
      }
    } catch (err) {
      setTodos(previous);
      addToast('Error deleting task', 'error');
    }
  };

  // Bulk toggle all
  const handleToggleAll = async (targetCompleted) => {
    try {
      const res = await fetch(`${API_BASE}/todos/bulk/toggle-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: targetCompleted }),
      });

      if (res.ok) {
        addToast(`All tasks marked as ${targetCompleted ? 'completed' : 'active'}`);
        fetchTodos();
        fetchStats();
      }
    } catch (err) {
      addToast('Error toggling tasks', 'error');
    }
  };

  // Clear completed
  const handleClearCompleted = async () => {
    try {
      const res = await fetch(`${API_BASE}/todos/bulk/completed`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        addToast(`Cleared ${data.count} completed task(s)`);
        fetchTodos();
        fetchStats();
      }
    } catch (err) {
      addToast('Error clearing tasks', 'error');
    }
  };

  // Seed sample tasks
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch(`${API_BASE}/todos/seed`, {
        method: 'POST',
      });

      if (res.ok) {
        addToast('Sample development workflows seeded successfully');
        fetchTodos();
        fetchStats();
      } else {
        addToast('Failed to seed sample data', 'error');
      }
    } catch (err) {
      addToast('Error connecting to backend', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <>
      <div className="bg-grid"></div>

      <div className="container">
        {/* Navigation & Header */}
        <Header
          health={health}
          onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          onSeedData={handleSeedData}
          isSeeding={isSeeding}
        />

        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '30px 0 24px' }}>
          <div className="hero-tagline">Fullstack Architecture Demo</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}>
            Distributed Task Management <br />
            <span className="gradient-text">Engineered for Performance</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 28px' }}>
            Production-grade Todo workflow application built with React, Node.js Express REST API, and MongoDB running in Docker with persistent volume storage.
          </p>
        </section>

        {/* Real-time Task Metrics Bar */}
        <StatsBar stats={stats} />

        {/* Create Task Form */}
        <TodoForm onAddTodo={handleAddTodo} />

        {/* Filtering & Search Toolbar */}
        <TodoFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Todo List Items */}
        <TodoList
          todos={todos}
          isLoading={isLoading}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onToggleAll={handleToggleAll}
          onClearCompleted={handleClearCompleted}
        />

        {/* Tech Stack & Architecture Section (matches static-site glass cards) */}
        <section className="tech-section">
          <h2 className="section-title">Under The Hood</h2>
          <p className="section-sub">
            Component breakdown of the three-tier fullstack containerized architecture.
          </p>

          <div className="cards-grid">
            <div className="tech-card">
              <div className="tech-icon-box">
                <Layers size={22} />
              </div>
              <h3 className="tech-title">
                <span>React 18 Frontend</span>
                <span className="tech-badge">:5173</span>
              </h3>
              <p className="tech-desc">
                High-speed Single Page Application bundled with Vite. Styled with vanilla CSS design system featuring dark emerald glassmorphism, responsive grid layout, and optimistic UI transitions.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon-box">
                <Server size={22} />
              </div>
              <h3 className="tech-title">
                <span>Node.js & Express API</span>
                <span className="tech-badge">:5001</span>
              </h3>
              <p className="tech-desc">
                RESTful backend with comprehensive CRUD operations, Mongoose schema validation, real-time stats aggregation, and detailed diagnostic endpoints for container health monitoring.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon-box">
                <Database size={22} />
              </div>
              <h3 className="tech-title">
                <span>MongoDB Docker Container</span>
                <span className="tech-badge">:27017</span>
              </h3>
              <p className="tech-desc">
                Official Mongo 7.0 daemon managed completely via Docker Compose with dedicated named volume (<code>fullstack_mongodb_data</code>) ensuring zero data loss across container lifecycle.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <p>
            Fullstack Todo Application &bull; Built with <span>React</span>, <span>Node.js</span>, and <span>MongoDB in Docker</span>
          </p>
        </footer>
      </div>

      {/* Diagnostics Modal */}
      <SystemModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        health={health}
      />

      {/* Interactive Toasts */}
      <Toast toasts={toasts} />
    </>
  );
}
