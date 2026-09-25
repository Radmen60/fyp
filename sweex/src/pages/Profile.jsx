import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LocationField from '../components/LocationField.jsx';
import { UserIcon, LockIcon } from '../icons.jsx';

const PROCESSOR_ROLES = ['waste_collector', 'recycler', 'organisation', 'business'];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    api.getMeta().then((m) => setCategories(m.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, address: user.address || '', lat: user.latitude, lng: user.longitude });
      setPreferredCategories((user.preferred_categories || '').split(',').filter(Boolean));
    }
  }, [user]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleCategory(cat) {
    setPreferredCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    setMessage('');
    try {
      const res = await api.updateProfile({ ...form, preferred_categories: preferredCategories });
      setUser(res.user);
      setMessage(res.message);
    } catch (err) {
      setErrors(err.errors || [err.message]);
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwBusy(true);
    setPwError('');
    setPwMessage('');
    try {
      const res = await api.changePassword(pwForm);
      setPwMessage(res.message);
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwBusy(false);
    }
  }

  if (!form) return <div className="page"><p className="loading-state">Loading…</p></div>;

  return (
    <div className="page page--narrow">
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 18 }}><UserIcon size={19} className="icon-inline" />Your details</h2>
        {errors.length > 0 && <div className="form-errors"><ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div>}
        {message && <p className="form-note form-note--ok">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            Name
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="field">
            Email
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <LocationField
            address={form.address}
            onAddressChange={(v) => update('address', v)}
            onCoordsResolved={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
          />
          {PROCESSOR_ROLES.includes(user.role) && (
            <div className="field">
              Materials you accept
              <div className="checkbox-grid">
                {categories.map((cat) => (
                  <label key={cat}>
                    <input type="checkbox" checked={preferredCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
          )}
          <button className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 18 }}><LockIcon size={19} className="icon-inline" />Change password</h2>
        {pwError && <div className="form-errors">{pwError}</div>}
        {pwMessage && <p className="form-note form-note--ok">{pwMessage}</p>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="field">
            Current password
            <input type="password" required value={pwForm.current_password} onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))} />
          </div>
          <div className="field">
            New password
            <input type="password" required value={pwForm.new_password} onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))} />
          </div>
          <div className="field">
            Confirm new password
            <input type="password" required value={pwForm.confirm_password} onChange={(e) => setPwForm((f) => ({ ...f, confirm_password: e.target.value }))} />
          </div>
          <button className="btn" disabled={pwBusy}>{pwBusy ? 'Changing…' : 'Change password'}</button>
        </form>
      </div>
    </div>
  );
}
