import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function SavingsTracker({ savingsData }) {
  if (!savingsData) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">🏆 Savings Tracker</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  const { total_potential_savings, savings_this_month, savings_implemented, top_categories } = savingsData;

  return (
    <div className="card animate-fade-up" style={{
      background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(6,9,24,1) 50%)',
    }}>
      <div className="card-header">
        <span className="card-title">🏆 Savings Tracker</span>
      </div>

      {/* Big savings number */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>Total Potential Savings</div>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2,
        }}>
          ${total_potential_savings.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>per month</div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{
          flex: 1,
          background: 'rgba(16,185,129,0.08)',
          borderRadius: 10,
          padding: '14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>
            ${savings_this_month.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>Available Now</div>
        </div>
        <div style={{
          flex: 1,
          background: 'rgba(59,130,246,0.08)',
          borderRadius: 10,
          padding: '14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>
            ${savings_implemented.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>Implemented</div>
        </div>
      </div>

      {/* Category breakdown */}
      {top_categories?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 10, fontWeight: 600 }}>
            SAVINGS BY CATEGORY
          </div>
          {top_categories.map((cat, i) => {
            const maxAmount = Math.max(...top_categories.map(c => c.amount));
            const pct = (cat.amount / maxAmount) * 100;
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{cat.category}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                    ${cat.amount.toLocaleString()}
                  </span>
                </div>
                <div style={{
                  height: 6,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: `hsl(${160 + i * 30}, 70%, 50%)`,
                    transition: 'width 600ms ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
