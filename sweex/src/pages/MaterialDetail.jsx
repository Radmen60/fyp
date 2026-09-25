import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import LocationMap from '../components/LocationMap.jsx';
import MatchRow from '../components/MatchRow.jsx';
import { SearchIcon, TargetIcon, Box2Icon, LocationPinIcon } from '../icons.jsx';

export default function MaterialDetail() {
  const { id } = useParams();
  const routerLocation = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(routerLocation.state?.message || '');
  const [finding, setFinding] = useState(false);

  async function load() {
    try {
      setData(await api.getMaterial(id));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleFindMatches() {
    setFinding(true);
    setError('');
    try {
      const res = await api.findMatches(id);
      setMessage(res.message);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setFinding(false);
    }
  }

  async function handleMatchAction(matchId, action) {
    try {
      await api.updateMatch(matchId, action);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !data) return <div className="page"><div className="banner banner--error">{error}</div></div>;
  if (!data) return <div className="page"><p className="loading-state">Loading…</p></div>;

  const { material, matches, is_owner, is_admin } = data;

  return (
    <div className="page">
      {message && <div className="banner banner--success">{message}</div>}
      {error && <div className="banner banner--error">{error}</div>}

      <div className="card">
        <div className="material-detail__header">
          <div>
            <h2><Box2Icon size={20} className="icon-inline" />{material.title}</h2>
            <span className={`badge badge--${material.status}`} style={{ marginTop: 8 }}>{material.status}</span>
          </div>
          <div className="material-detail__value">${Number(material.estimated_value).toFixed(2)}</div>
        </div>

        <p className="material-detail__desc">{material.description || 'No description provided.'}</p>

        <div className="material-detail__specs">
          <div className="spec"><span>Category</span>{material.category}</div>
          <div className="spec"><span>Quantity</span>{material.quantity} {material.unit}</div>
          <div className="spec"><span>Condition</span>{material.condition}</div>
          <div className="spec"><span>Listed by</span>{material.owner_name}</div>
          <div className="spec"><span>Address</span><LocationPinIcon size={12} className="icon-inline" />{material.address || '—'}</div>
        </div>

        <LocationMap lat={material.latitude} lng={material.longitude} label={material.title} />

        {(is_owner || is_admin) && (
          <button className="btn btn--primary" onClick={handleFindMatches} disabled={finding}>
            <SearchIcon size={15} /> {finding ? 'Searching…' : 'Find matches'}
          </button>
        )}
      </div>

      <section style={{ marginTop: 28 }}>
        <div className="panel-header"><h2><TargetIcon size={18} className="icon-inline" />Matches</h2></div>
        {matches.length === 0 ? (
          <p className="empty-state">No matches yet.{(is_owner || is_admin) ? ' Try "Find matches" above.' : ''}</p>
        ) : (
          matches.map((m) => <MatchRow key={m.id} match={{ ...m, material_title: material.title, material_id: material.id }} onAction={handleMatchAction} />)
        )}
      </section>
    </div>
  );
}
