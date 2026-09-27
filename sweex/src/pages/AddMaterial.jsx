import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import LocationField from '../components/LocationField.jsx';
import { Box2Icon } from '../icons.jsx';

export default function AddMaterial() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState({ categories: [], conditions: [], units: [] });
  const [form, setForm] = useState({
    title: '', description: '', category: '', quantity: '', unit: '', condition: '', address: '', lat: '', lng: '',
  });
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getMeta().then(setMeta).catch(() => {});
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      const { material, message } = await api.addMaterial(form);
      navigate(`/materials/${material.id}`, { state: { message } });
    } catch (err) {
      setErrors(err.errors || [err.message]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page--narrow">
      <div className="card">
        <h2 style={{ marginBottom: 18 }}><Box2Icon size={19} className="icon-inline" />List a material</h2>
        {errors.length > 0 && (
          <div className="form-errors"><ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="field">
            Title
            <input required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Stack of flattened cardboard boxes" />
          </div>
          <div className="field">
            Description
            <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>

          <div className="field-row">
            <div className="field">
              Category
              <select required value={form.category} onChange={(e) => update('category', e.target.value)}>
                <option value="">Choose…</option>
                {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              Condition
              <select required value={form.condition} onChange={(e) => update('condition', e.target.value)}>
                <option value="">Choose…</option>
                {meta.conditions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              Quantity
              <input type="number" step="any" min="0.01" required value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
            </div>
            <div className="field">
              Unit
              <select required value={form.unit} onChange={(e) => update('unit', e.target.value)}>
                <option value="">Choose…</option>
                {meta.units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <LocationField
            address={form.address}
            onAddressChange={(v) => update('address', v)}
            onCoordsResolved={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
          />

          <button className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Listing…' : 'List material'}
          </button>
        </form>
      </div>
    </div>
  );
}
