import { useState } from 'react';

export default function BudgetWidget({ budgetData, onSetBudget }) {
  const [editing, setEditing] = useState(false);
  const [newLimit, setNewLimit] = useState('');

  if (!budgetData) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">💰 Budget Tracker</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  const {
    monthly_limit, current_spend, percentage_used,
    remaining, is_over_budget, alerts
  } = budgetData;

  const progressColor = percentage_used >= 100 ? 'red'
    : percentage_used >= 80 ? 'amber' : 'green';

  const handleSave = () => {
    const val = parseFloat(newLimit);
    if (val > 0) {
      onSetBudget(val);
      setEditing(false);
      setNewLimit('');
    }
  };

  return (
    <div className="card animate-fade-up">
      <div className="card-header">
        <span className="card-title">💰 Budget Tracker</span>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancel' : 'Set Budget'}
        </button>
      </div>

      {editing && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="number"
            placeholder="Monthly limit ($)"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            className="input-field"
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
        </div>
      )}

      {/* Budget amount */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Spend</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: is_over_budget ? '#ef4444' : '#e2e8f0' }}>
            ${current_spend.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Budget Limit</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e8f0' }}>
            ${monthly_limit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{percentage_used}% used</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>${remaining.toLocaleString()} left</span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-bar-fill ${progressColor}`}
            style={{ width: `${Math.min(percentage_used, 100)}%` }}
          />
        </div>
      </div>

      {/* Alerts */}
      {alerts?.map((alert, i) => (
        <div
          key={i}
          className={`alert-banner ${is_over_budget ? 'danger' : percentage_used >= 80 ? 'warning' : 'info'}`}
          style={{ fontSize: '0.8rem', marginBottom: 8 }}
        >
          {alert}
        </div>
      ))}
    </div>
  );
}
