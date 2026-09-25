import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { LockIcon } from '../icons.jsx';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [valid, setValid] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.checkResetToken(token).then((r) => setValid(r.valid)).catch(() => setValid(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.resetPassword(token, { password, confirm_password: confirm });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="card">
        <h2 style={{ marginBottom: 18 }}><LockIcon size={19} className="icon-inline" />Reset password</h2>
        {valid === null && <p className="loading-state">Checking your link…</p>}
        {valid === false && (
          <>
            <p className="form-note form-note--error">That reset link is invalid or has expired.</p>
            <p style={{ marginTop: 12 }}><Link to="/forgot-password">Request a new one</Link></p>
          </>
        )}
        {valid === true && (
          <form onSubmit={handleSubmit}>
            {error && <div className="form-errors">{error}</div>}
            <div className="field">
              New password
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="field">
              Confirm new password
              <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <button className="btn btn--primary btn--block" disabled={busy}>
              {busy ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
