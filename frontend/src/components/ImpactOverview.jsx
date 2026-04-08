import React from 'react';

export default function ImpactOverview({ resourceData, savingsData }) {
  const moneyWasted = resourceData?.idle?.reduce((acc, curr) => acc + curr.monthly_waste, 0) || 0;
  const moneySaved = savingsData?.savings_implemented || 0;
  const potentialSavings = savingsData?.total_potential_savings || 0;

  return (
    <div className="dashboard-grid-3">
      {/* Money Wasted */}
      <div className="card hover-card" style={{ borderLeft: '4px solid var(--danger)' }}>
        <div className="card-header">
          <span className="card-title" style={{ color: 'var(--danger)' }}>Money Wasted (Idle)</span>
          <div className="badge badge-danger">High Priority</div>
        </div>
        <div className="card-value">${moneyWasted.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {resourceData?.idle?.length || 0} instances currently running with &lt;5% CPU load.
        </div>
      </div>

      {/* Money Saved */}
      <div className="card hover-card" style={{ borderLeft: '4px solid var(--success)' }}>
        <div className="card-header">
          <span className="card-title" style={{ color: 'var(--success)' }}>Money Saved</span>
          <div className="badge badge-success">Active</div>
        </div>
        <div className="card-value">${moneySaved.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Savings realized from right-sizing and stopped instances.
        </div>
      </div>

      {/* Potential Savings */}
      <div className="card hover-card" style={{ borderLeft: '4px solid var(--warning)' }}>
        <div className="card-header">
          <span className="card-title" style={{ color: 'var(--warning)' }}>Potential Savings</span>
          <div className="badge badge-warning">Available</div>
        </div>
        <div className="card-value">${potentialSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Run AI Decision Mode to securely recapture this capital.
        </div>
      </div>
    </div>
  );
}
