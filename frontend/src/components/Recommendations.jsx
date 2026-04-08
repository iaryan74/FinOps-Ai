import { Lightbulb, ChevronRight } from 'lucide-react';

const priorityConfig = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', label: 'Critical' },
  high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'High' },
  medium:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', label: 'Medium' },
  low:      { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', label: 'Low' },
};

const categoryIcons = {
  'Idle Resources': '💤',
  'Right-Sizing': '📐',
  'Reserved Instances': '🔒',
  'Storage Optimization': '💾',
  'Compute Optimization': '⚡',
  'Cost Trend': '📈',
};

export default function Recommendations({ recData }) {
  if (!recData) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">💡 Recommendations</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  const { recommendations, total_potential_savings } = recData;

  return (
    <div className="card animate-fade-up">
      <div className="card-header">
        <div>
          <span className="card-title">💡 AI Recommendations</span>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            {recommendations.length} optimization opportunities identified
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 500 }}>Total Savings</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
            ${total_potential_savings.toLocaleString()}/mo
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recommendations.map((rec) => {
          const pConfig = priorityConfig[rec.priority] || priorityConfig.low;
          const icon = categoryIcons[rec.category] || '💡';

          return (
            <div
              key={rec.id}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 10,
                padding: '16px 18px',
                transition: 'all 200ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(102,126,234,0.2)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                  <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                      {rec.title}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 8 }}>
                      {rec.description}
                    </p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: pConfig.bg, color: pConfig.color }}>
                        {pConfig.label} Priority
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Confidence: {(rec.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                    ${rec.estimated_savings.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>/month</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
