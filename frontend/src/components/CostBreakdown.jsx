import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#667eea', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#111638',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8,
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>{d.service}</p>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>
        ${d.total?.toFixed(2)} ({d.percentage}%)
      </p>
    </div>
  );
};

export default function CostBreakdown({ breakdown }) {
  if (!breakdown?.length) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">Cost by Service</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-up" style={{ animationDelay: '280ms', animationFillMode: 'backwards' }}>
      <div className="card-header">
        <span className="card-title">Cost by Service</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <ResponsiveContainer width="50%" height={200}>
          <PieChart>
            <Pie
              data={breakdown}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="total"
              nameKey="service"
              stroke="none"
            >
              {breakdown.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ flex: 1 }}>
          {breakdown.map((item, i) => (
            <div key={item.service} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: i < breakdown.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: COLORS[i % COLORS.length],
                }} />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {item.service.replace('Amazon ', '').replace('AWS ', '')}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
