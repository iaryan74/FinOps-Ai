import React, { useState } from 'react';

export default function WhatIfSimulator({ currentMonthlyCost, totalIdleInstances, idleResourceWaste }) {
  const [usageReduction, setUsageReduction] = useState(0);
  const [instancesToStop, setInstancesToStop] = useState(0);

  // Parse baseline cost
  const baselineCost = currentMonthlyCost || 14000; 

  // Estimate savings
  // 1. If usage drops, the overall cost minus instance waste drops down by that percent roughly.
  // 2. Extrapolate stopped instances waste saving based on average idle waste.
  const averageIdleCost = totalIdleInstances > 0 ? (idleResourceWaste / totalIdleInstances) : 50;
  
  const estimatedInstanceSavings = instancesToStop * averageIdleCost;
  const remainingComputeToReduce = Math.max(0, baselineCost - estimatedInstanceSavings);
  
  const estimatedUsageSavings = remainingComputeToReduce * (usageReduction / 100);
  
  const totalSavings = estimatedInstanceSavings + estimatedUsageSavings;
  const newProjectedCost = baselineCost - totalSavings;

  return (
    <div className="card hover-card">
      <div className="card-header">
        <span className="card-title">What-if Cost Simulator</span>
        <div className="badge badge-purple">Interactive</div>
      </div>
      
      <div className="dashboard-grid-2" style={{ gap: '40px', marginTop: '20px' }}>
        {/* Left Side: Controls */}
        <div>
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label>Global Usage Reduction (%)</label>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{usageReduction}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="50" step="1" 
              value={usageReduction} 
              onChange={(e) => setUsageReduction(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <small style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Simulate a drop in overall traffic or load.</small>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label>Stop Idle Instances</label>
              <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{instancesToStop} / {totalIdleInstances}</span>
            </div>
            <input 
              type="range" 
              min="0" max={totalIdleInstances || 10} step="1" 
              value={instancesToStop} 
              onChange={(e) => setInstancesToStop(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--warning)', cursor: 'pointer' }}
              disabled={!totalIdleInstances}
            />
             <small style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Terminating unused EC2 resources.</small>
          </div>
        </div>

        {/* Right Side: Results */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Baseline Cost:</span>
             <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>${baselineCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
             <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '1rem' }}>Total Saved:</span>
             <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>- ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '1rem' }}>New Projection:</span>
             <span style={{ color: 'var(--accent-primary)', fontWeight: '800', fontSize: '1.8rem' }}>${newProjectedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
