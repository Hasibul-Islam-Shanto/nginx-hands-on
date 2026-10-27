import React, { useState } from 'react';
import { Check, Trash2, Edit2, X, CheckSquare, Calendar } from 'lucide-react';

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || '');

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
    setIsEditing(false);
  };

  const getCategoryClass = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'dev': return 'badge-dev';
      case 'ops': return 'badge-ops';
      case 'design': return 'badge-design';
      default: return 'badge-general';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'badge-priority-high';
      case 'medium': return 'badge-priority-medium';
      default: return 'badge-priority-low';
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`todo-item-card ${todo.completed ? 'completed' : ''}`}>
      {/* Custom Checkbox */}
      <div
        className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
        onClick={() => onToggle(todo.id, !todo.completed)}
        title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {todo.completed && <Check size={14} color="#ffffff" strokeWidth={3} />}
      </div>

      {/* Content Column */}
      <div className="todo-content-col">
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              className="input-primary"
              style={{ padding: '8px 12px', fontSize: '0.9rem' }}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
            />
            <textarea
              className="textarea-optional"
              style={{ marginTop: 0 }}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description..."
              rows={2}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                className="btn-ghost"
                onClick={handleCancelEdit}
                style={{ padding: '4px 8px' }}
              >
                <X size={13} /> Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveEdit}
                style={{ padding: '4px 12px', fontSize: '0.8rem' }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="todo-header-line">
              <span className={`todo-title ${todo.completed ? 'done' : ''}`}>
                {todo.title}
              </span>
            </div>

            {todo.description && (
              <p className="todo-desc">{todo.description}</p>
            )}

            <div className="todo-badges-row">
              <span className={`badge-category ${getCategoryClass(todo.category)}`}>
                {todo.category || 'General'}
              </span>

              <span className={getPriorityClass(todo.priority)}>
                {todo.priority ? todo.priority.toUpperCase() : 'MEDIUM'}
              </span>

              {todo.dueDate && (
                <span className="badge-time" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {formatDueDate(todo.dueDate)}
                </span>
              )}

              <span className="badge-time">
                {new Date(todo.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {!isEditing && (
        <div className="todo-actions-group">
          <button
            className="icon-btn"
            onClick={() => setIsEditing(true)}
            title="Edit task"
          >
            <Edit2 size={15} />
          </button>
          <button
            className="icon-btn delete"
            onClick={() => onDelete(todo.id)}
            title="Delete task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
