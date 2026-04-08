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
import ImpactOverview from '../components/ImpactOverview';
import WhatIfSimulator from '../components/WhatIfSimulator';
import OptimizeDecision from '../components/OptimizeDecision';

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
  
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

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

  // ── LOADING STATE SKELETON ──
  if (loading && !costData) {
    return (
      <div className="animate-fade-in dashboard-full">
        <div className="dashboard-grid-3">
           <div className="skeleton-loading" style={{ height: '140px' }} />
           <div className="skeleton-loading" style={{ height: '140px' }} />
           <div className="skeleton-loading" style={{ height: '140px' }} />
        </div>
        <div className="dashboard-grid" style={{ marginTop: '20px' }}>
           <div className="skeleton-loading" style={{ height: '400px' }} />
           <div className="skeleton-loading" style={{ height: '400px' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: '#ef4444', marginBottom: 8 }}>Connection Error</h2>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>{error}</p>
        <button className="btn btn-primary glow-button" onClick={loadAllData}>Retry</button>
      </div>
    );
  }

  // Render based on active section
  if (activeSection === 'forecast') return <div className="animate-fade-in"><ForecastChart forecastData={forecastData} /></div>;
  if (activeSection === 'anomalies') return <div className="animate-fade-in"><AnomalyPanel anomalyData={anomalyData} /></div>;
  if (activeSection === 'resources') return <div className="animate-fade-in"><IdleResources resourceData={resourceData} /></div>;
  if (activeSection === 'recommendations') return <div className="animate-fade-in"><Recommendations recData={recData} /></div>;
  if (activeSection === 'budget') return <div className="animate-fade-in" style={{ maxWidth: 600 }}><BudgetWidget budgetData={budgetData} onSetBudget={handleSetBudget} /></div>;
  if (activeSection === 'insights') return <div className="animate-fade-in"><InsightsPanel insightData={insightData} /></div>;

  // Default: full dashboard view
  return (
    <div className="animate-fade-in">
      
      {/* ── Premium Sticky Header Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
         <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>FinOps Intelligence</h1>
         <button 
           className="btn btn-primary glow-button" 
           style={{ padding: '12px 24px', fontSize: '1.05rem', fontWeight: 700 }}
           onClick={() => setIsDecisionOpen(true)}
         >
           ✨ Optimize My Cloud
         </button>
      </div>

      <OptimizeDecision 
        isOpen={isDecisionOpen} 
        onClose={() => setIsDecisionOpen(false)} 
        recData={recData} 
        resourceData={resourceData} 
      />

      {/* Row 1: Impact Overview */}
      <ImpactOverview resourceData={resourceData} savingsData={savingsData} />

      {/* Row 2: Top Stats */}
      <CostOverview
        costData={costData}
        savings={savingsData}
        anomalyCount={anomalyData?.total_detected || 0}
        forecast={forecastData}
      />

      {/* Row 3: Cost Chart + Breakdown */}
      <div className="dashboard-grid">
        <CostChart dailyCosts={costData?.daily_costs} />
        <CostBreakdown breakdown={breakdown} />
      </div>

      {/* Row 4: Forecast */}
      <ForecastChart forecastData={forecastData} />

      {/* Row 5: What-If Simulator + Anomalies */}
      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <WhatIfSimulator 
           currentMonthlyCost={costData?.total} 
           totalIdleInstances={resourceData?.idle?.length || 0}
           idleResourceWaste={resourceData?.idle?.reduce((acc, curr) => acc + curr.monthly_waste, 0) || 0}
        />
        <AnomalyPanel anomalyData={anomalyData} />
      </div>

      {/* Row 6: Budget + Insights */}
      <div className="dashboard-grid-2" style={{ marginTop: 24 }}>
        <BudgetWidget budgetData={budgetData} onSetBudget={handleSetBudget} />
        <InsightsPanel insightData={insightData} />
      </div>

      {/* Row 7: Recommendations */}
      <div style={{ marginTop: 24 }}>
        <Recommendations recData={recData} />
      </div>
    </div>
  );
}
