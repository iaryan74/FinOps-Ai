import { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, AlertTriangle, Server,
  Lightbulb, Wallet, Brain, Download, LogOut, Zap
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'forecast', label: 'Cost Forecast', icon: TrendingUp },
  { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  { id: 'resources', label: 'Resources', icon: Server },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'insights', label: 'AI Insights', icon: Brain },
];

export default function Sidebar({ activeSection, onNavigate }) {
  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <Zap size={22} color="#667eea" />
        </div>
        <div>
          <div style={styles.logoTitle}>FinOps AI</div>
          <div style={styles.logoSub}>Cloud Optimizer</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>MAIN MENU</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.target.style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.target.style.background = 'transparent';
              }}
            >
              <Icon size={18} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
              <span>{item.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.dataSource}>
          <div style={styles.dataSourceDot} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Simulated Data Mode</span>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: 260,
    background: '#080c20',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflow: 'hidden',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'rgba(102,126,234,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#e2e8f0',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: '#64748b',
    letterSpacing: '0.05em',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    overflowY: 'auto',
  },
  navLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: '#475569',
    letterSpacing: '0.08em',
    padding: '8px 12px',
    marginBottom: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    position: 'relative',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(102,126,234,0.1)',
    color: '#a5b4fc',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 3,
    height: 20,
    borderRadius: 3,
    background: 'linear-gradient(180deg, #667eea, #764ba2)',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  dataSource: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dataSourceDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px rgba(16,185,129,0.4)',
  },
};
