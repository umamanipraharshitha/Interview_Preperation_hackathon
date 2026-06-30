import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import api from '../api/client';
import './Login.css'; // Reusing Login CSS for consistency

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', {
        username,
        password
      });

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      
      window.dispatchEvent(new Event('auth-change'));
      
      navigate('/upload');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to create account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="shield-icon-wrapper">
            <UserPlus size={32} className="shield-icon" />
          </div>
          <h2>Create Account</h2>
          <p>Join the next generation of hiring.</p>
        </div>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSignup} className="login-form">
          <div className="input-group">
            <label>Choose Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="e.g., alex_dev" 
              required 
            />
          </div>
          <div className="input-group">
            <label>Choose Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Minimum 6 characters" 
              required 
            />
          </div>
          <button type="submit" className="btn-primary login-btn" disabled={isLoading}>
            {isLoading ? <Loader2 className="spinner" size={20} /> : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
