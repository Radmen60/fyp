import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LoginIcon } from '../icons.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login({ email, password });
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="card">
        <h2 style={{ marginBottom: 18 }}><LoginIcon size={19} className="icon-inline" />Log in</h2>
        {error && <div className="form-errors">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            Password
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn--primary btn--block btn--glow" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 13.5 }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p style={{ fontSize: 13.5, color: 'var(--muted)' }}>
          No account? <Link to="/register">Register here</Link>.
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14 }}>
          Demo: any seeded email (e.g. admin@example.com) with password "password123".
        </p>
      </div>
    </div>
  );
}
