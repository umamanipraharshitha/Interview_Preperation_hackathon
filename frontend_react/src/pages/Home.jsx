import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container animate-fade-in">
      <header className="hero-section">
        <div className="badge glass-panel">
          <Sparkles size={16} className="badge-icon" />
          <span>Automated Technical Screening</span>
        </div>
        <h1 className="hero-title">
          Smart Candidate Evaluation.<br/>
          <span className="gradient-text">Zero bias. Infinite scale.</span>
        </h1>
        <p className="hero-subtitle">
          Upload a resume to instantly generate an ATS score and engage in a personalized technical Q&A session driven by AI.
        </p>
        <div className="hero-actions">
          <Link to="/upload">
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', fontSize: '1.1rem' }}>
              Begin Screening <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </header>

      <section className="features-section">
        <div className="feature-card glass-panel">
          <Zap className="feature-icon" size={32} />
          <h3>Sub-second Latency</h3>
          <p>Powered by our distributed Redis queue and highly optimized Gemini embeddings.</p>
        </div>
        <div className="feature-card glass-panel">
          <ShieldCheck className="feature-icon" size={32} />
          <h3>Blockchain Audited</h3>
          <p>Every AI evaluation hash is cryptographically secured on Polygon for 100% transparency.</p>
        </div>
      </section>
    </div>
  );
}
