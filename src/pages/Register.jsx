import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import LocationField from '../components/LocationField.jsx';
import { UserAddIcon } from '../icons.jsx';

const ROLE_OPTIONS = [
  { value: 'household', label: 'Household' },
  { value: 'business', label: 'Business' },
  { value: 'waste_collector', label: 'Waste Collector' },
  { value: 'recycler', label: 'Recycler' },
  { value: 'organisation', label: 'Organisation / NGO' },
];

const PROCESSOR_ROLES = ['waste_collector', 'recycler', 'organisation'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: '', address: '', lat: '', lng: '',
  });
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getMeta().then((m) => setCategories(m.categories)).catch(() => {});
  }, []);

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
    try {
      await register({ ...form, preferred_categories: preferredCategories });
      navigate('/dashboard');
    } catch (err) {
      setErrors(err.errors || [err.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="card">
        <h2 style={{ marginBottom: 18 }}><UserAddIcon size={19} className="icon-inline" />Create an account</h2>
        {errors.length > 0 && (
          <div className="form-errors">
            <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="field">
            Name
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="field">
            Email
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className="field">
            Phone <span style={{ fontWeight: 400 }}>(optional — used for contact once a bid is accepted)</span>
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="e.g. +263 77 123 4567" />
          </div>
          <div className="field">
            Password
            <input type="password" required value={form.password} onChange={(e) => update('password', e.target.value)} />
          </div>
          <div className="field">
            Entity type
            <select required value={form.role} onChange={(e) => update('role', e.target.value)}>
              <option value="">Choose one…</option>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <LocationField
            address={form.address}
            onAddressChange={(v) => update('address', v)}
            onCoordsResolved={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
          />

          {PROCESSOR_ROLES.includes(form.role) && (
            <div className="field">
              Materials you accept
              <div className="checkbox-grid">
                {categories.map((cat) => (
                  <label key={cat}>
                    <input
                      type="checkbox"
                      checked={preferredCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn--primary btn--block btn--glow" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 16 }}>
          Already have an account? <Link to="/login">Log in</Link>.
        </p>
      </div>
    </div>
  );
}
