import React, { useState } from 'react';
import { Plus, Tag, Flag, AlignLeft, Calendar } from 'lucide-react';

export default function TodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onAddTodo({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || null,
    });

    if (success) {
      setTitle('');
      setDescription('');
      setCategory('General');
      setPriority('medium');
      setDueDate('');
      setIsExpanded(false);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="glass-card todo-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-inputs-row">
          <input
            type="text"
            className="input-primary"
            placeholder="Add a new task or workflow item... (e.g., 'Setup NGINX upstream proxy')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={!title.trim() || isSubmitting}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Task</span>
          </button>
        </div>

        {isExpanded && (
          <>
            <textarea
              className="textarea-optional"
              placeholder="Optional description, technical notes, or commands..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <div className="form-meta-row">
              <div className="meta-group">
                <Tag size={14} color="#34d399" />
                <span className="meta-label">Category:</span>
                <select
                  className="select-custom"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General">General</option>
                  <option value="Dev">Dev</option>
                  <option value="Ops">Ops</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div className="meta-group">
                <Flag size={14} color="#fbbf24" />
                <span className="meta-label">Priority:</span>
                <select
                  className="select-custom"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="meta-group">
                <Calendar size={14} color="#38bdf8" />
                <span className="meta-label">Due Date:</span>
                <input
                  type="date"
                  className="select-custom"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <button
                type="button"
                className="btn-ghost"
                style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '0.76rem' }}
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
