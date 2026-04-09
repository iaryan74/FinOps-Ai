import { Download, Sun, Moon, Menu } from 'lucide-react';
import api from '../api/client';

export default function Header({ title, subtitle, theme, toggleTheme, toggleMobileMenu }) {
  const handleExport = async () => {
    try {
      const response = await api.get('/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cloud_costs_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="mobile-menu-btn btn-icon" onClick={toggleMobileMenu}>
          <Menu size={24} color="var(--text-primary)" />
        </button>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title || 'Dashboard'}</h1>
          {subtitle && <p className="hide-on-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn-icon glow-button" onClick={toggleTheme} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
           {theme === 'dark' ? <Sun size={18} color="var(--text-primary)" /> : <Moon size={18} color="var(--text-primary)" />}
        </button>
        
        <button className="btn btn-secondary btn-sm hide-on-mobile" onClick={handleExport}>
          <Download size={15} />
          Export CSV
        </button>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
          A
        </div>
      </div>
    </header>
  );
}
