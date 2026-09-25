import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import MaterialCard from '../components/MaterialCard.jsx';
import { BoxIcon, Box2Icon } from '../icons.jsx';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMeta().then((m) => setCategories(m.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getMaterials({ category, status })
      .then(setMaterials)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, status]);

  return (
    <div className="page">
      <div className="panel-header">
        <div>
          <h2><BoxIcon size={19} className="icon-inline" />Materials</h2>
          <p>{materials.length} listed</p>
        </div>
        <Link to="/materials/add" className="btn btn--primary"><Box2Icon size={15} /> List a material</Link>
      </div>

      <div className="filters-row" style={{ marginBottom: 20 }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="matched">Matched</option>
          <option value="collected">Collected</option>
        </select>
      </div>

      {error && <div className="banner banner--error">{error}</div>}
      {loading ? (
        <p className="loading-state">Loading materials…</p>
      ) : materials.length === 0 ? (
        <p className="empty-state">No materials match these filters.</p>
      ) : (
        <div className="material-grid">
          {materials.map((m) => <MaterialCard key={m.id} material={m} />)}
        </div>
      )}
    </div>
  );
}
