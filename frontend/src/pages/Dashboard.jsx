import { useState, useEffect } from 'react';
import {
  fetchDailyCosts, fetchCostBreakdown, fetchForecast,
  fetchAnomalies, fetchIdleResources, fetchRecommendations,
  fetchBudget, setBudget, fetchInsights, fetchSavings
} from '../api/client';

import CostOverview from '../components/CostOverview';
import CostChart from '../components/CostChart';
import CostBreakdown from '../components/CostBreakdown';
import ForecastChart from '../components/ForecastChart';
import AnomalyPanel from '../components/AnomalyPanel';
import IdleResources from '../components/IdleResources';
import Recommendations from '../components/Recommendations';
import BudgetWidget from '../components/BudgetWidget';
import SavingsTracker from '../components/SavingsTracker';
import InsightsPanel from '../components/InsightsPanel';
import TopActions from '../components/TopActions';

export default function Dashboard({ activeSection }) {
  const [costData, setCostData] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [resourceData, setResourceData] = useState(null);
  const [recData, setRecData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [savingsData, setSavingsData] = useState(null);
  const [insightData, setInsightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [costRes, breakdownRes, forecastRes, anomalyRes, resourceRes, recRes, budgetRes, savingsRes, insightRes] =
        await Promise.allSettled([
          fetchDailyCosts(),
          fetchCostBreakdown(),
          fetchForecast(14),
          fetchAnomalies(),
          fetchIdleResources(),
          fetchRecommendations(),
          fetchBudget(),
          fetchSavings(),
          fetchInsights(),
        ]);

      if (costRes.status === 'fulfilled') setCostData(costRes.value.data);
      if (breakdownRes.status === 'fulfilled') setBreakdown(breakdownRes.value.data);
      if (forecastRes.status === 'fulfilled') setForecastData(forecastRes.value.data);
      if (anomalyRes.status === 'fulfilled') setAnomalyData(anomalyRes.value.data);
      if (resourceRes.status === 'fulfilled') setResourceData(resourceRes.value.data);
      if (recRes.status === 'fulfilled') setRecData(recRes.value.data);
      if (budgetRes.status === 'fulfilled') setBudgetData(budgetRes.value.data);
      if (savingsRes.status === 'fulfilled') setSavingsData(savingsRes.value.data);
      if (insightRes.status === 'fulfilled') setInsightData(insightRes.value.data);
    } catch (err) {
      setError('Failed to load data. Ensure the backend server is running on port 8000.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async (limit) => {
    try {
      const res = await setBudget(limit);
      setBudgetData(res.data);
    } catch (err) {
      console.error('Failed to set budget:', err);
    }
  };

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: '#ef4444', marginBottom: 8 }}>Connection Error</h2>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>{error}</p>
        <button className="btn btn-primary" onClick={loadAllData}>Retry</button>
      </div>
    );
  }

  // Render based on active section
  if (activeSection === 'forecast') {
    return (
      <div className="animate-fade-in">
        <ForecastChart forecastData={forecastData} />
      </div>
    );
  }

  if (activeSection === 'anomalies') {
    return (
      <div className="animate-fade-in">
        <AnomalyPanel anomalyData={anomalyData} />
      </div>
    );
  }

  if (activeSection === 'resources') {
    return (
      <div className="animate-fade-in">
        <IdleResources resourceData={resourceData} />
      </div>
    );
  }

  if (activeSection === 'recommendations') {
    return (
      <div className="animate-fade-in">
        <Recommendations recData={recData} />
      </div>
    );
  }

  if (activeSection === 'budget') {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 600 }}>
        <BudgetWidget budgetData={budgetData} onSetBudget={handleSetBudget} />
      </div>
    );
  }

  if (activeSection === 'insights') {
    return (
      <div className="animate-fade-in">
        <InsightsPanel insightData={insightData} />
      </div>
    );
  }

  // Default: full dashboard view
  return (
    <div className="animate-fade-in">
      {/* Top Stats */}
      <CostOverview
        costData={costData}
        savings={savingsData}
        anomalyCount={anomalyData?.total_detected || 0}
        forecast={forecastData}
      />

      {/* Row 1: Cost Chart + Breakdown */}
      <div className="dashboard-grid">
        <CostChart dailyCosts={costData?.daily_costs} />
        <CostBreakdown breakdown={breakdown} />
      </div>

      {/* Row 2: Forecast */}
      <ForecastChart forecastData={forecastData} />

      {/* Row 3: Top Actions + Anomalies */}
      <div className="dashboard-grid" style={{ marginTop: 20 }}>
        <TopActions recommendations={recData?.recommendations} />
        <AnomalyPanel anomalyData={anomalyData} />
      </div>

      {/* Row 4: Budget + Savings */}
      <div className="dashboard-grid-2" style={{ marginTop: 4 }}>
        <BudgetWidget budgetData={budgetData} onSetBudget={handleSetBudget} />
        <SavingsTracker savingsData={savingsData} />
      </div>

      {/* Row 5: Idle Resources */}
      <div style={{ marginTop: 4 }}>
        <IdleResources resourceData={resourceData} />
      </div>

      {/* Row 6: Recommendations + Insights */}
      <div className="dashboard-grid" style={{ marginTop: 20 }}>
        <Recommendations recData={recData} />
        <InsightsPanel insightData={insightData} />
      </div>
    </div>
  );
}
