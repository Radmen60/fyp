import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { MailIcon } from '../icons.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetLink, setResetLink] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResetLink(null);
    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message);
      setResetLink(`${window.location.origin}/reset-password/${res.resetToken}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="card">
        <h2 style={{ marginBottom: 18 }}><MailIcon size={19} className="icon-inline" />Forgot password</h2>
        {error && <div className="form-errors">{error}</div>}
        {resetLink ? (
          <>
            <p className="form-note form-note--ok">{message}</p>
            <p style={{ wordBreak: 'break-all', fontSize: 13, marginTop: 12 }}>
              <Link to={resetLink.replace(window.location.origin, '')}>{resetLink}</Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              Email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn btn--primary btn--block" disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 16 }}>
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
