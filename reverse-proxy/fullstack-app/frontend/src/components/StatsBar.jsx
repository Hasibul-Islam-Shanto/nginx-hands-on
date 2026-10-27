import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Layers, Percent } from 'lucide-react';

export default function StatsBar({ stats }) {
  const total = stats?.total || 0;
  const active = stats?.active || 0;
  const completed = stats?.completed || 0;
  const highPriority = stats?.highPriority || 0;
  const completionRate = stats?.completionRate || 0;

  return (
    <div className="stats-grid">
      <div className="stat-pill">
        <div className="stat-header">
          <span className="stat-label">Total Tasks</span>
          <Layers size={16} color="#34d399" />
        </div>
        <div className="stat-num">{total}</div>
      </div>

      <div className="stat-pill">
        <div className="stat-header">
          <span className="stat-label">In Progress</span>
          <Clock size={16} color="#38bdf8" />
        </div>
        <div className="stat-num" style={{ color: '#38bdf8' }}>{active}</div>
      </div>

      <div className="stat-pill">
        <div className="stat-header">
          <span className="stat-label">Completed</span>
          <CheckCircle2 size={16} color="#10b981" />
        </div>
        <div className="stat-num" style={{ color: '#10b981' }}>{completed}</div>
      </div>

      <div className="stat-pill">
        <div className="stat-header">
          <span className="stat-label">High Priority</span>
          <AlertTriangle size={16} color="#f87171" />
        </div>
        <div className="stat-num" style={{ color: '#f87171' }}>{highPriority}</div>
      </div>

      <div className="stat-pill">
        <div className="stat-header">
          <span className="stat-label">Completion</span>
          <Percent size={15} color="#6ee7b7" />
        </div>
        <div className="stat-num">{completionRate}%</div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
