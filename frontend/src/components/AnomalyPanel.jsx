import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';

const severityConfig = {
  critical: { icon: AlertOctagon, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', badge: 'badge-danger' },
  high:     { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', badge: 'badge-warning' },
  medium:   { icon: AlertTriangle, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', badge: 'badge-info' },
  low:      { icon: Info,          color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', badge: 'badge-info' },
};

export default function AnomalyPanel({ anomalyData }) {
  if (!anomalyData) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">⚠️ Anomaly Detection</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Scanning for anomalies...</span>
        </div>
      </div>
    );
  }

  const { anomalies, total_detected, monitoring_period } = anomalyData;

  return (
    <div className="card animate-fade-up" style={{ animationDelay: '350ms', animationFillMode: 'backwards' }}>
      <div className="card-header">
        <div>
          <span className="card-title">⚠️ Anomaly Detection</span>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            {monitoring_period}
          </p>
        </div>
        <span className={`badge ${total_detected > 3 ? 'badge-danger' : 'badge-warning'}`}>
          {total_detected} found
        </span>
      </div>

      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {anomalies.length === 0 ? (
          <div className="empty-state">
            <p>✨ No anomalies detected. Cloud costs are within expected ranges.</p>
          </div>
        ) : (
          anomalies.slice(0, 8).map((anomaly, i) => {
            const config = severityConfig[anomaly.severity] || severityConfig.low;
            const Icon = config.icon;

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: i < Math.min(anomalies.length, 8) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: config.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color={config.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                      {anomaly.date}
                    </span>
                    <span className={`badge ${config.badge}`}>
                      {anomaly.deviation_pct > 0 ? '+' : ''}{anomaly.deviation_pct}%
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    {anomaly.explanation.split('. ')[0]}.
                  </p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Actual: ${anomaly.actual_cost.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Expected: ${anomaly.expected_cost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
