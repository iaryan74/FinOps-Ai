import { DollarSign, TrendingUp, AlertTriangle, PiggyBank } from 'lucide-react';

export default function CostOverview({ costData, savings, anomalyCount, forecast }) {
  const formatCurrency = (val) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val?.toFixed(2) || '0.00'}`;
  };

  const stats = [
    {
      label: 'Total Spend (90d)',
      value: formatCurrency(costData?.total || 0),
      change: `$${costData?.avg_daily?.toFixed(0) || 0}/day avg`,
      changeType: 'neutral',
      icon: DollarSign,
      iconColor: 'blue',
    },
    {
      label: 'Predicted Monthly',
      value: formatCurrency(forecast?.predicted_monthly || 0),
      change: forecast?.trend === 'increasing' ? 'Trending up' : forecast?.trend === 'decreasing' ? 'Trending down' : 'Stable',
      changeType: forecast?.trend === 'increasing' ? 'negative' : forecast?.trend === 'decreasing' ? 'positive' : 'neutral',
      icon: TrendingUp,
      iconColor: 'purple',
    },
    {
      label: 'Anomalies Detected',
      value: anomalyCount?.toString() || '0',
      change: anomalyCount > 3 ? 'Needs attention' : 'Within normal',
      changeType: anomalyCount > 3 ? 'negative' : 'positive',
      icon: AlertTriangle,
      iconColor: anomalyCount > 3 ? 'red' : 'amber',
    },
    {
      label: 'Potential Savings',
      value: formatCurrency(savings?.total_potential_savings || 0),
      change: `$${(savings?.savings_this_month || 0).toFixed(0)}/mo available`,
      changeType: 'positive',
      icon: PiggyBank,
      iconColor: 'green',
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="stat-card animate-fade-up"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
          >
            <div className={`stat-icon ${stat.iconColor}`}>
              <Icon size={20} />
            </div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.changeType}`}>{stat.change}</div>
          </div>
        );
      })}
    </div>
  );
}
