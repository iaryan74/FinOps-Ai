import React from 'react';

export default function OptimizeDecision({ isOpen, onClose, recData, resourceData }) {
  if (!isOpen) return null;

  const idleCount = resourceData?.idle?.length || 0;
  const idleWaste = resourceData?.idle?.reduce((acc, curr) => acc + curr.monthly_waste, 0) || 0;
  
  const recs = recData?.recommendations || [];
  const recTotal = recs.reduce((acc, curr) => acc + curr.estimated_savings, 0);
  
  const totalSavings = idleWaste + recTotal;
  const totalActions = (idleCount > 0 ? 1 : 0) + recs.length;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="animate-fade-up">
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              ✨ AI Decision Mode
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your personalized cloud cost optimization plan.
            </p>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>

        {/* Action Plan */}
        <div style={contentStyle}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-accent)', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Action Plan ({totalActions} steps)
            </h3>
            
            <ul style={listStyle}>
              {idleCount > 0 && (
                <li style={listItemStyle}>
                  <div style={actionRowStyle}>
                    <span style={{ fontSize: '1.2rem', marginRight: '12px' }}>🛑</span>
                    <span style={actionTextStyle}>Stop {idleCount} idle EC2 instances</span>
                  </div>
                  <span style={savingsStyle}>+ ${idleWaste.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo</span>
                </li>
              )}
              
              {recs.map((rec, idx) => {
                let emoji = '💡';
                if (rec.action.toLowerCase().includes('downsize')) emoji = '📉';
                else if (rec.action.toLowerCase().includes('reserved')) emoji = '🎟️';
                else if (rec.category === 'storage') emoji = '💽';
                
                return (
                  <li key={idx} style={listItemStyle}>
                    <div style={actionRowStyle}>
                      <span style={{ fontSize: '1.2rem', marginRight: '12px' }}>{emoji}</span>
                      <span style={actionTextStyle}>{rec.action}</span>
                    </div>
                    <span style={savingsStyle}>+ ${rec.estimated_savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo</span>
                  </li>
                );
              })}

              {totalActions === 0 && (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                  Your infrastructure is fully optimized. No pending actions.
                </div>
              )}
            </ul>
          </div>

          {/* Footer Stats */}
          <div style={footerStyle}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Impact</div>
              <div style={{ color: 'var(--success)', fontSize: '2.5rem', fontWeight: '800' }}>
                 ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span>
              </div>
            </div>
            
            <button 
              className="btn btn-primary glow-button" 
              style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: 'var(--radius-md)' }}
              onClick={() => {
                alert('In a production environment, this would execute AWS API automation workflows.');
                onClose();
              }}
              disabled={totalActions === 0}
            >
              Execute Optimizations 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline Styles ──
const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const modalStyle = {
  background: 'var(--bg-card)',
  width: '100%', maxWidth: '650px',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border-accent)',
  boxShadow: 'var(--shadow-lg), 0 0 40px rgba(102, 126, 234, 0.15)',
  overflow: 'hidden',
  display: 'flex', flexDirection: 'column'
};

const headerStyle = {
  padding: '24px 32px',
  borderBottom: '1px solid var(--border-subtle)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  background: 'rgba(255, 255, 255, 0.02)'
};

const closeButtonStyle = {
  background: 'transparent', border: 'none',
  color: 'var(--text-muted)', fontSize: '1.5rem',
  cursor: 'pointer', transition: 'color 0.2s',
  padding: '4px'
};

const contentStyle = {
  padding: '32px'
};

const listStyle = {
  listStyle: 'none', padding: 0, margin: 0,
  display: 'flex', flexDirection: 'column', gap: '16px'
};

const listItemStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px',
  background: 'var(--bg-input)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  transition: 'border-color 0.2s'
};

const actionRowStyle = {
  display: 'flex', alignItems: 'center'
};

const actionTextStyle = {
  color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '500'
};

const savingsStyle = {
  color: 'var(--success)', fontWeight: '700', fontSize: '1rem',
  background: 'var(--success-bg)', padding: '6px 12px', borderRadius: '20px'
};

const footerStyle = {
  marginTop: '32px', paddingTop: '24px',
  borderTop: '1px solid var(--border-subtle)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
};
