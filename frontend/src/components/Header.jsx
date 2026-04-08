import { Bell, Download, Search } from 'lucide-react';

export default function Header({ title, subtitle }) {
  const handleExport = () => {
    window.open('http://localhost:8000/export/csv', '_blank');
  };

  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>{title || 'Dashboard'}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>

      <div style={styles.actions}>
        <button className="btn btn-secondary btn-sm" onClick={handleExport}>
          <Download size={15} />
          Export CSV
        </button>
        <div style={styles.avatar}>A</div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 260,
    right: 0,
    height: 64,
    background: 'rgba(6,9,24,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    zIndex: 90,
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#e2e8f0',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: 2,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'white',
    cursor: 'pointer',
  },
};
