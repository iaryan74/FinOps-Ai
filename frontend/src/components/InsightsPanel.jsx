export default function InsightsPanel({ insightData }) {
  if (!insightData) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">🧠 AI Insights</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Generating insights...</span>
        </div>
      </div>
    );
  }

  const { insights } = insightData;

  const impactColors = {
    high: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)' },
    positive: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)' },
    medium: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)' },
    neutral: { bg: 'rgba(148,163,184,0.04)', border: 'rgba(148,163,184,0.1)' },
  };

  return (
    <div className="card animate-fade-up">
      <div className="card-header">
        <span className="card-title">🧠 AI Insights</span>
        <span className="badge badge-purple">AI Generated</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {insights.map((insight, i) => {
          const colors = impactColors[insight.impact] || impactColors.neutral;
          return (
            <div
              key={i}
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: '14px 16px',
                transition: 'all 200ms ease',
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{insight.icon}</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                    {insight.title}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(102,126,234,0.06)', borderRadius: 8 }}>
        <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
          Generated at {new Date(insightData.generated_at).toLocaleString()}. 
          Insights are based on your current cost data and usage patterns.
        </p>
      </div>
    </div>
  );
}
