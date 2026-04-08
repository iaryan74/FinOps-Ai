import { Server, StopCircle, ArrowDownCircle } from 'lucide-react';

export default function IdleResources({ resourceData }) {
  if (!resourceData) {
    return (
      <div className="card">
        <div className="card-header">
          <span className="card-title">🖥️ Idle Resources</span>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  const { idle_resources, total_monthly_waste, total_instances } = resourceData;

  const envColors = {
    production: '#ef4444',
    staging: '#f59e0b',
    development: '#3b82f6',
    testing: '#8b5cf6',
  };

  return (
    <div className="card animate-fade-up">
      <div className="card-header">
        <div>
          <span className="card-title">🖥️ Idle Resources</span>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            {idle_resources.length} idle of {total_instances} total instances
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 500 }}>Monthly Waste</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>
            ${total_monthly_waste.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Instance</th>
              <th>Type</th>
              <th>CPU</th>
              <th>Waste/Mo</th>
              <th>Env</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {idle_resources.map((r) => (
              <tr key={r.instance_id}>
                <td className="mono">{r.instance_id}</td>
                <td><span className="tag">{r.instance_type}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      background: '#1e293b',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.max(r.cpu_utilization * 10, 5)}%`,
                        height: '100%',
                        borderRadius: 2,
                        background: r.cpu_utilization < 2 ? '#ef4444' : '#f59e0b',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r.cpu_utilization}%</span>
                  </div>
                </td>
                <td style={{ color: '#ef4444', fontWeight: 600 }}>${r.monthly_waste.toFixed(2)}</td>
                <td>
                  <span className="badge" style={{
                    background: `${envColors[r.environment] || '#94a3b8'}15`,
                    color: envColors[r.environment] || '#94a3b8',
                  }}>
                    {r.environment}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {r.suggested_action.split('—')[0].trim()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
