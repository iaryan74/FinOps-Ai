import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
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

export default function CostChart({ dailyCosts }) {
  if (!dailyCosts?.length) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">Daily Cloud Spending</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Loading cost data...</span>
        </div>
      </div>
    );
  }

  // Show last 60 days for readability
  const chartData = dailyCosts.slice(-60).map((d) => ({
    date: d.date.slice(5), // "MM-DD"
    cost: d.amount,
  }));

  return (
    <div className="card animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
      <div className="card-header">
        <span className="card-title">Daily Cloud Spending (Last 60 Days)</span>
        <span className="badge badge-info">Live</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            stroke="#475569"
            tick={{ fontSize: 11 }}
            interval={6}
          />
          <YAxis
            stroke="#475569"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cost"
            stroke="#667eea"
            strokeWidth={2}
            fill="url(#costGradient)"
            name="Daily Cost"
            dot={false}
            activeDot={{ r: 5, fill: '#667eea', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
