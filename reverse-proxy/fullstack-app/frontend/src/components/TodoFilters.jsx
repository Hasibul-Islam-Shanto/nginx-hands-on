import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function TodoFilters({
  activeFilter,
  onFilterChange,
  categoryFilter,
  onCategoryChange,
  priorityFilter,
  onPriorityChange,
  searchQuery,
  onSearchChange,
}) {
  return (
    <div className="toolbar-container">
      {/* Status tabs */}
      <div className="tabs-group">
        <button
          className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All
        </button>
        <button
          className={`tab-btn ${activeFilter === 'active' ? 'active' : ''}`}
          onClick={() => onFilterChange('active')}
        >
          Active
        </button>
        <button
          className={`tab-btn ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => onFilterChange('completed')}
        >
          Completed
        </button>
      </div>

      {/* Category selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={14} color="#64748b" />
        <select
          className="select-custom"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Dev">Dev</option>
          <option value="Ops">Ops</option>
          <option value="Design">Design</option>
          <option value="General">General</option>
        </select>

        <select
          className="select-custom"
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Search Input */}
      <div className="search-input-wrapper">
        <Search size={15} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
