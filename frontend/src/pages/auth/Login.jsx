import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('admin@nexora.ae');
  const [password, setPassword] = useState('Admin@123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Please provide both user ID/email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(username, password);
      showToast('Authentication successful. Welcome to NEXORA ERP.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email, pass) => {
    setUsername(email);
    setPassword(pass);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'var(--color-bg-app)',
      }}
    >
      {/* Left Column: Quiet Enterprise Branding */}
      <div
        style={{
          flex: '1 1 50%',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        className="login-left-brand"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.04em' }}>NEXORA</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.06em' }}>ENTERPRISE ERP PLATFORM</div>
            </div>
          </div>

          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '16px',
              color: '#ffffff',
            }}
          >
            Mission-Critical Enterprise Operations Management
          </h1>
          <p
            style={{
              fontSize: '14.5px',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '480px',
              marginBottom: '32px',
            }}
          >
            Unified real-time visibility across sales, inventory, accounting, human capital, and logistics for corporations across the UAE and GCC.
          </p>

          {/* Enterprise Capabilities Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ marginTop: '3px', color: '#38bdf8' }}>•</div>
              <div>
                <strong style={{ fontSize: '13.5px', color: '#e2e8f0' }}>Full Relational Integrity:</strong>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>
                  Connected MySQL 8.0 schema managing double-entry financials, orders, and multi-location warehouses.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ marginTop: '3px', color: '#38bdf8' }}>•</div>
              <div>
                <strong style={{ fontSize: '13.5px', color: '#e2e8f0' }}>Role-Based Access Control (RBAC):</strong>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>
                  Granular permission enforcement across Super Admin, Finance, HR, Inventory, and Sales roles.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ marginTop: '3px', color: '#38bdf8' }}>•</div>
              <div>
                <strong style={{ fontSize: '13.5px', color: '#e2e8f0' }}>Tax & Regulatory Compliance:</strong>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>
                  5% UAE VAT calculations, automatic invoice numbering, and audit compliance logging.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          <div>NEXORA Enterprise Solutions LLC &bull; System Release 2026.4</div>
          <div style={{ marginTop: '4px' }}>Level 28, Al Saada Tower, Business Bay, Dubai, UAE</div>
        </div>
      </div>

      {/* Right Column: Secure Login Form */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
              Sign In to Your Workspace
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Enter your corporate credentials to access the ERP system.
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: 'var(--status-danger-bg)',
                border: '1px solid var(--status-danger-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-danger-text)',
                fontSize: '12.5px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label form-label-required">Corporate Email / Username</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@nexora.ae"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label form-label-required">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Contact your system administrator to reset corporate credentials.', 'info');
                  }}
                  style={{ fontSize: '12px', color: 'var(--color-accent)' }}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                  }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '16px 0 24px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
              }}
            >
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" style={{ cursor: 'pointer' }}>
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '40px', fontSize: '14px', fontWeight: 600 }}
              disabled={isLoading}
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In to ERP <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div
            style={{
              marginTop: '28px',
              padding: '14px',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-text-muted)',
                marginBottom: '8px',
              }}
            >
              Quick Test Accounts (Click to Fill):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickLogin('admin@nexora.ae', 'Admin@123')}
              >
                Admin (Sajith)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickLogin('finance@nexora.ae', 'Finance@123')}
              >
                Finance (Fatima)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickLogin('sales@nexora.ae', 'Sales@123')}
              >
                Sales (Rashid)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickLogin('inventory@nexora.ae', 'Inventory@123')}
              >
                Inventory (Tariq)
              </button>
            </div>
          </div>

          {/* Security Message */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '28px',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            <ShieldCheck size={14} color="var(--status-success-text)" />
            <span>Protected with enterprise-grade JWT & TLS 1.3 encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
