import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import './index.css';

const sectionTitles = {
  dashboard: { title: 'Dashboard', subtitle: 'Cloud cost overview and AI-powered insights' },
  forecast: { title: 'Cost Forecast', subtitle: 'AI-powered spending predictions for the next 7-30 days' },
  anomalies: { title: 'Anomaly Detection', subtitle: 'Unusual cost patterns identified by ML models' },
  resources: { title: 'Resource Management', subtitle: 'EC2 instances with idle resource detection' },
  recommendations: { title: 'Recommendations', subtitle: 'AI-driven optimization suggestions to reduce costs' },
  budget: { title: 'Budget Tracker', subtitle: 'Monitor monthly spending against your budget limits' },
  insights: { title: 'AI Insights', subtitle: 'Intelligent analysis of your cloud spending patterns' },
};

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const current = sectionTitles[activeSection] || sectionTitles.dashboard;

  return (
    <div className="app-layout">
      <Sidebar 
         activeSection={activeSection} 
         onNavigate={(id) => { setActiveSection(id); setIsMobileOpen(false); }} 
         isMobileOpen={isMobileOpen}
         setMobileOpen={setIsMobileOpen}
      />
      
      <Header 
         title={current.title} 
         subtitle={current.subtitle} 
         theme={theme} 
         toggleTheme={toggleTheme}
         toggleMobileMenu={() => setIsMobileOpen(true)}
      />
      
      <main className="main-content">
        <Dashboard activeSection={activeSection} />
        
        {/* Global Footer attribution */}
        <footer style={{ 
          marginTop: '60px', 
          paddingTop: '30px',
          paddingBottom: '20px', 
          borderTop: '1px solid var(--border-subtle)', 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          fontSize: '0.85rem' 
        }}>
          Built with precision by <a href="https://github.com/iaryan74" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>Aryan</a> &copy; {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}
