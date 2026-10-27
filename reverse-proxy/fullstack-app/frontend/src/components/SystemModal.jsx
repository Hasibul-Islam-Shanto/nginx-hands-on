import React, { useState } from 'react';
import { X, Check, Copy, Server, Database, Box, Activity } from 'lucide-react';

export default function SystemModal({ isOpen, onClose, health }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippet = `# Check MongoDB Docker container
docker ps --filter "name=fullstack-mongodb"

# View MongoDB container logs
docker logs fullstack-mongodb -n 20

# Test backend health endpoint
curl http://localhost:5001/api/health

# Test todos endpoint directly
curl http://localhost:5001/api/todos`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dbState = health?.database || {};
  const sysState = health?.system || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#10b981" />
            <h3 className="modal-title">System & Docker Architecture</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Database size={16} color="#34d399" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>MongoDB (Docker)</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div>Status: <span style={{ color: dbState.connected ? '#34d399' : '#f87171', fontWeight: 600 }}>{dbState.status || 'Connecting'}</span></div>
              <div>Container: <span style={{ fontFamily: 'Fira Code' }}>fullstack-mongodb</span></div>
              <div>Port: <span style={{ fontFamily: 'Fira Code' }}>27017</span></div>
              <div>Database: <span style={{ fontFamily: 'Fira Code' }}>{dbState.name || 'tododb'}</span></div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Server size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Express Node.js</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div>Status: <span style={{ color: '#38bdf8', fontWeight: 600 }}>Running</span></div>
              <div>Port: <span style={{ fontFamily: 'Fira Code' }}>5001</span></div>
              <div>Node Version: <span style={{ fontFamily: 'Fira Code' }}>{sysState.nodeVersion || 'v26+'}</span></div>
              <div>Memory: <span style={{ fontFamily: 'Fira Code' }}>{sysState.memoryUsageMB || 45} MB</span></div>
            </div>
          </div>
        </div>

        {/* Architecture details */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '8px', color: '#6ee7b7' }}>
            Fullstack Data Flow
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            React (Vite :5173) sends asynchronous HTTP requests via Vite reverse-proxy configuration to the Express Node.js backend (:5001). The backend utilizes Mongoose ODM to query the isolated MongoDB engine running inside Docker container <code style={{ color: '#34d399', fontFamily: 'Fira Code' }}>fullstack-mongodb</code> (:27017) with persistent volume storage.
          </p>
        </div>

        {/* CLI Cheatsheet */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Useful Docker & API Commands
            </span>
            <button
              className="copy-btn"
              onClick={handleCopy}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="code-block">{codeSnippet}</pre>
        </div>
      </div>
    </div>
  );
}
