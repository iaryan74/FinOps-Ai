import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#111638',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontSize: '0.8rem', margin: '2px 0' }}>
          {entry.name}: ${entry.value?.toFixed(2)}
        </p>
      ))}
    </div>
  );
};

export default function ForecastChart({ forecastData }) {
  if (!forecastData) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">AI Cost Forecast</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Running prediction model...</span>
        </div>
      </div>
    );
  }

  const { historical, forecast, trend, predicted_monthly, model_accuracy } = forecastData;

  // Merge historical + forecast for a continuous chart
  const chartData = [];

  // Last 30 days of historical
  const recentHistory = (historical || []).slice(-30);
  recentHistory.forEach((d) => {
    chartData.push({
      date: d.date.slice(5),
      actual: d.amount,
      predicted: null,
      upper: null,
      lower: null,
    });
  });

  // Forecast
  (forecast || []).forEach((d) => {
    chartData.push({
      date: d.date.slice(5),
      actual: null,
      predicted: d.predicted,
      upper: d.upper_bound,
      lower: d.lower_bound,
    });
  });

  // Bridge: connect the last historical point to first forecast
  if (recentHistory.length > 0 && forecast?.length > 0) {
    const bridgeIdx = recentHistory.length;
    chartData[bridgeIdx] = {
      ...chartData[bridgeIdx],
      actual: recentHistory[recentHistory.length - 1].amount,
    };
  }

  const trendEmoji = trend === 'increasing' ? '📈' : trend === 'decreasing' ? '📉' : '➡️';
  const trendColor = trend === 'increasing' ? '#ef4444' : trend === 'decreasing' ? '#10b981' : '#94a3b8';

  return (
    <div className="card animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
      <div className="card-header">
        <div>
          <span className="card-title">AI Cost Forecast</span>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {trendEmoji} Trend: <span style={{ color: trendColor, fontWeight: 600 }}>{trend}</span>
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Model accuracy: <span style={{ color: '#10b981', fontWeight: 600 }}>{model_accuracy}%</span>
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Predicted Monthly</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>
            ${predicted_monthly?.toLocaleString()}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} interval={4} />
          <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="rgba(139,92,246,0.08)"
            name="Upper Bound"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="#060918"
            name="Lower Bound"
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#667eea"
            strokeWidth={2}
            dot={false}
            name="Actual"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            name="Forecast"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
