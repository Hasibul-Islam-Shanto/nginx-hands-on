import React from 'react';
import TodoItem from './TodoItem.jsx';
import { CheckCheck, Trash, Inbox } from 'lucide-react';

export default function TodoList({
  todos,
  isLoading,
  onToggle,
  onDelete,
  onUpdate,
  onToggleAll,
  onClearCompleted,
}) {
  const completedCount = todos.filter((t) => t.completed).length;
  const hasTodos = todos.length > 0;
  const allCompleted = hasTodos && completedCount === todos.length;

  return (
    <div>
      {/* Bulk actions bar */}
      {hasTodos && (
        <div className="bulk-actions-row">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-ghost"
              onClick={() => onToggleAll(!allCompleted)}
            >
              <CheckCheck size={14} />
              <span>{allCompleted ? 'Mark All Active' : 'Mark All Completed'}</span>
            </button>
            {completedCount > 0 && (
              <button
                className="btn-danger-ghost"
                onClick={onClearCompleted}
              >
                <Trash size={14} />
                <span>Clear Completed ({completedCount})</span>
              </button>
            )}
          </div>
          <span>
            Showing {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      )}

      {/* Todo Items */}
      <div className="todo-list-container">
        {isLoading ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 12px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Synchronizing with MongoDB via Node.js API...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Inbox size={42} color="#10b981" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#f1f5f9' }}>
              No tasks found
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
              Create a new task above or click "Seed Data" in the top bar to populate standard development workflows.
            </p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
