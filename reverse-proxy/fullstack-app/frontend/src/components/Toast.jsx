import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.type === 'error' ? (
            <AlertCircle size={16} color="#ef4444" />
          ) : toast.type === 'info' ? (
            <Info size={16} color="#38bdf8" />
          ) : (
            <CheckCircle2 size={16} color="#10b981" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
