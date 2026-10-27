import React from 'react';
import { Database, Server, RefreshCw, Cpu, Layers } from 'lucide-react';

export default function Header({ health, onOpenDiagnostics, onSeedData, isSeeding }) {
  const isConnected = health?.database?.connected;
  const dbStatus = health?.database?.status || 'Connecting...';

  return (
    <header>
      <div className="logo-container">
        <div className="logo-icon">
          <Layers size={22} strokeWidth={2.5} />
        </div>
        <div className="logo-text-group">
          <span className="logo-text">TaskEngine</span>
          <span className="logo-sub">React • Node.js • Docker MongoDB</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn-ghost"
          onClick={onSeedData}
          disabled={isSeeding}
          title="Populate recommended sample tasks"
        >
          <RefreshCw size={14} className={isSeeding ? 'spin' : ''} />
          <span>{isSeeding ? 'Seeding...' : 'Seed Data'}</span>
        </button>

        <div
          className={`status-badge ${!isConnected ? 'error' : ''}`}
          onClick={onOpenDiagnostics}
          title="Click to view Docker & Database Diagnostics"
        >
          <span className={`pulse-dot ${!isConnected ? 'error' : ''}`}></span>
          <span>
            {isConnected ? 'MongoDB: Online (Docker)' : `DB: ${dbStatus}`}
          </span>
          <Cpu size={14} style={{ opacity: 0.8 }} />
        </div>
      </div>
    </header>
  );
}
