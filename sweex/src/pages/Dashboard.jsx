import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import MatchRow from '../components/MatchRow.jsx';
import { BoxIcon, RecycleIcon, WalletIcon, UserIcon, Box2Icon, TargetIcon } from '../icons.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setData(await api.getDashboard());
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleMatchAction(id, action) {
    try {
      await api.updateMatch(id, action);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) return <div className="page"><div className="banner banner--error">{error}</div></div>;
  if (!data) return <div className="page"><p className="loading-state">Loading dashboard…</p></div>;

  return (
    <div className="page">
      <div className="panel-header">
        <div>
          <h2>Welcome back, {user.name}</h2>
          <p>{{ admin: 'System-wide overview.', producer: 'Your listings and offers.', processor: 'Materials available to claim.' }[data.role_group]}</p>
        </div>
        <Link to="/materials/add" className="btn btn--primary"><Box2Icon size={15} /> List a material</Link>
      </div>

      {data.role_group === 'admin' && (
        <div className="stat-row">
          <div className="stat-tile">
            <span className="icon-badge"><BoxIcon size={16} /></span>
            <div className="stat-tile__value">{data.stats.total_listed}</div>
            <div className="stat-tile__label">Materials listed</div>
          </div>
          <div className="stat-tile stat-tile--good">
            <span className="icon-badge"><RecycleIcon size={16} /></span>
            <div className="stat-tile__value">{data.stats.total_collected}</div>
            <div className="stat-tile__label">Collected</div>
          </div>
          <div className="stat-tile stat-tile--warn">
            <span className="icon-badge icon-badge--blue"><WalletIcon size={16} /></span>
            <div className="stat-tile__value">${Number(data.stats.value_diverted).toFixed(0)}</div>
            <div className="stat-tile__label">Value diverted</div>
          </div>
          <div className="stat-tile">
            <span className="icon-badge"><UserIcon size={16} /></span>
            <div className="stat-tile__value">{data.user_count}</div>
            <div className="stat-tile__label">Registered users</div>
          </div>
        </div>
      )}

      <section style={{ marginBottom: 32 }}>
        <div className="panel-header">
          <h2><BoxIcon size={18} className="icon-inline" />{data.role_group === 'producer' ? 'Your materials' : 'Available materials'}</h2>
        </div>
        {data.materials.length === 0 ? (
          <p className="empty-state">Nothing to show yet.</p>
        ) : (
          <div className="material-grid">
            {data.materials.map((m) => <MaterialCard key={m.id} material={m} />)}
          </div>
        )}
      </section>

      <section>
        <div className="panel-header">
          <h2><TargetIcon size={18} className="icon-inline" />Matches</h2>
        </div>
        {data.matches.length === 0 ? (
          <p className="empty-state">No matches yet.</p>
        ) : (
          data.matches.map((m) => <MatchRow key={m.id} match={m} onAction={handleMatchAction} />)
        )}
      </section>
    </div>
  );
}
