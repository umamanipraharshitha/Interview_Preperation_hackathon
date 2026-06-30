import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, LogOut, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const checkAuth = () => {
    setIsAuthenticated(!!localStorage.getItem('token'));
    setRole(localStorage.getItem('role'));
  };

  useEffect(() => {
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    checkAuth();
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="nav-brand">
        <BrainCircuit className="brand-icon" size={28} />
        <span className="brand-text">Nexus<span className="accent">AI</span></span>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
        {isAuthenticated && (
          <>
            <Link to="/upload" className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}>Apply</Link>
            <Link to="/interview" className={`nav-link ${location.pathname === '/interview' ? 'active' : ''}`}>Interview</Link>
          </>
        )}
      </div>

      <div className="nav-actions">
        {isAuthenticated ? (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {role}
            </span>
            <button className="btn-outline" onClick={handleLogout} style={{ padding: '8px 16px' }}>
              <LogOut size={16} style={{ marginRight: '8px' }} />
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login"><button className="btn-outline" style={{ padding: '8px 16px' }}>Log in</button></Link>
            <Link to="/signup"><button className="btn-primary" style={{ padding: '8px 16px' }}>Sign up</button></Link>
          </div>
        )}
      </div>
    </nav>
  );
}
