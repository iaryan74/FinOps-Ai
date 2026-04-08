export default function TopActions({ recommendations }) {
  if (!recommendations?.length) return null;

  const top3 = recommendations.slice(0, 3);

  return (
    <div className="card animate-fade-up" style={{
      background: 'linear-gradient(135deg, rgba(102,126,234,0.06) 0%, var(--bg-card) 60%)',
    }}>
      <div className="card-header">
        <span className="card-title">🎯 Top 3 Cost-Saving Actions</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {top3.map((rec, i) => (
          <div
            key={rec.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: i === 0 ? 'rgba(239,68,68,0.1)' : i === 1 ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#3b82f6',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                {rec.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                {rec.category} · {(rec.confidence * 100).toFixed(0)}% confidence
              </div>
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#10b981',
              flexShrink: 0,
            }}>
              ${rec.estimated_savings.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
